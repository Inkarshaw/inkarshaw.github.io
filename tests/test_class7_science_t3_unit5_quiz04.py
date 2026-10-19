#!/usr/bin/env python3
"""Class 7 Term III Science Unit 5 Quiz 4 editorial regressions.

Source: Tamil Nadu Class VII Science Term III 2024, Unit 5
(English printed pp. 87–88; matching Tamil Unit 5).
Ancillary occupational-health recommendations are checked against CDC's
anthrax exposure guidance, not presented as personalised medical treatment.
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
    "A condition that could cause injury, illness or environmental damage",
    "காயம், நோய் அல்லது சுற்றுச்சூழல் சேதம் ஏற்படுத்தக்கூடிய நிலை"
  ],
  [
    "Joint and back pain",
    "மூட்டு வலி மற்றும் முதுகுவலி"
  ],
  [
    "Back pain, visual strain and skin injuries",
    "முதுகுவலி, பார்வைச் சோர்வு, தோல் காயங்கள்"
  ],
  [
    "Asthma and bronchitis",
    "ஆஸ்துமா மற்றும் மூச்சுக்குழாய் அழற்சி"
  ],
  [
    "Detergents and processing chemicals",
    "சலவைத்தூள்கள் மற்றும் பதனிடும் வேதிப்பொருட்கள்"
  ],
  [
    "Anthrax",
    "ஆந்த்ராக்ஸ்"
  ],
  [
    "Bacillus anthracis",
    "பேசில்லஸ் ஆந்த்ராசிஸ்"
  ],
  [
    "Handling contaminated animal hair",
    "மாசுபட்ட விலங்கு உரோமங்களைக் கையாளுதல்"
  ],
  [
    "Fever, cough and difficulty breathing",
    "காய்ச்சல், இருமல், மூச்சுவிடுவதில் சிரமம்"
  ],
  [
    "Silk reeling—prolonged standing; wool scouring—detergent-related skin irritation",
    "பட்டு இழைப் பிரித்தல்—நீண்ட நேரம் நிற்றல்; கம்பளி கழுவுதல்—சலவைத்தூளால் தோல் எரிச்சல்"
  ],
  [
    "Promptly seek medical advice and report the possible exposure",
    "உடனடியாக மருத்துவ ஆலோசனை பெற்று சாத்தியமான தொற்றுத் தொடர்பைத் தெரிவிக்க வேண்டும்"
  ],
  [
    "Vaccinating at-risk livestock under veterinary guidance",
    "கால்நடை மருத்துவரின் ஆலோசனைப்படி அபாயமுள்ள கால்நடைகளுக்குத் தடுப்பூசி போடுதல்"
  ],
  [
    "Veterinary or public-health authorities",
    "கால்நடை மருத்துவ அல்லது பொது சுகாதார அதிகாரிகள்"
  ],
  [
    "Providing clean and well-ventilated working conditions",
    "சுத்தமும் நல்ல காற்றோட்டமும் கொண்ட பணிச்சூழலை வழங்குதல்"
  ],
  [
    "Silk—silkworm cocoon; wool—sheep or goat fleece",
    "பட்டு—பட்டுப்புழுக் கூடு; கம்பளி—செம்மறியாடு அல்லது வெள்ளாட்டின் உரோமம்"
  ],
  [
    "Avoiding harm to silkworms during silk production",
    "பட்டு உற்பத்தியில் பட்டுப்புழுக்களுக்கு தீங்கு விளைவிக்காமல் இருத்தல்"
  ],
  [
    "Peace silk",
    "அமைதிப் பட்டு"
  ],
  [
    "1992",
    "1992"
  ],
  [
    "An approach to producing silk without killing the silkworm",
    "பட்டுப்புழுவைக் கொல்லாமல் பட்டு தயாரிக்கும் அணுகுமுறை"
  ],
  [
    "It allows the moth to emerge before the emptied cocoon is processed",
    "பட்டுப்பூச்சி வெளியேறிய பின் காலியான கூட்டைப் பதனிடுகிறது"
  ]
]


class ReviewedTextileHazardQuizTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK.read_text(encoding="utf-8"))
        cls.records = [q for q in cls.data["questions"] if q.get("quiz") == 4]

    def test_preserve_all_500_bilingual_questions_and_25_sets(self):
        questions = self.data["questions"]
        self.assertEqual(len(questions), 500)
        self.assertEqual(len(self.data["meta"]["quiz_sets"]), 25)
        self.assertEqual(self.data["meta"]["total_questions"], 500)
        self.assertEqual(Counter(q["quiz"] for q in questions),
                         Counter({i: 20 for i in range(1, 26)}))
        self.assertEqual(len({q["id"] for q in questions}), 500)

    def test_twenty_reviewed_records_and_english_tamil_answer_keys(self):
        self.assertEqual(len(self.records), 20)
        self.assertEqual([q["id"] for q in self.records],
                         [f"C07S-T3-U05-Q{n:04d}" for n in range(61, 81)])
        positions = Counter()
        for q, (expected_en, expected_ta) in zip(self.records, EXPECTED_ANSWERS):
            with self.subTest(id=q["id"]):
                correct = q["correct"]
                self.assertIs(type(correct), int)
                self.assertIn(correct, range(4))
                positions[correct] += 1
                self.assertEqual(q["opts_en"][correct], expected_en)
                self.assertEqual(q["opts_ta"][correct], expected_ta)
                for language in ("en", "ta"):
                    self.assertTrue(q[f"q_{language}"].strip().endswith("?"))
                    self.assertTrue(q[f"exp_{language}"].strip())
                    opts = q[f"opts_{language}"]
                    self.assertEqual(len(opts), 4)
                    self.assertTrue(all(isinstance(v, str) and v.strip() for v in opts))
                    self.assertEqual(len({v.casefold().strip() for v in opts}), 4)
                self.assertIn(q["page_en"], (87, 88))
                self.assertNotRegex(q["q_en"], re.compile(
                    r"according to (the )?textbook|correct textbook answer|"
                    r"which statement correctly describes", re.I))
        self.assertEqual(positions, Counter({i: 5 for i in range(4)}))
        self.assertEqual(len({q["q_en"].casefold().strip() for q in self.records}), 20)

    def test_anthrax_answer_and_exposure_advice_do_not_prescribe(self):
        self.assertEqual(self.records[5]["opts_en"][self.records[5]["correct"]], "Anthrax")
        self.assertEqual(self.records[6]["opts_en"][self.records[6]["correct"]], "Bacillus anthracis")
        self.assertIn("medical advice", self.records[10]["opts_en"][self.records[10]["correct"]])
        self.assertIn("Veterinary", self.records[12]["opts_en"][self.records[12]["correct"]])
        for q in self.records:
            # Medical treatment must not be oversimplified as a fixed drug answer.
            self.assertNotRegex(q["exp_en"], re.compile(
                r"best medicine|self.medicate|take \d+ mg|antibiotics? at home", re.I))

    def test_ahimsa_silk_history_and_distinct_method(self):
        self.assertEqual(self.records[16]["opts_en"][self.records[16]["correct"]], "Peace silk")
        self.assertEqual(self.records[17]["opts_en"][self.records[17]["correct"]], "1992")
        self.assertIn("Kusuma Rajaiah", self.records[18]["q_en"])
        self.assertIn("moth to emerge", self.records[19]["opts_en"][self.records[19]["correct"]])


if __name__ == "__main__":
    unittest.main()
