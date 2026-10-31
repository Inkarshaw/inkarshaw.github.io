#!/usr/bin/env python3
"""Selected original Class 12 Economics Firsts: provenance and editorial guardrails."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/textbook/original-pdf-source-manifest.json"
EVIDENCE = ROOT / "data/textbook/original-page-review-evidence-class12-economics-2019.json"
BANK = ROOT / "data/special-quizzes/firsts.json"

class Class12EconomicsFirstsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        cls.evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
        cls.bank = json.loads(BANK.read_text(encoding="utf-8"))
        cls.source = next(s for s in cls.manifest["volumes"] if s["id"] == cls.evidence["source_id"])
        cls.items = [q for q in cls.bank["questions"] if
                     q.get("source_evidence_id", "").startswith("class12-econ-2019-")]

    def test_scope_does_not_claim_unearned_certification(self):
        self.assertEqual(self.source["class"], 12)
        self.assertEqual(self.source["subject"], "Economics")
        self.assertEqual(self.source["tamil_pdf_review"], "not-started")
        self.assertNotEqual(self.source["chapter_coverage"], "complete")
        for key in ("original_pdf_visual_screenshots_checked", "tamil_original_pages_checked",
                    "latest_prescribed_2026_edition_verified", "all_chapters_read",
                    "all_pdf_pages_text_extracted", "full_volume_certified"):
            self.assertFalse(self.evidence[key], key)

    def test_five_source_linked_bilingual_items(self):
        indexed = {item["quiz_id"]: item for item in self.evidence["evidence"]}
        self.assertEqual(len(self.items), 5)
        self.assertEqual(len(indexed), 5)
        self.assertEqual(set(indexed), {q["id"] for q in self.items})
        for q in self.items:
            evidence = indexed[q["id"]]
            with self.subTest(id=q["id"]):
                self.assertEqual(q["class_no"], 12)
                self.assertEqual(q["page"], evidence["printed_page"])
                self.assertEqual(q["source_evidence_id"], evidence["id"])
                self.assertEqual(q["source_link"], self.evidence["source_url"])
                self.assertEqual(q["opts_en"][q["correct"]], evidence["answer"])
                self.assertEqual(q["review_status"],
                                 "original_english_pdf_text_checked_tamil_and_visual_pages_pending")
                if q["id"] == "F144":
                    self.assertIsNone(q["source_ta_link"])
                else:
                    self.assertEqual(q["source_ta_link"],
                                     "https://padanool.in/dl/class-12-economics-tamil-medium.pdf")
                    self.assertEqual(q["source_ta_pdf_page"],
                                     {"F145": 117, "F146": 127, "F147": 127, "F148": 196}[q["id"]])
                    self.assertIn("2024", q["source_ta_edition"])
                    self.assertIn("not_full_volume_certification", q["tamil_original_excerpt_status"])
                self.assertEqual(q["original_medium_checked"], "English")
                self.assertEqual(evidence["visual_page_verification"], "pending")
                self.assertEqual(evidence["tamil_source_verification"], "pending")
                self.assertTrue(evidence["independent_confirmation_url"].startswith("https://"))
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertTrue(any("\u0b80" <= ch <= "\u0bff" for ch in q["q_ta"]))

    def test_excluded_textbook_historical_overclaims(self):
        exclusions = {e["key"]: e for e in self.evidence["excluded_claims"]}
        self.assertFalse(exclusions["kuznets-first-concept-national-income"]["quiz_question_published"])
        self.assertFalse(exclusions["bank-of-england-1864-first-issues"]["quiz_question_published"])
        self.assertTrue(exclusions["swedish-central-bank-1656"]["quiz_question_published"])
        riksbank = next(q for q in self.items if q["id"] == "F145")
        self.assertIn("1668", riksbank["q_en"])
        self.assertIn("1656", riksbank["exp_en"])
        self.assertEqual(self.bank["meta"]["count"], len(self.bank["questions"]))
        self.assertGreaterEqual(len(self.bank["questions"]), 148)

if __name__ == "__main__":
    unittest.main()
