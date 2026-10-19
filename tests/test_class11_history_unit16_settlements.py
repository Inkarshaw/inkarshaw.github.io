"""Regression tests for Class 11 History Unit 16 European settlements."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data/textbook/class-11/history/unit-16.json"
SPEC = importlib.util.spec_from_file_location("auditor", ROOT / "scripts/audit_textbook_repository.py")
AUDITOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDITOR)

CORRECT = {
    930: "Karaikal", 931: "Karaikal", 932: "Karaikal",
    939: "Chandranagore", 940: "Chandranagore", 941: "Chandranagore",
    942: "Balasore", 943: "Balasore", 944: "Balasore",
    972: "Karaikkal", 973: "Karaikkal", 974: "Karaikkal",
    999: "Balasore", 1000: "Balasore", 1001: "Balasore",
}


class EuropeanSettlementsUnit16Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(PATH.read_text(encoding="utf-8"))

    def test_all_15_reviewed_questions_are_distinct_and_aligned(self):
        self.assertEqual(len(self.bank["questions"]), 2385)
        for number, correct in CORRECT.items():
            with self.subTest(number=number):
                q = self.bank["questions"][number-1]
                self.assertEqual(q["id"], f"C11H16-Q{number:04d}")
                self.assertEqual(q["page_en"], 252)
                self.assertEqual(q["opts_en"][q["correct"]], correct)
                self.assertEqual(len({opt.casefold() for opt in q["opts_en"]}), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertTrue(q["q_ta"] and q["exp_ta"])
                if number in (930, 939, 942, 972, 999):
                    self.assertNotIn("textbook answer", q["q_en"].casefold())

    def test_distinct_bengal_french_settlements_have_specific_stems(self):
        first, second = self.bank["questions"][938], self.bank["questions"][941]
        self.assertNotEqual(first["q_en"], second["q_en"])
        self.assertEqual(first["opts_en"][first["correct"]], "Chandranagore")
        self.assertEqual(second["opts_en"][second["correct"]], "Balasore")

    def test_full_unit_has_zero_structural_errors(self):
        result = AUDITOR.audit_bank(PATH, self.bank)
        self.assertEqual(result["errors"], [])


if __name__ == "__main__":
    unittest.main()
