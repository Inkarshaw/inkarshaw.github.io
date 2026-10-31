#!/usr/bin/env python3
"""Inventory all 6–12 Tamil Nadu book *selections* from a second public catalogue.

Unlike the legacy Padanool snapshot, this enumerates terms, subjects and mediums
for the TNKalvi class-index book detail pages. A selection is NOT a unique PDF,
verified original edition, chapter audit or curricular certification.

Usage: python scripts/inventory_tnkalvi_original_books.py tnkalvi-original-inventory.json
"""
from __future__ import annotations

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://tnkalvi.online"
CLASSES = range(6, 13)
PATTERN = re.compile(r"^/textbooks/book/class-(6|7|8|9|10|11|12)-(em|tm)-(term-[123]|full-year)-([a-z0-9-]+)/?$")
COUNTS = re.compile(r"(\d+)\s+selections\s*[·•\-]?\s*(\d+)\s+unique\s+PDFs", re.I)
HEADERS = {"User-Agent": "ClearExamsTextbookSourceAudit/1.0 (+https://clearexams.ink/)"}

class BookLinks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.anchor = None
        self.links = []
        self.text_parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.anchor = {"href": dict(attrs).get("href") or "", "label": []}

    def handle_endtag(self, tag):
        if tag == "a" and self.anchor is not None:
            self.links.append((self.anchor["href"], " ".join(self.anchor["label"]).strip()))
            self.anchor = None

    def handle_data(self, data):
        self.text_parts.append(data)
        if self.anchor is not None:
            self.anchor["label"].append(data)

def parse_class_page(page_html, klass):
    parser = BookLinks()
    parser.feed(page_html)
    visible_text = re.sub(r"\s+", " ", html.unescape(" ".join(parser.text_parts)))
    m = COUNTS.search(visible_text)
    expected_selection_count = int(m.group(1)) if m else None
    reported_distinct_pdfs = int(m.group(2)) if m else None

    books = {}
    for href, label in parser.links:
        url = urljoin(BASE, href)
        parsed = urlparse(url)
        if parsed.netloc not in ("tnkalvi.online", "www.tnkalvi.online"):
            continue
        match = PATTERN.fullmatch(parsed.path)
        if not match or int(match.group(1)) != klass:
            continue
        grade, medium, term, subject_slug = match.groups()
        key = f"class-{grade}-{medium}-{term}-{subject_slug}"
        books[key] = {
            "catalogue_id": key, "class": int(grade), "medium": medium,
            "term": term, "subject_slug": subject_slug.replace("-", " "),
            "subject_label": re.sub(r"\s+", " ", label).strip(),
            "detail_url": url.split("?")[0].split("#")[0],
            "source": "secondary_public_index_not_official_textbook_publisher",
            "review_status": "catalogue_detail_link_only",
            "current_edition_verified": False,
            "original_pdf_downloaded": False,
            "all_pages_reviewed": False,
            "english_and_tamil_certified": False,
        }
    return {
        "class": klass, "source_url": f"{BASE}/textbooks/class/{klass}",
        "catalogue_selection_count_reported": expected_selection_count,
        "catalogue_unique_pdfs_reported": reported_distinct_pdfs,
        "detail_links_parsed": len(books),
        "count_matches": expected_selection_count == len(books) if expected_selection_count is not None else False,
    }, list(books.values())

def main():
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tnkalvi-original-inventory.json"
    pages, books, errors = [], [], []
    for klass in CLASSES:
        url = f"{BASE}/textbooks/class/{klass}"
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=25) as response:
                body = response.read(3_000_000).decode("utf-8", errors="replace")
            page, listed = parse_class_page(body, klass)
            pages.append(page)
            books.extend(listed)
            if not page["count_matches"]:
                errors.append({"class": klass, "type": "mismatch_or_missing_page_count", "page": page})
            print("TNKALVI_CLASS " + json.dumps(page, ensure_ascii=False))
        except Exception as exc:
            errors.append({"class": klass, "type": "fetch_error", "error": str(exc), "url": url})
            print("TNKALVI_FETCH_ERROR " + json.dumps(errors[-1]))

    per_class = {str(cls): sum(b["class"] == cls for b in books) for cls in CLASSES}
    summary = {
        "source": BASE, "class_pages_requested": 7, "class_pages_parsed": len(pages),
        "catalogue_detail_selections": len(books),
        "catalogue_reported_unique_pdfs_sum": sum(p["catalogue_unique_pdfs_reported"] or 0 for p in pages),
        "reported_unique_pdf_sum_is_not_globally_deduplicated": True,
        "per_class_detail_selections": per_class,
        "errors": len(errors), "full_original_book_certifications": 0,
        "review_scope_complete": False,
        "note": "Secondary catalogue metadata only. Do not interpret selectors as distinct editions or verified PDFs."
    }
    data = {"schema_version": 1, "generated_by": "scripts/inventory_tnkalvi_original_books.py",
            "summary": summary, "pages": pages, "books": books, "errors": errors}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("TNKALVI_INVENTORY_SUMMARY " + json.dumps(summary, ensure_ascii=False))
    return 1 if len(pages) != 7 or errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
