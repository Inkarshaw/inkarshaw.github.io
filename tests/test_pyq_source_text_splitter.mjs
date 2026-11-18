// Source-text segmentation: all original positions, no invented questions or answer keys.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const code=read('assets/js/pyq-source-text-splitter.js');
new vm.Script(code,{filename:'pyq-source-text-splitter.js'});
const ctx={};vm.runInNewContext(code,ctx,{timeout:2500});
const api=ctx.ClearExamsPYQSourceSplitter;
assert.ok(api&&typeof api.parse==='function');
const fixture={schemaVersion:1,id:'tnpsc-group-iv-2016-test',sourcePdf:'https://www.tnpsc.gov.in/test.pdf',
 pages:[{pdfPage:1,text:'IO 1. How many electrons carry charge?\n(A) Zero\n(B) First\n(C) Second\n(D) Third\n\n103. What is the name of DDT?\n(A) Foo\n(B) Bar\n(C) Baz\n(D) Qux'}]};
const result=api.parse(fixture);
assert.equal(result.questions.length,100);
assert.equal(result.questions[0].number,101);
assert.equal(result.questions[0].sourcePdfPage,1);
assert.match(result.questions[0].text,/electrons/);
assert.equal(result.questions[0].options.A,'Zero');
assert.equal(result.questions[0].options.B,'First');
assert.equal(result.questions[0].fourOptionsDetected,true);
assert.equal(result.questions[1].number,102);
assert.equal(result.questions[1].textRecovered,false);
assert.equal(result.questions[1].sourcePdfPage,null);
assert.equal(result.questions[1].options.A,'');
assert.equal(result.questions[2].number,103);
assert.equal(result.questions[2].options.D,'Qux');
const damaged=api.optionsAndStem([
 'What is the answer?',
 '     (A)  First              (8)   Second',
 '     (C)  Third              (D)   Fourth',
 '     (E)  Answer not known',
 '     (A)  local Tamil copy',
 '     (8)  translated second',
 '     (C)  local third',
 '     (D)  local fourth'
]);
assert.equal(damaged.options.A,'First');
assert.equal(damaged.options.B,'Second');
assert.equal(damaged.options.C,'Third');
assert.equal(damaged.options.D,'Fourth');
assert.ok(damaged.normalizedLabels.includes('B'),'Confusable B labels must be visibly flagged');
assert.equal(damaged.fourOptionsDetected,true,'OCR-distorted B label should retain selectable alternatives');
assert.ok(damaged.alternativeGroups>0,'Translated rows should not be silently merged with English labels');
const damagedNumber=api.numberMarker('  105\'. Buddhist poet Asvaghosa wrote a language.',{from:101,to:200},6);
assert.equal(damagedNumber.number,105,'Stray apostrophes must not hide whole questions');
const damagedDouble=api.numberMarker('   14.. Choose the meaning of a word.',{from:1,to:100},6);
assert.equal(damagedDouble.number,14,'Duplicate punctuation must not hide questions');

assert.ok(result.questions.every(q=>q.scoreEligible===false&&q.acceptedAnswers.length===0));
assert.equal(result.grading,'disabled');
assert.equal(result.verifiedOriginalText,false);
assert.equal(api.parse({id:'unrecognized',pages:[]}),null);
const sources=[
 ['tnpsc-group-ii-iia-2022-general-english-ccs2e-2022-answer-key-opt-a4ab2eb8',1,100,80,1,70],
 ['tnpsc-group-ii-iia-2022-general-studies-ccs2e-2022-answer-key-opt-5aaa9a34',101,200,93,25,90],
 ['tnpsc-group-iv-2016-06-11-2016-g4-gs-3a616959',101,200,96,59,95]
];
let totals={stems:0,complete:0,optionPairs:0};
for(const [id,from,to,minRecovered,minComplete,minPairs] of sources){
 const original=JSON.parse(read('data/quizzes/pyq-reader-drafts/'+id+'.json'));
 const parsed=api.parse(original);
 assert.ok(parsed,'Expected exact source paper '+id);
 assert.equal(parsed.questions.length,100);
 assert.equal(parsed.questions[0].number,from);
 assert.equal(parsed.questions[99].number,to);
 assert.ok(parsed.stats.recoveredStems>=minRecovered,id+' recovers too few question stems: '+parsed.stats.recoveredStems);
 assert.ok(parsed.stats.recoveredStems<=100);
 assert.ok(parsed.stats.aToDOptionSets>=minComplete,id+' complete printed option sets dropped');
 assert.ok(parsed.stats.atLeastTwoOptions>=minPairs,id+' at-least-two printed options dropped');
 totals.stems+=parsed.stats.recoveredStems;
 totals.complete+=parsed.stats.aToDOptionSets;
 totals.optionPairs+=parsed.stats.atLeastTwoOptions;
 assert.ok(parsed.stats.aToDOptionSets<=parsed.stats.recoveredStems);
 assert.equal(parsed.stats.numberedPositions,100);
 assert.equal(parsed.stats.recoveredStems+parsed.stats.missingStems.length,100);
 assert.ok(parsed.questions.every(q=>q.scoreEligible===false&&q.acceptedAnswers.length===0));
 assert.ok(parsed.questions.every(q=>q.options&&Object.keys(q.options).join(',')==='A,B,C,D,E'));
 console.log(id, 'stems',parsed.stats.recoveredStems,'complete A-D',parsed.stats.aToDOptionSets,'at least 2 options',parsed.stats.atLeastTwoOptions);
}
assert.equal(totals.stems,269,'All real-data recovered stems must be reported accurately');
assert.equal(totals.complete,85,'Provisional A–D labelled sets must not be misstated');
assert.equal(totals.optionPairs,259,'Detected printed alternative pairs must not be misstated');
console.log('PASS: 300 original-numbered question slots, explicit missing text, no inferred keys, ungraded structured export.');
