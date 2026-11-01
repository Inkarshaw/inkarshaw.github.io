#!/usr/bin/env python3
"""Class 7 Term I original SCERT source provenance and honest certification limits."""
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Class7Term1FirstsSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.quiz = json.loads((ROOT / "data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
        cls.q = {x["id"]: x for x in cls.quiz["questions"]}
        cls.registry = json.loads((ROOT / "data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
        cls.v = {x["id"]: x for x in cls.registry["volumes"]}

    def test_six_actual_original_pdfs_are_registered_without_false_certification(self):
        science = self.v["c7-science-term1-2025-mirror"]
        social = self.v["c7-social-science-term1-2025-mirror"]
        combined = self.v["c7-science-social-science-term-1"]
        self.assertEqual(science["full_original_english_tamil_pdf_pages"], {"english": 102, "tamil": 103})
        self.assertEqual(social["full_original_english_tamil_pdf_pages"], {"english": 100, "tamil": 123})
        self.assertEqual(combined["full_original_english_tamil_pdf_pages"], {"english": 200, "tamil": 224})
        self.assertEqual(sum(science["full_original_english_tamil_pdf_pages"].values()) +
                         sum(social["full_original_english_tamil_pdf_pages"].values()), 428)
        for record in (science, social, combined):
            self.assertFalse(record.get("completely_certified",
                               record.get("complete_english_tamil_original_book_certification", False)))
            self.assertEqual(record["english_pdf_review"], "text-extracted")
            self.assertEqual(record["tamil_pdf_review"], "text-extracted")
            self.assertNotEqual(record["chapter_coverage"], "complete")
            for medium in ("english", "tamil"):
                self.assertEqual(record["full_original_english_tamil_pdf_pages"][medium],
                                 record["full_original_english_tamil_pages_with_extractable_text"][medium])
                self.assertEqual(len(record["original_pdf_sha256"][medium]), 64)
            self.assertIn("https://", record["english_url"])
            self.assertIn("https://", record["tamil_url"])

    def test_nine_bilingual_firsts_have_precise_source_pages(self):
        expected = {
            "F051": ("social-science", 16, 19),
            "F052": ("social-science", 17, 21),
            "F053": ("social-science", 17, 21),
            "F054": ("social-science", 21, 27),
            "F157": ("science", 35, 36),
            "F158": ("science", 36, 37),
            "F159": ("social-science", 16, 20),
            "F160": ("social-science", 9, 11),
            "F161": ("social-science", 40, 48),
        }
        for id, (subject, en_page, ta_page) in expected.items():
            with self.subTest(id=id):
                q = self.q[id]
                self.assertEqual(q["class_no"], 7)
                self.assertIn("/class-7-term-1-"+subject+"-english.pdf", q["source_link"])
                self.assertIn("/class-7-term-1-"+subject+"-tamil.pdf", q["source_ta_link"])
                self.assertEqual(q["source_pdf_page_en"], en_page)
                self.assertEqual(q["source_ta_pdf_page"], ta_page)
                self.assertIn("pending", q["review_status"])
                self.assertIn("2026", q["original_edition"])
                self.assertTrue(q["source_evidence_id"])
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)

    def test_source_grounded_answers_and_plausible_distractors(self):
        expected = {
            "F051": "Nagabhatta I",
            "F052": "1191",
            "F053": "Prithviraj Chauhan",
            "F054": "Qutb-ud-din Aibak",
            "F157": "Robert Boyle",
            "F158": "John Dalton",
            "F159": "Gopala",
            "F160": "Taj-ul-Ma'asir",
            "F161": "Razia Sultan",
        }
        for id, answer in expected.items():
            q = self.q[id]
            self.assertEqual(q["opts_en"][q["correct"]], answer)
            self.assertTrue(q["exp_en"])
            self.assertTrue(q["exp_ta"])
        self.assertNotIn("Rajputana", self.q["F053"]["opts_en"])
        self.assertNotIn("Chittor", self.q["F053"]["opts_en"])
        self.assertNotIn("James Tod", self.q["F054"]["opts_en"])
        self.assertIn("element", self.q["F157"]["q_en"])
        self.assertIn("one atom", self.q["F158"]["q_en"])
        self.assertIn("first official history", self.q["F160"]["q_en"])
        self.assertIn("Delhi Sultanate", self.q["F161"]["q_en"])
        self.assertTrue(self.q["F157"]["supplemental_source_link"].startswith("https://www.sciencehistory.org/"))
        self.assertTrue(self.q["F161"]["supplemental_source_link"].startswith("https://haryanatourism.gov.in/"))

    def test_bank_categories_and_honest_review_document(self):
        self.assertGreaterEqual(len(self.quiz["questions"]), 161)
        self.assertGreaterEqual(self.quiz["meta"]["version"], 16)
        counts = Counter(q["category"] for q in self.quiz["questions"])
        for label, baseline in {"history": 104, "women": 27, "science": 30}.items():
            self.assertGreaterEqual(counts[label], baseline)
        doc = (ROOT / "docs/textbook-quality/class7-term1-firsts-review-2026-11-01.md").read_text(encoding="utf-8")
        for marker in ("F051", "F052", "F053", "F054", "F157", "F158", "F159", "F160", "F161",
                       "428", "NOT fully certified", "2026–27", "41282538319"):
            self.assertIn(marker.casefold(), doc.casefold())


if __name__ == "__main__":
    unittest.main()
