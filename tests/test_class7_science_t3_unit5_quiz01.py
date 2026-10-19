#!/usr/bin/env python3
"""Editorial regression checks for Class 7 Science Term III Unit 5 Quiz 1.

English science reference: Tamil Nadu Std VII Science Term III 2024, Unit 5,
printed pages 81–83. Compare translations to the Tamil unit before updating.
"""
import json
import re
import unittest
from pathlib import Path

BANK = Path(__file__).resolve().parents[1] / "data/textbook/class-7/science/term-3/unit-5.json"
EXPECTED = [
    ("Mammary glands", "பால் சுரப்பிகள்"),
    ("Mother's milk", "தாய்ப்பால்"),
    ("Cow, buffalo, goat and camel", "பசு, எருமை, வெள்ளாடு, ஒட்டகம்"),
    ("Protein and calcium", "புரதமும் கால்சியமும்"),
    ("Paneer", "பனீர்"),
    ("Protein", "புரதம்"),
    ("Hen, duck, turkey and ostrich", "கோழி, வாத்து, வான்கோழி, நெருப்புக்கோழி"),
    ("6 g", "6 கிராம்"),
    ("It sinks to the bottom", "அது அடிப்பகுதியில் மூழ்கும்"),
    ("It can float near the surface", "அது மேற்பரப்புக்கு அருகில் மிதக்கக்கூடும்"),
    ("Flower nectar", "மலர்த் தேன் (நெக்டார்)"),
    ("In the wax cells of a honeycomb", "தேன்கூட்டின் மெழுகு அறைகளில்"),
    ("Forest honey hunters", "காட்டுத் தேன் சேகரிப்போர்"),
    ("Rice", "அரிசி"),
    ("Milk, egg and honey", "பால், முட்டை, தேன்"),
    ("Collecting nectar and caring for young bees", "மலர்த் தேன் சேகரித்தலும் இளம் தேனீக்களைப் பராமரித்தலும்"),
    ("Skeletal muscle with associated fat", "எலும்புத் தசையும் அதனுடன் உள்ள கொழுப்பும்"),
    ("Fish, crab, prawn and lobster", "மீன், நண்டு, இறால், கடல் நண்டு (லாப்ஸ்டர்)"),
    ("Raising domesticated birds for eggs and meat", "முட்டை மற்றும் இறைச்சிக்காக வீட்டுப் பறவைகளை வளர்த்தல்"),
    ("Layers—eggs; broilers—meat", "லேயர்ஸ்—முட்டை; பிராய்லர்ஸ்—இறைச்சி"),
]


class Class7AnimalsQuiz1(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(BANK.read_text(encoding="utf-8"))
        cls.quiz = [q for q in cls.bank["questions"] if q.get("quiz") == 1]

    def test_exact_quiz_count_and_answer_alignment(self):
        self.assertEqual(len(self.bank["questions"]), 500)
        self.assertEqual(len(self.quiz), 20)
        self.assertEqual([q["id"] for q in self.quiz],
                         [f"C07S-T3-U05-Q{i:04d}" for i in range(1, 21)])
        for q, (english, tamil) in zip(self.quiz, EXPECTED):
            with self.subTest(id=q["id"]):
                self.assertEqual(q["opts_en"][q["correct"]], english)
                self.assertEqual(q["opts_ta"][q["correct"]], tamil)
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(x.casefold().strip() for x in q["opts_en"])), 4)
                self.assertEqual(len(set(x.strip() for x in q["opts_ta"])), 4)
                self.assertTrue(q["q_ta"].strip())
                self.assertTrue(q["exp_en"].strip())
                self.assertTrue(q["exp_ta"].strip())
                self.assertIn(q["page_en"], (81, 82, 83))

    def test_natural_competitive_stems(self):
        stems = [q["q_en"].casefold().strip() for q in self.quiz]
        self.assertEqual(len(set(stems)), 20)
        for q in self.quiz:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertFalse(re.search(
                    r"according to (the )?textbook|correct textbook answer|"
                    r"which statement correctly describes|"
                    r"what is the correct textbook answer for",
                    q["q_en"], re.I))

    def test_water_float_questions_do_not_claim_definitive_safety(self):
        for q in (self.quiz[8], self.quiz[9]):
            self.assertIn("not", q["exp_en"].lower())
        # Retired water-drop honey purity claims, not a scientific purity test.
        for q in self.quiz:
            self.assertNotIn("pure honey drop", q["q_en"].lower())
            self.assertNotIn("impure honey test", q["q_en"].lower())


if __name__ == "__main__":
    unittest.main()
