"""Commercial launch guardrails: publisher identification, truth-in-advertising and student access."""
import json
import re
import unittest
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return (ROOT / path).read_text(encoding="utf-8")

class CommercialLaunchFoundationsTests(unittest.TestCase):
    def test_ads_txt_matches_published_adsense_client(self):
        homepage = read("index.html")
        match = re.search(r"ca-pub-(\d{16})", homepage)
        self.assertIsNotNone(match)
        self.assertEqual(read("ads.txt").strip(),
                         "google.com, pub-" + match.group(1) + ", DIRECT, f08c47fec0942fa0")

    def test_privacy_explains_advertising_and_browser_storage(self):
        page = read("privacy.html").lower()
        for phrase in ("google adsense", "cookies", "google analytics", "personalised",
                       "browser storage", "support.html", "advertising"):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, page)

    def test_public_pages_show_accurate_free_beta_scope(self):
        homepage = read("index.html")
        terms = read("terms.html")
        self.assertIn("Free during beta", homepage)
        self.assertIn("currently available free during beta", terms)
        self.assertIn("not presently offer a paid subscription", terms)
        for route in ("privacy.html", "terms.html", "support.html"):
            self.assertIn('href="' + route + '"', homepage)

    def test_support_discourages_public_sensitive_data(self):
        page = read("support.html")
        self.assertIn("GitHub issues are public", page)
        self.assertIn("private reports should not be submitted", page)
        self.assertIn("issues/new", page)

    def test_sitemap_includes_commercial_information_pages(self):
        root = ET.fromstring(read("sitemap.xml"))
        locations = {n.text for n in root.iter() if n.tag.endswith("loc")}
        for path in ("privacy.html", "terms.html", "support.html"):
            self.assertIn("https://clearexams.ink/" + path, locations)

    def test_pyq_drafts_are_not_misrepresented_as_official_certified(self):
        catalog = json.loads(read("data/quizzes/typed-pyq-catalog.json"))
        self.assertEqual(len(catalog["entries"]), 8)
        self.assertTrue(any(e["scorable"] < e["typed"] for e in catalog["entries"]))
        page = read("pyq-typed-library.html")
        self.assertIn("not independently certified verbatim", page)

    def test_current_affairs_release_builds_from_vetted_sources(self):
        workflow = read(".github/workflows/jekyll-gh-pages.yml")
        self.assertIn("python3 current-affairs/text/build_text_editions.py", workflow)
        self.assertIn("--deployment-only", workflow)
        self.assertIn("Verify deployed Current Affairs text edition matches vetted sources", workflow)
        newest_source = max(p.stem for p in (ROOT / "current-affairs/text/data").glob("????-??-??.json"))
        self.assertRegex(newest_source, r"^\d{4}-\d{2}-\d{2}$")
        self.assertIn("pages = refresh_index()", read("current-affairs/text/build_text_editions.py"))

if __name__ == "__main__":
    unittest.main()
