#!/usr/bin/env python3
"""Provenance and bilingual integrity for the selected 2022 Class 11 Polity firsts."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
M = ROOT / "data/textbook/original-pdf-source-manifest.json"
E = ROOT / "data/textbook/original-page-review-evidence-class11-political-science-2022.json"
Q = ROOT / "data/special-quizzes/firsts.json"

class PoliticalScienceSourceReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = next(v for v in json.loads(M.read_text(encoding="utf8"))["volumes"]
                          if v["id"] == "c11-political-science-2022-revision")
        cls.evidence = json.loads(E.read_text(encoding="utf8"))
        cls.quiz = json.loads(Q.read_text(encoding="utf8"))
        cls.questions = [q for q in cls.quiz["questions"]
                         if q.get("source_evidence_id", "").startswith("class11-2022-firsts-")]

    def test_no_full_volume_certification(self):
        self.assertEqual(self.source["english_pdf_review"], "text-extracted")
        self.assertEqual(self.source["tamil_pdf_review"], "not-started")
        self.assertNotEqual(self.source["chapter_coverage"], "complete")
        for flag in ("full_volume_certified","visual_pdf_page_review_completed",
                     "tamil_original_pages_checked","current_prescribed_2026_edition_verified",
                     "manual_all_chapters_reviewed"):
            self.assertFalse(self.evidence[flag], flag)

    def test_each_edited_question_has_original_page_evidence(self):
        indexed = {e["quiz_id"]: e for e in self.evidence["evidence"]}
        self.assertEqual(len(indexed), 5)
        self.assertEqual(len(self.questions), 5)
        self.assertEqual(set(indexed), {q["id"] for q in self.questions})
        for q in self.questions:
            e = indexed[q["id"]]
            with self.subTest(quiz=q["id"]):
                self.assertEqual(q["class_no"], 11)
                self.assertEqual(q["source_evidence_id"], e["id"])
                self.assertEqual(q["page"], e["printed_page"])
                self.assertEqual(q["source_link"], self.evidence["source_url"])
                self.assertEqual(q["opts_en"][q["correct"]], e["answer"])
                self.assertIsNone(q["source_ta_link"])
                self.assertEqual(q["review_status"],
                                 "original_english_pdf_text_checked_tamil_and_visual_pages_pending")
                self.assertEqual(e["tamil_source_verification"], "pending")
                self.assertEqual(e["visual_page_verification"], "pending")
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertTrue(any("\u0b80" <= c <= "\u0bff" for c in q["q_ta"]))

    def test_question_count_and_scoping(self):
        self.assertEqual(self.quiz["meta"]["count"], len(self.quiz["questions"]))
        self.assertGreaterEqual(len(self.quiz["questions"]), 138)
        self.assertIn("2022", self.source["edition"])
        self.assertIn("pending", self.quiz["meta"]["edition_note"].lower())
        self.assertIn("verify visually", next(x["source_text_location"] for x in
                      self.evidence["evidence"] if x["quiz_id"] == "F137"))
if __name__ == "__main__":
    unittest.main()
