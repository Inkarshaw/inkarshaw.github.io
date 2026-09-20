#!/usr/bin/env python3
import json
import os
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BRIDGE = os.environ.get("WEBSITE_BRIDGE_URL", "").rstrip("/")
RUN_URL = f"{os.environ.get('GITHUB_SERVER_URL','https://github.com')}/{os.environ.get('GITHUB_REPOSITORY','')}/actions/runs/{os.environ.get('GITHUB_RUN_ID','')}"
SITE = "https://clearexams.ink"

if not BRIDGE:
    raise SystemExit("WEBSITE_BRIDGE_URL is not configured")

def request(path, method="GET", payload=None, timeout=30):
    data = None
    headers = {"User-Agent":"ClearExams-Website-Queue-Runner/1.0"}
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BRIDGE + path, data=data, method=method, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode() or "{}")

def run(cmd, check=True):
    print("+", " ".join(str(x) for x in cmd))
    return subprocess.run(cmd, cwd=ROOT, text=True, check=check)

def derive_url(job):
    target = (job.get("targetPath") or "").strip().replace("\\","/")
    action = (job.get("action") or "").upper()
    if action == "REBUILD_CA_INDEX":
        return SITE + "/current-affairs/"
    if action in {"FIX_OLD_DOMAIN","DEPLOY_ONLY"} or not target:
        return SITE + "/"
    if target.endswith("/index.html"):
        target = target[:-10]
    elif target == "index.html":
        target = ""
    return SITE.rstrip("/") + "/" + urllib.parse.quote(target.lstrip("/"), safe="/._-")

def verify_url(url, attempts=30, delay=10):
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"ClearExams-Site-Verify/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                code = r.getcode()
                if 200 <= code < 400:
                    print(f"Verified {url} — HTTP {code}")
                    return
                last = f"HTTP {code}"
        except Exception as e:
            last = str(e)
        print(f"Waiting for deployment verification ({i+1}/{attempts}): {last}")
        time.sleep(delay)
    raise RuntimeError(f"Published URL did not become healthy: {url} ({last})")

def git_commit(job):
    run(["git","add","-A"])
    status = subprocess.run(["git","diff","--cached","--quiet"], cwd=ROOT)
    if status.returncode == 0:
        print("No repository change was needed.")
        return subprocess.check_output(["git","rev-parse","HEAD"], cwd=ROOT, text=True).strip()

    msg = f"Website automation: {job['jobId']} {job['action']}"
    run(["git","commit","-m",msg])
    for attempt in range(1,4):
        try:
            run(["git","pull","--rebase","origin","main"])
            run(["git","push","origin","main"])
            return subprocess.check_output(["git","rev-parse","HEAD"], cwd=ROOT, text=True).strip()
        except subprocess.CalledProcessError:
            if attempt == 3:
                raise
            time.sleep(attempt * 3)
    raise RuntimeError("git push failed")

def process(job):
    token = job["token"]
    request("/claim", "POST", {"token":token,"githubRun":RUN_URL})
    try:
        args = [
            sys.executable,
            str(ROOT/"scripts"/"process_website_job.py"),
            "--action", job.get("action",""),
            "--source", job.get("source",""),
            "--target", job.get("targetPath",""),
        ]
        run(args)
        sha = git_commit(job)
        url = derive_url(job)
        verify_url(url)
        request("/complete","POST",{
            "token":token,
            "githubRun":RUN_URL,
            "publishedUrl":url,
            "commitSha":sha
        })
        print(f"Completed {job['jobId']} -> {url}")
    except Exception as e:
        msg = str(e)
        print(f"FAILED {job.get('jobId')}: {msg}", file=sys.stderr)
        try:
            request("/fail","POST",{"token":token,"githubRun":RUN_URL,"error":msg})
        except Exception as callback_error:
            print(f"Failure callback also failed: {callback_error}", file=sys.stderr)

def main():
    try:
        request("/recover","POST",{})
    except Exception as e:
        print(f"Stale-job recovery warning: {e}")

    payload = request("/jobs")
    jobs = payload.get("jobs") or []
    print(f"Due website jobs: {len(jobs)}")
    for job in jobs[:10]:
        process(job)

if __name__ == "__main__":
    main()
