"""Source-level checks for the ClearExams quiz and text-edition regressions.

These guard the integration points; interactive browser E2E tests are still required.
"""
import json
from pathlib import Path
import re
import unittest
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def source(path):
    return (ROOT / path).read_text(encoding="utf-8")


class ClearExamsRegressionTests(unittest.TestCase):
    def test_daily_quiz_preserves_native_history(self):
        html = source("daily-quiz.html")
        self.assertIn("function getQuizHistory()", html)
        self.assertNotRegex(html, r"function\s+history\s*\(")
        self.assertIn("window.history.replaceState", html)

    def test_textbook_has_one_bilingual_renderer(self):
        html = source("textbook-play.html")
        self.assertEqual(len(re.findall(r"function\s+render\s*\(", html)), 1)
        for marker in ("renderPalette();save();", "txt('Previous','முந்தையது')",
                       "txt('☆ Bookmark','☆ சேமி')", "txt('Report question','வினாவில் பிழை தெரிவி')"):
            self.assertIn(marker, html)

    def test_catalogue_matches_complete_class_subject_term(self):
        script = source("assets/js/textbook-catalog-controls.js")
        self.assertIn("Number(params.get('class'))===cls", script)
        self.assertIn("params.get('subject')===subject", script)
        self.assertIn("Number(params.get('term'))===term", script)
        self.assertNotIn("if(cls!==6)return true", script)

    def test_service_worker_refreshes_daily_text_and_quiz_json(self):
        script = source("service-worker.js")
        self.assertIn("url.pathname.startsWith('/current-affairs/text/')", script)
        self.assertIn("url.pathname.startsWith('/data/textbook/')", script)
        self.assertIn("fetch(event.request,{cache:'no-store'})", script)
        self.assertNotIn("'/current-affairs/pdfs.json'", script)

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
        match = re.search(r"const generalStudyLinks=(\\[.*?\\]);", js)
        self.assertIsNotNone(match, "Syllabus study map is missing")
        groups = json.loads(match.group(1))
        self.assertEqual(len(groups), 6)
        self.assertGreaterEqual(sum(map(len, groups)), 17)
        links = set()
        for group in groups:
            for item in group:
                href = item["href"]
                self.assertNotIn(href, links, "Duplicate chapter-to-quiz route")
                links.add(href)
                parsed = urlsplit(href)
                self.assertEqual(parsed.path, "textbook-play.html")
                params = parse_qs(parsed.query)
                cls = int(params["class"][0])
                subject = params["subject"][0]
                unit = int(params["unit"][0])
                term = int(params.get("term", ["1"])[0])
                self.assertEqual(params["quiz"][0], "1")
                folder = ROOT / "data" / "textbook" / f"class-{cls}" / subject
                if cls <= 8:
                    folder = folder / f"term-{term}"
                filename = folder / (f"unit-{unit:02}.json" if cls == 11 else f"unit-{unit}.json")
                self.assertTrue(filename.is_file(), f"Unpublished textbook quiz mapping: {href}")
                self.assertTrue(item["topic_en"] and item["chapter_en"])
                self.assertTrue(item["topic_ta"] and item["chapter_ta"])

    def test_history_unit_one_drops_generated_variants(self):
        data = json.loads(source("data/textbook/class-11/history/unit-01.json"))
        self.assertEqual(len(data["questions"]), 268)
        self.assertTrue(all(q["type"] == "direct" for q in data["questions"]))
        first = data["questions"][0]
        self.assertEqual(first["id"], "C11H01-Q001")
        self.assertEqual(first["opts_en"][first["correct"]], "Chipped stone flakes and cores")
        self.assertEqual(len(first["opts_ta"]), 4)
        self.assertTrue(first["exp_en"] and first["exp_ta"])

    def test_text_archive_latest_button_follows_edition_index(self):
        html = source("current-affairs/text/index.html")
        self.assertIn('id="latestTextEdition"', html)
        self.assertIn("link.href=latest.file", html)


if __name__ == "__main__":
    unittest.main()
