"""Validate published Class 7 Term III Social Science bilingual quizzes and catalogue."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
TERM = ROOT / "data" / "textbook" / "class-7" / "social-science" / "term-3"


class Class7Term3SocialScienceTests(unittest.TestCase):
    def test_index_publishes_only_existing_questions(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        self.assertEqual(index["meta"]["class"], 7)
        self.assertEqual(index["meta"]["term"], 3)
        self.assertEqual(index["meta"]["edition"], 2024)
        self.assertEqual(index["meta"]["unit_count"], 10)
        self.assertEqual(len(index["units"]), 10)
        self.assertEqual([u["id"] for u in index["units"]], list(range(1, 11)))
        self.assertEqual(sum(u["total"] for u in index["units"]), 40)
        self.assertEqual(sum(u["quiz_count"] for u in index["units"]), 2)
        for unit in index["units"]:
            if unit["ready"]:
                self.assertGreater(unit["total"], 0)
                self.assertGreater(unit["quiz_count"], 0)
                self.assertTrue((TERM / unit["path"]).is_file())
            else:
                self.assertEqual(unit["total"], 0)
                self.assertEqual(unit["quiz_count"], 0)
                self.assertFalse((TERM / unit["path"]).exists())

    def test_first_history_quiz_is_complete_and_bilingual(self):
        bank = json.loads((TERM / "unit-1.json").read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(qs), 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertTrue(all(q["quiz"] == 1 for q in qs))
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U1-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        for q in qs:
            with self.subTest(question=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("according to the textbook", q["q_en"].lower())
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(o.casefold() for o in q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertGreaterEqual(len(q["exp_en"]), 78)
                self.assertGreaterEqual(len(q["exp_ta"]), 55)

    def test_second_history_quiz_is_complete_and_bilingual(self):
        bank = json.loads((TERM / "unit-2.json").read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(bank["meta"]["unit"], 2)
        self.assertEqual(len(qs), 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U2-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        for q in qs:
            with self.subTest(question=q["id"]):
                self.assertEqual(q["quiz"], 1)
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("according to the textbook", q["q_en"].lower())
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(o.casefold() for o in q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertGreaterEqual(len(q["exp_en"]), 70)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)

    def test_source_registry_has_separate_english_and_tamil_links(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json")
                              .read_text(encoding="utf-8"))
        src = registry["books"]["class-7/social-science/term-3"]
        self.assertIn("/file/d/", src["source_en_url"])
        self.assertIn("/file/d/", src["source_ta_url"])
        self.assertNotEqual(src["source_en_url"], src["source_ta_url"])


if __name__ == "__main__":
    unittest.main()
