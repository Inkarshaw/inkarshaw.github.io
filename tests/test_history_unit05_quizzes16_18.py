"""Bilingual and historical regression checks for final 48 Class 11 Unit 5 MCQs.

The textbook's historical attribution and archaeological-dating caveats are retained.
These are targeted regressions, not a guarantee of every historical or linguistic claim.
"""
from pathlib import Path
import json
import re
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit

DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-05.json").read_text(encoding="utf-8"))
Q=DATA["questions"]

def answer(number):
    item=Q[number-1]
    return item["opts_en"][item["correct"]]


class UnitFiveFinalFortyEightTests(unittest.TestCase):
    def test_full_review_metadata_and_boundaries(self):
        self.assertEqual(len(Q),348)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"],348)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"],18)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]),18)
        self.assertEqual(len({item["id"] for item in Q}),348)
        self.assertTrue(all(item["type"]=="direct" for item in Q))
        self.assertEqual(Q[300]["id"],"C11H05-Q901")
        self.assertEqual(Q[347]["id"],"C11H05-Q1042")
        self.assertEqual(len(Q[300:320]),20)
        self.assertEqual(len(Q[320:340]),20)
        self.assertEqual(len(Q[340:348]),8)

    def test_final_partial_window_audit(self):
        result=audit(Q,300,48)
        self.assertEqual(result["reviewed_quizzes"],"16–18")
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
        self.assertEqual(result["answer_positions"],{"A":12,"B":12,"C":12,"D":12})

    def test_porunai_bronze_and_waterworks(self):
        expected={301:"High-tin bronze",302:"32",
                  303:"Brick structure with perforated terracotta pipes",
                  304:"29 courses",305:"9 courses",
                  306:"Foreign ceramics and black polished earthenware",
                  307:"Shell-bangle industry"}
        for n,correct in expected.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),correct)
        self.assertIn("precise function",Q[302]["exp_en"])
        self.assertIn("29 courses",Q[304]["exp_en"])

    def test_buddhism_jainism_with_distinct_sites(self):
        expected={308:"Spread of Buddhism",309:"Sanghamitta",
                  310:"Movement to Karnataka",311:"Satavahanas",
                  312:"Ikshvakus",313:"Had not yet taken root",
                  314:"Krishna and Godavari deltas",
                  315:"Amaravati",316:"Nagarjunakonda",
                  317:"Kaviripattinam",318:"Kanchipuram",
                  319:"More extensive than Buddhism",
                  320:"Cave shelters with Tamil-Brahmi inscriptions",
                  321:"Merchants and lay devotees",322:"Tamil literature"}
        for n,correct in expected.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),correct)
        self.assertIn("tradition",Q[309]["exp_en"].lower())
        self.assertIn("not imply",Q[307]["exp_en"].lower())
        self.assertIn("buddhist",Q[318]["exp_en"].lower())

    def test_kalabhra_interregnum_without_dark_age_assumption(self):
        expected={323:"c. 300–600 CE",324:"Interregnum / Dark Age",
                  325:"No longer accepted as correct",
                  326:"Tirukkural",327:"Eighteen Minor Works",
                  328:"Silappathikaram",329:"Manimekalai",
                  330:"Jainism and Buddhism",
                  331:"Transitional period toward enlarged state societies"}
        for n,correct in expected.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),correct)
        self.assertIn("no longer accepted",Q[324]["exp_en"].lower())
        self.assertNotIn("Pathinen Kilkanakku",Q[326]["opts_en"])
        self.assertIn("precise composition date",Q[325]["exp_en"])

    def test_pulangurichi_dating_and_scholarly_qualifications(self):
        expected={332:"Pallavas",333:"Pandyas",
                  334:"Vedic-Puranic revival through Saiva and Vaishnava Bhakti",
                  335:"Pulangurichi",336:"Mid-5th century CE",
                  337:"Chendan",338:"Kurran",
                  339:"Some scholars identify them as Kalabhra rulers",
                  340:"Third quarter of 6th century CE"}
        for n,correct in expected.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),correct)
        self.assertIn("other proposed dates",Q[335]["exp_en"].lower())
        self.assertIn("do not explicitly",Q[338]["exp_en"].lower())

    def test_summary_and_literary_sources(self):
        expected={341:"About 3rd century BCE",
                  342:"Use of script and written inscriptions/literature",
                  343:"Chiefdoms became Vendar kings",
                  344:"Buddhism and Jainism strong; Vedic ideas influenced rulers",
                  345:"Indian Ocean and Roman sea-borne trade",
                  346:"Cultural activities continued",
                  347:"Ethics and moral codes",
                  348:"Major agrarian territories, trade routes and towns"}
        for n,correct in expected.items():
            with self.subTest(n=n):
                self.assertEqual(answer(n),correct)
        self.assertIn("older archaeology",Q[340]["exp_en"].lower())
        self.assertIn("contradicts",Q[345]["exp_en"].lower())
    
    def test_two_language_alignment(self):
        for item in Q[300:]:
            with self.subTest(item=item["id"]):
                self.assertTrue(item["q_en"].endswith("?") and item["q_ta"].endswith("?"))
                self.assertEqual(len(item["opts_en"]),4)
                self.assertEqual(len(item["opts_ta"]),4)
                self.assertEqual(len(set(item["opts_en"])),4)
                self.assertEqual(len(set(item["opts_ta"])),4)
                self.assertIn(item["opts_en"][item["correct"]],item["exp_en"])
                self.assertIn(item["opts_ta"][item["correct"]],item["exp_ta"])
                self.assertFalse(re.search(r"[\u0B80-\u0BFF]",item["exp_en"]))


if __name__=="__main__":
    unittest.main()
