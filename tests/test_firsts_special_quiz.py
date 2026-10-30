#!/usr/bin/env python3
"""Structural and UX checks for the expanded, cross-textbook Firsts Quiz."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/special-quizzes/firsts.json"
PAGE = ROOT / "textbook-firsts.html"


class FirstsSpecialQuizTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK.read_text(encoding="utf-8"))
        cls.questions = cls.data["questions"]
        cls.page = PAGE.read_text(encoding="utf-8")

    def test_question_count_and_coverage(self):
        self.assertEqual(len(self.questions), self.data["meta"]["count"])
        self.assertGreaterEqual(len(self.questions), 100)
        self.assertEqual(set(q["category"] for q in self.questions), {"women", "history", "science"})
        # All classes are intentionally audited. A lack of certified 'firsts'
        # from a particular class must remain visible in the coverage report.
        self.assertTrue(all(6 <= q["class_no"] <= 12 for q in self.questions))

    def test_bilingual_options_answers_and_sources(self):
        ids, stems, source_ids = set(), set(), set()
        for q in self.questions:
            with self.subTest(question=q.get("id")):
                self.assertNotIn(q["id"], ids)
                ids.add(q["id"])
                self.assertIsInstance(q.get("correct"), int)
                self.assertIn(q["correct"], range(4))
                for field in ("q_en", "q_ta", "exp_en", "exp_ta", "book_en", "book_ta", "source_link"):
                    self.assertTrue(str(q.get(field, "")).strip(), field)
                self.assertTrue(q["source_link"].startswith("https://"))
                for key in ("opts_en", "opts_ta"):
                    self.assertEqual(len(q[key]), 4)
                    self.assertEqual(len(set(q[key])), 4)
                    self.assertTrue(all(str(x).strip() for x in q[key]))
                stem = re.sub(r"\s+", " ", q["q_en"].strip().lower())
                self.assertNotIn(stem, stems)
                stems.add(stem)
                self.assertNotRegex(q["q_en"], r"(?i)according to (?:the )?textbook|what is the correct textbook answer")
                if q.get("source_id"):
                    self.assertNotIn(q["source_id"], source_ids)
                    source_ids.add(q["source_id"])

    def test_dynamic_20_question_sets_and_topic_class_filter(self):
        self.assertIn('id="classFilter"', self.page)
        self.assertIn('id="topic"', self.page)
        self.assertIn('id="set"', self.page)
        self.assertIn("Math.ceil(count/20)", self.page)
        self.assertIn("filteredBank()", self.page)
        self.assertIn("class_no", self.page)
        self.assertIn("clearexamsFirstsProgressV1", self.page)

    def test_homepage_and_practice_entrypoints(self):
        for path in ("index.html", "practice.html", "textbook-quiz.html"):
            markup = (ROOT / path).read_text(encoding="utf-8")
            self.assertIn("textbook-firsts.html", markup, path)


if __name__ == "__main__":
    unittest.main()
