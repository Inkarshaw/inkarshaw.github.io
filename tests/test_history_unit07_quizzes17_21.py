"""Gupta Unit 7 Quizzes 17-21: textbook-aware bilingual editorial regressions.

These tests protect specific corrections; they cannot certify every historical fact
or independently validate the original 2025 English/Tamil textbook editions.
"""
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/textbook/class-11/history/unit-07.json"


class GuptaQuizzes17To21Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK.read_text(encoding="utf-8"))
        cls.questions = cls.data["questions"]
        cls.batch = cls.questions[320:420]

    @classmethod
    def get_question(cls, ordinal):
        return cls.questions[ordinal - 1]

    @classmethod
    def correct_pair(cls, ordinal):
        q = cls.get_question(ordinal)
        return (q["opts_en"][q["correct"]], q["opts_ta"][q["correct"]])

    def test_batch_size_metadata_and_stable_ids(self):
        self.assertEqual(len(self.questions), 492)
        self.assertEqual(len(self.batch), 100)
        self.assertGreaterEqual(self.data["meta"]["qa_reviewed_prefix"], 420)
        self.assertGreaterEqual(self.data["meta"]["qa_reviewed_quizzes"], 21)
        self.assertEqual(self.data["meta"]["total_questions"], 492)
        self.assertEqual(self.get_question(321)["id"], "C11H07-Q961")
        self.assertEqual(self.get_question(420)["id"], "C11H07-Q1258")
        self.assertEqual(len({q["id"] for q in self.questions}), 492)

    def test_bilingual_four_choices_and_no_machine_stems(self):
        seen = set()
        for q in self.batch:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertNotIn("correct textbook answer for", q["q_en"].lower())
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["correct"], range(4))
                self.assertGreaterEqual(len(q["exp_en"]), 75)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)
                self.assertIn(q["opts_en"][q["correct"]], q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]], q["exp_ta"])
                self.assertNotIn(q["q_en"], seen)
                seen.add(q["q_en"])

    def test_answer_distribution_preserved(self):
        self.assertEqual(Counter(q["correct"] for q in self.batch),
                         Counter({0: 25, 1: 25, 2: 25, 3: 25}))

    def test_two_udayagiri_sites_not_conflated(self):
        self.assertEqual(self.correct_pair(326)[0], "Udayagiri")
        self.assertIn("Odisha", self.get_question(326)["q_en"])
        self.assertIn("Vidisha", self.get_question(326)["exp_en"])
        self.assertIn("Madhya Pradesh", self.get_question(326)["exp_en"])
        self.assertEqual(self.correct_pair(338)[0], "Great Boar (Varaha)")
        self.assertIn("Madhya Pradesh", self.get_question(338)["exp_en"])
        self.assertIn("ஒடிசா", self.get_question(338)["exp_ta"])

    def test_sarnath_place_name_repaired(self):
        self.assertEqual(self.correct_pair(334), ("Sarnath", "சாரநாத்"))
        self.assertNotIn("Samat", self.get_question(334)["q_en"])

    def test_painting_technique_explained(self):
        self.assertEqual(self.correct_pair(345)[0], "Not true frescoes")
        self.assertEqual(self.correct_pair(346)[0], "Painted after plaster had set")
        self.assertIn("plaster", self.get_question(345)["exp_en"])
        self.assertIn("சாந்து", self.get_question(346)["exp_ta"])

    def test_grammarians_not_dated_as_gupta_contemporaries(self):
        self.assertEqual(self.correct_pair(363)[0], "Panini")
        self.assertEqual(self.correct_pair(365)[0], "Patanjali")
        self.assertIn("before", self.get_question(363)["exp_en"])
        self.assertIn("pre-Gupta", self.get_question(365)["exp_en"])

    def test_buddhist_language_generalization_qualified(self):
        self.assertEqual(self.correct_pair(388)[0], "Pali")
        self.assertIn("Theravada", self.get_question(388)["q_en"])
        self.assertIn("other Middle Indo-Aryan", self.get_question(388)["exp_en"])
        self.assertEqual(self.correct_pair(389)[0], "Sanskrit and Buddhist Hybrid Sanskrit")

    def test_buddhist_logic_attribution_qualified(self):
        self.assertEqual(self.correct_pair(392)[0], "Vasubandhu")
        self.assertIn("chapter credits", self.get_question(392)["exp_en"])
        self.assertIn("Dignaga", self.get_question(392)["exp_en"])
        self.assertEqual(self.correct_pair(393)[0], "Dignaga")
        self.assertIn("traditional", self.get_question(393)["exp_en"])

    def test_mrichchhakatika_and_gupta_drama(self):
        self.assertEqual(self.correct_pair(403)[0], "Sudraka")
        self.assertEqual(self.correct_pair(404)[0], "Mrichchhakatika")
        self.assertIn("Charudatta", self.get_question(404)["q_en"])
        self.assertEqual(self.correct_pair(405)[0], "Mudraraksasa")
        self.assertEqual(self.correct_pair(406)[0], "Devichandraguptam")
        self.assertIn("fragments", self.get_question(406)["exp_en"])

    def test_nalanda_chronology_and_world_heritage(self):
        self.assertEqual(self.correct_pair(416), (
            "5th–13th centuries CE", "5ஆம்–13ஆம் நூற்றாண்டுகள் கி.பி."))
        self.assertIn("UNESCO", self.get_question(416)["q_en"])
        self.assertEqual(self.correct_pair(417)[0], "UNESCO World Heritage Site")
        self.assertIn("2016", self.get_question(417)["q_en"])

    def test_institutions_not_treated_as_gupta_contemporaries(self):
        self.assertEqual(self.correct_pair(418)[0], "Taxila")
        self.assertIn("preceded", self.get_question(418)["exp_en"])
        self.assertEqual(self.correct_pair(419)[0], "Vikramashila")
        self.assertIn("Pala", self.get_question(419)["q_en"])
        self.assertIn("Buddhist", self.get_question(420)["exp_en"])

    def test_pottery_same_category_and_no_answer_leak(self):
        q = self.get_question(354)
        self.assertEqual(self.correct_pair(354)[0], "Rajgarh")
        self.assertNotIn("Rajgarh", q["q_en"])
        self.assertNotIn("ராஜ்கர்", q["q_ta"])
        self.assertEqual(q["opts_en"][q["correct"]], "Rajgarh")
        self.assertEqual(self.correct_pair(357)[0], "Red ware")


if __name__ == "__main__":
    unittest.main()
