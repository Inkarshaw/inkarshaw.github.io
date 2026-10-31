#!/usr/bin/env python3
"""Verify page-level source provenance and non-certification for Class 12 Political Science."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/textbook/original-pdf-source-manifest.json"
EVIDENCE = ROOT / "data/textbook/original-page-review-evidence-class12-political-science-2022.json"
QUIZ = ROOT / "data/special-quizzes/firsts.json"

class Class12OriginalPoliticalScienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
        cls.evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
        cls.quiz = json.loads(QUIZ.read_text(encoding="utf-8"))
        cls.source = next(x for x in cls.manifest["volumes"] if x["id"] == cls.evidence["source_id"])
        cls.added = [x for x in cls.quiz["questions"] if x.get("source_evidence_id", "").startswith("class12-2022-firsts-")]

    def test_original_book_limits_explicit(self):
        self.assertEqual(self.source["class"], 12)
        self.assertIn("2022", self.source["edition"])
        self.assertEqual(self.source["tamil_pdf_review"], "not-started")
        self.assertNotEqual(self.source["chapter_coverage"], "complete")
        self.assertEqual(self.source["english_url"], self.evidence["source_url"])
        for k in ("full_volume_certified", "visual_pdf_page_review_completed",
                  "tamil_original_pages_checked", "current_prescribed_2026_edition_verified",
                  "manual_all_chapters_reviewed"):
            self.assertFalse(self.evidence[k], k)

    def test_all_five_questions_have_printed_page_and_independent_evidence(self):
        indexed = {x["quiz_id"]: x for x in self.evidence["evidence"]}
        self.assertEqual(len(indexed), 5)
        self.assertEqual(len(self.added), 5)
        self.assertEqual(set(indexed), {x["id"] for x in self.added})
        for q in self.added:
            evidence = indexed[q["id"]]
            with self.subTest(q=q["id"]):
                self.assertEqual(q["class_no"], 12)
                self.assertEqual(q["page"], evidence["printed_page"])
                self.assertIn(q["page"], self.evidence["reviewed_printed_pages"])
                self.assertEqual(q["opts_en"][q["correct"]], evidence["answer"])
                self.assertEqual(q["source_evidence_id"], evidence["id"])
                self.assertEqual(q["source_link"], self.evidence["source_url"])
                self.assertEqual(q["original_medium_checked"], "English")
                self.assertIsNone(q["source_ta_link"])
                self.assertEqual(q["review_status"], "original_english_pdf_text_checked_tamil_and_visual_pages_pending")
                self.assertEqual(evidence["visual_page_verification"], "pending")
                self.assertEqual(evidence["tamil_source_verification"], "pending")
                self.assertTrue(evidence["independent_confirmation_url"].startswith("https://"))
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertTrue(any("\u0b80" <= char <= "\u0bff" for char in q["q_ta"]))

    def test_conflicted_first_linguistic_state_not_published(self):
        conflict = next(x for x in self.evidence["discrepancies"] if x["key"] == "andhra-state-vs-andhra-pradesh")
        self.assertEqual(conflict["resolution"], "exclude_general_first_state_question_pending_correction")
        self.assertFalse(conflict["quiz_question_published"])
        self.assertEqual(self.quiz["meta"]["count"], len(self.quiz["questions"]))
        self.assertGreaterEqual(len(self.quiz["questions"]), 143)

if __name__ == "__main__":
    unittest.main()
