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
const simple=notes.find(n=>n.id==='measurements');
assert.equal(noteQuality.evaluate(simple).level,'outline');
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
const evaluation=fresh.all(review,'2026-10-26');
assert.equal(evaluation.length,6);
assert.ok(evaluation.find(x=>x.board==='upsc').due);
assert.ok(evaluation.find(x=>x.board==='tnpsc').due);
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
console.log('Content trust tests passed: notes, PYQ practice, calendar review, report form and progress transfer.');
