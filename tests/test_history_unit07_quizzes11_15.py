"""Source-aware English/Tamil regression suite: Class 11 Gupta Unit 7 quizzes 11–15.

Checks original questions 201–300, printed English textbook pages 95–97.
Factual checks are selective and cannot certify every textbook claim or
the project's specific 2025 Tamil translation.
"""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

DATA = json.loads((ROOT / "data/textbook/class-11/history/unit-07.json").read_text(encoding="utf-8"))
QUESTIONS = DATA["questions"]
BATCH = QUESTIONS[200:300]


class GuptaUnit7Quizzes11To15(unittest.TestCase):
    def answer(self, n):
        q = QUESTIONS[n-1]
        return q["opts_en"][q["correct"]]

    def test_counts_provenance_and_25_links(self):
        self.assertEqual(len(QUESTIONS), 492)
        self.assertEqual(DATA["meta"]["total_questions"], 492)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]), 25)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"], 300)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"], 15)
        self.assertEqual(DATA["meta"]["source_records_before_editorial_curation"], 1476)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"], 984)
        self.assertTrue(DATA["meta"]["positional_quiz_sets"])
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 492)
        self.assertEqual(len(QUESTIONS[480:]), 12)
        self.assertTrue(all(q["type"] == "direct" for q in QUESTIONS))
        self.assertEqual(QUESTIONS[200]["id"], "C11H07-Q601")
        self.assertEqual(QUESTIONS[299]["id"], "C11H07-Q898")

    def test_all_five_quizzes_have_20_distinct_records(self):
        for quiz in range(11, 16):
            with self.subTest(quiz=quiz):
                question_set = QUESTIONS[(quiz-1)*20:quiz*20]
                self.assertEqual(len(question_set), 20)
                self.assertEqual(len({q["id"] for q in question_set}), 20)

    def test_bilingual_audit_finds_no_quality_errors(self):
        outcome = audit(QUESTIONS, 200, 100)
        self.assertEqual(outcome["errors"], [])
        self.assertEqual(outcome["warnings"], [])
        self.assertEqual(outcome["reviewed_count"], 100)
        self.assertEqual(outcome["reviewed_quizzes"], "11–15")
        self.assertEqual(outcome["answer_positions"], {k:25 for k in "ABCD"})

    def test_natural_bilingual_mcqs_have_unique_relevant_options(self):
        for q in BATCH:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["opts_en"][q["correct"]], q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]], q["exp_ta"])
                self.assertGreaterEqual(len(q["exp_en"]), 75)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)
                self.assertNotIn("correct textbook answer for", q["q_en"].lower())

    def test_paharpur_land_register_and_land_categories(self):
        self.assertEqual(self.answer(217), "Paharpur copper plate")
        self.assertIn("complex rights", QUESTIONS[216]["exp_en"])
        self.assertEqual(self.answer(218), "Ustapala")
        self.assertIn("Pustapala", QUESTIONS[217]["exp_en"])
        self.assertEqual(self.answer(219), "Village accountant")
        categories = {220:"Cultivatable land", 221:"Waste land",
                      222:"Jungle or waste land", 223:"Habitable land",
                      224:"Pastoral land"}
        for n, expected in categories.items():
            with self.subTest(number=n):
                self.assertEqual(self.answer(n), expected)

    def test_irrigation_dyke_and_water_management_terms(self):
        self.assertEqual(self.answer(225), "Narada Smriti")
        self.assertEqual(self.answer(226), "Bardhya")
        self.assertEqual(self.answer(227), "Khara")
        self.assertEqual(self.answer(228), "Jalanirgamah")
        self.assertEqual(self.answer(229), "Amarasimha")
        self.assertEqual(self.answer(231), "Sudarsana Lake")
        self.assertIn("Girnar", QUESTIONS[230]["exp_en"])

    def test_gupta_taxes_and_grant_conditions(self):
        expected = {236:"King's customary one-sixth share of produce",
                    237:"Periodic supply of fruits, firewood, flowers etc.",
                    238:"Periodic tax on villagers, separate from annual land tax",
                    239:"Voluntary offering that later became compulsory and oppressive",
                    241:"An extra tax of uncertain purpose",
                    247:"Perpetual, hereditary, tax-free grant to Brahmins",
                    250:"Land endowment under trusteeship"}
        for n, val in expected.items():
            with self.subTest(number=n):
                self.assertEqual(self.answer(n), val)
        self.assertIn("debated", QUESTIONS[240]["exp_en"])
        self.assertIn("cash payment", QUESTIONS[241]["exp_en"])
        self.assertIn("income", QUESTIONS[252]["exp_en"])
        self.assertIn("first cultivation", QUESTIONS[253]["exp_en"])

    def test_mehrauli_corrosion_and_industrial_history(self):
        self.assertEqual(self.answer(260), "Mehrauli Iron Pillar")
        self.assertEqual(self.answer(261), "Qutb Minar Complex, Delhi")
        self.assertEqual(self.answer(262), "Survived centuries without rusting")
        self.assertIn("not literally free", QUESTIONS[261]["exp_en"])
        self.assertIn("protective film", QUESTIONS[261]["exp_en"])
        self.assertEqual(self.answer(270), "Sresti")
        self.assertEqual(self.answer(271), "Sarthavaha")

    def test_guilds_finance_and_western_port(self):
        self.assertEqual(self.answer(283), "Guilds")
        self.assertIn("not modern labour unions", QUESTIONS[282]["exp_en"])
        self.assertEqual(self.answer(287), "Narada and Brihaspati Smritis")
        self.assertEqual(self.answer(298), "Acted as banks")
        self.assertEqual(self.answer(299), "Lending money at exorbitant interest")
        self.assertEqual(self.answer(300), "Kalyan")
        self.assertIn("Maharashtra", QUESTIONS[299]["exp_en"])


if __name__ == "__main__":
    unittest.main()
