#!/usr/bin/env python3
"""Editorial regression for Class 10 Science Laws of Motion Quizzes 6–10."""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = json.loads(
    (ROOT / "data/textbook/class-10/science/unit-1.json").read_text(encoding="utf-8"))
EXPECTED_KEYS = [
  [
    "No net external force is required to maintain the constant velocity",
    "மாறாத திசைவேகத்தைத் தொடர நிகரப் புறவிசை தேவையில்லை"
  ],
  [
    "F = Δp/Δt (or dp/dt)",
    "F = Δp/Δt (அல்லது dp/dt)"
  ],
  [
    "6 N",
    "6 N"
  ],
  [
    "Net external force = 0 and net external torque = 0",
    "நிகரப் புறவிசை = 0; நிகரப் புறத் திருப்புவிசை = 0"
  ],
  [
    "It doubles",
    "இருமடங்காகும்"
  ],
  [
    "6 N m",
    "6 N m"
  ],
  [
    "Momentum doubles; kinetic energy becomes four times",
    "உந்தம் இருமடங்கு; இயக்க ஆற்றல் நான்கு மடங்கு"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "6 kg m/s",
    "6 kg m/s"
  ],
  [
    "17 N s forward",
    "முன்னோக்கி 17 N s"
  ],
  [
    "The lighter bullet",
    "குறைந்த நிறையுள்ள தோட்டாவின் இயக்க ஆற்றல் அதிகம்"
  ],
  [
    "Zero net force but a nonzero turning moment",
    "நிகர விசை சுழியாக இருந்தாலும் சுழியல்லாத திருப்புத்திறன் ஏற்படலாம்"
  ],
  [
    "It may decrease, although total horizontal momentum is conserved",
    "மொத்த கிடைமட்ட உந்தம் மாறாமல் இருந்தாலும் இயக்க ஆற்றல் குறையலாம்"
  ],
  [
    "M⁻¹ L³ T⁻²",
    "M⁻¹ L³ T⁻²"
  ],
  [
    "Six times G (6G N)",
    "G இன் ஆறு மடங்கு (6G N)"
  ],
  [
    "One-half of g₀",
    "g₀ இன் பாதி"
  ],
  [
    "480 N",
    "480 N"
  ],
  [
    "Earth's gravitational attraction",
    "பூமியின் ஈர்ப்பு விசை"
  ],
  [
    "It doubles",
    "இருமடங்காகும்"
  ],
  [
    "0 kg m/s (zero total momentum)",
    "0 kg m/s (மொத்த உந்தம் சுழி)"
  ],
  [
    "The leaves initially tend to remain at rest due to inertia while the branch moves",
    "கிளை நகரும்போது இலைகள் நிலைமத்தால் தொடக்கத்தில் ஓய்விலேயே இருக்க முனைகின்றன"
  ],
  [
    "Unlike parallel forces",
    "எதிர்த்திசை இணைவிசைகள் (Unlike parallel forces)"
  ],
  [
    "Zero net force can coexist with a change in shape",
    "நிகர விசை சுழியாக இருந்தாலும் வடிவ மாற்றம் ஏற்படலாம்"
  ],
  [
    "6 N west and 8 N south, giving 10 N southwest",
    "மேற்குநோக்கி 6 N, தெற்குநோக்கி 8 N கூறுகளைக் கொண்ட தென்மேற்குத் திசை 10 N விசை"
  ],
  [
    "A is false, but R is true",
    "கூற்று தவறு; காரணம் சரி"
  ],
  [
    "Perpendicular to the horizontal plane, with the sense determined by the rotation",
    "கிடைமட்டத் தளத்திற்குச் செங்குத்தாக; சுழற்சித் திசையைச் சார்ந்து இருக்கும்"
  ],
  [
    "One-half",
    "பாதி (1/2)"
  ],
  [
    "Anticlockwise",
    "இடஞ்சுழியாக"
  ],
  [
    "60 N",
    "60 N"
  ],
  [
    "Newton's second law",
    "நியூட்டனின் இரண்டாம் விதி"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "Net force acting on the body",
    "பொருளின்மீது செயல்படும் நிகர விசை"
  ],
  [
    "20 N",
    "20 N"
  ],
  [
    "Both A and R are true, and R correctly explains A",
    "கூற்றும் காரணமும் சரி; காரணம் கூற்றைச் சரியாக விளக்குகிறது"
  ],
  [
    "Spring balance",
    "சுருள் தராசு"
  ],
  [
    "29.4 m/s",
    "29.4 m/s"
  ],
  [
    "Its instantaneous velocity is zero, but its acceleration is g downward",
    "கணநேரத் திசைவேகம் சுழி; ஆனால் முடுக்கம் g கீழ்நோக்கி இருக்கும்"
  ],
  [
    "5.972 × 10²⁴ kg",
    "5.972 × 10²⁴ kg"
  ],
  [
    "It would become four times its original value (a 300% increase)",
    "முந்தைய மதிப்பின் நான்கு மடங்காகும் (300% அதிகரிப்பு)"
  ],
  [
    "G is a universal constant, whereas g varies with the planet and location",
    "G என்பது அனைத்துலக மாறிலி; g கோளையும் இடத்தையும் சார்ந்து மாறும்"
  ],
  [
    "2 m/s eastward",
    "கிழக்குநோக்கி 2 m/s"
  ],
  [
    "0 N (balanced forces)",
    "0 N (சமநிலை விசைகள்)"
  ],
  [
    "The loaded lorry",
    "சரக்கு ஏற்றிய லாரி"
  ],
  [
    "6 N m anticlockwise",
    "இடஞ்சுழியாக 6 N m"
  ],
  [
    "Torque and work",
    "திருப்புத்திறன் மற்றும் வேலை"
  ],
  [
    "+8 N s",
    "+8 N s"
  ],
  [
    "16 m",
    "16 m"
  ],
  [
    "7 kg m/s westward",
    "மேற்குநோக்கி 7 kg m/s"
  ],
  [
    "1000 N",
    "1000 N"
  ],
  [
    "Both are true, and the reason explains the assertion",
    "கூற்றும் காரணமும் சரி; காரணம் கூற்றை விளக்குகிறது"
  ],
  [
    "One-sixteenth of its original value",
    "முன்னைய மதிப்பின் பதினாறில் ஒரு பங்கு"
  ],
  [
    "30 kg",
    "30 kg"
  ],
  [
    "Mass unchanged; weight doubled",
    "நிறை மாறாது; எடை இருமடங்காகும்"
  ],
  [
    "20 m",
    "20 m"
  ],
  [
    "3 s",
    "3 s"
  ],
  [
    "Three-fourths of surface g",
    "மேற்பரப்பு g-யின் நான்கில் மூன்று பங்கு"
  ],
  [
    "Smaller than actual weight",
    "உண்மையான எடையைவிடக் குறைவு"
  ],
  [
    "540 N",
    "540 N"
  ],
  [
    "Zero",
    "சுழி"
  ],
  [
    "2 N eastward",
    "கிழக்குநோக்கி 2 N"
  ],
  [
    "13 N, about 67.4° north of east",
    "13 N; கிழக்கிலிருந்து வடக்குநோக்கி சுமார் 67.4°"
  ],
  [
    "5 m/s² eastward",
    "கிழக்குநோக்கி 5 m/s²"
  ],
  [
    "8 N",
    "8 N"
  ],
  [
    "Newton's first law of motion",
    "நியூட்டனின் முதல் இயக்க விதி"
  ],
  [
    "16 N",
    "16 N"
  ],
  [
    "2 rotations in the opposite direction",
    "எதிர்த்திசையில் 2 சுற்றுகள்"
  ],
  [
    "It remains the same for every reference pivot",
    "எந்தக் குறிப்புச் சுழல் புள்ளிக்கும் மாறாமல் இருக்கும்"
  ],
  [
    "10⁷ dyne cm",
    "10⁷ டைன் செ.மீ"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "A is false but R is true",
    "கூற்று தவறு; காரணம் சரி"
  ],
  [
    "5 N m",
    "5 N m"
  ],
  [
    "12√2 kg m/s",
    "12√2 kg m/s"
  ],
  [
    "3 m/s westward",
    "மேற்குநோக்கி 3 m/s"
  ],
  [
    "100 N",
    "100 N"
  ],
  [
    "3 J",
    "3 J"
  ],
  [
    "2 m/s² forward",
    "முன்னோக்கி 2 m/s²"
  ],
  [
    "3/2 times the original",
    "தொடக்க விசையின் 3/2 மடங்கு"
  ],
  [
    "Four-ninths of g₀",
    "g₀ இன் ஒன்பதில் நான்கு பங்கு"
  ],
  [
    "It becomes 1/√2 of the original escape speed",
    "தொடக்க விடுபடு வேகத்தின் 1/√2 மடங்காகும்"
  ],
  [
    "Three-fourths",
    "நான்கில் மூன்று பங்கு (3/4)"
  ],
  [
    "Kinetics",
    "இயக்கக் காரணவியல் (Kinetics)"
  ],
  [
    "The table pushes the book upward",
    "மேசை புத்தகத்தை மேல்நோக்கித் தள்ளும் விசை"
  ],
  [
    "5 m/s²",
    "5 m/s²"
  ],
  [
    "−3 N",
    "−3 N"
  ],
  [
    "Momentum stays the same; kinetic energy halves",
    "உந்தம் மாறாது; இயக்க ஆற்றல் பாதியாகும்"
  ],
  [
    "Net force is 8 N north; a turning moment may also occur",
    "நிகர விசை வடக்குநோக்கி 8 N; திருப்புவிசையும் ஏற்படலாம்"
  ],
  [
    "90°",
    "90°"
  ],
  [
    "6 N m",
    "6 N m"
  ],
  [
    "Three times the input torque",
    "உள்ளீட்டுத் திருப்புவிசையின் மூன்று மடங்கு"
  ],
  [
    "Half its original value",
    "முன்னைய மதிப்பின் பாதி"
  ],
  [
    "3√2 N s",
    "3√2 N s"
  ],
  [
    "3 m/s eastward",
    "கிழக்குநோக்கி 3 m/s"
  ],
  [
    "1 m/s in the first force's direction",
    "முதல் விசையின் திசையில் 1 m/s"
  ],
  [
    "5 J",
    "5 J"
  ],
  [
    "1/9",
    "1/9"
  ],
  [
    "From 4M: 2 m; from M: 1 m",
    "4M-இலிருந்து 2 m; M-இலிருந்து 1 m"
  ],
  [
    "Gravity at the altitude is half that at the depth",
    "உயரத்தில் உள்ள ஈர்ப்பு முடுக்கம் ஆழத்தில் உள்ளதன் பாதி"
  ],
  [
    "It stays the same",
    "மாறாமல் இருக்கும்"
  ],
  [
    "+g/5 upward",
    "+g/5 மேல்நோக்கி"
  ],
  [
    "5 : 1",
    "5 : 1"
  ]
]
SPEC = importlib.util.spec_from_file_location(
    "quiz_quality", ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class LawsMotionReviewQuizzes6To10Tests(unittest.TestCase):
    def test_all_580_original_items_and_positions(self):
        self.assertEqual(len(BANK["questions"]), 580)
        self.assertEqual(BANK["meta"]["total_questions"], 580)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]), 29)
        self.assertEqual(len(EXPECTED_KEYS), 100)
        self.assertEqual(Counter(q["correct"] for q in BANK["questions"][100:200]),
                         Counter({0:25,1:25,2:25,3:25}))

    def test_100_bilingual_answers_rationales_and_official_audit(self):
        window = BANK["questions"][100:200]
        seen_stems = set()
        for n, (q, (en, ta)) in enumerate(zip(window, EXPECTED_KEYS), 101):
            with self.subTest(n=n):
                self.assertEqual(q["id"], f"C10SCI-U01-Q{n:04d}")
                self.assertEqual(q["quiz"], (n-1)//20+1)
                self.assertEqual(q["opts_en"][q["correct"]], en)
                self.assertEqual(q["opts_ta"][q["correct"]], ta)
                stem = AUDIT.normalize(q["q_en"])
                self.assertNotIn(stem, seen_stems)
                seen_stems.add(stem)
                for lang in ("en","ta"):
                    options = q[f"opts_{lang}"]
                    self.assertEqual(len(options), 4)
                    self.assertTrue(AUDIT.distinct_options(options, q["q_en"]))
                    self.assertIn(options[q["correct"]], q[f"exp_{lang}"])
                    self.assertGreaterEqual(
                        len(q[f"exp_{lang}"].strip()), 75 if lang=="en" else 50)
        audited = AUDIT.audit(BANK["questions"], start=100, count=100)
        self.assertEqual(audited["errors"], [], audited["errors"])
        self.assertEqual(audited["warnings"], [], audited["warnings"])

if __name__ == "__main__":
    unittest.main()
