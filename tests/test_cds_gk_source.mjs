import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const base=path.join(root,'data','quizzes','cds-gk');
const idx=JSON.parse(fs.readFileSync(path.join(base,'index.json'),'utf8'));
assert.equal(idx.schemaVersion,1);assert.equal(idx.exam,'UPSC CDS');
assert.equal(idx.gradingEnabled,false);assert.equal(idx.officialAnswerKeyMapped,false);
assert.equal(idx.sourceUploadedPapers,16);assert.equal(idx.paperStatuses.length,16);
const seen=new Set();let stems=0,options=0,scans=0;
for(const entry of idx.paperStatuses){
 assert.ok(!seen.has(entry.id),'Duplicate CDS source paper id');seen.add(entry.id);
 assert.match(entry.id,/^cds-(i|ii)-20\d\d-gk$/);
 assert.ok(Number.isInteger(entry.textStems)&&entry.textStems<=120);
 assert.ok(Number.isInteger(entry.provisionalFourOptionSets)&&entry.provisionalFourOptionSets<=entry.textStems);
 assert.equal(entry.textStems+0,entry.textStems);
 const p=JSON.parse(fs.readFileSync(path.join(base,entry.output),'utf8'));
 assert.equal(p.id,entry.id);assert.equal(p.section,'General Knowledge');assert.equal(p.exam,'UPSC CDS');
 assert.equal(p.year,entry.year);assert.equal(p.session,entry.session);assert.equal(p.grading,'disabled');
 assert.equal(p.officialAnswerKeyChecked,false);assert.equal(p.officialOriginalConfirmed,false);
 assert.equal(p.originalQuestionCountExpected,120);assert.equal(p.questions.length,120);
 assert.equal(p.stats.textStems,entry.textStems);assert.equal(p.stats.provisionalFourOptionSets,entry.provisionalFourOptionSets);
 assert.equal(p.unresolvedQuestionNumbers.length,entry.unresolvedPositions);
 for(let n=1;n<=120;n++){
  const q=p.questions[n-1];assert.equal(q.number,n);assert.equal(q.scoreEligible,false);assert.equal(q.correctAnswer,null);assert.equal(q.ungraded,true);
  for(const L of 'ABCD')assert.equal(typeof q.options[L],'string');
 }
 if(p.textExtractionMethod.includes('scan-ocr'))scans++;
 stems+=entry.textStems;options+=entry.provisionalFourOptionSets;
}
assert.equal(scans,7);assert.equal(idx.paperStatuses.length-scans,9);
const reviewed=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2019-gk.json'),'utf8'));
assert.deepEqual(reviewed.questions.slice(0,27).map(q=>q.number),Array.from({length:27},(_,i)=>i+1));
for(const q of reviewed.questions.slice(0,27)){
 assert.equal(q.extraction,'provisional-four-options','Source-checked question should have all four printed alternatives');
 assert.equal(q.sourceMethod,'manual-uploaded-scan-transcription-unverified');
 assert.ok(q.text.length>17);
 assert.equal(q.correctAnswer,null);
 assert.equal(q.scoreEligible,false);
 assert.equal(q.ungraded,true);
 assert.equal(q.issues.some(x=>/answer key/i.test(x)),true);
 assert.equal(q.sourcePages.length,1);
 assert.equal(q.sourcePages[0],q.number<=7?3:q.number<=13?5:q.number<=20?7:9);
 assert.ok('ABCD'.split('').every(l=>q.options[l].trim().length>0));
}
assert.match(reviewed.questions[0].text,/motto of NCC/);
assert.equal(reviewed.questions[0].options.A,'Unity and Discipline');
assert.match(reviewed.questions[7].text,/National Institute of Ayurveda/,'Matching alternatives must retain list definitions');
assert.match(reviewed.questions[8].text,/National Investment Promotion and Facilitation Agency/);
assert.match(reviewed.questions[12].text,/Italian Open Women/);
assert.match(reviewed.questions[20].text,/Vernacular Press Act/);
assert.match(reviewed.questions[26].text,/Mediterranean climate/);
assert.equal(reviewed.stats.provisionalFourOptionSets,33);
assert.equal(reviewed.stats.textStems,61);
assert.equal(reviewed.unresolvedQuestionNumbers.length,87);
assert.equal(idx.paperStatuses.find(x=>x.id===reviewed.id).provisionalFourOptionSets,33);

assert.match(fs.readFileSync(path.join(root,'pyq-cds.html'),'utf8'),/120 numbered positions per paper/);
const js=fs.readFileSync(path.join(root,'assets','js','pyq-cds.js'),'utf8');
assert.match(js,/correctAnswer!==null/);assert.match(js,/scoreEligible!==false/);
assert.match(js,/cacheKey/);assert.match(js,/exportResponses/);
assert.match(js,/officialAnswerKeyChecked!==false/);
console.log(`PASS: ${idx.paperStatuses.length} CDS source papers, ${stems} machine-recovered stems, ${options} provisional A-D blocks, 0 official keys and no scores`);