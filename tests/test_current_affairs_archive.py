#!/usr/bin/env python3
"""Prevent stale ClearExams current-affairs archive and homepage navigation."""
import importlib.util
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT = ROOT / "current-affairs" / "text"
SPEC = importlib.util.spec_from_file_location(
    "build_text_editions", TEXT / "build_text_editions.py"
)
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


class CurrentAffairsArchiveTests(unittest.TestCase):
    def test_committed_catalog_lists_all_verified_daily_sources(self):
        sources = sorted(path.stem for path in (TEXT / "data").glob("????-??-??.json"))
        self.assertTrue(sources)
        catalog = json.loads((TEXT / "editions.json").read_text(encoding="utf-8"))
        dates = [item["date"] for item in catalog]
        self.assertEqual(dates, sorted(sources, reverse=True))
        for item in catalog:
            self.assertEqual(item["file"], item["date"] + ".html")
            self.assertTrue(item["title"] and item["description"])

    def test_latest_archive_link_matches_newest_editorial_source(self):
        catalog = json.loads((TEXT / "editions.json").read_text(encoding="utf-8"))
        page = (TEXT / "index.html").read_text(encoding="utf-8")
        latest = catalog[0]
        self.assertIn('id="latestTextEdition" href="' + latest["file"] + '"', page)
        self.assertIn('data-edition-date="' + latest["date"] + '"', page)
        self.assertEqual(re.findall(r'data-edition-date="(\d{4}-\d{2}-\d{2})"', page),
                         [item["date"] for item in catalog])

    def test_builder_fills_latest_and_complete_archive_without_javascript(self):
        content = (TEXT / "index.html").read_text(encoding="utf-8")
        sample = [
            {"date": "2026-10-26", "file": "2026-10-26.html", "title": "Latest verified news",
             "description": "Exam facts and MCQs.", "status": "complete"},
            {"date": "2026-10-15", "file": "2026-10-15.html", "title": "Older current affairs",
             "description": "Earlier source-linked news.", "status": "partial"},
        ]
        rendered = BUILDER.render_archive_index(sample, content)
        self.assertIn('id="latestTextEdition" href="2026-10-26.html"', rendered)
        self.assertIn('data-edition-date="2026-10-26"', rendered)
        self.assertIn('data-edition-date="2026-10-15"', rendered)
        self.assertLess(rendered.index('data-edition-date="2026-10-26"'),
                        rendered.index('data-edition-date="2026-10-15"'))
        self.assertNotIn('data-edition-date="2026-10-25"', rendered)

    def test_stale_json_cannot_replace_newer_static_archive(self):
        html = (TEXT / "index.html").read_text(encoding="utf-8")
        self.assertIn("if(staticLatest&&valid[0].date<staticLatest)return;", html)
        self.assertIn("fetch('editions.json',{cache:'no-store'})", html)
        self.assertIn("/* The generated static HTML contains the latest edition", html)

    def test_builder_writes_static_archive_in_each_publish(self):
        builder = (TEXT / "build_text_editions.py").read_text(encoding="utf-8")
        self.assertIn("refresh_archive_index(pages)", builder)
        self.assertIn("refresh_index()", builder)


if __name__ == "__main__":
    unittest.main()
