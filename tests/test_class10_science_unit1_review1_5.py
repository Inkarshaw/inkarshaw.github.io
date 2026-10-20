#!/usr/bin/env python3
"""Editorial regression: Class 10 Science Laws of Motion, Quizzes 1–5.

Verify that textbook-grounded bilingual answers, structural requirements and
explanations remain valid as subsequent quiz batches are revised. Passing the
automated audit is not the same as an independent Tamil editorial sign-off.
"""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data/textbook/class-10/science/unit-1.json"
BANK = json.loads(BANK_PATH.read_text(encoding="utf-8"))
EXPECTED_KEYS = [
  [
    "Kinematics",
    "இயக்கவிளக்கவியல்"
  ],
  [
    "They reach the ground at the same time",
    "அவை ஒரே நேரத்தில் தரையை அடையும்"
  ],
  [
    "The upper body tends to remain at rest due to inertia",
    "நிலைமத்தின் காரணமாக உடலின் மேல்பகுதி ஓய்வுநிலையிலேயே இருக்க முனைகிறது"
  ],
  [
    "Inertia of motion",
    "இயக்க நிலைமம்"
  ],
  [
    "Inertia of direction",
    "திசை நிலைமம்"
  ],
  [
    "The resultant external force on it is zero",
    "அதன் மீதான புறவிசைகளின் தொகுபயன் சுழியாக இருக்க வேண்டும்"
  ],
  [
    "6 kg m/s",
    "6 kg m/s"
  ],
  [
    "It is a vector in the direction of velocity",
    "இது திசைவேகத்தின் திசையில் அமையும் திசையளவு"
  ],
  [
    "5 N rightward",
    "வலப்புறம் 5 N"
  ],
  [
    "12 N toward the west",
    "மேற்குநோக்கி 12 N"
  ],
  [
    "A greater perpendicular distance produces more torque for the same force",
    "அதே விசைக்கு செங்குத்துத் தொலைவு அதிகமானால் திருப்புவிசையும் அதிகமாகும்"
  ],
  [
    "3 N m",
    "3 N m"
  ],
  [
    "Rotation without net translational force",
    "மொத்த இடப்பெயர்ச்சி விசையின்றிச் சுழற்சி ஏற்படுத்தும்"
  ],
  [
    "+2 N m",
    "+2 N m"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "8 N",
    "8 N"
  ],
  [
    "10⁵ dynes",
    "10⁵ டைன்"
  ],
  [
    "To increase stopping time and reduce average force",
    "பந்தை நிறுத்தும் நேரத்தை அதிகரித்து சராசரி விசையைக் குறைக்க"
  ],
  [
    "2 N s",
    "2 N s"
  ],
  [
    "On two different interacting bodies",
    "ஒன்றோடொன்று தொடர்புடைய இரண்டு வெவ்வேறு பொருட்களின்மீது"
  ],
  [
    "Total linear momentum of the system",
    "அமைப்பின் மொத்த நேர்கோட்டு உந்தம்"
  ],
  [
    "2 m/s",
    "2 m/s"
  ],
  [
    "2 m/s backward",
    "பின்னோக்கி 2 m/s"
  ],
  [
    "The expelled gases carry backward momentum, producing forward reaction thrust",
    "வெளியேறும் வாயுக்கள் பின்னோக்கிய உந்தத்தைக் கொண்டிருப்பதால் முன்னோக்கிய எதிர்வினை உந்துவிசை ஏற்படுகிறது"
  ],
  [
    "N m² kg⁻²",
    "N m² kg⁻²"
  ],
  [
    "One-fourth of the initial force",
    "தொடக்க விசையின் நான்கில் ஒரு பங்கு"
  ],
  [
    "Become three times its original value",
    "முன்னைய விசையின் மும்மடங்காகும்"
  ],
  [
    "One-ninth of the original force",
    "முந்தைய விசையின் ஒன்பதில் ஒரு பங்கு"
  ],
  [
    "The same",
    "சமமாக இருக்கும்"
  ],
  [
    "At the poles",
    "துருவங்களில்"
  ],
  [
    "It decreases in both cases",
    "இரண்டு நிலைகளிலும் குறைகிறது"
  ],
  [
    "0 m/s²",
    "0 m/s²"
  ],
  [
    "Its mass remains 4 kg",
    "அதன் நிறை 4 kg-ஆகவே இருக்கும்"
  ],
  [
    "49 N",
    "49 N"
  ],
  [
    "97.5 N",
    "97.5 N"
  ],
  [
    "Weight is a vector force directed toward Earth's centre",
    "எடை என்பது பூமியின் மையத்தை நோக்கிய திசையளவு விசை"
  ],
  [
    "600 N",
    "600 N"
  ],
  [
    "280 N",
    "280 N"
  ],
  [
    "Both are equal because acceleration is zero",
    "முடுக்கம் சுழியாக இருப்பதால் இரண்டும் சமம்"
  ],
  [
    "Astronauts and the station are in free fall together, so the supporting force is nearly zero",
    "வீரர்களும் நிலையமும் ஒன்றாகச் சுதந்திர வீழ்ச்சியில் இருப்பதால் தாங்கும் விசை ஏறத்தாழ சுழியாகிறது"
  ],
  [
    "Statics",
    "நிலையியல்"
  ],
  [
    "The coin tends to remain at rest because of inertia, then gravity pulls it down",
    "நிலைமத்தால் நாணயம் ஓய்வில் தொடர முனைந்து, பின்னர் ஈர்ப்பு விசையால் கீழே விழுகிறது"
  ],
  [
    "5 : 2",
    "5 : 2"
  ],
  [
    "20 N in the same direction",
    "அதே திசையில் 20 N"
  ],
  [
    "It is directed toward the centre because velocity direction changes",
    "திசைவேகத்தின் திசை மாறுவதால் முடுக்கம் மையத்தை நோக்கி அமைகிறது"
  ],
  [
    "Zero, because the perpendicular distance to the force's line of action is zero",
    "விசையின் செயல்கோட்டிலிருந்து செங்குத்துத் தொலைவு சுழியாக இருப்பதால் திருப்புவிசையும் சுழி"
  ],
  [
    "10 N m",
    "10 N m"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "Its net external force is zero despite its nonzero velocity",
    "திசைவேகம் சுழியல்லாதபோதும் அதன் நிகரப் புறவிசை சுழியாகும்"
  ],
  [
    "−28 kg m/s",
    "−28 kg m/s"
  ],
  [
    "1600 N",
    "1600 N"
  ],
  [
    "5 m/s² eastward",
    "கிழக்குநோக்கி 5 m/s²"
  ],
  [
    "100 N",
    "100 N"
  ],
  [
    "Both produce the same impulse of 6 N s",
    "இரண்டும் தலா 6 N s கணத்தாக்கை ஏற்படுத்தும்"
  ],
  [
    "The forward reaction force exerted by the water on the swimmer",
    "நீச்சல்காரரின் மீது நீர் செலுத்தும் முன்னோக்கிய எதிர்வினை விசை"
  ],
  [
    "The stone attracts Earth with an equal-magnitude opposite force",
    "கல்லும் பூமியைச் சம எண்மதிப்புடைய எதிர்திசை விசையால் ஈர்க்கிறது"
  ],
  [
    "Remains unchanged because gravitational force does not depend on the medium",
    "ஈர்ப்பு விசை ஊடகத்தைச் சாராததால் மாறாது"
  ],
  [
    "It remains the same",
    "மாறாமல் இருக்கும்"
  ],
  [
    "One-fourth of g₀",
    "g₀ இன் நான்கில் ஒரு பங்கு"
  ],
  [
    "Zero, because the normal reaction is zero during common free fall",
    "ஒன்றாகச் சுதந்திரமாக விழும்போது செங்குத்து எதிர்வினை விசை சுழியாக இருப்பதால் அளவீடும் சுழி"
  ],
  [
    "Violent motion",
    "கட்டாய இயக்கம் (Violent motion)"
  ],
  [
    "The 8 kg object",
    "8 kg நிறையுள்ள பொருள்"
  ],
  [
    "The run-up provides forward momentum that helps carry the athlete farther during the jump",
    "தொடக்க ஓட்டம் முன்னோக்கிய உந்தத்தை அளிப்பதால் தாவும்போது அதிகத் தொலைவு செல்ல உதவுகிறது"
  ],
  [
    "They produce zero resultant force and no net turning moment as a pair",
    "அவை சுழியத் தொகுபயன் விசையையும், இணையாகக் கருதும்போது சுழிய நிகரத் திருப்புத்திறனையும் ஏற்படுத்துகின்றன"
  ],
  [
    "To transmit power while changing rotational speed and torque",
    "சுழற்சி வேகத்தையும் திருப்புவிசையையும் மாற்றி ஆற்றலைக் கடத்துதல்"
  ],
  [
    "1.0 m",
    "1.0 m"
  ],
  [
    "dyne cm",
    "டைன் செ.மீ (dyne cm)"
  ],
  [
    "6 N m",
    "6 N m"
  ],
  [
    "3 m/s",
    "3 m/s"
  ],
  [
    "4 N",
    "4 N"
  ],
  [
    "1 kgf = 9.8 N approximately",
    "1 kgf ≈ 9.8 N"
  ],
  [
    "980 dynes",
    "980 டைன்"
  ],
  [
    "They extend the time over which the momentum changes",
    "உந்தம் மாறும் நேர இடைவெளியை அதிகரிக்கின்றன"
  ],
  [
    "The upward reaction force exerted by air on the bird",
    "காற்று பறவையின்மீது செலுத்தும் மேல்நோக்கிய எதிர்வினை விசை"
  ],
  [
    "0.5 m/s eastward",
    "கிழக்குநோக்கி 0.5 m/s"
  ],
  [
    "The minimum launch speed needed to escape Earth's gravitational attraction without further propulsion or resistance",
    "மேலும் உந்துவிசையோ தடையோ இல்லாமல் பூமியின் ஈர்ப்புப் பிடியிலிருந்து தப்பிச் செல்லத் தேவையான குறைந்தபட்ச தொடக்க வேகம்"
  ],
  [
    "6.674 × 10⁻¹¹ N m² kg⁻²",
    "6.674 × 10⁻¹¹ N m² kg⁻²"
  ],
  [
    "N/kg",
    "N/kg"
  ],
  [
    "It is greater, because the acceleration is upward",
    "முடுக்கம் மேல்நோக்கி இருப்பதால் தோற்ற எடை அதிகமாக இருக்கும்"
  ],
  [
    "Positive geotropism",
    "நேர்மறைப் புவிநாட்டம்"
  ],
  [
    "10 N",
    "10 N"
  ],
  [
    "3 m/s² in the direction of the push",
    "தள்ளும் திசையில் 3 m/s²"
  ],
  [
    "8 m/s",
    "8 m/s"
  ],
  [
    "4 N s",
    "4 N s"
  ],
  [
    "4 : 1",
    "4 : 1"
  ],
  [
    "5√3 N m (approximately 8.66 N m)",
    "5√3 N m (சுமார் 8.66 N m)"
  ],
  [
    "It remains unchanged",
    "மாறாமல் இருக்கும்"
  ],
  [
    "3 revolutions",
    "3 சுற்றுகள்"
  ],
  [
    "2 N m clockwise",
    "வலஞ்சுழியாக 2 N m"
  ],
  [
    "It becomes four times",
    "நான்கு மடங்காகும்"
  ],
  [
    "Forward static friction on the foot",
    "காலின்மீது செயல்படும் முன்னோக்கிய நிலை உராய்வு விசை"
  ],
  [
    "The ground exerts a net forward external friction force on the horse–cart system",
    "தரை குதிரை–வண்டி அமைப்பின்மீது நிகர முன்னோக்கிய புற உராய்வு விசையைச் செலுத்துகிறது"
  ],
  [
    "One-half",
    "பாதி (1/2)"
  ],
  [
    "4 m/s westward",
    "மேற்குநோக்கி 4 m/s"
  ],
  [
    "It is independent of the object's mass",
    "அப்பொருளின் நிறையைச் சாராது"
  ],
  [
    "2 : 1",
    "2 : 1"
  ],
  [
    "Three times",
    "மூன்று மடங்கு"
  ],
  [
    "2.45 times (≈√6)",
    "2.45 மடங்கு (≈√6)"
  ],
  [
    "2 m/s² downward",
    "கீழ்நோக்கி 2 m/s²"
  ],
  [
    "They are equal in magnitude, giving zero net force",
    "இரு விசைகளின் எண்மதிப்புகளும் சமம்; நிகர விசை சுழியாகும்"
  ]
]

SPEC = importlib.util.spec_from_file_location(
    "textbook_quality", ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10ScienceLawsMotionReviewTests(unittest.TestCase):
    def test_preserved_full_bank_and_100_reviewed_keys(self):
        questions = BANK["questions"]
        self.assertEqual(BANK["meta"]["total_questions"], 580)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]), 29)
        self.assertEqual(len(questions), 580)
        self.assertEqual(len(EXPECTED_KEYS), 100)
        self.assertEqual([q["id"] for q in questions[:100]],
            [f"C10SCI-U01-Q{i:04d}" for i in range(1, 101)])
        self.assertEqual(Counter(q["correct"] for q in questions[:100]),
                         Counter({0:25, 1:25, 2:25, 3:25}))
        self.assertEqual([q["quiz"] for q in questions[:100]],
                         [(i // 20) + 1 for i in range(100)])
        self.assertEqual(len({q["id"] for q in questions}), 580)

    def test_no_textbook_meta_stems_anywhere_in_laws_of_motion(self):
        for q in BANK["questions"]:
            with self.subTest(q=q["id"]):
                self.assertNotRegex(q["q_en"],
                    re.compile(r"\b(?:textbook|class 10 laws of motion lesson)\b",
                               re.I))
                self.assertNotRegex(q["q_ta"], re.compile(r"பாடநூலின்படி|பாடநூலில்"))

    def test_reviewed_answers_explanations_and_structural_validator(self):
        window = BANK["questions"][:100]
        normalized_stems = set()
        for i, (q, (answer_en, answer_ta)) in enumerate(zip(window, EXPECTED_KEYS), 1):
            with self.subTest(q=q["id"]):
                self.assertEqual(q["id"], f"C10SCI-U01-Q{i:04d}")
                self.assertEqual(q["opts_en"][q["correct"]], answer_en)
                self.assertEqual(q["opts_ta"][q["correct"]], answer_ta)
                stem = AUDIT.normalize(q["q_en"])
                self.assertNotIn(stem, normalized_stems)
                normalized_stems.add(stem)
                for lang in ("en", "ta"):
                    opts = q[f"opts_{lang}"]
                    self.assertEqual(len(opts), 4)
                    self.assertTrue(AUDIT.distinct_options(opts, q["q_en"]))
                    self.assertIn(opts[q["correct"]], q[f"exp_{lang}"])
                    self.assertGreaterEqual(len(q[f"exp_{lang}"].strip()),
                                            75 if lang == "en" else 50)
        audited = AUDIT.audit(BANK["questions"], start=0, count=100)
        self.assertEqual(audited["errors"], [], audited["errors"])
        self.assertEqual(audited["warnings"], [], audited["warnings"])

if __name__ == "__main__":
    unittest.main()
