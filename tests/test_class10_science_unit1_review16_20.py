#!/usr/bin/env python3
"""Class 10 Laws of Motion English–Tamil review regression, Quizzes 16–20.

Tamil Nadu SCERT Class 10 Science (2020), Unit 1. Automated key and structural
checks do not replace fact-by-fact Tamil-native editorial verification.
"""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = json.loads((ROOT / "data/textbook/class-10/science/unit-1.json").read_text(encoding="utf-8"))
EXPECTED_KEYS = [
  [
    "60 kg m/s forward",
    "முன்னோக்கி 60 kg m/s"
  ],
  [
    "12 N",
    "12 N"
  ],
  [
    "24 m",
    "24 m"
  ],
  [
    "32 N s",
    "32 N s"
  ],
  [
    "150 N",
    "150 N"
  ],
  [
    "It equals g",
    "g-க்குச் சமம்"
  ],
  [
    "Both A and R are true, and R explains A",
    "கூற்றும் காரணமும் சரி; காரணம் கூற்றை விளக்குகிறது"
  ],
  [
    "50 N",
    "50 N"
  ],
  [
    "6 N m",
    "6 N m"
  ],
  [
    "0.5 m/s² upward",
    "மேல்நோக்கி 0.5 m/s²"
  ],
  [
    "24 J",
    "24 J"
  ],
  [
    "24 J",
    "24 J"
  ],
  [
    "Both A and R are true, and R explains A",
    "கூற்றும் காரணமும் சரி; காரணம் கூற்றை விளக்குகிறது"
  ],
  [
    "The total momentum of the two-skater system",
    "இரு வீரர்கள் கொண்ட அமைப்பின் மொத்த உந்தம்"
  ],
  [
    "6.674×10⁻⁸",
    "6.674×10⁻⁸"
  ],
  [
    "1 : 1",
    "1 : 1"
  ],
  [
    "45 m",
    "45 m"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "Gravity: 3g₀/4",
    "ஈர்ப்பு முடுக்கம்: 3g₀/4"
  ],
  [
    "100 m",
    "100 m"
  ],
  [
    "50 N",
    "50 N"
  ],
  [
    "350 N",
    "350 N"
  ],
  [
    "11 N",
    "11 N"
  ],
  [
    "Both accelerate at 5 m/s² downward along the plane",
    "இரண்டும் சாய்தளத்தில் கீழ்நோக்கி 5 m/s² முடுக்கமடையும்"
  ],
  [
    "0.75 m/s westward",
    "மேற்குநோக்கி 0.75 m/s"
  ],
  [
    "5 s",
    "5 s"
  ],
  [
    "−2 m/s",
    "−2 m/s"
  ],
  [
    "16 J",
    "16 J"
  ],
  [
    "Momentum change: 20 kg m/s; kinetic-energy change: 0 J",
    "உந்த மாற்றம்: 20 kg m/s; இயக்க ஆற்றல் மாற்றம்: 0 J"
  ],
  [
    "100 N",
    "100 N"
  ],
  [
    "0.8 N m",
    "0.8 N m"
  ],
  [
    "Anticlockwise",
    "இடஞ்சுழியாக"
  ],
  [
    "Area under force–time gives impulse; area under force–displacement gives work",
    "விசை–கால வரைபடப் பரப்பு கணத்தாக்கு; விசை–இடப்பெயர்ச்சி வரைபடப் பரப்பு வேலை"
  ],
  [
    "The Moon's gravitational pull differs across Earth's near and far sides",
    "பூமியின் நிலவுக்கு அருகிலுள்ள மற்றும் தொலைவிலுள்ள பகுதிகளில் நிலவின் ஈர்ப்பு விசை வேறுபடுகிறது"
  ],
  [
    "No; outside the pair, both gravitational fields point toward the masses in the same direction",
    "முடியாது; இரு நிறைகளுக்கும் வெளியே இரு ஈர்ப்புப்புலங்களும் ஒரே திசையில் நிறைகளை நோக்கிச் செயல்படும்"
  ],
  [
    "It becomes half",
    "பாதியாகும்"
  ],
  [
    "Force: GM²/8",
    "விசை: GM²/8"
  ],
  [
    "No; the passenger loses contact with the floor, because an ordinary floor cannot pull them downward",
    "முடியாது; சாதாரணத் தரை பயணியைக் கீழ்நோக்கி இழுக்க முடியாததால் அவர் தரையுடனான தொடர்பை இழப்பார்"
  ],
  [
    "9 N eastward",
    "கிழக்குநோக்கி 9 N"
  ],
  [
    "2√13 m/s (about 7.21 m/s)",
    "2√13 m/s (சுமார் 7.21 m/s)"
  ],
  [
    "20 N",
    "20 N"
  ],
  [
    "7.5 m/s²",
    "7.5 m/s²"
  ],
  [
    "2 m/s²",
    "2 m/s²"
  ],
  [
    "6 kg m/s",
    "6 kg m/s"
  ],
  [
    "Net force: zero; clockwise couple of 12 N m",
    "நிகர விசை: சுழி; வலஞ்சுழித் திருப்புத்திறன் 12 N m"
  ],
  [
    "A moves west at 1 m/s and B moves east at 5 m/s",
    "A மேற்குநோக்கி 1 m/s; B கிழக்குநோக்கி 5 m/s"
  ],
  [
    "−2 kg m/s",
    "−2 kg m/s"
  ],
  [
    "40 rpm and 18 N m",
    "நிமிடத்திற்கு 40 சுற்றுகள் மற்றும் 18 N m"
  ],
  [
    "2 kg",
    "2 kg"
  ],
  [
    "32 N",
    "32 N"
  ],
  [
    "It supports the head as the seat drives the torso forward, reducing excessive relative neck motion",
    "இருக்கை உடலை முன்னோக்கி நகர்த்தும்போது தலையைத் தாங்கி, கழுத்தின் அதிகமான சார்பு இயக்கத்தைக் குறைக்கிறது"
  ],
  [
    "It is positive and equals mu² if each cart has mass m",
    "இயக்க ஆற்றல் சுழியல்ல; ஒவ்வொரு வண்டியின் நிறை m எனில் மொத்தம் mu²"
  ],
  [
    "54 J",
    "54 J"
  ],
  [
    "3 : 2",
    "3 : 2"
  ],
  [
    "Ratio B : A = 1 : √3",
    "விகிதம் B : A = 1 : √3"
  ],
  [
    "5×10⁶ m",
    "5×10⁶ m"
  ],
  [
    "Equal to Earth's",
    "பூமியின் விடுபடு வேகத்துக்குச் சமம்"
  ],
  [
    "10 m/s downward; 15 m above launch",
    "கீழ்நோக்கி 10 m/s; எறிந்த இடத்துக்கு மேலே 15 m"
  ],
  [
    "It remains constant because the rocket–gas interaction is internal",
    "ராக்கெட்–வாயு பரஸ்பர விசை உள்விசை என்பதால் மொத்த உந்தம் மாறாமல் இருக்கும்"
  ],
  [
    "6 kg m/s eastward",
    "கிழக்குநோக்கி 6 kg m/s"
  ],
  [
    "5 m/s east",
    "கிழக்குநோக்கி 5 m/s"
  ],
  [
    "14 N",
    "14 N"
  ],
  [
    "25 N",
    "25 N"
  ],
  [
    "Momentum change: 2 kg m/s",
    "உந்த மாற்றம்: 2 kg m/s"
  ],
  [
    "Acceleration: 0 m/s²",
    "முடுக்கம்: 0 m/s²"
  ],
  [
    "50 N",
    "50 N"
  ],
  [
    "It remains 3 N m",
    "3 N m-ஆகவே இருக்கும்"
  ],
  [
    "10 clockwise turns",
    "வலஞ்சுழியாக 10 சுற்றுகள்"
  ],
  [
    "20 N s",
    "20 N s"
  ],
  [
    "1 s",
    "1 s"
  ],
  [
    "7.41% (approximately)",
    "சுமார் 7.41%"
  ],
  [
    "The raft acquires momentum equal and opposite to the person's horizontal momentum",
    "நபரின் கிடைமட்ட உந்தத்துக்குச் சமமான எதிர்த்திசை உந்தத்தைத் தெப்பம் பெறுகிறது"
  ],
  [
    "8√2 kg m/s",
    "8√2 kg m/s"
  ],
  [
    "New gravitational force: F (unchanged)",
    "புதிய ஈர்ப்பு விசை: F (மாறாது)"
  ],
  [
    "One-sixteenth of Earth's",
    "பூமியின் பதினாறில் ஒரு பங்கு"
  ],
  [
    "It becomes 27 times the original",
    "தொடக்கக் காலத்தின் 27 மடங்கு"
  ],
  [
    "3 : 1",
    "3 : 1"
  ],
  [
    "At 1 s and 3 s",
    "1 s மற்றும் 3 s-இல்"
  ],
  [
    "512 N",
    "512 N"
  ],
  [
    "100 m",
    "100 m"
  ],
  [
    "Back to the passenger, if the train does not accelerate",
    "ரயில் முடுக்கமடையாவிட்டால் மீண்டும் அதே பயணியிடம் திரும்பும்"
  ],
  [
    "6.25 m/s²",
    "6.25 m/s²"
  ],
  [
    "6 N",
    "6 N"
  ],
  [
    "+7 m/s",
    "+7 m/s"
  ],
  [
    "20 kg m/s",
    "20 kg m/s"
  ],
  [
    "9 N",
    "9 N"
  ],
  [
    "70 N",
    "70 N"
  ],
  [
    "A 13 N force exactly opposite to their resultant",
    "இரு விசைகளின் தொகுபயனுக்கு நேரெதிரான 13 N விசை"
  ],
  [
    "6 N m anticlockwise",
    "இடஞ்சுழியாக 6 N m"
  ],
  [
    "+9 m/s",
    "+9 m/s"
  ],
  [
    "1 m/s east",
    "கிழக்குநோக்கி 1 m/s"
  ],
  [
    "6 J",
    "6 J"
  ],
  [
    "2√2 m/s",
    "2√2 m/s"
  ],
  [
    "Attraction: F/4",
    "ஈர்ப்பு விசை: F/4"
  ],
  [
    "1",
    "1"
  ],
  [
    "Escape-speed ratio: 1/√3",
    "விடுபடு வேக விகிதம்: 1/√3"
  ],
  [
    "It doubles",
    "இருமடங்காகும்"
  ],
  [
    "180 N",
    "180 N"
  ],
  [
    "4s",
    "4s"
  ],
  [
    "Both spacecraft and object share nearly the same free-fall orbital acceleration",
    "விண்கலமும் பொருளும் ஏறத்தாழ ஒரே சுதந்திர வீழ்ச்சி சுற்றுப்பாதை முடுக்கத்தைப் பெறுகின்றன"
  ]
]
SPEC = importlib.util.spec_from_file_location(
    "quality_audit", ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class LawsMotionReviewQuizzes16To20Tests(unittest.TestCase):
    def test_preserve_bank_ids_and_positions(self):
        self.assertEqual(len(BANK["questions"]), 580)
        self.assertEqual(BANK["meta"]["total_questions"], 580)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]), 29)
        self.assertEqual(len(EXPECTED_KEYS), 100)
        self.assertEqual(len({q["id"] for q in BANK["questions"]}), 580)
        self.assertEqual(Counter(q["correct"] for q in BANK["questions"][300:400]),
                         Counter({0:25, 1:25, 2:25, 3:25}))

    def test_exact_bilingual_keys_explanations_and_audit(self):
        window = BANK["questions"][300:400]
        seen = set()
        for n, (item, (english, tamil)) in enumerate(zip(window, EXPECTED_KEYS), 301):
            with self.subTest(question=n):
                self.assertEqual(item["id"], f"C10SCI-U01-Q{n:04d}")
                self.assertEqual(item["quiz"], (n-1)//20+1)
                self.assertEqual(item["opts_en"][item["correct"]], english)
                self.assertEqual(item["opts_ta"][item["correct"]], tamil)
                stem = AUDIT.normalize(item["q_en"])
                self.assertNotIn(stem, seen)
                seen.add(stem)
                for lang in ("en", "ta"):
                    choices = item[f"opts_{lang}"]
                    explanation = item[f"exp_{lang}"]
                    self.assertEqual(len(choices), 4)
                    self.assertTrue(AUDIT.distinct_options(choices, item["q_en"]))
                    self.assertIn(choices[item["correct"]], explanation)
                    self.assertGreaterEqual(len(explanation.strip()), 75 if lang=="en" else 50)
        audited = AUDIT.audit(BANK["questions"], start=300, count=100)
        self.assertEqual(audited["errors"], [], audited["errors"])
        self.assertEqual(audited["warnings"], [], audited["warnings"])

if __name__ == "__main__":
    unittest.main()
