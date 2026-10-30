#!/usr/bin/env python3
"""Inventory *original-book listings* for Tamil Nadu State Board classes 6–12.

Output is a source catalogue, NOT an audit of the contents or facts in these books.
Scrapes the public class/medium archive page for catalogued original SCERT volumes,
while preserving fetch failures and book names rather than silently dropping them.

Usage: python scripts/inventory_tn_original_books.py [output.json]
"""
from __future__ import annotations
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://padanool.in"
HEADERS = {"User-Agent": "ClearExams-TextbookInventory/1.0 (+https://clearexams.ink/)"}
CLASSES = range(6, 13)
MEDIUMS = ("english-medium", "tamil-medium")

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current = None
        self.text = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.current = dict(attrs).get("href")
            self.text = []
    def handle_data(self, data):
        if self.current is not None:
            self.text.append(data)
    def handle_endtag(self, tag):
        if tag == "a" and self.current is not None:
            self.links.append((self.current, " ".join(self.text).strip()))
            self.current = None
            self.text = []

def get_links(url):
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=25) as resp:
        content = resp.read(3_000_000).decode("utf-8", errors="replace")
    parser = Links()
    parser.feed(content)
    return parser.links

def main():
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tn-original-book-inventory.json"
    books = []
    failures = []
    page_summaries = []
    for klass in CLASSES:
        for medium in MEDIUMS:
            page = f"{BASE}/class-{klass}/{medium}/"
            try:
                raw = get_links(page)
                prefix = f"/class-{klass}/{medium}/"
                found = {}
                for href, title in raw:
                    full = urljoin(page, href)
                    parsed = urlparse(full)
                    p = parsed.path
                    if parsed.netloc not in ("padanool.in", "www.padanool.in"):
                        continue
                    # Only item detail links, not PDFs, filters or the class index.
                    if not p.startswith(prefix) or p.rstrip("/") == prefix.rstrip("/"):
                        continue
                    slug = p[len(prefix):].strip("/")
                    if "/" in slug or not slug or slug in ("pdf", "download"):
                        continue
                    subject = re.sub(r"\s+", " ", html.unescape(title)).strip()
                    if not subject or len(subject) > 120 or subject.lower() in ("pdf", "download pdf"):
                        continue
                    found[slug] = {"class": klass, "medium": medium, "subject": subject,
                                   "slug": slug, "detail_url": full,
                                   "status": "listed_not_content_verified"}
                books.extend(found.values())
                page_summaries.append({"class": klass, "medium": medium,
                                       "books_listed": len(found), "source_url": page})
                print("TN_ORIGINAL_PAGE " + json.dumps(page_summaries[-1], ensure_ascii=False))
                if not found:
                    failures.append({"url": page, "reason": "no book details found; verify HTML layout"})
            except Exception as exc:
                failures.append({"url": page, "reason": str(exc)})
                print("TN_ORIGINAL_FETCH_ERROR " + json.dumps(failures[-1], ensure_ascii=False))
    summary = {
        "classes_checked_for_listing": 7,
        "mediums": 2,
        "class_medium_pages": 14,
        "pages_read": len(page_summaries),
        "unique_books_listed": len(books),
        "errors": len(failures),
        "original_book_pages_verified": 0,
        "complete_coverage_certified": False
    }
    result = {"schema_version": 1, "purpose": "original textbook inventory (not contents)",
              "site_reference": BASE, "summary": summary,
              "per_class_medium": page_summaries, "books": books, "errors": failures}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("TN_ORIGINAL_INVENTORY_SUMMARY " + json.dumps(summary))
    return 0 if len(page_summaries) == 14 else 1

if __name__ == "__main__":
    raise SystemExit(main())
