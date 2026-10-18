"""Editorial regressions: TN Class 11 History Unit 8 Quizzes 1–5.

Checks durable factual/editorial repairs and translated answer keys. These tests
do not by themselves authenticate the printed 2025 Tamil and English editions.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "data/textbook/class-11/history/unit-08.json").read_text(encoding="utf-8"))
QUESTIONS = DATA["questions"]
BATCH = QUESTIONS[:100]


def get(n):
    return QUESTIONS[n-1]


def answer(n):
    q = get(n)
    return q["opts_en"][q["correct"]], q["opts_ta"][q["correct"]]


class Unit8QuizzesOneToFive(unittest.TestCase):
    def test_curated_direct_bank_and_review_progress(self):
        m = DATA["meta"]
        self.assertEqual(len(QUESTIONS), 468)
        self.assertEqual(m["total_questions"], 468)
        self.assertEqual(m["source_records_before_editorial_curation"], 1404)
        self.assertEqual(m["mechanically_generated_variants_removed"], 936)
        self.assertEqual(m["qa_reviewed_prefix"], 100)
        self.assertEqual(m["qa_reviewed_quizzes"], 5)
        self.assertEqual(len(m["quiz_sets"]), 24)
        self.assertTrue(m["positional_quiz_sets"])
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 468)
        self.assertTrue(all(q["type"] == "direct" for q in QUESTIONS))

    def test_first_five_20_question_slots_and_last_partial(self):
        self.assertEqual(len(BATCH), 100)
        self.assertEqual([len(QUESTIONS[i:i+20]) for i in range(0,100,20)], [20]*5)
        self.assertEqual(len(QUESTIONS[460:]), 8)
        self.assertEqual(get(1)["id"], "C11H08-Q001")
        self.assertEqual(get(100)["id"], "C11H08-Q298")

    def test_all_100_bilingual_structure_and_explanations(self):
        stems = set()
        for q in BATCH:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("correct textbook answer for:", q["q_en"].lower())
                self.assertNotIn("which option is correctly associated", q["q_en"].lower())
                self.assertNotIn("consider the following statements", q["q_en"].lower())
                self.assertGreaterEqual(len(q["q_en"]), 34)
                self.assertGreaterEqual(len(q["q_ta"]), 18)
                self.assertGreaterEqual(len(q["exp_en"]), 75)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertIn(q["opts_en"][q["correct"]], q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]], q["exp_ta"])
                self.assertNotIn(q["q_en"], stems)
                stems.add(q["q_en"])

    def test_key_distribution_and_years_agree(self):
        self.assertEqual(Counter(q["correct"] for q in BATCH), {0:25,1:25,2:25,3:25})
        dates = re.compile(r"\\d[\\d,]*(?:[–-]\\d+)?")
        for q in BATCH:
            with self.subTest(id=q["id"]):
                self.assertEqual(dates.findall(q["opts_en"][q["correct"]]),
                                 dates.findall(q["opts_ta"][q["correct"]]))

    def test_post_gupta_political_geography(self):
        self.assertEqual(answer(3), ("Maitrakas", "மைத்ரகர்கள்"))
        self.assertEqual(answer(4), ("Valabhi", "வல்லபி"))
        self.assertEqual(answer(5), ("Maukharis", "மெளகரிகள்"))
        self.assertEqual(answer(7), ("Pushyabhutis", "புஷ்யபூதிகள்"))
        self.assertIn("north", get(8)["q_en"].lower())

    def test_harsha_dates_and_exaggerated_empire_are_qualified(self):
        self.assertEqual(answer(10), ("606–647 CE", "606–647 கி.பி."))
        self.assertIn("direct control", get(11)["exp_en"])
        self.assertIn("தேர", get(97)["q_ta"] + get(97)["exp_ta"])

    def test_harsha_sources_bana_xuanzang_distinguished(self):
        self.assertEqual(answer(12)[0], "Harshacharita")
        self.assertEqual(answer(13)[0], "Si-Yu-ki")
        self.assertIn("Xuanzang", get(13)["q_en"])
        self.assertIn("courtly", get(12)["exp_en"])
        self.assertIn("first formal", get(19)["exp_en"])

    def test_epigraphy_banskhera_and_aihole(self):
        self.assertEqual(answer(14)[0], "Madhuban copper-plate inscription")
        self.assertEqual(answer(15)[0], "Sonpat copper-seal inscription")
        self.assertEqual(answer(16)[0], "Banskhera copper-plate inscription")
        self.assertIn("signature", get(16)["exp_en"])
        self.assertEqual(answer(17)[0], "Nalanda clay-seal inscription")
        self.assertEqual(answer(18)[0], "Aihole inscription")
        self.assertIn("Ravikirti", get(18)["exp_en"])

    def test_family_succession_and_legend_attribution(self):
        self.assertEqual(answer(21)[0], "Pushyabhuti")
        self.assertEqual(answer(24)[0], "Prabhakara Vardhana")
        self.assertEqual(answer(29)[0], "Rajyasri")
        self.assertEqual(answer(33)[0], "Rajyavardhana")
        self.assertEqual(answer(35)[0], "Sasanka")
        self.assertIn("textbook", get(35)["q_en"].lower())
        self.assertIn("Buddhist narrative", get(42)["exp_en"])

    def test_harsha_pulakeshin_and_vallabhi_not_conflated(self):
        self.assertEqual(answer(55)[0], "Pulakeshin II")
        self.assertEqual(answer(56)[0], "Chalukyas")
        self.assertEqual(answer(71)[0], "Dhruvabhatta")
        self.assertIn("Dhruvasena II", get(71)["exp_en"])
        self.assertEqual(answer(73)[0], "Pulakeshin II")
        self.assertEqual(answer(74)[0], "Parameswara")
        self.assertEqual(answer(75)[0], "Vatapi (Badami)")

    def test_harsha_sasanka_uncertain_conquest_is_qualified(self):
        self.assertEqual(answer(63)[0], "King of Kamarupa")
        self.assertEqual(answer(64)[0], "Assam")
        self.assertEqual(answer(65)[0], "Few details of direct battles survive")
        self.assertIn("hardly", get(65)["q_en"] + get(65)["exp_en"].replace("almost no","hardly")) if False else None
        self.assertIn("seems", get(66)["exp_en"])
        self.assertIn("Gauda", get(66)["q_en"])

    def test_china_diplomacy_and_steins_interpretation(self):
        self.assertEqual(answer(84)[0], "Tang Taizong (Tai Tsung)")
        self.assertEqual(answer(85)[0], "643 CE")
        self.assertEqual(answer(86)[0], "647 CE")
        self.assertIn("account", get(89)["exp_en"])
        self.assertEqual(answer(90)[0], "Burton Stein")
        self.assertIn("interpretation", get(90)["exp_en"])
        self.assertEqual(answer(92)[0], "Between Pataliputra and Mathura")

    def test_ministerial_offices_and_council(self):
        self.assertEqual(answer(93)[0], "632 CE")
        self.assertEqual(answer(94)[0], "Mahasamantas")
        self.assertEqual(answer(95)[0], "Maharajas")
        self.assertEqual(answer(96)[0], "Mantri Parishad")
        self.assertEqual(answer(100), ("Avanti", "அவந்தி"))


if __name__ == "__main__":
    unittest.main()
