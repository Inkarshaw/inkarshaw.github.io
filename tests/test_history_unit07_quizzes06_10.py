"""Source-aware bilingual QA for Class 11 Gupta History Quizzes 6–10 (101–200).

These targeted checks cover factual corrections and editorial integrity.
The dataset's claimed 2025 bilingual textbook editions still require
independent page-by-page source verification by a human reviewer.
"""
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_textbook_quiz_quality import audit  # noqa: E402

DATA = json.loads((ROOT / "data/textbook/class-11/history/unit-07.json").read_text(encoding="utf-8"))
QUESTIONS = DATA["questions"]
BATCH = QUESTIONS[100:200]


class GuptaUnit7QuizzesSixToTen(unittest.TestCase):
    def test_original_source_ids_and_quiz_links_preserved(self):
        self.assertEqual(len(QUESTIONS), 492)
        self.assertEqual(DATA["meta"]["total_questions"], 492)
        self.assertEqual(DATA["meta"]["source_records_before_editorial_curation"], 1476)
        self.assertEqual(DATA["meta"]["mechanically_generated_variants_removed"], 984)
        self.assertEqual(len(DATA["meta"]["quiz_sets"]), 25)
        self.assertEqual(DATA["meta"]["qa_reviewed_prefix"], 200)
        self.assertEqual(DATA["meta"]["qa_reviewed_quizzes"], 10)
        self.assertTrue(DATA["meta"]["positional_quiz_sets"])
        self.assertEqual(QUESTIONS[100]["id"], "C11H07-Q301")
        self.assertEqual(QUESTIONS[199]["id"], "C11H07-Q598")
        self.assertEqual(len({q["id"] for q in QUESTIONS}), 492)
        self.assertEqual(len(QUESTIONS[480:]), 12)
        self.assertTrue(all(q["type"] == "direct" for q in QUESTIONS))

    def test_five_bilingual_quizzes_full_20_each(self):
        for n in range(5, 10):
            with self.subTest(quiz=n+1):
                self.assertEqual(len(QUESTIONS[n*20:(n+1)*20]), 20)

    def test_competitive_quality_audit_has_no_warnings(self):
        result = audit(QUESTIONS, 100, 100)
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["warnings"], [])
        self.assertEqual(result["reviewed_quizzes"], "6–10")
        self.assertEqual(result["answer_positions"], {letter: 25 for letter in "ABCD"})

    def test_every_english_tamil_question_has_plausible_unique_options(self):
        for q in BATCH:
            with self.subTest(id=q["id"]):
                self.assertTrue(q["q_en"].endswith("?"))
                self.assertTrue(q["q_ta"].endswith("?"))
                self.assertEqual(len(q["opts_en"]), 4)
                self.assertEqual(len(q["opts_ta"]), 4)
                self.assertEqual(len(set(q["opts_en"])), 4)
                self.assertEqual(len(set(q["opts_ta"])), 4)
                self.assertIn(q["opts_en"][q["correct"]], q["exp_en"])
                self.assertIn(q["opts_ta"][q["correct"]], q["exp_ta"])
                self.assertNotIn("correct textbook answer for", q["q_en"].lower())
                self.assertGreaterEqual(len(q["exp_en"]), 75)
                self.assertGreaterEqual(len(q["exp_ta"]), 50)

    def test_harisena_is_not_certified_as_nine_gems_scholar(self):
        q = QUESTIONS[100]
        self.assertEqual(q["opts_en"][q["correct"]], "Harisena")
        self.assertIn("Allahabad Pillar Prashasti", q["q_en"])
        self.assertIn("legend", q["exp_en"])
        self.assertIn("நவரத்தினர்", q["exp_ta"])
        self.assertIn("later Navaratna legend", QUESTIONS[102]["exp_en"])

    def test_hun_source_corrected_from_tacitus_to_ptolemy(self):
        q = QUESTIONS[116]
        self.assertEqual(q["id"], "C11H07-Q349")
        self.assertEqual(q["opts_en"][q["correct"]], "Ptolemy")
        self.assertEqual(q["opts_ta"][q["correct"]], "தாலமி")
        self.assertIn("Tacitus", q["opts_en"])
        self.assertIn("Khounoi", q["q_en"])
        self.assertIn("second century", q["exp_en"])

    def test_traveller_fahien_limited_eyewitness_claims(self):
        self.assertEqual(QUESTIONS[103]["opts_en"][QUESTIONS[103]["correct"]], "Fahien")
        for n in [121, 123, 124, 125]:
            with self.subTest(record=n+1):
                e = QUESTIONS[n]["exp_en"].lower()
                self.assertTrue("fahien" in e or "pilgrim" in e or "travel" in e)
        self.assertIn("not", QUESTIONS[123]["exp_en"].lower())

    def test_nalanda_kumaragupta_patronage_is_qualified(self):
        q = QUESTIONS[108]
        self.assertEqual(q["opts_en"][q["correct"]], "Nalanda University")
        self.assertIn("traditionally", q["q_en"])
        self.assertIn("caution", q["exp_en"])
        self.assertIn("ஆய்வுக்குரிய", q["exp_ta"])

    def test_diplomatic_administrative_distinctions(self):
        entries = {
            141: "Sandhivigrahika",
            142: "Mahadandanayaka",
            156: "Mahashvapati",
            159: "Uparika",
            168: "Visaya",
            169: "Vishyapati",
            181: "Ashtakula-adhikarana",
            196: "Akshapataladhikrita",
        }
        for idx, expected in entries.items():
            with self.subTest(index=idx):
                q = QUESTIONS[idx]
                self.assertEqual(q["opts_en"][q["correct"]], expected)

    def test_uncertain_espionage_and_revenue_terms_attributed(self):
        self.assertEqual(QUESTIONS[194]["opts_en"][QUESTIONS[194]["correct"]], "Dutakas")
        self.assertIn("envoys", QUESTIONS[194]["exp_en"])
        self.assertEqual(QUESTIONS[197]["opts_en"][QUESTIONS[197]["correct"]], "Klipta")
        self.assertEqual(QUESTIONS[198]["opts_en"][QUESTIONS[198]["correct"]], "Bali")
        self.assertEqual(QUESTIONS[199]["opts_en"][QUESTIONS[199]["correct"]], "Udranga")
        self.assertIn("inscriptional", QUESTIONS[197]["exp_en"])
        self.assertIn("context", QUESTIONS[198]["exp_en"])
        self.assertIn("contexts", QUESTIONS[199]["exp_en"])


if __name__ == "__main__":
    unittest.main()
