#!/usr/bin/env python3
"""Fail-closed import of official TNPSC notifications for the ClearExams calendar.

Never infer a date or time from a tentative planner or a missing field.
If the official HTML layout changes, stop without publishing.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

SOURCE = "https://apply.tnpscexams.in/notification?app_id=UElZMDAwMDAwMQ%3D%3D"
DATA = Path("data/exams/exam-notifications.json")
INDIA = ZoneInfo("Asia/Kolkata")
NOTICE_RE = re.compile(r"^\d{1,3}/20\d{2}$")
DATE_RE = re.compile(r"\b([0-3]?\d/[01]?\d/20\d{2})\b")
SOURCE_HOSTS = {"apply.tnpscexams.in", "tnpsc.gov.in", "www.tnpsc.gov.in"}


class NotificationTable(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = []
        self.row = None
        self.cell = None
        self.current_link = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "tr":
            self.row = []
        elif tag in ("td", "th") and self.row is not None:
            self.cell = {"text": "", "links": []}
        elif tag == "a" and self.cell is not None:
            self.current_link = attrs.get("href")

    def handle_data(self, text):
        if self.cell is not None:
            if self.current_link:
                url = self.current_link
                if url.startswith("https://") and urlparse(url).hostname in SOURCE_HOSTS:
                    if (url, text.strip()) not in self.cell["links"]:
                        self.cell["links"].append((url, text.strip()))
            self.cell["text"] += text + " "

    def handle_endtag(self, tag):
        if tag == "a":
            self.current_link = None
        elif tag in ("td", "th") and self.cell is not None:
            self.cell["text"] = " ".join(self.cell["text"].split())
            self.row.append(self.cell)
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.row:
                self.rows.append(self.row)
            self.row = None


def iso(value: str) -> str | None:
    match = DATE_RE.search(value or "")
    if not match:
        return None
    try:
        d = datetime.strptime(match.group(1), "%d/%m/%Y").date()
    except ValueError:
        return None
    return d.isoformat() if 2025 <= d.year <= date.today().year + 3 else None


def first_exam_date(text: str) -> str | None:
    """Ranges and multiple exam papers must not become one asserted exam date."""
    dates = DATE_RE.findall(text or "")
    if len(dates) != 1 or re.search(r"\b(to|and|from)\b", text or "", re.I):
        return None
    return iso(dates[0])


def parse(html: str, today: date | None = None) -> list[dict]:
    today = today or datetime.now(INDIA).date()
    parser = NotificationTable()
    parser.feed(html)
    results = []
    seen = set()
    for cells in parser.rows:
        if len(cells) < 8 or not NOTICE_RE.fullmatch(cells[0]["text"]):
            continue
        notice = cells[0]["text"]
        if int(notice.split("/")[1]) < today.year - 1:
            continue  # Historical notices do not belong in the upcoming calendar.
        # Official column order: number, notification date, post, application
        # start, application end, payment date, notices, examination, activity.
        if len(cells) < 9:
            raise ValueError(f"TNPSC table layout changed for {notice}")
        published, start, end = (iso(cells[i]["text"]) for i in (1, 3, 4))
        title = cells[2]["text"]
        if not published or not start or not end or not (8 <= len(title) <= 180):
            raise ValueError(f"Incomplete TNPSC notification row: {notice}")
        if not published <= start <= end or (date.fromisoformat(end) - date.fromisoformat(start)).days > 180:
            raise ValueError(f"Inconsistent application window for {notice}")
        if notice in seen:
            raise ValueError(f"Duplicate TNPSC notice {notice}")
        seen.add(notice)
        exam = first_exam_date(cells[7]["text"])
        if date.fromisoformat(end) < today - timedelta(days=45) and (
            not exam or date.fromisoformat(exam) < today - timedelta(days=45)
        ):
            continue
        official_link = next((url for url, label in cells[6]["links"] if "english" in label.lower()), SOURCE)
        year = notice.split("/")[1]
        group4 = bool(re.search(r"group\s*[-–]?\s*iv\b", title, re.I))
        entry_id = f"tnpsc-group-4-{year}" if group4 else f"tnpsc-notice-{notice.replace('/', '-')}"
        results.append({
            "id": entry_id, "category": "tnpsc",
            "exams": ["tnpsc-group-4"] if group4 else [],
            "title": title + " · " + year,
            "kind": "current", "notificationNumber": notice,
            "notificationDate": published, "examDate": exam,
            "applicationStart": start, "applicationEnd": end,
            "sourceLabel": "TNPSC official notification table",
            "source": SOURCE, "official": official_link,
            "note": "Published TNPSC dates; later amendments may apply. The application closing time is not specified in this table.",
            "syncSource": "tnpsc", "dateStatus": "official-notification"
        })
    if not seen or not results:
        raise ValueError("TNPSC notification table missing or has no recent notices; refusing empty import")
    return sorted(results, key=lambda x: x["notificationDate"], reverse=True)


def merge(original: dict, incoming: list[dict], today: date | None = None) -> tuple[dict, bool]:
    today = today or datetime.now(INDIA).date()
    output = json.loads(json.dumps(original))
    entries = output.get("entries")
    if not isinstance(entries, list):
        raise ValueError("Invalid existing calendar JSON")
    by_id = {item["id"]: item for item in entries}
    changed = False
    for entry in incoming:
        old = by_id.get(entry["id"])
        if old:
            if old.get("syncSource") not in (None, "tnpsc") or old.get("category") != "tnpsc":
                raise ValueError(f"Refusing overwrite of unrelated entry {entry['id']}")
            if any(old.get(k) != v for k, v in entry.items()):
                entry["verifiedOn"] = today.isoformat()
                old.clear()
                old.update(entry)
                changed = True
        else:
            entry["verifiedOn"] = today.isoformat()
            entries.append(entry)
            by_id[entry["id"]] = entry
            changed = True
    # Entries no longer present in the source are retained, never silently deleted.
    if changed:
        output["tnpscUpdatedOn"] = today.isoformat()
    return output, changed


def main(argv=None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--file", type=Path, default=DATA)
    p.add_argument("--html-file", type=Path, help="Use saved official HTML")
    p.add_argument("--check", action="store_true", help="Validate without writing")
    args = p.parse_args(argv)
    today = datetime.now(INDIA).date()
    if args.html_file:
        html = args.html_file.read_text(encoding="utf-8")
    else:
        req = urllib.request.Request(SOURCE, headers={
            "User-Agent": "ClearExams-ExamCalendar/1.0 (+https://clearexams.ink)",
            "Accept": "text/html"
        })
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status != 200:
                raise ValueError(f"TNPSC returned HTTP {response.status}")
            html = response.read(2_000_000).decode("utf-8", errors="replace")
    incoming = parse(html, today)
    old = json.loads(args.file.read_text(encoding="utf-8"))
    updated, changed = merge(old, incoming, today)
    print(f"TNPSC notices parsed: {len(incoming)}; changed: {changed}")
    if changed and not args.check:
        args.file.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, urllib.error.URLError) as exc:
        print(f"Exam sync aborted without publishing: {exc}", file=sys.stderr)
        sys.exit(1)
