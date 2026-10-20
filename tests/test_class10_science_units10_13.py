#!/usr/bin/env python3
"""Class 10 Science Units 10–13 bilingual quiz regression.

Factual references: SCERT Tamil Nadu Class 10 Science original lessons
Units 10 (chemical reactions), 11 (carbon), 12 (plant anatomy), 13 (animals).
Automated tests freeze answer keys and structure; a native Tamil editorial pass
is still useful and is not replaced by these checks.
"""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/textbook/class-10/science"
INDEX = json.loads((DATA / "index.json").read_text(encoding="utf-8"))
EXPECTED_ANSWERS = {
  "10": [
    [
      "1, 2, 1, 2",
      "1, 2, 1, 2"
    ],
    [
      "Combination",
      "சேர்க்கை வினை"
    ],
    [
      "Thermal decomposition",
      "வெப்பச் சிதைவு"
    ],
    [
      "Light",
      "ஒளி"
    ],
    [
      "Electrolytic decomposition",
      "மின்னாற் சிதைவு"
    ],
    [
      "Single displacement",
      "ஒற்றை இடப்பெயர்ச்சி"
    ],
    [
      "Lead iodide (PbI₂)",
      "லெட் அயோடைடு (PbI₂)"
    ],
    [
      "Sodium chloride and water",
      "சோடியம் குளோரைடும் நீரும்"
    ],
    [
      "Magnesium oxide",
      "மக்னீசியம் ஆக்சைடு"
    ],
    [
      "Endothermic",
      "வெப்பங்கொள் வினை"
    ],
    [
      "Reversible arrow (⇌)",
      "மீள்வினை அம்பு (⇌)"
    ],
    [
      "They are equal",
      "அவை சமமாக இருக்கும்"
    ],
    [
      "No; they remain constant but may differ",
      "இல்லை; அவை நிலையாக இருந்தாலும் வேறுபடலாம்"
    ],
    [
      "Greater surface area",
      "அதிக மேற்பரப்பளவு"
    ],
    [
      "It provides a lower-activation-energy path",
      "குறைந்த கிளர்வுறு ஆற்றல் பாதையை வழங்குகிறது"
    ],
    [
      "pH 3 by 100 times",
      "pH 3 இல், 100 மடங்கு"
    ],
    [
      "7",
      "7"
    ],
    [
      "[OH⁻] > [H⁺]",
      "[OH⁻] > [H⁺]"
    ],
    [
      "1 × 10⁻¹⁴",
      "1 × 10⁻¹⁴"
    ],
    [
      "Acidic nature",
      "அமிலத்தன்மை"
    ]
  ],
  "11": [
    [
      "Catenation",
      "சங்கிலித் தொடர் உருவாக்கம்"
    ],
    [
      "It has a valency of four",
      "அதன் இணைதிறன் நான்கு"
    ],
    [
      "C₃H₈",
      "C₃H₈"
    ],
    [
      "A carbon–carbon double bond",
      "கார்பன்–கார்பன் இரட்டைப் பிணைப்பு"
    ],
    [
      "Ethyne (C₂H₂)",
      "ஈத்தைன் (C₂H₂)"
    ],
    [
      "Alkene: CₙH₂ₙ",
      "ஆல்கீன்: CₙH₂ₙ"
    ],
    [
      "Heterocyclic compound",
      "பல்வகை அணு வளையச் சேர்மம்"
    ],
    [
      "Hydroxyl (–OH)",
      "ஹைட்ராக்சில் (–OH)"
    ],
    [
      "Carboxyl (–COOH)",
      "கார்பாக்சில் (–COOH)"
    ],
    [
      "–CHO",
      "–CHO"
    ],
    [
      "Propan-1-ol",
      "புரோப்பேன்-1-ஆல்"
    ],
    [
      "–CH₂–",
      "–CH₂–"
    ],
    [
      "Ethanoic acid",
      "எத்தனாயிக் அமிலம்"
    ],
    [
      "Carbon dioxide (CO₂)",
      "கார்பன் டைஆக்சைடு (CO₂)"
    ],
    [
      "Esterification",
      "எஸ்டராக்கம்"
    ],
    [
      "Saponification",
      "சோப்பாக்கம்"
    ],
    [
      "Its ionic hydrophilic head",
      "அயனித் தன்மையுள்ள நீர்விரும்பும் தலை"
    ],
    [
      "Inside micelles formed by soap molecules",
      "சோப்பு மூலக்கூறுகள் உருவாக்கும் மைசெல்களின் உள்ளே"
    ],
    [
      "Ca²⁺ and Mg²⁺ form insoluble soap salts",
      "Ca²⁺, Mg²⁺ கரையாத சோப்பு உப்புகளை உருவாக்குகின்றன"
    ],
    [
      "Sulphonate or sulphate surfactants",
      "சல்ஃபோனேட் அல்லது சல்ஃபேட் பரப்பியக்கிகள்"
    ]
  ],
  "12": [
    [
      "Vascular tissue system",
      "கடத்துத் திசு மண்டலம்"
    ],
    [
      "Root hairs",
      "வேர்த்தூவிகள்"
    ],
    [
      "Radial vascular bundle",
      "ஆரவகைக் கடத்துக்கற்றை"
    ],
    [
      "Presence of cambium",
      "காம்பியம் இருப்பது"
    ],
    [
      "Towards the periphery",
      "வெளிப்புறத்தை நோக்கி"
    ],
    [
      "Pericycle",
      "பெரிசைக்கிள்"
    ],
    [
      "Suberin",
      "சுபெரின்"
    ],
    [
      "Polyarch xylem and a prominent pith",
      "பலமுனைச் சைலமும் பெரிய மையத்திசுவும்"
    ],
    [
      "In a ring",
      "ஒரு வளையமாக"
    ],
    [
      "Scattered through the ground tissue",
      "அடிப்படைத் திசுவில் சிதறிக் காணப்படும்"
    ],
    [
      "Dorsiventral leaf",
      "மேல்–கீழ் வேறுபட்ட இலை"
    ],
    [
      "Isobilateral leaf",
      "இருபுறமும் ஒத்த இலை"
    ],
    [
      "Guard cells",
      "காப்புச் செல்கள்"
    ],
    [
      "Grana",
      "கிரானா"
    ],
    [
      "Thylakoid membranes",
      "தைலக்காய்டு சவ்வுகளில்"
    ],
    [
      "Stroma",
      "ஸ்ட்ரோமா"
    ],
    [
      "Cristae",
      "கிரிஸ்டே"
    ],
    [
      "Cytoplasm (cytosol)",
      "செல்லூழ் (சைட்டோசால்)"
    ],
    [
      "Oxygen",
      "ஆக்சிஜன்"
    ],
    [
      "1",
      "1"
    ]
  ],
  "13": [
    [
      "Hirudinaria granulosa",
      "ஹிருடினேரியா கிரானுலோசா"
    ],
    [
      "Annelida",
      "வளைத்தசைப் புழுக்கள் (அனெலிடா)"
    ],
    [
      "33",
      "33"
    ],
    [
      "Anterior and posterior suckers",
      "முன், பின் உறிஞ்சிகள்"
    ],
    [
      "Hirudin",
      "ஹிருடின்"
    ],
    [
      "Diffusion through moist skin",
      "ஈரமான தோல் வழி பரவல்"
    ],
    [
      "Nephridia",
      "நெஃப்ரிடியா"
    ],
    [
      "17 pairs",
      "17 இணைகள்"
    ],
    [
      "Hermaphroditism",
      "இருபாலுறுப்புத்தன்மை"
    ],
    [
      "Crop and its diverticula",
      "உணவுச் சேமிப்புப்பையும் அதன் பக்கப்பைகளும்"
    ],
    [
      "Three toothed jaws",
      "பற்களுள்ள மூன்று தாடைகள்"
    ],
    [
      "Oryctolagus cuniculus",
      "ஓரிக்டோலாகஸ் குனிகுலஸ்"
    ],
    [
      "Mammary glands producing milk",
      "பால் சுரக்கும் பால்சுரப்பிகள்"
    ],
    [
      "Caecum",
      "சீக்கம் (குருட்டுக்குடல்)"
    ],
    [
      "Diphyodont",
      "இருமுறைப் பல்லமைப்பு"
    ],
    [
      "Heterodont",
      "பலவடிவப் பல்லமைப்பு"
    ],
    [
      "Canines",
      "கோரைப்பற்கள்"
    ],
    [
      "Diastema",
      "டயாஸ்டீமா"
    ],
    [
      "Diaphragm",
      "உதரவிதானம்"
    ],
    [
      "Four chambers",
      "நான்கு அறைகள்"
    ]
  ]
}
SPEC = importlib.util.spec_from_file_location(
    "audit_textbook_quiz_quality",
    ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10ScienceUnits10To13Tests(unittest.TestCase):
    def test_catalogue_and_previous_units(self):
        self.assertEqual(INDEX["meta"]["unit_count"], 17)
        self.assertEqual(INDEX["meta"]["total_questions"], 920)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 46)
        self.assertEqual([u["id"] for u in INDEX["units"][:13]],
                         list(range(1, 14)))
        self.assertEqual([u["total"] for u in INDEX["units"][:9]],
                         [580, 40, 20, 20, 20, 20, 20, 20, 20])
        for u in INDEX["units"][9:13]:
            self.assertTrue(u["ready"])
            self.assertEqual(u["total"], 20)
            self.assertEqual(u["quiz_count"], 1)
            self.assertEqual(u["path"], f'unit-{u["id"]}.json')

    def test_exact_bilingual_answer_keys_and_structural_audit(self):
        for unit in range(10, 14):
            with self.subTest(unit=unit):
                bank = json.loads(
                    (DATA / f"unit-{unit}.json").read_text(encoding="utf-8"))
                questions = bank["questions"]
                keys = EXPECTED_ANSWERS[str(unit)]
                self.assertEqual(bank["meta"]["total_questions"], 20)
                self.assertTrue(bank["meta"].get("source_en_url"))
                self.assertTrue(bank["meta"].get("source_ta_url"))
                self.assertEqual(len(questions), 20)
                self.assertEqual(len(keys), 20)
                self.assertEqual(Counter(q["correct"] for q in questions),
                                 Counter({0: 5, 1: 5, 2: 5, 3: 5}))
                self.assertEqual(len({q["id"] for q in questions}), 20)
                self.assertEqual(len({q["q_en"].casefold() for q in questions}), 20)
                for i, (q, (en, ta)) in enumerate(zip(questions, keys), 1):
                    with self.subTest(unit=unit, question=i):
                        self.assertEqual(q["id"], f"C10SCI-U{unit:02d}-Q{i:04d}")
                        self.assertEqual(q["quiz"], 1)
                        self.assertTrue(q["page"])
                        self.assertEqual(q["opts_en"][q["correct"]], en)
                        self.assertEqual(q["opts_ta"][q["correct"]], ta)
                        for lang in ("en", "ta"):
                            choices = q[f"opts_{lang}"]
                            self.assertEqual(len(choices), 4)
                            self.assertEqual(len({x.strip().casefold()
                                                  for x in choices}), 4)
                            self.assertIn(choices[q["correct"]],
                                          q[f"exp_{lang}"])
                            self.assertGreater(len(q[f"exp_{lang}"]), 45)
                        self.assertNotRegex(q["q_en"], re.compile(
                            r"according to (the|this) textbook|correct textbook "
                            r"answer|competitive-exam note", re.I))
                audited = AUDIT.audit(questions, start=0, count=20)
                self.assertEqual(audited["errors"], [], audited["errors"])
                self.assertEqual(audited["warnings"], [], audited["warnings"])

if __name__ == "__main__":
    unittest.main()
