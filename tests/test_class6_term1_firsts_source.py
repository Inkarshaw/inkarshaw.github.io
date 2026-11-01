#!/usr/bin/env python3
"""Class 6 Term I original English/Tamil source provenance and incomplete-certification gates."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Class6Term1SourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.quiz = json.loads((ROOT / "data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
        cls.registry = json.loads((ROOT / "data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
        cls.byid = {q["id"]: q for q in cls.quiz["questions"]}

    def test_original_pdf_source_pair_replaces_legacy_drive_links(self):
        expected = {
            "F033": (102, 102), "F034": (102, 102), "F035": (103, 103),
            "F043": (137, 137), "F044": (211, 213),
            "F149": (211, 213), "F150": (169, 170), "F151": (171, 171),
        }
        for id, (en_page, ta_page) in expected.items():
            with self.subTest(id=id):
                q = self.byid[id]
                self.assertEqual(q["class_no"], 6)
                self.assertIn("d21mc000xink7q.cloudfront.net", q["source_link"])
                self.assertIn("d21mc000xink7q.cloudfront.net", q["source_ta_link"])
                self.assertIn("_EM_", q["source_link"])
                self.assertIn("_TM_", q["source_ta_link"])
                self.assertEqual(q["source_pdf_page_en"], en_page)
                self.assertEqual(q["source_ta_pdf_page"], ta_page)
                self.assertTrue(q["source_evidence_id"])
                self.assertIn("pending", q["review_status"])
                self.assertIn("Term I", q["original_edition"])

    def test_originals_scanned_but_book_not_certified(self):
        rows = [x for x in self.registry["volumes"] if x["id"] == "c6-science-social-science-term-1"]
        self.assertEqual(len(rows), 1)
        volume = rows[0]
        self.assertEqual(volume["verified_pdf_page_count"], {
            "english": 216, "tamil": 216, "english_text_extractable": 216, "tamil_text_extractable": 216
        })
        self.assertFalse(volume["complete_english_tamil_original_book_certification"])
        self.assertEqual(len(volume["fact_checks"]), 8)
        self.assertIn("visual_pending", volume["english_pdf_review"])
        self.assertIn("visual_pending", volume["tamil_pdf_review"])
        document = (ROOT / "docs/textbook-quality/class6-term1-firsts-review-2026-11-01.md").read_text(encoding="utf-8")
        for marker in ("F033", "F034", "F035", "F043", "F044", "F149", "F150", "F151",
                       "NOT CERTIFIED", "216", "2026–27"):
            self.assertIn(marker, document)

    def test_new_mcq_answers_from_book(self):
        for id, value in [("F149", "Viswanathan Anand"),
                          ("F150", "William Herschel"), ("F151", "Chandrayaan-1")]:
            q = self.byid[id]
            self.assertEqual(q["opts_en"][q["correct"]], value)
            self.assertEqual(len(q["opts_ta"]), 4)
            self.assertTrue(q["exp_en"])
            self.assertTrue(q["exp_ta"])

if __name__ == "__main__":
    unittest.main()
