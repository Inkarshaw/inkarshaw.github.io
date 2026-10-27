#!/usr/bin/env python3
"""Class 10 Science final textbook chapters 22–23 bilingual regression.

Source: Tamil Nadu SCERT Standard 10 Science, 2020, chapters 22 and 23.
Structural validation and frozen keys are not independent editorial sign-off.
"""
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"data/textbook/class-10/science"
INDEX=json.loads((DATA/"index.json").read_text(encoding="utf-8"))
EXPECTED={
  "22": [
    [
      "Coal",
      "நிலக்கரி"
    ],
    [
      "Sustainable use",
      "நீடித்த நிலையான பயன்பாடு"
    ],
    [
      "They store carbon in biomass and soils",
      "தாவர உடலிலும் மண்ணிலும் கார்பனைச் சேமிக்கின்றன"
    ],
    [
      "Topsoil erosion",
      "மேல்மண் அரிப்பு"
    ],
    [
      "Chipko movement",
      "சிப்கோ இயக்கம்"
    ],
    [
      "Reforestation",
      "மீள்காடாக்கம்"
    ],
    [
      "Social forestry",
      "சமூகக் காடுவளர்ப்பு"
    ],
    [
      "Wild Life (Protection) Act, 1972",
      "வனவிலங்கு (பாதுகாப்பு) சட்டம், 1972"
    ],
    [
      "In-situ conservation",
      "இயற்கை வாழிடப் பாதுகாப்பு"
    ],
    [
      "Nilgiri Biosphere Reserve",
      "நீலகிரி உயிர்க்கோளக் காப்பகம்"
    ],
    [
      "Soil erosion",
      "மண்ணரிப்பு"
    ],
    [
      "Contour ploughing",
      "சமஉயரக் கோட்டு உழவு"
    ],
    [
      "Shelterbelts",
      "காற்றுத்தடுப்பு மரவரிசைகள்"
    ],
    [
      "Solar cell",
      "சூரிய மின்கலம்"
    ],
    [
      "Wind energy",
      "காற்றாலை ஆற்றல்"
    ],
    [
      "Tidal energy",
      "ஓத ஆற்றல்"
    ],
    [
      "Methane (CH₄)",
      "மீத்தேன் (CH₄)"
    ],
    [
      "It increases infiltration into aquifers",
      "நீர்நிலைகளுக்குள் ஊடுருவலை அதிகரிக்கிறது"
    ],
    [
      "Reduce waste generation",
      "கழிவு உருவாக்கத்தைக் குறைத்தல்"
    ],
    [
      "Send to an authorised e-waste collection or recycler",
      "அங்கீகரிக்கப்பட்ட மின்னணுக் கழிவு சேகரிப்பு அல்லது மறுசுழற்சி மையத்திடம் ஒப்படைத்தல்"
    ]
  ],
  "23": [
    [
      "Folder",
      "கோப்புத்தொகுப்பு"
    ],
    [
      "A saved photograph named flower.png",
      "flower.png என்ற பெயரில் சேமித்த புகைப்படம்"
    ],
    [
      "Notepad",
      "நோட்பேடு"
    ],
    [
      "Paint",
      "பெயிண்ட்"
    ],
    [
      "Scratch",
      "ஸ்கிராட்ச்"
    ],
    [
      "Massachusetts Institute of Technology (MIT)",
      "மாசசூசெட்ஸ் தொழில்நுட்ப நிறுவனம் (MIT)"
    ],
    [
      "Stage",
      "மேடை (Stage)"
    ],
    [
      "Sprite",
      "ஸ்பிரைட்"
    ],
    [
      "Script editor",
      "நிரல் திருத்தி (Script Editor)"
    ],
    [
      "Script area",
      "நிரல் பகுதி (Script Area)"
    ],
    [
      "Block menu",
      "கட்ட வகைப் பட்டியல் (Block Menu)"
    ],
    [
      "Block palette",
      "கட்டத் தட்டு (Block Palette)"
    ],
    [
      "Costume editor",
      "உடைத் திருத்தி (Costume Editor)"
    ],
    [
      "Sounds tab",
      "ஒலிகள் தத்தல் (Sounds Tab)"
    ],
    [
      "When green flag clicked",
      "பச்சைக் கொடி சொடுக்கப்பட்டபோது"
    ],
    [
      "Places it at the centre of the Stage",
      "மேடையின் மையத்தில் வைக்கிறது"
    ],
    [
      "It advances along its current direction",
      "அது தற்போதைய திசையில் முன்னே நகரும்"
    ],
    [
      "Go to x:0 y:0 then move steps",
      "முதலில் x:0 y:0 செல், பின்னர் படிகள் நகரு"
    ],
    [
      "When space key pressed",
      "இடைவெளி விசை அழுத்தப்பட்டபோது"
    ],
    [
      "Save the project file",
      "செயல்திட்டக் கோப்பைச் சேமித்தல்"
    ]
  ]
}
SPEC=importlib.util.spec_from_file_location(
    "quality_audit", ROOT/"scripts/audit_textbook_quiz_quality.py")
AUDIT=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

class Class10ScienceCompleteChapterTests(unittest.TestCase):
    def test_complete_catalogue(self):
        self.assertEqual(INDEX["meta"]["unit_count"],23)
        self.assertEqual(INDEX["meta"]["total_questions"],1460)
        self.assertEqual(INDEX["meta"]["total_quiz_sets"],73)
        self.assertEqual([u["id"] for u in INDEX["units"]],list(range(1,24)))
        self.assertEqual([u["total"] for u in INDEX["units"]],
                         [580, 40] + [40] * 21)
        self.assertTrue(all(u["ready"] for u in INDEX["units"]))
        for unit in INDEX["units"][-2:]:
            self.assertEqual(unit["quiz_count"],2)
            self.assertEqual(unit["path"],f'unit-{unit["id"]}.json')

    def test_last_two_chapters_40_bilingual_keys_and_audit(self):
        for unit in (22,23):
            with self.subTest(unit=unit):
                d=json.loads((DATA/f"unit-{unit}.json").read_text(encoding="utf-8"))
                qs=d["questions"]
                self.assertEqual(len(qs), 40)
                self.assertEqual(len({q["id"] for q in qs}), 40)
                qs = qs[:20]
                self.assertEqual(d["meta"]["total_questions"],40)
                self.assertTrue(d["meta"]["source_en_url"])
                self.assertTrue(d["meta"]["source_ta_url"])
                self.assertEqual(len(qs),20)
                self.assertEqual(Counter(q["correct"] for q in qs),
                                 Counter({0:5,1:5,2:5,3:5}))
                self.assertEqual(len({q["id"] for q in qs}),20)
                for i,(q,(en,ta)) in enumerate(zip(qs,EXPECTED[str(unit)]),1):
                    with self.subTest(unit=unit,question=i):
                        self.assertEqual(q["id"],f"C10SCI-U{unit:02d}-Q{i:04d}")
                        self.assertEqual(q["quiz"],1)
                        self.assertTrue(q.get("page"))
                        self.assertEqual(q["opts_en"][q["correct"]],en)
                        self.assertEqual(q["opts_ta"][q["correct"]],ta)
                        self.assertNotRegex(q["q_en"],re.compile(
                            r"according to (the|this) textbook|correct textbook "
                            r"answer",re.I))
                        for lang in ("en","ta"):
                            opts=q[f"opts_{lang}"]
                            self.assertEqual(len(opts),4)
                            self.assertEqual(len({v.casefold().strip() for v in opts}),4)
                            self.assertIn(opts[q["correct"]],q[f"exp_{lang}"])
                            self.assertGreater(len(q[f"exp_{lang}"]),45)
                audited=AUDIT.audit(qs,start=0,count=20)
                self.assertEqual(audited["errors"],[],audited["errors"])
                self.assertEqual(audited["warnings"],[],audited["warnings"])

if __name__=="__main__":
    unittest.main()
