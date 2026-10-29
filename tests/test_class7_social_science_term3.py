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
        self.assertEqual(sum(u["total"] for u in index["units"]), 200)
        self.assertEqual(sum(u["quiz_count"] for u in index["units"]), 10)
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

    def test_geography_natural_hazards_quiz_bilingual_and_complete(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        unit = index["units"][5]
        self.assertEqual(unit["id"], 6)
        self.assertTrue(unit["ready"])
        self.assertEqual(unit["total"], 20)
        self.assertEqual(unit["quiz_count"], 1)
        bank = json.loads((TERM / unit["path"]).read_text(encoding="utf-8"))
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["unit"], 6)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        qs = bank["questions"]
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U6-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        self.assertEqual(len({q["q_en"].casefold() for q in qs}), 20)
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
                # Page numbers cannot be invented before checking the printed book.
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)
        # Guard an important conceptual distinction used in competitive exams.
        first = qs[0]
        self.assertIn("ability to cope", first["opts_en"][first["correct"]])

    def test_civics_women_empowerment_bilingual_quiz(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        unit = index["units"][6]
        self.assertEqual(unit["id"], 7)
        self.assertTrue(unit["ready"])
        self.assertEqual(unit["total"], 20)
        self.assertEqual(unit["quiz_count"], 1)
        bank = json.loads((TERM / unit["path"]).read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["unit"], 7)
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U7-Q{i:03d}" for i in range(1, 21)])
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
                self.assertGreaterEqual(len(q["exp_en"]), 67)
                self.assertGreaterEqual(len(q["exp_ta"]), 55)
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)
        # Avoid confusing female, male and overall Census 2011 literacy.
        female = next(q for q in qs if q["id"] == "C7SS3U7-Q008")
        self.assertEqual(female["opts_en"][female["correct"]], "65.46%")
        gap = next(q for q in qs if q["id"] == "C7SS3U7-Q009")
        self.assertEqual(gap["opts_en"][gap["correct"]],
                         "16.68 percentage points")

    def test_civics_market_consumer_protection_bilingual_quiz(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        entry = index["units"][7]
        self.assertEqual(entry["id"], 8)
        self.assertTrue(entry["ready"])
        self.assertEqual(entry["total"], 20)
        self.assertEqual(entry["quiz_count"], 1)
        bank = json.loads((TERM / entry["path"]).read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["unit"], 8)
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U8-Q{i:03d}" for i in range(1, 21)])
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
                self.assertGreaterEqual(len(q["exp_en"]), 67)
                self.assertGreaterEqual(len(q["exp_ta"]), 55)
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)
        # Distinguish current consumer-law dates from the older 1986 framework.
        act_date = next(q for q in qs if q["id"] == "C7SS3U8-Q019")
        self.assertEqual(act_date["opts_en"][act_date["correct"]],
                         "20 July 2020")
        authority = next(q for q in qs if q["id"] == "C7SS3U8-Q020")
        self.assertEqual(authority["opts_en"][authority["correct"]],
                         "Central Consumer Protection Authority (CCPA)")
        self.assertFalse(any(
            "pecuniary jurisdiction" in q["q_en"].lower() for q in qs))

    def test_civics_road_safety_bilingual_quiz(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        unit = index["units"][8]
        self.assertEqual(unit["id"], 9)
        self.assertTrue(unit["ready"])
        self.assertEqual(unit["total"], 20)
        self.assertEqual(unit["quiz_count"], 1)
        bank = json.loads((TERM / unit["path"]).read_text(encoding="utf-8"))
        qs = bank["questions"]
        self.assertEqual(bank["meta"]["unit"], 9)
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U9-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        self.assertEqual(len({q["q_en"].casefold() for q in qs}), 20)
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
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)
        # Mandatory, cautionary and informatory signs must not be conflated.
        no_entry = next(q for q in qs if q["id"] == "C7SS3U9-Q011")
        self.assertEqual(no_entry["opts_en"][no_entry["correct"]],
                         "Mandatory or regulatory sign")
        bend = next(q for q in qs if q["id"] == "C7SS3U9-Q012")
        self.assertEqual(bend["opts_en"][bend["correct"]],
                         "Cautionary or warning sign")
        hospital = next(q for q in qs if q["id"] == "C7SS3U9-Q013")
        self.assertEqual(hospital["opts_en"][hospital["correct"]],
                         "Informatory sign")

    def test_economics_tax_and_its_importance_bilingual_quiz(self):
        index = json.loads((TERM / "index.json").read_text(encoding="utf-8"))
        self.assertTrue(all(u["ready"] for u in index["units"]))
        self.assertEqual(sum(u["total"] for u in index["units"]), 200)
        self.assertEqual(sum(u["quiz_count"] for u in index["units"]), 10)
        unit = index["units"][9]
        self.assertEqual(unit["id"], 10)
        self.assertEqual(unit["total"], 20)
        self.assertEqual(unit["quiz_count"], 1)
        self.assertIn("வரி மற்றும் அதன் முக்கியத்துவம்", unit["unit_ta"])
        bank = json.loads((TERM / unit["path"]).read_text(encoding="utf-8"))
        self.assertEqual(bank["meta"]["unit"], 10)
        self.assertEqual(bank["meta"]["edition"], 2024)
        self.assertEqual(bank["meta"]["total_questions"], 20)
        self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
        qs = bank["questions"]
        self.assertEqual(len(qs), 20)
        self.assertEqual([q["id"] for q in qs],
                         [f"C7SS3U10-Q{i:03d}" for i in range(1, 21)])
        self.assertEqual([sum(q["correct"] == c for q in qs) for c in range(4)],
                         [5, 5, 5, 5])
        self.assertEqual(len({q["q_en"].casefold() for q in qs}), 20)
        for q in qs:
            with self.subTest(question=q["id"]):
                self.assertEqual(q["quiz"], 1)
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("according to the textbook", q["q_en"].lower())
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(v.casefold() for v in q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertGreaterEqual(len(q["exp_en"]), 65)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)
                self.assertNotIn("page", q)
                self.assertNotIn("page_en", q)
                self.assertNotIn("page_ta", q)
        # Keep the 2017 GST introduction date distinct from current slab rates.
        launched = next(q for q in qs if q["id"] == "C7SS3U10-Q016")
        self.assertEqual(launched["opts_en"][launched["correct"]],
                         "1 July 2017")
        intra = next(q for q in qs if q["id"] == "C7SS3U10-Q017")
        self.assertEqual(intra["opts_en"][intra["correct"]], "CGST and SGST")
        inter = next(q for q in qs if q["id"] == "C7SS3U10-Q018")
        self.assertEqual(inter["opts_en"][inter["correct"]], "IGST")
        arithmetic = next(q for q in qs if q["id"] == "C7SS3U10-Q019")
        self.assertEqual(arithmetic["opts_en"][arithmetic["correct"]],
                         "₹1,180")
        self.assertIn("illustrative", arithmetic["exp_en"].lower())

    def test_source_registry_has_separate_english_and_tamil_links(self):
        registry = json.loads((ROOT / "data/textbook/source-registry.json")
                              .read_text(encoding="utf-8"))
        src = registry["books"]["class-7/social-science/term-3"]
        self.assertIn("/file/d/", src["source_en_url"])
        self.assertIn("/file/d/", src["source_ta_url"])
        self.assertNotEqual(src["source_en_url"], src["source_ta_url"])


if __name__ == "__main__":
    unittest.main()
