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
        self.assertEqual(len(self.questions), 58)
        self.assertEqual(len(self.books), 26)
        self.assertIn("data/special-quizzes/fathers.json", self.page)
        self.assertIn("filteredBank()", self.page)
        self.assertIn("source_references", self.page)
        self.assertIn("All books", self.page)
        self.assertIn("ONE quiz", self.page)
        self.assertIn("distinct questions", self.page)
        self.assertNotIn("b.question_count+", self.page)

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
                self.assertEqual(len(q["source_references"]), 2 if qid == "FA030" else 1)
        self.assertIn("in India", by_id["FA030"]["q_en"])
        fisher = by_id["FA024"]
        sources = {r["book_id"] for r in fisher["source_references"]}
        self.assertEqual(len(sources), len(fisher["source_references"]))
        self.assertIn("11-business-maths-statistics-full", sources)
        self.assertIn("12-economics-full", sources)
        self.assertIn("Father of Economics", by_id["FA019"]["q_en"])
        self.assertIn("Father of Capitalism", by_id["FA028"]["q_en"])

    def test_zoology_botany_original_pages_and_cross_book_sources(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA035": ("Aristotle", 4, "11-bio-zoology-full"),
            "FA036": ("Theophrastus", 8, "11-bio-botany-full"),
            "FA037": ("E. J. Butler", 21, "11-bio-botany-full"),
        }
        for qid, (correct_answer, printed_page, primary_book) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], correct_answer)
                self.assertEqual(q["page"], printed_page)
                self.assertEqual(q["book_id"], primary_book)
                self.assertIn("original_english_pdf_text_and_page_image_checked", q["review_status"])
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertTrue(q["edition_note"])
        self.assertIn("Classical Taxonomy", by_id["FA035"]["q_en"])
        self.assertIn("Indian Mycology", by_id["FA037"]["q_en"])
        self.assertEqual(
            {r["book_id"] for r in by_id["FA036"]["source_references"]},
            {"11-bio-botany-full", "11-bio-zoology-full"},
        )
        # Adding a second textbook for Linnaeus must not produce a second MCQ.
        self.assertEqual(
            {r["book_id"] for r in by_id["FA004"]["source_references"]},
            {"7-science-term-2", "11-bio-zoology-full", "11-bio-botany-full"},
        )
        self.assertEqual(
            len({r["source_id"] for r in by_id["FA004"]["source_references"]}),
            len(by_id["FA004"]["source_references"]),
        )

    def test_dna_barcoding_tissue_culture_and_multi_chapter_citations(self):
        by_id = {q["id"]: q for q in self.questions}
        additions = {
            "FA038": ("Paul Hebert", 11, 103, "chapter-5"),
            "FA039": ("Gottlieb Haberlandt", 12, 121, "chapter-5"),
        }
        for qid, (person, grade, printed_page, chapter) in additions.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], person)
                self.assertEqual(q["class_no"], grade)
                self.assertEqual(q["page"], printed_page)
                self.assertEqual(q["chapter_id"], chapter)
                self.assertIn("original_english_pdf_text_and_page_image_checked", q["review_status"])
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertEqual(len(q["source_references"]), 1)
        # Multiple pages from the same source book are allowed when chapters differ.
        expected = {
            "FA036": ("11-bio-botany-full", 86),
            "FA004": ("11-bio-botany-full", 95),
            "FA016": ("12-bio-botany-full", 36),
            "FA018": ("12-bio-botany-full", 222),
        }
        for qid, (book, page) in expected.items():
            with self.subTest(existing=qid):
                refs = by_id[qid]["source_references"]
                self.assertTrue(any(r["book_id"] == book and r["page"] == page for r in refs))
                self.assertEqual(len({r["source_id"] for r in refs}), len(refs))
        self.assertEqual(len(by_id["FA036"]["source_references"]), 3)
        self.assertEqual(len(by_id["FA004"]["source_references"]), 3)

    def test_nursing_politics_physics_and_biochemistry_titles(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA050": ("Sigmund Freud", 12, 98, "12-general-nursing-full"),
            "FA051": ("Auguste Comte", 12, 102, "12-general-nursing-full"),
            "FA052": ("Asclepiades of Bithynia", 12, 220, "12-general-nursing-full"),
            "FA053": ("Verghese Kurien", 12, 180, "12-political-science-vol-1"),
            "FA054": ("Manmohan Singh", 12, 183, "12-political-science-vol-1"),
            "FA055": ("Joseph Engelberger", 12, 263, "12-physics-vol-2"),
            "FA056": ("Carl Alexander Neuberg", 11, 1, "11-biochemistry-full"),
        }
        for qid, (answer, grade, page, book) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["class_no"], grade)
                self.assertEqual(q["page"], page)
                self.assertEqual(q["book_id"], book)
                self.assertIn("text_reproduction_checked", q["review_status"])
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertTrue(q["source_references"])
                self.assertEqual(len(q["opts_en"]), len(q["opts_ta"]))
        # One Indian Green Revolution question is shared by Science and Political Science.
        self.assertIn("12-political-science-vol-1",
                      {ref["book_id"] for ref in by_id["FA018"]["source_references"]})
        # Qualify two contested nursing honorifics, rather than claiming exclusive consensus.
        self.assertIn("not universally agreed", by_id["FA050"]["exp_en"])
        self.assertIn("not a universal designation", by_id["FA052"]["exp_en"])

    def test_scientific_management_title_and_2024_scert_references(self):
        by_id = {q["id"]: q for q in self.questions}
        taylor = by_id["FA057"]
        self.assertEqual(taylor["opts_en"][taylor["correct"]], "Frederick Winslow Taylor")
        self.assertEqual(taylor["book_id"], "12-commerce-full")
        self.assertEqual(taylor["chapter_id"], "chapter-1")
        self.assertIn("does not explicitly use the Father title", taylor["exp_en"])
        self.assertTrue(taylor["external_exam_source"].startswith("https://tnpsc.gov.in/"))
        self.assertEqual(len(taylor["opts_en"]), len(taylor["opts_ta"]))
        self.assertEqual(
            by_id["FA025"]["opts_en"][by_id["FA025"]["correct"]], "Henry Fayol"
        )
        self.assertEqual(
            next(b for b in self.books if b["id"] == "12-commerce-full")["count"], 3
        )
        for qid in ("FA025", "FA026"):
            self.assertTrue(any("SCERT12-COMMERCE-2024-" in r["source_id"]
                                for r in by_id[qid]["source_references"]))

    def test_vocational_nursing_original_scert_titles(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA058": ("Maharishi Patanjali", 16, "chapter-1"),
            "FA059": ("Antoine Lavoisier", 104, "chapter-4"),
            "FA060": ("Hippocrates", 104, "chapter-4"),
        }
        for qid, (answer, printed_page, chapter_id) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["book_id"], "12-vocational-nursing-full")
                self.assertEqual(q["class_no"], 12)
                self.assertEqual(q["page"], printed_page)
                self.assertEqual(q["chapter_id"], chapter_id)
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertIn("original_scert_english_pdf_text_checked", q["review_status"])
                self.assertIn("page_image_unavailable", q["review_status"])
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertEqual(len(q["source_references"]), 1)
                self.assertTrue(q["source_link"].endswith("12th_Nursing_Vocational_EM.pdf"))
                self.assertTrue(q["q_ta"] and q["exp_ta"])
                self.assertEqual(len(set(q["opts_ta"])), 4)
        nursing = next(b for b in self.books if b["id"] == "12-vocational-nursing-full")
        self.assertEqual(nursing["count"], 3)
        self.assertEqual(len(nursing["chapters"]), 2)
        self.assertIn("Maharishi Patanjali", by_id["FA058"]["opts_en"])
        self.assertIn("tradition", by_id["FA060"]["exp_en"])
        # The page counters must derive from the bank after loading, not only static markup.
        self.assertIn("data.meta.count", self.page)
        self.assertIn("data.books.length", self.page)

    def test_website_entrypoints(self):
        for name in ("index.html", "textbook-quiz.html", "search.html", "sitemap.xml"):
            with self.subTest(file=name):
                self.assertIn("textbook-fathers.html", (ROOT / name).read_text(encoding="utf-8"))
        self.assertIn("58 unique", (ROOT / "textbook-quiz.html").read_text(encoding="utf-8"))
        self.assertIn("58 questions", self.page)
        self.assertIn("26 source books", self.page)

if __name__ == "__main__":
    unittest.main()
