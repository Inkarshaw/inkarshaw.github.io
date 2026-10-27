"""Regression tests for GitHub Pages archive verification and shared-bank quiz sync."""
import csv
import subprocess
import sys
import tempfile
import textwrap
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEALTH = ROOT / ".github/workflows/site-health.yml"
SYNC = ROOT / ".github/workflows/sync-daily-quiz-fallback.yml"
FALLBACK = ROOT / "data/quizzes/daily-quiz.csv"


def workflow_python():
    text = SYNC.read_text(encoding="utf-8")
    marker = '''python3 - "$tmp" "data/quizzes/daily-quiz.csv" "$tmp.merged" > "$tmp.report" <<'PY' '''
    # YAML stores the embedded command without the trailing space.
    marker = marker.rstrip()
    assert marker in text, "Embedded sync code not found"
    embedded = text.split(marker, 1)[1].split("\n          PY", 1)[0]
    return textwrap.dedent(embedded).strip() + "\n"


class WorkflowRepairTests(unittest.TestCase):
    def test_current_affairs_html_generated_before_link_verification(self):
        workflow = HEALTH.read_text(encoding="utf-8")
        generation = workflow.index("name: Generate current-affairs HTML before link validation")
        check = workflow.index("name: Validate core exam-site internal links")
        self.assertLess(generation, check)
        self.assertIn("python3 current-affairs/text/build_text_editions.py", workflow[generation:check])

    def test_daily_sync_preserves_shared_bank_when_sheet_is_empty(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "sheet.csv"
            merged = Path(tmp) / "merged.csv"
            with FALLBACK.open(encoding="utf-8", newline="") as stream:
                reader = csv.DictReader(stream)
                fields = reader.fieldnames
                original = list(reader)
            self.assertIn("UPSC/TNPSC", {r["Exam"] for r in original})
            with source.open("w", encoding="utf-8", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=fields)
                writer.writeheader()
            process = subprocess.run(
                [sys.executable, "-c", workflow_python(), str(source), str(FALLBACK), str(merged)],
                capture_output=True, text=True, check=False,
            )
            self.assertEqual(process.returncode, 0, process.stderr)
            with merged.open(encoding="utf-8", newline="") as stream:
                bank = list(csv.DictReader(stream))
            counts = Counter(row["Exam"] for row in bank)
            self.assertGreaterEqual(counts["UPSC/TNPSC"], 10)
            self.assertNotIn("TNPSC Group IV", counts)
            for exam in ("TNUSRB", "UPSC", "SSC", "Banking", "Railways"):
                self.assertGreaterEqual(counts[exam], 10)

    def test_sparse_shared_sheet_never_replaces_complete_fallback(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "sheet.csv"
            merged = Path(tmp) / "merged.csv"
            with FALLBACK.open(encoding="utf-8", newline="") as stream:
                reader = csv.DictReader(stream)
                fields = reader.fieldnames
                rows = [r for r in reader if r["Exam"] == "UPSC/TNPSC"][:2]
            with source.open("w", encoding="utf-8", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)
            process = subprocess.run(
                [sys.executable, "-c", workflow_python(), str(source), str(FALLBACK), str(merged)],
                capture_output=True, text=True, check=False,
            )
            self.assertEqual(process.returncode, 0, process.stderr)
            with merged.open(encoding="utf-8", newline="") as stream:
                counts = Counter(row["Exam"] for row in csv.DictReader(stream))
            self.assertGreaterEqual(counts["UPSC/TNPSC"], 10)


if __name__ == "__main__":
    unittest.main()
