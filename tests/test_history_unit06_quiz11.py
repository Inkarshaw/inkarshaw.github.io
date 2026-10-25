"""Regression tests for a reviewed 20-question History Unit 6 Quiz 11 batch."""
import json
from pathlib import Path
import unittest
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit
DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-06.json").read_text(encoding="utf-8"))
Q=DATA["questions"]

class Unit6Quiz11Tests(unittest.TestCase):
    def test_count_and_metadata(self):
        self.assertEqual(len(Q),276)
        self.assertEqual(DATA["meta"]["total_questions"],276)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_prefix"],220)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_quizzes"],11)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]),14)
        self.assertEqual(len(Q[200:220]),20)
    def test_quality_gate(self):
        outcome=audit(Q,200,20)
        self.assertEqual(outcome["errors"],[])
        self.assertEqual(outcome["warnings"],[])
    def test_ports(self):
        self.assertEqual(Q[204]["opts_en"][Q[204]["correct"]],"Kodungallur")
        self.assertEqual(Q[205]["opts_en"][Q[205]["correct"]],"Pattanam")
        self.assertIn("debated",Q[205]["exp_en"])
        self.assertEqual(Q[206]["opts_en"][Q[206]["correct"]],"Muziris papyrus")
    def test_rice_fish_and_pepper_gold(self):
        self.assertEqual(Q[207]["opts_en"][Q[207]["correct"]],"Rice exchanged for fish")
        self.assertEqual(Q[208]["opts_en"][Q[208]["correct"]],"Pepper exchanged for gold")
        self.assertIn("பண்டமாற்ற",Q[207]["exp_ta"])
    def test_bilingual_and_options(self):
        for x in Q[200:220]:
            with self.subTest(id=x["id"]):
                self.assertTrue(x["q_en"].endswith("?") and x["q_ta"].endswith("?"))
                self.assertEqual(len(set(x["opts_en"])),4)
                self.assertEqual(len(set(x["opts_ta"])),4)
                self.assertIn(x["opts_en"][x["correct"]],x["exp_en"])
                self.assertIn(x["opts_ta"][x["correct"]],x["exp_ta"])
                self.assertNotIn("correct textbook answer for",x["q_en"].lower())
if __name__=="__main__":
    unittest.main()
