#!/usr/bin/env python3
"""Regression checks for the first Class 8 Science Term III Unit 7 quiz."""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "data/textbook/class-8/science/term-3"
BANK = json.loads((DIR / "unit-7.json").read_text(encoding="utf-8"))
INDEX = json.loads((DIR / "index.json").read_text(encoding="utf-8"))
EXPECTED = [
  [
    "Ploughing",
    "உழுதல்"
  ],
  [
    "Levelling the soil",
    "நிலத்தைச் சமப்படுத்துதல்"
  ],
  [
    "Seed drill",
    "விதைக்கும் கருவி"
  ],
  [
    "Transplanting",
    "நாற்று நடுதல்"
  ],
  [
    "To supply soil nutrients before crop growth",
    "பயிர் வளர்வதற்கு முன் மண் ஊட்டச்சத்துகளை வழங்க"
  ],
  [
    "Organic manure (compost)",
    "கரிம உரம் (மட்கிய உரம்)"
  ],
  [
    "Drip irrigation",
    "சொட்டு நீர்ப்பாசனம்"
  ],
  [
    "Sprinkler irrigation",
    "தெளிப்பு நீர்ப்பாசனம்"
  ],
  [
    "They compete for water, nutrients, light and space",
    "அவை நீர், ஊட்டச்சத்து, ஒளி, இடத்திற்காகப் போட்டியிடுகின்றன"
  ],
  [
    "Herbicide",
    "களைக்கொல்லி"
  ],
  [
    "Integrated weed management",
    "ஒருங்கிணைந்த களை மேலாண்மை"
  ],
  [
    "Threshing",
    "கதிரடித்தல்"
  ],
  [
    "Winnowing",
    "தூற்றுதல்"
  ],
  [
    "To reduce moisture that encourages microorganisms",
    "நுண்ணுயிர் வளர்ச்சியை ஊக்குவிக்கும் ஈரத்தை குறைக்க"
  ],
  [
    "Crop rotation",
    "பயிர்ச் சுழற்சி"
  ],
  [
    "Rhizobium in root nodules helps fix nitrogen",
    "வேர் முடிச்சிலுள்ள ரைசோபியம் நைட்ரஜனை நிலைநிறுத்த உதவுகிறது"
  ],
  [
    "Seed bank",
    "விதை வங்கி"
  ],
  [
    "Soil, compost and plant seeds",
    "மண், மட்கிய உரம், தாவர விதைகள்"
  ],
  [
    "Indian Agricultural Research Institute (IARI)",
    "இந்திய வேளாண் ஆராய்ச்சி நிறுவனம் (IARI)"
  ],
  [
    "Krishi Vigyan Kendra (KVK)",
    "வேளாண் அறிவியல் மையம் (KVK)"
  ]
]
SPEC = importlib.util.spec_from_file_location(
    "textbook_batch_audit", ROOT / "scripts/audit_textbook_quiz_quality.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class Class8CropProductionQuizTests(unittest.TestCase):
    def test_catalogue_and_source_editions(self):
        entry = next(unit for unit in INDEX["units"] if unit["id"] == 7)
        self.assertTrue(entry["ready"])
        self.assertEqual((entry["total"], entry["quiz_count"], entry["path"]),
                         (40, 2, "unit-7.json"))
        self.assertEqual(INDEX["meta"]["total_questions"], 360)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 18)
        self.assertEqual(BANK["meta"]["total_questions"], 40)
        self.assertTrue(BANK["meta"]["source_en_url"].startswith("https://"))
        self.assertTrue(BANK["meta"]["source_ta_url"].startswith("https://"))
        self.assertEqual(len(BANK["meta"]["quiz_sets"]), 2)

    def test_source_grounded_bilingual_questions(self):
        records = BANK["questions"]
        self.assertEqual(len(records), 40)
        self.assertEqual(len({q["id"] for q in records}), 40)
        records = records[:20]
        self.assertEqual(len(records), 20)
        self.assertEqual(len(EXPECTED), 20)
        self.assertEqual(len(set(q["id"] for q in records)), 20)
        self.assertEqual(Counter(q["correct"] for q in records),
                         Counter({0: 5, 1: 5, 2: 5, 3: 5}))
        for i, (q, (english, tamil)) in enumerate(zip(records, EXPECTED), 1):
            with self.subTest(n=i):
                self.assertEqual(q["id"], f"C08S-T3-U07-Q{i:04d}")
                self.assertEqual(q["quiz"], 1)
                self.assertEqual(q["opts_en"][q["correct"]], english)
                self.assertEqual(q["opts_ta"][q["correct"]], tamil)
                self.assertTrue(q["page"] and q["page_ta"])
                self.assertNotRegex(q["q_en"], re.compile(
                    r"according to (?:the )?textbook|correct textbook answer|"
                    r"competitive-exam note|as mentioned in the lesson", re.I))
        summary = MODULE.audit(records, 0, 20)
        self.assertFalse(summary["errors"], summary["errors"])
        self.assertFalse(summary["warnings"], summary["warnings"])

if __name__ == "__main__":
    unittest.main()
