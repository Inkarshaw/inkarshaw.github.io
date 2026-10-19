"""Tests for the official exam calendar importer (no network required)."""
import importlib.util
import pathlib
import unittest
from datetime import date

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "sync_exam_calendar.py"
spec = importlib.util.spec_from_file_location("sync_exam_calendar", SCRIPT)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

ROW = """<table><tr><th>Notification</th></tr><tr>
<td>11/2026</td><td>06/10/2026</td>
<td>Combined Civil Services Examination - IV (Group IV Services)</td>
<td>06/10/2026</td><td>05/11/2026</td><td>05/11/2026</td>
<td><a href="https://tnpsc.gov.in/english.pdf">English</a></td>
<td>10/01/2027</td><td>Apply Now</td></tr></table>"""


class ExamCalendarTests(unittest.TestCase):
    def test_correct_official_date_mapping(self):
        entry = sync.parse(ROW, date(2026, 10, 19))[0]
        self.assertEqual(entry["id"], "tnpsc-group-4-2026")
        self.assertEqual(entry["applicationEnd"], "2026-11-05")
        self.assertEqual(entry["examDate"], "2027-01-10")
        self.assertEqual(entry["official"], "https://tnpsc.gov.in/english.pdf")

    def test_fail_closed_without_table(self):
        with self.assertRaises(ValueError):
            sync.parse("<table></table>", date(2026, 10, 19))
        with self.assertRaises(ValueError):
            sync.parse(ROW.replace("<td>05/11/2026</td>", "<td>unknown</td>", 1), date(2026, 10, 19))

    def test_multi_date_does_not_guess(self):
        value = sync.parse(ROW.replace("10/01/2027", "10/01/2027 and 11/01/2027"), date(2026, 10, 19))[0]
        self.assertIsNone(value["examDate"])

    def test_merge_replaces_tentative_entry_without_duplicate(self):
        original = {"checkedOn": "2026-09-11", "entries": [
            {"id": "tnpsc-group-4-2026", "category": "tnpsc", "kind": "planned", "examDate": "2026-12-20"}
        ]}
        entries = sync.parse(ROW, date(2026, 10, 19))
        result, changed = sync.merge(original, entries, date(2026, 10, 19))
        self.assertTrue(changed)
        self.assertEqual(len(result["entries"]), 1)
        self.assertEqual(result["entries"][0]["examDate"], "2027-01-10")
        again, changed = sync.merge(result, entries, date(2026, 10, 19))
        self.assertFalse(changed)
        self.assertEqual(again, result)


if __name__ == "__main__":
    unittest.main()
