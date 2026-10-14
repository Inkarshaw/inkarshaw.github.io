"""Offline tests for vetted current-affairs text publishing."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "current-affairs" / "text" / "build_text_editions.py"
SPEC = importlib.util.spec_from_file_location("current_affairs_text_builder", SCRIPT)
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


def sample():
    return {
        "date": "2026-10-14", "status": "partial",
        "description": "A reviewed edition of current affairs prepared for competitive examinations.",
        "stories": [
            {
                "category": "National", "title": "Verified first major development",
                "summary": "This is an original summary for testing the renderer. It supplies enough text to confirm the length validation without asserting real-world news.",
                "key_facts": ["One meaningful exam fact for the first story."],
                "exam_link": "A related piece of foundational knowledge is checked here.",
                "source_title": "Government primary source one",
                "source_url": "https://example.org/source-one"
            },
            {
                "category": "Science and Technology", "title": "Verified second major development",
                "summary": "The second sample story is used strictly in offline tests. This text confirms the HTML publisher can distinguish multiple original items.",
                "key_facts": ["A second meaningful exam fact is supplied."],
                "exam_link": "A linked foundational concept is highlighted for practice.",
                "source_title": "Government primary source two",
                "source_url": "https://example.org/source-two"
            }
        ],
        "mcqs": [
            {
                "question": "Which option is supported by the first sample story?",
                "options": ["First", "Second", "Third", "Fourth"],
                "answer_index": 0, "explanation": "This fabricated example exercises four-option display."
            },
            {
                "question": "Which option is correct for the second sample story?",
                "options": ["East", "West", "North", "South"],
                "answer_index": 2, "explanation": "The example selects the third option for rendering."
            }
        ]
    }


class CurrentAffairsTextTests(unittest.TestCase):
    def test_good_date_scoped_json_passes(self):
        edition = sample()
        self.assertIs(BUILDER.validate(edition, "2026-10-14"), edition)

    def test_mismatched_file_date_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "date"):
            BUILDER.validate(sample(), "2026-10-13")

    def test_future_edition_rejected(self):
        edition = sample()
        edition["date"] = "2099-12-31"
        with self.assertRaisesRegex(ValueError, "Future"):
            BUILDER.validate(edition, "2099-12-31")

    def test_no_unlinked_content(self):
        edition = sample()
        edition["stories"][0]["source_url"] = "http://example.org/news"
        with self.assertRaisesRegex(ValueError, "HTTPS"):
            BUILDER.validate(edition, "2026-10-14")

    def test_duplicate_options_rejected(self):
        edition = sample()
        edition["mcqs"][0]["options"] = ["Same", "Same", "Third", "Fourth"]
        with self.assertRaisesRegex(ValueError, "four distinct"):
            BUILDER.validate(edition, "2026-10-14")

    def test_escaped_summary_and_correct_mcq(self):
        edition = sample()
        edition["stories"][0]["summary"] += ' A harmless <script>alert("x")</script> test.'
        content = BUILDER.render(BUILDER.validate(edition, "2026-10-14"))
        self.assertNotIn('<script>alert("x")</script>', content)
        self.assertIn("&lt;script&gt;", content)
        self.assertIn("C. North", content)
        self.assertIn("2026-10-14", content)

    def test_template_remains_outside_data(self):
        self.assertFalse((BUILDER.DATA / "editorial-template.json").exists())


if __name__ == "__main__":
    unittest.main()
