#!/usr/bin/env python3
"""Class 10 Science Units 18–21 bilingual quiz regressions.

Free Textbook Programme, Government of Tamil Nadu, SCERT 2020 chapter sources
are named within each question bank. Automated key/structure validation does
not constitute independent native-speaker editorial certification.
"""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "data/textbook/class-10/science"
INDEX = json.loads((BASE / "index.json").read_text(encoding="utf-8"))
EXPECTED = {
  "18": [
    [
      "Tt (heterozygous)",
      "Tt (கலப்பினம்)"
    ],
    [
      "3 tall : 1 dwarf",
      "3 உயரம் : 1 குட்டை"
    ],
    [
      "1 TT : 2 Tt : 1 tt",
      "1 TT : 2 Tt : 1 tt"
    ],
    [
      "Dominant T allele",
      "ஓங்கிய T அல்லீல்"
    ],
    [
      "Both alleles are recessive (tt)",
      "இரண்டு அல்லீல்களும் ஒடுங்கியவை (tt)"
    ],
    [
      "9 : 3 : 3 : 1",
      "9 : 3 : 3 : 1"
    ],
    [
      "They separate into different gametes",
      "தனித்தனி இனச்செல்களுக்குப் பிரிகின்றன"
    ],
    [
      "Natural self-pollination",
      "இயற்கையான தன்மகரந்தச்சேர்க்கை"
    ],
    [
      "Phenotype",
      "தோற்றவகை"
    ],
    [
      "Metacentric",
      "மெட்டாசென்ட்ரிக்"
    ],
    [
      "Centromere",
      "சென்ட்ரோமியர்"
    ],
    [
      "Thymine",
      "தைமின்"
    ],
    [
      "Three bonds",
      "மூன்று பிணைப்புகள்"
    ],
    [
      "Each daughter helix contains one parental and one newly made strand",
      "ஒவ்வொரு மகவு சுருளிலும் ஒரு பழைய, ஒரு புதிய இழை இருக்கும்"
    ],
    [
      "DNA helicase",
      "DNA ஹெலிகேஸ்"
    ],
    [
      "Gene mutation",
      "மரபணுத் திடீர்மாற்றம்"
    ],
    [
      "Down syndrome",
      "டவுன் நோய்க்குறி"
    ],
    [
      "Alleles",
      "அல்லீல்கள்"
    ],
    [
      "Four (AB, Ab, aB, ab)",
      "நான்கு (AB, Ab, aB, ab)"
    ],
    [
      "Independent assortment",
      "தனித்துப் பிரிதல் விதி"
    ]
  ],
  "19": [
    [
      "Chemical evolution",
      "வேதிப் பரிணாமம்"
    ],
    [
      "Microbes arise from pre-existing microbes under tested conditions",
      "சோதித்த சூழலில் நுண்ணுயிர்கள் முன்பிருந்த நுண்ணுயிர்களிலிருந்து தோன்றுகின்றன"
    ],
    [
      "Panspermia",
      "பான்ஸ்பெர்மியா"
    ],
    [
      "Louis Pasteur",
      "லூயி பாஸ்டர்"
    ],
    [
      "Homologous organs",
      "ஒத்த மூலம் கொண்ட உறுப்புகள்"
    ],
    [
      "Analogous structures",
      "ஒத்த செயல் கொண்ட உறுப்புகள்"
    ],
    [
      "Fossils",
      "படிமங்கள்"
    ],
    [
      "Palaeontology",
      "படிமவியல்"
    ],
    [
      "Reptiles and birds",
      "ஊர்வன மற்றும் பறவைகள்"
    ],
    [
      "Divergent evolution",
      "கிளைப்படும் பரிணாமம்"
    ],
    [
      "Convergent evolution",
      "ஒன்றுகூடும் பரிணாமம்"
    ],
    [
      "Jean-Baptiste Lamarck",
      "ஜான் பாப்டிஸ்ட் லாமார்க்"
    ],
    [
      "Natural selection",
      "இயற்கைத் தேர்வு"
    ],
    [
      "Charles Darwin",
      "சார்ல்ஸ் டார்வின்"
    ],
    [
      "Heritable variation among individuals",
      "தனிநபர்களிடையே மரபாகக் கடத்தப்படும் வேறுபாடுகள்"
    ],
    [
      "Mutation",
      "திடீர்மாற்றம்"
    ],
    [
      "Vestigial structure",
      "எஞ்சிய உறுப்பு"
    ],
    [
      "Sedimentary rock",
      "படிவுப் பாறை"
    ],
    [
      "Comparative embryology",
      "ஒப்பீட்டுக் கருவியல்"
    ],
    [
      "Ethnobotany",
      "இனத்தாவரவியல்"
    ]
  ],
  "20": [
    [
      "Plant breeding",
      "தாவர இனப்பெருக்க மேம்பாடு"
    ],
    [
      "M. S. Swaminathan",
      "எம். எஸ். சுவாமிநாதன்"
    ],
    [
      "IR-8",
      "IR-8"
    ],
    [
      "Wheat",
      "கோதுமை"
    ],
    [
      "Biofortification",
      "உயிர்ச்சத்து செறிவூட்டல்"
    ],
    [
      "Selection",
      "தேர்வு முறை"
    ],
    [
      "Introduction",
      "அறிமுகப்படுத்தல்"
    ],
    [
      "Mutation breeding",
      "திடீர்மாற்ற இனப்பெருக்க மேம்பாடு"
    ],
    [
      "Hybridisation",
      "கலப்பினமாக்கல்"
    ],
    [
      "Polyploidy",
      "பலமயத் தன்மை"
    ],
    [
      "Inbreeding",
      "உட்கலப்பு"
    ],
    [
      "Outcrossing",
      "புறக்கலப்பு"
    ],
    [
      "Heterosis (hybrid vigour)",
      "கலப்பின வீரியம் (ஹெட்டரோசிஸ்)"
    ],
    [
      "Restriction endonuclease",
      "கட்டுப்பாட்டு எண்டோநியூக்ளியேஸ்"
    ],
    [
      "DNA ligase",
      "DNA லைகேஸ்"
    ],
    [
      "Plasmid",
      "பிளாஸ்மிட்"
    ],
    [
      "Distinguish genetic profiles of individuals",
      "தனிநபர்களின் DNA அடையாள வடிவங்களை வேறுபடுத்துதல்"
    ],
    [
      "Gene therapy",
      "மரபணுச் சிகிச்சை"
    ],
    [
      "Stem cells",
      "மூலச்செல்கள்"
    ],
    [
      "Recombinant-DNA biotechnology",
      "மறுசேர்க்கை DNA உயிரித்தொழில்நுட்பம்"
    ]
  ],
  "21": [
    [
      "Ensure safety and inform a trusted safeguarding authority",
      "பாதுகாப்பை உறுதி செய்து பொறுப்பான பாதுகாப்பு அதிகாரியிடம் தெரிவிக்க வேண்டும்"
    ],
    [
      "Nicotine",
      "நிகோட்டின்"
    ],
    [
      "Carbon monoxide",
      "கார்பன் மோனாக்சைடு"
    ],
    [
      "Lung cancer",
      "நுரையீரல் புற்றுநோய்"
    ],
    [
      "Liver",
      "கல்லீரல்"
    ],
    [
      "Substance dependence",
      "பொருள் சார்ந்த அடிமைத்தன்மை"
    ],
    [
      "Keep homes and vehicles smoke-free",
      "வீடு மற்றும் வாகனங்களைப் புகையில்லாத இடங்களாக்குதல்"
    ],
    [
      "Type 1 diabetes mellitus",
      "வகை 1 நீரிழிவு நோய்"
    ],
    [
      "Reduced tissue responsiveness to insulin",
      "செல்திசுக்கள் இன்சுலினுக்குக் குறைவாகப் பதிலளித்தல்"
    ],
    [
      "Diabetes mellitus",
      "நீரிழிவு நோய்"
    ],
    [
      "HbA1c",
      "HbA1c"
    ],
    [
      "Mass (kg) ÷ height² (m²)",
      "நிறை (kg) ÷ உயரம்² (m²)"
    ],
    [
      "22.2 kg/m²",
      "22.2 kg/m²"
    ],
    [
      "Atherosclerosis",
      "அதிரோஸ்கிளீரோசிஸ்"
    ],
    [
      "Regular physical activity and avoidance of tobacco",
      "முறையான உடற்பயிற்சியும் புகையிலைத் தவிர்ப்பும்"
    ],
    [
      "Ability to invade and potentially spread to other tissues",
      "அருகுத் திசுக்களில் ஊடுருவி பிற இடங்களுக்கும் பரவும் திறன்"
    ],
    [
      "Human immunodeficiency virus (HIV)",
      "மனித நோயெதிர்ப்புக் குறைபாட்டு வைரஸ் (HIV)"
    ],
    [
      "CD4 T-helper cells",
      "CD4 உதவி T செல்கள்"
    ],
    [
      "Sharing a meal with a person living with HIV",
      "HIV உடன் வாழும் ஒருவருடன் உணவு பகிர்ந்து உண்ணுதல்"
    ],
    [
      "Effective antiretroviral therapy (ART)",
      "பயனுள்ள எதிர் ரெட்ரோவைரஸ் சிகிச்சை (ART)"
    ]
  ]
}
SPEC = importlib.util.spec_from_file_location(
    "textbook_quality", ROOT / "scripts/audit_textbook_quiz_quality.py")
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10ScienceUnits18To21Tests(unittest.TestCase):
    def test_index_counts_and_previous_units(self):
        self.assertEqual(INDEX["meta"]["unit_count"], 23)
        self.assertEqual(INDEX["meta"]["total_questions"], 1460)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"], 73)
        self.assertEqual([u["id"] for u in INDEX["units"][:21]], list(range(1,22)))
        self.assertEqual([u["total"] for u in INDEX["units"][:17]],
                         [580, 40] + [40] * 15)
        for u in INDEX["units"][17:21]:
            self.assertTrue(u["ready"])
            self.assertEqual(u["total"], 40)
            self.assertEqual(u["quiz_count"], 2)
            self.assertEqual(u["path"], f'unit-{u["id"]}.json')

    def test_80_exact_bilingual_keys_and_quality(self):
        seen_stems = set()
        for unit in range(18,22):
            with self.subTest(unit=unit):
                bank=json.loads((BASE/f"unit-{unit}.json").read_text(encoding="utf-8"))
                qs=bank["questions"]
                self.assertEqual(len(qs), 40)
                self.assertEqual(len({q["id"] for q in qs}), 40)
                qs = qs[:20]
                answers=EXPECTED[str(unit)]
                self.assertEqual(bank["meta"]["total_questions"],40)
                self.assertTrue(bank["meta"]["source_en_url"])
                self.assertTrue(bank["meta"]["source_ta_url"])
                self.assertEqual(len(qs),20)
                self.assertEqual(len(answers),20)
                self.assertEqual(Counter(q["correct"] for q in qs),
                                 Counter({0:5,1:5,2:5,3:5}))
                self.assertEqual(len({q["id"] for q in qs}),20)
                for i,(q,(en,ta)) in enumerate(zip(qs,answers),1):
                    with self.subTest(unit=unit,question=i):
                        self.assertEqual(q["id"],f"C10SCI-U{unit:02d}-Q{i:04d}")
                        self.assertEqual(q["quiz"],1)
                        self.assertEqual(q["opts_en"][q["correct"]],en)
                        self.assertEqual(q["opts_ta"][q["correct"]],ta)
                        self.assertTrue(q.get("page"))
                        self.assertNotRegex(q["q_en"],re.compile(
                          r"according to the textbook|correct textbook answer|"
                          r"what is the correct textbook",re.IGNORECASE))
                        stem=re.sub(r"\W+"," ",q["q_en"].casefold()).strip()
                        self.assertNotIn(stem,seen_stems)
                        seen_stems.add(stem)
                        for lang in ("en","ta"):
                            opts=q[f"opts_{lang}"]
                            self.assertEqual(len(opts),4)
                            self.assertEqual(len({v.casefold().strip() for v in opts}),4)
                            self.assertIn(opts[q["correct"]],q[f"exp_{lang}"])
                            self.assertGreater(len(q[f"exp_{lang}"]),44)
                audit=AUDIT.audit(qs,start=0,count=20)
                self.assertEqual(audit["errors"],[],audit["errors"])
                self.assertEqual(audit["warnings"],[],audit["warnings"])

if __name__ == "__main__":
    unittest.main()
