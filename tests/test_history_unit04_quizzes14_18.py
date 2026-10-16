"""Regression checks for the 100-question History Unit 4 editorial batch (Quizzes 14–18).

These tests guard verified facts and bilingual structure, but cannot substitute
for continued editorial review against the primary textbook and original Tamil.
"""
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

BANK = json.loads((ROOT / "data/textbook/class-11/history/unit-04.json").read_text(encoding="utf-8"))
QUESTIONS = BANK["questions"]
REVIEWED = QUESTIONS[260:360]


class HistoryUnit04Quiz14To18Tests(unittest.TestCase):
    def test_exactly_five_complete_quizzes_and_stable_metadata(self):
        self.assertEqual(len(QUESTIONS), 394)
        self.assertEqual(BANK["meta"]["total_questions"], 394)
        self.assertEqual(BANK["meta"]["qa_reviewed_prefix"], 360)
        self.assertEqual(BANK["meta"]["qa_reviewed_quizzes"], 18)
        self.assertEqual(len(REVIEWED), 100)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]), 20)
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 394)
        for quiz_number in range(14, 19):
            with self.subTest(quiz=quiz_number):
                items = QUESTIONS[(quiz_number-1)*20:quiz_number*20]
                self.assertEqual(len(items), 20)
                self.assertTrue(all(q["page_en"] in range(55,61) for q in items))

    def test_batch_passes_bilingual_quality_gate(self):
        checked = audit(QUESTIONS, start=260, count=100)
        self.assertEqual(checked["errors"], [])
        self.assertEqual(checked["warnings"], [])
        self.assertEqual(checked["reviewed_quizzes"], "14–18")
        self.assertEqual(sum(checked["answer_positions"].values()), 100)

    def test_ashokan_officers_and_edicts_not_confused(self):
        keys = {
            261: "Yuktas", 262: "Rajjukas", 263: "Pradesikas",
            264: "Every five years", 268: "Kalinga Rock Edict 1",
            269: "Major Rock Edict 6", 270: "Major Rock Edicts 7 and 12",
            271: "Major Rock Edict 2",
        }
        for number, correct in keys.items():
            q = QUESTIONS[number-1]
            with self.subTest(number=number):
                self.assertEqual(q["opts_en"][q["correct"]], correct)
                self.assertIn(correct, q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]], q["exp_ta"])

    def test_textile_geography_and_agricultural_technology(self):
        keys = {281: "Bengal", 282: "Assam", 283: "Madurai",
                289: "After 500 BCE", 295: "Chunar stone"}
        for number, answer in keys.items():
            with self.subTest(number=number):
                q = QUESTIONS[number-1]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
        self.assertIn("Vanga", QUESTIONS[280]["q_en"])
        self.assertIn("Kamarupa", QUESTIONS[281]["q_en"])

    def test_trade_and_currency_facts(self):
        keys = {318: "Maha-sarthavaha", 320: "Tolls and octroi",
                327: "Egypt", 328: "Indigo", 329: "Ivory",
                330: "Tortoiseshell", 331: "Pearls", 332: "Perfumes",
                333: "Pana", 334: "Punch-marked coins", 335: "Barter"}
        for number, answer in keys.items():
            q = QUESTIONS[number-1]
            with self.subTest(number=number):
                self.assertEqual(q["opts_en"][q["correct"]], answer)
        self.assertIn("predating", QUESTIONS[333]["exp_en"])

    def test_urbanisation_dates_and_name_collision(self):
        self.assertIn("post-Mauryan", QUESTIONS[346]["q_en"])
        self.assertIn("UNESCO", QUESTIONS[346]["exp_en"])
        self.assertIn("மௌரியருக்குப் பிந்தைய", QUESTIONS[346]["exp_ta"])
        self.assertEqual(QUESTIONS[347]["opts_en"][QUESTIONS[347]["correct"]], "6th century BCE")
        self.assertEqual(QUESTIONS[353]["opts_en"][QUESTIONS[353]["correct"]], "Rajagriha")
        self.assertNotIn("Rajgriha", QUESTIONS[353]["opts_en"])
        self.assertIn("spelling variants", QUESTIONS[353]["exp_en"])
        self.assertEqual(QUESTIONS[356]["opts_en"][QUESTIONS[356]["correct"]], "Along rivers")
        self.assertEqual(QUESTIONS[357]["opts_en"][QUESTIONS[357]["correct"]], "Moat")
        self.assertEqual(QUESTIONS[358]["opts_en"][QUESTIONS[358]["correct"]], "Rampart")
        self.assertEqual(QUESTIONS[359]["opts_en"][QUESTIONS[359]["correct"]], "Burnt brick")

    def test_avoids_repeated_generic_export_stems(self):
        stems = [q["q_en"].casefold() for q in QUESTIONS[327:332]]
        self.assertEqual(len(stems), len(set(stems)))
        self.assertTrue(all("another export to egypt" not in s for s in stems))
        self.assertTrue(all("textbook answer for" not in q["q_en"].casefold() for q in REVIEWED))


if __name__ == "__main__":
    unittest.main()
