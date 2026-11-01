#!/usr/bin/env python3
"""Class 9 full-year original English/Tamil Firsts source QA without false certification."""
import json,unittest
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
class Class9FullYearOriginalSourceTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.quiz=json.loads((ROOT/"data/special-quizzes/firsts.json").read_text(encoding="utf-8"))
  cls.q={i["id"]:i for i in cls.quiz["questions"]}
  cls.manifest=json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
  cls.sources={i["id"]:i for i in cls.manifest["volumes"]}
  cls.report=(ROOT/"docs/textbook-quality/class9-original-firsts-review-2026-11-01.md").read_text(encoding="utf-8")
 def test_original_1336_pdf_pages_noncertified(self):
  cases=[("c9-science-full-year-original-audit",328,336,("F058","F177","F178")),("c9-social-science-full-year-original-audit",328,344,("F175","F176"))]
  total=0
  for id,en,ta,ids in cases:
   with self.subTest(id=id):
    x=self.sources[id]
    self.assertEqual(x["class"],9);self.assertEqual(x["volume"],"full-year")
    self.assertEqual(x["full_original_english_tamil_pdf_pages"],{"english":en,"tamil":ta})
    self.assertEqual(x["full_original_english_tamil_pages_with_extractable_text"],{"english":en,"tamil":ta})
    self.assertTrue(set(ids).issubset(set(x["reviewed_firsts_question_ids"])))
    self.assertFalse(x["completely_certified"])
    self.assertFalse(x["manual_full_page_visual_review"])
    self.assertFalse(x["all_firsts_exhaustively_verified"])
    for lang in ("english","tamil"):
     self.assertEqual(len(x["original_pdf_sha256"][lang]),64)
    self.assertIn("not_complete",x["english_pdf_review"])
    total+=en+ta
  self.assertEqual(total,1336)
 def test_5_bilingual_facts_original_pdf_page_provenance(self):
  expected={
   "F058":("science",33,34,"Evangelista Torricelli"),
   "F175":("social-science",15,14,"Robert Bruce Foote"),
   "F176":("social-science",88,91,"Minamoto no Yoritomo"),
   "F177":("science",77,77,"Ole Rømer"),
   "F178":("science",245,250,"Joseph E. Murray")
  }
  for id,(sub,en,ta,answer) in expected.items():
   with self.subTest(id=id):
    q=self.q[id]
    self.assertEqual(q["class_no"],9)
    self.assertEqual(q["source_pdf_page_en"],en)
    self.assertEqual(q["source_ta_pdf_page"],ta)
    self.assertIn("class-9-"+sub+"-english.pdf",q["source_link"])
    self.assertIn("class-9-"+sub+"-tamil.pdf",q["source_ta_link"])
    self.assertEqual(q["opts_en"][q["correct"]],answer)
    self.assertEqual(len(set(q["opts_en"])),4)
    self.assertEqual(len(set(q["opts_ta"])),4)
    self.assertTrue(q["exp_en"] and q["exp_ta"])
    self.assertIn("pending",q["review_status"])
 def test_older_12_history_sources_newer_en_but_tamil_pending(self):
  expected={"F122":10,"F123":11,"F124":32,"F125":111,"F126":126,"F127":125,"F128":125,"F129":141,"F130":141,"F131":145,"F132":139,"F133":139}
  for id,pdf_page in expected.items():
   with self.subTest(id=id):
    q=self.q[id]
    self.assertEqual(q["source_pdf_page_en"],pdf_page)
    self.assertIn("class-9-social-science-english.pdf",q["source_link"])
    self.assertIn("2022/08/TN-Board-Class-9-Social-Science",q["historical_source_link"])
    self.assertIn("pending",q["review_status"])
    self.assertEqual(q["original_medium_checked"],"English")
    self.assertIn("2025",q["newer_original_english_source_note"])
    if id!="F125":
     self.assertIsNone(q["source_ta_link"])
 def test_release_and_original_textbook_conflicts(self):
  self.assertEqual(len(self.quiz["questions"]),178)
  self.assertEqual(self.quiz["meta"]["version"],20)
  self.assertEqual(self.quiz["meta"]["count"],178)
  self.assertEqual(Counter(q["category"] for q in self.quiz["questions"]),{"women":27,"history":113,"science":38})
  self.assertIn("1956",self.q["F039"]["source_conflict_note"])
  self.assertIn("1957",self.q["F039"]["source_conflict_note"])
  self.assertEqual(self.q["F177"]["source_conflict"]["independently_verified_year"],"1676")
  for word in ("1,336","F175","F176","F177","F178","1956","1957","1665","1676","2026–27","not", "certifi"):
   self.assertIn(word.casefold(),self.report.casefold())
if __name__=="__main__":unittest.main()
