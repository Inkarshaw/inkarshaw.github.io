"""Regression safeguards for Class 11 History Unit 5 Quizzes 1–5.

These tests verify key interpretations and bilingual structure, not all facts
against the original Tamil and English textbook pages.
"""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit

BANK=json.loads((ROOT/"data/textbook/class-11/history/unit-05.json").read_text(encoding="utf-8"))
QUESTIONS=BANK["questions"]


class HistoryUnit5FirstFiveTests(unittest.TestCase):
    def test_source_curation_and_quiz_boundaries(self):
        self.assertEqual(len(QUESTIONS),348)
        self.assertEqual(BANK["meta"]["total_questions"],348)
        self.assertEqual(BANK["meta"]["source_records_before_editorial_curation"],1044)
        self.assertEqual(BANK["meta"]["generated_variants_removed"],696)
        self.assertEqual(BANK["meta"]["qa_reviewed_prefix"],100)
        self.assertEqual(BANK["meta"]["qa_reviewed_quizzes"],5)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]),18)
        self.assertEqual(len({q["id"] for q in QUESTIONS}),348)
        self.assertTrue(all(q["type"]=="direct" for q in QUESTIONS))
        self.assertEqual(QUESTIONS[0]["id"],"C11H05-Q001")
        self.assertEqual(QUESTIONS[99]["id"],"C11H05-Q298")
        for i in range(5):
            with self.subTest(quiz=i+1):
                self.assertEqual(len(QUESTIONS[i*20:(i+1)*20]),20)

    def test_quality_audit_100_bilingual(self):
        result=audit(QUESTIONS,0,100)
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
        self.assertEqual(result["reviewed_quizzes"],"1–5")
        self.assertEqual(result["answer_positions"],{"A":25,"B":25,"C":25,"D":25})

    def test_inscriptions_and_early_sites(self):
        expected={
            7:"Arikamedu",8:"Kodumanal",9:"Alagankulam",
            15:"Mangulam",16:"Jambai",17:"Pugalur",
            18:"Berenike",19:"Quseir al Qadhim",
        }
        for pos,value in expected.items():
            q=QUESTIONS[pos-1]
            with self.subTest(question=pos):
                self.assertEqual(q["opts_en"][q["correct"]],value)
                self.assertIn(value,q["exp_en"])
        self.assertNotIn("Myos Hormos",QUESTIONS[17]["opts_en"])
        self.assertIn("Satiyaputa",QUESTIONS[15]["exp_en"])

    def test_ashoka_southern_neighbours_and_edic_two(self):
        keys={65:"Rock Edict II",66:"Cholas",67:"Pandyas",
              68:"Cheras / Keralaputras",69:"Satiyaputra"}
        for n,v in keys.items():
            with self.subTest(n=n):
                self.assertEqual(QUESTIONS[n-1]["opts_en"][QUESTIONS[n-1]["correct"]],v)
        self.assertIn("independent",QUESTIONS[71]["exp_en"].lower())
        self.assertIn("humans and animals",QUESTIONS[69]["exp_en"].lower())

    def test_sangam_women_and_poetic_sources(self):
        q=QUESTIONS[40]
        self.assertEqual(q["opts_en"][q["correct"]],"Okkur Masaathiyar")
        self.assertIn("279",q["q_en"])
        self.assertIn("279",q["q_ta"])
        for n,value in {45:"Patitruppathu",46:"Paripadal",49:"Purananuru",58:"Pattinappalai"}.items():
            self.assertEqual(QUESTIONS[n-1]["opts_en"][QUESTIONS[n-1]["correct"]],value)
        self.assertIn("lost exemplar",QUESTIONS[32]["exp_en"])

    def test_satavahana_epigraphy_and_numismatics(self):
        keys={82:"Prathistan / Pratishthana",85:"Gautamiputra Satakarni",
              86:"Nahapana",88:"Gautami Balashri",89:"Nashik",
              93:"Asvamedha",94:"Vasishthiputra Pulumayi",
              95:"Yagnashri Satakarni"}
        for n,v in keys.items():
            with self.subTest(n=n):
                self.assertEqual(QUESTIONS[n-1]["opts_en"][QUESTIONS[n-1]["correct"]],v)
        self.assertIn("source claim",QUESTIONS[92]["exp_en"])
        self.assertIn("overstruck",QUESTIONS[86]["exp_en"])

    def test_prakrit_literary_attribution(self):
        keys={29:"Gatha Saptasati",97:"Hala",98:"Gaha Sattasai",
              99:"700",100:"Maharashtri Prakrit"}
        for n,v in keys.items():
            self.assertEqual(QUESTIONS[n-1]["opts_en"][QUESTIONS[n-1]["correct"]],v)
        self.assertIn("same traditional collection",QUESTIONS[97]["exp_en"])
        self.assertIn("compilation",QUESTIONS[96]["exp_en"])


if __name__=="__main__":
    unittest.main()
