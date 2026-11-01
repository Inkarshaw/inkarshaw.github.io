#!/usr/bin/env python3
"""Class 6 Term III: original PDF source provenance, narrow factual claims, honest sign-off."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

class Class6Term3SourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
        cls.registry=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
        cls.byid={q["id"]:q for q in cls.bank["questions"]}

    def test_8_term3_original_pdf_fact_pointers(self):
        selected={
          "F042":("science",43,46),"F045":("social-science",123,136),
          "F046":("social-science",122,135),"F047":("social-science",37,40),
          "F048":("social-science",19,21),"F049":("science",9,17),
          "F155":("social-science",122,135),"F156":("social-science",118,131)}
        self.assertGreaterEqual(len(self.bank["questions"]),156)
        self.assertEqual(self.bank["meta"]["version"],15)
        for id,(title,en,ta) in selected.items():
            with self.subTest(id=id):
                q=self.byid[id]
                self.assertEqual(q["class_no"],6)
                self.assertIn("class-6-term-3-"+title,q["source_link"])
                self.assertIn("class-6-term-3-"+title,q["source_ta_link"])
                self.assertEqual(q["source_pdf_page_en"],en)
                self.assertEqual(q["source_ta_pdf_page"],ta)
                self.assertIn("pending",q["review_status"])

    def test_source_volume_counts_and_unfinished_certification(self):
        row={v["id"]:v for v in self.registry["volumes"]}
        for id,en,ta in [("c6-science-term3-2023-original-reprint",88,96),
                         ("c6-social-science-term3-2023-original-reprint",138,154)]:
            with self.subTest(id=id):
                v=row[id]
                self.assertEqual(v["pdf_pages"],{"english":en,"tamil":ta})
                self.assertEqual(v["pages_with_extractable_text"],v["pdf_pages"])
                self.assertEqual(len(v["original_pdf_sha256"]["english"]),64)
                self.assertEqual(len(v["original_pdf_sha256"]["tamil"]),64)
                self.assertFalse(v["complete_original_book_certification"])
                self.assertIn("pending",str(self.bank["meta"]["certification_status"]))
        doc=(ROOT/"docs/textbook-quality/class6-term3-firsts-review-2026-11-01.md").read_text(encoding="utf-8")
        for required in ("476", "NEITHER BOOK FULLY CERTIFIED", "F042", "F049", "F155", "F156", "2026–27"):
            self.assertIn(required,doc)

    def test_clear_choices_and_historical_qualifications(self):
        self.assertEqual(self.byid["F049"]["opts_en"],[
            "Indian mariners","Chinese mariners","European mariners","Egyptian mariners"])
        self.assertEqual(self.byid["F049"]["correct"],1)
        self.assertIn("1824",self.byid["F042"]["exp_en"])
        self.assertIn("Vasudeva Kanva",self.byid["F048"]["opts_en"])
        self.assertEqual(self.byid["F155"]["opts_en"][1],"Chennai Municipal Corporation")
        self.assertIn("municipality",self.byid["F046"]["q_en"].lower())
        self.assertIn("self-governing",self.byid["F156"]["q_en"])
        self.assertEqual(self.byid["F156"]["opts_en"][2],"New Zealand")
        self.assertIn("women.govt.nz",self.byid["F156"]["official_corrob_url"])

if __name__=="__main__":
    unittest.main()
