"""Regression checks for ClearExams mobile navigation and freshness transparency."""
import json
import re
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def content(path):
    return (ROOT / path).read_text(encoding="utf-8")


class CommercialReadinessTests(unittest.TestCase):
    def test_exam_hubs_have_keyboard_accessible_mobile_navigation(self):
        for path in ("tnpsc.html", "upsc.html"):
            with self.subTest(path=path):
                text = content(path)
                self.assertIn('class="mobile-site-nav"', text)
                self.assertIn('<summary>☰ Menu</summary>', text)
                self.assertIn('class="mobile-site-nav-links"', text)
                self.assertIn('href="index.html">Home</a>', text)
                self.assertIn('@media(max-width:850px){.mobile-site-nav{display:block}}', text)

    def test_sitemap_has_no_escaped_line_break_literals(self):
        text = content("sitemap.xml")
        self.assertNotIn(r"\n", text)
        tree = ET.fromstring(text)
        locations = [node.text for node in tree.iter() if node.tag.endswith("loc")]
        self.assertGreaterEqual(len(locations), 30)
        self.assertEqual(len(locations), len(set(locations)))

    def test_archive_exposes_missing_recent_editions(self):
        page = content("current-affairs/text/index.html")
        self.assertIn('id="editionFreshness"', page)
        self.assertIn('updateEditionFreshness(latest.date)', page)
        self.assertIn("updateEditionFreshness(holder.querySelector(", page)
        home = content("index.html")
        self.assertIn("Latest available edition; newer updates pending", home)
        editions = json.loads(content("current-affairs/text/editions.json"))
        self.assertTrue(editions)

    def test_notifications_do_not_falsely_share_one_review_date(self):
        script = content("assets/js/exam-notifications.js")
        self.assertIn("Object.entries(policy.boards||{})", script)
        self.assertIn("REVIEW OVERDUE:", script)
        self.assertNotIn("Other exam boards last manually reviewed", script)

    def test_freshness_monitor_is_issue_deduplicated(self):
        workflow = content(".github/workflows/current-affairs-freshness.yml")
        self.assertIn('55 16 * * *', workflow)
        self.assertIn('Asia/Kolkata', workflow)
        self.assertIn('gh issue list --state open', workflow)
        self.assertIn('gh issue close', workflow)


if __name__ == "__main__":
    unittest.main()
