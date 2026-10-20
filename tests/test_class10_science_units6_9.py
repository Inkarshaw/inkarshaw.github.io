#!/usr/bin/env python3
"""Regression coverage for Class 10 Science Units 6–9 (2019 edition).

This test freezes bilingual keyed answers, exact catalogue counts, structural
audit results and no metatextual prompts. It cannot certify source truth or
native-speaker translation quality; those require independent editorial review.
"""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROOT_DATA = ROOT / "data/textbook/class-10/science"
INDEX = json.loads((ROOT_DATA / "index.json").read_text(encoding="utf-8"))
EXPECTED_ANSWERS = {
  "6": [
    [
      "Henri Becquerel",
      "ஹென்றி பெக்கரல்"
    ],
    [
      "Decay of an unstable atomic nucleus",
      "நிலையற்ற அணுக்கருவின் சிதைவு"
    ],
    [
      "Becquerel (Bq)",
      "பெக்கரல் (Bq)"
    ],
    [
      "3.7 × 10¹⁰",
      "3.7 × 10¹⁰"
    ],
    [
      "Alpha radiation",
      "ஆல்பா கதிர்வீச்சு"
    ],
    [
      "Gamma radiation",
      "காமா கதிர்வீச்சு"
    ],
    [
      "Alpha particles",
      "ஆல்பா துகள்கள்"
    ],
    [
      "Mass number −4; atomic number −2",
      "நிறை எண் −4; அணு எண் −2"
    ],
    [
      "Atomic number increases by one; mass number unchanged",
      "அணு எண் ஒன்று அதிகரிக்கும்; நிறை எண் மாறாது"
    ],
    [
      "Artificial radioactivity",
      "செயற்கைக் கதிரியக்கம்"
    ],
    [
      "It splits into lighter nuclei releasing energy",
      "அது இலகு அணுக்கருக்களாகப் பிளந்து ஆற்றல் வெளியிடும்"
    ],
    [
      "Fusion of light nuclei",
      "இலகு அணுக்கருக்களின் இணைவு"
    ],
    [
      "Released neutrons trigger additional fissions",
      "வெளியாகும் நியூட்ரான்கள் மேலும் அணுப்பிளவுகளைத் தூண்டும்"
    ],
    [
      "Slow down fast neutrons",
      "வேக நியூட்ரான்களின் வேகத்தைக் குறைத்தல்"
    ],
    [
      "To absorb neutrons and regulate the reaction",
      "நியூட்ரான்களை உறிஞ்சி வினையைக் கட்டுப்படுத்த"
    ],
    [
      "Coolant",
      "குளிரூட்டி"
    ],
    [
      "To limit harmful radiation escaping the reactor",
      "தீங்கு விளைவிக்கும் கதிர்வீச்சு வெளியேறுவதைக் கட்டுப்படுத்த"
    ],
    [
      "Carbon-14",
      "கார்பன்-14"
    ],
    [
      "Iodine-131",
      "அயோடின்-131"
    ],
    [
      "Distance",
      "தொலைவு"
    ]
  ],
  "7": [
    [
      "One-twelfth",
      "பன்னிரண்டில் ஒரு பங்கு"
    ],
    [
      "Atom",
      "அணு"
    ],
    [
      "3 atoms",
      "3 அணுக்கள்"
    ],
    [
      "O₂",
      "O₂"
    ],
    [
      "18 u",
      "18 u"
    ],
    [
      "44 u",
      "44 u"
    ],
    [
      "6.022 × 10²³",
      "6.022 × 10²³"
    ],
    [
      "2 mol",
      "2 mol"
    ],
    [
      "28 g/mol",
      "28 g/mol"
    ],
    [
      "N = nNₐ",
      "N = nNₐ"
    ],
    [
      "22.4 L",
      "22.4 L"
    ],
    [
      "11.2 L",
      "11.2 L"
    ],
    [
      "Molecules",
      "மூலக்கூறுகள்"
    ],
    [
      "Molecular mass = 2 × vapour density",
      "மூலக்கூறு நிறை = 2 × ஆவி அடர்த்தி"
    ],
    [
      "32",
      "32"
    ],
    [
      "Empirical formula",
      "எளிய விகித வாய்பாடு"
    ],
    [
      "CH₂O",
      "CH₂O"
    ],
    [
      "11.1%",
      "11.1%"
    ],
    [
      "Their amounts in moles",
      "அவற்றின் மோல் அளவுகள்"
    ],
    [
      "2 mol",
      "2 mol"
    ]
  ],
  "8": [
    [
      "Atomic number",
      "அணு எண்"
    ],
    [
      "7",
      "7"
    ],
    [
      "18",
      "18"
    ],
    [
      "Group 17",
      "குழு 17"
    ],
    [
      "Group 18",
      "குழு 18"
    ],
    [
      "Alkali metals",
      "கார உலோகங்கள்"
    ],
    [
      "Number of occupied electron shells",
      "எலக்ட்ரான்கள் உள்ள ஆற்றல் கூடுகளின் எண்ணிக்கை"
    ],
    [
      "It decreases",
      "அது குறையும்"
    ],
    [
      "It increases",
      "அது அதிகரிக்கும்"
    ],
    [
      "Ionisation energy",
      "அயனியாக்க ஆற்றல்"
    ],
    [
      "Fluorine (F)",
      "ஃபுளோரின் (F)"
    ],
    [
      "It is smaller",
      "அது சிறியதாக இருக்கும்"
    ],
    [
      "An ore permits economical extraction of a metal",
      "தாதுவிலிருந்து உலோகத்தைச் சிக்கனமாகப் பிரித்தெடுக்கலாம்"
    ],
    [
      "Froth flotation",
      "நுரை மிதப்பு முறை"
    ],
    [
      "Metal oxide",
      "உலோக ஆக்சைடு"
    ],
    [
      "Flux reacting with impurities",
      "உதவி உருக்கி கழிவுகளுடன் வினைபுரிவதால்"
    ],
    [
      "Electrolysis of molten alumina in cryolite",
      "கிரியோலைட்டில் கரைத்த அலுமினாவை மின்னாற்பகுத்தல்"
    ],
    [
      "Copper and zinc",
      "செம்பும் துத்தநாகமும்"
    ],
    [
      "An alloy containing mercury",
      "பாதரசம் கொண்ட கலப்புலோகம்"
    ],
    [
      "To reduce corrosion of the iron",
      "இரும்பின் அரிப்பைக் குறைக்க"
    ]
  ],
  "9": [
    [
      "Homogeneous solution",
      "ஒருபடித்தான கரைசல்"
    ],
    [
      "Water",
      "நீர்"
    ],
    [
      "Solute",
      "கரைபொருள்"
    ],
    [
      "Aqueous solution",
      "நீர்க்கரைசல்"
    ],
    [
      "Air",
      "காற்று"
    ],
    [
      "Binary solution",
      "இருகூறுக் கரைசல்"
    ],
    [
      "Saturated solution",
      "நிறைவுற்ற கரைசல்"
    ],
    [
      "Unsaturated solution",
      "நிறைவுறாத கரைசல்"
    ],
    [
      "Supersaturated solution",
      "மிகைநிறைவுற்ற கரைசல்"
    ],
    [
      "Solubility",
      "கரைதிறன்"
    ],
    [
      "It increases",
      "அது அதிகரிக்கும்"
    ],
    [
      "Gas solubility usually decreases on heating",
      "வெப்பம் அதிகரிக்கும்போது வாயுக் கரைதிறன் பொதுவாகக் குறையும்"
    ],
    [
      "10%",
      "10%"
    ],
    [
      "20%",
      "20%"
    ],
    [
      "(Solute mass ÷ solution mass) × 100",
      "(கரைபொருள் நிறை ÷ கரைசல் நிறை) × 100"
    ],
    [
      "Formation of anhydrous copper sulphate",
      "நீரற்ற காப்பர் சல்ஃபேட் உருவாதல்"
    ],
    [
      "Hydrated salt",
      "நீரேறிய உப்பு"
    ],
    [
      "Efflorescence",
      "படிகநீர் இழத்தல் (எஃப்ளோரெசன்ஸ்)"
    ],
    [
      "Hygroscopy",
      "ஈரமுறிஞ்சும் தன்மை"
    ],
    [
      "Deliquescence",
      "ஈரமுறிஞ்சிக் கரைதல்"
    ]
  ]
}
SPEC = importlib.util.spec_from_file_location(
    "batch_audit", ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10ScienceUnits6To9Tests(unittest.TestCase):
    def test_catalogue_is_complete_through_unit_nine(self):
        self.assertEqual(INDEX["meta"]["unit_count"], 17)
        self.assertEqual(INDEX["meta"]["total_questions"], 920)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 46)
        self.assertEqual([u["id"] for u in INDEX["units"][:9]], list(range(1, 10)))
        self.assertEqual([u["total"] for u in INDEX["units"][:5]],
                         [580, 40, 20, 20, 20])
        self.assertTrue(all(u["ready"] and u["total"] == 20 and u["quiz_count"] == 1
                            for u in INDEX["units"][5:9]))

    def test_each_batch_has_exact_bilingual_answers_and_good_structure(self):
        for unit in range(6, 10):
            with self.subTest(unit=unit):
                bank = json.loads((ROOT_DATA / f"unit-{unit}.json").read_text(encoding="utf-8"))
                questions = bank["questions"]
                keys = EXPECTED_ANSWERS[str(unit)]
                self.assertEqual(len(questions), 20)
                self.assertEqual(len(keys), 20)
                self.assertEqual(bank["meta"]["total_questions"], 20)
                self.assertEqual(len({q["id"] for q in questions}), 20)
                self.assertEqual(len({q["q_en"].casefold() for q in questions}), 20)
                self.assertTrue(bank["meta"].get("source_en_url"))
                self.assertTrue(bank["meta"].get("source_ta_url"))
                self.assertEqual(Counter(q["correct"] for q in questions),
                                 Counter({0: 5, 1: 5, 2: 5, 3: 5}))
                for i, (q, (en, ta)) in enumerate(zip(questions, keys), 1):
                    with self.subTest(unit=unit, question=i):
                        self.assertEqual(q["id"], f"C10SCI-U{unit:02d}-Q{i:04d}")
                        self.assertEqual(q["quiz"], 1)
                        self.assertEqual(q["opts_en"][q["correct"]], en)
                        self.assertEqual(q["opts_ta"][q["correct"]], ta)
                        self.assertTrue(q.get("page"))
                        for lang in ("en", "ta"):
                            options = q[f"opts_{lang}"]
                            self.assertEqual(len(options), 4)
                            self.assertEqual(len({s.strip().casefold() for s in options}), 4)
                            self.assertIn(options[q["correct"]], q[f"exp_{lang}"])
                        self.assertNotRegex(q["q_en"], re.compile(
                            r"according to the textbook|correct textbook answer|"
                            r"competitive-exam note", re.I))
                result = AUDIT.audit(questions, start=0, count=20)
                self.assertEqual(result["errors"], [], result["errors"])
                self.assertEqual(result["warnings"], [], result["warnings"])

if __name__ == "__main__":
    unittest.main()
