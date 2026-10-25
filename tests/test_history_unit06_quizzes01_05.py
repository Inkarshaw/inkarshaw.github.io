"""Bilingual structure and selected historical regressions for History Unit 6 Quizzes 1–5.

The associated source comparison uses the TN Class 11 History Unit 6 chapter
(printed pp. 77–80) and a cross-check of Ashoka's edict XIII. Automated
assertions do not independently establish the historical accuracy of every item.
"""
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

DATA = json.loads((ROOT / "data/textbook/class-11/history/unit-06.json").read_text(encoding="utf-8"))
QUESTIONS = DATA["questions"]
FIRST = QUESTIONS[:100]


class HistoryUnit06QuizzesOneToFive(unittest.TestCase):
    def test_generated_association_and_statement_variants_excluded(self):
        self.assertEqual(DATA["meta"]["source_records_before_editorial_curation"], 828)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"], 552)
        self.assertEqual(DATA["meta"]["total_questions"], 276)
        self.assertEqual(len(QUESTIONS), 276)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]), 14)
        self.assertTrue(all(q["type"] == "direct" for q in QUESTIONS))
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 276)
        self.assertEqual(QUESTIONS[0]["id"], "C11H06-Q001")
        self.assertEqual(QUESTIONS[99]["id"], "C11H06-Q298")

    def test_first_five_quizzes_are_fully_reviewed(self):
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_prefix"], 100)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_quizzes"], 5)
        for quiz in range(1, 6):
            with self.subTest(quiz=quiz):
                self.assertEqual(len(QUESTIONS[(quiz-1)*20:quiz*20]), 20)

    def test_quality_gate_has_no_errors_or_warnings(self):
        outcome = audit(QUESTIONS, 0, 100)
        self.assertEqual(outcome["errors"], [])
        self.assertEqual(outcome["warnings"], [])
        self.assertEqual(outcome["reviewed_quizzes"], "1–5")
        self.assertEqual(outcome["answer_positions"], {k: 25 for k in "ABCD"})

    def test_english_and_tamil_explanations_and_distractors(self):
        for item in FIRST:
            with self.subTest(id=item["id"]):
                self.assertTrue(item["q_en"].endswith("?"))
                self.assertTrue(item["q_ta"].endswith("?"))
                self.assertEqual(len(item["opts_en"]), 4)
                self.assertEqual(len(item["opts_ta"]), 4)
                self.assertEqual(len(set(item["opts_en"])), 4)
                self.assertEqual(len(set(item["opts_ta"])), 4)
                self.assertIn(item["opts_en"][item["correct"]], item["exp_en"])
                self.assertIn(item["opts_ta"][item["correct"]], item["exp_ta"])
                self.assertNotIn("correct textbook answer for", item["q_en"].lower())

    def test_ashokan_hellenistic_rulers_and_disputed_alexander(self):
        self.assertEqual(QUESTIONS[22]["opts_en"][QUESTIONS[22]["correct"]], "Rock Edict XIII")
        self.assertEqual(QUESTIONS[23]["opts_en"][QUESTIONS[23]["correct"]], "Antiochus II Theos")
        self.assertEqual(QUESTIONS[24]["opts_en"][QUESTIONS[24]["correct"]], "Ptolemy II Philadelphus")
        self.assertEqual(QUESTIONS[25]["opts_en"][QUESTIONS[25]["correct"]], "Antigonus Gonatas")
        self.assertEqual(QUESTIONS[26]["opts_en"][QUESTIONS[26]["correct"]], "Magas of Cyrene")
        self.assertEqual(QUESTIONS[27]["opts_en"][QUESTIONS[27]["correct"]], "Alexander of Corinth")
        self.assertIn("Alexander II of Epirus", QUESTIONS[27]["exp_en"])
        self.assertIn("எபிரஸின்", QUESTIONS[27]["exp_ta"])
        self.assertIn("According to this Tamil Nadu textbook", QUESTIONS[27]["q_en"])

    def test_demetrioi_are_not_presented_as_certain_same_ruler(self):
        self.assertEqual(QUESTIONS[47]["opts_en"][QUESTIONS[47]["correct"]], "Demetrius")
        self.assertEqual(QUESTIONS[48]["opts_en"][QUESTIONS[48]["correct"]], "Demetrius II")
        self.assertIn("probably", QUESTIONS[48]["exp_en"])
        self.assertIn("qualified", QUESTIONS[48]["q_en"])

    def test_menander_and_heliodorus_documentary_facts(self):
        expected = {60: "c. 165/145–130 BCE", 65: "Hathigumpha inscription",
                    69: "Milinda-panha", 70: "Nagasena",
                    73: "Heliodorus", 74: "Bhagabhadra",
                    75: "Garuda-dhvaja", 78: "Vidisha, Madhya Pradesh"}
        for idx, value in expected.items():
            with self.subTest(item=idx+1):
                self.assertEqual(QUESTIONS[idx]["opts_en"][QUESTIONS[idx]["correct"]], value)
        self.assertIn("a historical reconstruction", QUESTIONS[66]["exp_en"])
        self.assertIn("Nagasena", QUESTIONS[69]["exp_en"])

    def test_saka_migration_and_satrap_titles(self):
        expected = {80: "Pahlavis", 81: "Yueh-chi / Yuezhi",
                    89: "Maues / Moa / Moga", 92: "Azes",
                    96: "Kshatrapas / satraps", 97: "Mahakshatrapa",
                    98: "Rudradaman", 99: "130–150 CE"}
        for idx, value in expected.items():
            with self.subTest(item=idx+1):
                self.assertEqual(QUESTIONS[idx]["opts_en"][QUESTIONS[idx]["correct"]], value)
        self.assertIn("Junagadh", QUESTIONS[98]["exp_en"])


if __name__ == "__main__":
    unittest.main()
