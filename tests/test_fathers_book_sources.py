#!/usr/bin/env python3
"""Regression checks for the single combined, book-sourced Fathers quiz."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/special-quizzes/fathers.json"
PAGE = ROOT / "textbook-fathers.html"

class FathersBookSourcesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK.read_text(encoding="utf-8"))
        cls.questions = cls.data["questions"]
        cls.page = PAGE.read_text(encoding="utf-8")
        cls.books = cls.data["books"]

    def test_one_quiz_for_all_books(self):
        self.assertEqual(len(self.questions), self.data["meta"]["count"])
        self.assertEqual(len(self.books), self.data["meta"]["book_count"])
        self.assertGreaterEqual(len(self.questions), 19)
        self.assertGreaterEqual(len(self.books), 11)
        self.assertIn("data/special-quizzes/fathers.json", self.page)
        self.assertIn("filteredBank()", self.page)
        self.assertIn("source_references", self.page)
        self.assertIn("All books", self.page)
        self.assertIn("ONE quiz", self.page)

    def test_bilingual_source_provenance_and_no_duplicate_stems(self):
        ids, english_stems, book_ids = set(), set(), {b["id"] for b in self.books}
        for q in self.questions:
            with self.subTest(question=q.get("id")):
                self.assertNotIn(q["id"], ids)
                ids.add(q["id"])
                stem = re.sub(r"\s+", " ", q["q_en"].lower().strip())
                self.assertNotIn(stem, english_stems)
                english_stems.add(stem)
                self.assertNotRegex(stem, r"according to (the )?textbook")
                self.assertTrue(q.get("q_ta") and q.get("exp_en") and q.get("exp_ta"))
                self.assertIn(q["correct"], range(4))
                for field in ("opts_en", "opts_ta"):
                    self.assertEqual(len(q[field]), 4)
                    self.assertEqual(len(set(q[field])), 4)
                self.assertTrue(q["source_references"])
                for ref in q["source_references"]:
                    self.assertIn(ref["book_id"], book_ids)
                    self.assertTrue(ref["source_link"].startswith("https://"))
                    self.assertTrue(ref.get("chapter_en"))

    def test_original_book_additions_keep_distinct_titles(self):
        by_id = {q["id"]: q for q in self.questions}
        answers = {
            "FA016": "Gregor Johann Mendel",
            "FA017": "Norman E. Borlaug",
            "FA018": "M. S. Swaminathan",
            "FA019": "Adam Smith",
            "FA020": "Aristotle",
            "FA021": "John Locke",
        }
        for qid, person in answers.items():
            with self.subTest(id=qid):
                self.assertIn(qid, by_id)
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], person)
                self.assertTrue(q["page"])
                self.assertIn("original_english_pdf", q["review_status"])
                self.assertTrue(q.get("edition_note"))
        self.assertIn("worldwide", by_id["FA017"]["q_en"].lower())
        self.assertIn("Indian", by_id["FA018"]["q_en"])
        self.assertIn("tamil_original_pending", by_id["FA016"]["review_status"])

    def test_website_entrypoints(self):
        for name in ("index.html", "textbook-quiz.html", "search.html", "sitemap.xml"):
            with self.subTest(file=name):
                self.assertIn("textbook-fathers.html", (ROOT / name).read_text(encoding="utf-8"))
        self.assertIn("19 unique", (ROOT / "textbook-quiz.html").read_text(encoding="utf-8"))
        self.assertIn("19 questions", self.page)
        self.assertIn("11 source books", self.page)

if __name__ == "__main__":
    unittest.main()
