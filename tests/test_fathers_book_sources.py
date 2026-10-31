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
        self.assertEqual(len(self.questions), 79)
        self.assertEqual(len(self.books), 40)
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
        self.assertEqual(
            sum("Father of Scientific Management" in q["q_en"] for q in self.questions), 1
        )
        taylor = next(q for q in self.questions if "Father of Scientific Management" in q["q_en"])
        self.assertEqual(taylor["opts_en"][taylor["correct"]], "Frederick Winslow Taylor")

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
                # Keep the original Nursing citation while allowing verified cross-book sources.
                self.assertTrue(any(
                    ref["book_id"] == "12-vocational-nursing-full"
                    and ref["page"] == printed_page
                    for ref in q["source_references"]
                ))
                self.assertGreaterEqual(len(q["source_references"]), 1)
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

    def test_technology_and_vocational_source_titles_and_conflict(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA061": ("Henry Maudslay", "12-basic-mechanical-engineering-full", 3),
            "FA062": ("Nikola Tesla", "12-basic-mechanical-engineering-full", 130),
            "FA063": ("George Devol", "12-basic-mechanical-engineering-full", 131),
            "FA064": ("Luca Pacioli", "12-textiles-dress-designing-full", 202),
            "FA065": ("Vint Cerf", "12-computer-applications-full", 139),
            "FA066": ("Ed Guilbert", "12-computer-applications-full", 252),
            "FA067": ("Wilhelm Wundt", "11-vocational-nursing-full", 53),
        }
        for qid, (answer, book, page) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["book_id"], book)
                self.assertEqual(q["page"], page)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn("tamil_original_pending", q["review_status"])
        # Book-specific statements must not be flattened into one universal answer.
        self.assertIn("Class 12 General Nursing", by_id["FA050"]["q_en"])
        self.assertIn("Class 11 Vocational Nursing", by_id["FA067"]["q_en"])
        self.assertEqual(by_id["FA050"]["opts_en"][by_id["FA050"]["correct"]], "Sigmund Freud")
        self.assertEqual(by_id["FA067"]["opts_en"][by_id["FA067"]["correct"]], "Wilhelm Wundt")
        self.assertIn("conflict", by_id["FA050"]["exp_en"])
        self.assertIn("11-vocational-nursing-full",
                      {r["book_id"] for r in by_id["FA051"]["source_references"]})
        self.assertIn("12-basic-mechanical-engineering-full",
                      {r["book_id"] for r in by_id["FA057"]["source_references"]})
        expected_books = {
            "12-basic-mechanical-engineering-full": 4,
            "12-computer-applications-full": 2,
            "12-textiles-dress-designing-full": 1,
            "11-vocational-nursing-full": 2,
        }
        for bid, count in expected_books.items():
            b = next(book for book in self.books if book["id"] == bid)
            self.assertEqual(b["count"], count)
            self.assertEqual(
                len([q for q in self.questions if any(ref["book_id"] == bid
                    for ref in q["source_references"])]), count
            )

    def test_home_science_textiles_food_service_and_biochemistry_titles(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA068": ("Frederick W. Taylor", "11-textiles-dress-designing-full", 153),
            "FA069": ("Charles Frederick Worth", "11-textiles-dress-designing-full", 167),
            "FA070": ("Robert Owen", "12-food-service-management-full", 145),
            "FA071": ("Antoine Lavoisier", "12-biochemistry-full", 187),
        }
        for qid, (answer, bid, page) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["book_id"], bid)
                self.assertEqual(q["page"], page)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertEqual(len(q["source_references"]), 1)
        self.assertIn("a father of personnel management", by_id["FA070"]["q_en"].lower())
        self.assertIn("non-exclusive", by_id["FA070"]["exp_en"])
        self.assertIn("Father of Industrial Engineering", by_id["FA068"]["q_en"])
        self.assertIn("Father of Modern Chemistry", by_id["FA071"]["q_en"])
        self.assertNotEqual(by_id["FA068"]["q_en"], by_id["FA057"]["q_en"])
        self.assertNotEqual(by_id["FA071"]["q_en"], by_id["FA059"]["q_en"])
        for qid, bid in {
            "FA059": "11-home-science-full",
            "FA025": "12-home-science-full",
            "FA042": "12-biochemistry-full",
        }.items():
            self.assertIn(bid, {r["book_id"] for r in by_id[qid]["source_references"]})
        expected_book_counts = {
            "11-textiles-dress-designing-full": 2,
            "12-food-service-management-full": 1,
            "12-biochemistry-full": 2,
            "11-home-science-full": 1,
            "12-home-science-full": 1,
        }
        for bid, count in expected_book_counts.items():
            with self.subTest(book=bid):
                source_book = next(b for b in self.books if b["id"] == bid)
                self.assertEqual(source_book["count"], count)
                self.assertEqual(sum(any(ref["book_id"] == bid
                                         for ref in q["source_references"])
                                     for q in self.questions), count)

    def test_computing_fathers_and_cross_book_deduplication(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA072": ("Dan Bricklin", "11-computer-applications-full", 102),
            "FA073": ("Edgar Frank Codd", "12-computer-science-full", 191),
        }
        for qid, (answer, bid, page) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["book_id"], bid)
                self.assertEqual(q["page"], page)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertTrue(q["q_ta"] and q["exp_ta"])
        self.assertIn("Bob Frankston", by_id["FA072"]["exp_en"])
        self.assertIn("Peter Chen", by_id["FA073"]["exp_en"])
        self.assertEqual(
            {r["book_id"] for r in by_id["FA072"]["source_references"]},
            {"11-computer-applications-full", "11-computer-technology-full"}
        )
        for bid in ("11-computer-applications-full", "11-computer-technology-full"):
            self.assertIn(bid, {r["book_id"] for r in by_id["FA002"]["source_references"]})
        expected_counts = {
            "11-computer-applications-full": 2,
            "11-computer-technology-full": 2,
            "12-computer-science-full": 1,
        }
        for bid, total in expected_counts.items():
            with self.subTest(book=bid):
                b = next(x for x in self.books if x["id"] == bid)
                self.assertEqual(b["count"], total)
                self.assertEqual(
                    sum(any(ref["book_id"] == bid for ref in q["source_references"])
                        for q in self.questions), total
                )
        # Textbook citations can grow without creating duplicate quiz entries.
        self.assertEqual(sum(q["id"] == "FA002" for q in self.questions), 1)
        self.assertEqual(sum(q["id"] == "FA072" for q in self.questions), 1)
        self.assertEqual(self.data["meta"]["chapter_count"], 73)

    def test_political_science_sovereignty_liberalism_local_government(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA074": ("Jean Bodin", "11-political-science-vol-1", "unit-2", 22),
            "FA075": ("John Locke", "11-political-science-vol-2", "unit-8", 136),
            "FA076": ("Lord Ripon", "11-political-science-vol-2", "unit-12", 241),
        }
        for qid, (answer, book, chapter, page) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["book_id"], book)
                self.assertEqual(q["chapter_id"], chapter)
                self.assertEqual(q["page"], page)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertEqual(len(q["source_references"]), 1)
                self.assertIn("11th-Political-Science", q["source_link"])
                self.assertTrue(q["exp_en"] and q["exp_ta"])
        self.assertIn("Rippon", by_id["FA076"]["exp_en"])
        self.assertIn("FA021", by_id["FA075"]["exp_en"])
        self.assertEqual(by_id["FA021"]["opts_en"][by_id["FA021"]["correct"]],
                         by_id["FA075"]["opts_en"][by_id["FA075"]["correct"]])
        self.assertNotEqual(by_id["FA021"]["q_en"], by_id["FA075"]["q_en"])
        for bid, count in (("11-political-science-vol-1", 3),
                           ("11-political-science-vol-2", 2)):
            b = next(x for x in self.books if x["id"] == bid)
            self.assertEqual(b["count"], count)
            self.assertEqual(sum(
                any(ref["book_id"] == bid for ref in q["source_references"])
                for q in self.questions), count)

    def test_bio_botany_ecology_three_distinct_titles(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA077": "Alexander von Humboldt",
            "FA078": "Eugene P. Odum",
            "FA079": "R. Misra",
        }
        for qid, answer in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["book_id"], "12-bio-botany-full")
                self.assertEqual(q["chapter_id"], "chapter-6")
                self.assertEqual(q["page"], 109)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertTrue(q["source_references"])
                self.assertTrue(q["q_ta"] and q["exp_ta"])
        self.assertIn("Ernst Haeckel", by_id["FA077"]["exp_en"])
        self.assertIn("Humbolt", by_id["FA077"]["exp_en"])
        self.assertIn("textbook-specific", by_id["FA077"]["exp_en"])
        self.assertIn("Modern Ecology", by_id["FA078"]["q_en"])
        self.assertIn("Indian Ecology", by_id["FA079"]["q_en"])
        self.assertEqual(self.data["meta"]["chapter_count"], 73)
        source_book = next(b for b in self.books if b["id"] == "12-bio-botany-full")
        self.assertEqual(source_book["count"], 6)
        self.assertIn("chapter-6", {c["id"] for c in source_book["chapters"]})
        self.assertEqual(sum(any(ref["book_id"] == source_book["id"]
                                 for ref in q["source_references"])
                             for q in self.questions), source_book["count"])

    def test_class12_history_italian_literature_and_us_industrial_revolution(self):
        by_id = {q["id"]: q for q in self.questions}
        expected = {
            "FA080": ("Petrarch", "unit-10", 19),
            "FA081": ("Samuel Slater", "unit-11", 57),
        }
        for qid, (answer, chapter, page) in expected.items():
            with self.subTest(question=qid):
                q = by_id[qid]
                self.assertEqual(q["opts_en"][q["correct"]], answer)
                self.assertEqual(q["book_id"], "12-history-full")
                self.assertEqual(q["chapter_id"], chapter)
                self.assertEqual(q["page"], page)
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn("tamil_original_pending", q["review_status"])
                self.assertEqual(len(q["source_references"]), 1)
                self.assertTrue(q["exp_en"] and q["exp_ta"] and q["q_ta"])
        self.assertIn("Italian Renaissance Literature", by_id["FA080"]["q_en"])
        self.assertIn("Father of Humanism", by_id["FA080"]["exp_en"])
        self.assertIn("Andrew Jackson", by_id["FA081"]["exp_en"])
        self.assertIn("p.61", by_id["FA081"]["exp_en"])
        self.assertNotEqual(by_id["FA005"]["q_en"], by_id["FA080"]["q_en"])
        self.assertEqual(by_id["FA005"]["opts_en"][by_id["FA005"]["correct"]], "Petrarch")
        self.assertEqual(
            next(b for b in self.books if b["id"] == "12-history-full")["count"], 7
        )
        history = next(b for b in self.books if b["id"] == "12-history-full")
        self.assertIn("unit-11", {c["id"] for c in history["chapters"]})

    def test_class11_accountancy_explicit_pacioli_cross_reference(self):
        by_id = {q["id"]: q for q in self.questions}
        pacioli = by_id["FA064"]
        self.assertEqual(pacioli["opts_en"][pacioli["correct"]], "Luca Pacioli")
        refs = pacioli["source_references"]
        self.assertIn("11-accountancy-full", {r["book_id"] for r in refs})
        self.assertTrue(any(
            r["book_id"] == "11-accountancy-full" and r["page"] == 327
            for r in refs
        ))
        accountancy = next(b for b in self.books if b["id"] == "11-accountancy-full")
        self.assertEqual(accountancy["count"], 1)
        self.assertIn("unit-14", {c["id"] for c in accountancy["chapters"]})
        self.assertEqual(sum(any(r["book_id"] == accountancy["id"]
                             for r in q["source_references"])
                             for q in self.questions), 1)
        self.assertEqual(sum(q["id"] == "FA064" for q in self.questions), 1)

    def test_website_entrypoints(self):
        for name in ("index.html", "textbook-quiz.html", "search.html", "sitemap.xml"):
            with self.subTest(file=name):
                self.assertIn("textbook-fathers.html", (ROOT / name).read_text(encoding="utf-8"))
        self.assertIn("79 unique", (ROOT / "textbook-quiz.html").read_text(encoding="utf-8"))
        self.assertIn("79 questions", self.page)
        self.assertIn("40 source books", self.page)

if __name__ == "__main__":
    unittest.main()
