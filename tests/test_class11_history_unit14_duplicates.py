"""Targeted editorial and structural regression checks for History Unit 14."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data/textbook/class-11/history/unit-14.json"
SPEC = importlib.util.spec_from_file_location("auditor", ROOT / "scripts/audit_textbook_repository.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)
IDS = (280, 281, 282, 466, 467, 468, 1617, 1618, 1619,
       1776, 1777, 1778, 1779, 1780, 1781, 1836, 1837, 1838, 1839, 1840, 1841)
PAGES = {280: 202, 466: 204, 1617: 217, 1776: 218, 1779: 218,
         1836: 218, 1839: 218}


class MughalUnit14Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(PATH.read_text(encoding="utf-8"))

    def test_21_corrected_questions_are_bilingual_and_unambiguous(self):
        self.assertEqual(len(self.bank["questions"]), 2613)
        for number in IDS:
            with self.subTest(number=number):
                q = self.bank["questions"][number - 1]
                self.assertEqual(q["id"], f"C11H14-Q{number:04d}")
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len({x.casefold().strip() for x in q["opts_en"]}), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertTrue(q["opts_en"][q["correct"]])
                self.assertTrue(q["opts_ta"][q["correct"]])
                self.assertTrue(q["exp_en"] and q["exp_ta"])
                if number in PAGES:
                    self.assertEqual(q["page_en"], PAGES[number])
                    self.assertNotIn("correct textbook answer for", q["q_en"].casefold())

    def test_entire_bank_has_no_remaining_structural_errors(self):
        result = AUDIT.audit_bank(PATH, self.bank)
        self.assertEqual(result["errors"], [])


if __name__ == "__main__":
    unittest.main()
