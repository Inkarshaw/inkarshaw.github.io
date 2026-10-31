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
        self.assertEqual(len(self.questions), 32)
        self.assertEqual(len(self.books), 15)
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

    def test_business_maths_and_commerce_original_book_titles(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA022": ("Al-Khwarizmi", 11, 25, "chapter-2"),
            "FA023": ("René Descartes", 11, 51, "chapter-3"),
            "FA024": ("Ronald A. Fisher", 11, 178, "chapter-8"),
            "FA025": ("Henry Fayol", 12, 8, "chapter-1"),
            "FA026": ("Ralph Nader", 12, 130, "chapter-16"),
        }
        for qid, (person, grade, page, chapter) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], person)
                self.assertEqual(q["class_no"], grade)
                self.assertEqual(q["page"], page)
                self.assertEqual(q["chapter_id"], chapter)
                self.assertIn("original_english_pdf_text_checked", q["review_status"])
                self.assertIn("page_image_unavailable", q["review_status"])
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertTrue(q["edition_note"])
        self.assertIn("a father of statistics", by_id["FA024"]["q_en"].lower())
        self.assertIn("not the exclusive father", by_id["FA024"]["exp_en"])
        self.assertNotIn("Father of Scientific Management", " ".join(q["q_en"] for q in self.questions))

    def test_2022_english_science_economics_book_pages(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA027": ("John Maynard Keynes", 12, 1, "chapter-1"),
            "FA028": ("Adam Smith", 12, 5, "chapter-1"),
            "FA029": ("Karl Marx", 12, 6, "chapter-1"),
            "FA030": ("P. C. Mahalanobis", 12, 258, "chapter-12"),
            "FA031": ("M. O. P. Iyengar", 11, 33, "chapter-2"),
            "FA032": ("Shiv Ram Kashyap", 11, 37, "chapter-2"),
            "FA033": ("Birbal Sahni", 11, 43, "chapter-2"),
            "FA034": ("Nehemiah Grew", 11, 168, "chapter-9"),
        }
        for qid, (answer, grade, page, chapter) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["class_no"], grade)
                self.assertEqual(q["page"], page)
                self.assertEqual(q["chapter_id"], chapter)
                self.assertTrue(q["edition_note"])
                self.assertIn("original_english_pdf", q["review_status"])
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertEqual(len(q["source_references"]), 1)
        self.assertIn("in India", by_id["FA030"]["q_en"])
        fisher = by_id["FA024"]
        sources = {r["book_id"] for r in fisher["source_references"]}
        self.assertEqual(len(sources), len(fisher["source_references"]))
        self.assertIn("11-business-maths-statistics-full", sources)
        self.assertIn("12-economics-full", sources)
        self.assertIn("Father of Economics", by_id["FA019"]["q_en"])
        self.assertIn("Father of Capitalism", by_id["FA028"]["q_en"])

    def test_website_entrypoints(self):
        for name in ("index.html", "textbook-quiz.html", "search.html", "sitemap.xml"):
            with self.subTest(file=name):
                self.assertIn("textbook-fathers.html", (ROOT / name).read_text(encoding="utf-8"))
        self.assertIn("32 unique", (ROOT / "textbook-quiz.html").read_text(encoding="utf-8"))
        self.assertIn("32 questions", self.page)
        self.assertIn("15 source books", self.page)

if __name__ == "__main__":
    unittest.main()
