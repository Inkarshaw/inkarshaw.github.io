#!/usr/bin/env python3
"""Verify candidate vocabulary in a *real Tamil original textbook PDF*.

This is page-by-page Unicode text matching, not answer verification, page-image
review, or a whole-book editorial sign-off. No chapter text is reproduced.
Run: python scripts/check_tamil_firsts_sources.py --id c12-economics-2024-tamil
Requires: pymupdf. The PDF is downloaded, hashed, scanned, then removed.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import tempfile
import unicodedata
from pathlib import Path

import fitz
from scan_original_tn_firsts import ROOT, SOURCE_FILE, fetch_pdf

# These are search hints, not claims of verified Tamil source wording.
TARGETS = {
    "c12-economics-2024-tamil": [
        {"quiz_id": "F144", "en_fact": "Ragnar Frisch and Jan Tinbergen first economic sciences prize",
         "tamil_hints": ["ரக்னார்", "ரங்னார்", "ரேக்னர்", "ரேக்ன", "ஃப்ரிஷ்", "ஃபிரிஷ்", "ஃபிரிஷ்க்", "டின்பெர்கன்"]},
        {"quiz_id": "F145", "en_fact": "Oldest central bank Sveriges Riksbank",
         "tamil_hints": ["ரிக்ஸ்பேங்க்", "ரிக்ஸ்பாங்க்", "ரிக்ஸ் வங்", "ரிக்ஸ்", "சுவீடன்", "ஸ்வீடன்", "1668"]},
        {"quiz_id": "F146", "en_fact": "First RBI Governor Osborne Smith",
         "tamil_hints": ["ஆஸ்போர்ன்", "ஓஸ்போர்ன்", "ஒஸ்போர்ன்", "ஆஸ்போர்ன் ஸ்மித்"]},
        {"quiz_id": "F147", "en_fact": "Sher Shah Suri's silver Rupiya coin",
         "tamil_hints": ["ஷேர் ஷா", "ஷேர்ஷா", "ஷெர்ஷா", "செர்ஷா", "சேர்ஷா", "ரூபியா", "ருபியா", "சூரி"]},
        {"quiz_id": "F148", "en_fact": "First WTO Ministerial Conference Singapore",
         "tamil_hints": ["சிங்கப்பூர்", "முதலாவது அமைச்சர்கள் மாநாடு", "1996"]},
    ],
}

def match_hints(page_text: str, hints: list[str]):
    normalized = unicodedata.normalize("NFC", page_text)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    found = []
    for hint in hints:
        n = unicodedata.normalize("NFC", hint)
        pos = normalized.find(n)
        if pos != -1:
            found.append({"term": hint, "context_excerpt": normalized[max(0, pos - 35):pos+len(n)+55][:112]})
    return found

def inspect_original(pdf_path, source_id):
    targets = TARGETS[source_id]
    doc = fitz.open(pdf_path)
    items = {target["quiz_id"]: [] for target in targets}
    page_stats = []
    for page_idx in range(len(doc)):
        page = doc.load_page(page_idx)
        txt = page.get_text("text", sort=True)
        char_count = len(re.sub(r"\s+", " ", txt).strip())
        tamil_chars = sum("\u0b80" <= ch <= "\u0bff" for ch in txt)
        page_stats.append({"pdf_page": page_idx + 1, "text_chars": char_count,
                           "tamil_codepoint_count": tamil_chars})
        for target in targets:
            found = match_hints(txt, target["tamil_hints"])
            if found:
                items[target["quiz_id"]].append({
                    "pdf_page": page_idx+1, "matched": found[:3]
                })
    results = []
    for target in targets:
        hit_pages = items[target["quiz_id"]]
        results.append({"quiz_id": target["quiz_id"], "en_fact": target["en_fact"],
                        "hit_page_count": len(hit_pages), "candidate_hit_pages": hit_pages[:10],
                        "editorial_status": "automated_tamil_text_candidate_only",
                        "tamil_original_fact_confirmed": False,
                        "pdf_page_images_reviewed": False,
                        "matched_english_edition_confirmed": False})
    return {
        "source_id": source_id, "pdf_pages": len(doc),
        "pages_with_any_text": sum(p["text_chars"] >= 100 for p in page_stats),
        "pages_with_tamil_codepoints": sum(p["tamil_codepoint_count"] >= 40 for p in page_stats),
        "tamil_chars_total": sum(p["tamil_codepoint_count"] for p in page_stats),
        "targets": results, "page_stats": page_stats,
        "book_fully_reviewed": False, "tamil_original_fact_confirmations": 0,
    }


# Small visual excerpts from search hits, NOT full textbook pages.
# Keyed by PDF page index (1-based), never confused with printed book pages.
PREVIEW_SAMPLES = {
    "c12-economics-2024-tamil": [
        ("F144", 325, "ரேக்னர்"),
        ("F145", 117, "ரிக்ஸ் வங்"),
        ("F146", 127, "ஓஸ்போர்ன்"),
        ("F147", 127, "சூரி"),
        ("F148", 196, "1996"),
    ],
}

def render_small_source_excerpts(pdf_path, source_id, output_dir):
    """Render only short source snippets around a matching term for human comparison."""
    dest = Path(output_dir)
    dest.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)
    records = []
    for quiz_id, pdf_page, term in PREVIEW_SAMPLES.get(source_id, []):
        if pdf_page > len(doc):
            records.append({"quiz_id": quiz_id, "pdf_page": pdf_page, "rendered": False,
                            "error": "page_out_of_range"})
            continue
        page = doc.load_page(pdf_page - 1)
        matches = page.search_for(term)
        if not matches:
            records.append({"quiz_id": quiz_id, "pdf_page": pdf_page, "rendered": False,
                            "error": "term_not_located_in_page_geometry"})
            continue
        rect = matches[0]
        # Upper bound prevents accidental capture of whole copyrighted pages.
        clip = fitz.Rect(rect.x0 - 110, rect.y0 - 35, rect.x1 + 170, rect.y1 + 40)
        clip = clip & page.rect
        if clip.width > 420 or clip.height > 130:
            raise ValueError("source snippet clip exceeds review-size limit")
        filename = f"{quiz_id}-pdf-page-{pdf_page}.png"
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=clip, alpha=False)
        pix.save(str(dest / filename))
        records.append({"quiz_id": quiz_id, "pdf_page": pdf_page, "rendered": True,
                        "filename": filename, "clip_rect": [round(v, 1) for v in clip]})
    doc.close()
    (dest / "snippet-index.json").write_text(json.dumps(
        {"source_id": source_id, "source_image_type": "brief cropped PDF text excerpt",
         "visual_excerpt_not_complete_page_review": True, "results": records},
        ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    return records

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", default="c12-economics-2024-tamil", choices=sorted(TARGETS))
    parser.add_argument("--output", default="tamil-original-firsts-targets.json")
    parser.add_argument("--preview-dir", default=None, help="Render only five bounded text snippets for editorial visual review")
    args = parser.parse_args()
    sources = json.loads(SOURCE_FILE.read_text(encoding="utf8"))["volumes"]
    source = next(x for x in sources if x["id"] == args.id)
    url = source.get("tamil_url")
    if not url:
        raise ValueError("source has no original Tamil URL")
    with tempfile.TemporaryDirectory(prefix="tn-tamil-firsts-") as tmp:
        dest = Path(tmp) / "source.pdf"
        provenance = fetch_pdf(url, dest)
        result = inspect_original(dest, args.id)
        if args.preview_dir:
            result['small_source_snippets'] = render_small_source_excerpts(dest, args.id, args.preview_dir)
    result.update(provenance)
    result["source_url"] = url
    result["source_edition_from_catalogue"] = source["edition"]
    result["schema_version"] = 1
    result["warning"] = "Only Unicode-search candidate matches. Check page image, exact textbook fact and both edition imprints before changing review status."
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print("TAMIL_ORIGINAL_TARGET_SCAN " + json.dumps({
        "source_id": args.id, "pdf_pages": result["pdf_pages"],
        "pages_with_any_text": result["pages_with_any_text"],
        "pages_with_tamil_codepoints": result["pages_with_tamil_codepoints"],
        "tamil_chars_total": result["tamil_chars_total"],
        "target_hits": {v["quiz_id"]: v["hit_page_count"] for v in result["targets"]},
        "full_volume_certified": False,
    }, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
