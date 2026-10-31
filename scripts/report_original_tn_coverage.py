#!/usr/bin/env python3
"""Reconcile historical textbook listing counts, live catalogue detail links and seed PDFs.

None of these counts establishes a complete original-book review or guarantees that
current prescribed editions are present. A PDF or keyword scan is not certification.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/textbook/original-pdf-source-manifest.json"
HISTORICAL_BASELINE = {
    6: {"en": 10, "ta": 12}, 7: {"en": 10, "ta": 12},
    8: {"en": 6, "ta": 7}, 9: {"en": 6, "ta": 7},
    10: {"en": 6, "ta": 7}, 11: {"en": 40, "ta": 44},
    12: {"en": 40, "ta": 44},
}
CERTIFIED = "english-and-tamil-verified"

def report(manifest, inventory=None):
    records = manifest["volumes"]
    errors = []
    ids = set()
    observed = {}
    summary = []
    inventory_summary = inventory.get("summary", {}) if inventory is not None else {}
    if inventory is not None:
        for page in inventory.get("per_class_medium", []):
            medium = {"english-medium": "en", "tamil-medium": "ta"}.get(page.get("medium"))
            key = (page.get("class"), medium)
            if medium is None or key in observed or page.get("class") not in HISTORICAL_BASELINE:
                errors.append("invalid or duplicate catalogue page: " + str(key))
                continue
            observed[key] = page.get("books_listed")

    for book in records:
        ident = book.get("id")
        if not ident or ident in ids:
            errors.append("duplicate/missing source ID: " + str(ident))
        ids.add(ident)
        if book.get("class") not in HISTORICAL_BASELINE:
            errors.append("unexpected class: " + str(ident))
        for lang, url_key, status_key in (
            ("en", "english_url", "english_pdf_review"),
            ("ta", "tamil_url", "tamil_pdf_review"),
        ):
            if book.get(status_key) == CERTIFIED and not book.get(url_key):
                errors.append("certified without source URL: " + str(ident) + " " + lang)

    for klass, expected in HISTORICAL_BASELINE.items():
        entries = [b for b in records if b.get("class") == klass]
        urls = {
            lang: sum(bool(b.get("english_url" if lang == "en" else "tamil_url")) for b in entries)
            for lang in ("en", "ta")
        }
        current = {lang: observed.get((klass, lang)) for lang in ("en", "ta")}
        certified_pairs = sum(
            b.get("english_pdf_review") == CERTIFIED and
            b.get("tamil_pdf_review") == CERTIFIED and
            b.get("chapter_coverage") == "certified" for b in entries
        )
        summary.append({
            "class": klass,
            "archive_listings": expected,
            "latest_archive_detail_pages": current,
            "difference_from_historical": {
                lang: (current[lang] - expected[lang]) if isinstance(current[lang], int) else None
                for lang in ("en", "ta")
            },
            "manifest_records": len(entries),
            "seed_urls": urls,
            "fully_certified_manifest_pairs": certified_pairs,
            "archive_listing_certification": "not_established",
        })

    historical_total = sum(sum(b.values()) for b in HISTORICAL_BASELINE.values())
    current_total = sum(observed.values()) if len(observed) == 14 and all(
        isinstance(v, int) and v >= 0 for v in observed.values()
    ) else None
    if inventory is not None and current_total is None:
        errors.append("live inventory lacks one or more of 14 valid class/medium catalogue counts")
    if inventory is not None and current_total is not None and current_total != inventory_summary.get("unique_books_listed"):
        errors.append("live inventory detail counts disagree with reported distinct listed books")

    return {
        "schema_version": 2,
        "baseline_archive_listings": historical_total,
        "baseline_label": "historical listed-count snapshot, not unique current books or certified editions",
        "baseline_is_complete_current_editions": False,
        "latest_archive_listings": current_total,
        "live_inventory_available": inventory is not None,
        "live_inventory_errors": inventory_summary.get("errors") if inventory is not None else None,
        "latest_catalogue_has_complete_coverage": False,
        "manifest_records": len(records),
        "manifest_is_exhaustive": False,
        "original_textbooks_fully_certified": 0,
        "note": "Zero means no fully signed-off original English/Tamil volume pairs demonstrated. Partial page review exists; cannot subtract seed records from distinct archive listings.",
        "by_class": summary,
        "errors": errors,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="original-books-coverage.json")
    parser.add_argument("--inventory", help="Optional JSON emitted by inventory_tn_original_books.py")
    args = parser.parse_args()
    catalogue = (json.loads(Path(args.inventory).read_text(encoding="utf-8"))
                 if args.inventory and Path(args.inventory).exists() else None)
    result = report(json.loads(MANIFEST.read_text(encoding="utf-8")), catalogue)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("ORIGINAL_COVERAGE " + json.dumps(result, ensure_ascii=False))
    return 1 if result["errors"] else 0

if __name__ == "__main__":
    raise SystemExit(main())
