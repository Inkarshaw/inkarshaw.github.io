#!/usr/bin/env python3
"""Tests for the repository-wide structural quiz validator."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "textbook_repository_audit", ROOT / "scripts/audit_textbook_repository.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def question(**changes):
    record = {
        "id": "TEST-Q1",
        "q_en": "Which option correctly identifies the force that attracts objects toward Earth?",
        "q_ta": "பொருள்களைப் பூமியை நோக்கி ஈர்க்கும் விசை எது?",
        "opts_en": ["Gravity", "Friction", "Magnetism", "Buoyancy"],
        "opts_ta": ["ஈர்ப்பு விசை", "உராய்வு விசை", "காந்த விசை", "மிதப்பு விசை"],
        "correct": 0,
        "exp_en": "Gravity attracts objects with mass toward one another; near Earth, it pulls objects toward Earth's centre.",
        "exp_ta": "நிறையுள்ள பொருள்கள் ஒன்றையொன்று ஈர்ப்பது ஈர்ப்பு விசையாகும்; பூமிக்கு அருகில் அது பொருள்களை மையத்தை நோக்கி இழுக்கிறது.",
    }
    record.update(changes)
    return record


class RepositoryQuizAuditTests(unittest.TestCase):
    def test_accepts_complete_bilingual_mcq(self):
        result = MODULE.audit_bank(Path("fixture.json"), {"questions": [question()]})
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["warnings"], [])

    def test_rejects_bad_answer_index_and_repeated_options(self):
        record = question(correct=True)
        record["opts_en"][3] = record["opts_en"][2]
        result = MODULE.audit_bank(Path("fixture.json"), {"questions": [record]})
        self.assertTrue(any("duplicate English options" in item for item in result["errors"]))
        self.assertTrue(any("correct must be an integer" in item for item in result["errors"]))

    def test_flags_untranslated_or_repeated_stems_for_editorial_review(self):
        first = question(q_ta="Which option describes gravity?")
        second = question(id="TEST-Q2", q_en=first["q_en"])
        result = MODULE.audit_bank(Path("fixture.json"), {"questions": [first, second]})
        self.assertTrue(any("no Tamil script" in item for item in result["warnings"]))
        self.assertTrue(any("repeated English stem" in item for item in result["warnings"]))
        self.assertEqual(result["errors"], [])

    def test_rejects_wrong_shape(self):
        result = MODULE.audit_bank(Path("fixture.json"), {"meta": {}})
        self.assertTrue(any("questions array" in item for item in result["errors"]))

    def test_shared_formula_choices_do_not_trigger_missing_answer_echo(self):
        record = question(
            opts_en=["H₂O", "H₂O₂", "HO₂", "H₃O"],
            opts_ta=["H₂O", "H₂O₂", "HO₂", "H₃O"],
            exp_en="One molecule contains two hydrogen atoms and one oxygen atom.",
            exp_ta="ஒரு மூலக்கூறில் இரண்டு ஹைட்ரஜன் அணுக்களும் ஓர் ஆக்சிஜன் அணுவும் உள்ளன.",
        )
        result = MODULE.audit_bank(Path("fixture.json"), {"questions": [record]})
        self.assertFalse(any("does not name the keyed option" in item for item in result["warnings"]))

    def test_cli_rejects_valid_json_bank_missing_questions_array(self):
        with tempfile.TemporaryDirectory() as directory:
            bank = Path(directory) / "unit-1.json"
            bank.write_text(json.dumps({"meta": {"class": 8}}), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts/audit_textbook_repository.py"), str(bank)],
                text=True, capture_output=True, check=False,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("bank must be an object with a questions array", result.stdout)


if __name__ == "__main__":
    unittest.main()
