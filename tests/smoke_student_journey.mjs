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
    assert.equal(await panel.locator('a').count(), path==='ncert-school-book-quiz.html'?10:9, path + ': all student destinations');
    if(path==='ncert-school-book-quiz.html') assert.equal(await panel.locator('a[href="quiz-coverage.html"]').count(),1,'NCERT: coverage tracker accessible');
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

  // PYQ streamlined journey: one-tap deep link, option selection, navigation and resume.
  pageErrors.length = 0;
  await page.goto(origin + '/pyq-hub.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => document.querySelectorAll('#pyqItems .pyq-card').length===12,undefined,{timeout:20000});
  assert.equal(await page.locator('.pyq-start-card').count(),3,'PYQ hub offers three clear paths');
  assert.equal(await page.locator('#showMorePapers').isVisible(),true,'PYQ catalog is paginated');
  await page.locator('#showMorePapers').click();
  assert.equal(await page.locator('#pyqItems .pyq-card').count(),24,'PYQ archive expands on request');
  const hubOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(hubOverflow<=3,'PYQ hub mobile overflow '+hubOverflow+'px');
  await page.goto(origin+'/pyq-full-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => document.querySelector('#examSelect')?.options.length>1,undefined,{timeout:20000});
  assert.equal(await page.locator('#examSelect').inputValue(),'TNPSC Group IV','Group IV default examination');
  assert.equal(await page.locator('#yearSelect').inputValue(),'2024','2024 default year');
  assert.equal(await page.locator('#modeSelect').inputValue(),'practice','Practice default mode');
  assert.match(await page.locator('#coverageNote').innerText(),/30 adapted source-attributed questions.*200-question/);
  assert.match(await page.locator('#coverageNote').innerText(),/not verbatim original questions/i);
  await page.goto(origin+'/pyq-full-quiz.html?exam=TNPSC%20Group%20IV&year=2024&count=10&start=1',{waitUntil:'domcontentloaded'});
  await page.locator('#quizView').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('#options button').count(),4,'PYQ quiz has four answer choices');
  assert.match(await page.locator('#quizTitle').innerText(),/TNPSC Group IV.*2024.*10 questions/);
  await page.locator('#options button').first().click();
  assert.match(await page.locator('#progressText').innerText(),/1 of 10 answered/);
  assert.equal(await page.locator('#options button').first().getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#answerFeedback').isVisible(),false,'Practice feedback withheld until checked');
  assert.equal(await page.locator('#checkBtn').isEnabled(),true,'Check answer enabled after selection');
  await page.locator('#checkBtn').click();
  assert.equal(await page.locator('#answerFeedback').isVisible(),true,'Practice explanation appears immediately');
  assert.match(await page.locator('#answerFeedback').innerText(),/Correct: [ABCD]/);
  assert.match(await page.locator('#answerFeedback').innerText(),/Explanation:/);
  assert.match(await page.locator('#answerFeedback').innerText(),/Answer verification:/);
  assert.equal(await page.locator('#answerFeedback a').count(),2,'Original paper and official answer key links');
  assert.equal(await page.locator('#options button').first().isDisabled(),true,'Checked choices are locked');
  await page.locator('#nextBtn').click();
  assert.match(await page.locator('#questionNumber').innerText(),/Question 2 of 10/);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#quizView').waitFor({state:'visible',timeout:20000});
  assert.match(await page.locator('#questionNumber').innerText(),/Question 2 of 10/);
  await page.locator('#prevBtn').click();
  assert.equal(await page.locator('#options button.selected').count(),1,'PYQ answer remains selected after resume');
  assert.equal(await page.locator('#answerFeedback').isVisible(),true,'Checked answer and explanation survive reload');
  assert.equal(await page.locator('#checkBtn').isVisible(),false,'Checked question cannot be re-checked');
  const quizOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(quizOverflow<=3,'PYQ quiz mobile overflow '+quizOverflow+'px');
  assert.deepEqual(pageErrors,[],'PYQ quiz: no runtime errors');
  console.log('PASS PYQ mobile journey: Group IV 2024 practice defaults, instant explanations, source links and resume');
  await page.goto(origin+'/pyq-full-quiz.html?exam=TNPSC%20Group%20IV&year=2024&mode=exam&count=10&start=1',{waitUntil:'domcontentloaded'});
  await page.locator('#quizView').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('#checkBtn').isVisible(),false,'Exam mode does not reveal instant answer feedback');
  await page.locator('#options button').first().click();
  assert.equal(await page.locator('#answerFeedback').isVisible(),false,'Exam answers remain hidden until submission');
  assert.deepEqual(pageErrors,[],'PYQ practice/exam modes have no runtime JavaScript errors');
  console.log('PASS PYQ exam-mode separation: no live feedback');

  // Exact 200-number official paper by year, source-synchronized on mobile.
  pageErrors.length = 0;
  await page.goto(origin+'/pyq-original-paper.html?paper=tnpsc-group-iv-2024-general-tamil-general-studies',{waitUntil:'domcontentloaded'});
  await page.locator('#answerSheet').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('#papers .paper-choice').count(),3,'All 2022/2024/2025 original-paper modes load');
  assert.match(await page.locator('#count').innerText(),/200 original numbered questions/);
  assert.equal(await page.locator('#showBoth').getAttribute('aria-pressed'),'true','Source and answers are combined by default');
  assert.equal(await page.locator('#paperPanel').isVisible(),true,'Official original PDF visible');
  assert.equal(await page.locator('#questionPanel').isVisible(),true,'Interactive original-number response visible');
  assert.equal(await page.locator('#mobileAnswerDock').isVisible(),true,'One-tap A–E dock visible');
  assert.equal(await page.locator('#dockChoices button').count(),5,'Original A–E answer controls including E');
  await page.locator('#dockChoices button').first().click();
  assert.match(await page.locator('#status').innerText(),/1\/200 answered/);
  assert.equal(await page.locator('#dockChoices button').first().getAttribute('aria-pressed'),'true');
  await page.locator('#dockNext').click();
  assert.match(await page.locator('#number').innerText(),/Question 2 of 200/);
  await page.locator('#paletteDetails summary').click();
  await page.locator('#palette button').nth(99).click();
  assert.match(await page.locator('#number').innerText(),/Question 100 of 200/);
  assert.equal(await page.locator('#pdfPage').inputValue(),'28','Question 100 points to its verified PDF source page');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#answerSheet').waitFor({state:'visible',timeout:20000});
  assert.match(await page.locator('#number').innerText(),/Question 100 of 200/);
  assert.match(await page.locator('#status').innerText(),/1\/200 answered/,'Original answer survives reload');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,'Original 200-question phone layout has no overflow');
  await page.goto(origin+'/pyq-original-paper.html?paper=tnpsc-group-iv-2025-general-tamil-general-studies',{waitUntil:'domcontentloaded'});
  await page.locator('#answerSheet').waitFor({state:'visible',timeout:20000});
  assert.match(await page.locator('#examTitle').innerText(),/2025/,'Yearwise 2025 original source not silently excluded');
  assert.match(await page.locator('#count').innerText(),/200 original numbered questions/);
  assert.deepEqual(pageErrors,[],'Original 200-question sessions have no runtime errors');
  console.log('PASS 200 original questions: source PDF, matching numbered responses, save/resume and year switch');

  // Full 2024 Group IV typed PYQ: 200 questions, five choices, original positions and official-key feedback.
  pageErrors.length = 0;
  await page.goto(origin+'/pyq-2024-text-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#startBtn')&&!document.querySelector('#startBtn').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#loadStatus').innerText(),/200\/200 numbered text questions/);
  assert.equal(await page.locator('#mode').inputValue(),'practice','Source-ordered practice mode is default');
  await page.locator('#startBtn').click();
  assert.equal(await page.locator('#quiz').isVisible(),true);
  assert.match(await page.locator('#position').innerText(),/Question 1 \/ 200/);
  assert.match(await page.locator('#stem').innerText(),/வா/,'Tamil original first question has text');
  assert.equal(await page.locator('#options button').count(),5,'Original text questions expose A–E choices');
  await page.locator('#options button').first().click();
  assert.equal(await page.locator('#checkBtn').isEnabled(),true);
  await page.locator('#checkBtn').click();
  assert.match(await page.locator('#feedback').innerText(),/Official final key: A/);
  assert.equal(await page.locator('#options button').first().isDisabled(),true,'Checked answer is locked');
  await page.locator('.palette-wrapper summary').click();
  await page.locator('#palette button').last().click();
  assert.match(await page.locator('#position').innerText(),/Question 200 \/ 200/);
  assert.match(await page.locator('#stem').innerText(),/Sunday/,'Last original question has readable text');
  const sourceHref=await page.locator('#originalPageLink').getAttribute('href');
  assert.match(sourceHref,/#page=91$/,'Original Q200 source PDF page reference');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#startBtn')&&!document.querySelector('#startBtn').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#startBtn').innerText(),/Resume 200-question/);
  await page.locator('#startBtn').click();
  assert.match(await page.locator('#position').innerText(),/Question 200 \/ 200/);
  const firstPaletteClass=await page.locator('#palette button').first().getAttribute('class');
  assert.match(firstPaletteClass,/done/,'First completed question persists');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    'Full text quiz does not horizontally overflow on 390px viewport');
  await page.goto(origin+'/pyq-2024-text-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#startBtn')&&!document.querySelector('#startBtn').disabled,
    undefined,{timeout:20000});
  await page.locator('#mode').selectOption('exam');
  await page.locator('#startBtn').click();
  await page.locator('#options button').first().click();
  assert.equal(await page.locator('#checkBtn').isVisible(),false,'Exam mode keeps answers hidden');
  assert.equal(await page.locator('#feedback').isVisible(),false,'Exam mode offers no instant final-key feedback');
  assert.deepEqual(pageErrors,[],'Full 200-question text quiz has no JS runtime errors');
  console.log('PASS 2024 text quiz: 200 source-order questions, Tamil text, five options, final key, save/resume and exam mode');

  // Local-only original-PYQ staging: no paper text published without review.
  pageErrors.length = 0;
  const digitizeResponse=await page.goto(origin+'/pyq-digitize.html',{waitUntil:'domcontentloaded'});
  assert.equal(digitizeResponse?.status(),200,'PYQ digitizer returns HTTP 200');
  await page.waitForFunction(()=>document.querySelector('#paperSelect')?.options.length===3,undefined,{timeout:20000});
  assert.equal(await page.locator('#totalCount').innerText(),'200','Every original question has its own staged slot');
  assert.equal(await page.locator('#capturedCount').innerText(),'0','Empty draft is never counted as digitized');
  const editorStems=page.locator('#originalFields textarea');
  assert.equal(await editorStems.count(),6,'Tamil stem and original A–E fields');
  await page.locator('#sourcePage').fill('3');
  await page.locator('#visualType').selectOption('no');
  await editorStems.nth(0).fill('LOCAL TEST FIXTURE — NOT EXAM CONTENT');
  for(let i=1;i<=5;i++)await editorStems.nth(i).fill('TEST OPTION '+i);
  assert.equal(await page.locator('#capturedCount').innerText(),'1','One complete local draft counted');
  assert.equal(await page.locator('#reviewedCount').innerText(),'0','Draft cannot self-certify review');
  const savedDraft=await page.evaluate(()=>localStorage.getItem('clearexamsOriginalTranscriptionDraftV1:tnpsc-group-iv-2024-general-tamil-general-studies'));
  assert.ok(savedDraft&&JSON.parse(savedDraft).records['1'].text.ta.includes('LOCAL TEST FIXTURE'),'Local source text persists');
  const pyqOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(pyqOverflow<=3,'PYQ digitizer mobile horizontal overflow '+pyqOverflow+'px');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#capturedCount')?.textContent==='1',undefined,{timeout:20000});
  assert.ok((await page.locator('#originalFields textarea').first().inputValue()).includes('LOCAL TEST FIXTURE'),'Exact draft restores on reload');
  assert.deepEqual(pageErrors,[],'PYQ original digitizer: no runtime JS errors');
  console.log('PASS original PYQ digitizer: 200 local slots, A–E, Tamil, save/resume, no false publish claims');

  pageErrors.length = 0;
  await page.goto(origin + '/ncert-school-book-quiz.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => {
    const items = document.querySelectorAll('#setGrid > *');
    return items.length > 0;
  }, undefined, {timeout:20000});
  assert.deepEqual(pageErrors, [], 'NCERT: runtime errors');
  console.log('PASS NCERT quiz catalog loaded');

  // Live curriculum tracker must render actual indexes, not a static "100%" claim.
  pageErrors.length = 0;
  const coverageResponse = await page.goto(origin + '/quiz-coverage.html', {waitUntil:'domcontentloaded'});
  assert.equal(coverageResponse?.status(), 200, 'Coverage: HTTP response');
  await page.waitForFunction(() => {
    const units=document.querySelector('#unitCount')?.textContent||'';
    const ncert=document.querySelector('#ncertCount')?.textContent||'';
    return units==='288/288' && Number(ncert.replaceAll(',',''))  >=510;
  }, undefined, {timeout:20000});
  await page.waitForFunction(() => document.querySelectorAll('#catalogs > article').length===25 && document.querySelectorAll('#ncert10Chapters > article').length===13, undefined, {timeout:20000});
  assert.equal(await page.locator('#catalogs > article').count(),25,'Coverage: indexed catalog cards');
  assert.equal(await page.locator('#ncert10Chapters > article').count(),13,'NCERT Class 10 chapter inventory');
  assert.match(await page.locator('#ncert10Status').innerText(),/13\/13 chapters/);
  await page.locator('#classSelect').selectOption('6');
  assert.equal(await page.locator('#catalogs > article').count(),6,'Coverage: Class 6 subject/term filter');
  assert.ok((await page.locator('#loading').innerText()).includes('Full curriculum'));
  assert.deepEqual(pageErrors, [], 'Coverage: no runtime JS errors');
  console.log('PASS live SCERT/NCERT coverage tracker');

  // Fathers Quiz: class/book controls, bilingual answer flow, resume, source provenance.
  pageErrors.length = 0;
  const fathersResponse = await page.goto(origin + '/textbook-fathers.html', {
    waitUntil: 'domcontentloaded', timeout: 30000
  });
  assert.equal(fathersResponse?.status(), 200, 'Fathers: HTTP response');
  await page.waitForFunction(() => document.querySelector('#countPill')?.textContent?.includes('84 questions')
    && document.querySelector('#bookFilter')?.options?.length > 30, undefined, {timeout: 20000});
  for (const id of ['topic', 'classFilter', 'bookFilter', 'set']) {
    assert.equal(await page.locator('#' + id).isVisible(), true, 'Fathers filter visible: ' + id);
  }
  await page.locator('#classFilter').selectOption('8');
  await page.locator('#bookFilter').selectOption('8-social-science-full');
  await page.locator('#load').click();
  assert.ok((await page.locator('#badge').innerText()).includes('of 4'),
    'Fathers: 4 Class 8 Social Science questions including the Ripon cross-reference');
  const initialQuestion = await page.locator('#question').innerText();
  assert.equal(await page.locator('#options button').count(), 4, 'Fathers: four answer options');
  await page.locator('#options button').first().click();
  await page.locator('#next').click();
  assert.equal(await page.locator('#feedback').isVisible(), true, 'Fathers: answer feedback');
  const progress = await page.evaluate(() => localStorage.getItem('clearexamsFathersProgressV2'));
  assert.ok(progress && JSON.parse(progress).checked[0], 'Fathers: V2 progress saved');
  await page.reload({waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.querySelector('#feedback')?.classList.contains('show'), undefined, {timeout: 20000});
  assert.equal(await page.locator('#question').innerText(), initialQuestion, 'Fathers: V2 progress resumed after reload');
  await page.locator('#ta').click();
  assert.equal(await page.locator('html').getAttribute('lang'), 'ta', 'Fathers: Tamil UI toggled');
  assert.match(await page.locator('#question').innerText(), /[\u0B80-\u0BFF]/, 'Fathers: Tamil question visible');
  await page.locator('#en').click();
  await page.locator('#classFilter').selectOption('8');
  await page.locator('#bookFilter').selectOption('8-science-term-1');
  await page.locator('#load').click();
  assert.match(await page.locator('#source').innerText(), /printed page unverified/,
    'Fathers: unknown original page is disclosed instead of guessed');
  const fathersOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(fathersOverflow <= 3, 'Fathers mobile horizontal overflow ' + fathersOverflow + 'px');
  assert.deepEqual(pageErrors, [], 'Fathers: no runtime errors');
  console.log('PASS Fathers quiz: filters, Tamil, citations, save/resume and mobile layout');

} finally {
  await browser.close();
}
