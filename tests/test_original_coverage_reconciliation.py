#!/usr/bin/env python3
"""Regression tests: current catalogue detail counts must not be conflated with old totals."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/report_original_tn_coverage.py"
SPEC = importlib.util.spec_from_file_location("original_coverage_report", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class OriginalCoverageReconciliationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf-8"))
        cls.current = {
            6: (4, 5), 7: (4, 5), 8: (5, 6), 9: (5, 6),
            10: (5, 6), 11: (39, 43), 12: (39, 43),
        }
        pages = [
            {"class": klass, "medium": medium, "books_listed": count}
            for klass, pair in cls.current.items()
            for medium, count in zip(("english-medium", "tamil-medium"), pair)
        ]
        cls.inventory = {"summary": {"unique_books_listed": 215, "errors": 0},
                         "per_class_medium": pages}

    def test_live_and_historical_counts_are_not_conflated(self):
        result = MODULE.report(self.manifest, self.inventory)
        self.assertEqual(result["baseline_archive_listings"], 251)
        self.assertEqual(result["latest_archive_listings"], 215)
        self.assertEqual(result["manifest_records"], len(self.manifest["volumes"]))
        self.assertFalse(result["manifest_is_exhaustive"])
        self.assertFalse(result["latest_catalogue_has_complete_coverage"])
        self.assertEqual(result["original_textbooks_fully_certified"], 0)
        self.assertEqual(result["errors"], [])
        self.assertEqual(len(result["by_class"]), 7)
        self.assertEqual(result["by_class"][5]["latest_archive_detail_pages"], {"en": 39, "ta": 43})
        self.assertEqual(result["by_class"][5]["difference_from_historical"], {"en": -1, "ta": -1})

    def test_count_mismatch_fails_loudly(self):
        inventory = {"summary": {"unique_books_listed": 260},
                     "per_class_medium": self.inventory["per_class_medium"]}
        result = MODULE.report(self.manifest, inventory)
        self.assertTrue(any("disagree" in e for e in result["errors"]))

    def test_missing_live_catalogue_does_not_claim_251_is_current(self):
        result = MODULE.report(self.manifest, None)
        self.assertEqual(result["baseline_archive_listings"], 251)
        self.assertIsNone(result["latest_archive_listings"])
        self.assertFalse(result["live_inventory_available"])
        self.assertFalse(result["baseline_is_complete_current_editions"])

if __name__ == "__main__":
    unittest.main()
