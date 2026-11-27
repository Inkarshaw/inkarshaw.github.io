/* Independent scoring exception audit; a typed question is not automatically gradable. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const json = p => JSON.parse(read(p));
const cat = json('data/quizzes/typed-pyq-catalog.json');
const review = json('data/quizzes/pyq-scoring-review.json');
const by = id => { const p = review.papers.find(x => x.id === id); assert.ok(p, 'Missing paper ' + id); return p; };
const numbers = list => list.map(x => typeof x === 'number' ? x : x.number).sort((a,b)=>a-b);
const match = (id, expectedAll, expectedDisputes, expectedUnmapped=0) => {
 const r=by(id),c=cat.entries.find(e=>e.id===id); assert.ok(c);
 assert.equal(r.playable,c.typed,id+' playable');
 assert.equal(r.provisionallyScorable,c.scorable,id+' scorable');
 assert.equal(r.notScored,c.typed-c.scorable,id+' ungraded');
 assert.equal(r.notMappedToQuestionText,expectedUnmapped,id+' unmapped');
 assert.deepEqual(numbers(r.specialAllNumbers),numbers(expectedAll),id+' ALL');
 assert.deepEqual(numbers(r.sourceDisputes),numbers(expectedDisputes),id+' disputes');
 assert.equal(new Set([...r.specialAllNumbers,...r.sourceDisputes.map(q=>q.number)]).size,
              r.specialAllNumbers.length+r.sourceDisputes.length,id+' duplicate categories');
 assert.equal(r.notScored,r.notMappedToQuestionText+r.specialAllNumbers.length+r.sourceDisputes.length);
 assert.ok(existsSync(new URL('../'+r.quizUrl.split('?')[0],import.meta.url)),id+' quiz route');
 assert.ok(r.answerKeyEvidence.length>30 && r.reviewNextStep.length>30,id+' review rationale');
};
assert.equal(review.schemaVersion,1);
assert.equal(review.updatedOn,cat.updatedOn,'Audit date must reflect catalogue revision');
assert.equal(review.papers.length,8);
assert.equal(new Set(review.papers.map(p=>p.id)).size,8);
const previouslyAudited=new Set(review.papers.map(p=>p.id));
assert.ok([...previouslyAudited].every(id=>cat.entries.some(e=>e.id===id)), 'Retain the original eight-paper scoring audit without silently broadening its scope');
const newTyped=cat.entries.filter(e=>!previouslyAudited.has(e.id));
const group2Readers = ['general-tamil-ccse2-2at', 'general-english-ccse2-2ae', 'gs-ccse2-2at']
 .map(section => 'tnpsc-group-ii-iia-2025-' + section + '-reviewed');
assert.deepEqual(newTyped.map(e=>e.id).sort(),[...group2Readers,...[2015,2017,2019,2021,2022,2024,2025].map(y=>'tnpsc-g1-'+y),'upsc-cse-2026-csat','upsc-cse-2026-gs1'].sort());
const group1Years=json('data/quizzes/tnpsc-group1-all-years.json');
for(const entry of newTyped){
 if(group2Readers.includes(entry.id)){
  const paper=json('data/quizzes/pyq-reader-drafts/'+entry.id+'.json');
  assert.equal(entry.scorable,0,'TNPSC tentative marks must not award points');
  assert.equal(paper.officialFinalKeyMapped,false);
  assert.equal(paper.grading,'disabled');
  assert.equal(paper.questionCandidates.length,entry.typed);
  assert.ok(paper.questionCandidates.every(q=>q.correctAnswer===null&&q.scoreEligible===false));
  continue;
 }
 if(entry.exam==='UPSC'){
  const p=json('data/quizzes/'+entry.id+'.json');
  assert.equal(entry.scorable,0,'No UPSC provisional marks before key mapping');
  assert.equal(p.grading,'disabled');assert.equal(p.questions.length,entry.typed);
  assert.ok(p.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false));
  continue;
 }
 const matching=group1Years.entries.find(x=>x.year===entry.year);
 assert.ok(matching&&matching.typedQuestionCount===entry.typed);
 assert.equal(matching.provisionallyScorable,entry.scorable,'Newly listed typed year gets its separately maintained key status');
}
const g26=json('data/quizzes/tnpsc-group-i-2026-prelims-text.json');
assert.equal(g26.keyedAnswerCount,0,'Do not invent unmapped 2026 keys');
assert.equal(g26.questions.filter(q=>q.answer!==null).length,0);
assert.deepEqual(numbers(by('tnpsc-g1-2026').additionalTextWarnings),[...g26.sourceReviewQuestionNumbers,...g26.secondaryTextReviewQuestionNumbers].sort((x,y)=>x-y));
assert.equal(g26.textReadyCount,198);
assert.equal(g26.needsReviewCount,2);
assert.equal(g26.secondaryTextReviewCount,5);
assert.match(g26.officialTentativeSource,/05_2026_CCSEI-GS\.pdf/);
match('tnpsc-g1-2026',[],[],200);
for(const y of [2024,2025]){
 const d=json('data/quizzes/tnpsc-g4-'+y+'-typed-review.json');
 match('tnpsc-g4-'+y,d.questions.filter(q=>q.keyToken==='ALL').map(q=>q.number),[]);
 assert.equal(d.verifiedQuestionCount,0,'Do not equate mapped scores with visual verbatim certification');
}
const keys=json('data/quizzes/original-final-keys.json');
const key22=keys.papers.find(p=>p.id==='tnpsc-group-iv-2022-general-tamil-general-studies');
assert.ok(key22);
const q22=[...json('data/quizzes/tnpsc-g4-2022-user-transcription-tamil-draft.json').questions,
           ...json('data/quizzes/tnpsc-g4-2022-user-transcription-english-draft.json').questions];
const missing22=q22.filter(q=>q.textStatus==='incomplete_user_transcription' ||
 ['A','B','C','D','E'].some(l=>/\[(?:not legible|not shown|missing)/i.test(q.options?.[l]||'')));
match('tnpsc-g4-2022',key22.answers.flatMap((x,i)=>x==='ALL'?[i+1]:[]),missing22.map(q=>q.number));
const repaired22=q22.find(q=>q.number===19);
assert.equal(repaired22.textStatus,'secondary_source_text_cross_checked');
assert.match(repaired22.question,/௩௬௯/);
assert.match(repaired22.question,/௩௨௧/);
assert.match(repaired22.question,/௫௪௩/);
assert.match(repaired22.question,/௮௭௬/);
assert.equal(key22.answers[18],'C','Q19 Tamil numeral conversion agrees with official Version A key');
assert.equal(by('tnpsc-g4-2022').provisionallyScorable,196);
const g11=json('data/quizzes/tnpsc-g1-2011-series-d-typed.json');
match('tnpsc-g1-2011',g11.questions.filter(q=>q.keyStatus==='all-options-accepted-ungraded').map(q=>q.number),[]);
const s20=json('data/quizzes/tnusrb-si-2020-series-c.json');
match('tnusrb-si-2020',s20.questions.filter(q=>q.scoringStatus==='ungraded_all_correct').map(q=>q.number),
 s20.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').map(q=>q.number));
const s15=json('data/quizzes/tnusrb-si-2015-open.json');
match('tnusrb-si-2015',[],s15.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').map(q=>q.number));
const s10=json('data/quizzes/tnusrb-si-2010-open-type-a.json');
match('tnusrb-si-2010',s10.questions.filter(q=>q.scoringStatus==='ungraded_all_correct').map(q=>q.number),
 s10.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').map(q=>q.number));
const totals=review.papers.reduce((a,p)=>({
 papers:a.papers+1,playable:a.playable+p.playable,
 provisionallyScorable:a.provisionallyScorable+p.provisionallyScorable,
 notScored:a.notScored+p.notScored,
 notMappedToQuestionText:a.notMappedToQuestionText+p.notMappedToQuestionText,
 specialAllExcluded:a.specialAllExcluded+p.specialAllNumbers.length,
 sourceDisputes:a.sourceDisputes+p.sourceDisputes.length
}),{papers:0,playable:0,provisionallyScorable:0,notScored:0,notMappedToQuestionText:0,specialAllExcluded:0,sourceDisputes:0});
assert.deepEqual(totals,review.totals,'All 264 unscored positions must reconcile with source manifests');
assert.equal(totals.playable,1420);
assert.equal(totals.provisionallyScorable,1156);
assert.equal(totals.notScored,264);
assert.equal(totals.notMappedToQuestionText,200);
assert.equal(totals.specialAllExcluded,31);
assert.equal(totals.sourceDisputes,33);
const html=read('pyq-scoring-review.html'),js=read('assets/js/pyq-scoring-review.js');
for(const text of ['1,156 / 1,420','200','31','32','id="paperSelect"','id="selectedDetails"','pyq-scoring-review.js']){
 assert.ok(html.includes(text),'Review page missing '+text);
}
assert.ok(!js.includes('innerHTML'),'Never insert source-review text as HTML');
assert.ok(js.includes('cache:\'no-store\''),'Use fresh source-backed scoring register');
assert.ok(read('pyq-typed-library.html').includes('pyq-scoring-review.html'),'Published library links scoring review');
console.log('PASS scoring transparency: 1,420 playable; 1,156 provisional scores; 200 unmapped; 31 special ALL; 33 source disputes, all number lists source-backed.');
