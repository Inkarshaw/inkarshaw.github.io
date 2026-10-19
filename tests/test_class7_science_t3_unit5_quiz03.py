#!/usr/bin/env python3
"""Editorial QA for Class 7 Science Term III Unit 5 Quiz 3 (wool and silk).

Bilingual content fact-checked against Tamil Nadu Class VII Science Term III
2024, Unit 5 (English pp. 85–86; Tamil Unit 5 begins at p. 101).
Do not treat this test as proof of correct translation without editorial review.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data/textbook/class-7/science/term-3/unit-5.json"
EXPECTED_ANSWERS = [
  [
    "Shearing",
    "கத்தரித்தல்"
  ],
  [
    "A web of wool fibres",
    "கம்பளி இழை வலை (Web)"
  ],
  [
    "Grading or sorting",
    "தரம் பிரித்தல்"
  ],
  [
    "Scouring",
    "கழுவுதல்"
  ],
  [
    "To separate and align the fibres",
    "இழைகளைப் பிரித்து ஒரே திசையில் ஒழுங்குபடுத்த"
  ],
  [
    "Shearing → Sorting → Scouring → Carding → Spinning",
    "கத்தரித்தல் → தரம் பிரித்தல் → கழுவுதல் → சிக்கெடுத்தல் → நூற்றல்"
  ],
  [
    "Its cocoon",
    "அதன் பட்டுக்கூடு"
  ],
  [
    "Mulberry",
    "மல்பெரி"
  ],
  [
    "Sericulture",
    "பட்டுப்புழு வளர்ப்பு"
  ],
  [
    "Egg → larva → pupa inside cocoon → adult moth",
    "முட்டை → இளம்புழு → பட்டுக்கூட்டினுள் கூட்டுப்புழு → முதிர்ந்த பட்டுப்பூச்சி"
  ],
  [
    "500",
    "500"
  ],
  [
    "Six weeks",
    "ஆறு வாரங்கள்"
  ],
  [
    "In an incubator",
    "அடைகாக்கும் பெட்டியில்"
  ],
  [
    "Thirty-five days",
    "முப்பத்தைந்து நாட்கள்"
  ],
  [
    "The larva spins a continuous silk filament around itself",
    "இளம்புழு தன்னைச் சுற்றி தொடர்ச்சியான பட்டு இழையை நூற்கிறது"
  ],
  [
    "To loosen the binding material and keep the filament unbroken",
    "இழையைப் பிணைக்கும் பொருளைத் தளர்த்தி நீண்ட இழை அறுபடாமல் பாதுகாக்க"
  ],
  [
    "Reeling",
    "பட்டு இழைப் பிரித்தல் (Reeling)"
  ],
  [
    "Silk has poor resistance to prolonged sunlight exposure",
    "நீண்ட நேரச் சூரிய ஒளியைத் தாங்கும் திறன் பட்டுக்கு குறைவு"
  ],
  [
    "It can be dyed readily",
    "அதற்கு எளிதில் சாயமேற்றலாம்"
  ],
  [
    "Kancheepuram, Thirubhuvanam and Arani",
    "காஞ்சிபுரம், திருபுவனம், ஆரணி"
  ]
]


class ReviewedWoolAndSericultureQuizTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
        cls.data = data
        cls.records = [q for q in data["questions"] if q.get("quiz") == 3]

    def test_500_questions_and_25_unchanged_quiz_groups(self):
        questions = self.data["questions"]
        self.assertEqual(len(questions), 500)
        self.assertEqual(self.data["meta"]["total_questions"], 500)
        self.assertEqual(len(self.data["meta"]["quiz_sets"]), 25)
        self.assertEqual(Counter(q["quiz"] for q in questions),
                         Counter({quiz: 20 for quiz in range(1, 26)}))
        self.assertEqual(len({q["id"] for q in questions}), 500)

    def test_every_question_has_exact_bilingual_answer_and_four_distinct_options(self):
        self.assertEqual(len(self.records), len(EXPECTED_ANSWERS))
        expected_ids = [f"C07S-T3-U05-Q{n:04d}" for n in range(41, 61)]
        self.assertEqual([q["id"] for q in self.records], expected_ids)
        signatures = set()
        positions = Counter()
        for rec, (en, ta) in zip(self.records, EXPECTED_ANSWERS):
            with self.subTest(id=rec["id"]):
                index = rec["correct"]
                self.assertIs(type(index), int)
                self.assertIn(index, range(4))
                positions[index] += 1
                self.assertEqual(rec["opts_en"][index], en)
                self.assertEqual(rec["opts_ta"][index], ta)
                for opts in (rec["opts_en"], rec["opts_ta"]):
                    self.assertEqual(len(opts), 4)
                    self.assertTrue(all(isinstance(s, str) and s.strip() for s in opts))
                    self.assertEqual(len({s.casefold().strip() for s in opts}), 4)
                for lang in ("en", "ta"):
                    self.assertTrue(rec[f"q_{lang}"].endswith("?"))
                    self.assertTrue(rec[f"exp_{lang}"].strip())
                self.assertIn(rec["page_en"], (85, 86))
                self.assertNotRegex(rec["q_en"], re.compile(
                    r"according to the textbook|correct textbook answer|"
                    r"which statement correctly describes|"
                    r"which is the correct textbook", re.I))
                signature = re.sub(r"[^a-z0-9]", "", rec["q_en"].lower())
                self.assertNotIn(signature, signatures)
                signatures.add(signature)
        self.assertEqual(positions, Counter({i: 5 for i in range(4)}))

    def test_textbook_tamil_wool_processing_terms(self):
        all_tamil = " ".join(r["q_ta"] + " " + r["exp_ta"] for r in self.records[:6])
        for term in ("கத்தரித்தல்", "தரம் பிரித்தல்", "கழுவுதல்",
                     "சிக்கெடுத்தல்", "நூற்றல்"):
            with self.subTest(term=term):
                self.assertIn(term, all_tamil)

    def test_pupa_and_reeling_distinct_from_wool_terms(self):
        self.assertIn("pupa", self.records[9]["exp_en"])
        self.assertIn("kills the pupa", self.records[15]["exp_en"])
        self.assertIn("cocoons", self.records[16]["exp_en"])
        self.assertIn("sunlight", self.records[17]["exp_en"])


if __name__ == "__main__":
    unittest.main()
