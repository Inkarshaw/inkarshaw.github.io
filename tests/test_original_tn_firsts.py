#!/usr/bin/env python3
"""Guard against falsely calling keyword extraction a complete textbook review."""
import json
import unittest
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "data/textbook/original-pdf-source-manifest.json"
QUIZ = ROOT / "data/special-quizzes/firsts.json"

class OriginalBookFirstsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = json.loads(BOOKS.read_text(encoding="utf-8"))
        cls.quiz = json.loads(QUIZ.read_text(encoding="utf-8"))

    def test_source_inventory_and_unverified_status_are_explicit(self):
        ids = set()
        standards = set()
        for source in self.sources["volumes"]:
            self.assertNotIn(source["id"], ids)
            ids.add(source["id"])
            standards.add(source["class"])
            self.assertIn(source["english_pdf_review"], ("not-started","downloaded","text-extracted","selected_history_units_extracted_from_original_pdf"))
            self.assertNotEqual(source["chapter_coverage"], "complete")
            self.assertEqual(urlparse(source["english_url"]).scheme, "https")
            if source.get("tamil_url"):
                self.assertEqual(urlparse(source["tamil_url"]).scheme, "https")
        self.assertEqual(standards, set(range(6, 13)))
        self.assertIn("incomplete", self.sources["canonical_scope"].lower())

    def test_quiz_additions_have_page_provenance(self):
        items = self.quiz["questions"]
        self.assertEqual(self.quiz["meta"]["count"], len(items))
        self.assertGreaterEqual(len(items), 116)
        ids = set()
        original = 0
        for q in items:
            self.assertNotIn(q["id"], ids)
            ids.add(q["id"])
            self.assertIn(q["correct"], range(4))
            for key in ("q_en","q_ta","exp_en","exp_ta","source_link"):
                self.assertTrue(q.get(key), (q["id"],key))
            for key in ("opts_en", "opts_ta"):
                self.assertEqual(len(q[key]), 4, (q["id"],key))
                self.assertEqual(len(set(q[key])), 4, (q["id"],key))
            if q.get("review_status") == "original_english_pdf_text_checked_tamil_edition_not_yet_certified":
                self.assertEqual(q["class_no"], 10)
                self.assertIsInstance(q["page"], int)
                self.assertIn(q["page"], (106,111,116,118,195))
                self.assertIn("2022", q["original_edition"])
                original += 1
        self.assertGreaterEqual(original, 7)

    def test_source_conflicts_not_silently_rewritten(self):
        swadesamitran = next(q for q in self.quiz["questions"] if q["id"] == "F019")
        conflict = swadesamitran["source_conflict"]
        self.assertEqual(conflict["status"], "open_requires_original_edition_comparison")
        self.assertIn("1891", conflict["scert_class10_2022"])
        self.assertIn("1882", conflict["class12_bank"])

    def test_audit_script_explicitly_excludes_copyrighted_chapter_output(self):
        code = (ROOT / "scripts/scan_original_tn_firsts.py").read_text(encoding="utf-8")
        self.assertIn("context_excerpt", code)
        self.assertIn("claims_verified", code)
        self.assertIn("page_summaries", code)

if __name__=="__main__":
    unittest.main()
