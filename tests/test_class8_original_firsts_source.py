#!/usr/bin/env python3
"""Class 8 bilingual original full-year source page and incomplete certification checks."""
import json,unittest
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Class8OriginalFirstsTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.bank=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
  cls.q={x["id"]:x for x in cls.bank["questions"]}
  cls.m=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
  cls.v={x["id"]:x for x in cls.m["volumes"]}
  cls.report=(ROOT/"docs/textbook-quality/class8-original-firsts-review-2026-11-01.md").read_text(encoding="utf-8")
 def test_four_original_pdfs_1152_text_pages_but_not_certified(self):
  cases=[
   ("c8-science-full-year-original-audit",288,304,["F036","F037","F038","F057","F171","F173"]),
   ("c8-social-science-full-year-original-audit",256,304,["F117","F118","F172","F174"]),
  ]
  n=0
  for id,en,ta,ids in cases:
   with self.subTest(id=id):
    x=self.v[id];n+=en+ta
    self.assertEqual(x["class"],8)
    self.assertEqual(x["volume"],"full-year")
    self.assertEqual(x["full_original_english_tamil_pdf_pages"],{"english":en,"tamil":ta})
    self.assertEqual(x["full_original_english_tamil_pages_with_extractable_text"],{"english":en,"tamil":ta})
    self.assertEqual(x["reviewed_firsts_question_ids"],ids)
    self.assertEqual(len(x["original_pdf_sha256"]["english"]),64)
    self.assertEqual(len(x["original_pdf_sha256"]["tamil"]),64)
    self.assertFalse(x["manual_full_page_visual_review"])
    self.assertFalse(x["all_firsts_exhaustively_verified"])
    self.assertFalse(x["completely_certified"])
    self.assertIn("not_complete",x["english_pdf_review"])
    self.assertIn("not_complete",x["tamil_pdf_review"])
  self.assertEqual(n,1152)
 def test_question_links_original_pages_and_bilingual(self):
  expected={
   "F036":("science",90,92,"Aryabhata"),
   "F037":("science",94,97,"Apollo 8"),
   "F038":("science",94,97,"Neil Armstrong"),
   "F057":("science",131,136,"James Chadwick"),
   "F117":("social-science",11,12,"Masulipatnam"),
   "F118":("social-science",12,13,"Masulipatnam"),
   "F171":("science",258,269,"Puducherry (Pondicherry)"),
   "F172":("social-science",25,28,"Satyendranath Tagore"),
   "F173":("science",54,56,"William Gilbert"),
   "F174":("social-science",11,11,"Francisco de Almeida"),
  }
  for id,(subject,en,ta,answer) in expected.items():
   with self.subTest(id=id):
    q=self.q[id]
    self.assertEqual(q["class_no"],8)
    self.assertEqual(q["source_pdf_page_en"],en)
    self.assertEqual(q["source_ta_pdf_page"],ta)
    self.assertIn("class-8-"+subject+"-english.pdf",q["source_link"])
    self.assertIn("class-8-"+subject+"-tamil.pdf",q["source_ta_link"])
    self.assertEqual(q["opts_en"][q["correct"]],answer)
    self.assertEqual(len(set(q["opts_en"])),4)
    self.assertEqual(len(set(q["opts_ta"])),4)
    self.assertTrue(q["exp_en"] and q["exp_ta"])
    self.assertIn("pending",q["review_status"])
 def test_class8_source_proofs_remain_after_later_releases(self):
  self.assertEqual(self.bank["meta"]["version"],19)
  self.assertGreaterEqual(self.bank["meta"]["count"],174)
  self.assertGreaterEqual(len(self.bank["questions"]),174)
  counts=Counter(q["category"] for q in self.bank["questions"])
  for category,min_count in {"women":27,"history":111,"science":36}.items():
   self.assertGreaterEqual(counts[category],min_count)
  for phrase in ("1,152","F171","F172","F173","F174","2026–27","NOT","certifi"):
   self.assertIn(phrase,self.report)
if __name__=="__main__":unittest.main()
