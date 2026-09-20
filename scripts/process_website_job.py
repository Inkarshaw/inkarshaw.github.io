#!/usr/bin/env python3
import argparse
import os
import pathlib
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BLOCKED_PREFIXES = (
    ".git/",
    ".github/workflows/",
    "website-automation/",
    "instagram-publisher/",
)
TEXT_EXTS = {".html",".htm",".css",".js",".json",".md",".txt",".xml",".yml",".yaml",".py",".mjs",".cjs"}

def safe_target(raw: str) -> pathlib.Path:
    raw = (raw or "").strip().replace("\\", "/")
    if not raw or raw.startswith("/") or raw.startswith("~") or ".." in pathlib.PurePosixPath(raw).parts:
        raise ValueError("Target Path must be a safe repository-relative path")
    if any(raw.startswith(p) for p in BLOCKED_PREFIXES):
        raise ValueError(f"Target Path is protected: {raw}")
    return ROOT / raw

def drive_download_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    if "drive.google.com" not in parsed.netloc and "drive.usercontent.google.com" not in parsed.netloc:
        return url
    m = re.search(r"/d/([A-Za-z0-9_-]{15,})", url)
    if not m:
        qs = urllib.parse.parse_qs(parsed.query)
        if "id" in qs and qs["id"]:
            m = re.match(r"([A-Za-z0-9_-]{15,})", qs["id"][0])
    if not m:
        raise ValueError("Could not extract Google Drive file ID from Source")
    file_id = m.group(1)
    return f"https://drive.usercontent.google.com/download?id={urllib.parse.quote(file_id)}&export=download&confirm=t"

def download(source: str, target: pathlib.Path):
    source = (source or "").strip()
    if not source.startswith(("https://","http://")):
        raise ValueError("Source must be a public HTTP(S) URL or Google Drive file URL")
    target.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(drive_download_url(source), headers={"User-Agent":"ClearExams-Website-Automation/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r, open(target, "wb") as f:
        shutil.copyfileobj(r, f)
    if not target.exists() or target.stat().st_size == 0:
        raise ValueError("Downloaded file is empty")
    with open(target, "rb") as f:
        head = f.read(200).lstrip().lower()
    if b"<html" in head and "drive.google.com" in source:
        raise ValueError("Google Drive returned an HTML page; make the source file Anyone with the link → Viewer")

def replace_text(source: str, target: pathlib.Path):
    if "|||" not in source:
        raise ValueError("REPLACE_TEXT Source must be OLD|||NEW")
    old, new = source.split("|||", 1)
    if not old:
        raise ValueError("REPLACE_TEXT old text cannot be empty")
    if not target.exists() or not target.is_file():
        raise ValueError(f"Target file not found: {target.relative_to(ROOT)}")
    data = target.read_text(encoding="utf-8")
    if old not in data:
        raise ValueError("Old text was not found in Target Path")
    target.write_text(data.replace(old, new), encoding="utf-8")

def fix_old_domain():
    changed = 0
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT).as_posix()
        if any(rel.startswith(x) for x in (".git/","_site/","node_modules/")):
            continue
        if p.suffix.lower() not in TEXT_EXTS:
            continue
        try:
            data = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "clearexams.online" in data:
            p.write_text(data.replace("clearexams.online","clearexams.ink"), encoding="utf-8")
            changed += 1
    print(f"Updated legacy domain references in {changed} file(s).")

def rebuild_ca_index():
    subprocess.run([sys.executable, str(ROOT/"current-affairs"/"generate-pdf-list.py")], check=True, cwd=ROOT)

def deploy_only():
    p = ROOT/".github"/"site-deploy-trigger"
    p.parent.mkdir(parents=True, exist_ok=True)
    import datetime
    p.write_text(datetime.datetime.now(datetime.timezone.utc).isoformat()+"\n", encoding="utf-8")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--action", required=True)
    ap.add_argument("--source", default="")
    ap.add_argument("--target", default="")
    args = ap.parse_args()
    action = args.action.strip().upper()

    if action in {"PUBLISH_URL","PUBLISH_FILE"}:
        target = safe_target(args.target)
        download(args.source, target)
        if target.as_posix().endswith(".pdf") and "current-affairs/" in target.as_posix():
            rebuild_ca_index()
    elif action == "REPLACE_TEXT":
        replace_text(args.source, safe_target(args.target))
    elif action == "DELETE_PATH":
        target = safe_target(args.target)
        if not target.exists():
            raise ValueError("Target Path does not exist")
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
    elif action == "FIX_OLD_DOMAIN":
        fix_old_domain()
    elif action == "REBUILD_CA_INDEX":
        rebuild_ca_index()
    elif action == "DEPLOY_ONLY":
        deploy_only()
    else:
        raise ValueError(f"Unsupported Action: {action}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
