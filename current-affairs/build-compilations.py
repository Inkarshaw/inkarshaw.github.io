#!/usr/bin/env python3
"""Build rolling weekly and monthly current-affairs compilation PDFs."""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "pdfs.json"
OUT = ROOT / "compilations"
OUT_MANIFEST = OUT / "compilations.json"


def load_daily() -> list[dict]:
    if not MANIFEST.exists():
        return []
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return [item for item in data if item.get("date") and item.get("file")]


def merge(items: list[dict], output: Path, title: str) -> None:
    writer = PdfWriter()
    for item in sorted(items, key=lambda x: x["date"]):
        src = ROOT / item["file"]
        if not src.exists():
            continue
        try:
            reader = PdfReader(str(src))
            for page in reader.pages:
                writer.add_page(page)
        except Exception as exc:
            print(f"Skipping unreadable PDF {src.name}: {exc}", file=sys.stderr)
    if not writer.pages:
        return
    writer.add_metadata({
        "/Title": title,
        "/Author": "ClearExams",
        "/Subject": "Competitive exam current affairs compilation",
    })
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("wb") as f:
        writer.write(f)


def main() -> None:
    daily = load_daily()
    OUT.mkdir(parents=True, exist_ok=True)

    weekly: dict[tuple[int, int], list[dict]] = defaultdict(list)
    monthly: dict[tuple[int, int], list[dict]] = defaultdict(list)
    for item in daily:
        d = date.fromisoformat(item["date"])
        iso = d.isocalendar()
        weekly[(iso.year, iso.week)].append(item)
        monthly[(d.year, d.month)].append(item)

    entries: list[dict] = []
    expected: set[str] = set()

    for (year, week), items in weekly.items():
        if len(items) < 2:
            continue
        name = f"weekly-{year}-W{week:02d}.pdf"
        title = f"Weekly Current Affairs — {year} Week {week:02d}"
        merge(items, OUT / name, title)
        if not (OUT / name).exists():
            continue
        expected.add(name)
        dates = sorted(x["date"] for x in items)
        entries.append({
            "kind": "weekly",
            "period": f"{year}-W{week:02d}",
            "title": title,
            "startDate": dates[0],
            "endDate": dates[-1],
            "editionCount": len(items),
            "file": f"compilations/{name}",
        })

    for (year, month), items in monthly.items():
        if len(items) < 2:
            continue
        name = f"monthly-{year}-{month:02d}.pdf"
        month_name = date(year, month, 1).strftime("%B %Y")
        title = f"Monthly Current Affairs — {month_name}"
        merge(items, OUT / name, title)
        if not (OUT / name).exists():
            continue
        expected.add(name)
        dates = sorted(x["date"] for x in items)
        entries.append({
            "kind": "monthly",
            "period": f"{year}-{month:02d}",
            "title": title,
            "startDate": dates[0],
            "endDate": dates[-1],
            "editionCount": len(items),
            "file": f"compilations/{name}",
        })

    for old in OUT.glob("*.pdf"):
        if old.name not in expected:
            old.unlink()

    entries.sort(key=lambda x: (x["endDate"], x["kind"] == "monthly"), reverse=True)
    OUT_MANIFEST.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Built {len(entries)} compilation entries from {len(daily)} daily editions.")


if __name__ == "__main__":
    main()
