/* Real Chromium smoke test: public ClearExams student journeys on a 390px phone. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.CLEAREXAMS_TEST_ORIGIN || 'http://127.0.0.1:8765';
const paths = [
  ['start.html', 'Your complete preparation path.'],
  ['practice.html', 'Choose. Practise. Improve.'],
  ['textbook-quiz.html', 'TN School Book Quiz'],
  ['ncert-school-book-quiz.html', 'NCERT School Book Quiz'],
  ['dashboard.html', 'Study dashboard'],
  ['pyq-hub.html', 'Previous Year Questions']
];

const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,locale:'en-IN'});
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(String(error.message)));
try {
  for (const [path, heading] of paths) {
    pageErrors.length = 0;
    const response = await page.goto(origin + '/' + path, {waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response?.status(), 200, path + ': HTTP response');
    await page.locator('h1').first().waitFor({state:'visible',timeout:15000});
    assert.ok((await page.locator('h1').first().innerText()).includes(heading), path + ': heading');
    const menu = page.locator('.ce-mobile-menu');
    assert.equal(await menu.count(), 1, path + ': mobile menu exists');
    await menu.locator('summary').click();
    assert.equal(await menu.getAttribute('open'), '', path + ': menu opened');
    const panel = menu.locator('.ce-mobile-panel');
    assert.equal(await panel.isVisible(), true, path + ': mobile navigation visible');
    assert.equal(await panel.locator('a').count(), 9, path + ': all student destinations');
    assert.ok(await panel.locator('a[href="daily-quiz.html"]').isVisible(), path + ': daily quiz accessible');
    await menu.locator('summary').click();
    assert.equal(await panel.isVisible(), false, path + ': mobile menu collapses');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 3, path + ': horizontal overflow ' + overflow + 'px');
    assert.deepEqual(pageErrors, [], path + ': runtime JavaScript errors');
    console.log('PASS mobile navigation: ' + path);
  }

  pageErrors.length = 0;
  await page.goto(origin + '/', {waitUntil:'domcontentloaded'});
  const homeMenu = page.locator('#menuBtn');
  assert.equal(await homeMenu.getAttribute('aria-expanded'), 'false');
  await homeMenu.click();
  assert.equal(await homeMenu.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#mobileMenu a[href="daily-quiz.html"]').isVisible(), true, 'homepage daily quiz accessible');
  await page.keyboard.press('Escape');
  assert.equal(await homeMenu.getAttribute('aria-expanded'), 'false');
  assert.deepEqual(pageErrors, [], 'homepage: runtime errors');
  console.log('PASS homepage menu accessibility');

  pageErrors.length = 0;
  await page.goto(origin + '/daily-quiz.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => {
    const select = document.querySelector('#examSelect');
    return select && select.options.length > 1;
  }, undefined, {timeout:20000});
  assert.notEqual(await page.locator('#examSelect').inputValue(), 'Unavailable');
  assert.deepEqual(pageErrors, [], 'daily quiz: runtime errors');
  console.log('PASS daily quiz active question bank loaded');

  pageErrors.length = 0;
  await page.goto(origin + '/ncert-school-book-quiz.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => {
    const items = document.querySelectorAll('#setGrid > *');
    return items.length > 0;
  }, undefined, {timeout:20000});
  assert.deepEqual(pageErrors, [], 'NCERT: runtime errors');
  console.log('PASS NCERT quiz catalog loaded');
} finally {
  await browser.close();
}
