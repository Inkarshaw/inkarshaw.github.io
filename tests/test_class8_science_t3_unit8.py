#!/usr/bin/env python3
"""Verify Class 8 Science Term III Unit 8 English/Tamil question set and catalogue."""
import json
import importlib.util
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "data/textbook/class-8/science/term-3"
BANK = json.loads((DIR / "unit-8.json").read_text(encoding="utf-8"))
INDEX = json.loads((DIR / "index.json").read_text(encoding="utf-8"))
EXPECTED = [
  [
    "Deforestation",
    "காடழிப்பு"
  ],
  [
    "Roots no longer bind the soil firmly",
    "வேர்கள் மண்ணை உறுதியாகப் பிடித்து நிறுத்துவதில்லை"
  ],
  [
    "Afforestation",
    "புதிய காடு வளர்த்தல்"
  ],
  [
    "Reforestation",
    "மீள்காடு வளர்த்தல்"
  ],
  [
    "Biodiversity",
    "உயிரினப் பல்வகைமை"
  ],
  [
    "Flora",
    "தாவரத் தொகுப்பு (ஃப்ளோரா)"
  ],
  [
    "Fauna",
    "விலங்குத் தொகுப்பு (ஃபானா)"
  ],
  [
    "Endemic species",
    "ஓரிடவாழ் இனம்"
  ],
  [
    "Endangered species",
    "அழிவுநிலையிலுள்ள இனம்"
  ],
  [
    "Extinct species",
    "முற்றிலும் அழிந்த இனம்"
  ],
  [
    "In-situ conservation",
    "இயற்கை வாழிடப் பாதுகாப்பு (இன்சிட்டு)"
  ],
  [
    "Ex-situ conservation",
    "வெளியிடப் பாதுகாப்பு (எக்சிட்டு)"
  ],
  [
    "National park",
    "தேசியப் பூங்கா"
  ],
  [
    "Biosphere reserve",
    "உயிர்க்கோளக் காப்பகம்"
  ],
  [
    "International Union for Conservation of Nature (IUCN)",
    "பன்னாட்டு இயற்கைப் பாதுகாப்பு ஒன்றியம் (IUCN)"
  ],
  [
    "Wild Life (Protection) Act, 1972",
    "வனவிலங்கு (பாதுகாப்பு) சட்டம், 1972"
  ],
  [
    "The Nilgiris",
    "நீலகிரி"
  ],
  [
    "3 March",
    "மார்ச் 3"
  ],
  [
    "People's Biodiversity Register (PBR)",
    "மக்கள் உயிரினப் பல்வகைமைப் பதிவேடு (PBR)"
  ],
  [
    "Poaching",
    "சட்டவிரோத வேட்டையாடுதல்"
  ]
]
SPEC = importlib.util.spec_from_file_location(
    "quiz_quality", ROOT / "scripts/audit_textbook_quiz_quality.py"
)
CHECK = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECK)

class Class8Term3Unit8Tests(unittest.TestCase):
    def test_catalogue_coverage(self):
        entry = next(u for u in INDEX["units"] if u["id"] == 8)
        self.assertTrue(entry["ready"])
        self.assertEqual((entry["path"], entry["total"], entry["quiz_count"]),
                         ("unit-8.json", 40, 2))
        self.assertEqual(len(INDEX["units"]), 9)
        self.assertTrue(all(u["ready"] for u in INDEX["units"]))
        self.assertEqual(INDEX["meta"]["total_questions"], 360)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 18)
        self.assertEqual(BANK["meta"]["total_questions"], 40)
        self.assertTrue(BANK["meta"]["source_en_url"])
        self.assertTrue(BANK["meta"]["source_ta_url"])

    def test_bilingual_keys_options_and_explanations(self):
        records = BANK["questions"]
        self.assertEqual(len(records), 40)
        self.assertEqual(len({q["id"] for q in records}), 40)
        records = records[:20]
        self.assertEqual(len(records), len(EXPECTED))
        self.assertEqual(len(records), 20)
        self.assertEqual(Counter(q["correct"] for q in records),
                         Counter({0: 5, 1: 5, 2: 5, 3: 5}))
        for i, (q, (english, tamil)) in enumerate(zip(records, EXPECTED), 1):
            with self.subTest(question=i):
                self.assertEqual(q["id"], f"C08S-T3-U08-Q{i:04d}")
                self.assertEqual(q["quiz"], 1)
                self.assertEqual(q["opts_en"][q["correct"]], english)
                self.assertEqual(q["opts_ta"][q["correct"]], tamil)
                self.assertTrue(q["page"] and q["page_ta"])
                for lng in ("en", "ta"):
                    self.assertEqual(len(q[f"opts_{lng}"]), 4)
                    self.assertIn(q[f"opts_{lng}"][q["correct"]],q[f"exp_{lng}"])
                self.assertNotRegex(q["q_en"], re.compile(
                    r"according to (?:the )?textbook|correct textbook answer|"
                    r"competitive-exam note", re.I))
        self.assertEqual(len({q["q_en"].casefold() for q in records}), 20)
        summary = CHECK.audit(records, start=0, count=20)
        self.assertFalse(summary["errors"], summary["errors"])
        self.assertFalse(summary["warnings"], summary["warnings"])

if __name__ == "__main__":
    unittest.main()
