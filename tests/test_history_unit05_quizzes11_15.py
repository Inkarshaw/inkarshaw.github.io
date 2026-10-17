"""Class 11 History Unit 5 quizzes 11–15: bilingual and source-qualified QA.

Checks the committed 100-item editorial window and selected historical facts.
External textbook interpretation and translation fidelity remain human reviews.
"""
import json
from pathlib import Path
import re
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit

DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-05.json").read_text(encoding="utf-8"))
QUESTIONS=DATA["questions"]

def answer(n):
    q=QUESTIONS[n-1]
    return q["opts_en"][q["correct"]]


class UnitFiveQuizzes11To15Tests(unittest.TestCase):
    def test_review_metadata_and_stable_ids(self):
        self.assertEqual(len(QUESTIONS),348)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"],300)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"],15)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]),18)
        self.assertEqual(QUESTIONS[200]["id"],"C11H05-Q601")
        self.assertEqual(QUESTIONS[299]["id"],"C11H05-Q898")
        self.assertEqual(len(set(q["id"] for q in QUESTIONS)),348)
        self.assertTrue(all(q["type"]=="direct" for q in QUESTIONS))
        for n in range(10,15):
            self.assertEqual(len(QUESTIONS[n*20:(n+1)*20]),20)

    def test_audit_bilingual_window(self):
        result=audit(QUESTIONS,200,100)
        self.assertEqual(result["reviewed_quizzes"],"11–15")
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
        self.assertEqual(result["answer_positions"],{"A":25,"B":25,"C":25,"D":25})

    def test_competing_state_theories(self):
        self.assertEqual(answer(201),"Proper territorial association absent")
        self.assertEqual(answer(204),"Social differentiation is evident")
        self.assertEqual(answer(205),"Territorial associations are clear")
        self.assertEqual(answer(208),"Highway and Kaviripattinam port taxation")
        self.assertIn("debated",QUESTIONS[201]["exp_en"])
        self.assertIn("fiscal",QUESTIONS[207]["exp_en"].lower())

    def test_trade_and_craft_evidence(self):
        for n,v in {
            217:"Avaiyam",225:"Bronze vessels",232:"Kanchipuram",
            234:"Pattanam",235:"Maduraikanchi",237:"Manimekalai",
            238:"Vanikan",240:"Nigama",241:"Umanar",
            243:"Barter",244:"Circulated as bullion",
            247:"Roman amphora",248:"Roman glassware",249:"Coimbatore region",
        }.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),v)
        self.assertIn("legal tender",QUESTIONS[243]["exp_en"])

    def test_keeladi_ams_and_no_script_sample_conflation(self):
        self.assertEqual(answer(250),"Keeladi")
        self.assertEqual(answer(251),"Deccan College, Pune")
        self.assertEqual(answer(260),"Tamil-Brahmi")
        self.assertEqual(answer(261),"580 BCE")
        self.assertEqual(answer(262),"353 cm")
        self.assertEqual(answer(263),"Beta Analytic, Miami, Florida")
        self.assertEqual(answer(264),"1:4:6")
        self.assertIn("does not independently date every nearby",QUESTIONS[260]["exp_en"])
        self.assertIn("not be conflated",QUESTIONS[259]["exp_en"])
        self.assertIn("not a uniquely dated",QUESTIONS[263]["exp_en"])

    def test_fauna_weaving_and_material_culture(self):
        for n,v in {
            252:"Cow/Ox (Bos indicus)",253:"Buffalo (Bubalus bubalis)",
            254:"Sheep (Ovis aries)",255:"Goat (Capra hircus)",
            256:"Nilgai",257:"Blackbuck",258:"Wild boar",
            259:"Peacock",265:"180",266:"20",267:"Copper needle",
            268:"Agate",269:"Carnelian",271:"Arretine ware",
            274:"Over 4,000",275:"Iron nails and knife parts",
        }.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),v)

    def test_porunai_excavation_and_dates(self):
        for n,v in {
            277:"Thamirabarani",281:"Adichanallur",
            282:"1876",283:"Dr. Jagor",284:"Alexander Rea",
            285:"1899–1905",287:"2004",288:"2019–2021",
            289:"Korkai",290:"1968",291:"2020–2021",
            292:"Sivakalai",293:"2019",294:"1155 BCE",
            295:"Nearly 3,200 years",297:"Black-and-red ware",
            299:"Tamili / Tamil-Brahmi",300:"Gold diadem",
        }.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),v)
        self.assertIn("not an uncontested",QUESTIONS[277]["exp_en"])
        self.assertIn("not an entire civilisation",QUESTIONS[293]["exp_en"])
        self.assertIn("rounded interpretation",QUESTIONS[294]["exp_en"])

    def test_same_language_and_no_mechanical_stems(self):
        ids=set()
        for q in QUESTIONS[200:300]:
            with self.subTest(id=q["id"]):
                self.assertNotIn("What is the correct textbook answer for:",q["q_en"])
                self.assertNotIn("Which option is correctly associated with:",q["q_en"])
                self.assertNotRegex(q["exp_en"],r"[\u0B80-\u0BFF]")
                self.assertIn(q["opts_en"][q["correct"]],q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]],q["exp_ta"])
                self.assertEqual(len(set(q["opts_en"])),4)
                self.assertEqual(len(set(q["opts_ta"])),4)
                self.assertNotIn(q["id"],ids)
                ids.add(q["id"])


if __name__=="__main__":
    unittest.main()
