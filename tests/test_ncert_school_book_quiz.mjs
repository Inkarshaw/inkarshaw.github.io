import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const bank=JSON.parse(get('data/ncert/quiz-bank.json'));
const html=get('ncert-school-book-quiz.html');
const js=get('assets/js/ncert-school-book-quiz.js');
assert.equal(bank.schemaVersion,1);
assert.equal(bank.title,'NCERT School Book Quiz');
assert.equal(bank.source.catalogueUrl,'https://ncert.nic.in/textbook.php');
assert.match(bank.description,/source-linked English–Tamil chapter sets/);
assert.deepEqual([...new Set(bank.sets.map(s=>s.classLevel))].sort((a,b)=>a-b),[6,7,8,9,10,11,12]);
assert.ok(bank.sets.length>=21,'All classes must have multiple populated topics');
const ids=new Set();const questions=new Set();let count=0;
for(const set of bank.sets){
  assert.ok(/^c(?:6|7|8|9|10|11|12)-[a-z-]+$/.test(set.id),set.id);
  assert.ok(set.subject && set.topic && set.kind==='original-concept-practice');
  assert.ok(['en','en-ta'].includes(set.language));
  if(set.language==='en-ta'){
    assert.equal(set.source.edition,'2026–27');
    assert.ok([1,2,3,4,5,6,7,8,9,10].includes(set.source.chapter));
    assert.equal(set.source.firstPage??1,({1:1,2:17,3:37,4:58,5:79,6:100,7:113,8:128,9:134,10:161})[set.source.chapter]);
    assert.equal(new URL(set.source.url).hostname,'ncert.nic.in');
  }
  assert.equal(set.questions.length,10,'A set must contain ten questions: '+set.id);
  for(const q of set.questions){
    count++;
    assert.ok(!ids.has(q.id),q.id+' duplicated');ids.add(q.id);
    assert.ok(!questions.has(q.question),q.question+' duplicated');questions.add(q.question);
    assert.ok(q.question.length>=10,q.id+' short question');
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4,'Repeated distractor');
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    assert.ok(q.explanation.length>=40,q.id+' explanation too brief');
    if(set.language==='en-ta'){
      assert.match(q.tamil.question,/[\u0B80-\u0BFF]/);
      assert.match(q.tamil.explanation,/[\u0B80-\u0BFF]/);
      assert.equal(q.tamil.options.length,4);
      assert.equal(new Set(q.tamil.options).size,4);
      assert.ok(Number.isInteger(q.page)&&q.page>=(set.source.firstPage??1)&&q.page<=({1:13,2:33,3:57,4:78,5:99,6:112,7:127,8:133,9:160,10:170})[set.source.chapter]);
    }
  }
}
assert.ok(count>=550);
const acids=bank.sets.filter(s=>s.source?.chapter===2).flatMap(s=>s.questions);
assert.equal(acids.length,40);
assert.deepEqual(acids.slice(0,20).map(q=>q.options[q.answer]),["Acidic and basic", "Dilute sodium hydroxide", "It burns with a pop near a flame.", "Sodium chloride, water and carbon dioxide", "Soluble calcium hydrogencarbonate forms.", "H⁺ and OH⁻ combine to form water.", "Copper(II) chloride", "The acid produces mobile ions in water, while dissolved glucose does not.", "Water enables formation of hydronium ions.", "The number of hydronium ions", "pH 2", "It helps neutralise acids made by mouth bacteria.", "A stronger acid", "Sodium sulphate and potassium sulphate", "Sodium carbonate", "Chlorine and hydrogen", "Bleaching powder forms.", "Carbon dioxide", "Ten waters of crystallisation per formula unit of sodium carbonate", "Gypsum"]);
const chapterQuestions=bank.sets.filter(set=>set.id.startsWith('c10-chemical-')).flatMap(set=>set.questions);
assert.equal(chapterQuestions.length,20);
assert.deepEqual(chapterQuestions.map(q=>q.options[q.answer]),[
  'To remove the oxide layer on its surface','Formation of a precipitate',
  'It names the reactants and product but has unequal oxygen atom counts.',
  'Coefficients change the amounts represented without changing the substances.',
  '4','The substance is dissolved in water.','Two reactants form one product and release heat.',
  'Glucose reacts with oxygen and releases energy.','Calcium oxide','Nitrogen dioxide','2:1',
  'Silver metal forms as silver chloride decomposes.','Silver bromide decomposition — light',
  'A brown copper deposit forms and the blue colour fades.','Copper will not displace zinc.',
  'Ba²⁺ and SO₄²⁻','CuO, because it loses oxygen.','It gains oxygen and is oxidised.',
  'A green coating develops on copper exposed to air.',
  'It reduces the amount of oxygen available to oxidise the oils.'
]);

const newSetIds=['c10-equation-application','c10-reaction-reasoning',
  'c10-acid-base-reasoning','c10-ph-salt-application'];
const newSets=newSetIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(newSets.every(Boolean),'Four advanced bilingual chemistry sets are required');
assert.equal(newSets.flatMap(s=>s.questions).length,40);
for(const set of newSets){
  assert.equal(set.questions.length,10);
  assert.equal(set.language,'en-ta');
  assert.equal(set.reviewStatus,'editorial-review-pending');
  assert.match(set.reviewNote,/independent.*review|human review/i);
  assert.ok(set.source.url.startsWith('https://ncert.nic.in/textbook/pdf/'));
  assert.ok(set.questions.every(q=>q.page>= (set.source.chapter===2?17:1) && q.page <= (set.source.chapter===2?33:13)));
}
assert.deepEqual(newSets.map(s=>s.questions.map(q=>q.answer)),[
  [1,0,2,3,2,0,1,3,2,1],
  [1,2,0,3,1,2,2,0,3,1],
  [0,1,2,3,2,1,3,0,2,3],
  [0,1,2,3,1,2,0,2,1,3],
]);

const metalIds=['c10-metals-properties-bonding','c10-metals-metallurgy'];
const metalSets=metalIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(metalSets.every(Boolean),'Two new chapter 3 bilingual sets must exist');
assert.equal(metalSets.flatMap(s=>s.questions).length,20);
assert.ok(metalSets.every(s=>s.source.chapter===3&&s.source.firstPage===37));
assert.ok(metalSets.every(s=>s.reviewStatus==='editorial-review-pending'));
assert.deepEqual(metalSets.map(s=>s.questions.map(q=>q.answer)),[
 [1,2,0,3,1,2,0,3,1,2],
 [1,2,0,3,1,2,0,3,1,2]
]);
const currentChapterCoverage=new Set(bank.sets.filter(s=>s.classLevel===10&&s.subject==='Science'&&s.source?.chapter).map(s=>s.source.chapter));
assert.deepEqual([...currentChapterCoverage].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10]);
const carbonIds=['c10-carbon-bonding-catenation','c10-carbon-homologous-naming','c10-carbon-reactions','c10-carbon-ethanol-acids-soaps'];
const carbonSets=carbonIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(carbonSets.every(Boolean),'Four English–Tamil Carbon chapter sets required');
assert.equal(carbonSets.flatMap(s=>s.questions).length,40);
assert.ok(carbonSets.every(s=>s.source?.chapter===4 && s.source?.firstPage===58));
assert.ok(carbonSets.every(s=>s.reviewStatus==='editorial-review-pending'));
assert.ok(carbonSets.every(s=>s.source.mirrorEdition==='2025–26'));
assert.ok(carbonSets.every(s=>s.source.pageReferenceEdition==='2025–26'));
assert.ok(carbonSets.every(s=>s.questions.every(q=>q.page>=58 && q.page<=78)));
assert.deepEqual(carbonSets.map(s=>s.questions.map(q=>q.answer)),[
 [1,3,0,2,1,2,0,3,2,3],
 [1,0,2,3,1,2,0,3,0,2],
 [1,2,0,3,1,2,3,0,1,2],
 [2,0,3,1,2,0,3,1,2,3]
]);
assert.match(js,/Earlier textbook reprint/);
assert.match(js,/edition\/page cross-check pending/);
const lifeIds=['c10-life-nutrition','c10-life-respiration','c10-life-transport','c10-life-excretion'];
const lifeSets=lifeIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(lifeSets.every(Boolean),'All four Life Processes practice sets must exist');
assert.equal(lifeSets.reduce((n,s)=>n+s.questions.length,0),40);
assert.ok(lifeSets.every(s=>s.questions.length===10&&s.language==='en-ta'));
assert.ok(lifeSets.every(s=>s.source.chapter===5&&s.source.firstPage===79));
assert.ok(lifeSets.every(s=>s.reviewStatus==='editorial-review-pending'));
assert.ok(lifeSets.every(s=>s.source.mirrorEdition==='2025–26'));
assert.ok(lifeSets.every(s=>s.questions.every(q=>q.page>=79&&q.page<=99)));
assert.deepEqual(lifeSets.map(s=>s.questions.map(q=>q.answer)),[
 [0,1,2,3,0,1,1,2,3,2],
 [1,0,2,3,0,1,2,3,0,1],
 [2,3,0,1,1,2,3,0,1,0],
 [1,3,0,2,0,1,3,2,0,3]
]);
const controlIds=['c10-control-neurons-reflexes','c10-control-brain-protection',
  'c10-control-plant-tropisms','c10-control-endocrine-feedback'];
const controlSets=controlIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(controlSets.every(Boolean),'Four NCERT Chapter 6 bilingual sets are required');
assert.equal(controlSets.flatMap(s=>s.questions).length,40);
assert.ok(controlSets.every(s=>s.language==='en-ta'&&s.questions.length===10));
assert.ok(controlSets.every(s=>s.source.chapter===6&&s.source.firstPage===100));
assert.ok(controlSets.every(s=>s.source.url==='https://ncert.nic.in/textbook/pdf/jesc106.pdf'));
assert.ok(controlSets.every(s=>s.source.mirrorEdition==='2025–26'&&s.source.pageReferenceEdition==='2025–26'));
assert.ok(controlSets.every(s=>s.reviewStatus==='editorial-review-pending'));
assert.ok(controlSets.every(s=>s.questions.every(q=>q.page>=100&&q.page<=112)));
assert.deepEqual(controlSets.map(s=>s.questions.map(q=>q.answer)),[
  [1,1,0,2,2,1,0,3,2,1],
  [0,1,2,3,0,1,2,3,0,1],
  [1,0,2,3,0,1,2,3,0,1],
  [2,0,1,3,2,1,0,2,1,3]
]);
const controlQs=controlSets.flatMap(s=>s.questions);
assert.equal(new Set(controlQs.map(q=>q.id)).size,40);
assert.ok(controlQs.every(q=>q.tamil.options.every(a=>/[^\x00-\x7F]/.test(a))), 'Tamil options must contain translated non-ASCII content');

const reproductionIds=['c10-repro-dna-asexual','c10-repro-flowers-humans'];
const reproductionSets=reproductionIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(reproductionSets.every(Boolean),'Class 10 reproduction chapter sets missing');
assert.equal(reproductionSets.flatMap(s=>s.questions).length,20);
assert.ok(reproductionSets.every(s=>s.language==='en-ta'&&s.source.chapter===7&&s.source.firstPage===113));
assert.ok(reproductionSets.every(s=>s.source.pageReferenceEdition==='2025–26'&&s.reviewStatus==='editorial-review-pending'));
assert.ok(reproductionSets.every(s=>s.questions.every(q=>q.page>=113&&q.page<=127&&q.tamil.options.every(x=>/[\u0B80-\u0BFF]/.test(x)))));
assert.deepEqual(reproductionSets.map(s=>s.questions.map(q=>q.answer)),[
 [0,1,2,3,0,1,2,3,1,2],
 [3,0,1,2,3,0,1,2,3,0]
]);

const heredityIds=['c10-heredity-mendel','c10-heredity-inheritance'];
const hereditySets=heredityIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(hereditySets.every(Boolean),'Class 10 Heredity bilingual sets missing');
assert.equal(hereditySets.flatMap(s=>s.questions).length,20);
assert.ok(hereditySets.every(s=>s.language==='en-ta'&&s.source.chapter===8&&s.source.firstPage===128));
assert.ok(hereditySets.every(s=>s.source.pageReferenceEdition==='2025–26'&&s.reviewStatus==='editorial-review-pending'));
assert.ok(hereditySets.every(s=>s.questions.every(q=>q.page>=128&&q.page<=133&&/[\u0B80-\u0BFF]/.test(q.tamil.question)&&/[\u0B80-\u0BFF]/.test(q.tamil.explanation))));
assert.deepEqual(hereditySets.map(s=>s.questions.map(q=>q.answer)),[
 [0,1,2,3,0,1,2,3,0,1],
 [2,3,0,1,2,3,0,1,2,3]
]);
const lightIds=['c10-light-mirror-reasoning','c10-light-refraction-lenses'];
const lightSets=lightIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(lightSets.every(Boolean),'Two Light chapter English–Tamil sets missing');
assert.equal(lightSets.flatMap(s=>s.questions).length,20);
assert.ok(lightSets.every(s=>s.source.chapter===9&&s.source.firstPage===134));
assert.ok(lightSets.every(s=>s.reviewStatus==='editorial-review-pending'));
assert.ok(lightSets.every(s=>s.source.url==='https://ncert.nic.in/textbook/pdf/jesc109.pdf'));
assert.ok(lightSets.every(s=>s.source.pageReferenceEdition.includes('provisional')));
assert.ok(lightSets.every(s=>!s.source.mirrorUrl),'Do not invent unsupported PDF mirrors');
assert.ok(lightSets.every(s=>s.questions.every(q=>q.page>=134&&q.page<=160&&
  /[\u0B80-\u0BFF]/.test(q.tamil.question)&&/[\u0B80-\u0BFF]/.test(q.tamil.explanation)&&
  q.tamil.options.length===4&&new Set(q.tamil.options).size===4)));
assert.deepEqual(lightSets.map(s=>s.questions.map(q=>q.answer)),[
 [0,1,2,3,2,0,1,0,2,3],
 [1,0,2,3,2,1,3,0,2,1]
]);
assert.match(js,/typeof set\.source\.mirrorUrl==='string'/,'Optional mirror check is required');
const lightInventory=JSON.parse(get('data/ncert/class10-science-chapter-inventory.json'));
const lightChapter=lightInventory.chapters.find(c=>c.number===9);
assert.equal(lightChapter.editorialCertified,false);
assert.match(lightChapter.sourceReview,/provisional|pending/i);
assert.equal(lightChapter.sourcePdf,'https://ncert.nic.in/textbook/pdf/jesc109.pdf');

const humanEyeIds=['c10-human-eye-accommodation-vision','c10-human-eye-dispersion-scattering'];
const humanEyeSets=humanEyeIds.map(id=>bank.sets.find(s=>s.id===id));
assert.ok(humanEyeSets.every(Boolean),'Two chapter 10 bilingual sets required');
assert.equal(humanEyeSets.flatMap(s=>s.questions).length,20);
assert.ok(humanEyeSets.every(s=>s.language==='en-ta'&&s.source.chapter===10&&s.source.firstPage===161));
assert.ok(humanEyeSets.every(s=>s.reviewStatus==='editorial-review-pending'));
assert.ok(humanEyeSets.every(s=>s.source.pageReferenceEdition.includes('provisional')));
assert.ok(humanEyeSets.every(s=>s.source.url==='https://ncert.nic.in/textbook/pdf/jesc110.pdf'));
assert.ok(humanEyeSets.every(s=>s.questions.every(q=>
  q.page>=161&&q.page<=170&&
  /[\u0B80-\u0BFF]/.test(q.tamil.question)&&
  /[\u0B80-\u0BFF]/.test(q.tamil.explanation)&&
  q.tamil.options.length===4&&new Set(q.tamil.options).size===4
)));
assert.deepEqual(humanEyeSets.map(s=>s.questions.map(q=>q.answer)),[
  [1,0,2,1,3,2,1,0,3,1],
  [2,3,3,0,1,2,0,3,1,2]
]);
const inventoryEye=JSON.parse(get('data/ncert/class10-science-chapter-inventory.json')).chapters.find(c=>c.number===10);
assert.equal(inventoryEye.editorialCertified,false);
assert.equal(inventoryEye.sourcePdf,'https://ncert.nic.in/textbook/pdf/jesc110.pdf');
assert.match(inventoryEye.sourceReview,/pending|provisional/);

for(const id of ['classPicker','subjectPicker','topicSearch','setGrid','quizSection','quizTitle','options','feedback','checkAnswer','nextQuestion','resultSection','resultScore','reviewList','retryQuiz','chooseAnother']){
 assert.match(html,new RegExp('id="'+id+'"'),id+' missing in UI');
}
assert.match(html,/NCERT School Book Quiz/);
assert.match(html,/not official NCERT exercises/);
assert.match(html,/ncert-school-book-quiz\.js/);
assert.match(html,/textbook-quiz\.html/,'Keep TN textbook quiz accessible');
assert.match(js,/localStorage\.setItem/);
assert.match(js,/encodeURIComponent|URLSearchParams/);
assert.ok(!js.includes('innerHTML'),'Quiz options must be inserted as plain text, not HTML');
new vm.Script(js,{filename:'assets/js/ncert-school-book-quiz.js'});
for(const page of ['index.html','practice.html','start.html','search.html','textbook-quiz.html']){
 const content=get(page);
 assert.match(content,page==='search.html'?/url:'ncert-school-book-quiz\.html'/:/href="ncert-school-book-quiz\.html"/,page+' must link to NCERT quiz');
 assert.match(content,/NCERT School Book Quiz/,page+' must use the student-facing name');
}
assert.match(get('sitemap.xml'),/https:\/\/clearexams\.ink\/ncert-school-book-quiz\.html/,'NCERT route missing from sitemap');
assert.match(get('textbook-quiz.html'),/TN School Book Quiz/,'Keep existing TN School Book Quiz');
console.log('NCERT School Book Quiz: '+bank.sets.length+' sets, '+count+' unique questions, Grades 6–12, UI and script validated.');
