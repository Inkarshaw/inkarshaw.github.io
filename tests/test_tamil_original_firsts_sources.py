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
        self.assertEqual(v["tamil_pdf_review"], "not-started")
        self.assertNotEqual(v["chapter_coverage"], "certified")
        self.assertTrue(v["tamil_url"].endswith(".pdf"))

if __name__ == "__main__":
    unittest.main()
