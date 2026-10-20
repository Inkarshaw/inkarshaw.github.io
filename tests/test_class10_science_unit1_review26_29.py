#!/usr/bin/env python3
"""Complete Class 10 Science Unit 1 Laws of Motion bilingual editorial review.

All 580 SCERT-aligned MCQs are covered by six frozen-answer review windows.
This test checks the final 80 items and runs a full 580-question structural
audit. Native-speaker and textbook factual spot-checks are distinct tasks.
"""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BANK=json.loads((ROOT/"data/textbook/class-10/science/unit-1.json").read_text(encoding="utf-8"))
KEYS=[
  [
    "10 m/s toward the northeast",
    "வடகிழக்குநோக்கி 10 m/s"
  ],
  [
    "23 m",
    "23 m"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "2 m/s² uphill",
    "சாய்தளத்தின் வழியே மேல்நோக்கி 2 m/s²"
  ],
  [
    "Forward static friction exerted by the road on the foot",
    "பாதத்தின்மீது சாலை செலுத்தும் முன்னோக்கிய நிலை உராய்வு விசை"
  ],
  [
    "−2 m/s",
    "−2 m/s"
  ],
  [
    "5 N s",
    "5 N s"
  ],
  [
    "65 N",
    "65 N"
  ],
  [
    "20 rpm clockwise",
    "நிமிடத்திற்கு 20 சுற்றுகள், வலஞ்சுழி"
  ],
  [
    "It doubles",
    "இருமடங்காகும்"
  ],
  [
    "Momentum change: 4√2 kg m/s",
    "உந்த மாற்றம்: 4√2 kg m/s"
  ],
  [
    "12 m/s",
    "12 m/s"
  ],
  [
    "150/7 J (about 21.43 J)",
    "150/7 J (சுமார் 21.43 J)"
  ],
  [
    "3 m/s west and 4 m/s south, giving 5 m/s southwest",
    "மேற்குநோக்கி 3 m/s, தெற்குநோக்கி 4 m/s கூறுகளுடன் தென்மேற்கில் 5 m/s"
  ],
  [
    "Resultant pull: √5 F",
    "தொகுபயன் ஈர்ப்புவிசை: √5 F"
  ],
  [
    "Equal surface gravity and twice the escape speed",
    "மேற்பரப்பு ஈர்ப்பு முடுக்கம் சமம்; விடுபடு வேகம் இருமடங்கு"
  ],
  [
    "9",
    "9"
  ],
  [
    "Orbital speed doubles and orbital period halves",
    "சுற்றுப்பாதை வேகம் இருமடங்காகும்; சுற்றுக் காலம் பாதியாகும்"
  ],
  [
    "35 m",
    "35 m"
  ],
  [
    "350 N",
    "350 N"
  ],
  [
    "Both gain 24 kg m/s momentum; their speeds are 12 m/s and 4 m/s respectively",
    "இரண்டும் 24 kg m/s உந்தம் பெறும்; இறுதி வேகங்கள் முறையே 12 m/s மற்றும் 4 m/s"
  ],
  [
    "No; the 10 N downhill weight component exceeds the maximum static friction of 5√3 N",
    "முடியாது; கீழ்நோக்கிய 10 N எடைக் கூறு அதிகபட்ச நிலை உராய்வான 5√3 N-ஐவிட அதிகம்"
  ],
  [
    "4 m",
    "4 m"
  ],
  [
    "13 N",
    "13 N"
  ],
  [
    "Zero, because the instantaneous force is perpendicular to displacement",
    "சுழி; ஒவ்வொரு கணத்திலும் விசை இடப்பெயர்ச்சிக்குச் செங்குத்தாக உள்ளது"
  ],
  [
    "Upward force twice either force; zero moment about the centre",
    "ஒரு விசையின் இருமடங்கு மேல்நோக்கிய நிகர விசை; மையத்தைப் பற்றிய திருப்புத்திறன் சுழி"
  ],
  [
    "It remains 6 N m with the same sense of rotation",
    "சுழற்சித் திசை மாறாமல் 6 N m-ஆகவே இருக்கும்"
  ],
  [
    "The left end tends to lift; equilibrium would require a 10 N downward force at the left support",
    "இடது முனை மேலே தூக்கப்படும்; சமநிலைக்கு இடது தாங்கியில் 10 N கீழ்நோக்கிய பிடிப்பு விசை வேண்டும்"
  ],
  [
    "Motion outcome: Zero final velocity; 5 m rightward displacement",
    "இயக்க முடிவு: இறுதித் திசைவேகம் சுழி; வலப்புற இடப்பெயர்ச்சி 5 m"
  ],
  [
    "24 J",
    "24 J"
  ],
  [
    "Both reach the ground together",
    "இரு பந்துகளும் ஒரே நேரத்தில் தரையை அடையும்"
  ],
  [
    "From 4 m/s² to 5 m/s²",
    "4 m/s²-இலிருந்து 5 m/s²-ஆக"
  ],
  [
    "M⁻¹ L³ T⁻²",
    "M⁻¹ L³ T⁻²"
  ],
  [
    "The 3m object feels three times the gravitational force, but both accelerate at g",
    "3m பொருளின்மீது மூன்று மடங்கு ஈர்ப்பு விசை செயல்படும்; ஆனால் இரண்டும் g முடுக்கத்தைப் பெறும்"
  ],
  [
    "Surface gravity 3 : 1; mass 27 : 1",
    "மேற்பரப்பு ஈர்ப்பு முடுக்கம் 3 : 1; நிறை 27 : 1"
  ],
  [
    "The launched body's mass cancels when kinetic energy is equated to the required gravitational energy",
    "தேவையான ஈர்ப்பு ஆற்றலுடன் இயக்க ஆற்றலைச் சமப்படுத்தும்போது எறியப்படும் பொருளின் நிறை நீங்கிவிடுகிறது"
  ],
  [
    "Gravity still acts and provides centripetal acceleration; astronaut and spacecraft fall together",
    "ஈர்ப்பு விசை தொடர்ந்தும் செயல்பட்டு மையநோக்கு முடுக்கத்தை அளிக்கிறது; வீரரும் விண்கலமும் ஒன்றாகச் சுதந்திர வீழ்ச்சியில் உள்ளனர்"
  ],
  [
    "3g₀/5",
    "3g₀/5"
  ],
  [
    "The horizontally projected ball has the larger impact speed",
    "கிடைமட்டமாக எறியப்பட்ட பந்தின் தரைத் தாக்க வேகம் அதிகம்"
  ],
  [
    "The small object accelerates at F/m and the planet at F/M; their forces are equal",
    "சிறிய பொருளின் முடுக்கம் F/m; கோளின் முடுக்கம் F/M; இரண்டின் பரஸ்பர விசைகள் சமம்"
  ],
  [
    "4 m/s² to the left",
    "இடப்புறமாக 4 m/s²"
  ],
  [
    "3 kg and 9 N",
    "3 kg மற்றும் 9 N"
  ],
  [
    "3 m/s² and 14 N",
    "3 m/s² மற்றும் 14 N"
  ],
  [
    "3.2 m/s²",
    "3.2 m/s²"
  ],
  [
    "560 N",
    "560 N"
  ],
  [
    "1 : 3",
    "1 : 3"
  ],
  [
    "Turning moment: 60 N m clockwise",
    "திருப்புத்திறன்: வலஞ்சுழியாக 60 N m"
  ],
  [
    "45 N",
    "45 N"
  ],
  [
    "4 N first, then 0 N",
    "முதல் இடைவெளியில் 4 N; பின்னர் 0 N"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "9 kg m/s west",
    "மேற்குநோக்கி 9 kg m/s"
  ],
  [
    "12 kg m/s and 72 J",
    "12 kg m/s மற்றும் 72 J"
  ],
  [
    "Final speed zero; all initial kinetic energy becomes other forms",
    "இறுதி வேகம் சுழி; தொடக்க இயக்க ஆற்றல் அனைத்தும் பிற வடிவங்களாக மாறும்"
  ],
  [
    "It can accelerate without air because the exhaust acquires backward momentum",
    "வெளியேறும் வாயு பின்னோக்கிய உந்தம் பெறுவதால் காற்றில்லாமலும் ராக்கெட் முடுக்கமடைய முடியும்"
  ],
  [
    "1/4",
    "1/4"
  ],
  [
    "72 kg and 216 N",
    "72 kg மற்றும் 216 N"
  ],
  [
    "Half the speed and eight times the period",
    "வேகம் பாதி; சுற்றுக் காலம் எட்டு மடங்கு"
  ],
  [
    "The downward-thrown ball reaches first",
    "கீழ்நோக்கி எறியப்பட்ட பந்து முதலில் தரையை அடையும்"
  ],
  [
    "105 m",
    "105 m"
  ],
  [
    "Velocity downward and acceleration zero",
    "திசைவேகம் கீழ்நோக்கி; முடுக்கம் சுழி"
  ],
  [
    "4 m/s²",
    "4 m/s²"
  ],
  [
    "1/2",
    "1/2"
  ],
  [
    "The tyre pushes the road backward; the road exerts forward static friction on the tyre",
    "சக்கரம் சாலையைப் பின்னோக்கித் தள்ளுகிறது; சாலை சக்கரத்தின்மீது முன்னோக்கி நிலை உராய்வுவிசை செலுத்துகிறது"
  ],
  [
    "20 m/s²",
    "20 m/s²"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "1.4 m/s²",
    "1.4 m/s²"
  ],
  [
    "27.5 N",
    "27.5 N"
  ],
  [
    "Torque: Zero, regardless of the force magnitude",
    "திருப்புத்திறன்: விசையின் எண்மதிப்பு எதுவாக இருந்தாலும் சுழி"
  ],
  [
    "4 N",
    "4 N"
  ],
  [
    "10√3 kg m/s",
    "10√3 kg m/s"
  ],
  [
    "6 m/s",
    "6 m/s"
  ],
  [
    "The skater remains at rest because the balls' momenta cancel",
    "இரு பந்துகளின் உந்தங்கள் ஒன்றையொன்று நீக்குவதால் வீரர் ஓய்விலேயே இருப்பார்"
  ],
  [
    "200 N",
    "200 N"
  ],
  [
    "Gravitational field: GM/(2r²) to the left",
    "ஈர்ப்புப் புலம்: இடப்புறமாக GM/(2r²)"
  ],
  [
    "3000π s",
    "3000π s"
  ],
  [
    "Zero everywhere inside the shell",
    "கோள ஓட்டின் உட்புறம் எங்கும் சுழி"
  ],
  [
    "Both have the same orbital acceleration and period, but the heavier satellite experiences three times the gravitational force",
    "இரண்டிற்கும் ஒரே சுற்றுப்பாதை முடுக்கமும் காலமும் உண்டு; கனமான செயற்கைக்கோளின்மீது மூன்று மடங்கு ஈர்ப்புவிசை செயல்படும்"
  ],
  [
    "3 s; 20 m/s downward",
    "3 s; கீழ்நோக்கி 20 m/s"
  ],
  [
    "12 m",
    "12 m"
  ],
  [
    "Along the tangent to the circular path at that point",
    "அந்தப் புள்ளியில் வட்டப்பாதையின் தொடுகோட்டுத் திசையில்"
  ]
]
SPEC=importlib.util.spec_from_file_location(
    "audit_quality",ROOT/"scripts/audit_textbook_quiz_quality.py")
AUDIT=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class LawsMotionFinalQuizzes26To29Tests(unittest.TestCase):
    def test_complete_preserved_bank(self):
        questions=BANK["questions"]
        self.assertEqual(BANK["meta"]["total_questions"],580)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]),29)
        self.assertEqual(len(questions),580)
        self.assertEqual(len(KEYS),80)
        self.assertEqual(len({q["id"] for q in questions}),580)
        self.assertEqual(Counter(q["correct"] for q in questions),
                         Counter({0:145,1:145,2:145,3:145}))
        self.assertEqual([q["id"] for q in questions],
            [f"C10SCI-U01-Q{i:04d}" for i in range(1,581)])
        self.assertEqual([q["quiz"] for q in questions],
            [(i-1)//20+1 for i in range(1,581)])

    def test_last_80_frozen_bilingual_keys(self):
        window=BANK["questions"][500:580]
        seen=set()
        for n,(q,(en,ta)) in enumerate(zip(window,KEYS),501):
            with self.subTest(question=n):
                self.assertEqual(q["opts_en"][q["correct"]],en)
                self.assertEqual(q["opts_ta"][q["correct"]],ta)
                stem=AUDIT.normalize(q["q_en"])
                self.assertNotIn(stem,seen)
                seen.add(stem)
                for lang in ("en","ta"):
                    opts=q[f"opts_{lang}"]
                    exp=q[f"exp_{lang}"]
                    self.assertEqual(len(opts),4)
                    self.assertTrue(AUDIT.distinct_options(opts,q["q_en"]))
                    self.assertIn(opts[q["correct"]],exp)
                    self.assertGreaterEqual(len(exp.strip()),75 if lang=="en" else 50)
        result=AUDIT.audit(BANK["questions"],start=500,count=80)
        self.assertEqual(result["errors"],[],result["errors"])
        self.assertEqual(result["warnings"],[],result["warnings"])

    def test_entire_580_question_bank_quality(self):
        result=AUDIT.audit(BANK["questions"],start=0,count=580)
        self.assertEqual(result["errors"],[],result["errors"])
        self.assertEqual(result["warnings"],[],result["warnings"])

if __name__=="__main__":
    unittest.main()
