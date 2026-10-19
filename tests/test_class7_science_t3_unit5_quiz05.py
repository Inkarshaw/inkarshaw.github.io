#!/usr/bin/env python3
"""Guard the 20 applied English-Tamil questions in Class 7 Science T3 Unit 5 Quiz 5.

TNSCERT Std VII Science Term III Unit 5, 2024 English pages 85–88 and
corresponding Tamil textbook. Occupational-health applications have no
medication or unsafe specimen-handling instructions.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data/textbook/class-7/science/term-3/unit-5.json"
EXPECTED = [
  [
    "An emerging moth breaks the cocoon's long silk filament",
    "வெளியேறும் பட்டுப்பூச்சி கூட்டின் நீண்ட பட்டு இழையை அறுத்துவிடும்",
    86
  ],
  [
    "Food, clean water, suitable shelter and necessary veterinary care",
    "உணவு, சுத்தமான நீர், ஏற்ற உறைவிடம், தேவையான கால்நடை மருத்துவப் பராமரிப்பு",
    88
  ],
  [
    "Animal husbandry",
    "கால்நடை வளர்ப்பு (Animal husbandry)",
    88
  ],
  [
    "1960",
    "1960",
    88
  ],
  [
    "Dog breeding, animal markets and aquarium or pet-fish trade",
    "நாய் இனப்பெருக்கம், விலங்கு சந்தைகள், மீன்தொட்டி அல்லது செல்ல மீன் வணிகம்",
    88
  ],
  [
    "Biological infection hazard",
    "உயிரியல் தொற்று அபாயம்",
    87
  ],
  [
    "Using suitable protective gloves and safe handling procedures",
    "பொருத்தமான பாதுகாப்புக் கையுறைகள் அணிந்து பாதுகாப்பு முறையில் கையாளுதல்",
    87
  ],
  [
    "Ergonomic workstations, task variation and suitable rest breaks",
    "உடலுக்கு ஏற்ற பணியமைப்பு, வேலை மாற்றம், தேவையான ஓய்வு இடைவெளிகள்",
    87
  ],
  [
    "It helps lower exposure to airborne irritants linked to respiratory illness",
    "சுவாசப் பிரச்சினைகளுடன் தொடர்புடைய காற்றிலுள்ள எரிச்சல் தரும் துகள்களின் வெளிப்பாட்டைக் குறைக்க உதவும்",
    87
  ],
  [
    "Stop handling it and alert responsible veterinary or occupational-safety personnel",
    "அதைக் கையாள்வதை நிறுத்திப் பொறுப்புள்ள கால்நடை மருத்துவ அல்லது பணியிடப் பாதுகாப்பு அலுவலருக்குத் தெரிவித்தல்",
    87
  ],
  [
    "Detergent exposure—chemical; contaminated animal hair—biological",
    "சலவைத்தூள் வெளிப்பாடு—வேதியியல்; மாசுபட்ட விலங்கு உரோமம்—உயிரியல்",
    87
  ],
  [
    "A clinician considers exposure history and appropriate medical tests",
    "மருத்துவர் தொற்றுத் தொடர்பு வரலாற்றையும் தேவையான மருத்துவப் பரிசோதனைகளையும் மதிப்பிடுவார்",
    87
  ],
  [
    "It can lower the chance of handling material from infected animals",
    "நோயுற்ற விலங்குகளின் உரோமத்தை கையாளும் வாய்ப்பைக் குறைக்க உதவும்",
    87
  ],
  [
    "Initial handling and sorting of raw fleece",
    "பதனிடாத உரோமத்தை முதலில் கையாளுதல் மற்றும் தரம் பிரித்தல்",
    87
  ],
  [
    "Making surgical sutures",
    "அறுவை சிகிச்சைக்கான தையல் நூல்கள் தயாரித்தல்",
    87
  ],
  [
    "Curtains, wall hangings and rugs",
    "திரைச்சீலைகள், சுவர் அலங்காரத் துணிகள், விரிப்புகள்",
    87
  ],
  [
    "Wool, often blended with other fibres",
    "பிற இழைகளுடன் கலந்த கம்பளி",
    86
  ],
  [
    "Two-thirds",
    "மூன்றில் இரண்டு பங்கு",
    86
  ],
  [
    "Silk can feel comfortable in warm weather and offer warmth in cooler weather",
    "வெப்பமான காலத்தில் பட்டு இதமாகவும் குளிரான காலத்தில் வெப்பம் தருவதாகவும் இருக்கலாம்",
    87
  ],
  [
    "Goats, yaks, alpacas and rabbits",
    "வெள்ளாடுகள், யாக்குகள், அல்பாக்காக்கள், முயல்கள்",
    85
  ]
]


class ReviewedAnimalWelfareAndTextilesQuiz5(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
        cls.questions = cls.data["questions"][80:100]

    def test_preserve_500_unique_questions_and_25_full_sets(self):
        all_questions = self.data["questions"]
        self.assertEqual(len(all_questions), 500)
        self.assertEqual(len(set(q["id"] for q in all_questions)), 500)
        self.assertEqual(Counter(q["quiz"] for q in all_questions),
                         Counter({i: 20 for i in range(1, 26)}))
        self.assertEqual(self.data["meta"]["total_questions"], 500)
        self.assertEqual(len(self.data["meta"]["quiz_sets"]), 25)

    def test_twenty_applied_questions_with_checked_bilingual_answers(self):
        self.assertEqual(len(self.questions), 20)
        positions = Counter()
        all_stems = set()
        for offset, (q, (en, ta, page)) in enumerate(zip(self.questions, EXPECTED)):
            with self.subTest(id=q["id"]):
                self.assertEqual(q["id"], f"C07S-T3-U05-Q{offset + 81:04d}")
                self.assertEqual(q["quiz"], 5)
                self.assertEqual(q["type"], "application")
                self.assertEqual(q["page_en"], page)
                idx = q["correct"]
                self.assertIs(type(idx), int)
                self.assertIn(idx, range(4))
                positions[idx] += 1
                self.assertEqual(q["opts_en"][idx], en)
                self.assertEqual(q["opts_ta"][idx], ta)
                for lang in ("en", "ta"):
                    self.assertTrue(q[f"q_{lang}"].strip().endswith("?"))
                    self.assertTrue(q[f"exp_{lang}"].strip())
                    options = q[f"opts_{lang}"]
                    self.assertEqual(len(options), 4)
                    self.assertTrue(all(x.strip() for x in options))
                    self.assertEqual(len({x.strip().casefold() for x in options}), 4)
                stem = re.sub(r"[^a-z0-9]", "", q["q_en"].lower())
                self.assertNotIn(stem, all_stems)
                all_stems.add(stem)
                self.assertNotRegex(q["q_en"], re.compile(
                    r"according to the textbook|correct textbook answer|"
                    r"which occupational.health or animal.welfare topic matches|"
                    r"which statement correctly describes", re.I))
        self.assertEqual(positions, Counter({index: 5 for index in range(4)}))

    def test_sources_and_ethical_safety_concepts(self):
        self.assertEqual(self.questions[3]["opts_en"][self.questions[3]["correct"]], "1960")
        self.assertIn("medical tests", self.questions[11]["opts_en"][self.questions[11]["correct"]])
        self.assertEqual(self.questions[14]["opts_en"][self.questions[14]["correct"]],
                         "Making surgical sutures")
        self.assertIn("noise", self.questions[16]["q_en"])
        self.assertEqual(self.questions[17]["opts_en"][self.questions[17]["correct"]],
                         "Two-thirds")
        for q in self.questions:
            self.assertNotIn("penicillin or ciprofloxacin", q["q_en"].casefold())


if __name__ == "__main__":
    unittest.main()
