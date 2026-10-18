"""Regression checks: revised 100 bilingual Class 11 History Unit 6 Quiz 6–10 questions.

These tests check editorial quality and specific historical qualifications,
not independent historical truth. References: TN State Board Class 11
History Units 5–6; Encyclopaedia Iranica on Rabatak/Kanishka chronology;
Oxford/Cambridge research on earlier monsoon navigation.
"""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

DATA = json.loads((ROOT / "data/textbook/class-11/history/unit-06.json").read_text(encoding="utf-8"))
QUESTIONS = DATA["questions"]
BATCH = QUESTIONS[100:200]


def keyed(number):
    item = QUESTIONS[number - 1]
    return item["opts_en"][item["correct"]]


class HistoryUnit06QuizSixToTen(unittest.TestCase):
    def test_exact_reviewed_prefix_and_unchanged_count(self):
        self.assertEqual(len(QUESTIONS), 276)
        self.assertEqual(DATA["meta"]["total_questions"], 276)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_prefix"], 200)
        self.assertGreaterEqual(DATA["meta"]["qa_reviewed_quizzes"], 10)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"], 552)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]), 14)
        self.assertTrue(DATA["meta"]["positional_quiz_sets"])
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 276)
        self.assertTrue(all(q["type"] == "direct" for q in QUESTIONS))

    def test_five_complete_quizzes_and_stable_source_ids(self):
        self.assertEqual(len(BATCH), 100)
        self.assertEqual(BATCH[0]["id"], "C11H06-Q301")
        self.assertEqual(BATCH[-1]["id"], "C11H06-Q598")
        for number in range(6, 11):
            items = QUESTIONS[(number - 1) * 20:number * 20]
            with self.subTest(quiz=number):
                self.assertEqual(len(items), 20)
                self.assertTrue(all(item["page_en"] in range(80, 84) for item in items))

    def test_all_bilingual_audit_checks_pass(self):
        outcome = audit(QUESTIONS, 100, 100)
        self.assertEqual(outcome["errors"], [])
        self.assertEqual(outcome["warnings"], [])
        self.assertEqual(outcome["reviewed_quizzes"], "6–10")
        self.assertEqual(outcome["answer_positions"], {k: 25 for k in "ABCD"})

    def test_no_weak_templates_or_duplicate_alternatives(self):
        for question in BATCH:
            with self.subTest(id=question["id"]):
                self.assertTrue(question["q_en"].endswith("?"))
                self.assertTrue(question["q_ta"].endswith("?"))
                self.assertNotIn("correct textbook answer for", question["q_en"].lower())
                self.assertEqual(len(set(question["opts_en"])), 4)
                self.assertEqual(len(set(question["opts_ta"])), 4)
                self.assertIn(question["opts_en"][question["correct"]], question["exp_en"])
                self.assertIn(question["opts_ta"][question["correct"]], question["exp_ta"])

    def test_rudradaman_and_kushana_sources(self):
        for number, answer in {101: "Junagadh inscription", 103: "Satavahanas",
                               107: "Khujula Kadphises", 108: "Wima Kadphises",
                               128: "Devaputra (Son of God)"}.items():
            self.assertEqual(keyed(number), answer)
        self.assertIn("royal", QUESTIONS[127]["exp_en"])
        self.assertIn("claims", QUESTIONS[102]["exp_en"])

    def test_kanishka_dates_distinguish_old_and_epigraphic_eras(self):
        self.assertEqual(keyed(112), "78 CE")
        self.assertEqual(keyed(114), "78–144 CE")
        self.assertEqual(keyed(115), "Saka era")
        self.assertIn("127/128 CE", QUESTIONS[111]["exp_en"])
        self.assertIn("127/128 CE", QUESTIONS[113]["exp_en"])
        self.assertIn("பொ.ஆ. 127/128", QUESTIONS[111]["exp_ta"])

    def test_art_and_literature_distinctions(self):
        for number, answer in {142: "Gandhara art", 148: "Red sandstone",
                               149: "Chaitya", 150: "Vihara",
                               154: "Asvaghosha", 157: "Nagarjuna",
                               159: "Sariputraprakarana"}.items():
            self.assertEqual(keyed(number), answer)
        self.assertIn("rather than", QUESTIONS[156]["q_en"])
        self.assertIn("later", QUESTIONS[150]["exp_en"])

    def test_satavahana_cross_unit_chronology_correction(self):
        self.assertEqual(keyed(165), "1st century BCE")
        self.assertIn("Unit 5", QUESTIONS[164]["q_en"])
        self.assertIn("Unit 6", QUESTIONS[164]["exp_en"])
        self.assertIn("அலகு 5", QUESTIONS[164]["q_ta"])
        self.assertIn("அலகு 6", QUESTIONS[164]["exp_ta"])

    def test_hippalus_attribution_is_not_claimed_as_first_discovery(self):
        self.assertEqual(keyed(183), "Hippalus")
        self.assertIn("traditionally", QUESTIONS[182]["q_en"])
        self.assertIn("Earlier Indian and Arabian sailors", QUESTIONS[182]["exp_en"])
        self.assertIn("இந்திய, அரபுக் கடலோடிகள்", QUESTIONS[182]["exp_ta"])
        self.assertIn("seasonal", QUESTIONS[189]["exp_en"])

    def test_roman_trade_and_archaeological_evidence(self):
        for number, answer in {179: "Periplus of the Erythraean Sea",
                               191: "Arikamedu", 193: "Palghat Pass",
                               194: "Kodumanal", 197: "Beryl",
                               199: "Furnaces and slag"}.items():
            self.assertEqual(keyed(number), answer)
        self.assertIn("not", QUESTIONS[199]["exp_en"])


if __name__ == "__main__":
    unittest.main()
