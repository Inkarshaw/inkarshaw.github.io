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

    def test_all_148_records_and_topics(self):
        self.assertEqual(len(self.questions), 148)
        self.assertEqual(self.bank["meta"]["count"], len(self.questions))
        self.assertEqual(len(self.by_id), len(self.questions))
        self.assertEqual(set(self.by_id), {f"F{i:03d}" for i in range(1, 149)})
        self.assertEqual(Counter(q["category"] for q in self.questions),
                         {"history": 96, "women": 26, "science": 26})
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
            ("women", "other pioneers · 26 MCQs."),
            ("history", "major events · 96 MCQs."),
            ("science", "discoveries · 26 MCQs."),
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

    def test_provenance_limitations_visible(self):
        # The remaining gaps must be reported, NOT silently treated as certified.
        original_page = sum(bool(q.get("source_printed_page")) for q in self.questions)
        missing_distinct_tamil = sum(not q.get("source_ta_link") or
                                     q["source_ta_link"] == q["source_link"] for q in self.questions)
        self.assertGreaterEqual(original_page, 30)
        self.assertEqual(missing_distinct_tamil, 40)
        self.assertIn("original_bilingual_source_certification_pending",
                      self.bank["meta"]["certification_status"])
        self.assertIn("audit remains open", self.page)


if __name__ == "__main__":
    unittest.main()
