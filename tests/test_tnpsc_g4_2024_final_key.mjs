// Original numbered TNPSC 2024 Group IV booklet / Version A final-key reconciliation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const qs=JSON.parse(read('data/quizzes/verified-pyqs.json'));
const selected=qs.filter(q=>q.SourceExam==='TNPSC Group IV'&&q.SourceYear==='2024');
const key={134:'B',135:'C',138:'D',139:'A',140:'C',141:'D',144:'A',146:'D',147:'C',149:'D',
150:'A',152:'B',153:'B',155:'D',156:'A',157:'C',159:'D',161:'C',162:'C',163:'A'};
assert.equal(selected.length,20,'2024 Group IV has 20 unique adaptations');
assert.deepEqual(selected.map(q=>Number(q.SourceQuestion)).sort((a,b)=>a-b),Object.keys(key).map(Number).sort((a,b)=>a-b));
for(const q of selected){
 const n=Number(q.SourceQuestion);
 assert.equal(q.CorrectAnswer,key[n],q.ID+': original Version A final answer-key letter');
 assert.match(q.SourceURL,/^https:\/\/www\.tnpsc\.gov\.in\/Tentative\/Document\/01_2024_GR_IV_GENERAL_TAMIL\.pdf$/);
 assert.equal(q.AnswerKeyURL,'https://tnpsc.gov.in/Document/Answerkeyfinalresult/01_2024_Final%20_Answer_Key_GT_GE.pdf');
 assert.match(q.AnswerVerification,/Matched to official TNPSC final key/);
 assert.equal(q.SourceType,'Adapted PYQ','Adaptation labels must be honest');
 assert.equal(new Set('ABCD'.split('').map(letter=>q['Option'+letter].trim())).size,4);
 for(const letter of 'ABCD')assert.ok(q['Explanation'+letter]?.trim().length>=50,q.ID+' missing option explanation '+letter);
}
for(const n of [148,151,154,158])assert.ok(!selected.some(q=>Number(q.SourceQuestion)===n),'Ambiguous or multi-keyed Q'+n+' must not be auto-imported');
const ctx={PRACTICE_COUNT:20,bank:qs,examSelect:{value:'TNPSC Group IV'},pyqYearSelect:{value:'2024'},hash:s=>[...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0)};
const quiz=read('daily-quiz.html');
for(const fn of ['examRows','yearFiltered','topicFor','dailySet']){
 const code=quiz.split('\n').find(line=>line.startsWith('function '+fn+'('));
 assert.ok(code,'Missing '+fn);vm.runInNewContext(code,ctx);
}
const rows=ctx.yearFiltered(ctx.examRows());
assert.equal(rows.filter(q=>q.Exam==='Previous Year Questions').length,20);
const twenty=ctx.dailySet(rows,'Previous Year Questions','2026-10-26','tnpsc-g4');
assert.equal(twenty.length,20);
assert.equal(new Set(twenty.map(q=>q.ID)).size,20);
console.log('TNPSC Group IV 2024: all twenty adaptations reconcile with original numbered final key; excluded ambiguous or multi-answer items.');
