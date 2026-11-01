#!/usr/bin/env python3
"""Class 10 SCERT original bilingual source and deliberately incomplete audit gates."""
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class Class10OriginalFirstsTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.bank=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
  cls.q={q["id"]:q for q in cls.bank["questions"]}
  manifest=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
  cls.sources={x["id"]:x for x in manifest["volumes"]}
  cls.review=(ROOT/"docs/textbook-quality/class10-original-firsts-review-2026-11-02.md").read_text(encoding="utf-8")

 def test_four_original_pdf_hashes_and_1432_text_pages_not_certified(self):
  cases=[
   ("c10-science-full-year-original-audit",360,360,["F106","F179","F180","F181","F182"]),
   ("c10-social-science-full-year-original-audit",344,368,["F110","F111","F112","F113","F115","F116"])
  ]
  total=0
  for id,en,ta,ids in cases:
   with self.subTest(book=id):
    book=self.sources[id]
    self.assertEqual(book["class"],10)
    self.assertEqual(book["volume"],"full-year")
    self.assertEqual(book["full_original_english_tamil_pdf_pages"],{"english":en,"tamil":ta})
    self.assertEqual(book["full_original_english_tamil_pages_with_extractable_text"],{"english":en,"tamil":ta})
    self.assertEqual(book["reviewed_firsts_question_ids"],ids)
    for medium in ("english","tamil"):
     self.assertEqual(len(book["original_pdf_sha256"][medium]),64)
     self.assertIn("not_complete",book[medium+"_pdf_review"])
    self.assertFalse(book["manual_full_page_visual_review"])
    self.assertFalse(book["all_firsts_exhaustively_verified"])
    self.assertFalse(book["completely_certified"])
    self.assertIn("2026",book["edition"])
    total+=en+ta
  self.assertEqual(total,1432)

 def test_class10_existing_references_and_new_claims(self):
  expected={
   "F106":("science",83,83,"Henri Becquerel"),
   "F110":("social-science",112,120,"T. Muthuswami Iyer"),
   "F111":("social-science",112,120,"P. Rangaiah"),
   "F112":("social-science",117,126,"Rukmani Lakshmipathi"),
   "F113":("social-science",117,126,"C. Rajagopalachari (Rajaji)"),
   "F115":("social-science",123,132,"Parithimar Kalaignar"),
   "F116":("social-science",201,212,"Karachi"),
   "F179":("science",93,92,"Apsara"),
   "F180":("science",93,92,"Tarapur Atomic Power Station"),
   "F181":("science",93,92,"Homi Jehangir Bhabha"),
   "F182":("science",262,259,"1952"),
  }
  for id,(subject,en,ta,answer) in expected.items():
   with self.subTest(id=id):
    q=self.q[id]
    self.assertEqual(q["class_no"],10)
    self.assertEqual(q["opts_en"][q["correct"]],answer)
    self.assertEqual(q["opts_ta"][q["correct"]],q["opts_ta"][q["correct"]].strip())
    self.assertEqual(q["source_pdf_page_en"],en)
    self.assertEqual(q["source_ta_pdf_page"],ta)
    self.assertIn("class-10-"+subject+"-english.pdf",q["source_link"])
    self.assertIn("class-10-"+subject+"-tamil.pdf",q["source_ta_link"])
    self.assertEqual(len(set(q["opts_en"])),4)
    self.assertEqual(len(set(q["opts_ta"])),4)
    self.assertTrue(q["q_en"] and q["q_ta"] and q["exp_en"] and q["exp_ta"])
    self.assertIn("pending",q["review_status"])
    self.assertIn("2026",q["original_edition"])
    self.assertIn("class10-original-bilingual",q["source_evidence_id"])

 def test_unfinished_current_book_equivalence_and_ambiguity_explicit(self):
  for id in ("F107","F108","F109","F114"):
   with self.subTest(id=id):
    q=self.q[id]
    self.assertNotEqual(q.get("source_evidence_id"),"class10-original-bilingual-selected-pages-2026-11-02")
  for token in ("F107","F108","F109","F114","Swadesamitran","AEC","BARC",
                "2026–27","1,432","NOT","F179","F180","F181","F182"):
   self.assertIn(token,self.review)

 def test_release_v21_182_questions(self):
  self.assertEqual(len(self.bank["questions"]),182)
  self.assertEqual(self.bank["meta"]["version"],21)
  self.assertEqual(self.bank["meta"]["count"],182)
  self.assertEqual(Counter(q["category"] for q in self.bank["questions"]),
                   {"women":27,"history":113,"science":42})

if __name__=="__main__":
 unittest.main()
