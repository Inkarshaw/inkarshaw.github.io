#!/usr/bin/env python3
"""Class 10 Science Laws of Motion editorial review: Quiz sets 11–15.

Source is Tamil Nadu SCERT 2019 Class 10 Science Unit 1. This checks key
alignment, explanation sufficiency, mathematical formatting and structural
standards, not independent Tamil-native editorial sign-off.
"""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BANK=json.loads((ROOT/"data/textbook/class-10/science/unit-1.json").read_text(encoding="utf-8"))
EXPECTED_KEYS=[
  [
    "Vertically below its release point",
    "விட்ட இடத்திற்கு நேராகக் கீழே"
  ],
  [
    "Yes, the wall exerts an equal opposite contact force",
    "ஆம்; சுவர் சமமான எதிர்த்திசைத் தொடர்பு விசை செலுத்தும்"
  ],
  [
    "4 m/s west",
    "மேற்குநோக்கி 4 m/s"
  ],
  [
    "Velocity changes direction, so acceleration is nonzero",
    "திசைவேகத்தின் திசை மாறுவதால் முடுக்கம் சுழியல்ல"
  ],
  [
    "+10 N s",
    "+10 N s"
  ],
  [
    "2 N",
    "2 N"
  ],
  [
    "Zero because the force is perpendicular to every instantaneous displacement",
    "ஒவ்வொரு கண இடப்பெயர்ச்சிக்கும் விசை செங்குத்தாக இருப்பதால் சுழி"
  ],
  [
    "1 N m clockwise",
    "வலஞ்சுழியாக 1 N m"
  ],
  [
    "Clockwise",
    "வலஞ்சுழியாக"
  ],
  [
    "Equal",
    "சமம்"
  ],
  [
    "Twice as large",
    "இருமடங்கு"
  ],
  [
    "0.4 m/s east",
    "கிழக்குநோக்கி 0.4 m/s"
  ],
  [
    "0 m/s (both trolleys stop)",
    "0 m/s (இரு வண்டிகளும் ஓய்வடையும்)"
  ],
  [
    "Both A and R are true, and R explains A",
    "கூற்றும் காரணமும் சரி; காரணம் விளக்குகிறது"
  ],
  [
    "From 2M: 2 m; from 8M: 4 m",
    "2M-இலிருந்து 2 m; 8M-இலிருந்து 4 m"
  ],
  [
    "B has twice A's surface gravity",
    "B-யில் A-வின் இருமடங்கு ஈர்ப்பு முடுக்கம்"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "g/3 downward",
    "கீழ்நோக்கி g/3"
  ],
  [
    "3 s",
    "3 s"
  ],
  [
    "10⁵ g cm/s",
    "10⁵ g cm/s"
  ],
  [
    "Tangential to the tyre at the detachment point",
    "பிரியும் புள்ளியில் சக்கரத்தின் தொடுகோட்டுத் திசையில்"
  ],
  [
    "12 N",
    "12 N"
  ],
  [
    "15 N",
    "15 N"
  ],
  [
    "2 m/s²",
    "2 m/s²"
  ],
  [
    "The forces are equal in magnitude, while the insect's acceleration is much larger",
    "விசைகளின் எண்மதிப்பு சமம்; பூச்சியின் முடுக்கம் மிகவும் அதிகம்"
  ],
  [
    "Both equal 3 N m",
    "இரண்டும் 3 N m"
  ],
  [
    "It stays unchanged",
    "மாறாமல் இருக்கும்"
  ],
  [
    "1.2 m",
    "1.2 m"
  ],
  [
    "1 : 3",
    "1 : 3"
  ],
  [
    "36 kg m/s",
    "36 kg m/s"
  ],
  [
    "Zero",
    "சுழி"
  ],
  [
    "4 m/s westward",
    "மேற்குநோக்கி 4 m/s"
  ],
  [
    "The first stops and the second moves at 6 m/s in the original direction",
    "முதலாவது ஓய்வடையும்; இரண்டாவது தொடக்கத் திசையில் 6 m/s வேகத்தில் செல்லும்"
  ],
  [
    "It remains unchanged",
    "மாறாமல் இருக்கும்"
  ],
  [
    "Two planetary radii above the surface",
    "மேற்பரப்பிலிருந்து இரு கோள் ஆரங்கள் உயரத்தில்"
  ],
  [
    "1 : 2",
    "1 : 2"
  ],
  [
    "20 m",
    "20 m"
  ],
  [
    "3 : 2",
    "3 : 2"
  ],
  [
    "1 : 2",
    "1 : 2"
  ],
  [
    "2.8 m/s",
    "2.8 m/s"
  ],
  [
    "Continue with uniform velocity in a straight line",
    "நேர்கோட்டில் மாறாத திசைவேகத்தில் தொடர்ந்து நகரும்"
  ],
  [
    "3√2 N",
    "3√2 N"
  ],
  [
    "24 m",
    "24 m"
  ],
  [
    "−4 N",
    "−4 N"
  ],
  [
    "Angular acceleration without acceleration of its centre of mass",
    "நிறைமையத்தில் இடப்பெயர்ச்சி முடுக்கமின்றி கோண முடுக்கம் ஏற்படலாம்"
  ],
  [
    "15 N m",
    "15 N m"
  ],
  [
    "40 revolutions per minute",
    "நிமிடத்திற்கு 40 சுற்றுகள்"
  ],
  [
    "They are perpendicular to each other",
    "அவை ஒன்றுக்கொன்று செங்குத்தாக இருக்கும்"
  ],
  [
    "5 N s",
    "5 N s"
  ],
  [
    "2√2 m/s",
    "2√2 m/s"
  ],
  [
    "Conservation of total momentum and total kinetic energy",
    "மொத்த உந்த அழிவின்மை மற்றும் மொத்த இயக்க ஆற்றல் அழிவின்மை"
  ],
  [
    "+3 m/s",
    "+3 m/s"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "It remains equal to the original force",
    "தொடக்க விசைக்குச் சமமாக இருக்கும்"
  ],
  [
    "√3 F",
    "√3 F"
  ],
  [
    "Three times Earth's",
    "பூமியின் மூன்று மடங்கு"
  ],
  [
    "1 : 2",
    "1 : 2"
  ],
  [
    "10%",
    "10%"
  ],
  [
    "The distances are in the ratio 1 : 3 : 5 : 7 for the first four seconds",
    "முதல் நான்கு வினாடிகளின் தனித்தனி தொலைவுகள் 1 : 3 : 5 : 7 விகிதத்தில் இருக்கும்"
  ],
  [
    "1 m/s westward",
    "மேற்குநோக்கி 1 m/s"
  ],
  [
    "2 s",
    "2 s"
  ],
  [
    "Inertia makes the hanging weight resist the bus's forward acceleration",
    "நிலைமத்தால் தொங்கும் எடை பேருந்தின் முன்னோக்கிய முடுக்க மாற்றத்தை எதிர்க்கிறது"
  ],
  [
    "8 N",
    "8 N"
  ],
  [
    "5 m/s²",
    "5 m/s²"
  ],
  [
    "20 N",
    "20 N"
  ],
  [
    "4√2 N m",
    "4√2 N m"
  ],
  [
    "It rotates at one-fourth the angular speed and delivers four times the torque",
    "அது நான்கில் ஒரு பங்கு கோண வேகத்தில் சுழன்று நான்கு மடங்கு திருப்புவிசையை அளிக்கும்"
  ],
  [
    "The stopping distance at 2v is four times that at v",
    "2v வேகத்துக்கான நிறுத்தத் தொலைவு v-க்கானதைவிட நான்கு மடங்கு"
  ],
  [
    "2 N s",
    "2 N s"
  ],
  [
    "5 m/s²",
    "5 m/s²"
  ],
  [
    "One-third",
    "மூன்றில் ஒரு பங்கு (1/3)"
  ],
  [
    "7.5 J",
    "7.5 J"
  ],
  [
    "The scale's upward contact force on the passenger",
    "பயணியின்மீது தராசு செலுத்தும் மேல்நோக்கிய தொடர்பு விசை"
  ],
  [
    "One-eighth",
    "எட்டில் ஒரு பங்கு (1/8)"
  ],
  [
    "9 : 1",
    "9 : 1"
  ],
  [
    "Escape speed is √2 times circular orbital speed",
    "விடுபடு வேகம் வட்டச் சுற்றுப்பாதை வேகத்தின் √2 மடங்கு"
  ],
  [
    "Twice Earth's escape speed",
    "பூமியின் விடுபடு வேகத்தின் இருமடங்கு"
  ],
  [
    "10 m/s²",
    "10 m/s²"
  ],
  [
    "360 N",
    "360 N"
  ],
  [
    "Greater air resistance can balance the same weight at a lower downward speed",
    "அதிக காற்றுத் தடை அதே எடையை குறைந்த கீழ்நோக்கிய வேகத்திலேயே சமப்படுத்தும்"
  ],
  [
    "It exerts a restraining force on the passenger whose body tends to keep moving forward due to inertia",
    "நிலைமத்தால் முன்னோக்கி நகரத் தொடரும் பயணியின் உடல்மீது கட்டுப்படுத்தும் விசையைச் செலுத்துகிறது"
  ],
  [
    "A is false, but R is true",
    "கூற்று தவறு; காரணம் சரி"
  ],
  [
    "30 N",
    "30 N"
  ],
  [
    "+5 m/s",
    "+5 m/s"
  ],
  [
    "22 N",
    "22 N"
  ],
  [
    "Zero resultant force",
    "தொகுபயன் விசை சுழி"
  ],
  [
    "55 N",
    "55 N"
  ],
  [
    "Clockwise",
    "வலஞ்சுழியாக"
  ],
  [
    "Four times",
    "நான்கு மடங்கு"
  ],
  [
    "The net positive force is increasing",
    "நேர்த்திசை நிகர விசை அதிகரித்து வருகிறது"
  ],
  [
    "1 : 2",
    "1 : 2"
  ],
  [
    "25 J",
    "25 J"
  ],
  [
    "A speed of 2√85/5 m/s (approximately 3.69 m/s)",
    "2√85/5 m/s (சுமார் 3.69 m/s) வேகம்"
  ],
  [
    "900 m/s",
    "900 m/s"
  ],
  [
    "Equal acceleration (B : A = 1 : 1)",
    "சமமான முடுக்கம் (B : A = 1 : 1)"
  ],
  [
    "Zero due to symmetry",
    "சமச்சீர்மை காரணமாகச் சுழி"
  ],
  [
    "9/16",
    "9/16"
  ],
  [
    "600 N",
    "600 N"
  ],
  [
    "It becomes 1/√2 of the original",
    "தொடக்க வேகத்தின் 1/√2 மடங்காகும்"
  ],
  [
    "8 : 1",
    "8 : 1"
  ]
]
SPEC=importlib.util.spec_from_file_location(
    "quality_audit",ROOT/"scripts/audit_textbook_quiz_quality.py")
AUDIT=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class LawsMotionEditorialQuizzes11To15(unittest.TestCase):
    def test_580_question_bank_preserved(self):
        self.assertEqual(BANK["meta"]["total_questions"],580)
        self.assertEqual(len(BANK["questions"]),580)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]),29)
        self.assertEqual(len(EXPECTED_KEYS),100)
        self.assertEqual(len({q["id"] for q in BANK["questions"]}),580)
        self.assertEqual(Counter(q["correct"] for q in BANK["questions"][200:300]),
                         Counter({0:25,1:25,2:25,3:25}))

    def test_question_keys_and_existing_quality_audit(self):
        window=BANK["questions"][200:300]
        seen=set()
        for n,(question,(en,ta)) in enumerate(zip(window,EXPECTED_KEYS),201):
            with self.subTest(question=n):
                self.assertEqual(question["id"],f"C10SCI-U01-Q{n:04d}")
                self.assertEqual(question["quiz"],((n-1)//20)+1)
                self.assertEqual(question["opts_en"][question["correct"]],en)
                self.assertEqual(question["opts_ta"][question["correct"]],ta)
                stem=AUDIT.normalize(question["q_en"])
                self.assertNotIn(stem,seen)
                seen.add(stem)
                for lang in ("en","ta"):
                    choices=question[f"opts_{lang}"]
                    explanation=question[f"exp_{lang}"]
                    self.assertEqual(len(choices),4)
                    self.assertTrue(AUDIT.distinct_options(choices,question["q_en"]))
                    self.assertIn(choices[question["correct"]],explanation)
                    self.assertGreaterEqual(
                        len(explanation.strip()),75 if lang=="en" else 50)
        result=AUDIT.audit(BANK["questions"],start=200,count=100)
        self.assertEqual(result["errors"],[],result["errors"])
        self.assertEqual(result["warnings"],[],result["warnings"])

if __name__=="__main__":
    unittest.main()
