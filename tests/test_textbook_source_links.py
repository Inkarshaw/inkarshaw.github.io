#!/usr/bin/env python3
"""Regression tests for external textbook references in bilingual quizzes."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "textbook_source_audit", ROOT / "scripts/audit_textbook_source_links.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class TextbookSourceTests(unittest.TestCase):
    def test_source_registry_is_direct_and_bilingual(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(registry["version"], 1)
        for key, row in registry["books"].items():
            self.assertTrue(any(row.get(field) for field in ("source_en_url", "source_ta_url")), key)
            for field in ("source_en_url", "source_ta_url"):
                if row.get(field):
                    self.assertTrue(MODULE.is_direct_book_url(row[field]), (key, field))

    def test_class_9_science_tamil_pdf_and_edition_mismatch_are_explicit(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json")
                              .read_text(encoding="utf-8"))["books"]
        row = registry["class-9/science"]
        self.assertTrue(MODULE.is_direct_book_url(row["source_en_url"]))
        self.assertTrue(MODULE.is_direct_book_url(row["source_ta_url"]))
        self.assertIn("science-tm.pdf", row["source_ta_url"])
        self.assertIn("2022", row["edition_note"])
        self.assertIn("NOT an independently verified same-revision", row["edition_note"])
        self.assertIn("2026", row["edition_note"])

    def test_class_9_social_science_has_real_tamil_medium_textbook(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json")
                              .read_text(encoding="utf-8"))["books"]
        row = registry["class-9/social-science"]
        self.assertTrue(MODULE.is_direct_book_url(row["source_en_url"]))
        self.assertTrue(MODULE.is_direct_book_url(row["source_ta_url"]))
        self.assertIn("Social-Science-Textbook-Tamil.pdf", row["source_ta_url"])
        self.assertIn("2026", row["edition_note"])
        self.assertIn("NOT independently matched", row["edition_note"])
        self.assertIn("2026-11-07", row["source_checked_on"])
        # Test the actual fallback order for an existing 2019 English-origin
        # question: the Tamil UI should now resolve a Tamil textbook, without
        # falsely asserting that its pages match the English original.
        doc = json.loads((ROOT / "data/textbook/class-9/social-science/unit-1.json")
                         .read_text(encoding="utf-8"))
        choices = MODULE.source_choices(doc["questions"][0], doc["meta"], row, "ta")
        first_valid = next((u for u in choices if MODULE.is_direct_book_url(u)), None)
        self.assertEqual(first_valid, row["source_ta_url"])

    def test_class_10_social_science_has_labelled_2022_tamil_reference(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json")
                              .read_text(encoding="utf-8"))["books"]
        row = registry["class-10/social-science"]
        self.assertTrue(MODULE.is_direct_book_url(row["source_en_url"]))
        self.assertTrue(MODULE.is_direct_book_url(row["source_ta_url"]))
        self.assertIn("drive.google.com/file/d/", row["source_ta_url"])
        self.assertIn("2022", row["edition_note"])
        self.assertIn("unverified", row["edition_note"])
        self.assertIn("tntextbooks.in/p/10th-books.html", row["catalogue"])

    def test_class_11_history_2025_has_real_book_files(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json").read_text(encoding="utf-8"))["books"]
        row = registry["class-11/history"]
        self.assertIn("drive.google.com/file/d/", row["source_en_url"])
        self.assertIn("drive.google.com/file/d/", row["source_ta_url"])

    def test_quiz_links_are_never_considered_book_sources(self):
        bad = (
            "https://clearexams.ink/textbook-play.html?class=10&subject=science",
            "https://inkarshaw.github.io/textbook-play.html?class=6",
            "https://www.tntextbooks.in/p/10th-books.html",
            "https://example.org/quiz-play.html",
            "javascript:alert(1)",
            "textbook-play.html?class=10",
        )
        for candidate in bad:
            self.assertFalse(MODULE.is_direct_book_url(candidate), candidate)
        self.assertTrue(MODULE.is_direct_book_url("https://tnebooks.github.io/10th-science/ta/docs/environmental-management/"))

    def test_player_enforces_real_external_textbook_links(self):
        html = (ROOT / "textbook-play.html").read_text(encoding="utf-8")
        self.assertIn("function safeSourceUrl(q){", html)
        self.assertIn("parsed.protocol!=='https:'", html)
        self.assertIn("path.endsWith('.pdf')", html)
        self.assertIn("host===location.hostname", html)
        self.assertIn("meta.source_en_url", html)
        self.assertIn("meta.source_ta_url", html)
        self.assertIn("data/textbook/source-registry.json", html)
        self.assertIn("a.removeAttribute('href')", html)
        self.assertIn("Source PDF pending verification", html)

    def test_language_fallback_priorities_reconcile_with_audit_totals(self):
        report = MODULE.audit()
        counts = report["counts"]
        priorities = report["fallback_by_book"]
        self.assertTrue(priorities, "Source-medium editorial priorities should be listed")
        self.assertEqual([row["total"] for row in priorities],
                         sorted((row["total"] for row in priorities), reverse=True))
        for language in ("en", "ta"):
            combined = sum(row[language + "_unspecified"] +
                           row[language + "_other_language"] for row in priorities)
            self.assertEqual(combined, counts.get(language + "_fallback_to_other_or_unspecified", 0))
            self.assertEqual(combined,
                             counts.get(language + "_fallback_unspecified", 0) +
                             counts.get(language + "_fallback_other_language", 0))
        # A genuine Class 9 Tamil Social Science book replaces all legacy
        # English-book fallback links for that subject in the Tamil UI.
        self.assertFalse(any(row["book"] == "class-9/social-science" for row in priorities),
                         "Class 9 Social Science still uses a source from another language")
        for row in priorities:
            self.assertGreater(row["total"], 0)
            self.assertEqual(row["total"], sum(row[k] for k in (
                "en_unspecified", "en_other_language", "ta_unspecified", "ta_other_language")))
        for sample in report["fallback_examples"]:
            self.assertIn(sample["view_language"], ("en", "ta"))
            self.assertIn(sample["fallback_type"], ("unspecified", "other_language"))
            self.assertTrue(sample["file"])

    def test_full_question_bank_audit_runs(self):
        report = MODULE.audit()
        self.assertGreater(report["counts"]["question_entries"], 0)
        for key in ("invalid_metadata_urls", "invalid_question_urls", "en_missing", "ta_missing",
                    "unreadable_or_invalid_json_files", "invalid_question_records"):
            self.assertEqual(report["counts"].get(key, 0), 0, f"Textbook source audit: {key}")
        self.assertEqual(report["counts"]["question_entries"] * 2,
                         sum(report["counts"].get(key, 0)
                             for key in ("en_linked", "en_missing", "ta_linked", "ta_missing")))


if __name__ == "__main__":
    unittest.main()
