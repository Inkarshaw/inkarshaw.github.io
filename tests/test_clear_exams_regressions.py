"""Source-level checks for the ClearExams quiz and text-edition regressions.

These guard the integration points; interactive browser E2E tests are still required.
"""
import json
from pathlib import Path
import re
import unittest
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def source(path):
    return (ROOT / path).read_text(encoding="utf-8")


class ClearExamsRegressionTests(unittest.TestCase):
    def test_daily_quiz_preserves_native_history(self):
        html = source("daily-quiz.html")
        self.assertIn("function getQuizHistory()", html)
        self.assertNotRegex(html, r"function\s+history\s*\(")
        self.assertIn("window.history.replaceState", html)

    def test_textbook_has_one_bilingual_renderer(self):
        html = source("textbook-play.html")
        self.assertEqual(len(re.findall(r"function\s+render\s*\(", html)), 1)
        for marker in ("renderPalette();save();", "txt('Previous','முந்தையது')",
                       "txt('☆ Bookmark','☆ சேமி')", "txt('Report question','வினாவில் பிழை தெரிவி')"):
            self.assertIn(marker, html)

    def test_catalogue_matches_complete_class_subject_term(self):
        script = source("assets/js/textbook-catalog-controls.js")
        self.assertIn("Number(params.get('class'))===cls", script)
        self.assertIn("params.get('subject')===subject", script)
        self.assertIn("Number(params.get('term'))===term", script)
        self.assertNotIn("if(cls!==6)return true", script)

    def test_service_worker_refreshes_daily_text_and_quiz_json(self):
        script = source("service-worker.js")
        self.assertIn("url.pathname.startsWith('/current-affairs/text/')", script)
        self.assertIn("url.pathname.startsWith('/data/textbook/')", script)
        self.assertIn("fetch(event.request,{cache:'no-store'})", script)
        self.assertNotIn("'/current-affairs/pdfs.json'", script)

    def test_home_and_site_search_use_text_index(self):
        for path in ("index.html", "search.html"):
            html = source(path)
            self.assertIn("current-affairs/text/editions.json", html)
            self.assertNotIn("fetch('current-affairs/pdfs.json'", html)

    def test_october_fifteenth_text_edition_indexed(self):
        editions = json.loads(source("current-affairs/text/editions.json"))
        self.assertTrue(any(x["date"] == "2026-10-15"
                            and x["file"] == "2026-10-15.html" for x in editions))
        page = source("current-affairs/text/2026-10-15.html")
        self.assertIn("2026-10-15", page)

    def test_syllabus_uses_verified_chapter_route_mapping(self):
        js = source("assets/js/syllabus-reader.js")
        self.assertIn("mappedChapters(part,index,tamil)", js)
        match = re.search(r"const generalStudyLinks=(\[.*?\]);", js)
        self.assertIsNotNone(match, "Syllabus study map is missing")
        groups = json.loads(match.group(1))
        self.assertEqual(len(groups), 6)
        self.assertGreaterEqual(sum(map(len, groups)), 17)
        links = set()
        for group in groups:
            for item in group:
                href = item["href"]
                self.assertNotIn(href, links, "Duplicate chapter-to-quiz route")
                links.add(href)
                parsed = urlsplit(href)
                self.assertEqual(parsed.path, "textbook-play.html")
                params = parse_qs(parsed.query)
                cls = int(params["class"][0])
                subject = params["subject"][0]
                unit = int(params["unit"][0])
                term = int(params.get("term", ["1"])[0])
                self.assertEqual(params["quiz"][0], "1")
                folder = ROOT / "data" / "textbook" / f"class-{cls}" / subject
                if cls <= 8:
                    folder = folder / f"term-{term}"
                filename = folder / (f"unit-{unit:02}.json" if cls == 11 else f"unit-{unit}.json")
                self.assertTrue(filename.is_file(), f"Unpublished textbook quiz mapping: {href}")
                self.assertTrue(item["topic_en"] and item["chapter_en"])
                self.assertTrue(item["topic_ta"] and item["chapter_ta"])

    def test_history_unit_one_drops_generated_variants(self):
        data = json.loads(source("data/textbook/class-11/history/unit-01.json"))
        self.assertEqual(len(data["questions"]), 265)
        self.assertTrue(all(q["type"] == "direct" for q in data["questions"]))
        first = data["questions"][0]
        self.assertEqual(first["id"], "C11H01-Q001")
        self.assertEqual(first["opts_en"][first["correct"]], "Chipped stone flakes and cores")
        self.assertEqual(len(first["opts_ta"]), 4)
        self.assertTrue(first["exp_en"] and first["exp_ta"])

    def test_history_unit_four_removes_generated_variants(self):
        data = json.loads(source("data/textbook/class-11/history/unit-04.json"))
        self.assertEqual(len(data["questions"]), 394)
        self.assertEqual(data["meta"]["duplicated_association_and_generated_statement_variants_removed"], 792)
        self.assertTrue(all(q["type"] == "direct" for q in data["questions"]))
        for q in data["questions"][:20]:
            self.assertNotIn("What is the correct textbook answer for", q["q_en"])
            self.assertEqual(len(q["opts_en"]), 4)
            self.assertEqual(len(q["opts_ta"]), 4)
            self.assertGreater(len(q["exp_en"]), 95)
            self.assertGreater(len(q["exp_ta"]), 65)

    def test_shared_bank_supports_separate_tnpsc_and_upsc_exam_views(self):
        import csv
        with (ROOT / "data/quizzes/daily-quiz.csv").open(encoding="utf-8", newline="") as stream:
            rows = list(csv.DictReader(stream))
        shared = [
            row for row in rows
            if row["Exam"] == "UPSC/TNPSC"
            and row["Active"].strip().lower() != "false"
            and row["Topic"] and row["Subtopic"] and row["Question"]
            and row["CorrectAnswer"].upper() in "ABCD"
            and all(row["Option" + option] and row["Explanation" + option] for option in "ABCD")
        ]
        self.assertGreaterEqual(len(shared), 10, "Shared TNPSC fallback questions must be available")
        workflow = source(".github/workflows/site-health.yml")
        self.assertIn('if family in {"tnpsc", "upsc"}:', workflow)
        self.assertIn('available += coverage.get("UPSC/TNPSC", 0)', workflow)
        html = source("daily-quiz.html")
        self.assertIn('if(hasShared&&!hasExactTnpsc)exams.push("TNPSC Group IV")', html)
        self.assertIn('if(hasShared&&!hasExactUpsc)exams.push("UPSC")', html)
        self.assertIn('if(selected==="UPSC"||selected==="TNPSC Group IV")', html)

    def test_history_unit_four_quiz_three_is_bilingual_and_distinct(self):
        data = json.loads(source("data/textbook/class-11/history/unit-04.json"))
        self.assertEqual(len(data["questions"]), 394)
        self.assertEqual(data["meta"]["duplicated_or_low_value_direct_records_removed"], 2)
        third = data["questions"][40:60]
        self.assertEqual(len(third), 20)
        self.assertEqual(third[0]["id"], "C11H04-Q124")
        self.assertEqual(third[-1]["id"], "C11H04-Q184")
        self.assertNotIn("C11H04-Q145", [q["id"] for q in data["questions"]])
        for q in third:
            self.assertTrue(q["q_en"].endswith("?"))
            self.assertTrue(q["q_ta"].endswith("?"))
            self.assertNotIn("What is the correct textbook answer for", q["q_en"])
            self.assertEqual(len(q["opts_en"]), 4)
            self.assertEqual(len(q["opts_ta"]), 4)
            self.assertEqual(len(set(q["opts_en"])), 4)
            self.assertEqual(len(set(q["opts_ta"])), 4)
            self.assertIn(q["correct"], range(4))
            self.assertGreaterEqual(len(q["exp_en"]), 80)
            self.assertGreaterEqual(len(q["exp_ta"]), 45)

    def test_history_unit_four_quiz_four_historical_sources_and_tamil(self):
        data = json.loads(source("data/textbook/class-11/history/unit-04.json"))
        self.assertEqual(len(data["questions"]), 394)
        self.assertEqual(len(data["meta"]["quiz_sets"]), 20)
        fourth = data["questions"][60:80]
        self.assertEqual(len(fourth), 20)
        self.assertEqual(fourth[0]["id"], "C11H04-Q187")
        self.assertEqual(fourth[-1]["id"], "C11H04-Q244")
        indexed = {q["id"]: q for q in fourth}
        for q in fourth:
            self.assertTrue(q["q_en"].endswith("?"))
            self.assertTrue(q["q_ta"].endswith("?"))
            self.assertNotIn("What is the correct textbook answer for", q["q_en"])
            self.assertEqual(len(q["opts_en"]), 4)
            self.assertEqual(len(q["opts_ta"]), 4)
            self.assertEqual(len(set(q["opts_en"])), 4)
            self.assertEqual(len(set(q["opts_ta"])), 4)
            self.assertIn(q["correct"], range(4))
            self.assertGreaterEqual(len(q["exp_en"]), 85)
            self.assertGreaterEqual(len(q["exp_ta"]), 50)
        for key, expected in {
            "C11H04-Q190": "Dhana Nanda",
            "C11H04-Q235": "Seventh",
            "C11H04-Q238": "The Indians of the twentieth district",
            "C11H04-Q244": "Gadāra",
        }.items():
            q = indexed[key]
            self.assertEqual(q["opts_en"][q["correct"]], expected)
        self.assertIn("uncertain", indexed["C11H04-Q223"]["exp_en"])
        self.assertIn("Herodotus 3.91", indexed["C11H04-Q235"]["exp_en"])
    def test_history_unit_four_quiz_five_excavation_and_coinage(self):
        data = json.loads(source("data/textbook/class-11/history/unit-04.json"))
        self.assertEqual(len(data["questions"]), 394)
        self.assertEqual(len(data["meta"]["quiz_sets"]), 20)
        fifth = data["questions"][80:100]
        self.assertEqual(len(fifth), 20)
        self.assertEqual(fifth[0]["id"], "C11H04-Q247")
        self.assertEqual(fifth[-1]["id"], "C11H04-Q304")
        indexed = {q["id"]: q for q in fifth}
        for q in fifth:
            self.assertTrue(q["q_en"].endswith("?"))
            self.assertTrue(q["q_ta"].endswith("?"))
            self.assertNotIn("What is the correct textbook answer for", q["q_en"])
            self.assertEqual(len(q["opts_en"]), 4)
            self.assertEqual(len(q["opts_ta"]), 4)
            self.assertEqual(len(set(q["opts_en"])), 4)
            self.assertEqual(len(set(q["opts_ta"])), 4)
            self.assertIn(q["correct"], range(4))
            self.assertGreaterEqual(len(q["exp_en"]), 95)
            self.assertGreaterEqual(len(q["exp_ta"]), 55)
        expected = {
            "C11H04-Q262": "Sir Mortimer Wheeler",
            "C11H04-Q268": "Eight",
            "C11H04-Q286": "Twenty",
            "C11H04-Q274": "Kharosthi",
        }
        for key, answer in expected.items():
            q = indexed[key]
            self.assertEqual(q["opts_en"][q["correct"]], answer)
        self.assertIn("1913 and 1934", indexed["C11H04-Q262"]["exp_en"])
        self.assertIn("twenty silver sigloi", indexed["C11H04-Q286"]["exp_en"])

    def test_history_unit_four_quiz_six_sources_geography_and_tamil(self):
        data = json.loads(source("data/textbook/class-11/history/unit-04.json"))
        self.assertEqual(len(data["questions"]), 394)
        self.assertEqual(len(data["meta"]["quiz_sets"]), 20)
        sixth = data["questions"][100:120]
        self.assertEqual(len(sixth), 20)
        self.assertEqual(sixth[0]["id"], "C11H04-Q307")
        self.assertEqual(sixth[-1]["id"], "C11H04-Q364")
        keys = {q["id"]: q for q in sixth}
        for q in sixth:
            self.assertTrue(q["q_en"].endswith("?"))
            self.assertTrue(q["q_ta"].endswith("?"))
            self.assertNotIn("What is the correct textbook answer for", q["q_en"])
            self.assertEqual(len(q["opts_en"]), 4)
            self.assertEqual(len(q["opts_ta"]), 4)
            self.assertEqual(len(set(q["opts_en"])), 4)
            self.assertEqual(len(set(q["opts_ta"])), 4)
            self.assertIn(q["correct"], range(4))
            self.assertGreaterEqual(len(q["exp_en"]), 95)
            self.assertGreaterEqual(len(q["exp_ta"]), 65)
        expected = {
            "C11H04-Q310": "Avesta",
            "C11H04-Q319": "14th century BCE (about 1380 BCE)",
            "C11H04-Q346": "Darius I",
            "C11H04-Q352": "Indos (Indus)",
            "C11H04-Q355": "326 BCE",
            "C11H04-Q361": "Porus",
        }
        for key, answer in expected.items():
            q = keys[key]
            self.assertEqual(q["opts_en"][q["correct"]], answer)
        self.assertIn("Jhelum and Chenab", keys["C11H04-Q361"]["exp_en"])
        self.assertIn("DPe", keys["C11H04-Q346"]["exp_en"])

    def test_text_archive_latest_button_follows_edition_index(self):
        html = source("current-affairs/text/index.html")
        self.assertIn('id="latestTextEdition"', html)
        self.assertIn("link.href=latest.file", html)


if __name__ == "__main__":
    unittest.main()
