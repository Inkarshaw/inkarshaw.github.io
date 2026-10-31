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
        scan = self.evidence["machine_scan"]
        self.assertEqual(scan["original_english_pdf_pages"], 328)
        self.assertEqual(scan["text_extractable_pages"], 322)
        self.assertEqual(scan["pages_needing_visual_review"], 6)
        self.assertEqual(scan["broad_keyword_candidate_hits"], 302)
        self.assertFalse(scan["manual_all_candidates_reviewed"])
        self.assertFalse(scan["full_volume_certified"])

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
                if q["id"] == "F125":
                    self.assertEqual(e["tamil_source_verification"], "2018_tamil_term2_original_text_checked_different_edition_2020_pending")
                    self.assertEqual(q["source_ta_link"], e["tamil_source_reference_url"])
                else:
                    self.assertEqual(e["tamil_source_verification"], "pending")
                self.assertEqual(e["visual_page_verification"], "pending")
                self.assertEqual(e["answer"], q["opts_en"][q["correct"]])
                self.assertTrue(re.search(r"[\u0B80-\u0BFF]", q["q_ta"]))
                if q["id"] != "F125":
                    self.assertIsNone(q["source_ta_link"])

    def test_not_every_original_volume_is_certified(self):
        text = (ROOT / "docs/textbook-quality/original-class6-12-firsts-ledger.md").read_text(encoding="utf-8")
        self.assertIn("0/251 fully", text)
        self.assertIn(f"{len(self.quiz['questions'])} curated bilingual questions", text)
        self.assertEqual(self.quiz["meta"]["count"], len(self.quiz["questions"]))


if __name__ == "__main__":
    unittest.main()
