/* TNUSRB PC 2019/2020/2022 source-numbered study-bank safety regression. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json = p => JSON.parse(read(p));
const years = [{year:2019,count:80,scored:0,figures:[56,60],series:'B'},
 {year:2020,count:80,scored:0,figures:[56,58,67,68,69,75,76,79],series:'D'},
 {year:2022,count:150,scored:141,figures:[48,51,65,66,67,68,69],series:'A'}];
const cat=json('data/quizzes/tnusrb-pc-catalog.json');
assert.equal(cat.schemaVersion,1);
assert.equal(cat.entries.length,3);
let all=0,scoredTotal=0;
for(const meta of years){
 const d=json('data/quizzes/tnusrb-pc-'+meta.year+'.json');
 const entry=cat.entries.find(e=>e.year===meta.year);
 assert.ok(entry,'Missing '+meta.year+' catalogue entry');
 assert.equal(d.schemaVersion,1);
 assert.equal(d.year,meta.year);
 assert.equal(d.bookletSeries,meta.series);
 assert.equal(d.questionCount,meta.count);
 assert.equal(d.questions.length,meta.count);
 assert.equal(d.provisionallyScorable,meta.scored);
 assert.equal(d.ungraded,meta.count-meta.scored);
 assert.equal(entry.total,meta.count);
 assert.equal(entry.typed,meta.count);
 assert.equal(entry.scorable,meta.scored);
 assert.equal(entry.link,'tnusrb-pc-quiz.html?year='+meta.year);
 assert.ok(d.sourceNote.includes('not a visually certified verbatim original booklet'));
 assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:meta.count},(_,i)=>i+1));
 assert.deepEqual(d.questions.filter(q=>q.figureRef).map(q=>q.number),meta.figures);
 const disputed = meta.year===2019 ? [55,64,66,69,71,72] : meta.year===2020 ? [4,5,34] : [];
 assert.deepEqual(d.questions.filter(q=>q.studyAnswerReliability==='disputed').map(q=>q.number),disputed,
  'Contested workbook answers must be explicitly identified for '+meta.year);
 for (const n of disputed) {
  const item=d.questions[n-1];
  assert.equal(item.scoringStatus,'ungraded_unverified_final_key');
  assert.deepEqual(item.acceptedAnswers,[]);
  assert.ok(item.editorialNote?.length>20,'Source dispute explanation required at Q'+n);
 }
 assert.equal(d.questions.filter(q=>q.scoringStatus==='provisional_key').length,meta.scored);
 for(const q of d.questions){
  assert.ok(q.question.trim()&&q.source&&q.topic&&q.section,meta.year+' Q'+q.number+' text and source');
  for(const l of ['A','B','C','D']){
   assert.ok(q.options[l].trim(),meta.year+' Q'+q.number+' option '+l);
   assert.ok(q.optionExplanations[l].trim(),meta.year+' Q'+q.number+' explanation '+l);
  }
  assert.ok(Array.isArray(q.acceptedAnswers));
  assert.ok(Array.isArray(q.studyAnswer));
  if(meta.year!==2022){
   assert.deepEqual(q.acceptedAnswers,[],'No official scoring letter for '+meta.year+' Q'+q.number);
   assert.equal(q.scoringStatus,'ungraded_unverified_final_key');
   assert.ok(q.studyAnswer.every(a=>['A','B','C','D'].includes(a)));
  }else{
   assert.deepEqual(q.studyAnswer,[]);
   assert.ok(q.acceptedAnswers.length>0 && q.acceptedAnswers.every(a=>['A','B','C','D'].includes(a)));
   if(q.figureRef) assert.equal(q.scoringStatus,'ungraded_missing_original_figure','Do not score a missing figure');
   else if([17,25].includes(q.number)) assert.equal(q.scoringStatus,'ungraded_all_options_accepted','No mark for ALL');
   else assert.equal(q.scoringStatus,'provisional_key','Other 2022 items are provisionally marked');
  }
 }
 all+=d.questionCount;scoredTotal+=d.provisionallyScorable;
}
const y20=json('data/quizzes/tnusrb-pc-2020.json');
assert.match(y20.questions[3].question,/Thermometer/,
 'Retain the supplied Q4 transcription; never silently rewrite a contested original label');
assert.match(y20.questions[3].editorialNote,/Hydrometer/,
 'Q4 must explain why Archimedes applies to a hydrometer, not a thermometer');
const y22=json('data/quizzes/tnusrb-pc-2022.json');
const q=n=>y22.questions[n-1];
assert.deepEqual(q(17).acceptedAnswers,['A','B','C','D']);
assert.deepEqual(q(25).acceptedAnswers,['A','B','C','D']);
assert.deepEqual(q(48).acceptedAnswers,['B','C']);
assert.deepEqual(q(108).acceptedAnswers,['A','B']);
assert.equal(q(108).scoringStatus,'provisional_key');
assert.equal(all,310);
assert.equal(scoredTotal,141);
const html=read('tnusrb-pc-quiz.html'),js=read('assets/js/tnusrb-pc-quiz.js');
for(const value of ['id="questionText"','id="palette"','id="feedback"','id="resultList"','id="start"','id="finish"','id="check"','id="prev"','id="next"','id="mode"','tnusrb-pc-quiz.js']){
 assert.ok(html.includes(value),'Missing quiz UI '+value);
}
for(const v of ["['2019', '2020', '2022']","q.scoringStatus === 'provisional_key'","localStorage.setItem","aria-pressed","sourcePaperUrl","window.confirm"]){
 assert.ok(js.includes(v),'Missing scoring / accessibility control '+v);
}
assert.ok(!js.includes('innerHTML'),'Question/source wording must be DOM text');
for (const control of ["q.studyAnswerReliability === 'disputed'",'Option-by-option worked solutions are withheld',
 'Source limitation: ', 'Invalid disputed-answer review guard'])
 assert.ok(js.includes(control),'Disputed answers and source cautions must be handled: '+control);
const lib=read('assets/js/typed-pyq-catalog.js');
assert.ok(lib.includes("fetchJSON('data/quizzes/tnusrb-pc-catalog.json')"));
assert.ok(lib.includes("Police Constable"));
assert.ok(read('pyq-hub.html').includes('tnusrb-pc-quiz.html?year=2022'));
assert.ok(read('tnusrb.html').includes('tnusrb-pc-quiz.html?year=2019'));
assert.ok(read('pyq-typed-library.html').includes('3,130'));
assert.ok(read('sitemap.xml').includes('/tnusrb-pc-quiz.html'));
console.log('PASS TNUSRB PC: 310 questions / 3 booklets / 141 provisional marks; 2019–2020 entirely ungraded; 2022 source-figure and ALL exclusions enforced.');
