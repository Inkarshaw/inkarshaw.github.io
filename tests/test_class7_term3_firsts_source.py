#!/usr/bin/env python3
"""Class 7 Term III factual-source links, honest provenance and scope checks."""
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class Class7TermIIIOriginalSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
        cls.manifest=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
        cls.items={q["id"]:q for q in cls.bank["questions"]}
        cls.docs=(ROOT/"docs/textbook-quality/class7-term3-firsts-review-2026-11-01.md").read_text(encoding="utf-8")

    def test_four_original_pdfs_total_500_text_pages_not_certified(self):
        volumes={x["id"]:x for x in self.manifest["volumes"]}
        cases=[
          ("c7-science-term3-original-audit",106,129,("F166","F167","F170")),
          ("c7-social-science-term3-original-audit",120,145,("F168","F169"))
        ]
        total=0
        for id,en,ta,ids in cases:
            with self.subTest(volume=id):
                item=volumes[id]
                self.assertEqual(item["class"],7)
                self.assertEqual(item["volume"],"term-3")
                self.assertEqual(item["full_original_english_tamil_pdf_pages"],{"english":en,"tamil":ta})
                self.assertEqual(item["full_original_english_tamil_pages_with_extractable_text"],{"english":en,"tamil":ta})
                self.assertEqual(item["reviewed_firsts_question_ids"],list(ids))
                for medium in ("english","tamil"):
                    self.assertEqual(len(item["original_pdf_sha256"][medium]),64)
                self.assertIn("selected",item["english_pdf_review"])
                self.assertIn("selected",item["tamil_pdf_review"])
                self.assertIn("2026",item["edition"])
                self.assertFalse(item["completely_certified"])
                self.assertFalse(item["manual_full_page_visual_review"])
                self.assertFalse(item["all_firsts_exhaustively_verified"])
                total+=en+ta
        self.assertEqual(total,500)

    def test_original_bilingual_fact_pages_exact(self):
        expected={
          "F166":("science",40,48,"Rohini RS-1"),
          "F167":("science",41,48,"Mars Orbiter Mission (Mangalyaan)"),
          "F168":("social-science",24,41,"Pataliputra"),
          "F169":("social-science",14,18,"Mahendravarman I"),
          "F170":("science",72,89,"Alexander Fleming"),
        }
        self.assertEqual(len(self.bank["questions"]),170)
        self.assertEqual(self.bank["meta"]["version"],18)
        self.assertEqual(Counter(q["category"] for q in self.bank["questions"]),
                         {"history":109,"science":34,"women":27})
        for id,(subject,en,ta,answer) in expected.items():
            with self.subTest(id=id):
                q=self.items[id]
                self.assertEqual(q["class_no"],7)
                self.assertIn("class-7-term-3-"+subject+"-english.pdf",q["source_link"])
                self.assertIn("class-7-term-3-"+subject+"-tamil.pdf",q["source_ta_link"])
                self.assertEqual(q["source_pdf_page_en"],en)
                self.assertEqual(q["source_ta_pdf_page"],ta)
                self.assertEqual(q["opts_en"][q["correct"]],answer)
                self.assertEqual(len(set(q["opts_en"])),4)
                self.assertEqual(len(set(q["opts_ta"])),4)
                self.assertIn("pending",q["review_status"])
                self.assertIn("2026",q["original_edition"])
                self.assertTrue(q["exp_ta"])
                self.assertTrue(q["exp_en"])
                self.assertIn("class7-term3",q["source_evidence_id"])

    def test_source_report_discloses_limits_and_disputed_firsts(self):
        for token in ("500","F166","F167","F168","F169","F170",
                      "Parkesine","2026–27","NOT","certified","231 candidate"):
            self.assertIn(token,self.docs)
        self.assertNotIn("complete_english_tamil_book_certified",self.bank["meta"]["certification_status"])

if __name__=="__main__":
    unittest.main()
