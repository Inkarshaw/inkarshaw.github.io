"""Check that automatic CA publishing never reports a stale PDF as published."""

import hashlib
import io
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
with patch.dict(os.environ, {"WEBSITE_BRIDGE_URL": "https://example.invalid"}):
    import website_queue_runner as runner


class Response(io.BytesIO):
    def getcode(self):
        return 200


class QueuePublicationTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.manifest = Path(temp.name) / "jobs.json"
        self.pdf = b"%PDF-1.4\nEdition 20 September 2026\n%%EOF"
        self.digest = hashlib.sha256(self.pdf).hexdigest()
        self.job = {
            "jobId": "CA-2026-09-20", "action": "PUBLISH_URL",
            "source": "https://drive.google.com/file/d/example/view",
            "targetPath": "current-affairs/2026-09-20.pdf",
            "notes": f"pages=6; sha256={self.digest}", "token": "test-token",
        }

    def bridge(self, path, *args, **kwargs):
        return {"jobs": [self.job]} if path == "/jobs" else {"ok": True}

    def test_missing_checksum_fails_before_downloading(self):
        self.job["notes"] = "Six pages"
        with patch.object(runner, "request", side_effect=self.bridge) as bridge, \
             patch.object(runner, "run") as run, patch.object(runner, "write_output"):
            runner.prepare(self.manifest)
        run.assert_not_called()
        self.assertEqual(json.loads(self.manifest.read_text()), [])
        self.assertIn("/fail", [call.args[0] for call in bridge.call_args_list])

    def test_preparation_passes_and_retains_the_verified_digest(self):
        with patch.object(runner, "request", side_effect=self.bridge), \
             patch.object(runner, "run") as run, \
             patch.object(runner, "git_commit", return_value="commit"), \
             patch.object(runner, "write_output"):
            runner.prepare(self.manifest)
        command = run.call_args.args[0]
        self.assertEqual(command[command.index("--expected-sha256") + 1], self.digest)
        item = json.loads(self.manifest.read_text())[0]
        self.assertEqual(item["expectedSha256"], self.digest)
        self.assertEqual(item["editionDate"], "2026-09-20")

    def write_manifest(self):
        self.manifest.write_text(json.dumps([{
            "jobId": self.job["jobId"], "token": "test-token",
            "url": runner.derive_url(self.job), "commitSha": "commit",
            "expectedSha256": self.digest, "editionDate": "2026-09-20",
        }]))

    def test_http_200_with_stale_pdf_is_not_marked_published(self):
        self.write_manifest()
        with patch.object(runner.urllib.request, "urlopen", side_effect=lambda *a, **k: Response(b"%PDF-1.4 old edition")), \
             patch.object(runner.time, "sleep"), patch.object(runner, "request") as bridge:
            with self.assertRaises(SystemExit):
                runner.finalize(self.manifest)
        self.assertEqual([call.args[0] for call in bridge.call_args_list], ["/fail"])
        self.assertEqual(json.loads(self.manifest.read_text()), [])

    def test_missing_index_entry_is_not_marked_published(self):
        self.write_manifest()
        def fetch(req, **kwargs):
            return Response(b"[]" if req.full_url.endswith("pdfs.json") else self.pdf)
        with patch.object(runner.urllib.request, "urlopen", side_effect=fetch), \
             patch.object(runner.time, "sleep"), patch.object(runner, "request") as bridge:
            with self.assertRaises(SystemExit):
                runner.finalize(self.manifest)
        self.assertEqual([call.args[0] for call in bridge.call_args_list], ["/fail"])

    def test_matching_pdf_and_index_are_marked_published(self):
        self.write_manifest()
        index = json.dumps([{"date": "2026-09-20", "file": "2026-09-20.pdf"}]).encode()
        def fetch(req, **kwargs):
            return Response(index if req.full_url.endswith("pdfs.json") else self.pdf)
        with patch.object(runner.urllib.request, "urlopen", side_effect=fetch), \
             patch.object(runner, "request") as bridge:
            runner.finalize(self.manifest)
        self.assertEqual([call.args[0] for call in bridge.call_args_list], ["/complete"])
        self.assertEqual(json.loads(self.manifest.read_text()), [])


if __name__ == "__main__":
    unittest.main()
