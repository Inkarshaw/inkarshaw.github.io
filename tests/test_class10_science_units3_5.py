#!/usr/bin/env python3
"""Class 10 Science Units 3–5: exact English/Tamil answers, structure, index.
Sources: TN Class 10 Science (2019) pp. 32–73 English and Tamil editions.
Automated structure and keyed-answer checks do not replace human fact review.
"""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "data/textbook/class-10/science"
INDEX = json.loads((DIR / "index.json").read_text(encoding="utf-8"))
EXPECTED = {
  "3": [
    [
      "Kelvin (K)",
      "கெல்வின் (K)"
    ],
    [
      "Thermal equilibrium",
      "வெப்பச் சமநிலை"
    ],
    [
      "From the hotter block to the colder block",
      "சூடான துண்டிலிருந்து குளிரான துண்டுக்கு"
    ],
    [
      "Joule (J)",
      "ஜூல் (J)"
    ],
    [
      "300 K",
      "300 K"
    ],
    [
      "10 K",
      "10 K"
    ],
    [
      "Linear expansion",
      "நீள் விரிவு"
    ],
    [
      "Coefficient of superficial expansion",
      "பரப்பு விரிவுக் குணகம்"
    ],
    [
      "K⁻¹",
      "K⁻¹"
    ],
    [
      "Gas",
      "வாயு"
    ],
    [
      "The container also expands on heating",
      "கொள்கலனும் சூட்டால் விரிவடைகிறது"
    ],
    [
      "It doubles",
      "இருமடங்காகும்"
    ],
    [
      "Boyle's law",
      "பாயில் விதி"
    ],
    [
      "It doubles",
      "இருமடங்காகும்"
    ],
    [
      "Avogadro's law",
      "அவகேட்ரோ விதி"
    ],
    [
      "PV = nRT",
      "PV = nRT"
    ],
    [
      "8.31 J mol⁻¹ K⁻¹",
      "8.31 J mol⁻¹ K⁻¹"
    ],
    [
      "Low pressure and high temperature",
      "குறைந்த அழுத்தமும் அதிக வெப்பநிலையும்"
    ],
    [
      "Gas pressure",
      "வாயு அழுத்தம்"
    ],
    [
      "−273°C",
      "−273°C"
    ]
  ],
  "4": [
    [
      "3 A",
      "3 A"
    ],
    [
      "Ammeter",
      "அம்மீட்டர்"
    ],
    [
      "A broken conducting path",
      "கடத்தும் பாதை துண்டிக்கப்படுதல்"
    ],
    [
      "Positive to negative terminal",
      "நேர் முனையிலிருந்து எதிர் முனைக்கு"
    ],
    [
      "5 V",
      "5 V"
    ],
    [
      "Voltmeter",
      "வோல்ட்மீட்டர்"
    ],
    [
      "V = IR",
      "V = IR"
    ],
    [
      "12 V",
      "12 V"
    ],
    [
      "It doubles",
      "இருமடங்காகும்"
    ],
    [
      "It becomes half",
      "பாதியாகும்"
    ],
    [
      "10 Ω",
      "10 Ω"
    ],
    [
      "3 Ω",
      "3 Ω"
    ],
    [
      "Electric current",
      "மின்னோட்டம்"
    ],
    [
      "Potential difference",
      "மின்னழுத்த வேறுபாடு"
    ],
    [
      "H = I²Rt",
      "H = I²Rt"
    ],
    [
      "Four times",
      "நான்கு மடங்கு"
    ],
    [
      "60 W",
      "60 W"
    ],
    [
      "Electrical energy consumed",
      "பயன்படுத்திய மின்னாற்றல்"
    ],
    [
      "It melts and opens the circuit",
      "அது உருகி மின்சுற்றைத் துண்டிக்கிறது"
    ],
    [
      "To provide a low-resistance path for leakage current",
      "கசிவு மின்னோட்டத்துக்கு குறைந்த மின்தடைப் பாதை வழங்க"
    ]
  ],
  "5": [
    [
      "Vibration of its prongs",
      "இசைக்கவைக் கிளைகளின் அதிர்வு"
    ],
    [
      "It needs a material medium",
      "அதற்குப் பொருள் ஊடகம் தேவை"
    ],
    [
      "Parallel to wave propagation",
      "அலை பரவும் திசைக்கு இணையாக"
    ],
    [
      "Compression",
      "இறுக்கம்"
    ],
    [
      "v = fλ",
      "v = fλ"
    ],
    [
      "2 m",
      "2 m"
    ],
    [
      "Frequency",
      "அதிர்வெண்"
    ],
    [
      "Steel",
      "எஃகு"
    ],
    [
      "It increases",
      "அதிகரிக்கும்"
    ],
    [
      "It increases",
      "அதிகரிக்கும்"
    ],
    [
      "Reflection of sound",
      "ஒலி எதிரொளிப்பு"
    ],
    [
      "They are equal",
      "அவை சமம்"
    ],
    [
      "0.1 s",
      "0.1 s"
    ],
    [
      "17.2 m",
      "17.2 m"
    ],
    [
      "340 m/s",
      "340 m/s"
    ],
    [
      "To distribute reflected sound to more seats",
      "எதிரொளித்த ஒலியை அதிக இருக்கைகளுக்குப் பரப்ப"
    ],
    [
      "Doppler effect",
      "டாப்ளர் விளைவு"
    ],
    [
      "It decreases",
      "குறையும்"
    ],
    [
      "Relative motion along their separation",
      "இருவரிடையே பிரிவுத் திசையில் சார்பு இயக்கம்"
    ],
    [
      "1120 m",
      "1120 m"
    ]
  ]
}
SPEC = importlib.util.spec_from_file_location(
    "audit_textbook_quiz_quality",
    ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10PhysicsUnitsThreeToFiveTests(unittest.TestCase):
    def test_catalogue(self):
        self.assertEqual(INDEX["meta"]["unit_count"], 21)
        self.assertEqual(INDEX["meta"]["total_questions"], 1000)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 50)
        self.assertEqual([u["id"] for u in INDEX["units"][:5]], [1, 2, 3, 4, 5])
        self.assertEqual([u["total"] for u in INDEX["units"][:5]], [580, 40, 20, 20, 20])
        for unit in INDEX["units"][2:5]:
            self.assertTrue(unit["ready"])
            self.assertEqual(unit["quiz_count"], 1)

    def test_bilingual_maths_and_answers(self):
        for unit_number in (3, 4, 5):
            with self.subTest(unit=unit_number):
                d = json.loads((DIR / f"unit-{unit_number}.json").read_text(encoding="utf-8"))
                records = d["questions"]
                self.assertEqual(d["meta"]["total_questions"], 20)
                self.assertTrue(d["meta"].get("source_en_url"))
                self.assertTrue(d["meta"].get("source_ta_url"))
                self.assertEqual(len(records), 20)
                self.assertEqual(Counter(q["correct"] for q in records), Counter({0: 5, 1: 5, 2: 5, 3: 5}))
                self.assertEqual(len({q["id"] for q in records}), 20)
                self.assertEqual(len({q["q_en"].strip().casefold() for q in records}), 20)
                self.assertEqual(len(EXPECTED[str(unit_number)]), 20)
                for i, (question, (en, ta)) in enumerate(zip(records, EXPECTED[str(unit_number)]), 1):
                    with self.subTest(question=i):
                        self.assertEqual(question["id"], f"C10SCI-U{unit_number:02d}-Q{i:04d}")
                        self.assertEqual(question["quiz"], 1)
                        self.assertEqual(question["opts_en"][question["correct"]], en)
                        self.assertEqual(question["opts_ta"][question["correct"]], ta)
                        self.assertTrue(question["page"].isdigit())
                        self.assertIn(en, question["exp_en"])
                        self.assertIn(ta, question["exp_ta"])
                        self.assertEqual(len(question["opts_en"]), 4)
                        self.assertEqual(len(question["opts_ta"]), 4)
                        self.assertNotRegex(question["q_en"], re.compile(
                            r"according to the textbook|correct textbook answer|competitive-exam note",
                            re.IGNORECASE))
                result = AUDIT.audit(records, start=0, count=20)
                self.assertEqual(result["errors"], [], result["errors"])
                self.assertEqual(result["warnings"], [], result["warnings"])

if __name__ == "__main__":
    unittest.main()
