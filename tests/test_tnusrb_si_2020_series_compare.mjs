/* TNUSRB SI A/B/C/D booklet-position key provenance.  No cross-series matching by row. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const matrix=JSON.parse(read('data/quizzes/tnusrb-si-2020-cross-series-keys.json'));
const c=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
const html=read('tnusrb-si-2020-series-compare.html');
const js=read('assets/js/tnusrb-si-2020-series-compare.js');
assert.equal(matrix.schemaVersion,1);
assert.deepEqual(matrix.series,['A','B','C','D']);
assert.equal(matrix.positionKeys.length,140);
assert.equal(matrix.noOtherSeriesQuestionTextAutoSubstituted,true);
assert.deepEqual(matrix.unresolvedSeriesCOriginalPositions,[114,115,116]);
assert.deepEqual(matrix.unresolvedSeriesCOriginalPositions,c.missingNumbers);
assert.equal(matrix.source,c.answerKey.sourcePDF,'All-series key and C source share exact printed final-key PDF');
assert.equal(c.questions.length,137,'No unsupported question text was inserted');
assert.equal(c.scoredQuestionCount,127,'Unverified source gap cannot change score');
assert.equal(c.playableQuestionCount,137,'Cross-series key rows do not create original Series C questions');
assert.equal(c.originalBookletAccess.originalBookletVerifiedByClearExams,false);
for(let i=0;i<140;i++){
 const r=matrix.positionKeys[i];
 assert.equal(r.number,i+1);
 for(const s of matrix.series)assert.match(r[s],/^(?:[A-D](?:\/[A-D]){0,3}|ALL)$/);
 assert.equal(r.C,c.answerKey.answers[i],'C key must match published quiz manifest position '+(i+1));
}
assert.deepEqual(matrix.proofRows.map(r=>r.cNumber),[114,115,116]);
assert.deepEqual(matrix.proofRows.map(r=>[r.keyA,r.keyB,r.keyC,r.keyD]),[
 ['A','D','B','C'],['C','B','C','A'],['A/D','D','D','D']
],'Verified page-six A/B/C/D final key entries for original C gap positions');
for(const row of matrix.proofRows){
 assert.deepEqual([row.keyA,row.keyB,row.keyC,row.keyD],['A','B','C','D'].map(s=>matrix.positionKeys[row.cNumber-1][s]));
}
assert.equal(matrix.knownSeriesDToCMatches.length,8);
assert.deepEqual(matrix.knownSeriesDToCMatches.map(x=>[x.c,x.d]),[
 [14,73],[15,80],[37,16],[46,25],[47,26],[84,138],[95,88],[121,114]
]);
const matched=new Set();
for(const m of matrix.knownSeriesDToCMatches){
 assert.ok(c.questions.some(q=>q.number===m.c),'Only extant C originals may be cross-matched');
 assert.ok(!matched.has(m.c),'Duplicate C mapping');matched.add(m.c);
 assert.ok(m.verification.length>=26);
 assert.ok(['ungraded','provisional-series-c-key'].includes(m.grade));
}
for(const n of [114,115,116]){
 assert.equal(c.questions.some(q=>q.number===n),false,'Original C source hole remains absent');
 assert.equal(c.missingSourceEvidence[n].scoringAllowed,false);
}
assert.ok(matrix.rule.includes('NOT cross-series equivalents'));
assert.ok(matrix.requiredBeforeRecovery.includes('Never use Departmental'));
assert.match(html,/Series C Q114 is <strong>not<\/strong> the same question as Series D Q114/);
assert.match(html,/Only General Candidates/);
assert.match(html,/id="rows"/);
assert.match(html,/id="knownMatches"/);
assert.match(html,/id="gapCards"/);
assert.match(html,/id="status"/);
assert.match(js,/r.C===seriesC.answerKey.answers\[i\]/,'Client verifies every C row before showing A/B/D');
assert.match(js,/matrix.noOtherSeriesQuestionTextAutoSubstituted===true/);
assert.match(js,/\[114,115,116\]/);
assert.ok(!js.includes('innerHTML'),'No untrusted source HTML injection');
new vm.Script(js);
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size);
assert.match(read('pyq-hub.html'),/tnusrb-si-2020-series-compare\.html/);
assert.match(read('tnusrb-source-verification.html'),/tnusrb-si-2020-series-compare\.html/);
assert.match(read('sitemap.xml'),/tnusrb-si-2020-series-compare\.html/);
console.log('PASS TNUSRB SI 2020: 140 A/B/C/D final-key rows verified against C, eight documented cross-series matches, 3 missing C originals still ungraded.');
