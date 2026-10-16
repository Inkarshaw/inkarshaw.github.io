"""Class 11 History Unit 5 Quizzes 6–10 factual and bilingual regression safeguards.

The tests guard documented editorial corrections, source-qualified traditions and
key alignment. They do not establish every historical assertion independently.
"""
import json
from pathlib import Path
import re
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit

data=json.loads((ROOT/"data/textbook/class-11/history/unit-05.json").read_text(encoding="utf-8"))
qs=data["questions"]

def keyed(n):
    q=qs[n-1]
    return q["opts_en"][q["correct"]]


class UnitFiveQuizzesSixToTen(unittest.TestCase):
    def test_review_metadata_and_continuity(self):
        self.assertEqual(len(qs),348)
        self.assertEqual(len(data["meta"]["quiz_sets"]),18)
        self.assertEqual(data["meta"]["qa_reviewed_prefix"],200)
        self.assertEqual(data["meta"]["qa_reviewed_quizzes"],10)
        self.assertEqual(qs[100]["id"],"C11H05-Q301")
        self.assertEqual(qs[199]["id"],"C11H05-Q598")
        self.assertEqual(len(set(q["id"] for q in qs)),348)
        self.assertTrue(all(q["type"]=="direct" for q in qs))
        for i in range(5,10):
            with self.subTest(quiz=i+1):
                self.assertEqual(len(qs[i*20:(i+1)*20]),20)

    def test_100_question_bilingual_audit(self):
        result=audit(qs,100,100)
        self.assertEqual(result["reviewed_quizzes"],"6–10")
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
        self.assertEqual(result["answer_positions"],{"A":25,"B":25,"C":25,"D":25})

    def test_deccan_successor_and_epigraphy(self):
        for n,expected in {
            102:"3rd century CE",103:"Ikshvakus",104:"Pallavas",
            105:"Kadambas",108:"Naneghat inscription",
            111:"First big state covering much of Deccan",
        }.items():
            with self.subTest(question=n):
                self.assertEqual(keyed(n),expected)
        self.assertIn("precise epigraphic attribution",qs[107]["exp_en"])
        self.assertNotIn("Pallavas of Kanchi's earlier line",qs[103]["opts_en"])
        self.assertTrue("trade" in qs[112]["exp_en"].lower() or "exchange" in qs[112]["exp_en"].lower())

    def test_sangam_chronology_and_chola(self):
        for n,expected in {
            114:"Last 3 centuries BCE and first 3 centuries CE",
            117:"Three crowned kings",121:"Athiyaman",
            124:"Uraiyur",125:"Puhar / Kaviripattinam",
            126:"Tiger",127:"Pattinappalai",
            129:"Karikalan",131:"Battle of Venni",132:"Eleven",
        }.items():
            with self.subTest(question=n):
                self.assertEqual(keyed(n),expected)
        self.assertIn("literary tradition",qs[131]["exp_en"])

    def test_chera_caveats_and_political_sources(self):
        for n,expected in {
            138:"Vanji",141:"Karur",142:"Tiruvanchikkalam",
            143:"Poraiya branch",144:"Patitruppathu",
            146:"Pugalur",151:"Silappathikaram",
            152:"Not mentioned in Sangam poems",
            153:"56 years",155:"Bow and arrow",
        }.items():
            with self.subTest(question=n):
                self.assertEqual(keyed(n),expected)
        self.assertIn("not a contemporary",qs[150]["exp_en"].lower())
        self.assertIn("not",qs[151]["exp_en"].lower())

    def test_pandya_sites_and_source_dates(self):
        for n,expected in {
            156:"Madurai",157:"Korkai",158:"Thampraparani",
            159:"Pearl fishery and chank diving",160:"Kolkoi",
            161:"Fish",165:"Mangulam inscription",
            169:"Velvikkudi copper plates",170:"8th century CE",
            172:"Talaiyalanganam",
        }.items():
            with self.subTest(question=n):
                self.assertEqual(keyed(n),expected)
        self.assertIn("retrospective",qs[167]["exp_en"].lower())
        self.assertIn("eighth century CE",qs[169]["exp_en"])

    def test_ecozones_and_local_power(self):
        for n,expected in {
            181:"Paratavar",182:"Hilly region; hunting and gathering",
            183:"Forested region; pastoralism with shifting cultivation",
            184:"Riverine tract; plough agriculture and irrigation",
            185:"Coastal land; fishing and salt making",
            186:"Parched land; cattle lifting and robbery",
            187:"Five",188:"Kizhar",189:"Velir",190:"Vendar",191:"Nadu",
            197:"Cattle capture",
        }.items():
            with self.subTest(question=n):
                self.assertEqual(keyed(n),expected)

    def test_scholarship_qualifications_and_language(self):
        self.assertEqual(keyed(198),"Well-organised state society")
        self.assertEqual(keyed(199),"Pre-state chiefdoms")
        self.assertEqual(keyed(200),"No clear social stratification")
        self.assertIn("competing",qs[197]["exp_en"].lower())
        self.assertIn("counter-arguments",qs[199]["exp_en"].lower())
        for q in qs[100:200]:
            with self.subTest(question=q["id"]):
                self.assertIsNone(re.search(r"[\u0b80-\u0bff]",q["exp_en"]))
                self.assertIn(q["opts_en"][q["correct"]],q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]],q["exp_ta"])


if __name__=="__main__":
    unittest.main()
