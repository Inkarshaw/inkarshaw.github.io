#!/usr/bin/env python3
"""Class 7 Term II original bilingual textbook source evidence, not full-book signoff."""
import json
import unittest
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]


class Class7Term2OriginalEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
        cls.questions={q["id"]:q for q in cls.bank["questions"]}
        m=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
        cls.volumes={v["id"]:v for v in m["volumes"]}
        cls.report=(ROOT/"docs/textbook-quality/class7-term2-firsts-review-2026-11-01.md").read_text(encoding="utf-8")

    def test_four_original_pdfs_in_two_books_and_honest_status(self):
        expected={
            "c7-science-term2-2024-reprint":((97,114),("F050","F162")),
            "c7-social-science-term2-2024-reprint":((89,104),("F055","F163","F164","F165")),
        }
        total=0
        for id,(pages,questions) in expected.items():
            with self.subTest(book=id):
                v=self.volumes[id]
                self.assertEqual(v["class"],7)
                self.assertEqual(v["volume"],"term-2")
                self.assertEqual(v["full_original_english_tamil_pdf_pages"],dict(zip(("english","tamil"),pages)))
                self.assertEqual(v["full_original_english_tamil_pages_with_extractable_text"],dict(zip(("english","tamil"),pages)))
                self.assertEqual(v["fact_checks_selected"],list(questions))
                self.assertFalse(v["completely_certified"])
                self.assertFalse(v["manual_full_page_visual_review"])
                self.assertFalse(v["all_firsts_exhaustively_verified"])
                self.assertIn("2026",v["edition"])
                for medium in ("english","tamil"):
                    self.assertEqual(len(v["original_pdf_sha256"][medium]),64)
                    self.assertIn("class-7-term-2-",v[medium+"_url"])
                total+=sum(pages)
        self.assertEqual(total,404)
        self.assertIn("404/404",self.report)
        self.assertIn("NOT certified",self.report)

    def test_six_firsts_have_selected_bilingual_original_page_evidence(self):
        expected={
            "F050":("science",17,19,"Calcutta Electric Supply Corporation Limited"),
            "F055":("social-science",9,11,"Alauddin Hasan Gangu"),
            "F162":("science",24,27,"Alessandro Volta"),
            "F163":("social-science",5,5,"Harihara and Bukka"),
            "F164":("social-science",17,20,"Babur"),
            "F165":("social-science",25,30,"Akbar"),
        }
        for id,(subject,en,ta,answer) in expected.items():
            with self.subTest(question=id):
                q=self.questions[id]
                self.assertEqual(q["class_no"],7)
                self.assertIn("class-7-term-2-"+subject+"-english.pdf",q["source_link"])
                self.assertIn("class-7-term-2-"+subject+"-tamil.pdf",q["source_ta_link"])
                self.assertEqual(q["source_pdf_page_en"],en)
                self.assertEqual(q["source_ta_pdf_page"],ta)
                self.assertIn("pending",q["review_status"])
                self.assertIn("2026",q["original_edition"])
                self.assertTrue(q["source_evidence_id"])
                self.assertEqual(q["opts_en"][q["correct"]],answer)
                self.assertEqual(len(q["opts_en"]),4)
                self.assertEqual(len(q["opts_ta"]),4)
                self.assertTrue(q["exp_en"])
                self.assertTrue(q["exp_ta"])

    def test_current_bank_counts_and_documented_pending_checks(self):
        self.assertEqual(self.bank["meta"]["version"],17)
        self.assertGreaterEqual(self.bank["meta"]["count"],165)
        self.assertGreaterEqual(len(self.bank["questions"]),165)
        self.assertEqual(Counter(q["category"] for q in self.bank["questions"]),
                         {"history":109,"women":27,"science":34})
        for item in ("F050","F055","F162","F163","F164","F165","2026–27","115 candidate lines"):
            self.assertIn(item,self.report)

if __name__=="__main__":
    unittest.main()
