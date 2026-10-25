#!/usr/bin/env python3
"""Regression checks for reviewed Class 7 Science T3 Unit 5 Quiz 2 (Q21–Q40)."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/textbook/class-7/science/term-3/unit-5.json"
ANSWERS = [
    ("Chicken", "கோழி"),
    ("Turkey and geese", "வான்கோழியும் வாத்தினமும் (கூஸ்)"),
    ("Providing sufficient space for each bird", "ஒவ்வொரு பறவைக்கும் போதிய இடம் அளித்தல்"),
    ("Clean drinking water, good airflow and regular nutritious feed", "சுத்தமான குடிநீர், நல்ல காற்றோட்டம், முறையான சத்தான தீவனம்"),
    ("Proteins, fats and vitamins", "புரதங்கள், கொழுப்புகள், வைட்டமின்கள்"),
    ("Rice bran", "அரிசித் தவிடு"),
    ("Maize, wheat, millet and rice bran", "மக்காச்சோளம், கோதுமை, சிறுதானியம், அரிசித் தவிடு"),
    ("Protein-containing feed ingredient", "புரதம் உள்ள தீவனப் பொருள்"),
    ("Cleaning sheds and removing soiled litter", "குடில்களைச் சுத்தம் செய்து அழுக்கான தரைவிரிப்பை அகற்றுதல்"),
    ("To protect against specified infectious diseases", "குறிப்பிட்ட தொற்றுநோய்களிலிருந்து பாதுகாக்க"),
    ("Bacterium", "பாக்டீரியா"),
    ("Virus", "வைரஸ்"),
    ("Ranikhet and fowl pox", "ராணிகெட் மற்றும் கோழி அம்மை"),
    ("Fungus", "பூஞ்சை"),
    ("Salmonellosis—bacteria; Ranikhet—virus; aspergillosis—fungus", "சால்மொனெல்லோசிஸ்—பாக்டீரியா; ராணிகெட்—வைரஸ்; அஸ்பெர்ஜில்லோசிஸ்—பூஞ்சை"),
    ("Goat and sheep", "வெள்ளாடும் செம்மறியாடும்"),
    ("Bristles of a brush", "தூரிகையின் உரோம முட்கள்"),
    ("Wool", "கம்பளி"),
    ("Wool traps air and reduces heat loss", "கம்பளி காற்றைப் பிடித்துவைத்து வெப்ப இழப்பைக் குறைக்கிறது"),
    ("Absorbs moisture; does not wrinkle easily", "ஈரத்தை உறிஞ்சும்; எளிதில் சுருக்கம் ஏற்படாது"),
]


class Class7ScienceQuiz2(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(DATA.read_text(encoding="utf-8"))
        cls.questions = [q for q in cls.bank["questions"] if q.get("quiz") == 2]

    def test_twenty_distinct_bilingual_questions_with_known_answers(self):
        self.assertEqual(len(self.bank["questions"]), 500)
        self.assertEqual(len(self.questions), 20)
        self.assertEqual([q["id"] for q in self.questions],
                         [f"C07S-T3-U05-Q{i:04d}" for i in range(21, 41)])
        stems = set()
        for q, (en, ta) in zip(self.questions, ANSWERS):
            with self.subTest(id=q["id"]):
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertIn(q["correct"], range(4))
                self.assertEqual(q["opts_en"][q["correct"]], en)
                self.assertEqual(q["opts_ta"][q["correct"]], ta)
                self.assertEqual(len({s.strip().casefold() for s in q["opts_en"]}), 4)
                self.assertEqual(len({s.strip() for s in q["opts_ta"]}), 4)
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertTrue(q["exp_en"].strip())
                self.assertTrue(q["exp_ta"].strip())
                self.assertIn(q["page_en"], (83, 84))
                self.assertNotRegex(q["q_en"], re.compile(
                    r"according to the textbook|which statement correctly describes|"
                    r"what is the correct textbook answer", re.I))
                stem = q["q_en"].casefold().strip()
                self.assertNotIn(stem, stems)
                stems.add(stem)

    def test_poultry_disease_answers_cover_all_three_causes(self):
        causes = {self.questions[i]["opts_en"][self.questions[i]["correct"]]
                  for i in (10, 11, 13)}
        self.assertEqual(causes, {"Bacterium", "Virus", "Fungus"})

    def test_correct_answers_are_not_all_in_one_position(self):
        positions = {q["correct"] for q in self.questions}
        self.assertEqual(positions, {0, 1, 2, 3})


if __name__ == "__main__":
    unittest.main()
