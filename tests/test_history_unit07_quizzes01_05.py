"""Gupta Unit 7 first 100 bilingual MCQs, original ids and factual regressions.

Historical checks reflect a comparison with the Tamil Nadu Class 11 History
Unit 7 text and external epigraphic evidence from the Archaeological Survey
of India. They do not prove every Tamil translation or textbook statement.
"""
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit

DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-07.json").read_text(encoding="utf-8"))
Q=DATA["questions"]
FIRST=Q[:100]


class Unit7FirstHundredTests(unittest.TestCase):
    def test_original_records_and_catalogue_preserved(self):
        self.assertEqual(len(Q),492)
        self.assertEqual(DATA["meta"]["total_questions"],492)
        self.assertEqual(DATA["meta"]["source_records_before_editorial_curation"],1476)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"],984)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]),25)
        self.assertEqual(len({x["id"] for x in Q}),492)
        self.assertTrue(all(x["type"]=="direct" for x in Q))
        self.assertEqual(Q[0]["id"],"C11H07-Q001")
        self.assertEqual(Q[99]["id"],"C11H07-Q298")
        self.assertTrue(DATA["meta"]["positional_quiz_sets"])
        self.assertEqual(len(Q[480:]),12)

    def test_first_100_reviewed_in_five_complete_quizzes(self):
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_prefix"],100)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_quizzes"],5)
        for n in range(5):
            with self.subTest(quiz=n+1):
                self.assertEqual(len(Q[n*20:(n+1)*20]),20)

    def test_bilingual_audit_has_no_problems(self):
        a=audit(Q,0,100)
        self.assertEqual(a["errors"],[])
        self.assertEqual(a["warnings"],[])
        self.assertEqual(a["reviewed_count"],100)
        self.assertEqual(a["answer_positions"],{letter:25 for letter in "ABCD"})

    def test_all_revised_items_have_four_distinct_aligned_options(self):
        for item in FIRST:
            with self.subTest(id=item["id"]):
                self.assertTrue(item["q_en"].endswith("?") and item["q_ta"].endswith("?"))
                self.assertEqual(len(item["opts_en"]),4)
                self.assertEqual(len(item["opts_ta"]),4)
                self.assertEqual(len(set(item["opts_en"])),4)
                self.assertEqual(len(set(item["opts_ta"])),4)
                self.assertIn(item["opts_en"][item["correct"]],item["exp_en"])
                self.assertIn(item["opts_ta"][item["correct"]],item["exp_ta"])
                self.assertNotIn("correct textbook answer for",item["q_en"].lower())

    def test_mehrauli_pillar_attribution_corrected(self):
        item=Q[17]
        self.assertEqual(item["id"],"C11H07-Q052")
        self.assertEqual(item["opts_en"][item["correct"]],"Chandragupta II")
        self.assertEqual(item["opts_ta"][item["correct"]],"இரண்டாம் சந்திரகுப்தர்")
        self.assertIn("incorrectly labels",item["exp_en"])
        self.assertIn("பிழையாக",item["exp_ta"])
        self.assertIn("Chandragupta II",Q[16]["exp_en"])

    def test_samudragupta_pillar_gupta_brahmi_not_nagari(self):
        item=Q[22]
        self.assertEqual(item["id"],"C11H07-Q067")
        self.assertEqual(item["opts_en"][item["correct"]],"Gupta Brahmi")
        self.assertEqual(item["opts_ta"][item["correct"]],"குப்தர் கால பிராமி")
        self.assertIn("anachronistic",item["exp_en"])
        self.assertIn("காலப்பிழை",item["exp_ta"])
        self.assertIn("Nagari",item["opts_en"])

    def test_royal_succession_and_literary_source_context(self):
        self.assertEqual(Q[27]["opts_en"][Q[27]["correct"]],"Kumaradevi")
        self.assertEqual(Q[20]["opts_en"][Q[20]["correct"]],"Harisena")
        self.assertEqual(Q[31]["opts_en"][Q[31]["correct"]],"Kanchipuram")
        self.assertIn("not permanently annexed",Q[31]["exp_en"])

    def test_huna_claim_is_qualified_as_later_conflict(self):
        item=Q[90]
        self.assertEqual(item["opts_en"][item["correct"]],"Huns")
        self.assertIn("Skandagupta",item["exp_en"])
        self.assertIn("பாடநூல்",item["exp_ta"])
        self.assertIn("later",Q[67]["exp_en"])

    def test_navaratna_claim_not_asserted_as_contemporary_record(self):
        self.assertEqual(Q[98]["opts_en"][Q[98]["correct"]],"Navaratnas / nine jewels")
        self.assertIn("later literary tradition",Q[98]["exp_en"])
        self.assertIn("பிற்கால",Q[98]["exp_ta"])
        self.assertIn("traditionally",Q[99]["q_en"])

    def test_samudragupta_asvamedha_and_vina(self):
        self.assertEqual(Q[71]["opts_en"][Q[71]["correct"]],"Horse sacrifice / Asvamedha")
        self.assertEqual(Q[76]["opts_en"][Q[76]["correct"]],"Playing the vina")
        self.assertIn("coin",Q[76]["exp_en"].lower())


if __name__=="__main__":
    unittest.main()
