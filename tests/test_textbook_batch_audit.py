#!/usr/bin/env python3
"""Regression tests for the reusable bilingual 100-question editorial gate."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "textbook_batch_audit", ROOT / "scripts/audit_textbook_quiz_quality.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
BANK = json.loads(
    (ROOT / "data/textbook/class-11/history/unit-04.json").read_text(encoding="utf-8")
)


class BilingualBatchAuditTests(unittest.TestCase):
    def test_quizzes_nine_through_thirteen_pass_quality_gate(self):
        result = MODULE.audit(BANK["questions"], start=160, count=100)
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["reviewed_quizzes"], "9–13")
        self.assertEqual(sum(result["answer_positions"].values()), 100)

    def test_flags_repeated_distractors_and_incomplete_tamil(self):
        records = copy.deepcopy(BANK["questions"])
        records[160]["opts_ta"][1] = records[160]["opts_ta"][0]
        records[161]["q_ta"] = ""
        result = MODULE.audit(records, start=160, count=100)
        self.assertTrue(any("duplicate ta distractors" in item for item in result["errors"]))
        self.assertTrue(any("missing q_ta" in item for item in result["errors"]))

    def test_flags_mixed_type_answers_and_mechanical_stems(self):
        records = copy.deepcopy(BANK["questions"])
        records[160]["opts_en"][0] = "Not yet deciphered"
        records[161]["q_en"] = "What is the correct textbook answer for: a ruler?"
        result = MODULE.audit(records, start=160, count=100)
        self.assertTrue(any("mixed chronology" in item for item in result["errors"]))
        self.assertTrue(any("machine-generated question stem" in item for item in result["errors"]))

    def test_flags_numerical_tamil_answer_mismatch(self):
        records = copy.deepcopy(BANK["questions"])
        records[160]["opts_ta"][records[160]["correct"]] = "பொ.ஆ.மு. 999"
        result = MODULE.audit(records, start=160, count=100)
        self.assertTrue(any("numerical answer differs" in item for item in result["errors"]))

    def test_rejects_partial_quiz_windows(self):
        with self.assertRaisesRegex(ValueError, "20-question"):
            MODULE.audit(BANK["questions"], start=160, count=99)


if __name__ == "__main__":
    unittest.main()
