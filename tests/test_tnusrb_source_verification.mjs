import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('tnusrb-source-verification.html');
const a=JSON.parse(read('data/quizzes/tnusrb-si-2010-open-type-a.json'));
const b=JSON.parse(read('data/quizzes/tnusrb-si-2015-open.json'));
const c=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
assert.equal(a.bookletType,'A');
assert.equal(b.quota,'Open');
assert.equal(c.bookletSeries,'C');
assert.equal(a.questions.length,140);
assert.equal(b.questions.length,140);
assert.equal(c.questions.length,137);
assert.equal(a.availableForQuizCount,140);
assert.equal(b.playableQuestionCount,134);
assert.equal(c.playableQuestionCount,137);
assert.deepEqual(b.blockedNumbers,[99,100,101,102,103,104]);
assert.deepEqual(c.missingNumbers,[114,115,116]);
assert.equal(b.provisionallyScoreableQuestionCount,116);
assert.equal(b.ungradedReadableQuestionCount,18);
assert.equal(c.scoredQuestionCount,127);
for(const n of b.blockedNumbers){
 const q=b.questions[n-1];
 assert.equal(q.scoringStatus,'blocked_source_incomplete','Never attempt to grade missing graph Q'+n);
 assert.equal(q.graphSourceEvidence.requiredProductionGraphPresent,false,'Never claim recovered graph without visual evidence');
 assert.equal(q.graphSourceEvidence.scoringAllowed,false);
}
const q100=b.questions[99];
const variants=q100.graphSourceEvidence.competingSecondaryOptionC;
assert.equal(variants.numberedArchiveOriginalQ100,'1996');
assert.equal(variants.athiyamanCompiledPsychologyQ85,'1995');
assert.equal(variants.additionalNumberedSource2015.optionC,'1995');
assert.equal(variants.additionalNumberedSource2015.verifiedOriginalGraph,false);
for(const n of [84,95,103,47]){
 const q=c.questions.find(x=>x.number===n);
 assert.equal(q.scoringStatus,'ungraded_source_dispute','Cross-series figure/matrix must never be graded');
 assert.deepEqual(q.acceptedAnswers,[]);
}
assert.equal(c.originalBookletAccess.originalBookletVerifiedByClearExams,false);
assert.ok(c.missingNumbers.every(n=>c.missingSourceEvidence[n]?.scoringAllowed===false));
const requiredLinks=[
 'href="tnusrb-source-verification.html"','href="tnusrb-si-2015-quiz.html"',
 'href="tnusrb-si-2020-quiz.html"',
 'href="https://www.tnusrb.tn.gov.in/pdfs/SI_2019_WT_QUESTION.pdf"'
];
for(const s of requiredLinks.slice(1))assert.ok(html.includes(s),'Expected source link '+s);
assert.match(html,/graph itself has not been verified/,'Missing chart warning');
assert.match(html,/not certified original Series C diagrams/,'Non-original figure disclosure');
assert.match(html,/Departmental examination papers/,'Only Open quota papers');
assert.match(html,/originalBookletVerifiedByClearExams!==false/,'Source attestation must fail closed');
assert.match(html,/blocked\.join\(','\)!=='99,100,101,102,103,104'/);
assert.match(html,/missing\.join\(','\)!=='114,115,116'/);
assert.match(html,/fetch\(path,\{cache:'no-store'\}\)/,'Live data, not hand-coded fake completion');
assert.doesNotMatch(html,/innerHTML/,'Never insert untrusted source question text into HTML');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'No duplicate HTML IDs');
assert.match(read('pyq-hub.html'),/tnusrb-source-verification\.html/,'Hub exposes verified source gap tracker');
assert.match(read('tnusrb\/previous_year_questions.html'),/\.\.\/tnusrb-source-verification\.html/,'Year archive links the source tracker');
assert.match(read('sitemap.xml'),/tnusrb-source-verification\.html/,'SEO sitemap includes status page');
console.log('PASS TNUSRB Open Candidates: 2010 140; 2015 134 with six missing-graph slots; 2020 137 with three missing Series C slots; no unverified marks.');
