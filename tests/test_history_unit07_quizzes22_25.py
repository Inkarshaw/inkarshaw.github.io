"""Gupta Unit 7 final 72 bilingual MCQs: factual qualification and structural regressions.

Source-aware regression checks support editorial review. They do not independently
certify every historical fact or the declared 2025 printed English/Tamil editions.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

DATA = json.loads(
    (Path(__file__).resolve().parents[1] / "data/textbook/class-11/history/unit-07.json")
    .read_text(encoding="utf-8")
)
QUESTIONS = DATA["questions"]
FINAL = QUESTIONS[420:492]


def question(position):
    return QUESTIONS[position - 1]


def chosen(position):
    q = question(position)
    return q["opts_en"][q["correct"]], q["opts_ta"][q["correct"]]


class GuptaQuizzes22To25Tests(unittest.TestCase):
    def test_full_bank_and_final_quiz_windows(self):
        self.assertEqual(len(QUESTIONS), 492)
        self.assertEqual(DATA["meta"]["total_questions"], 492)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"], 492)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"], 25)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]), 25)
        self.assertEqual(len(FINAL), 72)
        self.assertEqual([len(QUESTIONS[i:i+20]) for i in range(420, 492, 20)], [20,20,20,12])
        self.assertEqual(question(421)["id"], "C11H07-Q1261")
        self.assertEqual(question(492)["id"], "C11H07-Q1474")
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 492)

    def test_bilingual_keys_and_no_template_stems(self):
        seen = set()
        for q in FINAL:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("correct textbook answer for", q["q_en"].lower())
                self.assertNotIn("correctly associated with:", q["q_en"].lower())
                self.assertGreaterEqual(len(q["exp_en"].strip()), 75)
                self.assertGreaterEqual(len(q["exp_ta"].strip()), 50)
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertIn(q["opts_en"][q["correct"]], q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]], q["exp_ta"])
                self.assertNotIn(q["q_en"], seen)
                seen.add(q["q_en"])

    def test_bilingual_numeric_alignment_and_key_balance(self):
        self.assertEqual(Counter(q["correct"] for q in FINAL), Counter({0:18,1:18,2:18,3:18}))
        pattern = re.compile(r"\\d[\\d,]*(?:[–-]\\d+)?")
        for q in FINAL:
            with self.subTest(id=q["id"]):
                en = q["opts_en"][q["correct"]]
                ta = q["opts_ta"][q["correct"]]
                self.assertEqual(pattern.findall(en), pattern.findall(ta))

    def test_nalanda_multiple_patron_dynasties_and_regions(self):
        self.assertEqual(chosen(421)[0], "Gupta Empire")
        self.assertEqual(chosen(422)[0], "5th and 6th centuries CE")
        self.assertEqual(chosen(423)[0], "Harsha of Kanauj")
        self.assertEqual(chosen(425)[0], "Pala dynasty")
        self.assertEqual(chosen(430)[0], "Shailendra dynasty")
        self.assertIn("inscriptions", question(430)["exp_en"])

    def test_nalanda_attack_claim_qualified(self):
        self.assertEqual(chosen(432)[0], "Bakhtiyar Khalji")
        self.assertIn("debate", question(432)["exp_en"])
        self.assertEqual(chosen(433)[0], "The dynasty label is imprecise and details remain disputed")
        self.assertIn("Ghurid", question(433)["exp_en"])
        self.assertNotIn("Mamluk dynasty", chosen(433)[0])
        self.assertEqual(chosen(434)[0], "c. 1200 CE")
        self.assertIn("continued", question(434)["exp_en"])

    def test_excavation_year_and_scope_qualified(self):
        self.assertEqual(chosen(435)[0], "1915")
        self.assertEqual(chosen(436)[0], "11")
        self.assertEqual(chosen(437)[0], "6")
        self.assertIn("textbook", question(437)["exp_en"])
        self.assertEqual(chosen(438)[0], "12 hectares (30 acres)")
        self.assertIn("23-hectare", question(438)["exp_en"])
        self.assertIn("23", question(438)["exp_ta"])

    def test_aryabhata_attribution_corrected(self):
        self.assertEqual(chosen(441)[0], "Aryabhatiya")
        self.assertNotEqual(chosen(441)[0], "Surya Siddanta")
        self.assertIn("Surya Siddhanta", question(441)["exp_en"])
        self.assertEqual(chosen(444)[0], "Aryabhatiya")
        self.assertEqual(chosen(442)[0], "Earth rotates about its axis")

    def test_gupta_math_claim_is_not_single_day_invention(self):
        self.assertEqual(chosen(439)[0], "Zero and decimal place-value notation")
        self.assertIn("evolved over time", question(439)["exp_en"])

    def test_science_authors_and_specific_texts(self):
        self.assertEqual(chosen(446)[0], "Varahamihira")
        self.assertEqual(chosen(447)[0], "Brihat Samhita")
        self.assertEqual(chosen(449)[0], "Panchasiddhantika")
        self.assertEqual(chosen(450)[0], "Brihat Jataka")
        self.assertEqual(chosen(451)[0], "Brahmagupta")
        self.assertEqual(chosen(452)[0], "Brahmasphutasiddhanta")
        self.assertEqual(chosen(453)[0], "Khandakhadyaka")

    def test_medicine_avoids_treatment_advice_and_qualifies_attribution(self):
        self.assertEqual(chosen(455)[0], "Mercury and iron")
        self.assertIn("not treatment advice", question(455)["exp_en"])
        self.assertEqual(chosen(456)[0], "Navanitakam")
        self.assertEqual(chosen(457)[0], "Hastyayurveda")
        self.assertEqual(chosen(458)[0], "Palakapya")
        self.assertIn("traditionally", question(458)["q_en"].lower())

    def test_decline_kings_and_regional_powers(self):
        self.assertEqual(chosen(459)[0], "Vishnugupta")
        self.assertEqual(chosen(461)[0], "Budhagupta")
        self.assertEqual(chosen(462)[0], "Narendrasena")
        self.assertEqual(chosen(466)[0], "Harishena of Vakataka")
        self.assertEqual(chosen(474)[0], "Yasodharman")
        self.assertEqual(chosen(475)[0], "Maukharis")
        self.assertEqual(chosen(476)[0], "Maitrakas")

    def test_gupta_decline_chronology_qualified(self):
        self.assertEqual(chosen(479)[0], "Mid-6th century CE")
        self.assertIn("540–550 CE", question(479)["exp_en"])
        self.assertIn("500", question(479)["exp_ta"])

    def test_feudalism_label_attributed_to_historian(self):
        self.assertEqual(chosen(480)[0], "R. S. Sharma")
        self.assertIn("debate", question(480)["exp_en"])
        self.assertEqual(chosen(481)[0], "Royal grants of land")
        self.assertEqual(chosen(482)[0], "Transfer of fiscal and judicial rights to grantees")
        self.assertEqual(chosen(489)[0], "Subordinate or feudatory rulers")
        self.assertIn("Sharma", question(486)["q_en"])

    def test_social_prosperity_and_traveller_scope(self):
        self.assertEqual(chosen(490)[0], "Elite living standards reached exceptional heights")
        self.assertIn("not equal prosperity", question(490)["exp_en"])
        self.assertEqual(chosen(492)[0], "Faxian (Fahien)")
        self.assertIn("selective observations", question(492)["exp_en"])


if __name__ == "__main__":
    unittest.main()
