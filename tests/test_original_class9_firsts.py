#!/usr/bin/env python3
"""Class 9 original-English-source review must not be mislabelled as full certification."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/textbook/original-pdf-source-manifest.json"
EVIDENCE = ROOT / "data/textbook/original-page-review-evidence-class9-2020.json"
QUIZ = ROOT / "data/special-quizzes/firsts.json"


class OriginalClass9ReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = json.loads(MANIFEST.read_text(encoding="utf-8"))["volumes"]
        cls.evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
        cls.quiz = json.loads(QUIZ.read_text(encoding="utf-8"))
        cls.new_questions = [q for q in cls.quiz["questions"] if q.get("source_evidence_id", "").startswith("class9-2020-firsts-")]

    def test_original_edition_and_unverified_media(self):
        source = next(x for x in self.sources if x["id"] == "c9-social-science-2020-revision")
        self.assertEqual(source["class"], 9)
        self.assertIn("2020", source["edition"])
        self.assertNotEqual(source["chapter_coverage"], "complete")
        self.assertEqual(source["tamil_pdf_review"], "not-started")
        self.assertFalse(self.evidence["full_volume_certified"])
        self.assertFalse(self.evidence["visual_pdf_page_review_completed"])
        self.assertFalse(self.evidence["tamil_original_pages_checked"])
        self.assertFalse(self.evidence["current_prescribed_2026_edition_verified"])

    def test_page_evidence_references_every_new_question(self):
        self.assertEqual(len(self.new_questions), 12)
        self.assertEqual(len(self.evidence["evidence"]), 12)
        indexed = {e["quiz_id"]: e for e in self.evidence["evidence"]}
        self.assertEqual(set(indexed), {q["id"] for q in self.new_questions})
        for q in self.new_questions:
            e = indexed[q["id"]]
            with self.subTest(q=q["id"]):
                self.assertEqual(q["class_no"], 9)
                self.assertEqual(q["page"], e["printed_page"])
                self.assertEqual(q["source_evidence_id"], e["id"])
                self.assertEqual(q["source_link"], self.evidence["source_url"])
                self.assertEqual(q["review_status"], "original_english_pdf_text_checked_tamil_and_visual_pages_pending")
                self.assertEqual(q["original_medium_checked"], "English")
                self.assertIn(q["page"], self.evidence["reviewed_printed_pages"])
                self.assertEqual(e["tamil_source_verification"], "pending")
                self.assertEqual(e["visual_page_verification"], "pending")
                self.assertEqual(e["answer"], q["opts_en"][q["correct"]])
                self.assertTrue(re.search(r"[\u0B80-\u0BFF]", q["q_ta"]))
                self.assertIsNone(q["source_ta_link"])  # Do not imply source Tamil text was inspected

    def test_not_every_original_volume_is_certified(self):
        text = (ROOT / "docs/textbook-quality/original-class6-12-firsts-ledger.md").read_text(encoding="utf-8")
        self.assertIn("0/251 fully", text)
        self.assertIn("133 curated bilingual questions", text)
        self.assertEqual(self.quiz["meta"]["count"], len(self.quiz["questions"]))


if __name__ == "__main__":
    unittest.main()
