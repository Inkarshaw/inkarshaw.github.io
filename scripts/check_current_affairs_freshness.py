#!/usr/bin/env python3
"""Check ClearExams Current Affairs source freshness AND live publication.

The edition catalog is generated at deploy time and need not be committed.
Always regenerate it from vetted source data before invoking this tool.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime
import json
import os
from pathlib import Path
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "current-affairs" / "text" / "editions.json"
SITE = "https://clearexams.ink"


def latest_date(entries):
    """Accept only valid dated text editions, never unverified metadata."""
    dates = []
    for entry in entries:
        if not isinstance(entry, dict) or entry.get("status") not in ("complete", "partial"):
            continue
        value = entry.get("date")
        if not isinstance(value, str) or entry.get("file") != value + ".html":
            continue
        try:
            dates.append(date.fromisoformat(value))
        except ValueError:
            continue
    return max(dates) if dates else None


def evaluate(today, source_latest, live_latest, live_page_ok, deployment_only=False):
    """Pure decision function shared by CLI and offline unit tests."""
    age = (today - source_latest).days if source_latest else 9999
    source_overdue = not deployment_only and age >= 1
    deployment_lag = (source_latest is None or live_latest is None
                      or live_latest < source_latest or not live_page_ok)
    flags = []
    if source_overdue:
        flags.append("editorial_source_overdue")
    if deployment_lag:
        flags.append("live_missing_or_behind_sources")
    return {
        "stale": bool(flags),
        "age": age,
        "source_latest": source_latest.isoformat() if source_latest else "none",
        "live_latest": live_latest.isoformat() if live_latest else "none",
        "reason": ",".join(flags) if flags else "current",
    }


def fetch_text(url):
    request = Request(url, headers={
        "User-Agent": "ClearExams-Publishing-Health/1.0",
        "Cache-Control": "no-cache",
    })
    with urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def check_live(site, source_latest, attempts, pause):
    live_latest = None
    page_ok = False
    error = ""
    for attempt in range(attempts):
        try:
            stamp = int(time.time())
            catalog = json.loads(fetch_text(
                site.rstrip("/") + "/current-affairs/text/editions.json?health=" + str(stamp)
            ))
            if not isinstance(catalog, list):
                raise ValueError("Published edition catalog is not a list")
            live_latest = latest_date(catalog)
            if not live_latest:
                raise ValueError("Published edition catalog has no valid editions")
            expected = source_latest if source_latest and live_latest >= source_latest else live_latest
            page = fetch_text(site.rstrip("/") + "/current-affairs/text/"
                              + expected.isoformat() + ".html?health=" + str(stamp))
            page_ok = expected.isoformat() in page and "<html" in page.lower()
            if source_latest and live_latest >= source_latest and page_ok:
                return live_latest, True, ""
            error = "Live edition catalog or article is behind verified source data"
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            error = str(exc)[:220]
        if attempt < attempts - 1:
            time.sleep(pause)
    return live_latest, page_ok, error


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", default=SITE)
    parser.add_argument("--today", help="Override IST date for local testing")
    parser.add_argument("--deployment-only", action="store_true",
                        help="Require live source parity, without rejecting old editorial content")
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--pause", type=int, default=5)
    args = parser.parse_args()
    if args.retries < 1 or args.pause < 0:
        parser.error("--retries must be positive; --pause cannot be negative")
    today = date.fromisoformat(args.today) if args.today else datetime.now(ZoneInfo("Asia/Kolkata")).date()
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    source_latest = latest_date(catalog)
    live_latest, page_ok, error = check_live(args.site, source_latest, args.retries, args.pause)
    result = evaluate(today, source_latest, live_latest, page_ok, args.deployment_only)
    result["live_page_verified"] = page_ok
    if error:
        result["live_error"] = error
    output = json.dumps(result, ensure_ascii=False, indent=2)
    print(output)
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as out:
            for key in ("stale", "age", "source_latest", "live_latest", "reason"):
                value = result[key]
                out.write(f"{key}={str(value).lower() if isinstance(value, bool) else value}\n")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as out:
            out.write("\n## Current Affairs publishing health (IST)\n")
            out.write(f"- Check date: {today}\n- Newest vetted source: {result['source_latest']}\n")
            out.write(f"- Newest live catalog entry: {result['live_latest']}\n")
            out.write(f"- Newest live article verified: {page_ok}\n- Status: {result['reason']}\n")
    return int(result["stale"]) if args.deployment_only else 0


if __name__ == "__main__":
    raise SystemExit(main())
