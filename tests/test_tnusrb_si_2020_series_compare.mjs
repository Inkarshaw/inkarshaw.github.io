/* TNUSRB SI A/B/C/D booklet-position key provenance.  No cross-series matching by row. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const matrix=JSON.parse(read('data/quizzes/tnusrb-si-2020-cross-series-keys.json'));
const c=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
const crosswalk=JSON.parse(read('data/quizzes/tnusrb-si-2020-psychology-crosswalk.json'));
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
assert.equal(crosswalk.schemaVersion,1);
assert.equal(crosswalk.sourceFinalKey,matrix.source,'Crosswalk key source must be same as base A/B/C/D matrix');
assert.equal(crosswalk.seriesCOriginalPagesViewed,false);
assert.equal(crosswalk.noAutomaticSeriesCOriginalSubstitution,true);
assert.equal(crosswalk.psychologyMappings.length,60,'All Psychology positions must be mapped exactly once');
assert.equal(crosswalk.existingStemMatches,57);
assert.equal(crosswalk.candidateUnverifiedMappings,3);
assert.deepEqual(crosswalk.psychologyMappings.map(x=>x.seriesDNumber),Array.from({length:60},(_,i)=>i+81));
assert.deepEqual([...crosswalk.psychologyMappings.map(x=>x.seriesCNumber)].sort((a,b)=>a-b),Array.from({length:60},(_,i)=>i+81));
let verifiedStemMatches=0;
let provisionalPositions=0;
for(const m of crosswalk.psychologyMappings){
 assert.equal(matrix.positionKeys[m.seriesCNumber-1].C,matrix.positionKeys[m.seriesDNumber-1].D,'Matched keys differ for C '+m.seriesCNumber);
 if(m.verification==='stem_compared_against_existing_c_and_key_agrees'){
  assert.ok(c.questions.some(q=>q.number===m.seriesCNumber),'Matched original-numbered C stem must exist');
  verifiedStemMatches++;
 }else{
  assert.equal(m.verification,'candidate_by_elimination_not_original_c');
  assert.ok([114,115,116].includes(m.seriesCNumber),'Only absent C positions may use inference');
  provisionalPositions++;
 }
}
assert.equal(verifiedStemMatches,57);
assert.equal(provisionalPositions,3);
const candidates=crosswalk.sourceSeriesDCandidateQuestions;
assert.deepEqual(candidates.map(x=>[x.seriesCPositionHypothesis,x.seriesDPrintedNumber]),[[114,107],[115,108],[116,109]]);
for(const x of candidates){
 assert.equal(x.originalSeriesCStemVerified,false);
 assert.equal(x.originalSeriesCOptionsVerified,false);
 assert.equal(x.scoringAllowed,false);
 assert.deepEqual(Object.keys(x.seriesDSourceOptions),['A','B','C','D']);
 assert.equal(x.seriesCFinalKey,matrix.positionKeys[x.seriesCPositionHypothesis-1].C);
 assert.equal(x.seriesDFinalKey,matrix.positionKeys[x.seriesDPrintedNumber-1].D);
 assert.ok(x.seriesDSourceQuestion.length>45);
}
assert.deepEqual(candidates.map(x=>x.seriesDFinalKey),['B','C','D']);
assert.match(candidates[2].caution,/conflict is unresolved/,'D109 series/key disagreement must remain prominent');
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
assert.match(html,/id="psychologyRows"/);
assert.match(html,/id="candidateCards"/);
assert.match(html,/not certification of original Series C wording/);
assert.match(html,/id="status"/);
assert.match(js,/r.C===seriesC.answerKey.answers\[i\]/,'Client verifies every C row before showing A/B/D');
assert.match(js,/matrix.noOtherSeriesQuestionTextAutoSubstituted===true/);
assert.match(js,/tnusrb-si-2020-psychology-crosswalk\.json/);
assert.match(js,/renderStudyCandidates\(crosswalk\)/);
assert.match(js,/\[114,115,116\]/);
assert.ok(!js.includes('innerHTML'),'No untrusted source HTML injection');
new vm.Script(js);
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size);
assert.match(read('pyq-hub.html'),/tnusrb-si-2020-series-compare\.html/);
assert.match(read('tnusrb-source-verification.html'),/tnusrb-si-2020-series-compare\.html/);
assert.match(read('sitemap.xml'),/tnusrb-si-2020-series-compare\.html/);
console.log('PASS TNUSRB SI 2020: 140 A/B/C/D final-key rows verified against C, eight existing source matches plus a 57-pair Psychology crosswalk and 3 D-sourced study candidates; C original gaps still ungraded.');
