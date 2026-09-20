"""Regression checks for stale Drive uploads and current-affairs archive dates."""

import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from current_affairs_pdf import edition_date, publish_pdf
import process_website_job

spec = importlib.util.spec_from_file_location("pdf_list", ROOT / "current-affairs/generate-pdf-list.py")
pdf_list = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pdf_list)


class PublishingTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.archive = self.root / "current-affairs"
        self.archive.mkdir()
        self.source = self.root / "download.pdf"
        self.source.write_bytes(b"%PDF-1.4\nEdition 19 September\n%%EOF")

    def test_old_pdf_cannot_be_republished_as_next_day(self):
        original = publish_pdf(self.source, "2026-09-19", self.archive)
        before = original.read_bytes()
        with self.assertRaisesRegex(ValueError, "same PDF as 2026-09-19.pdf"):
            publish_pdf(self.source, "2026-09-20", self.archive)
        self.assertEqual(original.read_bytes(), before)
        self.assertFalse((self.archive / "2026-09-20.pdf").exists())

    def test_delayed_upload_keeps_explicit_edition_date(self):
        result = publish_pdf(self.source, "2026-09-19", self.archive)
        self.assertEqual(result.name, "2026-09-19.pdf")

    def test_published_pdf_remains_readable_after_static_site_copy(self):
        self.source.chmod(0o600)
        result = publish_pdf(self.source, "2026-09-19", self.archive)
        built = self.root / "built.pdf"
        shutil.copy2(result, built)
        # The Jekyll container and Pages artifact uploader use different users.
        self.assertEqual(built.stat().st_mode & 0o444, 0o444)
        self.assertEqual(built.stat().st_mode & 0o022, 0)
        self.assertEqual(built.read_bytes(), self.source.read_bytes())
        self.assertEqual(self.source.stat().st_mode & 0o777, 0o600)

    def test_same_day_retry_and_corrected_edition_are_allowed(self):
        result = publish_pdf(self.source, "2026-09-19", self.archive)
        publish_pdf(self.source, "2026-09-19", self.archive)
        self.source.write_bytes(b"%PDF-1.4\nCorrected edition 19 September\n%%EOF")
        publish_pdf(self.source, "2026-09-19", self.archive)
        self.assertEqual(result.read_bytes(), self.source.read_bytes())

    def test_distinct_next_day_pdf_is_allowed(self):
        publish_pdf(self.source, "2026-09-19", self.archive)
        self.source.write_bytes(b"%PDF-1.4\nEdition 20 September\n%%EOF")
        publish_pdf(self.source, "2026-09-20", self.archive)
        self.assertEqual([entry["date"] for entry in pdf_list.build_manifest(self.archive)],
                         ["2026-09-20", "2026-09-19"])

    def test_invalid_download_does_not_replace_existing_issue(self):
        target = publish_pdf(self.source, "2026-09-19", self.archive)
        before = target.read_bytes()
        self.source.write_text("<html>Sign in to Google Drive</html>")
        with self.assertRaisesRegex(ValueError, "Not a PDF"):
            publish_pdf(self.source, "2026-09-19", self.archive)
        self.assertEqual(target.read_bytes(), before)

    def test_missing_and_invalid_dates_are_rejected(self):
        for value in ("", "20260919", "2026-9-19", "2026-02-30", "2026-09-19/../20"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                edition_date(value)
        result = subprocess.run([sys.executable, str(ROOT / "scripts/current_affairs_pdf.py"),
                                 "--source", str(self.source)], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("--date", result.stderr)

    def test_manifest_hides_relabelled_copies_and_preserves_both_languages(self):
        # Create the newer file first to ensure directory ordering cannot change the result.
        (self.archive / "2026-09-20.pdf").write_bytes(self.source.read_bytes())
        (self.archive / "2026-09-19.pdf").write_bytes(self.source.read_bytes())
        entries = pdf_list.build_manifest(self.archive)
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["file"], "2026-09-19.pdf")
        self.assertIn("19 September 2026", entries[0]["title_en"])
        self.assertIn("19 செப்டம்பர் 2026", entries[0]["title_ta"])

    def test_website_queue_rejects_duplicate_without_leaving_target(self):
        publish_pdf(self.source, "2026-09-19", self.archive)
        def download(_url, target):
            target.write_bytes(self.source.read_bytes())
        with patch.object(process_website_job, "ROOT", self.root), \
             patch.object(process_website_job, "download", side_effect=download), \
             patch.object(process_website_job, "rebuild_ca_index") as rebuild, \
             patch.object(sys, "argv", ["process_website_job.py", "--action", "PUBLISH_URL",
                                        "--source", "https://example.com/old.pdf",
                                        "--target", "current-affairs/2026-09-20.pdf"]):
            with self.assertRaisesRegex(ValueError, "same PDF"):
                process_website_job.main()
            rebuild.assert_not_called()
        self.assertFalse((self.archive / "2026-09-20.pdf").exists())


if __name__ == "__main__":
    unittest.main()
