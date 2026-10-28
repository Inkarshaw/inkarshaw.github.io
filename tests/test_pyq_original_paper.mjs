// Verify complete original PDF companion quizzes without misleading transcription or auto-scoring claims.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(read('data/quizzes/original-paper-practice.json'));
const bank=JSON.parse(read('data/quizzes/verified-pyqs.json'));
const html=read('pyq-original-paper.html');
const js=read('assets/js/pyq-original-paper.js');
const hub=read('pyq-hub.html');
const adapted=read('pyq-full-quiz.html');
assert.equal(data.schemaVersion,1);
assert.equal(data.papers.length,3,'Three official PDF companion quiz sessions');
assert.deepEqual(data.papers.map(p=>p.year).sort((a,b)=>a-b),[2022,2024,2025]);
const ids=new Set();
for(const paper of data.papers){
  assert.ok(!ids.has(paper.id),'Stable unique paper IDs');ids.add(paper.id);
  assert.ok(paper.id.includes(String(paper.year)));
  assert.equal(paper.questionCount,200,'Each official Group IV booklet contains 200 questions');
  assert.equal(paper.durationMinutes,180);
  assert.equal(paper.marksPerQuestion,1.5);
  assert.deepEqual(paper.optionLetters,['A','B','C','D','E'],'A–E original OMR format');
  assert.deepEqual(paper.correctOptionLetters,['A','B','C','D']);
  assert.equal(paper.unknownOption,'E');
  assert.equal(paper.transcriptionStatus,'not-transcribed');
  assert.equal(paper.answerKeyStatus,'official-pdf-only');
  assert.equal(paper.copyrightClearance,'not-confirmed');
  assert.equal(paper.format,'official-pdf-answer-sheet');
  assert.match(paper.paperUrl,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\/.*\.pdf$/i);
  assert.match(paper.answerKeyUrl,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\/.*\.pdf$/i);
}
assert.equal(data.papers.reduce((n,p)=>n+p.questionCount,0),600);
assert.equal(bank.filter(q=>q.SourceExam==='TNPSC Group IV'&&q.SourceYear==='2024').length,20,'Adapted questions remain separate');
assert.ok(!data.papers.some(x=>x.transcriptionStatus==='verified-full'));
assert.match(html,/Paper text is not transcribed/);
assert.match(html,/Automatic marking is disabled/);
assert.match(html,/pyq-original-paper\.js/);
assert.match(html,/id="timed"/);
assert.match(html,/id="timer"/);
for(const id of ['papers','paperPicker','answerSheet','result','palette','answerChoices','answerOverview','sourcePaper','sourceKey','finish','returnToSheet']){
  assert.ok(html.includes('id="'+id+'"'),id+' missing');
}
assert.match(js,/currentPaper\.optionLetters/,'Use paper-specific original options');
assert.match(js,/letter==='E'/,'Show original E answer-not-known option');
assert.match(js,/durationMinutes/,'Respect original exam duration');
assert.match(js,/setInterval\(tick,1000\)/);
assert.match(js,/Array\(p\.questionCount\)\.fill\(null\)/);
assert.match(js,/localStorage/);
assert.ok(!js.includes('CorrectAnswer'),'Unavailable official-key mapping cannot be guessed');
assert.match(hub,/Original 200-question paper/);
assert.match(hub,/pyq-original-paper\.html/);
assert.match(hub,/pyq-full-quiz\.html/);
assert.match(adapted,/All Available Adapted PYQs/);
assert.match(adapted,/Not a complete original paper/);
assert.match(read('sitemap.xml'),/pyq-original-paper\.html/);
new vm.Script(js,{filename:'assets/js/pyq-original-paper.js'});
console.log('Three full-length official PDF quiz companions: 600 OMR slots, A–E, saved answers and optional timer.');
