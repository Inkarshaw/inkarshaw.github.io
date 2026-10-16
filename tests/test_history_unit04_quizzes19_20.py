"""Final editorial regressions for History Unit 4 Quizzes 19–20 (34 bilingual MCQs)."""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

DATA=json.loads((ROOT/"data/textbook/class-11/history/unit-04.json").read_text(encoding="utf-8"))
QUESTIONS=DATA["questions"]


class FinalHistoryUnit4Tests(unittest.TestCase):
    def test_every_unit_four_record_is_playable(self):
        self.assertEqual(len(QUESTIONS),394)
        self.assertEqual(DATA["meta"]["total_questions"],394)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"],394)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"],20)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]),20)
        self.assertEqual(len(QUESTIONS[360:380]),20)
        self.assertEqual(len(QUESTIONS[380:]),14)
        self.assertEqual(len({q["id"] for q in QUESTIONS}),394)

    def test_final_partial_quiz_audit_is_supported(self):
        result=audit(QUESTIONS,start=360,count=34)
        self.assertEqual(result["reviewed_quizzes"],"19–20")
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["warnings"],[])
        self.assertEqual(sum(result["answer_positions"].values()),34)

    def test_incomplete_middle_quiz_is_still_rejected(self):
        with self.assertRaisesRegex(ValueError,"20-question"):
            audit(QUESTIONS,start=320,count=34)
        with self.assertRaisesRegex(ValueError,"20-question"):
            audit(QUESTIONS,start=361,count=33)

    def test_pataliputra_facts_and_no_mixed_number_types(self):
        expected={364:"Pataliputra",365:"Ganga and Son",366:"Parallelogram",
                  367:"More than 14 km",368:"About 2 km",369:"Wood",370:"64",
                  371:"570",372:"Defence and sewage outlet",373:"30"}
        for ordinal,answer in expected.items():
            with self.subTest(ordinal=ordinal):
                q=QUESTIONS[ordinal-1]
                self.assertEqual(q["opts_en"][q["correct"]],answer)
                self.assertIn(answer,q["exp_en"])
        self.assertIn("six committees of five",QUESTIONS[372]["exp_en"])

    def test_languages_and_qualifications(self):
        self.assertEqual(QUESTIONS[375]["opts_en"][QUESTIONS[375]["correct"]],"Panini")
        self.assertEqual(QUESTIONS[376]["opts_en"][QUESTIONS[376]["correct"]],"Katyayana")
        self.assertIn("conventional dating",QUESTIONS[375]["exp_en"])
        self.assertIn("traditional",QUESTIONS[376]["exp_en"])
        self.assertIn("Prakrit",QUESTIONS[377]["exp_en"])
        self.assertIn("later",QUESTIONS[388]["exp_en"])
        self.assertIn("conventional",QUESTIONS[390]["exp_en"])

    def test_final_sunga_transition(self):
        facts={390:"Brihadratha",391:"185 BCE",392:"Pushyamitra Sunga",
               393:"Sunga dynasty",394:"Over one hundred years"}
        for ordinal,answer in facts.items():
            with self.subTest(ordinal=ordinal):
                q=QUESTIONS[ordinal-1]
                self.assertEqual(q["opts_en"][q["correct"]],answer)
                self.assertTrue(q["opts_ta"][q["correct"]])
                self.assertGreater(len(q["exp_ta"]),50)

    def test_no_generic_stems_in_last_34(self):
        for q in QUESTIONS[360:]:
            self.assertNotIn("textbook answer for",q["q_en"].lower())
            self.assertEqual(len(q["opts_en"]),4)
            self.assertEqual(len(q["opts_ta"]),4)
            self.assertTrue(q["q_en"].endswith("?"))
            self.assertTrue(q["q_ta"].endswith("?"))


if __name__=="__main__":
    unittest.main()
