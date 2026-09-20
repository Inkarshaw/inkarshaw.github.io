#!/usr/bin/env python3
import argparse
import json
import os
import pathlib
import subprocess
import sys
import time
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
    headers = {"User-Agent":"ClearExams-Website-Queue-Runner/2.0"}
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

def verify_url(url, attempts=12, delay=5):
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"ClearExams-Site-Verify/2.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                code = r.getcode()
                if 200 <= code < 400:
                    print(f"Verified {url} — HTTP {code}")
                    return
                last = f"HTTP {code}"
        except Exception as e:
            last = str(e)
        print(f"Post-deploy verification ({i+1}/{attempts}): {last}")
        time.sleep(delay)
    raise RuntimeError(f"Published URL is not healthy: {url} ({last})")

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

def write_output(name, value):
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"{name}={value}\n")

def prepare(manifest_path):
    try:
        request("/recover","POST",{})
    except Exception as e:
        print(f"Stale-job recovery warning: {e}")

    payload = request("/jobs")
    jobs = payload.get("jobs") or []
    print(f"Due website jobs: {len(jobs)}")
    pending = []

    for job in jobs[:10]:
        token = job["token"]
        try:
            request("/claim", "POST", {"token":token,"githubRun":RUN_URL})
            args = [
                sys.executable,
                str(ROOT/"scripts"/"process_website_job.py"),
                "--action", job.get("action",""),
                "--source", job.get("source",""),
                "--target", job.get("targetPath",""),
            ]
            run(args)
            sha = git_commit(job)
            pending.append({
                "jobId": job["jobId"],
                "token": token,
                "url": derive_url(job),
                "commitSha": sha
            })
            print(f"Prepared {job['jobId']} at {sha}")
        except Exception as e:
            msg = str(e)
            print(f"FAILED preparing {job.get('jobId')}: {msg}", file=sys.stderr)
            try:
                request("/fail","POST",{"token":token,"githubRun":RUN_URL,"error":msg})
            except Exception as callback_error:
                print(f"Failure callback also failed: {callback_error}", file=sys.stderr)

    pathlib.Path(manifest_path).write_text(json.dumps(pending), encoding="utf-8")
    write_output("has_jobs", "true" if pending else "false")
    write_output("job_count", str(len(pending)))

def finalize(manifest_path):
    pending = json.loads(pathlib.Path(manifest_path).read_text(encoding="utf-8"))
    errors = []
    for item in pending:
        try:
            verify_url(item["url"])
            request("/complete","POST",{
                "token":item["token"],
                "githubRun":RUN_URL,
                "publishedUrl":item["url"],
                "commitSha":item["commitSha"]
            })
            print(f"Completed {item['jobId']} -> {item['url']}")
        except Exception as e:
            errors.append(f"{item['jobId']}: {e}")
            try:
                request("/fail","POST",{
                    "token":item["token"],
                    "githubRun":RUN_URL,
                    "error":f"Post-deploy verification failed: {e}"
                })
            except Exception as callback_error:
                print(f"Failure callback also failed: {callback_error}", file=sys.stderr)
    if errors:
        raise SystemExit("; ".join(errors))

def fail_pending(manifest_path, message):
    p = pathlib.Path(manifest_path)
    if not p.exists():
        return
    pending = json.loads(p.read_text(encoding="utf-8"))
    for item in pending:
        try:
            request("/fail","POST",{
                "token":item["token"],
                "githubRun":RUN_URL,
                "error":message
            })
        except Exception as e:
            print(f"Could not fail {item.get('jobId')}: {e}", file=sys.stderr)

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="command", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("--manifest", required=True)
    p = sub.add_parser("finalize")
    p.add_argument("--manifest", required=True)
    p = sub.add_parser("fail-pending")
    p.add_argument("--manifest", required=True)
    p.add_argument("--message", default="GitHub Pages deployment failed")
    args = ap.parse_args()

    if args.command == "prepare":
        prepare(args.manifest)
    elif args.command == "finalize":
        finalize(args.manifest)
    else:
        fail_pending(args.manifest, args.message)

if __name__ == "__main__":
    main()
