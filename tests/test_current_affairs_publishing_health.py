"""Regression tests for source-vs-live Current Affairs publication monitoring."""
from datetime import date
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "check_current_affairs_freshness.py"
SPEC = importlib.util.spec_from_file_location("current_affairs_freshness", SCRIPT)
MONITOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MONITOR)


class CurrentAffairsPublishingHealthTests(unittest.TestCase):
    def test_latest_date_ignores_unpublished_or_invalid_records(self):
        entries = [
            {"date": "2026-11-01", "file": "2026-11-01.html", "status": "complete"},
            {"date": "2026-11-03", "file": "2026-11-03.html", "status": "draft"},
            {"date": "not-a-date", "file": "not-a-date.html", "status": "complete"},
            {"date": "2026-11-02", "file": "unrelated.html", "status": "complete"},
        ]
        self.assertEqual(MONITOR.latest_date(entries), date(2026, 11, 1))

    def test_current_source_and_verified_live_page_are_healthy(self):
        result = MONITOR.evaluate(date(2026, 11, 2), date(2026, 11, 2),
                                  date(2026, 11, 2), True)
        self.assertFalse(result["stale"])
        self.assertEqual(result["reason"], "current")

    def test_yesterday_source_is_overdue_after_evening_deadline(self):
        result = MONITOR.evaluate(date(2026, 11, 2), date(2026, 11, 1),
                                  date(2026, 11, 1), True)
        self.assertTrue(result["stale"])
        self.assertEqual(result["reason"], "editorial_source_overdue")
        self.assertEqual(result["age"], 1)

    def test_recent_source_with_old_publication_is_not_falsely_cleared(self):
        result = MONITOR.evaluate(date(2026, 11, 2), date(2026, 11, 1),
                                  date(2026, 10, 26), True)
        self.assertTrue(result["stale"])
        self.assertIn("live_missing_or_behind_sources", result["reason"])

    def test_unreachable_live_site_does_not_clear_incident(self):
        result = MONITOR.evaluate(date(2026, 11, 2), date(2026, 11, 1), None, False)
        self.assertTrue(result["stale"])

    def test_outdated_editorial_source_stays_overdue_even_if_deployed(self):
        result = MONITOR.evaluate(date(2026, 11, 2), date(2026, 10, 31),
                                  date(2026, 10, 31), True)
        self.assertTrue(result["stale"])
        self.assertIn("editorial_source_overdue", result["reason"])

    def test_release_check_requires_deployment_parity_not_daily_freshness(self):
        result = MONITOR.evaluate(date(2026, 11, 2), date(2026, 10, 26),
                                  date(2026, 10, 26), True, deployment_only=True)
        self.assertFalse(result["stale"])
        result["live_latest"] = "2026-10-25"
        self.assertTrue(MONITOR.evaluate(date(2026, 11, 2), date(2026, 10, 26),
                                         date(2026, 10, 25), True, deployment_only=True)["stale"])

    def test_watchdog_regenerates_catalog_and_triggers_on_source_updates(self):
        workflow = (ROOT / ".github/workflows/current-affairs-freshness.yml").read_text()
        self.assertIn("current-affairs/text/data/**", workflow)
        self.assertIn("python3 current-affairs/text/build_text_editions.py", workflow)
        self.assertIn("python3 scripts/check_current_affairs_freshness.py", workflow)
        self.assertLess(workflow.index("python3 current-affairs/text/build_text_editions.py"),
                        workflow.index("python3 scripts/check_current_affairs_freshness.py"))

    def test_pages_release_checks_live_edition_after_deploy(self):
        workflow = (ROOT / ".github/workflows/jekyll-gh-pages.yml").read_text()
        self.assertIn("Verify deployed Current Affairs text edition matches vetted sources", workflow)
        self.assertIn("--deployment-only", workflow)
        self.assertLess(workflow.index("id: deployment"),
                        workflow.index("Verify deployed Current Affairs text edition matches vetted sources"))


if __name__ == "__main__":
    unittest.main()
