/* Integrity and missing-data guard for TNPSC Group IV 2024/2025 source-linked typed review. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const keybook=JSON.parse(read('data/quizzes/original-final-keys.json'));
const html=read('tnpsc-g4-typed-review.html');
const js=read('assets/js/tnpsc-g4-typed-review.js');
assert.match(html,/not a verified full-text paper/i);
assert.match(html,/No invented questions/i);
assert.match(html,/source page/i);
assert.match(js,/textStatus|sourceStatus/);
assert.match(js,/sourcePdfPage/);
assert.match(js,/localStorage/);
assert.match(js,/source-pdf-required/,'Source status must remain distinguishable');
assert.match(js,/q\.accepted/,'Key mapping must respect multiple-accepted and ALL');
assert.match(js,/letter of LETTERS/,'All five A–E choices displayed when present');
assert.ok(!js.includes('innerHTML'),'Never inject OCR/user text as markup');
new vm.Script(js,{filename:'assets/js/tnpsc-g4-typed-review.js'});
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate DOM ids');
for(const r of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(r[1]),'Referenced id '+r[1]+' exists');
for(const [year,expectedTyped,expectedNumbers] of [
[2024,3,[1,2,3]],
[2025,10,[112,113,125,127,140,146,148,174,192,200]]
]){
const d=JSON.parse(read('data/quizzes/tnpsc-g4-'+year+'-typed-review.json'));
const sourceKeys=keybook.papers.find(p=>p.id===d.paperId);
assert.ok(sourceKeys,'Independent official key mapping found for '+year);
assert.equal(sourceKeys.answers.length,200);
assert.equal(d.exam,'TNPSC Group IV');
assert.equal(d.year,year);
assert.equal(d.originalQuestionCount,200);
assert.equal(d.questions.length,200);
assert.equal(d.status,'incomplete-unverified-typed-draft');
assert.equal(d.verifiedQuestionCount,0,'No OCR falsely certified');
assert.equal(d.typedPlayableCount,expectedTyped);
assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:200},(_,i)=>i+1));
const hasText=q=>typeof q.text==='string'&&q.text.length>0;
assert.deepEqual(d.questions.filter(hasText).map(q=>q.number),expectedNumbers);
assert.equal(d.gradedQuestionCount,d.questions.filter(q=>hasText(q)&&q.accepted.length>0).length);
for(const q of d.questions){
const expected=sourceKeys.answers[q.number-1];
assert.equal(q.keyToken,expected,'Official key '+year+' Q'+q.number);
assert.deepEqual(q.accepted,expected==='ALL'?[]:expected.split('/'),'Accepted answers '+year+' Q'+q.number);
assert.ok(q.sourcePdfPage===null||(Number.isInteger(q.sourcePdfPage)&&q.sourcePdfPage>=1&&q.sourcePdfPage<=130));
if(hasText(q)){
assert.ok(q.options&&['A','B','C','D','E'].every(a=>typeof q.options[a]==='string'&&q.options[a].trim()),'Five populated options');
assert.equal(q.textStatus,'editorial-draft-requires-source-proof');
assert.equal(q.sourceStatus,'typed-review-needed');
}else{
assert.equal(q.text,null,'No generated placeholder text in data');
assert.equal(q.options,null,'No guessed options where OCR missing');
assert.equal(q.sourceStatus,'source-pdf-required');
}
}
}
assert.match(read('pyq-hub.html'),/tnpsc-g4-typed-review\.html\?year=2024/);
assert.match(read('pyq-hub.html'),/tnpsc-g4-typed-review\.html\?year=2025/);
assert.match(read('sitemap.xml'),/tnpsc-g4-typed-review\.html/);
console.log('PASS Group IV 2024/2025 source-linked typed reviews: 3 and 10 draft questions, 200 slots each, key-mapped without fabricated text.');
