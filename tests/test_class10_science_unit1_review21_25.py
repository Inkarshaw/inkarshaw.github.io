#!/usr/bin/env python3
"""Class 10 Laws of Motion review: Quizzes 21–25 / MCQs 401–500."""
import importlib.util
import json
import unittest
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
BANK=json.loads((ROOT/"data/textbook/class-10/science/unit-1.json").read_text(encoding="utf-8"))
KEYS=[
  [
    "Friction: 20 N up the inclined plane",
    "உராய்வு விசை: சாய்தளத்தின் வழியே மேல்நோக்கி 20 N"
  ],
  [
    "24 N",
    "24 N"
  ],
  [
    "Behind the point directly below the release position",
    "விட்ட இடத்துக்கு நேர்கீழே உள்ள புள்ளியை விடப் பின்னால்"
  ],
  [
    "+19.5 m",
    "+19.5 m"
  ],
  [
    "7200 N",
    "7200 N"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "Moment: Zero",
    "திருப்புத்திறன்: சுழி"
  ],
  [
    "3 clockwise revolutions",
    "வலஞ்சுழியாக 3 சுற்றுகள்"
  ],
  [
    "10√2 kg m/s",
    "10√2 kg m/s"
  ],
  [
    "1.5 m/s²",
    "1.5 m/s²"
  ],
  [
    "3 : 1",
    "3 : 1"
  ],
  [
    "10/3 m/s",
    "10/3 m/s"
  ],
  [
    "Impulse: Zero",
    "கணத்தாக்கு: சுழி"
  ],
  [
    "Zero, because fields of diagonally opposite masses cancel",
    "சுழி; மூலைவிட்டத்தில் எதிரெதிரான நிறைகளின் ஈர்ப்புப்புலங்கள் நீங்குகின்றன"
  ],
  [
    "Gravity: 4g₀/25",
    "ஈர்ப்பு முடுக்கம்: 4g₀/25"
  ],
  [
    "Three times the original",
    "தொடக்க மதிப்பின் மூன்று மடங்கு"
  ],
  [
    "Energy: mgR, where R is the planet's radius",
    "ஆற்றல்: mgR; இங்கு R கோளின் ஆரம்"
  ],
  [
    "2 s",
    "2 s"
  ],
  [
    "25 N",
    "25 N"
  ],
  [
    "No; internal forces cannot accelerate the system's centre of mass without a net external force",
    "முடியாது; நிகரப் புறவிசையின்றி உள்விசைகள் அமைப்பின் நிறைமையத்தை முடுக்கமடையச் செய்ய முடியாது"
  ],
  [
    "It becomes 9/2 times the original",
    "தொடக்க விசையின் 9/2 மடங்காகும்"
  ],
  [
    "8 N upward along the plane",
    "சாய்தளத்தின் வழியே மேல்நோக்கி 8 N"
  ],
  [
    "37.5 N",
    "37.5 N"
  ],
  [
    "11 N",
    "11 N"
  ],
  [
    "6.5 m/s², about 22.6° north of east",
    "6.5 m/s²; கிழக்கிலிருந்து வடக்குநோக்கி சுமார் 22.6°"
  ],
  [
    "Acceleration: g/4 downward",
    "முடுக்கம்: கீழ்நோக்கி g/4"
  ],
  [
    "60 N",
    "60 N"
  ],
  [
    "20 N m",
    "20 N m"
  ],
  [
    "30 rpm in the opposite direction, with three times the torque",
    "எதிர்த்திசையில் நிமிடத்திற்கு 30 சுற்றுகள்; மூன்று மடங்குத் திருப்புவிசை"
  ],
  [
    "Both A and R are true, and R correctly explains A",
    "கூற்றும் காரணமும் சரி; காரணம் கூற்றைச் சரியாக விளக்குகிறது"
  ],
  [
    "5 m/s",
    "5 m/s"
  ],
  [
    "21 m",
    "21 m"
  ],
  [
    "60 J",
    "60 J"
  ],
  [
    "Collision: 1 kg cart: 2 m/s left; 2 kg cart: 4 m/s right",
    "மோதல்: 1 kg வண்டி: இடப்புறம் 2 m/s; 2 kg வண்டி: வலப்புறம் 4 m/s"
  ],
  [
    "It can increase as the spring's stored potential energy becomes kinetic energy",
    "சுருள்விலில் சேமிக்கப்பட்ட நிலை ஆற்றல் இயக்க ஆற்றலாக மாறுவதால் மொத்த இயக்க ஆற்றல் அதிகரிக்கலாம்"
  ],
  [
    "2000 N upward",
    "மேல்நோக்கி 2000 N"
  ],
  [
    "Balance point: From 9M: 6 m; from M: 2 m",
    "சமநிலைப் புள்ளி: 9M-இலிருந்து 6 m; M-இலிருந்து 2 m"
  ],
  [
    "Gravity: 4gE/9",
    "ஈர்ப்பு முடுக்கம்: 4gE/9"
  ],
  [
    "6×10²⁴ kg",
    "6×10²⁴ kg"
  ],
  [
    "√2 times Planet A's escape speed",
    "A கோளின் விடுபடு வேகத்தின் √2 மடங்கு"
  ],
  [
    "Friction: 7 N opposite the pull",
    "உராய்வு விசை: இழுவிசைக்கு எதிராக 7 N"
  ],
  [
    "Toward the left side of the turning bus",
    "திரும்பும் பேருந்தின் இடப்புறமாக"
  ],
  [
    "3 m east",
    "கிழக்குநோக்கி 3 m"
  ],
  [
    "2 m/s² and 48 N",
    "2 m/s² மற்றும் 48 N"
  ],
  [
    "6.4 m/s²",
    "6.4 m/s²"
  ],
  [
    "It becomes 5 N m, half the original moment",
    "5 N m ஆகும்; தொடக்கத் திருப்புத்திறனின் பாதி"
  ],
  [
    "Linear acceleration without torque about the centre of mass",
    "நிறைமையத்தைப் பற்றிய திருப்புவிசையின்றி நேர்கோட்டு முடுக்கம்"
  ],
  [
    "55 N",
    "55 N"
  ],
  [
    "Impulse: Zero",
    "கணத்தாக்கு: சுழி"
  ],
  [
    "Their momentum gains are equal, but B gains more kinetic energy",
    "உந்த அதிகரிப்பு இரண்டுக்கும் சமம்; ஆனால் B-யின் இயக்க ஆற்றல் அதிகமாக அதிகரிக்கும்"
  ],
  [
    "6 m/s in the first cart's original direction",
    "முதல் வண்டியின் தொடக்கத் திசையில் 6 m/s"
  ],
  [
    "6 m/s west and 8 m/s south, giving 10 m/s southwest",
    "மேற்குநோக்கி 6 m/s, தெற்குநோக்கி 8 m/s கூறுகளுடன் தென்மேற்கில் 10 m/s"
  ],
  [
    "One-half",
    "பாதி (1/2)"
  ],
  [
    "Magnitude F, directed toward the satellite",
    "F எண்மதிப்பில் செயற்கைக்கோளை நோக்கி"
  ],
  [
    "Toward 4M, with magnitude 3GM/25",
    "4M-ஐ நோக்கி; எண்மதிப்பு 3GM/25"
  ],
  [
    "Surface gravity is one-quarter Earth's; escape speed equals Earth's",
    "மேற்பரப்பு ஈர்ப்பு முடுக்கம் பூமியின் நான்கில் ஒரு பங்கு; விடுபடு வேகம் பூமியுடன் சமம்"
  ],
  [
    "One planetary radius above the surface",
    "மேற்பரப்புக்கு மேலே ஒரு கோள் ஆரம்"
  ],
  [
    "Horizontal velocity remains nonzero; acceleration is vertically downward at g",
    "கிடைமட்டத் திசைவேகம் சுழியல்ல; முடுக்கம் செங்குத்தாக கீழ்நோக்கி g"
  ],
  [
    "It exceeds mg because the lift's acceleration is upward",
    "மின்தூக்கியின் முடுக்கம் மேல்நோக்கி இருப்பதால் வாசிப்பு mg-ஐவிட அதிகம்"
  ],
  [
    "The parachutist is moving downward but accelerating upward, so the downward speed decreases",
    "கீழ்நோக்கி நகர்ந்தாலும் மேல்நோக்கி முடுக்கமடைவதால் கீழ்நோக்கிய வேகம் குறைகிறது"
  ],
  [
    "The 12 kg object has four times the inertia of the 3 kg object",
    "12 kg பொருளின் நிலைமம் 3 kg பொருளைவிட நான்கு மடங்கு"
  ],
  [
    "Resistance: 18 N westward",
    "எதிர்ப்பு விசை: மேற்குநோக்கி 18 N"
  ],
  [
    "2 m/s west; 15 m east",
    "மேற்குநோக்கி 2 m/s; கிழக்குநோக்கி 15 m இடப்பெயர்ச்சி"
  ],
  [
    "Time: 1 s",
    "நேரம்: 1 s"
  ],
  [
    "5 m/s²; 30 N",
    "5 m/s²; 30 N"
  ],
  [
    "3 m/s²",
    "3 m/s²"
  ],
  [
    "35 N m anticlockwise",
    "இடஞ்சுழியாக 35 N m"
  ],
  [
    "45 N upward at each support",
    "ஒவ்வொரு தாங்கியிலும் மேல்நோக்கி 45 N"
  ],
  [
    "It doubles",
    "இருமடங்காகும்"
  ],
  [
    "4 N",
    "4 N"
  ],
  [
    "10 kg m/s",
    "10 kg m/s"
  ],
  [
    "Impulse: Zero",
    "கணத்தாக்கு: சுழி"
  ],
  [
    "Collision: 1 kg cart: 4 m/s left; 3 kg cart: 4 m/s right",
    "மோதல்: 1 kg வண்டி: இடப்புறம் 4 m/s; 3 kg வண்டி: வலப்புறம் 4 m/s"
  ],
  [
    "12 J",
    "12 J"
  ],
  [
    "3 m/s² forward",
    "முன்னோக்கி 3 m/s²"
  ],
  [
    "Same surface gravity; √3 times the escape speed",
    "மேற்பரப்பு ஈர்ப்பு முடுக்கம் சமம்; விடுபடு வேகம் √3 மடங்கு"
  ],
  [
    "1/16",
    "1/16"
  ],
  [
    "5 m/s downward; 10 m above launch",
    "கீழ்நோக்கி 5 m/s; எறிந்த இடத்துக்கு மேலே 10 m"
  ],
  [
    "Acceleration: 8 m/s² downward",
    "முடுக்கம்: கீழ்நோக்கி 8 m/s²"
  ],
  [
    "It increases from mg to m(g+a) during the slowing phase",
    "மெதுவாகும் நிலையில் mg-இலிருந்து m(g+a)-ஆக அதிகரிக்கும்"
  ],
  [
    "The passenger's body tends to retain its original forward velocity by inertia",
    "நிலைமத்தால் பயணியின் உடல் தனது தொடக்க முன்னோக்கிய திசைவேகத்தைத் தக்கவைக்க முயல்கிறது"
  ],
  [
    "Speed: √34 m/s (about 5.83 m/s)",
    "வேகம்: √34 m/s (சுமார் 5.83 m/s)"
  ],
  [
    "12 N",
    "12 N"
  ],
  [
    "Time: 1 s",
    "நேரம்: 1 s"
  ],
  [
    "They act on different bodies: one on the wall and the other on the person",
    "அவை வெவ்வேறு பொருட்களின்மீது செயல்படுகின்றன: ஒன்று சுவரிலும் மற்றொன்று நபரிலும்"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "Net force and moment: Zero net force and zero couple moment",
    "நிகர விசை மற்றும் திருப்புத்திறன்: நிகர விசை சுழி; இரட்டை விசைத் திருப்புத்திறனும் சுழி"
  ],
  [
    "30 rpm clockwise",
    "நிமிடத்திற்கு 30 சுற்றுகள்; வலஞ்சுழி"
  ],
  [
    "4 N",
    "4 N"
  ],
  [
    "1 m/s eastward",
    "கிழக்குநோக்கி 1 m/s"
  ],
  [
    "100 N westward",
    "மேற்குநோக்கி 100 N"
  ],
  [
    "15 J",
    "15 J"
  ],
  [
    "Momentum is a vector and cancels, while the two positive kinetic energies add",
    "உந்தம் திசையளவு என்பதால் எதிர்த்திசைக் கூறுகள் நீங்கும்; இரு நேர்ம இயக்க ஆற்றல்களும் கூடும்"
  ],
  [
    "16 : 27",
    "16 : 27"
  ],
  [
    "The polar radius is smaller, and Earth's rotation reduces effective gravity most at the equator",
    "துருவ ஆரம் குறைவாக உள்ளது; பூமியின் சுழற்சி நடுக்கோட்டில் செயல்திறன் ஈர்ப்பை அதிகமாகக் குறைக்கிறது"
  ],
  [
    "G is the same at both places, whereas local g is different",
    "இரு இடங்களிலும் G சமம்; ஆனால் உள்ளூர் g வேறுபடும்"
  ],
  [
    "Four times",
    "நான்கு மடங்கு"
  ],
  [
    "Equal surface gravity; escape speed 1/√2 times A's",
    "மேற்பரப்பு ஈர்ப்பு முடுக்கம் சமம்; விடுபடு வேகம் A-வின் 1/√2 மடங்கு"
  ],
  [
    "The beam balance shows the same mass, but the spring balance measures one-sixth the weight",
    "இரு தட்டுத் தராசு அதே நிறையைக் காட்டும்; சுருள் தராசு ஆறில் ஒரு பங்கு எடையை அளக்கும்"
  ],
  [
    "8/3 s (about 2.67 s)",
    "8/3 s (சுமார் 2.67 s)"
  ]
]
SPEC=importlib.util.spec_from_file_location("qa",ROOT/"scripts/audit_textbook_quiz_quality.py")
QA=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(QA)
class LawsMotionQuizzes21To25(unittest.TestCase):
    def test_full_bank_unchanged(self):
        self.assertEqual(len(BANK["questions"]),580)
        self.assertEqual(BANK["meta"]["total_questions"],580)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]),29)
        self.assertEqual(len(KEYS),100)
        self.assertEqual(Counter(q["correct"] for q in BANK["questions"][400:500]),
                         Counter({0:25,1:25,2:25,3:25}))
    def test_100_frozen_bilingual_keys_and_audit(self):
        seen=set()
        for num,(q,(en,ta)) in enumerate(zip(BANK["questions"][400:500],KEYS),401):
            with self.subTest(question=num):
                self.assertEqual(q["id"],f"C10SCI-U01-Q{num:04d}")
                self.assertEqual(q["quiz"],(num-1)//20+1)
                self.assertEqual(q["opts_en"][q["correct"]],en)
                self.assertEqual(q["opts_ta"][q["correct"]],ta)
                stem=QA.normalize(q["q_en"])
                self.assertNotIn(stem,seen)
                seen.add(stem)
                for lang in ("en","ta"):
                    opts=q[f"opts_{lang}"]
                    exp=q[f"exp_{lang}"]
                    self.assertEqual(len(opts),4)
                    self.assertTrue(QA.distinct_options(opts,q["q_en"]))
                    self.assertIn(opts[q["correct"]],exp)
                    self.assertGreaterEqual(len(exp.strip()),75 if lang=="en" else 50)
        result=QA.audit(BANK["questions"],start=400,count=100)
        self.assertEqual(result["errors"],[],result["errors"])
        self.assertEqual(result["warnings"],[],result["warnings"])
if __name__=="__main__":
    unittest.main()
