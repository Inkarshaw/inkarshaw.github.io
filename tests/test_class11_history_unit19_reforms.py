"""Targeted content and structural regressions for Class 11 History Unit 19."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/textbook/class-11/history/unit-19.json"
SPEC = importlib.util.spec_from_file_location(
    "repository_textbook_audit", ROOT / "scripts/audit_textbook_repository.py"
)
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

KEYS = {
    154: ("Polytheism", 300),
    155: ("Raja Rammohan Roy", 300),
    156: ("54", 300),
    157: ("Idol worship", 300),
    158: ("Caste system", 300),
    159: ("Child marriage", 300),
    160: ("Faith in divine avatars", 300),
    161: ("Sati", 300),
    162: ("Widow remarriage", 300),
    322: ("Puranas", 301),
    323: ("Dayananda Saraswati", 301),
    324: ("Back to the Vedas", 301),
    508: ("Equality", 302),
    509: ("Jyotiba Phule", 302),
    510: ("Gulamgiri (Slavery)", 302),
    511: ("Rationality", 302),
    512: ("Poona (Pune)", 302),
    513: ("Savitri Phule", 302),
    811: ("Sufism", 305),
    812: ("Lucknow", 305),
    813: ("Sayings of the Prophet", 305),
}


class ModernityUnit19Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(BANK.read_text(encoding="utf-8"))

    def test_revised_mcqs_are_distinct_and_bilingual(self):
        records = self.bank["questions"]
        self.assertEqual(len(records), 1507)
        stems = set()
        for n, (answer, printed_page) in KEYS.items():
            with self.subTest(question=n):
                item = records[n - 1]
                self.assertEqual(item["id"], f"C11H19-Q{n:04d}")
                self.assertEqual(item["type"], "direct")
                self.assertEqual(item["page_en"], printed_page)
                self.assertEqual(item["opts_en"][item["correct"]], answer)
                self.assertEqual(len(item["opts_en"]), 4)
                self.assertEqual(len(item["opts_ta"]), 4)
                self.assertEqual(len({s.casefold().strip() for s in item["opts_en"]}), 4)
                self.assertEqual(len(set(item["opts_ta"])), 4)
                self.assertTrue(item["opts_ta"][item["correct"]])
                self.assertTrue(item["q_ta"] and item["exp_ta"] and item["exp_en"])
                self.assertNotIn("textbook answer", item["q_en"].casefold())
                self.assertNotIn(item["q_en"], stems)
                stems.add(item["q_en"])

    def test_bank_structure_is_valid(self):
        report = AUDIT.audit_bank(BANK, self.bank)
        self.assertEqual(report["errors"], [])


if __name__ == "__main__":
    unittest.main()
