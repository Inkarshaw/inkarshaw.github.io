"""Editorial regressions for Class 11 History Unit 8 Quizzes 6–10.

Tests preserve 100 bilingual factual corrections without treating a traveller's
subjective descriptions as uniform facts about historical Indian society.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

DATA = json.loads(
    (Path(__file__).resolve().parents[1] / "data/textbook/class-11/history/unit-08.json")
    .read_text(encoding="utf-8")
)
QUESTIONS = DATA["questions"]
BATCH = QUESTIONS[100:200]


def get(position):
    return QUESTIONS[position - 1]


def key(position):
    q = get(position)
    return q["opts_en"][q["correct"]], q["opts_ta"][q["correct"]]


class Unit8QuizzesSixToTen(unittest.TestCase):
    def test_review_progress_and_unchanged_bank_size(self):
        self.assertEqual(len(QUESTIONS), 468)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]), 24)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"], 200)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"], 10)
        self.assertEqual(DATA["meta"]["total_questions"], 468)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"], 936)
        self.assertEqual([len(QUESTIONS[x:x+20]) for x in range(100,200,20)], [20]*5)
        self.assertEqual(get(101)["id"], "C11H08-Q301")
        self.assertEqual(get(200)["id"], "C11H08-Q598")
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 468)

    def test_all_100_bilingual_questions_use_relevant_four_choices(self):
        stems = set()
        for q in BATCH:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("correct textbook answer for", q["q_en"].lower())
                self.assertNotIn("correctly associated with", q["q_en"].lower())
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

    def test_balanced_keys_and_bilingual_numbers(self):
        self.assertEqual(Counter(q["correct"] for q in BATCH),
                         {0:25,1:25,2:25,3:25})
        pattern = re.compile(r"\d[\d,]*(?:[–-]\d+)?")
        for q in BATCH:
            with self.subTest(id=q["id"]):
                self.assertEqual(pattern.findall(q["opts_en"][q["correct"]]),
                                 pattern.findall(q["opts_ta"][q["correct"]]))

    def test_military_office_names_and_emperor_name_disambiguation(self):
        self.assertEqual(key(101)[0], "Simhananda")
        self.assertEqual(key(102)[0], "Kuntala")
        self.assertEqual(key(103)[0], "Skandagupta")
        self.assertIn("earlier Gupta emperor", get(103)["exp_en"])
        self.assertEqual(key(104)[0], "Dirghadhvajas")
        self.assertEqual(key(105)[0], "Banu")
        self.assertEqual(key(106)[0], "Mahaprathihara")
        self.assertEqual(key(107)[0], "Sarvagata")

    def test_three_tax_terms_and_bali_contradiction_repaired(self):
        self.assertEqual(key(108)[0], "Bhaga, Hiranya and Bali")
        self.assertIn("no specific reference", get(108)["exp_en"])
        self.assertEqual(key(109)[0], "Land tax paid in kind")
        self.assertEqual(key(110)[0], "One-sixth of produce")
        self.assertEqual(key(111)[0], "Cash tax paid by farmers and merchants")
        self.assertEqual(key(112)[0], "No specific reference to the levy of Bali is provided")
        self.assertIn("internally inconsistent", get(112)["exp_en"])
        self.assertIn("முரண்பாட்டை", get(112)["exp_ta"])

    def test_royal_revenue_allocation_distinct_uses(self):
        self.assertEqual([key(i)[0] for i in range(113,117)], [
            "Affairs of the state", "Paying ministers and crown officers",
            "Rewarding men of letters", "Charity to religious institutions"
        ])

    def test_criminal_law_and_ordeal_not_modern_scientific_proof(self):
        self.assertEqual(key(117)[0], "More severe")
        self.assertEqual(key(118)[0], "Mimamsakas")
        self.assertEqual(key(119)[0], "Banishment")
        self.assertEqual(key(120)[0], "Cutting of limbs")
        self.assertEqual(key(121)[0], "Trial by ordeal")
        self.assertIn("not equivalent to reliable scientific", get(121)["exp_en"])
        self.assertEqual(key(122)[0], "Life imprisonment")
        self.assertEqual(key(123)[0], "Usually avoided")
        self.assertEqual(key(124)[0], "Maiming")

    def test_army_structure_and_geographic_control_qualified(self):
        self.assertEqual(key(127)[0], "Elephants, cavalry and infantry")
        self.assertIn("chaturanga", get(127)["exp_en"])
        self.assertEqual(key(129)[0], "Chatas and Bhatas")
        self.assertEqual(key(130)[0], "Brihadisvaras")
        self.assertEqual(key(131)[0], "Baladhikritas and Mahabaladhikritas")
        self.assertEqual(key(132)[0], "Chaturanga")

    def test_administrative_levels_and_unknown_local_official_roles(self):
        self.assertEqual([key(i)[0] for i in range(133,137)],
                         ["Bhukti", "Vishaya", "Pathaka", "Villages"])
        self.assertEqual([key(i)[0] for i in range(137,140)],
                         ["Bhogapathi", "Ayuktha", "Pratpalaka-purusha"])
        self.assertIn("precise duties", get(140)["q_en"])

    def test_xuanzang_source_attributions_and_caution(self):
        self.assertEqual(key(141)[0], "Xuanzang (Hieun Tsang)")
        self.assertEqual(key(142)[0], "Nearly 13 years")
        self.assertEqual(key(143)[0], "630–643 CE")
        self.assertEqual(key(144)[0], "Si-Yu-Ki")
        self.assertIn("not a crime-statistics", get(146)["exp_en"])
        self.assertEqual(key(147)[0], "Pataliputra")
        self.assertEqual(key(148)[0], "Kanauj")
        self.assertEqual(key(158)[0], "612 CE")
        self.assertIn("other scholarly chronologies vary", get(158)["exp_en"])
        self.assertEqual(key(160)[0], "Five years")

    def test_welfare_does_not_claim_modern_hospital_standard(self):
        self.assertEqual(key(153)[0], "Cow dung")
        self.assertIn("not a modern public-health", get(153)["exp_en"])
        self.assertEqual(key(154)[0], "Kiln-fired bricks, red sandstone and marble")
        self.assertEqual(key(155)[0], "Viharas, monasteries and stupas")
        self.assertEqual(key(156)[0], "Rest houses or dharmasalas")
        self.assertEqual(key(157)[0], "Free medical care at hospitals")

    def test_religion_and_assemblies_are_factually_distinct(self):
        self.assertEqual(key(164)[0], "Worshipper of Siva")
        self.assertEqual(key(165)[0], "Buddhism")
        self.assertEqual(key(167)[0], "Mahayana")
        self.assertEqual(key(170)[0], "643 CE")
        self.assertEqual(key(171)[0], "Kanauj")
        self.assertEqual(key(172)[0], "Prayag")
        self.assertEqual(key(173)[0], "20")
        self.assertEqual(key(174)[0], "Bhaskaravarman")
        self.assertEqual(key(178)[0], "Mahamoksha Parishad")
        self.assertEqual(key(179)[0], "Confluence of the Ganga and Yamuna")

    def test_sensitive_social_customs_as_traveller_claims(self):
        self.assertEqual(key(185)[0], "Caste divisions were firmly entrenched")
        self.assertEqual(key(187)[0], "Butchers, fishermen, dancers and sweepers")
        self.assertEqual(key(188)[0], "He claims no social conflict despite describing exclusion")
        self.assertIn("cannot prove", get(188)["exp_en"])
        self.assertEqual(key(191)[0], "Rajyasri")
        self.assertEqual(key(192)[0], "Sati or widow immolation")
        self.assertIn("not a practice to endorse", get(192)["exp_en"])
        self.assertEqual(key(193)[0], "Yasomatidevi")

    def test_lifestyle_and_diet_claims_remain_qualified(self):
        self.assertEqual(key(195)[0], "Colourful cotton and silk")
        self.assertEqual(key(197)[0], "Gold and silver")
        self.assertEqual(key(198)[0], "Mostly vegetarian food habits in the account")
        self.assertIn("regional diets varied", get(198)["exp_en"])
        self.assertEqual(key(199)[0], "Onion and garlic were used relatively rarely")
        self.assertEqual(key(200)[0], "Sugar, milk, ghee and rice")


if __name__ == "__main__":
    unittest.main()
