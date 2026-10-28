"""Regression checks for the Class 6 TN Social Science term catalogues.

These are structural checks; textbook fact verification and browser E2E QA are separate.
"""
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "data" / "textbook" / "class-6" / "social-science"


class Class6SocialScienceCatalogueTests(unittest.TestCase):
    def test_term_indexes_match_published_unit_files(self):
        for term, expected_units, expected_questions in ((1, 8, 1580), (2, 7, 955)):
            with self.subTest(term=term):
                folder = BASE / f"term-{term}"
                index_path = folder / "index.json"
                self.assertTrue(index_path.is_file(), str(index_path))
                index = json.loads(index_path.read_text(encoding="utf-8"))
                self.assertEqual(index["meta"]["class"], 6)
                self.assertEqual(index["meta"]["subject"], "Social Science")
                self.assertEqual(index["meta"]["term"], term)
                self.assertEqual(index["meta"]["unit_count"], expected_units)
                self.assertEqual(len(index["units"]), expected_units)
                self.assertEqual([u["id"] for u in index["units"]],
                                 list(range(1, expected_units + 1)))
                question_total = set_total = 0
                for unit in index["units"]:
                    self.assertTrue(unit["ready"])
                    self.assertEqual(unit["path"], f"unit-{unit['id']}.json")
                    self.assertTrue(unit["unit_en"] and unit["unit_ta"])
                    path = folder / unit["path"]
                    self.assertTrue(path.is_file(), str(path))
                    bank = json.loads(path.read_text(encoding="utf-8"))
                    questions = bank["questions"]
                    quiz_numbers = sorted(set(q["quiz"] for q in questions))
                    self.assertEqual(quiz_numbers, list(range(1, unit["quiz_count"] + 1)))
                    self.assertEqual(len(questions), unit["total"])
                    self.assertEqual(len(questions), bank["meta"]["total_questions"])
                    self.assertEqual(len(bank["meta"]["quiz_sets"]), unit["quiz_count"])
                    for number in quiz_numbers:
                        self.assertLessEqual(sum(q["quiz"] == number for q in questions), 20)
                    for q in questions:
                        self.assertTrue(q["q_en"] and q["q_ta"])
                        self.assertEqual(len(q["opts_en"]), 4)
                        self.assertEqual(len(q["opts_ta"]), 4)
                        self.assertIn(q["correct"], range(4))
                        self.assertTrue(q["exp_en"] and q["exp_ta"])
                    question_total += len(questions)
                    set_total += unit["quiz_count"]
                self.assertEqual(question_total, expected_questions)
                self.assertEqual(index["meta"]["total_questions"], question_total)
                self.assertEqual(index["meta"]["total_quiz_sets"], set_total)

    def test_static_term_one_counts_match_index(self):
        html = (ROOT / "textbook-quiz.html").read_text(encoding="utf-8")
        index = json.loads((BASE / "term-1" / "index.json").read_text(encoding="utf-8"))
        self.assertIn("1,580 questions live", html)
        for unit in index["units"]:
            pattern = (
                r'href="textbook-play\.html\?class=6&subject=social-science'
                rf'&term=1&unit={unit["id"]}&quiz=all">Full Unit · ([\d,]+)'
            )
            counts = re.findall(pattern, html)
            self.assertEqual(len(counts), 1, unit["unit_en"])
            self.assertEqual(int(counts[0].replace(",", "")), unit["total"])


if __name__ == "__main__":
    unittest.main()
