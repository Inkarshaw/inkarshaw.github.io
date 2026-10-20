#!/usr/bin/env python3
"""Bilingual review regression for Class 7 Science Term III Unit 5 Quiz 6.

Facts were checked against the English 2024 textbook Unit 5 pages 87–88 and
corresponding Tamil text of the hazards, Ahimsa silk and animal care sections.
Automated tests cannot replace independent factual/translation editorial review.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/textbook/class-7/science/term-3/unit-5.json"
EXPECTED_ANSWERS = [
  [
    "Ahimsa or peace-silk production",
    "அகிம்சை அல்லது அமைதிப்பட்டு உற்பத்தி"
  ],
  [
    "The silk filament may be broken into shorter lengths",
    "பட்டு இழை நீண்டதாக இல்லாமல் சிறு துண்டுகளாக இருக்கலாம்"
  ],
  [
    "1992 — proposal of an approach avoiding silkworm killing",
    "1992 — பட்டுப்புழுக்களைக் கொல்லாமல் பட்டு பெறும் முறை முன்மொழியப்பட்டது"
  ],
  [
    "Kusuma Rajaiah — proposal of a non-killing silk-production method",
    "குசுமா ராஜய்யா — பட்டுப்புழுக்களைக் கொல்லாத பட்டு உற்பத்தி முறை முன்மொழிவு"
  ],
  [
    "I is Ahimsa silk; II is a conventional method",
    "I அகிம்சைப்பட்டு முறை; II வழக்கமான பட்டு உற்பத்தி முறை"
  ],
  [
    "The adult moth is allowed to emerge before cocoons are used",
    "கூடுகளைப் பயன்படுத்தும்முன் முதிர்ந்த பட்டுப்பூச்சி வெளியேற அனுமதிக்கப்படுகிறது"
  ],
  [
    "Responsible animal care and welfare",
    "பொறுப்புள்ள விலங்குப் பராமரிப்பும் நலனும்"
  ],
  [
    "Breeding and maintaining farm animals",
    "பண்ணை விலங்குகளின் இனப்பெருக்கமும் பராமரிப்பும்"
  ],
  [
    "Prevention of Cruelty to Animals Act",
    "விலங்குகள் வதைத் தடுப்புச் சட்டம்"
  ],
  [
    "Animal trade and care activities",
    "விலங்குகள் விற்பனையும் பராமரிப்பும் சார்ந்த செயல்பாடுகள்"
  ],
  [
    "Several occupational hazards in one workplace",
    "ஒரே பணியிடத்தில் பல தொழில்சார் அபாயங்கள்"
  ],
  [
    "Allowing suitable seated work and regular rest breaks",
    "தேவையான இடத்தில் அமர்ந்து பணியாற்றவும் முறையான ஓய்வு எடுக்கவும் வசதி செய்தல்"
  ],
  [
    "Improving airflow and ventilation",
    "காற்றோட்டத்தையும் காற்றுப் பரிமாற்றத்தையும் மேம்படுத்துதல்"
  ],
  [
    "Detergent irritation—chemical; contaminated hair—biological",
    "சலவைப் பொருள் தோல் எரிச்சல்—வேதிப்பொருள்; மாசுபட்ட உரோமம்—உயிரியல்"
  ],
  [
    "Exposure to Bacillus anthracis spores",
    "பேசில்லஸ் ஆந்த்ராசிஸ் கிருமித் துகள்களுக்கு ஆளாகுதல்"
  ],
  [
    "Handling potentially contaminated fleece can transmit the infection",
    "மாசுபட்ட உரோமத்தைக் கையாளும்போது தொற்று ஏற்படக்கூடும்"
  ],
  [
    "Contact with contaminated animal hair during handling",
    "கையாளும்போது மாசுபட்ட விலங்கு உரோமத்துடன் தொடர்பு கொள்ளுதல்"
  ],
  [
    "Possible inhalation anthrax",
    "உள்ளிழுக்கும் வழியிலான ஆந்த்ராக்ஸ் தொற்று இருக்குமோ என்ற சந்தேகம்"
  ],
  [
    "Nausea, vomiting and diarrhoea",
    "குமட்டல், வாந்தி, வயிற்றுப்போக்கு"
  ],
  [
    "Providing hygiene, ventilation and appropriate workplace safeguards",
    "சுத்தம், காற்றோட்டம், பொருத்தமான பணியிடப் பாதுகாப்பு வழங்குதல்"
  ]
]


class Quiz6EditorialRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK.read_text(encoding="utf-8"))
        cls.quiz = [q for q in cls.data["questions"] if q.get("quiz") == 6]

    def test_preserves_all_500_questions_and_25_quizzes(self):
        questions = self.data["questions"]
        self.assertEqual(len(questions), 500)
        self.assertEqual(self.data["meta"]["total_questions"], 500)
        self.assertEqual(len({q["id"] for q in questions}), 500)
        self.assertEqual(Counter(q["quiz"] for q in questions),
                         Counter({i: 20 for i in range(1, 26)}))

    def test_twenty_clear_distinct_bilingual_mcqs_and_answer_keys(self):
        self.assertEqual(len(self.quiz), 20)
        self.assertEqual(len(EXPECTED_ANSWERS), 20)
        self.assertEqual([q["id"] for q in self.quiz],
                         [f"C07S-T3-U05-Q{i:04d}" for i in range(101, 121)])
        stems, answer_slots = set(), Counter()
        for rec, (en, ta) in zip(self.quiz, EXPECTED_ANSWERS):
            with self.subTest(id=rec["id"]):
                index = rec["correct"]
                self.assertIs(type(index), int)
                self.assertIn(index, range(4))
                answer_slots[index] += 1
                self.assertEqual(rec["opts_en"][index], en)
                self.assertEqual(rec["opts_ta"][index], ta)
                for language in ("en", "ta"):
                    stem = rec[f"q_{language}"]
                    choices = rec[f"opts_{language}"]
                    self.assertTrue(stem.endswith("?"))
                    self.assertTrue(rec[f"exp_{language}"].strip())
                    self.assertEqual(len(choices), 4)
                    self.assertTrue(all(isinstance(c, str) and c.strip() for c in choices))
                    self.assertEqual(len({c.casefold().strip() for c in choices}), 4)
                self.assertIn(rec["page_en"], (87, 88))
                self.assertNotRegex(rec["q_en"], re.compile(
                    r"according to the textbook|correct textbook answer|"
                    r"which occupational-health or animal-welfare topic matches|"
                    r"choose the correct textbook association", re.IGNORECASE))
                signature = re.sub(r"[^a-z0-9]", "", rec["q_en"].lower())
                self.assertNotIn(signature, stems)
                stems.add(signature)
        self.assertEqual(len(answer_slots), 4)
        self.assertLessEqual(max(answer_slots.values()) - min(answer_slots.values()), 2)

    def test_relevant_history_and_safe_science(self):
        silk_1992 = self.quiz[2]
        self.assertIn("1992", silk_1992["opts_en"][silk_1992["correct"]])
        self.assertIn("1960", self.quiz[8]["opts_en"][self.quiz[8]["correct"]]
                      if "1960" in self.quiz[8]["opts_en"][self.quiz[8]["correct"]]
                      else self.quiz[8]["exp_en"])
        anthrax = self.quiz[14]
        self.assertIn("Bacillus anthracis", anthrax["opts_en"][anthrax["correct"]])
        self.assertIn("urgent medical assessment", self.quiz[17]["exp_en"])
        self.assertIn("gastrointestinal", self.quiz[18]["q_en"].lower())


if __name__ == "__main__":
    unittest.main()
