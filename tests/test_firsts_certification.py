#!/usr/bin/env python3
"""Automated certification gates for the curated Firsts question bank.

Passing here certifies structure and selected editorial invariants ONLY.
It does not certify factual accuracy in all original English/Tamil textbooks.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/special-quizzes/firsts.json"
PAGE = ROOT / "textbook-firsts.html"
HOME = ROOT / "index.html"
YEARS = re.compile(r"\b(?:1[0-9]{3}|20[0-9]{2})\b")
FULL_DATE = re.compile(r"\b\d{1,2}\s+[A-Za-z]+\s+(?:1[0-9]{3}|20[0-9]{2})\b")
MONTH_YEAR = re.compile(r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:1[0-9]{3}|20[0-9]{2})\b", re.I)


class FirstsCertificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(BANK.read_text(encoding="utf-8"))
        cls.questions = cls.bank["questions"]
        cls.by_id = {q["id"]: q for q in cls.questions}
        cls.page = PAGE.read_text(encoding="utf-8")
        cls.home = HOME.read_text(encoding="utf-8")

    def test_all_178_records_and_topics(self):
        self.assertEqual(len(self.questions), 178)
        self.assertEqual(self.bank["meta"]["count"], len(self.questions))
        self.assertEqual(len(self.by_id), len(self.questions))
        self.assertEqual(set(self.by_id), {f"F{i:03d}" for i in range(1, 179)})
        self.assertEqual(Counter(q["category"] for q in self.questions),
                         {"history": 113, "women": 27, "science": 38})
        self.assertEqual({q["class_no"] for q in self.questions}, set(range(6, 13)))

    def test_all_answers_bilingual_and_unique(self):
        stems = set()
        for q in self.questions:
            with self.subTest(id=q["id"]):
                self.assertIn(q["correct"], range(4))
                for lang in ("en", "ta"):
                    self.assertTrue(q["q_" + lang].strip())
                    self.assertTrue(q["exp_" + lang].strip())
                    self.assertTrue(q["book_" + lang].strip())
                    opts = q["opts_" + lang]
                    self.assertEqual(len(opts), 4)
                    self.assertEqual(len(set(x.strip().casefold() for x in opts)), 4)
                    self.assertTrue(all(isinstance(x, str) and x.strip() for x in opts))
                stem = re.sub(r"\s+", " ", q["q_en"].strip().casefold())
                self.assertNotIn(stem, stems)
                stems.add(stem)
                self.assertTrue(q["review_status"])
                for key in ("source_link", "source_ta_link"):
                    url = q.get(key)
                    if url:
                        parsed = urlparse(url)
                        self.assertEqual(parsed.scheme, "https")
                        self.assertTrue(parsed.netloc)

    def test_date_question_distractors_same_answer_type(self):
        for q in self.questions:
            stem = q["q_en"].casefold()
            options = q["opts_en"]
            with self.subTest(id=q["id"]):
                if re.search(r"\b(?:in|which)\s+(?:month and )?year\b", stem):
                    check = MONTH_YEAR if "month and year" in stem else YEARS
                    self.assertTrue(all(check.search(o) for o in options), q["id"])
                if "on which date" in stem:
                    self.assertTrue(all(FULL_DATE.search(o) for o in options), q["id"])

    def test_known_weak_items_corrected(self):
        self.assertNotIn("fill:", self.by_id["F044"]["exp_en"].casefold())
        self.assertEqual(self.by_id["F042"]["opts_en"], ["1814", "1824", "1834", "1844"])
        self.assertEqual(self.by_id["F052"]["opts_en"][2], "1191")
        for id in ("F029", "F050"):
            q = self.by_id[id]
            self.assertNotEqual(q["opts_ta"], q["opts_en"])
            self.assertTrue(any(re.search("[\u0b80-\u0bff]", opt) for opt in q["opts_ta"]))
        for id in ("F029", "F112", "F114", "F116"):
            self.assertNotRegex(self.by_id[id]["q_en"].casefold(),
                                r"according to|the textbook|history lesson|history chapter|as recorded in")
        self.assertEqual(self.by_id["F019"]["source_conflict"]["status"],
                         "open_requires_original_edition_comparison")

    def test_homepage_counts_consistent(self):
        for category, phrase in [
            ("women", "other pioneers · 27 MCQs."),
            ("history", "major events · 113 MCQs."),
            ("science", "discoveries · 38 MCQs."),
        ]:
            with self.subTest(category=category):
                self.assertIn(phrase, self.home)

    def test_player_supports_short_default_skip_unanswered_and_restore(self):
        for fragment in [
            "id=\"skip\"", "id=\"unanswered\"", "clearexamsFirstsProgressV1",
            "$('set').value='1'", "wrong+unanswered", "id=\"palette\"",
            "source_ta_pdf_page", "id=\"retryWrong\"",
        ]:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, self.page)

    def test_class6_term1_original_pdf_evidence(self):
        questions = ("F033", "F034", "F035", "F043", "F044", "F149", "F150", "F151")
        self.assertEqual(sum(q["class_no"] == 6 for q in self.questions), 20)
        for id in questions:
            with self.subTest(id=id):
                q = self.by_id[id]
                self.assertEqual(q["class_no"], 6)
                self.assertIn("cloudfront.net", q["source_link"])
                self.assertIn("cloudfront.net", q["source_ta_link"])
                self.assertGreater(q["source_pdf_page_en"], 0)
                self.assertGreater(q["source_ta_pdf_page"], 0)
                self.assertIn("pending", q["review_status"])
        self.assertEqual(self.by_id["F149"]["opts_en"][0], "Viswanathan Anand")
        self.assertEqual(self.by_id["F150"]["opts_en"][0], "William Herschel")
        self.assertEqual(self.by_id["F151"]["opts_en"][0], "Chandrayaan-1")
        self.assertEqual(self.by_id["F043"]["opts_en"], [
            "Alexander Cunningham", "Charles Masson", "R. D. Banerji", "John Marshall"
        ])
        self.assertEqual(self.by_id["F044"]["opts_en"], [
            "Viswanathan Anand", "Sachin Tendulkar", "Karnam Malleswari", "Abhinav Bindra"
        ])

    def test_class6_term2_original_english_tamil_sources(self):
        source = "https://cleartnpsc.com/books/download/class-6-term-2-"
        selected = {"F041": (65, 69), "F152": (37, 38),
                    "F153": (74, 77), "F154": (75, 79)}
        for id, (en_page, ta_page) in selected.items():
            with self.subTest(id=id):
                q = self.by_id[id]
                self.assertEqual(q["class_no"], 6)
                self.assertTrue(q["source_link"].startswith(source))
                self.assertTrue(q["source_ta_link"].startswith(source))
                self.assertEqual(q["source_pdf_page_en"], en_page)
                self.assertEqual(q["source_ta_pdf_page"], ta_page)
                self.assertIn("pending", q["review_status"])
        self.assertEqual(self.by_id["F041"]["opts_en"][2], "Robert Hooke")
        self.assertEqual(self.by_id["F152"]["opts_en"][1], "Mahapadma Nanda")
        self.assertEqual(self.by_id["F153"]["opts_en"][0], "Gudiyatham")
        self.assertEqual(self.by_id["F154"]["opts_en"][2], "1911")
        for id in ("F068", "F069", "F070", "F071", "F072"):
            cross = self.by_id[id]["cross_corroboration_class6_term2"]
            self.assertEqual(cross["status"], "selected_original_pages_checked_not_complete_book_review")
            self.assertEqual(self.by_id[id]["class_no"], 11)
        self.assertEqual(self.by_id["F068"]["opts_en"], [
            "Rishabha", "Mahavira", "Parshvanatha", "Neminatha"])
        self.assertEqual(self.by_id["F072"]["opts_en"], [
            "Bimbisara", "Kalasoka", "Ashoka", "Ajatashatru"])

    def test_class6_term3_original_source_and_editorial_review(self):
        selected = {
            "F042": ("science", 43, 46),
            "F045": ("social-science", 123, 136),
            "F046": ("social-science", 122, 135),
            "F047": ("social-science", 37, 40),
            "F048": ("social-science", 19, 21),
            "F049": ("science", 9, 17),
            "F155": ("social-science", 122, 135),
            "F156": ("social-science", 118, 131),
        }
        for id, (book, en, ta) in selected.items():
            with self.subTest(id=id):
                q = self.by_id[id]
                self.assertEqual(q["class_no"], 6)
                self.assertIn("class-6-term-3-"+book, q["source_link"])
                self.assertIn("class-6-term-3-"+book, q["source_ta_link"])
                self.assertEqual(q["source_pdf_page_en"], en)
                self.assertEqual(q.get("source_ta_pdf_page"), ta)
                self.assertIn("pending", q["review_status"])
        self.assertEqual(len(set(self.by_id["F049"]["opts_en"])), 4)
        self.assertEqual(self.by_id["F049"]["opts_en"][1], "Chinese mariners")
        self.assertEqual(self.by_id["F047"]["opts_en"][0], "Susruta")
        self.assertEqual(self.by_id["F155"]["opts_en"][1], "Chennai Municipal Corporation")
        self.assertEqual(self.by_id["F156"]["opts_en"][2], "New Zealand")

    def test_provenance_limitations_visible(self):
        # The remaining gaps must be reported, NOT silently treated as certified.
        original_page = sum(bool(q.get("source_printed_page")) for q in self.questions)
        missing_distinct_tamil = sum(not q.get("source_ta_link") or
                                     q["source_ta_link"] == q["source_link"] for q in self.questions)
        self.assertGreaterEqual(original_page, 30)
        self.assertEqual(missing_distinct_tamil, 35)
        self.assertIn("original_bilingual_source_certification_pending",
                      self.bank["meta"]["certification_status"])
        self.assertIn("audit remains open", self.page)


if __name__ == "__main__":
    unittest.main()
