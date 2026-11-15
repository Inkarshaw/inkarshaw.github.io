// TNPSC Group I typed starter-year audit: no invented positions, answers or score claims.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const typed=JSON.parse(read('data/quizzes/tnpsc-group1-multiyear-typed-draft.json'));
const allYears=JSON.parse(read('data/quizzes/tnpsc-group1-all-years.json'));
const html=read('tnpsc-group1-typed-years.html');
const js=read('assets/js/tnpsc-group1-typed-years.js');
const hub=read('tnpsc-group1-pyq.html');
const expected=new Map([[2025,10],[2024,10],[2022,8],[2021,2],[2019,9],[2017,2],[2015,7]]);
assert.equal(typed.schemaVersion,1);
assert.equal(typed.papers.length,7);
assert.deepEqual(typed.papers.map(p=>p.year),[2025,2024,2022,2021,2019,2017,2015]);
assert.equal(typed.papers.reduce((sum,p)=>sum+p.questions.length,0),48);
for(const paper of typed.papers){
 assert.equal(paper.originalQuestionCount,200);
 assert.equal(paper.grading,'not-graded');
 assert.equal(paper.keyedAnswerCount,0);
 assert.equal(paper.questions.length,expected.get(paper.year));
 assert.deepEqual(paper.optionLetters,paper.year<2021?['A','B','C','D']:['A','B','C','D','E']);
 assert.match(paper.officialPdf,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\//);
 assert.ok(paper.secondaryReader.startsWith('https://'));
 const entry=allYears.entries.find(e=>e.year===paper.year);
 assert.ok(entry&&entry.paperUrl===paper.officialPdf);
 assert.equal(entry.typedUrl,'tnpsc-group1-typed-years.html?year='+paper.year);
 assert.equal(entry.typedQuestionCount,paper.questions.length);
 assert.equal(entry.provisionallyScorable,0);
 const seen=new Set();
 for(const item of paper.questions){
  assert.ok(Number.isInteger(item.number)&&item.number>=1&&item.number<=200);
  assert.ok(!seen.has(item.number),'Duplicate source position '+item.number);
  seen.add(item.number);
  assert.ok(item.text.length>=18);
  assert.equal(item.options.length,4,'Four A–D choices, E is answer not known where printed');
  assert.ok(item.options.every(x=>typeof x==='string'&&x.trim().length));
  assert.equal(item.keyStatus,'unmapped','Never provide unreviewed keys');
  assert.deepEqual(item.accepted,[],'No fabricated accepted-option sets');
 }
}
const y15=typed.papers.find(p=>p.year===2015);
assert.deepEqual(y15.questions.map(q=>q.number),[1,2,3,4,5,6,7]);
assert.equal(y15.verifiedSourceCount,7,'2015 Q1–7 visually checked against official original PDF');
assert.deepEqual(typed.papers.find(p=>p.year===2021).questions.map(q=>q.number),[1,2]);
assert.match(html,/not certified verbatim TNPSC text/);
assert.match(html,/No automatic scoring/);
assert.match(js,/localStorage/);
assert.match(js,/originalQuestionCount!==200/);
assert.match(js,/grading!=='not-graded'/);
assert.match(js,/keyedAnswerCount!==0/);
assert.match(js,/\bnew URLSearchParams\(location\.search\)/);
assert.match(hub,/Start '\+x\.typedQuestionCount\+' typed questions/);
assert.ok(!js.includes('innerHTML'),'Source text must be inserted as textContent');
assert.ok(existsSync(new URL('../tnpsc-group1-typed-years.html',import.meta.url)));
assert.match(read('sitemap.xml'),/tnpsc-group1-typed-years\.html/);
new vm.Script(js,{filename:'assets/js/tnpsc-group1-typed-years.js'});
console.log('Group I typed starter-year catalog, safe quiz UI, and source-gating tests passed');
