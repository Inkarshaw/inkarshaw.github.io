"""Regression checks for the only canonical ClearExams Pages publication route."""
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
with patch.dict(os.environ, {"WEBSITE_BRIDGE_URL": "https://bridge.example.invalid"}):
    import website_queue_runner as queue


class Response(io.BytesIO):
    def getcode(self):
        return 200


class CurrentAffairsDeliveryTests(unittest.TestCase):
    def test_queue_hands_off_to_main_pages_deploy_without_racing(self):
        publisher = (ROOT / ".github/workflows/website-queue-publisher.yml").read_text()
        pages = (ROOT / ".github/workflows/jekyll-gh-pages.yml").read_text()
        self.assertIn('scripts/website_queue_runner.py prepare', publisher)
        self.assertIn('scripts/website_queue_runner.py finalize', publisher)
        self.assertIn('scripts/website_queue_runner.py fail-pending', publisher)
        self.assertNotIn('actions/deploy-pages@', publisher)
        self.assertNotIn('actions/jekyll-build-pages@', publisher)
        self.assertIn('actions/deploy-pages@', pages)
        self.assertIn('branches: ["main"]', pages)
        self.assertIn('GitHub Pages workflow', publisher)

    def test_queue_without_jobs_reports_not_published(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            summary = path / "summary.md"
            manifest = path / "manifest.json"

            def bridge(endpoint, *args, **kwargs):
                return {"jobs": []} if endpoint == "/jobs" else {"ok": True}

            with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": str(summary)}), \
                    patch.object(queue, "request", side_effect=bridge), \
                    patch.object(queue, "write_output") as write_output:
                queue.prepare(manifest)

            self.assertEqual(json.loads(manifest.read_text()), [])
            contents = summary.read_text()
            self.assertIn("no publication was attempted", contents)
            self.assertIn("No READY jobs", contents)
            self.assertIn("\n", contents)
            write_output.assert_any_call("has_jobs", "false")

    def test_text_source_claim_needs_checksum(self):
        job = {"action": "PUBLISH_URL",
               "targetPath": "current-affairs/text/data/2026-11-02.json",
               "notes": ""}
        with self.assertRaisesRegex(ValueError, "sha256"):
            queue.ca_publication_details(job)
        job["notes"] = "sha256=" + "f" * 64 + "; edition=2026-11-02"
        details = queue.ca_publication_details(job)
        self.assertTrue(details["textEdition"])
        self.assertEqual(details["editionDate"], "2026-11-02")

    def test_text_finalization_acknowledges_only_checked_live_article(self):
        checksum = "abc" * 21 + "a"
        edition = "2026-11-02"
        job = {"jobId": "CATEXT-2026-11-02", "token": "token",
               "url": "https://clearexams.ink/current-affairs/text/2026-11-02.html",
               "commitSha": "commit",
               "expectedSha256": checksum,
               "editionDate": edition,
               "textEdition": True}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            path.write_text(json.dumps([job]))
            with patch.object(queue, "verify_live_text", side_effect=[RuntimeError("old"), None]) as verify, \
                    patch.object(queue, "request") as bridge, \
                    patch.object(queue.time, "sleep") as sleeper:
                queue.finalize(path)
            self.assertEqual(verify.call_count, 2)
            self.assertEqual(bridge.call_args.args[0], "/complete")
            self.assertEqual(json.loads(path.read_text()), [])
            sleeper.assert_called_once_with(8)

    def test_text_live_mismatch_is_never_acknowledged(self):
        edition = "2026-11-02"
        checksum = "a" * 64
        html = b"<!doctype html><html><body>Daily Current Affairs - 2026-11-02</body></html>"
        wrong_bytes = b'{"date":"2026-11-02","stories":[]}'
        catalog = json.dumps([{"date":edition,"file":edition+".html"}]).encode()

        def urlopen(request, **kwargs):
            url = request.full_url
            return Response(catalog if url.endswith("/editions.json") else (
                wrong_bytes if url.endswith("/2026-11-02.json") else html))

        with patch.object(queue.urllib.request, "urlopen", side_effect=urlopen):
            with self.assertRaisesRegex(RuntimeError, "does not match"):
                queue.verify_live_text(
                    "https://clearexams.ink/current-affairs/text/2026-11-02.html",
                    edition, checksum
                )


if __name__ == "__main__":
    unittest.main()
