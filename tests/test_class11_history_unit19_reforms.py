"""Targeted content and structural regressions for Class 11 History Unit 19."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/textbook/class-11/history/unit-19.json"
SPEC = importlib.util.spec_from_file_location(
    "repository_textbook_audit", ROOT / "scripts/audit_textbook_repository.py"
)
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)

KEYS = {
    154: ("Polytheism", 300),
    155: ("Raja Rammohan Roy", 300),
    156: ("54", 300),
    157: ("Idol worship", 300),
    158: ("Caste system", 300),
    159: ("Child marriage", 300),
    160: ("Faith in divine avatars", 300),
    161: ("Sati", 300),
    162: ("Widow remarriage", 300),
    322: ("Puranas", 301),
    323: ("Dayananda Saraswati", 301),
    324: ("Back to the Vedas", 301),
    508: ("Equality", 302),
    509: ("Jyotiba Phule", 302),
    510: ("Gulamgiri (Slavery)", 302),
    511: ("Rationality", 302),
    512: ("Poona (Pune)", 302),
    513: ("Savitri Phule", 302),
    811: ("Sufism", 305),
    812: ("Lucknow", 305),
    813: ("Sayings of the Prophet", 305),
}


class ModernityUnit19Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bank = json.loads(BANK.read_text(encoding="utf-8"))

    def test_revised_mcqs_are_distinct_and_bilingual(self):
        records = self.bank["questions"]
        self.assertEqual(len(records), 319)
        self.assertEqual(len({item["id"] for item in records}), 319)
        self.assertTrue(all(item["type"] == "direct" for item in records))
        self.assertEqual(self.bank["meta"]["source_records_before_editorial_curation"], 1507)
        self.assertEqual(self.bank["meta"]["mechanically_generated_variants_removed"], 1188)
        by_id = {item["id"]: item for item in records}
        stems = set()
        for n, (answer, printed_page) in KEYS.items():
            with self.subTest(question=n):
                item = by_id[f"C11H19-Q{n:04d}"]
                self.assertEqual(item["id"], f"C11H19-Q{n:04d}")
                self.assertEqual(item["type"], "direct")
                self.assertEqual(item["page_en"], printed_page)
                self.assertEqual(item["opts_en"][item["correct"]], answer)
                self.assertEqual(len(item["opts_en"]), 4)
                self.assertEqual(len(item["opts_ta"]), 4)
                self.assertEqual(len({s.casefold().strip() for s in item["opts_en"]}), 4)
                self.assertEqual(len(set(item["opts_ta"])), 4)
                self.assertTrue(item["opts_ta"][item["correct"]])
                self.assertTrue(item["q_ta"] and item["exp_ta"] and item["exp_en"])
                self.assertNotIn("textbook answer", item["q_en"].casefold())
                self.assertNotIn(item["q_en"], stems)
                stems.add(item["q_en"])

    def test_bank_structure_is_valid(self):
        report = AUDIT.audit_bank(BANK, self.bank)
        self.assertEqual(report["errors"], [])

    def test_second_and_third_quizzes_are_direct_and_bilingual(self):
        questions = self.bank["questions"][20:60]
        self.assertEqual(len(questions), 40)
        for item in questions:
            with self.subTest(id=item["id"]):
                self.assertNotIn("textbook answer for", item["q_en"].lower())
                self.assertTrue(item["q_en"].endswith("?"))
                self.assertTrue(item["q_ta"].endswith("?"))
                self.assertEqual(len(set(item["opts_en"])), 4)
                self.assertEqual(len(set(item["opts_ta"])), 4)
                self.assertTrue(item["exp_en"] and item["exp_ta"])

    def test_brahmo_split_is_corrected_even_when_textbook_reverses_labels(self):
        questions = {item["id"]: item for item in self.bank["questions"]}
        adi = questions["C11H19-Q0208"]
        keshab = questions["C11H19-Q0211"]
        self.assertEqual(adi["opts_en"][adi["correct"]], "Adi Brahmo Samaj")
        self.assertEqual(keshab["opts_en"][keshab["correct"]], "Brahmo Samaj of India")
        for item in (adi, keshab):
            self.assertIn("1878", item["exp_en"])
            self.assertTrue(item["fact_check_url"].startswith("https://"))

    def test_fourth_and_fifth_quizzes_have_answerable_bilingual_choices(self):
        questions = self.bank["questions"][60:100]
        self.assertEqual(len(questions), 40)
        for item in questions:
            with self.subTest(id=item["id"]):
                self.assertNotIn("textbook answer for", item["q_en"].lower())
                self.assertNotIn("சரியான பாடநூல் விடை", item["q_ta"])
                self.assertTrue(item["q_en"].endswith("?"))
                self.assertTrue(item["q_ta"].endswith("?"))
                self.assertEqual(len(set(item["opts_en"])), 4)
                self.assertEqual(len(set(item["opts_ta"])), 4)
                self.assertTrue(item["exp_en"] and item["exp_ta"])

        by_id = {item["id"]: item for item in questions}
        priesthood = by_id["C11H19-Q0331"]
        self.assertEqual(priesthood["opts_en"][priesthood["correct"]],
                         "The authority of Brahmin priests")
        self.assertIn("Widow remarriage", priesthood["opts_en"])
        dav = by_id["C11H19-Q0340"]
        self.assertEqual(dav["opts_en"][dav["correct"]],
                         "Dayanand Anglo Vedic schools and colleges")


if __name__ == "__main__":
    unittest.main()
