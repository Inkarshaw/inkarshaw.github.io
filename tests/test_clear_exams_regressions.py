"""Source-level checks for the ClearExams quiz and text-edition regressions.

These guard the integration points; interactive browser E2E tests are still required.
"""
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


def source(path):
    return (ROOT / path).read_text(encoding="utf-8")


class ClearExamsRegressionTests(unittest.TestCase):
    def test_daily_quiz_preserves_native_history(self):
        html = source("daily-quiz.html")
        self.assertIn("function getQuizHistory()", html)
        self.assertNotRegex(html, r"function\\s+history\\s*\\(")
        self.assertIn("window.history.replaceState", html)

    def test_textbook_has_one_bilingual_renderer(self):
        html = source("textbook-play.html")
        self.assertEqual(len(re.findall(r"function\\s+render\\s*\\(", html)), 1)
        for marker in ("renderPalette();save();", "txt('Previous','முந்தையது')",
                       "txt('☆ Bookmark','☆ சேமி')", "txt('Report question','வினாவில் பிழை தெரிவி')"):
            self.assertIn(marker, html)

    def test_class_six_filters_exact_term_segment(self):
        script = source("assets/js/textbook-catalog-controls.js")
        self.assertIn("parts[0]==='6th Standard'", script)
        self.assertIn("parts[1]===labels[subject]", script)
        self.assertIn("parts[2]==='Term '+termRoman[term]", script)

    def test_home_and_site_search_use_text_index(self):
        for path in ("index.html", "search.html"):
            html = source(path)
            self.assertIn("current-affairs/text/editions.json", html)
            self.assertNotIn("fetch('current-affairs/pdfs.json'", html)

    def test_october_fifteenth_text_edition_indexed(self):
        editions = json.loads(source("current-affairs/text/editions.json"))
        self.assertTrue(any(x["date"] == "2026-10-15"
                            and x["file"] == "2026-10-15.html" for x in editions))
        page = source("current-affairs/text/2026-10-15.html")
        self.assertIn("2026-10-15", page)

    def test_syllabus_uses_verified_chapter_route_mapping(self):
        js = source("assets/js/syllabus-reader.js")
        self.assertIn("mappedChapters(part,index,tamil)", js)
        self.assertIn("textbook-play.html?class=7&subject=social-science&term=1&unit=4&quiz=1", js)


if __name__ == "__main__":
    unittest.main()
