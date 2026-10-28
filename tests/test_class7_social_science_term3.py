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
        self.assertEqual(sum(u["total"] for u in index["units"]), 100)
        self.assertEqual(sum(u["quiz_count"] for u in index["units"]), 5)
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

    def test_third_history_quiz_is_complete_and_bilingual(self):
        bank = json.loads((TERM / "unit-3.json").read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["unit"], 3)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(qs), 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U3-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        stems = [q["q_en"].strip().casefold() for q in qs]
        self.assertEqual(len(set(stems)), 20)
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
                self.assertGreaterEqual(len(q["exp_en"]), 65)
                self.assertGreaterEqual(len(q["exp_ta"]), 55)
                # Source chapter spans are cited in metadata until individual page
                # numbers are independently mapped; do not invent q.page.
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)

    def test_geography_unit_one_bilingual_continents_quiz(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        entry = index["units"][3]
        self.assertEqual(entry["id"], 4)
        self.assertEqual(entry["total"], 20)
        self.assertEqual(entry["quiz_count"], 1)
        self.assertTrue(entry["ready"])
        bank = json.loads((TERM / entry["path"]).read_text(encoding="utf-8"))
        self.assertEqual(bank["meta"]["unit"], 4)
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        qs = bank["questions"]
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U4-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        self.assertEqual(len({q["q_en"].casefold() for q in qs}), 20)
        # Ten North America and ten South America questions, with answers
        # independently checked against the cited English and Tamil lessons.
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
                self.assertGreaterEqual(len(q["exp_ta"]), 55)
                # Do not fabricate pages: references are to the chapter span
                # until question-by-question source pagination is certified.
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)

    def test_geography_map_reading_quiz_bilingual_and_complete(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        unit = index["units"][4]
        self.assertEqual(unit["id"], 5)
        self.assertTrue(unit["ready"])
        self.assertEqual(unit["total"], 20)
        self.assertEqual(unit["quiz_count"], 1)
        bank = json.loads((TERM / unit["path"]).read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["unit"], 5)
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U5-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        self.assertEqual(len(set(q["q_en"].casefold() for q in qs)), 20)
        for q in qs:
            with self.subTest(question=q["id"]):
                self.assertEqual(q["quiz"], 1)
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("according to the textbook", q["q_en"].lower())
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(x.casefold() for x in q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertGreaterEqual(len(q["exp_en"]), 70)
                self.assertGreaterEqual(len(q["exp_ta"]), 55)
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)
        # Verify that numerical scale question has the expected correct result.
        scale = next(q for q in qs if q["id"] == "C7SS3U5-Q002")
        self.assertEqual(scale["opts_en"][scale["correct"]], "40 km")
        self.assertEqual(scale["opts_ta"][scale["correct"]], "40 கி.மீ.")

    def test_source_registry_has_separate_english_and_tamil_links(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json")
                              .read_text(encoding="utf-8"))
        src = registry["books"]["class-7/social-science/term-3"]
        self.assertIn("/file/d/", src["source_en_url"])
        self.assertIn("/file/d/", src["source_ta_url"])
        self.assertNotEqual(src["source_en_url"], src["source_ta_url"])


if __name__ == "__main__":
    unittest.main()
