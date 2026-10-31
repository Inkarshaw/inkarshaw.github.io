#!/usr/bin/env python3
"""Keep secondary Class 6–12 catalogue counts distinct from signed-off originals."""
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("tn_catalogue", ROOT / "scripts/inventory_tnkalvi_original_books.py")
catalogue = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catalogue)

class TnKalviCatalogTests(unittest.TestCase):
    def test_grade_subject_term_and_medium_detail_link(self):
        mock = """
        <html><main>2 selections · 2 unique PDFs
        <a href="/textbooks/book/class-6-tm-term-1-social-science"><span>சமூக அறிவியல்</span>Social Science</a>
        <a href="/textbooks/book/class-6-em-term-1-science">Science</a>
        <a href="/textbooks/book/class-6-em-term-1-science">Science duplicate navigation</a>
        <a href="/textbooks/book/class-7-em-full-year-science">Other class</a>
        <a href="https://unrelated.example/test">Unrelated</a>
        </main></html>
        """
        page, items = catalogue.parse_class_page(mock, 6)
        self.assertTrue(page["count_matches"])
        self.assertEqual(len(items), 2)
        self.assertEqual(page["catalogue_unique_pdfs_reported"], 2)
        self.assertEqual({x["medium"] for x in items}, {"tm", "em"})
        self.assertEqual({x["term"] for x in items}, {"term-1"})
        self.assertEqual({x["subject_slug"] for x in items}, {"social science", "science"})
        self.assertTrue(all(not x["english_and_tamil_certified"] for x in items))
        self.assertTrue(all(x["review_status"] == "catalogue_detail_link_only" for x in items))

    def test_no_bad_grade_or_fake_external_catalogue(self):
        page, items = catalogue.parse_class_page("""
        1 selections · 1 unique PDFs
        <a href="https://evil.test/textbooks/book/class-10-em-full-year-science">Fake external</a>
        <a href="/textbooks/book/class-10-em-full-year-science">Science</a>
        """, 10)
        self.assertEqual(len(items), 1)
        self.assertTrue(page["count_matches"])

    def test_missing_page_summary_does_not_claim_complete(self):
        page, books = catalogue.parse_class_page("<a href='/textbooks/book/class-11-em-full-year-economics'>Economics</a>", 11)
        self.assertEqual(len(books), 1)
        self.assertIsNone(page["catalogue_selection_count_reported"])
        self.assertFalse(page["count_matches"])

if __name__ == "__main__":
    unittest.main()
