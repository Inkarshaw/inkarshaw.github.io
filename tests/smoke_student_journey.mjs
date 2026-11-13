/* Real Chromium smoke test: public ClearExams student journeys on a 390px phone. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const origin = process.env.CLEAREXAMS_TEST_ORIGIN || 'http://127.0.0.1:8765';
const si2015Manifest = JSON.parse(readFileSync(new URL('../data/quizzes/tnusrb-si-2015-open.json', import.meta.url), 'utf8'));
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

  // Commercial editorial audit: transparent scoring, exact ungraded numbers and mobile access.
  pageErrors.length = 0;
  const auditResponse = await page.goto(origin + '/pyq-scoring-review.html', {waitUntil:'domcontentloaded'});
  assert.equal(auditResponse?.status(), 200, 'PYQ scoring review page');
  await page.waitForFunction(() => document.querySelector('#paperSelect')?.options.length === 9,
    undefined, {timeout:20000});
  assert.match(await page.locator('#auditStatus').innerText(), /Audit loaded: 8 papers/);
  assert.match(await page.locator('#selectedDetails').innerText(), /Q1–Q200/,'Group I key mapping not falsely scored');
  await page.locator('#paperSelect').selectOption('tnusrb-si-2015');
  assert.equal(await page.locator('#selectedDetails li').count(),24,'Exact 2015 source-review positions visible');
  assert.match(await page.locator('#selectedDetails').innerText(),/Q99:/,'2015 original graph review number is visible');
  await page.locator('#paperSelect').selectOption('tnpsc-g4-2022');
  assert.equal(await page.locator('#selectedDetails li').count(),4,'Q19 Tamil numeral text is now repaired; only four official ALL keys remain ungraded');
  assert.doesNotMatch(await page.locator('#selectedDetails').innerText(),/Q19:/,'Repaired Q19 must not remain in dispute queue');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    'Scoring register has no 390px mobile horizontal overflow');
  assert.deepEqual(pageErrors,[], 'PYQ scoring register JavaScript runs without runtime errors');
  console.log('PASS PYQ scoring review: 8 papers, 263 classified exceptions, mobile overflow and exact 2022/2015 numbers');

  // Confirm the newly restored 2022 original-numbered Tamil-digit question in real mobile Chromium.
  pageErrors.length=0;
  await page.goto(origin+'/tnpsc-g4-2022-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,undefined,{timeout:20000});
  assert.match(await page.locator('#sourceStats').innerText(),/0 flagged incomplete · 4 official ALL-key exceptions/);
  await page.locator('#start').click();
  await page.locator('#palette button').filter({hasText:/^19$/}).click();
  assert.match(await page.locator('#questionNo').innerText(),/Question 19 of 200/);
  assert.match(await page.locator('#questionText').innerText(),/௩௬௯/);
  assert.match(await page.locator('#questionText').innerText(),/௮௭௬/);
  assert.match(await page.locator('#questionStatus').innerText(),/Secondary source matched/);
  assert.match(await page.locator('#questionWarning').innerText(),/original TNPSC-hosted printed-page certification is still pending/);
  assert.deepEqual(pageErrors,[],'Restored 2022 Q19 mobile quiz has no JavaScript errors');
  console.log('PASS TNPSC Group IV 2022 Q19: Tamil digit pairs, provisional key disclosure and mobile source caveat');

  // Question-level search: lazy load, bilingual filter, answer/source disclosure and mobile width.
  pageErrors.length = 0;
  await page.goto(origin + '/question-search.html', {waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#results .question').count(),0,'Question banks are lazy until first search');
  await page.locator('#searchButton').click();
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('loaded records'),undefined,{timeout:25000});
  assert.match(await page.locator('#status').innerText(),/426 matching questions from 426 loaded records/);
  assert.equal(await page.locator('#results .question').count(),20,'Question finder paginates initial results');
  await page.locator('#results details').first().locator('summary').click();
  assert.equal(await page.locator('#results details').first().getAttribute('open'),'', 'Source explanation details are operable');
  await page.locator('#language').selectOption('ta');
  assert.ok((await page.locator('#status').innerText()).includes('matching questions'),'Tamil search updates results');
  await page.locator('#collection').selectOption('Fathers');
  assert.match(await page.locator('#status').innerText(),/84 matching questions/,'Fathers collection filter');
  await page.locator('#language').selectOption('both');
  assert.match(await page.locator('#status').innerText(),/84 matching questions/,'Bilingual-only filtering');
  const questionOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(questionOverflow<=3,'Question finder mobile overflow '+questionOverflow+'px');
  assert.deepEqual(pageErrors,[],'Question finder has no JavaScript errors');
  console.log('PASS bilingual, source-linked question finder: 426 records and mobile filters');

  pageErrors.length = 0;
  await page.goto(origin + '/daily-quiz.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => {
    const select = document.querySelector('#examSelect');
    return select && select.options.length > 1;
  }, undefined, {timeout:20000});
  assert.notEqual(await page.locator('#examSelect').inputValue(), 'Unavailable');
  assert.deepEqual(pageErrors, [], 'daily quiz: runtime errors');
  console.log('PASS daily quiz active question bank loaded');

  // The universal typed library must distinguish playable questions from 58 source-only years.
  pageErrors.length=0;
  await page.goto(origin+'/pyq-typed-library.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#dataNotice')?.textContent.includes('loaded'),
    undefined,{timeout:20000});
  assert.match(await page.locator('#stats').innerText(),/67 indexed exam-year sources/);
  assert.match(await page.locator('#stats').innerText(),/160 questions/);
  assert.equal(await page.locator('#showMore').isVisible(),true,'Missing-source cards are paginated');
  await page.locator('#examFilter').selectOption('SSC');
  assert.equal(await page.locator('#cards .card').count(),4,'All four SSC source-only years are discoverable');
  assert.equal(await page.locator('#cards .card .archive-links').count(),4,'SSC archive-only records provide source access instead of invented MCQs');
  await page.locator('#coverageFilter').selectOption('text');
  assert.equal(await page.locator('#cards .card').count(),0,'No fake SSC text quizzes');
  assert.equal(await page.locator('#empty').isVisible(),true,'Absent typed text is clearly identified');
  await page.locator('#examFilter').selectOption('all');
  await page.locator('#coverageFilter').selectOption('all');
  await page.locator('#yearFilter').selectOption('2011');
  assert.ok(await page.locator('#cards a[href="tnpsc-g1-2011-quiz.html"]').isVisible(),'Existing 2011 Group I typed quiz remains accessible');
  await page.locator('#examFilter').selectOption('UPSC');
  await page.locator('#yearFilter').selectOption('2023');
  await page.locator('#coverageFilter').selectOption('adapted');
  assert.equal(await page.locator('#cards a.play').count(),1,'UPSC CSE 2023 adapted text quiz is available');
  const allYearsOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(allYearsOverflow<=3,'All-year PYQ mobile overflow '+allYearsOverflow+'px');
  assert.deepEqual(pageErrors,[],'Universal PYQ text directory has no runtime JS errors');
  console.log('PASS all-year PYQ mobile library: 67 source records, 160 adapted questions, SSC gaps, Group I 2011 and UPSC 2023 links');

  // PYQ streamlined journey: one-tap deep link, option selection, navigation and resume.
  pageErrors.length = 0;
  await page.goto(origin + '/pyq-hub.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => document.querySelectorAll('#pyqItems .pyq-card').length===12,undefined,{timeout:20000});
  assert.ok(await page.locator('.pyq-start-card').count()>=5,'PYQ hub offers at least five featured paths including full 2026 Group I text quiz');
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
  assert.equal(await page.locator('#papers .paper-choice').count(),4,'Group I 2011 and Group IV 2022/2024/2025 original paper modes load');
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

  // Syllabus-first redesign: discover exam → Group I syllabus → topic MCQs → saved responses.
  pageErrors.length=0;
  await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('.ce-track-grid .ce-track').count(),4,'Homepage shows four exam-specific study tracks');
  assert.equal(await page.locator('.ce-track-grid a[href="tnpsc-group1-syllabus.html"]').count(),1);
  await page.goto(origin+'/tnpsc-group1-syllabus.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('#unitList details.unit').length===8,
    undefined,{timeout:20000});
  assert.equal(await page.locator('#unitList .topic').count(),42,'42 searchable official syllabus-topic headings');
  assert.match(await page.locator('#filterStatus').innerText(),/8 units.*42 topics/);
  await page.locator('#topicSearch').fill('Panchayat');
  assert.equal(await page.locator('#unitList .topic').count(),1,'Search filters to specific topic');
  assert.match(await page.locator('#unitList').innerText(),/Panchayat Raj/);
  await page.locator('#clearSearch').click();
  assert.equal(await page.locator('#unitList .topic').count(),42);
  await page.locator('#revision-biology').check();
  assert.match(await page.locator('#doneCount').innerText(),/1 \/ 42/);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('#unitList details.unit').length===8,
    undefined,{timeout:20000});
  assert.equal(await page.locator('#revision-biology').isChecked(),true,'Revision progress persists after reload');
  await page.goto(origin+'/tnpsc-group1-topic-practice.html?topic=biology',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('#questionList .question').length===4,
    undefined,{timeout:20000});
  assert.match(await page.locator('#topicHeading').innerText(),/Life science/);
  assert.equal(await page.locator('#questionList .question').count(),4);
  assert.match(await page.locator('#questionList .question').first().innerText(),/Commensalism/);
  assert.equal(await page.locator('#questionList .question').first().locator('button.option').count(),5);
  await page.locator('#questionList .question').first().locator('button.option').nth(1).click();
  assert.match(await page.locator('#progressSummary').innerText(),/1 of 4 topic questions answered/);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('#questionList .question').length===4,
    undefined,{timeout:20000});
  assert.equal(await page.locator('#questionList .question').first().locator('button.option').nth(1).getAttribute('aria-pressed'),'true',
    'Topic answer survives reload');
  await page.locator('#topicSelect').selectOption('dice-visual');
  assert.match(await page.locator('#topicHeading').innerText(),/Dice and visual reasoning/);
  assert.equal(await page.locator('#questionList .question').count(),2);
  assert.equal(await page.locator('#questionList .warning').count(),2,'Image-dependent Q98 and Q200 show source warnings');
  assert.match(await page.locator('#questionList').innerText(),/Original 2026 · Question 200/i);
  await page.locator('#unansweredOnly').click();
  assert.equal(await page.locator('#questionList .question').count(),2,'Unanswered-only filter includes both unanswered figures');
  await page.locator('#questionList .question').first().locator('button.option').first().click();
  assert.equal(await page.locator('#questionList .question').count(),1,'Answered item disappears in unanswered-only filter');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#resetTopic').click();
  assert.equal(await page.locator('#questionList .question').count(),2,'Reset clears selected topic only');
  assert.match(await page.locator('#progressSummary').innerText(),/0 of 2 topic questions answered/);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    'Topic practice mobile has no horizontal overflow');
  await page.goto(origin+'/pyq-hub.html',{waitUntil:'domcontentloaded'});
  assert.ok(await page.locator('.ce-year-nav .ce-yearlink').count()>=6,'Year navigation supports expanding verified paper catalog');
  assert.deepEqual(pageErrors,[],'Group I syllabus-first path has no JS runtime errors');
  console.log('PASS syllabus-first Group I: 8 units, 42 topics, search, revision saves, four original biology MCQs, figure warnings and topic reset');

  // TNPSC Group I 2026: all 200 user-extracted onscreen questions, with source review and no fabricated scoring.
  pageErrors.length=0;
  await page.goto(origin+'/tnpsc-g1-2026-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('h1').innerText(),/2026 Group I.*200-question text quiz/);
  assert.equal(await page.locator('#sourceIssueList li').count(),2,'Only the two dice diagrams remain source blocked');
  assert.equal(await page.locator('#secondaryReviewList li').count(),5,'Five source-disclosed study-text repairs are visible');
  assert.match(await page.locator('#loadStatus').innerText(),/All 200 numbered questions loaded/);
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Question 1 of 200/i);
  assert.match(await page.locator('#questionText').innerText(),/Commensalism/);
  assert.equal(await page.locator('#options button').count(),5,'A-E answer options preserved');
  await page.locator('#options button').nth(2).click();
  assert.match(await page.locator('#status').innerText(),/1 of 200 answered/);
  assert.match(await page.locator('#selectedFeedback').innerText(),/No correct answer is shown/);
  await page.locator('#paletteDetails summary').click();
  assert.equal(await page.locator('#palette .palette-btn').count(),200);
  await page.locator('#palette .palette-btn').nth(12).click();
  assert.match(await page.locator('#position').innerText(),/Original Question 13 of 200/i);
  assert.match(await page.locator('#secondarySourceNote').innerText(),/Q13 notation\/table restored for study/);
  assert.match(await page.locator('#questionText').innerText(),/1\. Chennimalai/);
  assert.match(await page.locator('#secondarySourceLink').getAttribute('href'),/#page=183$/);
  assert.equal(await page.locator('#sourceWarning').isVisible(),false,'No missing graph is alleged for repaired Q13');
  await page.locator('#options button').nth(4).click();
  await page.locator('#flag').click();
  await page.locator('#palette .palette-btn').nth(199).click();
  assert.match(await page.locator('#position').innerText(),/Original Question 200 of 200/i);
  assert.match(await page.locator('#sourceWarning').innerText(),/dice illustrations/i);
  assert.match(await page.locator('#options button').first().innerText(),/\[Image A\]/,'Missing diagrams are not invented');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    '2026 text quiz fits mobile width without overflow');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#start').innerText(),/Resume 200-question/);
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Question 200 of 200/i);
  assert.match(await page.locator('#status').innerText(),/2 of 200 answered · 1 flagged/);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#finish').click();
  assert.equal(await page.locator('#result').isVisible(),true);
  assert.equal(await page.locator('#answeredTotal').innerText(),'2');
  assert.equal(await page.locator('#blankTotal').innerText(),'198');
  assert.equal(await page.locator('#flagTotal').innerText(),'1');
  await page.locator('#reviewFilter').selectOption('source');
  assert.equal(await page.locator('#reviewList details').count(),2,'The two still-missing dice figures remain reviewable');
  await page.goto(origin+'/tnpsc-g1-2026-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#newAttempt')&&!document.querySelector('#newAttempt').disabled,
    undefined,{timeout:20000});
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#newAttempt').click();
  await page.locator('#mode').selectOption('exam');
  await page.locator('#start').click();
  await page.locator('#options button').last().click();
  assert.match(await page.locator('#selectedFeedback').innerText(),/No correct answer is shown/);
  assert.deepEqual(pageErrors,[],'TNPSC Group I 2026 text question interactions have no runtime errors');
  console.log('PASS TNPSC Group I 2026: 200 study slots, 5 source-labelled text repairs, 2 dice blockers, saved answers and zero unverified grades');

  // Browser-only editorial reconciliation. A locally checked row must never turn on student scoring.
  pageErrors.length=0;
  await page.goto(origin+'/tnpsc-g1-2026-key-review.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#slot')?.options.length===200,
    undefined,{timeout:20000});
  assert.match(await page.locator('#loadStatus').innerText(),/official key mappings remain reviewer-only drafts/);
  await page.locator('#slot').selectOption('13');
  assert.match(await page.locator('#sourceContext').innerText(),/editorial study text repaired|Editorial study text repaired/i);
  await page.locator('#specimenNumber').fill('154');
  await page.locator('#pdfPage').fill('183');
  await page.locator('#officialTick').selectOption('A');
  await page.locator('#typedChoice').selectOption('A');
  await page.locator('#printedChoice').fill('3 4 2 1');
  assert.match(await page.locator('#recordStatus').innerText(),/Incomplete draft/);
  await page.locator('#stemChecked').check();
  await page.locator('#choicesChecked').check();
  await page.locator('#tickChecked').check();
  assert.match(await page.locator('#recordStatus').innerText(),/Locally checked/);
  await page.locator('#save').click();
  assert.equal(await page.locator('#reviewedCount').innerText(),'1');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#slot')?.options.length===200,
    undefined,{timeout:20000});
  await page.locator('#slot').selectOption('13');
  assert.equal(await page.locator('#specimenNumber').inputValue(),'154','Local reviewer evidence survives refresh');
  await page.locator('#slot').selectOption('98');
  await page.locator('#specimenNumber').fill('98');
  await page.locator('#pdfPage').fill('103');
  await page.locator('#officialTick').selectOption('A');
  await page.locator('#typedChoice').selectOption('A');
  await page.locator('#printedChoice').fill('2 dots');
  await page.locator('#stemChecked').check();
  await page.locator('#choicesChecked').check();
  await page.locator('#tickChecked').check();
  assert.match(await page.locator('#recordStatus').innerText(),/Incomplete draft/,'Missing dice figure cannot be locally cleared');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    '2026 reviewer workbench remains mobile width safe');
  assert.deepEqual(pageErrors,[],'Editorial reviewer workbench has no runtime JavaScript errors');
  console.log('PASS Group I 2026 source-key workbench: local draft, provenance fields, original dice gate and mobile access');

  // TNPSC Group I 2011: actual original Series D PDF, not the uploaded Group II transcription.
  pageErrors.length=0;
  await page.goto(origin+'/pyq-original-paper.html?paper=tnpsc-group-i-2011-preliminary-general-knowledge-d',{waitUntil:'domcontentloaded'});
  await page.locator('#answerSheet').waitFor({state:'visible',timeout:20000});
  assert.match(await page.locator('#examTitle').innerText(),/Group I.*2011.*Series D/);
  assert.match(await page.locator('#count').innerText(),/200 original numbered questions/);
  assert.match(await page.locator('#sourcePaper a').getAttribute('href'),/\/IDPC\.pdf$/);
  assert.match(await page.locator('#sourceKey a').getAttribute('href'),/05_06_2011_g1_gk\.pdf$/);
  assert.equal(await page.locator('#dockChoices button').count(),4,'Historical Group I paper has A–D, no invented E choice');
  assert.equal(await page.locator('#answerChoices button').count(),4);
  assert.equal(await page.locator('#adaptedQuizLink').isVisible(),false,'Do not link to unrelated Group IV adapted quiz');
  await page.locator('#dockChoices button').nth(1).click();
  assert.match(await page.locator('#status').innerText(),/1\/200 answered/);
  await page.locator('#paletteDetails summary').click();
  await page.locator('#palette button').nth(199).click();
  assert.match(await page.locator('#number').innerText(),/Question 200 of 200/);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#answerSheet').waitFor({state:'visible',timeout:20000});
  assert.match(await page.locator('#number').innerText(),/Question 200 of 200/);
  assert.match(await page.locator('#status').innerText(),/1\/200 answered/,'2011 paper responses persist after reload');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#finish').click();
  assert.match(await page.locator('#scoreSummary').innerText(),/Indicative marks: 1\.5 \/ 288/,'Series D final-key score excludes eight ALL entries');
  assert.match(await page.locator('#resultBody').innerText(),/A–D only/);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,'2011 Group I responsive original paper layout');
  assert.deepEqual(pageErrors,[],'2011 original-paper quiz does not raise runtime JavaScript errors');
  console.log('PASS TNPSC Group I 2011: correct official Series D paper, 4 choices, key, saved progress, 200 positions and indicative score');

  // TNUSRB SI 2015 bilingual PYQ with original 140 positions and no invented visuals/keys.
  pageErrors.length=0;
  await page.goto(origin+'/tnusrb-si-2015-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#loadStatus').innerText(),/140 readable original-numbered practice questions loaded/);
  assert.match(await page.locator('h1').innerText(),/TNUSRB SI 2015/);
  assert.match(await page.locator('.note').first().innerText(),/secondary answer table/);
  await page.locator('details[aria-label="Unverified original booklet graph and source reasons"] summary').click();
  assert.equal(await page.locator('#sourceIssues li').count(),6,'Show all six original-graph verification exceptions');
  await page.locator('details[aria-label="Ungraded 2015 review questions and reasons"] summary').click();
  assert.equal(await page.locator('#ungradedIssues li').count(),24,'Disputed but readable questions need independent source-review disclosure');
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Q1/);
  assert.match(await page.locator('#questionTitle').innerText(),/மணநூல்/);
  assert.equal(await page.locator('#options button').count(),4);
  await page.locator('#options button').nth(2).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/secondary answer-table entry: C/);
  assert.equal(await page.locator('#options button').nth(2).isDisabled(),true);
  await page.locator('#quiz .palette-details summary').click();
  const si2015Nums=await page.locator('#palette button').allTextContents();
  assert.equal(si2015Nums.length,140,'116 provisional-keyed + 24 neutral ungraded study items must be playable');
  for(const ungradedGraph of [99,100,101,102,103,104]){
    assert.equal(si2015Nums.includes(String(ungradedGraph)),true,'Open study mode must now show original Q'+ungradedGraph);
  }
  await page.locator('#palette button').filter({hasText:/^99$/}).click();
  assert.equal(await page.locator('#questionFigure').isVisible(),true,'Comparison-only P/Q chart is visible');
  assert.match(await page.locator('#questionFigure').getAttribute('src'),/q99-104-comparison-ungraded\.svg/);
  assert.match(await page.locator('#questionFigure').getAttribute('alt'),/NOT a verified original TNUSRB booklet/);
  await page.locator('#options button').first().click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'Nonofficial source graph never scores');
  assert.equal(await page.locator('#options .right, #options .wrong').count(),0,'No answer highlight for source-comparison figure');
  await page.locator('details[aria-label="Source-comparison 2015 graph questions"] summary').click();
  assert.equal(await page.locator('#graphRecovery li').count(),6,'All six graph prompts accessible but excluded from scoring');
  assert.ok(si2015Nums.includes('109'),'Visually recovered Q109 original-number position is playable');
  await page.locator('#palette button').filter({hasText:/^109$/}).click();
  assert.equal(await page.locator('#questionFigure').isVisible(),true,'Q109 scanned-layout redraw visible');
  assert.match(await page.locator('#questionFigure').getAttribute('alt'),/top 5.*question mark/);
  for(const recovered of [119,120,129]){
    assert.ok(si2015Nums.includes(String(recovered)),'Original SI 2015 figure question Q'+recovered+' recovered');
    await page.locator('#palette button').filter({hasText:new RegExp('^'+recovered+'$')}).click();
    assert.equal(await page.locator('#questionFigure').isVisible(),true,'Figure visible for SI 2015 Q'+recovered);
    assert.ok((await page.locator('#questionFigure').getAttribute('src')).endsWith(recovered===120?'q120-ungraded.svg':'q'+recovered+'.svg'));
    assert.equal(await page.locator('#options button').count(),4,'Q'+recovered+' retains A–D choices');
  }
  for(const ungraded of [8,9,14,21,27,29,30,33,60,65,66,73,80,84,90,95,120,127]){
    assert.ok(si2015Nums.includes(String(ungraded)),'Readable source conflict must remain available for ungraded practice Q'+ungraded);
  }
  assert.ok(si2015Nums.includes('9'),'Q9 original numbered duplicated alternatives now readable and ungraded');
  await page.locator('#palette button').filter({hasText:/^9$/}).click();
  assert.equal(await page.locator('#options button').nth(0).innerText(),await page.locator('#options button').nth(2).innerText().then(x=>x.replace(/^C/,'A')),'Q9 A/C source text duplicates');
  await page.locator('#options button').nth(0).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'2015 Q9 duplicated answer cannot be scored');
  assert.equal(await page.locator('#options .right,#options .wrong').count(),0,'Q9 has no right/wrong highlights');
  await page.locator('#palette button').filter({hasText:/^8$/}).click();
  await page.locator('#options button').nth(2).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded — source\/key review needed/);
  assert.equal(await page.locator('#options .right, #options .wrong').count(),0,'Do not show disputed key as correct or incorrect');
  await page.locator('#palette button').filter({hasText:/^11$/}).click();
  assert.match(await page.locator('#questionTamil').innerText(),/எந்த வகை வாக்கியம்/,'2015 Q11 editorial Tamil study stem shown');
  assert.match(await page.locator('#options button').nth(2).innerText(),/உணர்ச்சி வாக்கியம்/,'2015 Q11 bilingual option C');
  assert.equal(await page.locator('#sourceReader').isVisible(),true,'Indexed source review disclosed on bilingual questions');
  await page.locator('#palette button').filter({hasText:/^14$/}).click();
  assert.match(await page.locator('#questionTamil').innerText(),/செயப்பாட்டு வினை/,'Source disputed Q14 has Tamil text');
  await page.locator('#options button').nth(3).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded — source\/key review needed/,'Question 14 must remain ungraded despite grammar');
  assert.equal(await page.locator('#options .right, #options .wrong').count(),0,'Never highlight source-disputed key on Q14');
  await page.locator('#palette button').filter({hasText:/^21$/}).count().then(n=>assert.equal(n,1,'Q21 matrix notation now source-readable ungraded'));
  await page.locator('#palette button').filter({hasText:/^90$/}).click();
  assert.match(await page.locator('#questionTitle').innerText(),/√\(176 \+ √2401\)/,'Q90 nested radical from source restored');
  await page.locator('#options button').nth(1).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'Q90 conflicting answer key not scored');
  assert.equal(await page.locator('#options .right,#options .wrong').count(),0,'Q90 neutral feedback');
  await page.locator('#palette button').filter({hasText:/^120$/}).click();
  assert.equal(await page.locator('#questionFigure').isVisible(),true,'Q120 question mark source figure visible');
  assert.match(await page.locator('#questionTitle').innerText(),/editorial prompt.*ungraded/,'Q120 source omits original instruction');
  await page.locator('#options button').first().click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'Q120 figure choice cannot be scored as authentic question');

  await page.locator('#palette button').filter({hasText:/^132$/}).click();
  assert.match(await page.locator('#position').innerText(),/Original Q132/);
  assert.equal(await page.locator('#passage').isVisible(),true,'Q132–Q134 shared passage is visible');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#start').innerText(),/Resume 140-question/);
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Q132/);
  await page.locator('#quiz .palette-details summary').click();
  assert.match(await page.locator('#palette button').first().getAttribute('class'),/done/);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,'SI 2015 390px mobile layout');
  await page.locator('#palette button').filter({hasText:/^140$/}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#finish').click();
  assert.match(await page.locator('#score').innerText(),/\/ 58\.0 provisional marks/,'Ungraded source-review items must not alter the current 116-question provisional score denominator');
  assert.equal(await page.locator('#result').isVisible(),true);
  await page.locator('#reviewFilter').selectOption('ungraded');
  assert.equal(await page.locator('#reviewList .result-item').count(),si2015Manifest.ungradedReadableQuestionCount,'Ungraded filter matches the current source-reviewed, unscored question count');
  await page.goto(origin+'/tnusrb-si-2015-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  await page.locator('#mode').selectOption('exam');
  await page.locator('#start').click();
  await page.locator('#options button').first().click();
  assert.equal(await page.locator('#check').isVisible(),false,'Exam mode hides provisional answer feedback');
  assert.equal(await page.locator('#feedback').isVisible(),false);
  assert.deepEqual(pageErrors,[],'TNUSRB SI 2015 mobile JavaScript runtime clean');
  console.log('PASS TNUSRB SI 2015: 140 playable (116 provisional, 24 ungraded), six comparison-chart study items, neutral feedback and preserved answers');

  // TNUSRB year-page navigation previously had dead .html paths and fake PDF downloads.
  pageErrors.length=0;
  await page.goto(origin+'/tnusrb/previous_year_questions.html',{waitUntil:'domcontentloaded'});
  const yearCardLinks=page.locator('a.card-btn.start-test[href="../tnusrb-si-2020-quiz.html"]');
  assert.equal(await yearCardLinks.count(),2,'2019 recruitment and 2020 sitting both link to real Series C quiz');
  const srcButton=page.locator('.card-btn.download[data-type="si"][data-year="2020"]');
  assert.match(await srcButton.innerText(),/Open source PDF/,'Actual board-linked PDF replaces simulated download');
  assert.match(await srcButton.getAttribute('title'),/board-listed question paper PDF/);
  const bulkButton=page.locator('.download-btn').first();
  assert.match(await bulkButton.innerText(),/Browse available papers/,'No phantom bulk ZIP download claims');
  assert.deepEqual(pageErrors,[],'TNUSRB year archive navigation has no runtime errors');

  // TNUSRB SI 2020 (2019 recruitment, Series C) from user-supplied transcription.
  pageErrors.length = 0;
  await page.goto(origin+'/tnusrb-si-2020-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#loadStatus').innerText(),/140 \/ 140 readable original-numbered questions/);
  assert.match(await page.locator('h1').innerText(),/TNUSRB SI 2020/);
  assert.match(await page.locator('a[href="https://www.tnusrb.tn.gov.in/pdfs/SI_2019_WT_QUESTION.pdf"]').innerText(),/TNUSRB 2019 General Candidates written paper/);
  await page.locator('details[aria-label="2020 open-candidates source review notes"] summary').click();
  assert.equal(await page.locator('#sourceGaps li').count(),1,'Recovered 2020 C Q114–116 are disclosed as secondary-scan study text');
  const incomplete=await page.locator('#sourceGaps li').allTextContents();
  assert.ok(incomplete.some(x=>/Q114–116:.*visually transcribed from the public Series C scan/.test(x)));
  assert.ok(!incomplete.some(x=>/remains absent from the quiz/.test(x)),'Recovered C questions must not be labelled missing');
  assert.ok(incomplete.every(x=>/TNUSRB-hosted original-PDF certification remains pending/.test(x)),'Source caveat is preserved');
  assert.ok(!incomplete.some(x=>/Q46:|Q47:|Q121:/.test(x)),'Restored numbered questions no longer withheld');

  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Q1/);
  assert.match(await page.locator('#questionTitle').innerText(),/Sun.*skin.*heat/);
  assert.equal(await page.locator('#options button').count(),4);
  await page.locator('#options button').nth(1).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Series C final-key entry: B/);
  assert.equal(await page.locator('#options button').nth(1).isDisabled(),true);
  assert.equal(await page.locator('#language').inputValue(),'both','Bilingual view is available from the start');
  assert.match(await page.locator('#questionTamil').innerText(),/சூரியனிலிருந்து/,'Tamil Q1 stem visible in bilingual view');
  assert.match(await page.locator('#options button').nth(1).innerText(),/அகச்சிவப்புக் கதிர்கள்/,'Original answer B includes the editorial Tamil choice');
  await page.locator('#language').selectOption('ta');
  assert.equal(await page.locator('#questionTitle').isVisible(),false,'Tamil-only mode hides English stem when translated');
  assert.equal(await page.locator('#questionTamil').isVisible(),true,'Tamil-only mode displays translated stem');
  assert.match(await page.locator('#options button').nth(1).innerText(),/அகச்சிவப்புக் கதிர்கள்/);
  assert.doesNotMatch(await page.locator('#options button').nth(1).innerText(),/Infra-red/,'Tamil-only option does not mix English text');
  assert.match(await page.locator('#translationNotice').innerText(),/NOT independently verified/,'Unverified Tamil booklet origin clearly disclosed');
  await page.locator('#language').selectOption('en');
  assert.equal(await page.locator('#questionTamil').isVisible(),false,'English-only mode hides study Tamil');
  assert.match(await page.locator('#options button').nth(1).innerText(),/Infra-red/);
  await page.locator('#language').selectOption('both');
  await page.locator('#quiz .palette-details summary').click();
  const nums=await page.locator('#palette button').allTextContents();
  assert.equal(nums.length,140,'2020 General Candidates: all 140 source-numbered study positions are available');
  for(const stillMissing of [114,115,116]){
    assert.equal(nums.includes(String(stillMissing)),true,'Secondary-scan recovered Series C Q'+stillMissing+' is playable and source-labelled');
  }
  await page.locator('#palette button').filter({hasText:/^23$/}).click();
  await page.locator('#language').selectOption('ta');
  assert.match(await page.locator('#questionTamil').innerText(),/Non-Elitist/,'Second Tamil batch Q23 displayed');
  assert.match(await page.locator('#options button').first().innerText(),/கார்ல் மார்க்ஸ்/,'Q23 Tamil choices preserve A–D correspondence');
  assert.match(await page.locator('#translationNotice').innerText(),/NOT independently verified/,'New Tamil study text not presented as official booklet');
  await page.locator('#palette button').filter({hasText:/^43$/}).click();
  await page.locator('#language').selectOption('both');
  assert.match(await page.locator('#questionTamil').innerText(),/log₃5/,'Q43 mathematical symbols preserved in Tamil edition');
  assert.match(await page.locator('#options button').nth(3).innerText(),/3\/2/,'Q43 option D retains math notation');
  await page.locator('#palette button').filter({hasText:/^57$/}).click();
  await page.locator('#language').selectOption('ta');
  assert.match(await page.locator('#options button').nth(3).innerText(),/சீசியம் \(Cs\)/,'Q57 original chemical symbol preserved with Tamil term');
  await page.locator('#palette button').filter({hasText:/^60$/}).click();
  assert.match(await page.locator('#questionTamil').innerText(),/1 eV/,'Third Tamil batch begins at original C Q60');
  assert.match(await page.locator('#options button').nth(2).innerText(),/1\.602 x 10-19 J/,'Q60 original numeric/scientific notation preserved');
  assert.match(await page.locator('#translationNotice').innerText(),/NOT independently verified/,'New Tamil study wording is not certified original Series C');
  await page.locator('#palette button').filter({hasText:/^64$/}).click();
  assert.match(await page.locator('#questionTamil').innerText(),/டிக்கா/,'Botany Q64 translated without changing species options');
  assert.match(await page.locator('#options button').first().innerText(),/Cercospora personata/,'Source Latin taxonomy kept verbatim');
  await page.locator('#palette button').filter({hasText:/^68$/}).click();
  assert.match(await page.locator('#options button').nth(1).innerText(),/Plasmodium falciparum/,'Species taxonomy preserved');
  await page.locator('#palette button').filter({hasText:/^69$/}).click();
  assert.match(await page.locator('#questionTamil').innerText(),/இரவுக்குருட்டுத்தன்மை/,'Human biology translation available');
  await page.locator('#palette button').filter({hasText:/^76$/}).click();
  assert.match(await page.locator('#options button').first().innerText(),/Outbuddin Aibak/,'Anomalous original option spelling is disclosed rather than silently corrected');

  await page.locator('#palette button').filter({hasText:/^28$/}).click();
  await page.locator('#language').selectOption('en');
  assert.equal(await page.locator('#questionTitle').getAttribute('lang'),'ta','Already-Tamil original-numbered source correctly marked with Tamil lang');
  assert.match(await page.locator('#questionTitle').innerText(),/ஏறு தழுவுதல்/,'No invented English text on original Tamil source Q28');
  assert.match(await page.locator('#translationNotice').innerText(),/already in Tamil/,'English mode acknowledges absence of verified English source');
  assert.equal(await page.locator('#questionTamil').isVisible(),false,'No redundant editorial translation for original Tamil source');
  await page.locator('#language').selectOption('ta');
  assert.match(await page.locator('#options button').nth(1).innerText(),/கலித்தொகை/,'Q28 original Tamil option B remains intact');
  await page.locator('#palette button').filter({hasText:/^39$/}).click();
  assert.equal(await page.locator('#questionTamil').isVisible(),false,'Malformed Q39 is intentionally not translated');
  assert.match(await page.locator('#questionTitle').innerText(),/Shantha.*table/,'Q39 English source retained in Tamil mode');
  assert.match(await page.locator('#translationNotice').innerText(),/not yet reviewed/,'Explicit fallback when source wording cannot be confidently translated');
  await page.locator('#language').selectOption('both');
  for(const recovered of [46,47,121])assert.ok(nums.includes(String(recovered)),'Restored study question Q'+recovered);
  await page.locator('#palette button').filter({hasText:/^46$/}).click();
  assert.match(await page.locator('#questionTitle').innerText(),/13.*5.*60/,'Vector expressions visible for Q46');
  assert.match(await page.locator('#instruction').innerText(),/Series D Q25/,'C original booklet is not claimed for vector notation');
  await page.locator('#options button').nth(2).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Series C final-key entry: C/,'Q46 vector scored using published C final key');
  await page.locator('#palette button').filter({hasText:/^47$/}).click();
  assert.match(await page.locator('#questionTitle').innerText(),/adjoint.*matrix/i);
  assert.match(await page.locator('#instruction').innerText(),/Series D Q26/,'Q47 matrix is source-comparison only');
  await page.locator('#options button').nth(2).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'Q47 matrix options cannot count as C original');
  assert.equal(await page.locator('#options .right,#options .wrong').count(),0,'No matrix answer highlights until C original verified');
  await page.locator('#palette button').filter({hasText:/^121$/}).click();
  assert.match(await page.locator('#questionTitle').innerText(),/21\?/,'Q121 arithmetic transcription readable');
  await page.locator('#options button').nth(2).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Series C final-key entry: C/,'Q121 arithmetic keyed by independent C final key');

  assert.equal(nums.includes('22'),true,'Readable disputed source Q22 appears as ungraded');
  for(const recovered of [28,29,30,31,32,33,34,35,41,42,44,45,48])assert.ok(nums.includes(String(recovered)),'Recovered 2020 Series C original Q'+recovered);
  for(const sourceReadable of [14,15,37,84,95,103])assert.ok(nums.includes(String(sourceReadable)),'Cross-reviewed 2020 Series C Q'+sourceReadable+' now present');
  await page.locator('#palette button').filter({hasText:/^14$/}).click();
  assert.match(await page.locator('#options button').nth(1).innerText(),/Ganga.*Brahmaputra/,'2020 Q14 option B independently cross-checked');
  await page.locator('#palette button').filter({hasText:/^15$/}).click();
  await page.locator('#language').selectOption('ta');
  assert.equal(await page.locator('#questionTitle').isVisible(),true,'Q15 displays original English, not an invented Tamil translation');
  assert.equal(await page.locator('#questionTamil').isVisible(),false,'Ambiguous original C Q15 intentionally untranslated');
  assert.match(await page.locator('#translationNotice').innerText(),/not yet reviewed/,'Unreviewed translation shows English fallback');
  await page.locator('#language').selectOption('both');
  await page.locator('#options button').nth(1).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'Q15 remains ungraded due original wording ambiguity');
  assert.equal(await page.locator('#options .right,#options .wrong').count(),0,'Q15 must not receive a right/wrong highlight');
  await page.locator('#palette button').filter({hasText:/^37$/}).click();
  await page.locator('#options button').first().click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'2020 Q37 cross-series spelling dispute ungraded');
  assert.equal(await page.locator('#options .right,#options .wrong').count(),0,'Q37 duplicate alternative cannot show right/wrong status');
  for(const n of [84,95,103]){
    await page.locator('#palette button').filter({hasText:String(n)}).click();
    assert.equal(await page.locator('#questionFigure').isVisible(),true,'Reference figure visible for Q'+n);
    assert.ok((await page.locator('#questionFigure').getAttribute('src')).endsWith('q'+n+'-reference-ungraded.svg'));
    assert.match(await page.locator('#referenceNote').innerText(),/NOT the verified 2020 Series C original figure/,'Explicit original source caveat');
    await page.locator('#options button').first().click();
    await page.locator('#check').click();
    assert.match(await page.locator('#feedback').innerText(),/Ungraded/,'Q'+n+' is ungraded');
    assert.equal(await page.locator('#options .right,#options .wrong').count(),0,'Q'+n+' cannot highlight answer');
  }
  await page.locator('#palette button').filter({hasText:/^22$/}).click();
  await page.locator('#options button').nth(0).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded — printed choice\/key conflict/);
  assert.equal(await page.locator('#options .right, #options .wrong').count(),0,'Do not mark disputed key A as correct');
  assert.equal(nums.includes('1'),true);
  assert.equal(nums.includes('140'),true);
  await page.locator('#palette button').filter({hasText:/^89$/}).click();
  assert.match(await page.locator('#position').innerText(),/Original Q89/);
  assert.match(await page.locator('#questionTitle').innerText(),/Maths 90°/);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#start').innerText(),/Resume 140-question/);
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Q89/);
  await page.locator('#quiz .palette-details summary').click();
  assert.match(await page.locator('#palette button').first().getAttribute('class'),/done/);
  await page.locator('#palette button').filter({hasText:/^140$/}).click();
  assert.match(await page.locator('#position').innerText(),/Original Q140/);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#finish').click();
  assert.match(await page.locator('#score').innerText(),/\/ 65\.0 marks/);
  assert.equal(await page.locator('#result').isVisible(),true);
  await page.locator('#reviewFilter').selectOption('ungraded');
  assert.equal(await page.locator('#reviewList .result-item').count(),10,'Three ALL entries plus seven disputed/reference items appear in ungraded review');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    'TNUSRB SI 2020 has no mobile horizontal overflow');
  await page.goto(origin+'/tnusrb-si-2020-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  await page.locator('#mode').selectOption('exam');
  await page.locator('#start').click();
  await page.locator('#options button').first().click();
  assert.equal(await page.locator('#check').isVisible(),false,'Exam mode hides Check Answer');
  assert.equal(await page.locator('#feedback').isVisible(),false,'Exam mode conceals correct option');
  assert.deepEqual(pageErrors,[],'TNUSRB SI 2020 has no runtime page errors');
  console.log('PASS TNUSRB SI 2020: 140 playable, 130 provisional scores, recovered C Q114–116, source caveats and resume');

  // TNUSRB SI 2010 Type A: 140 readable practice entries, of which 135 have provisional score mappings.
  pageErrors.length = 0;
  await page.goto(origin+'/tnusrb-si-2010-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#loadStatus').innerText(),/140 readable Open Candidates questions loaded/);
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Q1/);
  assert.match(await page.locator('#questionTitle').innerText(),/Periyapuranam/);
  assert.equal(await page.locator('#options button').count(),4);
  assert.match(await page.locator('#questionTamil').innerText(),/பெரியபுராணத்தை/,'Source-indexed Tamil is shown below English');
  assert.match(await page.locator('#options button').nth(2).innerText(),/சேக்கிழார்/,'Option C Tamil retains original-numbered source position');
  assert.equal(await page.locator('#sourceReader').isVisible(),true,'Source disclosure shown only for bilingual-reviewed questions');
  await page.locator('#options button').nth(2).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Type A final-key entry: C/);
  assert.equal(await page.locator('#options button').nth(2).isDisabled(),true,'Checked answer is locked');
  await page.locator('details[aria-label="2010 Open Candidates source gaps"] summary').click();
  assert.equal(await page.locator('#sourceGaps li').count(),2,'Only two original-number source gaps disclosed');
  await page.locator('#quiz .palette-details summary').click();
  const numbers=await page.locator('#palette button').allTextContents();
  assert.equal(numbers.length,140,'All 120 readable/marked practice entries available');
  assert.equal(numbers.includes('64'),true,'Recovered Q64 source notation is visible but ungraded');
  assert.equal(numbers.includes('86'),true,'Visually confirmed stacked fraction question restored');
  assert.equal(numbers.includes('106'),true,'Recovered Q106 original diagram is playable');
  assert.equal(numbers.includes('117'),true,'Passage questions retained');
  await page.locator('#palette button').filter({hasText:/^64$/}).click();
  await page.locator('#options button').nth(1).click();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/Ungraded — conflicting source keys/);
  assert.equal(await page.locator('#options .right, #options .wrong').count(),0,'Do not grade Q64 contradictory source answers');
  await page.locator('#palette button').filter({hasText:/^106$/}).click();
  assert.equal(await page.locator('#questionFigure').isVisible(),true,'Q106 recovered Venn is visible');
  assert.match(await page.locator('#questionFigure').getAttribute('alt'),/Arrow D/);
  await page.locator('#palette button').filter({hasText:/^10$/}).click();
  assert.match(await page.locator('#questionTamil').innerText(),/புவி தினம்/);
  await page.locator('#palette button').filter({hasText:/^11$/}).click();
  assert.equal(await page.locator('#questionTamil').isVisible(),false,'Do not fabricate Tamil translation for Q11');
  assert.equal(await page.locator('#sourceReader').isVisible(),false);
  await page.locator('#palette button').filter({hasText:/^117$/}).click();
  assert.match(await page.locator('#position').innerText(),/Original Q117/);
  assert.equal(await page.locator('#passage').isVisible(),true,'Gold-mines passage shown');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  assert.match(await page.locator('#start').innerText(),/Resume 140-question/);
  await page.locator('#start').click();
  assert.match(await page.locator('#position').innerText(),/Original Q117/);
  await page.locator('#quiz .palette-details summary').click();
  assert.match(await page.locator('#palette button').first().getAttribute('class'),/done/);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,
    '2010 SI mobile quiz has no horizontal overflow');
  await page.locator('#palette button').filter({hasText:/^140$/}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#finish').click();
  assert.match(await page.locator('#score').innerText(),/\/ 67\.5 marks/,'Indicative score includes 135 provisionally scored answers; Q64 dispute and four ALL excluded');
  assert.equal(await page.locator('#result').isVisible(),true);
  await page.goto(origin+'/tnusrb-si-2010-quiz.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#start')&&!document.querySelector('#start').disabled,
    undefined,{timeout:20000});
  await page.locator('#mode').selectOption('exam');
  await page.locator('#start').click();
  await page.locator('#options button').first().click();
  assert.equal(await page.locator('#check').isVisible(),false,'Exam mode hides answer checking');
  assert.equal(await page.locator('#feedback').isVisible(),false,'Exam mode hides instant answers');
  assert.deepEqual(pageErrors,[],'TNUSRB SI 2010 quiz no runtime errors');
  console.log('PASS TNUSRB SI 2010 Type A: 140 playable, 135 provisionally scored, source omissions, key checking, review, save/resume, exam mode');

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
