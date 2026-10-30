#!/usr/bin/env python3
"""Extract FIRSTS *candidates* from original Tamil Nadu government textbook PDFs.

This is a mechanical full-page text scan. It does not certify a claim as true,
settle cross-edition conflicts, interpret image-only diagrams, or validate Tamil
translations. It records printed-page candidate context and page indices for an
editorial review, with a bounded snippet; it never republishes book chapters.

Requires: pip install pymupdf
Run: python scripts/scan_original_tn_firsts.py --ids c10-social-science-2022-revision --output original-firsts-candidates.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import tempfile
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILE = ROOT / "data/textbook/original-pdf-source-manifest.json"
ALLOWED_HOSTS = {
    "d21mc000xink7q.cloudfront.net",
    "www.srivenkateshwaraopenschool.com",
    "siddhiias.com",
    "nammakalvi.com",
}
EN_PATTERN = re.compile(
    r"\b(?:first|earliest|pioneer(?:ing)?|invent(?:ed|or|ion)"
    r"|discover(?:ed|er|y)|founded|founder|established|inaugurated)\b", re.I
)
TA_PATTERN = re.compile(r"முதல்|முதன்|கண்டுபிடி|நிறுவி|தோற்றுவி")
EXCLUDE = re.compile(r"\b(?:first step|first example|first half|first thing|first stage)\b", re.I)


def fetch_pdf(url, path, max_bytes=260 * 1024 * 1024):
    host = (urlparse(url).hostname or "").lower()
    if host not in ALLOWED_HOSTS:
        raise ValueError("unexpected PDF source host: " + host)
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; educational source audit)"})
    sha = hashlib.sha256()
    n = 0
    with urlopen(req, timeout=65) as resp, open(path, "wb") as dest:
        mime = resp.headers.get("Content-Type", "")
        if not ("pdf" in mime.lower() or url.lower().endswith(".pdf")):
            raise ValueError("response is not a PDF: " + mime)
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            n += len(chunk)
            if n > max_bytes:
                raise ValueError("PDF above audit byte cap")
            sha.update(chunk)
            dest.write(chunk)
    with open(path, "rb") as fh:
        if fh.read(5) != b"%PDF-":
            raise ValueError("downloaded bytes did not start with PDF header")
    return {"sha256": sha.hexdigest(), "bytes": n}


def pdf_candidates(source, lang, pdf_path):
    doc = fitz.open(pdf_path)
    pattern = EN_PATTERN if lang == "en" else TA_PATTERN
    candidates = []
    pages_with_extractable_text = 0
    page_summaries = []
    for page_index in range(len(doc)):
        page = doc.load_page(page_index)
        raw = page.get_text("text", sort=True)
        plain = re.sub(r"\s+", " ", raw).strip()
        has_text = len(plain) >= 100
        pages_with_extractable_text += int(has_text)
        matches = list(pattern.finditer(plain))
        page_summaries.append({"pdf_page": page_index + 1,
                               "text_chars": len(plain),
                               "candidate_hits": len(matches),
                               "text_extractable": has_text})
        for match in matches:
            start, end = match.span()
            snippet = plain[max(0, start - 50):min(len(plain), end + 90)]
            if EXCLUDE.search(snippet) and lang == "en":
                continue
            # Small excerpt for deciding what to inspect in the original pages.
            candidates.append({
                "pdf_page": page_index + 1,
                "keyword": match.group(0),
                "context_excerpt": snippet[:145],
                "editorial_status": "unreviewed_original_pdf_text_hit"
            })
    return {
        "source_id": source["id"], "class": source["class"],
        "subject": source["subject"], "medium": lang,
        "pages_total": len(doc), "text_extractable_pages": pages_with_extractable_text,
        "pages_needing_visual_or_ocr_review": len(doc) - pages_with_extractable_text,
        "text_hits": len(candidates), "hits": candidates,
        "page_summaries": page_summaries
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--ids", nargs="+", required=True)
    p.add_argument("--output", default="original-firsts-candidates.json")
    p.add_argument("--language", choices=["en", "ta", "both"], default="en")
    args = p.parse_args()
    manifest = json.loads(SOURCE_FILE.read_text(encoding="utf-8"))
    sources = {b["id"]: b for b in manifest["volumes"]}
    results = []
    errors = []
    with tempfile.TemporaryDirectory(prefix="tn-orig-") as tmp:
        for ident in args.ids:
            if ident not in sources:
                errors.append({"id": ident, "error": "unknown book ID"})
                continue
            source = sources[ident]
            for lang in (["en", "ta"] if args.language == "both" else [args.language]):
                url = source.get("english_url" if lang == "en" else "tamil_url")
                if not url:
                    errors.append({"id": ident, "language": lang, "error": "original PDF URL missing"})
                    continue
                try:
                    path = Path(tmp) / (ident + "_" + lang + ".pdf")
                    provenance = fetch_pdf(url, path)
                    result = pdf_candidates(source, lang, path)
                    result.update(provenance)
                    result["url"] = url
                    result["edition"] = source.get("edition")
                    results.append(result)
                    print("ORIGINAL_BOOK_SCANNED " + json.dumps({
                        "id": ident, "medium": lang, "pages": result["pages_total"],
                        "extractable": result["text_extractable_pages"],
                        "hits": result["text_hits"], "bytes": result["bytes"]}))
                    path.unlink(missing_ok=True)
                except Exception as exc:
                    errors.append({"id": ident, "language": lang, "error": str(exc)})
                    print("ORIGINAL_BOOK_ERROR " + json.dumps(errors[-1]))
    data = {"schema_version": 1, "source_pdf_text_only": True,
            "claims_verified": 0,
            "note": "Every candidate requires human review against the page and both language editions; extracted snippets may omit tables/images.",
            "results": results, "errors": errors}
    output = Path(args.output)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("ORIGINAL_BOOK_SCAN_SUMMARY " + json.dumps({
        "books_scanned": len(results),
        "error_count": len(errors),
        "candidate_hits": sum(r["text_hits"] for r in results),
        "pages_processed": sum(r["pages_total"] for r in results),
        "text_extractable_pages": sum(r["text_extractable_pages"] for r in results)
    }))
    return 0 if not errors else 2


if __name__ == "__main__":
    raise SystemExit(main())
