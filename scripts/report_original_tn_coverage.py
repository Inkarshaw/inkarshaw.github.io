#!/usr/bin/env python3
"""Honest coverage reconciliation for the original TN Class 6–12 textbook audit.

This reconciles archive listing counts and the *seed* PDF source manifest.
A URL or a successful text extraction NEVER counts as complete textbook review.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/textbook/original-pdf-source-manifest.json"
BASELINE = {6: {"en": 10, "ta": 12}, 7: {"en": 10, "ta": 12},
            8: {"en": 6, "ta": 7}, 9: {"en": 6, "ta": 7},
            10: {"en": 6, "ta": 7}, 11: {"en": 40, "ta": 44},
            12: {"en": 40, "ta": 44}}
CERTIFIED = "english-and-tamil-verified"

def report(manifest):
    records = manifest["volumes"]
    errors = []
    ids = set()
    summary = []
    for book in records:
        ident = book.get("id")
        if not ident or ident in ids:
            errors.append("duplicate/missing source ID: " + str(ident))
        ids.add(ident)
        if book.get("class") not in BASELINE:
            errors.append("unexpected class: " + str(ident))
        for lang, url_key, status_key in (
            ("en", "english_url", "english_pdf_review"),
            ("ta", "tamil_url", "tamil_pdf_review"),
        ):
            if book.get(status_key) == CERTIFIED and not book.get(url_key):
                errors.append("certified without source URL: " + str(ident) + " " + lang)
    for klass, expected in BASELINE.items():
        entries = [b for b in records if b.get("class") == klass]
        urls = {lang: sum(bool(b.get("english_url" if lang == "en" else "tamil_url")) for b in entries)
                for lang in ("en", "ta")}
        # URL counts may contain duplicate editions and do not imply distinct coverage.
        certified = sum(
            b.get("english_pdf_review") == CERTIFIED and
            b.get("tamil_pdf_review") == CERTIFIED and
            b.get("chapter_coverage") == "certified" for b in entries
        )
        summary.append({"class": klass, "archive_listings": expected,
                        "manifest_records": len(entries), "seed_urls": urls,
                        "fully_certified_manifest_pairs": certified,
                        "archive_listing_certification": "not_established"})
    total = sum(sum(x.values()) for x in BASELINE.values())
    return {"schema_version": 1, "baseline_archive_listings": total,
            "baseline_is_complete_current_editions": False,
            "manifest_records": len(records),
            "manifest_is_exhaustive": False,
            "original_textbooks_fully_certified": 0,
            "note": "Zero refers to fully certified editions demonstrated by the audit; not a claim that no individual pages were reviewed.",
            "by_class": summary, "errors": errors}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--output", default="original-books-coverage.json")
    args = p.parse_args()
    result = report(json.loads(MANIFEST.read_text(encoding="utf-8")))
    dest = Path(args.output)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("ORIGINAL_COVERAGE " + json.dumps(result, ensure_ascii=False))
    return 1 if result["errors"] else 0

if __name__ == "__main__":
    raise SystemExit(main())
