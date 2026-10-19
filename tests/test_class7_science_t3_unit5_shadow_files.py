#!/usr/bin/env python3
"""Guard the live Class 7 Science Term III Unit 5 catalogue against stale quiz shadows.

The browser loads unit-5.json first and its 25 quiz groups cover all 500
questions. Legacy unit-5-quiz-N.json files reused those IDs with different
question text; they were bypassed during normal quiz loading and made the
catalogue audit report 480 duplicate IDs.
"""
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / "data/textbook/class-7/science/term-3"
BANK = FOLDER / "unit-5.json"


class Class7ScienceTerm3Unit5Coverage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(BANK.read_text(encoding="utf-8"))

    def test_catalogue_and_master_bank_have_exactly_25_complete_quizzes(self):
        index = json.loads((FOLDER / "index.json").read_text(encoding="utf-8"))
        unit = next(x for x in index["units"] if x["id"] == 5)
        questions = self.bank["questions"]
        self.assertTrue(unit["ready"])
        self.assertEqual(unit["path"], "unit-5.json")
        self.assertEqual(unit["total"], 500)
        self.assertEqual(unit["quiz_count"], 25)
        self.assertEqual(self.bank["meta"]["total_questions"], 500)
        self.assertEqual(len(self.bank["meta"]["quiz_sets"]), 25)
        self.assertEqual(len(questions), 500)
        self.assertEqual(Counter(q["quiz"] for q in questions), Counter({i: 20 for i in range(1, 26)}))
        self.assertEqual(len({q["id"] for q in questions}), 500)

    def test_only_the_master_bank_supplies_quizzes(self):
        # A source-of-truth invariant: stale shards must not reuse question IDs.
        self.assertEqual(list(FOLDER.glob("unit-5-quiz-*.json")), [])

    def test_all_master_records_have_complete_bilingual_options(self):
        for record in self.bank["questions"]:
            with self.subTest(question=record["id"]):
                self.assertTrue(record["q_en"].strip())
                self.assertTrue(record["q_ta"].strip())
                self.assertEqual(len(record["opts_en"]), 4)
                self.assertEqual(len(record["opts_ta"]), 4)
                self.assertIn(record["correct"], range(4))
                self.assertTrue(record["exp_en"].strip())
                self.assertTrue(record["exp_ta"].strip())


if __name__ == "__main__":
    unittest.main()
