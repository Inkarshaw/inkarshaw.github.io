"""Class 8 Social Science Term I: honest source coverage and quiz routing."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "data/textbook/class-8/social-science/term-1"

class Class8SocialTerm1Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = json.loads((DIR / "index.json").read_text(encoding="utf-8"))
        cls.bank = json.loads((DIR / "unit-1.json").read_text(encoding="utf-8"))

    def test_all_ten_chapters_are_listed_without_false_readiness(self):
        units = self.index["units"]
        self.assertEqual(len(units), 10)
        self.assertEqual(self.index["meta"]["unit_count"], 10)
        self.assertEqual([u["id"] for u in units], list(range(1, 11)))
        self.assertEqual([u["id"] for u in units if u["ready"]], [1])
        self.assertEqual(self.index["meta"]["total_questions"], 20)
        self.assertEqual(sum(u["total"] for u in units if u["ready"]), 20)
        self.assertEqual(self.index["meta"]["total_quiz_sets"], 1)
        for unit in units[1:]:
            self.assertEqual(unit["total"], 0)
            self.assertEqual(unit["quiz_count"], 0)
            self.assertIsNone(unit["path"])
        self.assertEqual(units[0]["path"], "unit-1.json")

    def test_history_unit_one_has_twenty_valid_bilingual_questions(self):
        questions = self.bank["questions"]
        self.assertEqual(self.bank["meta"]["total_questions"], 20)
        self.assertEqual(len(questions), 20)
        self.assertEqual([q["id"] for q in questions], [f"C8SS1U1-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual(len(self.bank["meta"]["quiz_sets"]), 1)
        for q in questions:
            with self.subTest(question=q["id"]):
                self.assertEqual(q["quiz"], 1)
                self.assertTrue(re.search(r"[\u0b80-\u0bff]", q["q_ta"]))
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(s.casefold() for s in q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertGreaterEqual(len(q["exp_en"]), 75)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)
                self.assertIn(q["page_en"], range(125, 132))
        self.assertEqual(len(set(q["q_en"].casefold() for q in questions)), 20)

    def test_source_limitations_are_visible(self):
        meta = self.bank["meta"]
        self.assertEqual(meta["edition"], 2019)
        self.assertTrue(meta["source_en_url"].lower().endswith(".pdf"))
        self.assertIn("Tamil is an editorial translation", meta["editorial_status"])
        html = (ROOT / "textbook-quiz.html").read_text(encoding="utf-8")
        self.assertIn("Tamil originals and the prescribed current edition remain unverified", html)

if __name__ == "__main__":
    unittest.main()
