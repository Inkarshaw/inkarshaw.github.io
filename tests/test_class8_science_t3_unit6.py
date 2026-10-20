#!/usr/bin/env python3
"""Structural and catalogue checks for Class 8 Science Term III Unit 6."""
import json
import importlib.util
from collections import Counter
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data/textbook/class-8/science/term-3/unit-6.json"
BANK = json.loads(BANK_PATH.read_text(encoding="utf-8"))
INDEX = json.loads(
    (BANK_PATH.parent / "index.json").read_text(encoding="utf-8")
)
SPEC = importlib.util.spec_from_file_location(
    "textbook_batch_audit", ROOT / "scripts/audit_textbook_quiz_quality.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class Class8ScienceTerm3Unit6Tests(unittest.TestCase):
    def test_unit_is_catalogued_as_a_complete_bilingual_batch(self):
        entry = next(unit for unit in INDEX["units"] if unit["id"] == 6)
        self.assertTrue(entry["ready"])
        self.assertEqual(entry["path"], "unit-6.json")
        self.assertEqual(entry["total"], 20)
        self.assertEqual(INDEX["meta"]["total_questions"], 180)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 9)
        self.assertTrue(BANK["meta"].get("source_en_url"))
        self.assertTrue(BANK["meta"].get("source_ta_url"))

    def test_quiz_source_link_uses_the_matching_textbook_edition(self):
        page = (ROOT / "textbook-play.html").read_text(encoding="utf-8")
        helper = page.split("function safeSourceUrl(q){", 1)[1].split("\n}", 1)[0]
        self.assertIn("meta.source_en_url", helper)
        self.assertIn("meta.source_ta_url", helper)

    def test_twenty_questions_pass_structural_review_with_balanced_keys(self):
        questions = BANK["questions"]
        self.assertEqual(len(questions), 20)
        result = MODULE.audit(questions, start=0, count=20)
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["warnings"], [])
        self.assertEqual(Counter(result["answer_positions"].values()), Counter({5: 4}))
        self.assertEqual(len({q["q_en"].casefold().strip() for q in questions}), 20)
        self.assertTrue(all(q.get("page") and q.get("page_ta") for q in questions))


if __name__ == "__main__":
    unittest.main()
