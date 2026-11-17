// Independent row-order witness of TNPSC GS0811 omega final key, 08 Nov 2015.
// Source table (25 printed rows x 8 question-number columns):
// https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GR_I_92K15_FIN_ANSKEY.pdf
// This witness intentionally uses the printed ROW order instead of the live
// manifest's question-order serialization, so shifted columns fail.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const records=read('data/quizzes/original-final-keys.json').papers;
const sources=read('data/quizzes/original-paper-practice.json').papers;
const id='tnpsc-group-i-2015-preliminary-general-studies';
const k=records.find(p=>p.id===id),p=sources.find(p=>p.id===id);
assert.ok(k&&p,'Same-series 2015 official PDF and final-key record must exist');
assert.equal(p.paperVersion,k.paperVersion);
assert.equal(p.paperVersion,'GS0811/2015 · General Studies · ω booklet');
assert.equal(k.sourceUrl,'https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GR_I_92K15_FIN_ANSKEY.pdf');
assert.equal(p.answerKeyUrl,k.sourceUrl);
assert.equal(p.paperUrl,'https://www.tnpsc.gov.in/Tentative/Document/08_11_2015_gk.pdf');
assert.equal(p.answerKeyStatus,'official-final-key-GS0811-omega');
assert.equal(k.questionCount,200);
assert.equal(k.marksPerQuestion,1.5);
const printedRows=[
'A C D B D A B C',
'B C B D C A A A',
'D D A D A C C D',
'A B C C D A A A',
'C C A B B C D C',
'A B C C B D B C',
'D D D B D A D B',
'C B A C B A A B',
'A B ALL C B A B D',
'D B C D A A B A',
'B B B D A C A B',
'D D D B C D D A',
'C C B D D C C B',
'A D D B B D D ALL',
'D D D A D A B B',
'C B D D D A A B',
'A C A ALL C D A D',
'C A D C A C B A',
'C C B B A C B B',
'A/C C C A A B A/B A',
'C C D A C A C A',
'C A C B A C A A',
'A A A C C B D B',
'B C C B A A B D',
'B A C B B A B C'
];
assert.equal(printedRows.length,25);
const expected=Array(200).fill(null);
printedRows.forEach((row,i)=>{
 const parts=row.split(' ');assert.equal(parts.length,8,'Official key table row '+(i+1));
 parts.forEach((answer,column)=>{expected[column*25+i]=answer});
});
assert.deepEqual(k.answers,expected,'All 200 answers must match the official row-wise GS0811 omega final key');
assert.deepEqual(k.answers.flatMap((answer,i)=>answer==='ALL'?[i+1]:[]),[59,92,189]);
assert.deepEqual(k.answers.flatMap((answer,i)=>answer.includes('/')?[i+1]:[]),[20,170]);
assert.equal(k.answers.filter(answer=>answer!=='ALL').length,197);
assert.equal((200-3)*p.marksPerQuestion,295.5);
assert.equal(p.transcriptionStatus,'not-transcribed','200 key entries are not 200 typed questions');
console.log('TNPSC Group I 2015 GS0811 omega: all 200 final-key positions matched by independent row-order fixture; 197 indicative grade slots.');
