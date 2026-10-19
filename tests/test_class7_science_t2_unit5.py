"""Regression checks for Class 7 Science Term II Unit 5 scientific naming."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data/textbook/class-7/science/term-2/unit-5.json"
SPEC = importlib.util.spec_from_file_location(
    "textbook_repository_audit", ROOT / "scripts/audit_textbook_repository.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class BinomialNomenclatureTests(unittest.TestCase):
    def test_final_question_follows_source_naming_convention(self):
        bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
        self.assertEqual(len(bank["questions"]), 200)
        item = bank["questions"][-1]
        self.assertEqual(item["id"], "C07S-T2-U05-Q0200")
        self.assertEqual(item["page_en"], 83)
        self.assertIn("binomial nomenclature", item["q_en"].lower())
        self.assertEqual(item["opts_en"][item["correct"]],
                         "Genus uppercase; species lowercase")
        self.assertEqual(item["opts_ta"][item["correct"]],
                         "பேரினம் பெரிய எழுத்து; சிற்றினம் சிறிய எழுத்து")
        self.assertNotIn("Allium sativum", item["q_en"] + item["exp_en"])

    def test_bank_contains_no_structural_errors(self):
        bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
        result = MODULE.audit_bank(BANK_PATH, bank)
        self.assertEqual(result["errors"], [])


if __name__ == "__main__":
    unittest.main()
