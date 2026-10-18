"""Gupta Unit 7 Quiz 16: editorial quality and historical attribution regressions."""
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit
DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-07.json").read_text(encoding="utf-8"))
QUESTIONS=DATA["questions"]
PART=QUESTIONS[300:320]

class GuptaQuiz16Tests(unittest.TestCase):
    def test_review_progress_and_source_count(self):
        self.assertEqual(len(QUESTIONS),492)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_prefix"],320)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_quizzes"],16)
        self.assertEqual(DATA["meta"]["source_records_before_editorial_curation"],1476)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"],984)
        self.assertEqual(len(PART),20)
        self.assertEqual(PART[0]["id"],"C11H07-Q901")
        self.assertEqual(PART[-1]["id"],"C11H07-Q958")
    def test_batch_audit(self):
        result=audit(QUESTIONS,start=300,count=20)
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
    def test_bilingual_quality(self):
        for q in PART:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertEqual(len(q["opts_en"]),4)
                self.assertEqual(len(q["opts_ta"]),4)
                self.assertEqual(len(set(q["opts_en"])),4)
                self.assertEqual(len(set(q["opts_ta"])),4)
                self.assertIn(q["opts_en"][q["correct"]],q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]],q["exp_ta"])
                self.assertNotIn("correct textbook answer for",q["q_en"].lower())
                self.assertGreaterEqual(len(q["exp_en"]),75)
                self.assertGreaterEqual(len(q["exp_ta"]),50)
    def test_ports_and_travel(self):
        self.assertEqual(PART[0]["opts_en"][PART[0]["correct"]],"Chaul")
        self.assertEqual(PART[6]["opts_en"][PART[6]["correct"]],"Tamralipti")
        self.assertIn("Fahien",PART[6]["exp_en"])
        self.assertIn("textbook",PART[1]["exp_en"])
    def test_trade_and_coins(self):
        expected={308:"Persia",309:"Arabia",310:"Byzantium",311:"Sri Lanka",
                  312:"China",313:"Southeast Asia",318:"Silk and other articles"}
        for ordinal,answer in expected.items():
            item=QUESTIONS[ordinal-1]
            self.assertEqual(item["opts_en"][item["correct"]],answer)
        self.assertIn("fewer silver and copper",QUESTIONS[318]["exp_en"])
        self.assertIn("decline",QUESTIONS[319]["exp_en"].lower())

if __name__=="__main__":
    unittest.main()
