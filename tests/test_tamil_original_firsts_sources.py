#!/usr/bin/env python3
"""Tamil lexical scan safety: a match is a candidate, never a certified answer."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from check_tamil_firsts_sources import TARGETS, match_hints

class TamilOriginalFirstsSourceTests(unittest.TestCase):
    def test_tamil_phrase_boundaries_and_short_excerpt(self):
        matches = match_hints("அத்தியாயம். 1935இல் முதல் ஆளுநர் ஆஸ்போர்ன் ஸ்மித் ஆவார். "
                              "பின்னர் பொருளாதாரம்.", ["ஆஸ்போர்ன்", "இல்லாததொரு பெயர்"])
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["term"], "ஆஸ்போர்ன்")
        self.assertLessEqual(len(matches[0]["context_excerpt"]), 112)

    def test_targets_are_the_five_class12_economics_ids(self):
        self.assertEqual({x["quiz_id"] for x in TARGETS["c12-economics-2024-tamil"]},
                         {f"F{i}" for i in range(144, 149)})
        for record in TARGETS["c12-economics-2024-tamil"]:
            self.assertGreaterEqual(len(record["tamil_hints"]), 2)

    def test_citations_are_not_prematurely_certified(self):
        m = json.loads((ROOT/"data/textbook/original-pdf-source-manifest.json").read_text(encoding="utf8"))
        v = next(x for x in m["volumes"] if x["id"] == "c12-economics-2024-tamil")
        self.assertEqual(v["tamil_pdf_review"], "text-extracted")
        self.assertFalse(v["tamil_pdf_text_scan"]["all_book_pages_visually_verified"])
        self.assertFalse(v["tamil_pdf_text_scan"]["all_target_claims_manually_verified"])
        self.assertNotEqual(v["chapter_coverage"], "certified")
        self.assertTrue(v["tamil_url"].endswith(".pdf"))


    def test_saved_source_evidence_keeps_partial_fact_scope(self):
        evidence = json.loads((ROOT / "data/textbook/original-tamil-firsts-evidence-class12-economics-2024.json").read_text(encoding="utf8"))
        self.assertEqual(evidence["total_pdf_pages"], 336)
        self.assertEqual(evidence["pages_with_substantial_tamil_codepoints"], 335)
        self.assertEqual(evidence["original_tamil_fact_claims_certified"], 0)
        self.assertFalse(evidence["whole_original_book_fact_review_completed"])
        self.assertFalse(evidence["tamil_to_english_edition_page_alignment_completed"])
        self.assertEqual({r["quiz_id"] for r in evidence["targets"]}, {f"F{i}" for i in range(144, 149)})
        for entry in evidence["targets"]:
            self.assertTrue(entry["do_not_upgrade_quiz_certification"])
        names_only = next(x for x in evidence["targets"] if x["quiz_id"] == "F144")
        self.assertIn("not_1969_prize", names_only["visual_excerpt_status"])
        visual = evidence["small_visual_excerpt_review"]
        self.assertFalse(visual["complete_page_visual_review"])
        self.assertEqual(len(visual["images_reviewed"]), 5)
        self.assertEqual(set(evidence["selected_tamil_excerpt_core_fact_corroborations"]),
                         {"F145", "F146", "F147", "F148"})

if __name__ == "__main__":
    unittest.main()
