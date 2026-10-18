"""Regression checks for the last 56 History Unit 6 questions (Quizzes 12–14).

Structural and targeted factual assertions; historical judgment still requires
consulting both Tamil and English textbook editions and relevant scholarship.
"""
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-06.json").read_text(encoding="utf-8"))
Q=DATA["questions"]
FINAL=Q[220:]


class Unit6FinalReviewTests(unittest.TestCase):
    def test_preserve_metadata_and_all_quiz_links(self):
        self.assertEqual(len(Q),276)
        self.assertEqual(DATA["meta"]["total_questions"],276)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"],276)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"],14)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]),14)
        self.assertTrue(DATA["meta"]["positional_quiz_sets"])
        self.assertEqual(len(Q[220:240]),20)
        self.assertEqual(len(Q[240:260]),20)
        self.assertEqual(len(Q[260:]),16)
        self.assertEqual(len({v["id"] for v in Q}),276)
        self.assertTrue(all(v["type"]=="direct" for v in Q))

    def test_final_56_audit_and_partial_tail(self):
        result=audit(Q,start=220,count=56)
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
        self.assertEqual(result["reviewed_count"],56)
        self.assertEqual(result["reviewed_quizzes"],"12–14")
        self.assertEqual(sum(result["answer_positions"].values()),56)
        self.assertEqual(audit(Q,start=260,count=16)["reviewed_quizzes"],"14–14")

    def test_incomplete_middle_batch_fails(self):
        with self.assertRaisesRegex(ValueError,"20-question"):
            audit(Q,start=220,count=55)

    def test_each_item_is_bilingual_distinct_and_explained(self):
        for item in FINAL:
            with self.subTest(id=item["id"]):
                self.assertTrue(item["q_en"].strip().endswith("?"))
                self.assertTrue(item["q_ta"].strip().endswith("?"))
                self.assertEqual(len(item["opts_en"]),4)
                self.assertEqual(len(item["opts_ta"]),4)
                self.assertEqual(len({x.strip().lower() for x in item["opts_en"]}),4)
                self.assertEqual(len({x.strip() for x in item["opts_ta"]}),4)
                self.assertIn(item["opts_en"][item["correct"]],item["exp_en"])
                self.assertIn(item["opts_ta"][item["correct"]],item["exp_ta"])
                self.assertNotIn("correct textbook answer for",item["q_en"].lower())
                self.assertGreaterEqual(len(item["exp_en"]),75)
                self.assertGreaterEqual(len(item["exp_ta"]),50)

    def test_trade_imports_and_numismatic_precision(self):
        expected={221:"Coins",222:"Topaz",223:"Antimony",224:"Coral",
                  225:"Crude glass",226:"Copper",227:"Tin",228:"Lead",229:"Wine"}
        for ordinal,value in expected.items():
            with self.subTest(ordinal=ordinal):
                x=Q[ordinal-1]
                self.assertEqual(x["opts_en"][x["correct"]],value)
                self.assertIn(value,x["exp_en"])

    def test_tiberius_dating_anachronism_explicitly_qualified(self):
        a,b=Q[230],Q[231]
        self.assertEqual(a["opts_en"][a["correct"]],"Tiberius")
        self.assertEqual(b["opts_en"][b["correct"]],"Second half of 1st century CE")
        for record in (a,b):
            self.assertIn("37 CE",record["exp_en"])
            self.assertIn("37",record["exp_ta"])
        self.assertIn("chronologically inconsistent",b["exp_en"])

    def test_rome_outflow_is_attributed_estimate_not_proven_audit(self):
        record=Q[232]
        self.assertEqual(record["opts_en"][record["correct"]],"55 million sesterces")
        self.assertIn("estimate",record["exp_en"])
        self.assertIn("மதிப்பீடு",record["exp_ta"])
        self.assertEqual(Q[233]["opts_en"][Q[233]["correct"]],"Vespasian")

    def test_foreign_merchants_literary_description_contextualised(self):
        record=Q[248]
        self.assertEqual(record["opts_en"][record["correct"]],"Hard-eyed")
        self.assertIn("literary",record["exp_en"])
        self.assertIn("modern",record["exp_en"])
        self.assertIn("இன்றைய",record["exp_ta"])
        self.assertIn("not solely ethnic Greeks",Q[249]["exp_en"])

    def test_salt_barter_versus_monetisation(self):
        values={258:"Salt merchants",259:"Salt exchanged for other goods",
                260:"Money",261:"Roman coins",
                262:"Increase money supply in circulation",
                263:"Amaravati river"}
        for ordinal,expected in values.items():
            with self.subTest(ordinal=ordinal):
                item=Q[ordinal]
                self.assertEqual(item["opts_en"][item["correct"]],expected)
        self.assertIn("barter",Q[259]["exp_en"].lower())
        self.assertIn("modern forgeries",Q[262]["exp_en"])

    def test_terminal_kushana_and_prosperity_facts(self):
        expected={266:"Kanishka",268:"Great expansion of trade",
                  269:"China",270:"Mediterranean world",
                  272:"Urban excavations and Tamil poetry",
                  274:"Satrap system",275:"Royal patronage"}
        for idx,answer in expected.items():
            with self.subTest(idx=idx):
                item=Q[idx]
                self.assertEqual(item["opts_en"][item["correct"]],answer)
        self.assertIn("northern and southern India", Q[268]["exp_en"])
        self.assertTrue(Q[-1]["exp_ta"])

if __name__=="__main__":
    unittest.main()
