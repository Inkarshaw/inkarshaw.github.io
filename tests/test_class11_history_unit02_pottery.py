"""Checks for reviewed Chalcolithic and Iron Age pottery MCQs, Unit 2."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data/textbook/class-11/history/unit-02.json"
REVIEWED = {
    103: ("Black and red ware", 18),
    104: ("Black and red ware and black-on-red ware", 18),
    106: ("Black-on-red ware", 18),
    107: ("Black-on-red ware", 18),
    121: ("Black", 19),
    122: ("An ochre-coloured coating that can rub off on touch", 19),
    166: ("Black and Red Ware", 20),
    167: ("Painted Grey Ware", 20),
}


class Unit02PotteryTests(unittest.TestCase):
    def test_eight_edited_questions_have_four_distinct_bilingual_options(self):
        bank = json.loads(PATH.read_text(encoding="utf-8"))
        self.assertEqual(len(bank["questions"]), 996)
        for position, (expected, page) in REVIEWED.items():
            with self.subTest(number=position):
                q = bank["questions"][position - 1]
                self.assertEqual(q["id"], f"C11H02-Q{position:03d}")
                self.assertEqual(q["page_en"], page)
                self.assertEqual(q["opts_en"][q["correct"]], expected)
                self.assertEqual(len({o.casefold() for o in q["opts_en"]}), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertTrue(q["q_ta"] and q["exp_ta"] and q["exp_en"])
                self.assertNotIn("correct textbook answer for", q["q_en"].lower())

    def test_successor_and_predecessor_are_distinct_correct_answers(self):
        q = json.loads(PATH.read_text(encoding="utf-8"))["questions"]
        self.assertIn("preceded Painted Grey Ware", q[165]["q_en"])
        self.assertIn("succeeded Black and Red Ware", q[166]["q_en"])


if __name__ == "__main__":
    unittest.main()
