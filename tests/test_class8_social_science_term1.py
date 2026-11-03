"""Class 8 Social Science Term I: honest source coverage and quiz routing."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "data/textbook/class-8/social-science/term-1"

class Class8SocialTerm1Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = json.loads((DIR / "index.json").read_text(encoding="utf-8"))
        cls.banks = {unit: json.loads((DIR / f"unit-{unit}.json").read_text(encoding="utf-8")) for unit in range(1, 11)}

    def test_all_ten_chapters_are_listed_without_false_readiness(self):
        units = self.index["units"]
        self.assertEqual(len(units), 10)
        self.assertEqual(self.index["meta"]["unit_count"], 10)
        self.assertEqual([u["id"] for u in units], list(range(1, 11)))
        self.assertEqual([u["id"] for u in units if u["ready"]], list(range(1, 11)))
        self.assertEqual(self.index["meta"]["total_questions"], 200)
        self.assertEqual(sum(u["total"] for u in units if u["ready"]), 200)
        self.assertEqual(self.index["meta"]["total_quiz_sets"], 10)
        self.assertEqual(units[0]["path"], "unit-1.json")
        self.assertEqual(units[1]["path"], "unit-2.json")
        self.assertEqual(units[2]["path"], "unit-3.json")
        self.assertEqual(units[3]["path"], "unit-4.json")
        self.assertEqual(units[4]["path"], "unit-5.json")
        self.assertEqual(units[5]["path"], "unit-6.json")
        self.assertEqual(units[6]["path"], "unit-7.json")
        self.assertEqual(units[7]["path"], "unit-8.json")
        self.assertEqual(units[8]["path"], "unit-9.json")
        self.assertEqual(units[9]["path"], "unit-10.json")

    def test_ten_published_units_each_have_twenty_valid_bilingual_questions(self):
        for unit_no, bank in self.banks.items():
            questions = bank["questions"]
            self.assertEqual(bank["meta"]["total_questions"], 20)
            self.assertEqual(len(questions), 20)
            self.assertEqual(
                [q["id"] for q in questions],
                [f"C8SS1U{unit_no}-Q{i:03d}" for i in range(1, 21)]
            )
            self.assertEqual(len(bank["meta"]["quiz_sets"]), 1)
            for q in questions:
                with self.subTest(unit=unit_no, question=q["id"]):
                    self.assertEqual(q["quiz"], 1)
                    self.assertTrue(re.search(r"[\u0b80-\u0bff]", q["q_ta"]))
                    self.assertEqual(len(q["opts_en"]), 4)
                    self.assertEqual(len(q["opts_ta"]), 4)
                    self.assertEqual(len(set(s.casefold() for s in q["opts_en"])), 4)
                    self.assertEqual(len(set(q["opts_ta"])), 4)
                    self.assertIn(q["correct"], range(4))
                    self.assertGreaterEqual(len(q["exp_en"]), 75)
                    self.assertGreaterEqual(len(q["exp_ta"]), 50)
                    self.assertIn(q["page_en"], range(({1:125,2:135,3:150,4:159,5:171,6:182,7:192,8:201,9:209,10:214})[unit_no],({1:132,2:147,3:159,4:170,5:181,6:192,7:201,8:209,9:214,10:224})[unit_no]))
            self.assertEqual(len(set(q["q_en"].casefold() for q in questions)), 20)

    def test_source_limitations_are_visible(self):
        for bank in self.banks.values():
            meta = bank["meta"]
            self.assertEqual(meta["edition"], 2019)
            self.assertTrue(meta["source_en_url"].lower().endswith(".pdf"))
            self.assertIn("editorial translation", meta["editorial_status"])
        html = (ROOT / "textbook-quiz.html").read_text(encoding="utf-8")
        self.assertIn("Tamil originals and the prescribed current edition remain unverified", html)

if __name__ == "__main__":
    unittest.main()
