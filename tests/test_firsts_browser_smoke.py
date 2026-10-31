#!/usr/bin/env python3
"""Real Chromium exercise of the Firsts player, including mobile and Tamil mode."""
import functools
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@unittest.skipIf(sync_playwright is None, "Install playwright for actual browser certification")
class FirstsBrowserSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(QuietHandler, directory=str(ROOT))
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 390, "height": 844})
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda err: self.errors.append(str(err)))
        self.page.goto(self.base + "/textbook-firsts.html", wait_until="networkidle")
        self.page.locator("#quiz:not(.hidden)").wait_for(timeout=15000)

    def tearDown(self):
        self.assertFalse(self.errors, "JavaScript errors: " + " | ".join(self.errors))
        self.context.close()

    def test_answer_skip_results_retry_tamil_and_restore(self):
        page = self.page
        self.assertEqual(page.locator("#set").input_value(), "1")
        self.assertIn("of 20", page.locator("#badge").inner_text())
        self.assertEqual(page.locator("#options .option").count(), 4)

        # F001 has answer A. Check and advance.
        page.locator("#options .option").nth(0).click()
        page.locator("#next").click()
        self.assertIn("Vijaya Lakshmi Pandit", page.locator("#feedback").inner_text())
        page.locator("#next").click()
        self.assertIn("Question 2 of 20", page.locator("#badge").inner_text())

        # Jump to last question and finish with the remaining 19 unanswered.
        page.locator("#palette button").nth(19).click()
        page.locator("#skip").click()
        page.locator("#result:not(.hidden)").wait_for()
        self.assertEqual(page.locator("#right").inner_text(), "1")
        self.assertEqual(page.locator("#wrong").inner_text(), "0")
        self.assertEqual(page.locator("#unanswered").inner_text(), "19")
        self.assertEqual(page.locator("#accuracy").inner_text(), "5%")

        page.locator("#retryWrong").click()
        self.assertIn("of 19", page.locator("#badge").inner_text())
        page.locator("#ta").click()
        self.assertEqual(page.locator("html").get_attribute("lang"), "ta")
        self.assertIn("வினா", page.locator("#badge").inner_text())
        page.reload(wait_until="networkidle")
        page.locator("#quiz:not(.hidden)").wait_for()
        self.assertIn("19", page.locator("#badge").inner_text())

    def test_topic_class_filters_and_all_mode(self):
        page = self.page
        page.locator("#topic").select_option("women")
        page.locator("#classFilter").select_option("7")
        page.locator("#load").click()
        self.assertIn("of 20", page.locator("#badge").inner_text())
        page.locator("#set").select_option("all")
        page.locator("#load").click()
        self.assertIn("of 23", page.locator("#badge").inner_text())
        # The mobile page should not introduce sideways document scrolling.
        dimensions = page.evaluate("({scroll:document.documentElement.scrollWidth, width:innerWidth})")
        self.assertLessEqual(dimensions["scroll"], dimensions["width"] + 2)


if __name__ == "__main__":
    unittest.main()
