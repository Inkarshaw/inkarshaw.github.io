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

    def test_full_question_bank_audit_runs(self):
        report = MODULE.audit()
        self.assertGreater(report["counts"]["question_entries"], 0)
        self.assertEqual(report["counts"]["question_entries"] * 2,
                         sum(report["counts"].get(key, 0)
                             for key in ("en_linked", "en_missing", "ta_linked", "ta_missing")))


if __name__ == "__main__":
    unittest.main()
