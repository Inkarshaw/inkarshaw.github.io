#!/usr/bin/env python3
"""Quiz 7 bilingual fact, distractor, balance and preservation regression.

English source: Tamil Nadu Class 7 Science Term III (2024), Unit 5,
printed pp. 87–88. Checked against corresponding Tamil Unit 5 sections.
Automated test results are not a substitute for human translation review.
"""
import json
import re
import unittest
from collections import Counter
from pathlib import Path

BANK = Path(__file__).resolve().parents[1] / "data/textbook/class-7/science/term-3/unit-5.json"
EXPECTED = [
  [
    "Penicillin and ciprofloxacin",
    "பெனிசிலினும் சிப்ரோஃப்ளோக்சாசினும்"
  ],
  [
    "Appropriate animal vaccination under veterinary guidance",
    "கால்நடை மருத்துவ வழிகாட்டுதலின்படி உரிய தடுப்பூசி செலுத்துதல்"
  ],
  [
    "Keep people away and alert veterinary authorities for controlled disposal",
    "மக்களை விலக்கி வைத்து, பாதுகாப்பான அகற்றலுக்குக் கால்நடை மருத்துவ அதிகாரிகளுக்குத் தெரிவிப்பது"
  ],
  [
    "Clean work areas, good ventilation and safeguards against hazardous exposures",
    "சுத்தமான பணிப்பகுதி, நல்ல காற்றோட்டம், அபாயகரமான வெளிப்பாடுகளுக்கான பாதுகாப்புகள்"
  ],
  [
    "Rearing silkworms to obtain silk",
    "பட்டு பெறப் பட்டுப்புழுக்களை வளர்த்தல்"
  ],
  [
    "Moths emerge alive before empty cocoons are processed",
    "பட்டுப்பூச்சிகள் உயிருடன் வெளியேறிய பின் காலியான கூடுகள் பதனிடப்படுகின்றன"
  ],
  [
    "A method of obtaining silk without killing the developing moth",
    "வளரும் பட்டுப்பூச்சியைக் கொல்லாமல் பட்டு பெறும் முறை"
  ],
  [
    "1960 animal-cruelty prevention law came before the 1992 Ahimsa-silk proposal",
    "1960-ஆம் ஆண்டு விலங்கு வதைத் தடுப்புச் சட்டம் 1992-ஆம் ஆண்டு அகிம்சைப்பட்டு முன்மொழிவுக்கு முந்தியது"
  ],
  [
    "Kusuma Rajaiah",
    "குசுமா ராஜய்யா"
  ],
  [
    "The long silk filament is broken where the moth exited",
    "பட்டுப்பூச்சி வெளியேறிய இடத்தில் நீண்ட பட்டு இழை அறுபடும்"
  ],
  [
    "To soften the filament binding and prevent moth emergence from breaking the thread",
    "பட்டு இழையைப் பிணைக்கும் பொருளைத் தளர்த்தி பட்டுப்பூச்சி வெளியேறும்போது நூல் அறுபடுவதைத் தடுத்தல்"
  ],
  [
    "Protecting and maintaining the animal's welfare",
    "விலங்கின் நலனைப் பாதுகாத்துப் பராமரித்தல்"
  ],
  [
    "Selective breeding and regular care of domestic animals",
    "வளர்ப்பு விலங்குகளின் தேர்ந்தெடுத்த இனப்பெருக்கமும் முறையான பராமரிப்பும்"
  ],
  [
    "It concerns preventing unnecessary cruelty to animals",
    "விலங்குகளுக்குத் தேவையற்ற கொடுமை செய்வதைத் தடுப்பது தொடர்பானது"
  ],
  [
    "Dog breeding, animal markets, aquariums and pet-fish ownership",
    "நாய் இனப்பெருக்கம், விலங்குச் சந்தைகள், மீன்காட்சியகங்கள், செல்ல மீன் வளர்ப்பு"
  ],
  [
    "An occupational or industrial hazard",
    "தொழில்சார் அல்லது தொழிற்சாலை அபாயம்"
  ],
  [
    "Suitable seated work and breaks between repetitive tasks",
    "பொருத்தமான அமர்விடமும் தொடர்ச்சிப் பணிகளுக்கிடையே ஓய்வும் வழங்குதல்"
  ],
  [
    "Back pain, vision problems and skin injuries",
    "முதுகுவலி, பார்வைக் கோளாறுகள், தோல் காயங்கள்"
  ],
  [
    "Inadequate ventilation and airborne exposure",
    "போதிய காற்றோட்டமின்மையும் காற்றில் உள்ள தீங்கு தரும் துகள்களும்"
  ],
  [
    "Irritating chemicals in wool processing can affect the skin",
    "கம்பளி பதனிடுதலில் பயன்படும் எரிச்சலூட்டும் வேதிப்பொருட்கள் தோலைப் பாதிக்கலாம்"
  ]
]


class Class7ScienceQuiz7Review(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(BANK.read_text(encoding="utf-8"))
        cls.quiz = [q for q in cls.data["questions"] if q.get("quiz") == 7]

    def test_keeps_complete_bank_and_catalogue_coverage(self):
        all_questions = self.data["questions"]
        self.assertEqual(len(all_questions), 500)
        self.assertEqual(self.data["meta"]["total_questions"], 500)
        self.assertEqual(len({q["id"] for q in all_questions}), 500)
        self.assertEqual(Counter(q["quiz"] for q in all_questions),
                         Counter({n: 20 for n in range(1, 26)}))

    def test_twenty_exam_focused_english_tamil_mcqs(self):
        self.assertEqual(len(self.quiz), 20)
        self.assertEqual(len(EXPECTED), 20)
        self.assertEqual([q["id"] for q in self.quiz],
                         [f"C07S-T3-U05-Q{n:04d}" for n in range(121, 141)])
        positions = Counter()
        signatures = set()
        for q, (english, tamil) in zip(self.quiz, EXPECTED):
            with self.subTest(question=q["id"]):
                self.assertIs(type(q["correct"]), int)
                self.assertIn(q["correct"], range(4))
                positions[q["correct"]] += 1
                self.assertEqual(q["opts_en"][q["correct"]], english)
                self.assertEqual(q["opts_ta"][q["correct"]], tamil)
                self.assertIn(q["page_en"], (87, 88))
                for lang in ("en", "ta"):
                    self.assertTrue(q[f"q_{lang}"].endswith("?"))
                    self.assertTrue(q[f"exp_{lang}"].strip())
                    opts = q[f"opts_{lang}"]
                    self.assertEqual(len(opts), 4)
                    self.assertTrue(all(isinstance(o, str) and o.strip() for o in opts))
                    self.assertEqual(len(set(o.strip().casefold() for o in opts)), 4)
                self.assertNotRegex(q["q_en"], re.compile(
                    r"according to the textbook|choose the correct textbook|"
                    r"competitive-exam note states|correct textbook answer", re.I))
                normalized = re.sub(r"[^a-z0-9]", "", q["q_en"].lower())
                self.assertNotIn(normalized, signatures)
                signatures.add(normalized)
        self.assertEqual(positions, Counter({index: 5 for index in range(4)}))

    def test_specific_facts_and_safe_carcass_handling(self):
        self.assertIn("penicillin", self.quiz[0]["exp_en"].lower())
        self.assertIn("ciprofloxacin", self.quiz[0]["exp_en"].lower())
        self.assertIn("veterinary authorities", self.quiz[2]["opts_en"][self.quiz[2]["correct"]])
        self.assertIn("1992", self.quiz[7]["exp_en"])
        self.assertIn("1960", self.quiz[7]["exp_en"])
        self.assertIn("Kusuma Rajaiah", self.quiz[8]["opts_en"][self.quiz[8]["correct"]])
        self.assertIn("cocoon", self.quiz[9]["exp_en"].lower())


if __name__ == "__main__":
    unittest.main()
