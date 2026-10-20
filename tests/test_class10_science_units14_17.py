#!/usr/bin/env python3
"""Class 10 Biology Units 14–17: catalogue, bilingual keys, and audit.

SCERT 2020 TN class 10 Biology source chapter PDFs are recorded in bank
metadata. Passing validation cannot certify all facts or native Tamil style;
targeted editorial review remains a separate requirement.
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
EXPECTED = {
  "14": [
    [
      "Active transport",
      "ஆற்றல்சார் கடத்தல்"
    ],
    [
      "Plasmolysis",
      "பிளாஸ்மோலிசிஸ்"
    ],
    [
      "Apoplast pathway",
      "அபோபிளாஸ்ட் பாதை"
    ],
    [
      "Symplast pathway",
      "சிம்பிளாஸ்ட் பாதை"
    ],
    [
      "Transpiration pull",
      "நீராவிப்போக்கு இழுவிசை"
    ],
    [
      "Phloem",
      "ஃபுளோயம்"
    ],
    [
      "Imbibition",
      "உள்ளீர்த்தல்"
    ],
    [
      "Red blood cell",
      "சிவப்பணு"
    ],
    [
      "Platelets",
      "இரத்தத் தட்டணுக்கள்"
    ],
    [
      "Agranulocytes",
      "துகளற்ற வெள்ளையணுக்கள்"
    ],
    [
      "Pulmonary artery",
      "நுரையீரல் தமனி"
    ],
    [
      "Pulmonary veins",
      "நுரையீரல் சிரைகள்"
    ],
    [
      "Tricuspid valve",
      "மூவிதழ் வால்வு"
    ],
    [
      "Bicuspid (mitral) valve",
      "ஈரிதழ் (மைட்ரல்) வால்வு"
    ],
    [
      "Left ventricle",
      "இடது வென்ட்ரிக்கிள்"
    ],
    [
      "Sinoatrial node",
      "சைனோஏட்ரியல் கணு"
    ],
    [
      "Atrioventricular valves",
      "ஏட்ரிய–வென்ட்ரிக்கிள் வால்வுகள்"
    ],
    [
      "O only",
      "O மட்டும்"
    ],
    [
      "Coronary circulation",
      "இதயத் தமனி சுற்றோட்டம்"
    ],
    [
      "Absorbing and transporting dietary fats",
      "உணவில் உள்ள கொழுப்புகளை உறிஞ்சிக் கடத்துதல்"
    ]
  ],
  "15": [
    [
      "Neuron",
      "நியூரான்"
    ],
    [
      "Dendrites",
      "டென்ட்ரைட்டுகள்"
    ],
    [
      "Axon",
      "ஆக்சான்"
    ],
    [
      "Nodes of Ranvier",
      "ரான்வியர் கணுக்கள்"
    ],
    [
      "Synapse",
      "நரம்பிணைப்பு"
    ],
    [
      "Acetylcholine",
      "அசிட்டைல்கோலின்"
    ],
    [
      "Sensory (afferent) neuron",
      "உணர்ச்சி (உள்வரும்) நியூரான்"
    ],
    [
      "Motor (efferent) neuron",
      "இயக்க (வெளிச்செல்லும்) நியூரான்"
    ],
    [
      "Neuroglia",
      "நியூரோகிளியா"
    ],
    [
      "Central nervous system",
      "மைய நரம்பு மண்டலம்"
    ],
    [
      "Meninges",
      "மூளை–தண்டுவட உறைகள் (மெனிஞ்சஸ்)"
    ],
    [
      "Cerebrospinal fluid",
      "மூளை–தண்டுவடத் திரவம்"
    ],
    [
      "Cerebrum",
      "பெருமூளை"
    ],
    [
      "Cerebellum",
      "சிறுமூளை"
    ],
    [
      "Medulla oblongata",
      "முகுளம் (மெடுல்லா ஆப்லாங்கட்டா)"
    ],
    [
      "Receptor → sensory neuron → CNS → motor neuron → muscle",
      "உணர்வி → உணர்ச்சி நியூரான் → மைய நரம்பு மண்டலம் → இயக்க நியூரான் → தசை"
    ],
    [
      "A spinal reflex circuit initiates the response rapidly",
      "தண்டுவட அனிச்சைச் சுற்று விரைவாக எதிர்வினையைத் தொடங்குகிறது"
    ],
    [
      "12 pairs",
      "12 இணைகள்"
    ],
    [
      "Sympathetic division",
      "பரிவு நரம்புப் பிரிவு"
    ],
    [
      "Parasympathetic division",
      "எதிர்ப்பரிவு நரம்புப் பிரிவு"
    ]
  ],
  "16": [
    [
      "Auxin",
      "ஆக்சின்"
    ],
    [
      "Release from apical dominance",
      "நுனி ஆதிக்கம் நீங்குதல்"
    ],
    [
      "Auxin",
      "ஆக்சின்"
    ],
    [
      "Gibberellin",
      "ஜிப்ரெல்லின்"
    ],
    [
      "Gibberellin",
      "ஜிப்ரெல்லின்"
    ],
    [
      "Cytokinin",
      "சைட்டோகைனின்"
    ],
    [
      "Ethylene",
      "எத்திலீன்"
    ],
    [
      "Abscisic acid (ABA)",
      "அப்சிசிக் அமிலம் (ABA)"
    ],
    [
      "Abscisic acid",
      "அப்சிசிக் அமிலம்"
    ],
    [
      "They release hormones directly into blood or tissue fluid",
      "அவை ஹார்மோன்களை நேரடியாக இரத்தம் அல்லது திசுத்திரவத்தில் விடுகின்றன"
    ],
    [
      "Insulin",
      "இன்சுலின்"
    ],
    [
      "Glucagon",
      "குளுககான்"
    ],
    [
      "Thyroid gland",
      "தைராய்டு சுரப்பி"
    ],
    [
      "Thyroid gland",
      "தைராய்டு சுரப்பி"
    ],
    [
      "Growth hormone",
      "வளர்ச்சி ஹார்மோன்"
    ],
    [
      "Antidiuretic hormone (ADH)",
      "சிறுநீர்குறைப்பு ஹார்மோன் (ADH)"
    ],
    [
      "Adrenaline (epinephrine)",
      "அட்ரினலின் (எபிநெஃப்ரின்)"
    ],
    [
      "Aldosterone",
      "ஆல்டோஸ்டிரான்"
    ],
    [
      "Parathyroid hormone (PTH)",
      "பாராதைராய்டு ஹார்மோன் (PTH)"
    ],
    [
      "Melatonin",
      "மெலட்டோனின்"
    ]
  ],
  "17": [
    [
      "Vegetative propagation",
      "உடல இனப்பெருக்கம்"
    ],
    [
      "Rhizome",
      "நிலத்தடித் தண்டுக்கிழங்கு (ரைசோம்)"
    ],
    [
      "Adventitious leaf buds",
      "இலை விளிம்புத் துணை மொட்டுகள்"
    ],
    [
      "Spore formation",
      "வித்து உருவாக்கம்"
    ],
    [
      "Budding",
      "அரும்புதல்"
    ],
    [
      "Transfer of pollen from anther to stigma",
      "மகரந்தத்தாளிலிருந்து சூலகமுடிக்கு மகரந்தத்தூள் செல்வது"
    ],
    [
      "Wind",
      "காற்று"
    ],
    [
      "Diploid zygote",
      "இருமயக் கருமுட்டை"
    ],
    [
      "Triploid primary endosperm nucleus",
      "மும்மய முதன்மை உணவுத்திசு உட்கரு"
    ],
    [
      "Seed",
      "விதை"
    ],
    [
      "Pericarp",
      "கனிச்சுவர் (பெரிகார்ப்)"
    ],
    [
      "Style",
      "சூலகத்தண்டு"
    ],
    [
      "Seminiferous tubules",
      "விந்து உருவாக்கக் குழல்கள்"
    ],
    [
      "Meiosis",
      "குன்றல் பகுப்பு"
    ],
    [
      "Ovulation",
      "அண்டவிடுப்பு"
    ],
    [
      "Progesterone",
      "புரோஜெஸ்டிரோன்"
    ],
    [
      "Ampulla of the fallopian tube",
      "ஃபெலோப்பியன் குழாயின் ஆம்புல்லா பகுதி"
    ],
    [
      "Implantation",
      "கருப் பதித்தல்"
    ],
    [
      "Placenta",
      "நஞ்சுக்கொடி"
    ],
    [
      "Vasectomy",
      "வாசெக்டமி"
    ]
  ]
}
SPEC = importlib.util.spec_from_file_location(
    "quiz_quality", ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10ScienceUnits14To17Tests(unittest.TestCase):
    def test_catalogue_integrity(self):
        self.assertEqual(INDEX["meta"]["unit_count"], 21)
        self.assertEqual(INDEX["meta"]["total_questions"], 1000)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 50)
        self.assertEqual([u["id"] for u in INDEX["units"][:17]], list(range(1, 18)))
        self.assertEqual([u["total"] for u in INDEX["units"][:13]],
                         [580, 40] + [20] * 11)
        for unit in INDEX["units"][13:17]:
            self.assertTrue(unit["ready"])
            self.assertEqual(unit["total"], 20)
            self.assertEqual(unit["quiz_count"], 1)
            self.assertEqual(unit["path"], f'unit-{unit["id"]}.json')

    def test_bilingual_answer_keys_and_structural_quality(self):
        all_english = set()
        for unit in range(14, 18):
            with self.subTest(unit=unit):
                d = json.loads((DATA / f"unit-{unit}.json").read_text(encoding="utf-8"))
                questions = d["questions"]
                self.assertEqual(d["meta"]["total_questions"], 20)
                self.assertTrue(d["meta"]["source_en_url"])
                self.assertTrue(d["meta"]["source_ta_url"])
                self.assertEqual(len(questions), 20)
                self.assertEqual(Counter(q["correct"] for q in questions),
                                 Counter({0:5, 1:5, 2:5, 3:5}))
                self.assertEqual(len({q["id"] for q in questions}), 20)
                for i, (q, (en, ta)) in enumerate(zip(questions, EXPECTED[str(unit)]), 1):
                    with self.subTest(unit=unit, question=i):
                        self.assertEqual(q["id"], f"C10SCI-U{unit:02d}-Q{i:04d}")
                        self.assertEqual(q["quiz"], 1)
                        self.assertTrue(q["page"])
                        self.assertEqual(q["opts_en"][q["correct"]], en)
                        self.assertEqual(q["opts_ta"][q["correct"]], ta)
                        self.assertNotIn(q["q_en"].casefold().strip(), all_english)
                        all_english.add(q["q_en"].casefold().strip())
                        self.assertNotRegex(q["q_en"], re.compile(
                            r"according to the textbook|correct textbook answer|"
                            r"identify the correct historical source", re.I))
                        for lang in ("en", "ta"):
                            opts = q[f"opts_{lang}"]
                            self.assertEqual(len(opts), 4)
                            self.assertEqual(len({s.strip().casefold() for s in opts}), 4)
                            self.assertIn(opts[q["correct"]], q[f"exp_{lang}"])
                            self.assertGreater(len(q[f"exp_{lang}"]), 44)
                audited = AUDIT.audit(questions, start=0, count=20)
                self.assertEqual(audited["errors"], [], audited["errors"])
                self.assertEqual(audited["warnings"], [], audited["warnings"])

if __name__ == "__main__":
    unittest.main()
