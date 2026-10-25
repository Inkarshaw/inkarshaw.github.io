#!/usr/bin/env python3
"""Build the current-affairs PDF manifest from YYYY-MM-DD.pdf files."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from current_affairs_pdf import dated_pdfs, pdf_digest


CURRENT_AFFAIRS_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = CURRENT_AFFAIRS_DIR / "pdfs.json"
TAMIL_MONTHS = (
    "",
    "ஜனவரி",
    "பிப்ரவரி",
    "மார்ச்",
    "ஏப்ரல்",
    "மே",
    "ஜூன்",
    "ஜூலை",
    "ஆகஸ்ட்",
    "செப்டம்பர்",
    "அக்டோபர்",
    "நவம்பர்",
    "டிசம்பர்",
)


def manifest_entry(pdf_path: Path, published: date) -> dict[str, str]:
    english_date = f"{published.day} {published.strftime('%B %Y')}"
    tamil_date = f"{published.day} {TAMIL_MONTHS[published.month]} {published.year}"
    return {
        "date": published.isoformat(),
        "title_en": f"Daily Current Affairs — {english_date}",
        "title_ta": f"தினசரி நடப்பு நிகழ்வுகள் — {tamil_date}",
        "description_en": "Concise, exam-ready coverage of the day's important current affairs.",
        "description_ta": "அன்றைய முக்கிய நடப்பு நிகழ்வுகளின் தேர்வுக்கான சுருக்கமான தொகுப்பு.",
        "file": pdf_path.name,
    }


def build_manifest(directory: Path = CURRENT_AFFAIRS_DIR) -> list[dict[str, str]]:
    entries = []
    seen = {}
    for pdf_path, published in dated_pdfs(directory):
        fingerprint = pdf_digest(pdf_path)
        if fingerprint in seen:
            print(
                f"Skipping {pdf_path.name}: identical to {seen[fingerprint]}.",
                file=sys.stderr,
            )
            continue
        seen[fingerprint] = pdf_path.name
        entries.append(manifest_entry(pdf_path, published))
    return sorted(entries, key=lambda entry: entry["date"], reverse=True)


def main() -> None:
    manifest = build_manifest()
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {MANIFEST_PATH.relative_to(CURRENT_AFFAIRS_DIR.parent)} with {len(manifest)} PDF(s).")


if __name__ == "__main__":
    main()
