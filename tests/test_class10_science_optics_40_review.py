#!/usr/bin/env python3
"""Class 10 Science Optics: sixty bilingual MCQ answer/regression checks."""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BANK=json.loads((ROOT/"data/textbook/class-10/science/unit-2.json").read_text(encoding="utf-8"))
EXPECTED=[
  [
    "It can travel through a vacuum",
    "அது வெற்றிடத்திலும் பரவும்"
  ],
  [
    "600 nm",
    "600 nm"
  ],
  [
    "Violet",
    "ஊதா"
  ],
  [
    "It bends towards the normal",
    "செங்குத்துக் கோட்டை நோக்கி விலகும்"
  ],
  [
    "1.50",
    "1.50"
  ],
  [
    "The incident ray, refracted ray and normal lie in one plane",
    "படுகதிர், விலகுகதிர் மற்றும் செங்குத்துக் கோடு ஒரே தளத்தில் அமையும்"
  ],
  [
    "1.50",
    "1.50"
  ],
  [
    "Different colours undergo different amounts of refraction",
    "வெவ்வேறு நிறங்கள் வெவ்வேறு அளவுகளில் ஒளிவிலகல் அடைகின்றன"
  ],
  [
    "16 times",
    "16 மடங்கு"
  ],
  [
    "Shorter wavelengths are scattered away over a longer atmospheric path",
    "வளிமண்டலத்தில் நீண்ட தொலைவு செல்லும்போது குறைந்த அலைநீளங்கள் அதிகமாகச் சிதறுகின்றன"
  ],
  [
    "Mie scattering",
    "மீ ஒளிச்சிதறல்"
  ],
  [
    "Scattering by colloidal particles",
    "கூழ்மத் துகள்களால் ஒளி சிதறுதல்"
  ],
  [
    "Stokes lines",
    "ஸ்டோக்ஸ் வரிகள்"
  ],
  [
    "At 2F on the other side, real, inverted and same size",
    "மறுபுறம் 2F-இல் மெய்யான, தலைகீழான, சம அளவுள்ள பிம்பம்"
  ],
  [
    "Virtual, erect and magnified",
    "மாயமான, நேரான, பெரிதாக்கப்பட்ட பிம்பம்"
  ],
  [
    "Virtual, erect and diminished",
    "மாயமான, நேரான, சிறியதானது"
  ],
  [
    "0.5 m",
    "0.5 m"
  ],
  [
    "Concave lens",
    "குழிலென்சு"
  ],
  [
    "Iris",
    "கருவிழி (ஐரிஸ்)"
  ],
  [
    "+60 cm",
    "+60 cm"
  ],
  [
    "It emerges without deviation",
    "அது திசை விலகாமல் வெளிவருகிறது"
  ],
  [
    "They meet at the principal focus on the other side",
    "அவை மறுபுற முதன்மைக் குவியத்தில் சந்திக்கும்"
  ],
  [
    "Real, inverted and magnified beyond 2F",
    "2F-க்கு அப்பால் மெய்யான, தலைகீழான, பெரிதான பிம்பம்"
  ],
  [
    "−0.25 m",
    "−0.25 m"
  ],
  [
    "−1.50",
    "−1.50"
  ],
  [
    "Hypermetropia — convex lens",
    "தூரப்பார்வைக் குறைபாடு — குவிலென்சு"
  ],
  [
    "The eye lens becomes less flexible and accommodation decreases",
    "கண் லென்சின் நெகிழ்தன்மை குறைந்து பார்வைத் தகவமைப்பு ஆற்றல் குறைகிறது"
  ],
  [
    "Cylindrical lens",
    "உருளை லென்சு"
  ],
  [
    "25 cm",
    "25 cm"
  ],
  [
    "Ciliary muscles contract and eye-lens focal length decreases",
    "சிலியரி தசைகள் சுருங்கிக் கண் லென்சின் குவியத்தொலைவு குறைகிறது"
  ],
  [
    "Real and inverted",
    "மெய்யானதும் தலைகீழானதும்"
  ],
  [
    "It is a convex lens of short focal length near the specimen",
    "அது மாதிரியருகிலுள்ள குறுகிய குவியத்தொலைவுடைய குவிலென்சாகும்"
  ],
  [
    "Within the focal length of the convex lens",
    "குவிலென்சின் குவியத்தொலைவுக்குள்"
  ],
  [
    "Terrestrial telescope",
    "நிலத் தொலைநோக்கி"
  ],
  [
    "Curved concave mirror",
    "வளைந்த குழி ஆடி"
  ],
  [
    "+20 cm",
    "+20 cm"
  ],
  [
    "1.25",
    "1.25"
  ],
  [
    "Anti-Stokes lines",
    "எதிர்-ஸ்டோக்ஸ் வரிகள்"
  ],
  [
    "Incident and scattered light have the same photon energy",
    "படும் ஒளிக்கும் சிதறும் ஒளிக்கும் ஒளித்துகளின் ஆற்றல் ஒன்றாக இருக்கும்"
  ],
  [
    "Its frequency",
    "அதன் அதிர்வெண்"
  ]
]
# Quiz 3: fixed independent answer keys, not derived from the data being tested.
EXPECTED.extend([
  [
    "The switched-on LED",
    "ஒளிரும் LED"
  ],
  [
    "It becomes one-third",
    "மூன்றில் ஒரு பங்காகும்"
  ],
  [
    "It continues along the normal",
    "செங்குத்துக் கோட்டிலேயே தொடரும்"
  ],
  [
    "Away from the normal",
    "செங்குத்துக் கோட்டைவிட்டு விலகி"
  ],
  [
    "0.40",
    "0.40"
  ],
  [
    "Red",
    "சிவப்பு"
  ],
  [
    "One-sixteenth as much",
    "பதினாறில் ஒரு பங்கு"
  ],
  [
    "Particles comparable to or larger than the light wavelength",
    "ஒளியின் அலைநீளத்துக்கு ஒப்பான அல்லது அதைவிடப் பெரிய துகள்கள்"
  ],
  [
    "Rayleigh line",
    "ராலே வரி"
  ],
  [
    "One plane and one outwardly curved surface",
    "ஒரு தட்டை மற்றும் ஒரு புறம் குவிந்த வளைவு மேற்பரப்பு"
  ],
  [
    "Parallel to the principal axis",
    "முதன்மை அச்சுக்கு இணையாக"
  ],
  [
    "At the principal focus on the image side",
    "பிம்பப் பக்க முதன்மைக் குவியத்தில்"
  ],
  [
    "Between the optical centre and the focus on the object's side",
    "பொருள் பக்கத்தில் ஒளியியல் மையத்துக்கும் குவியத்துக்கும் இடையில்"
  ],
  [
    "−0.5",
    "−0.5"
  ],
  [
    "20 cm",
    "20 cm"
  ],
  [
    "Cornea",
    "கருவிழிப்படலம் (கார்னியா)"
  ],
  [
    "Optic nerve",
    "பார்வை நரம்பு"
  ],
  [
    "Myopia",
    "கிட்டப்பார்வைக் குறைபாடு"
  ],
  [
    "6",
    "6"
  ],
  [
    "20",
    "20"
  ]
])
SPEC=importlib.util.spec_from_file_location("audit",ROOT/"scripts/audit_textbook_quiz_quality.py")
AUDIT=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)
class OpticsReviewTests(unittest.TestCase):
    def test_all_quizzes_and_bilingual_answers(self):
        self.assertEqual(len(BANK["questions"]),60)
        self.assertEqual(BANK["meta"]["total_questions"],60)
        self.assertEqual(len(BANK["meta"]["quiz_sets"]),3)
        self.assertEqual(Counter(q["correct"] for q in BANK["questions"]),Counter({0:15,1:15,2:15,3:15}))
        for i,(q,(en,ta)) in enumerate(zip(BANK["questions"],EXPECTED),1):
            with self.subTest(i=i):
                self.assertEqual(q["id"],f"C10SCI-U02-Q{i:04d}")
                self.assertEqual(q["quiz"],(i-1)//20+1)
                self.assertEqual(q["opts_en"][q["correct"]],en)
                self.assertEqual(q["opts_ta"][q["correct"]],ta)
                for lang in ("en","ta"):
                    opts=q[f"opts_{lang}"]
                    self.assertEqual(len(opts),4)
                    self.assertEqual(len({s.casefold().strip() for s in opts}),4)
                    self.assertIn(opts[q["correct"]],q[f"exp_{lang}"])
                    self.assertGreater(len(q[f"exp_{lang}"]),48)
        self.assertEqual(len(EXPECTED),60)
        self.assertEqual(len({q["q_en"].casefold().strip() for q in BANK["questions"]}),60)
        self.assertEqual(len({q["q_ta"].strip() for q in BANK["questions"]}),60)
        for q in BANK["questions"][40:]:
            self.assertEqual(q["quiz"],3)
            self.assertIn(q["type"],{"concept","application","reasoning","numerical"})
            self.assertGreaterEqual(int(q["page"]),16)
            self.assertLessEqual(int(q["page"]),27)
        result=AUDIT.audit(BANK["questions"],start=0,count=60)
        self.assertEqual(result["errors"],[],result["errors"])
        self.assertEqual(result["warnings"],[],result["warnings"])
if __name__=="__main__": unittest.main()
