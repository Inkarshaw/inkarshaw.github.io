#!/usr/bin/env python3
"""Class 6 2025 PDF source provenance without premature whole-book sign-off."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


class Class6Term1SourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.quiz=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
        cls.registry=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))

    def test_three_original_pdf_fact_pointers(self):
        bank={q["id"]:q for q in self.quiz["questions"]}
        for id,page in (("F033",102),("F034",102),("F035",103)):
            with self.subTest(id=id):
                q=bank[id]
                self.assertEqual(q["class_no"],6)
                self.assertIn("2025",q["original_edition"])
                self.assertEqual(q["original_pdf_page_checked"],page)
                self.assertTrue(q["source_printed_page"] in (98,99))
                self.assertTrue(q["source_link"].startswith("https://drive.google.com/file/d/1MNff"))
                self.assertTrue(q["source_ta_link"].startswith("https://drive.google.com/file/d/1HeN"))
                self.assertIn("pending",q["review_status"])
                self.assertTrue(q["source_evidence_id"])
                self.assertIn("garbled",q["source_pdf_text_review_note"])

    def test_social_science_source_fact_pointers(self):
        bank={q["id"]:q for q in self.quiz["questions"]}
        for id,pdfpage,printed in (("F043",31,133),("F044",105,209)):
            with self.subTest(id=id):
                q=bank[id]
                self.assertEqual(q["original_pdf_page_checked"],pdfpage)
                self.assertEqual(q["source_printed_page"],printed)
                self.assertIn("2025",q["original_edition"])
                self.assertIn("pending",q["review_status"])
                self.assertIn("1WJn-q7",q["source_link"])
                self.assertIn("1xz06oz",q["source_ta_link"])
        volumes=[v for v in self.registry["volumes"] if v["id"]=="c6-social-science-term1-2025-volume3"]
        self.assertEqual(len(volumes),1)
        self.assertNotEqual(volumes[0]["chapter_coverage"],"certified")
        doc=(ROOT/"docs/textbook-quality/class6-term1-social-original-pdf-2025-review.md").read_text(encoding="utf-8")
        for marker in ("F043","F044","NOT CERTIFIED","110","Chandrayaan"):
            self.assertIn(marker,doc)

    def test_book_pair_is_only_partially_checked(self):
        volumes=[b for b in self.registry["volumes"] if b["id"]=="c6-science-social-term1-2025-volume3"]
        self.assertEqual(len(volumes),1)
        volume=volumes[0]
        self.assertEqual(volume["english_pdf_review"],"text-extracted")
        self.assertEqual(volume["tamil_pdf_review"],"text-extracted")
        self.assertNotEqual(volume["chapter_coverage"],"certified")
        self.assertIn("selected",volume["chapter_coverage"])
        doc=(ROOT/"docs/textbook-quality/class6-term1-original-pdf-2025-review.md").read_text(encoding="utf-8")
        for marker in ("F033","F034","F035","NOT CERTIFIED","108","107"):
            self.assertIn(marker,doc)


if __name__=="__main__":
    unittest.main()
