// ClearExams: content trust, board review, report submission, and portable progress.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const load=path=>{const root={};const context={window:root,URL,console};vm.runInNewContext(read(path),context);return root};

const noteQuality=load('assets/js/notes-quality.js').ClearExamsNoteQuality;
const notesContext={window:{}};vm.runInNewContext(read('assets/js/tn-school-notes-data.js'),notesContext);
const notes=notesContext.window.ClearExamsTNSchoolNotes;
assert.ok(notes.length>=120);
for(const id of ['measurements','force-motion','matter']){
 const draft=notes.find(n=>n.id===id);
 assert.ok(draft,id+': bilingual draft missing');
 assert.equal(noteQuality.evaluate(draft).level,'bilingual-review-pending',id+': expanded draft must await editorial review');
}
for(const id of ['electricity','organs','solar-system']){
 const draft=notes.find(n=>n.id===id);
 assert.ok(draft,id+': expanded bilingual draft not found');
 assert.equal(noteQuality.evaluate(draft).level,'bilingual-review-pending',id+': an unreviewed draft must never be called complete');
}
for(const id of ['production','landforms','earth-interior','ancient-tamil-towns']){
 const draft=notes.find(n=>n.id===id);
 assert.ok(draft,id+': expanded note missing');
 assert.equal(noteQuality.evaluate(draft).level,'bilingual-review-pending',id+': explicit human review remains necessary');
}
const deep=notes.find(n=>n.id==='equality');
assert.ok(deep);
assert.notEqual(noteQuality.evaluate(deep).level,'reviewed-bilingual','Do not claim editorial review without a recorded approver');
for(const id of ['tn-budget-process','tn-budget-deficits','tn-finance-consultation']){
 const item=notes.find(n=>n.id===id);
 assert.equal(noteQuality.evaluate(item).level,'bilingual-review-pending',id+': structural bilingual draft must await human approval');
}
assert.ok(noteQuality.evaluate(deep).reasons.length);
const notePage=read('tn-school-notes.html');
assert.match(notePage,/notes-quality\.js/);
assert.match(notePage,/Brief revision outline · incomplete study coverage/);
assert.match(notePage,/editorial verification pending/);

const review=JSON.parse(read('data/exams/review-schedule.json'));
assert.deepEqual(Object.keys(review.boards).sort(),['banking','railways','ssc','tnpsc','tnusrb','upsc'].sort());
const fresh=load('assets/js/calendar-freshness.js').ClearExamsCalendarFreshness;
// Verify freshness relative to each board's actual review date, not a fixed stale date.
const latestReview=review.boards.upsc.lastReviewed;
const evaluation=fresh.all(review,latestReview);
assert.equal(evaluation.length,6);
assert.equal(evaluation.find(x=>x.board==='upsc').due,false);
const afterCadence=new Date(Date.parse(latestReview+'T00:00:00Z')+
  (review.cadenceDays.upsc+1)*86400000).toISOString().slice(0,10);
assert.ok(fresh.all(review,afterCadence).find(x=>x.board==='upsc').due);
const tnpscReview=review.boards.tnpsc.lastReviewed;
const tnpscExpiry=new Date(Date.parse(tnpscReview+'T00:00:00Z')+
  (review.cadenceDays.tnpsc+1)*86400000).toISOString().slice(0,10);
assert.ok(fresh.all(review,tnpscExpiry).find(x=>x.board==='tnpsc').due);
assert.match(read('exam-calendar.html'),/id="freshnessAlert"/);
assert.match(read('.github/workflows/calendar-board-review.yml'),/schedule:/);

const progress=load('assets/js/progress-transfer.js').ClearExamsProgressTransfer;
const saved={'clearexamsQuizHistoryV2':'[]','clearexamsTargetExamV1':'tnpsc'};
const store={getItem:k=>Object.hasOwn(saved,k)?saved[k]:null,setItem:(k,v)=>{saved[k]=v}};
const backup=progress.backup(store,'2026-10-26T10:00:00Z');
assert.equal(progress.validate(backup).clearexamsTargetExamV1,'tnpsc');
assert.throws(()=>progress.validate({...backup,format:'wrong'}));
assert.throws(()=>progress.validate({...backup,data:{clearexamsQuizHistoryV2:'broken-json'}}));
assert.equal(progress.restore(store,backup),2);
assert.match(read('dashboard.html'),/Export progress backup/);
assert.match(read('dashboard.html'),/Account-based cloud sync is not available/);

const textbook=read('textbook-play.html');
assert.match(textbook,/id="reportSubmitLink"/);
assert.match(textbook,/issues\/new/);
assert.match(textbook,/copying is not submission/i);
assert.match(read('.github/ISSUE_TEMPLATE/textbook-question.yml'),/Question ID/);

const hub=read('pyq-hub.html');
const daily=read('daily-quiz.html');
assert.match(daily,/ALLOWED_COUNTS=\[10,20,25,50,100\]/);
assert.match(hub,/Practise all 20 adapted PYQs/);
assert.match(hub,/Official final-key check incomplete or not documented/);
const bank=JSON.parse(read('data/quizzes/verified-pyqs.json'));
assert.equal(bank.length,150,'Only ten documented 2024 Group IV additions permitted');
const group42024=bank.filter(q=>q.SourceExam==='TNPSC Group IV'&&q.SourceYear==='2024');
assert.equal(group42024.length,20);
assert.ok(group42024.every(q=>q.AnswerKeyURL?.includes('01_2024_Final%20_Answer_Key_GT_GE.pdf')));

for(const name of ['exam-calendar.html','textbook-play.html','pyq-hub.html','dashboard.html','tn-school-notes.html']){
 const html=read(name);
 for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
  if(/src\s*=|application\/ld\+json/i.test(match[1])||!match[2].trim())continue;
  new vm.Script(match[2],{filename:name});
 }
}

const sampleHtml=read('practice-demo.html');
const demoScript=sampleHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(demoScript,'Demo quiz script missing');
new vm.Script(demoScript,{filename:'practice-demo.html'});
const questionSource=demoScript.match(/const questions=(\[[\s\S]*?\]);\s*let index=/)?.[1];
assert.ok(questionSource,'Demo question bank missing');
const samples=vm.runInNewContext(questionSource);
assert.equal(samples.length,12,'Instant demo must show 12 real questions');
for(const q of samples){
 assert.ok(q.q.length>=18,'Question should be meaningful');
 assert.equal(q.o.length,4,'Each question requires four options');
 assert.equal(new Set(q.o).size,4,'Duplicate answer choices');
 assert.ok(Number.isInteger(q.a)&&q.a>=0&&q.a<4,'Unambiguous answer index');
 assert.ok(q.e.length>=45,'Explanation should teach the concept');
}
assert.match(sampleHtml,/not<\/strong> claimed to be previous-year/i);
assert.match(sampleHtml,/\[hidden\]\{display:none!important\}/);
assert.ok(!/\bfetch\s*\(/.test(demoScript),'Sample must not depend on remote questions');
for(const name of ['tnpsc.html','upsc.html']){
 const words=read(name).replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean);
 assert.ok(words.length>3000,name+': full syllabus study pillar should exceed 3000 words');
 assert.match(read(name),/id="study-guide"/);
}
assert.match(read('index.html'),/editorial-policy\.html/);
assert.match(read('index.html'),/practice-demo\.html/);
assert.match(read('sitemap.xml'),/practice-demo\.html/);
assert.match(read('sitemap.xml'),/editorial-policy\.html/);
const noticeData=JSON.parse(read('data/exams/exam-notifications.json'));
const stationMaster=noticeData.entries.find(e=>e.id==='railways-station-master-2026');
assert.equal(stationMaster.applicationEnd,'2026-11-25');
assert.ok(stationMaster.source.includes('pib.gov.in'));
assert.ok(stationMaster.verifiedOn);
assert.ok(review.boards.tnusrb.lastReviewed!=='2026-10-28','Do not mark TNUSRB verified without an official check');

const tnusrbHub=read('tnusrb.html');
assert.match(tnusrbHub,/id="tentative-2026-27-planner"/);
assert.match(tnusrbHub,/Current verification status:/);
assert.match(tnusrbHub,/could not complete a live official-site review/);
assert.match(tnusrbHub,/not application deadlines, exam dates/);
assert.match(tnusrbHub,/exam-calendar.html\?category=tnusrb/);
for(const month of ['December 2026','February 2027','March 2027','June 2027']){
 assert.match(tnusrbHub,new RegExp(month));
}
const tnusrbPolicy=JSON.parse(read('data/exams/review-schedule.json'));
assert.notEqual(tnusrbPolicy.boards.tnusrb.lastReviewed,'2026-10-28','Do not falsify an official TNUSRB review');

// ClearExams student-facing textbook quiz name must be consistent, while public routes remain stable.
for(const page of ['textbook-quiz.html','textbook-play.html','index.html','search.html','tn-school-notes.html']){
 const html=read(page);
 assert.match(html,/TN School Book Quiz/,page+': the renamed quiz label is missing');
 assert.match(html,/textbook-quiz\.html/,page+': preserve existing published textbook quiz routes');
}
assert.match(read('textbook-quiz.html'),/<h1>TN School Book Quiz<\/h1>/);
assert.match(read('textbook-quiz.html'),/<title>TN School Book Quiz \| ClearExams<\/title>/);
assert.match(read('textbook-play.html'),/<title>TN School Book Quiz \| ClearExams<\/title>/);
assert.match(read('assets/js/textbook-catalog-controls.js'),/TN School Book Quiz filters/);

const ncertPage=read('ncert-school-book-quiz.html');
assert.match(ncertPage,/<h1>NCERT School Book Quiz<\/h1>/);
assert.match(ncertPage,/official NCERT textbook catalogue|NCERT textbook catalogue/);
assert.match(read('index.html'),/href="ncert-school-book-quiz.html"/);
assert.match(read('textbook-quiz.html'),/href="ncert-school-book-quiz.html"/);
assert.match(read('search.html'),/NCERT School Book Quiz/);
assert.match(read('sitemap.xml'),/ncert-school-book-quiz.html/);

console.log('Content trust tests passed: notes, PYQ practice, calendar review, report form and progress transfer.');
