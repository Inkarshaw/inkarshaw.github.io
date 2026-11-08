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
assert.equal(data.papers.length,4,'Four official PDF companion quiz sessions');
assert.deepEqual(data.papers.map(p=>p.year).sort((a,b)=>a-b),[2011,2022,2024,2025]);
const ids=new Set();
for(const paper of data.papers){
  assert.ok(!ids.has(paper.id),'Stable unique paper IDs');ids.add(paper.id);
  assert.ok(paper.id.includes(String(paper.year)));
  assert.equal(paper.questionCount,200,'Every linked original TNPSC booklet contains 200 questions');
  assert.equal(paper.durationMinutes,180);
  assert.equal(paper.marksPerQuestion,1.5);
  assert.deepEqual(paper.optionLetters,paper.year===2011?['A','B','C','D']:['A','B','C','D','E'],'Correct original paper A–D or A–E options');
  assert.deepEqual(paper.correctOptionLetters,['A','B','C','D']);
  if(paper.year!==2011)assert.equal(paper.unknownOption,'E');
  assert.equal(paper.transcriptionStatus,'not-transcribed');
  assert.equal(paper.answerKeyStatus,paper.year===2011?'official-final-key-series-d':paper.year===2025?'official-final-key-mapped-subject-496':'official-pdf-only');
  assert.equal(paper.copyrightClearance,'not-confirmed');
  assert.equal(paper.format,'official-pdf-answer-sheet');
  assert.match(paper.paperUrl,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\/.*\.pdf$/i);
  assert.match(paper.answerKeyUrl,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\/.*\.pdf$/i);
}
assert.equal(data.papers.reduce((n,p)=>n+p.questionCount,0),800);
const sourcePages=JSON.parse(read('data/quizzes/tnpsc-g4-2024-original-page-index.json'));
assert.equal(sourcePages.schemaVersion,1);
assert.equal(sourcePages.questionCount,200);
assert.equal(sourcePages.paperId,'tnpsc-group-iv-2024-general-tamil-general-studies');
const perQuestion=Array(200).fill(null);
for(const span of sourcePages.pageSpans){
 assert.ok(Number.isInteger(span.pdfPage)&&span.pdfPage>=3&&span.pdfPage<=91);
 assert.ok(span.firstQuestion>=1&&span.lastQuestion<=200&&span.lastQuestion>=span.firstQuestion);
 for(let number=span.firstQuestion;number<=span.lastQuestion;number++){
  assert.equal(perQuestion[number-1],null,'No duplicate original question '+number);
  perQuestion[number-1]=span.pdfPage;
 }
}
assert.ok(perQuestion.every(Number.isInteger),'Every original number mapped to source page');
for(const [n,p] of [[1,3],[100,28],[101,29],[104,32],[150,61],[200,91]])assert.equal(perQuestion[n-1],p,'Question '+n+' source PDF page');
const paper2024=data.papers.find(p=>p.year===2024);
assert.equal(paper2024.firstQuestionPdfPage,3,'First original question is on PDF page 3');
assert.equal(paper2024.annotatedSource,true,'Annotated source scans warn candidates about visible ticks');
const keyManifest=JSON.parse(read('data/quizzes/original-final-keys.json'));
assert.equal(keyManifest.schemaVersion,1);
assert.equal(keyManifest.papers.length,3);
const officialKey=keyManifest.papers.find(p=>p.id===paper2024.id);
assert.equal(officialKey.id,paper2024.id);
assert.equal(officialKey.paperVersion,paper2024.paperVersion);
assert.equal(officialKey.questionCount,200);
assert.equal(officialKey.answers.length,200);
assert.equal(officialKey.marksPerQuestion,1.5);
assert.equal(officialKey.sourceUrl,paper2024.answerKeyUrl);
assert.ok(officialKey.answers.every(x=>/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/.test(x)));
const important={1:'A',2:'B',3:'D',10:'B',20:'B',28:'A/B',30:'B/C/D',63:'ALL',
  72:'A/D',86:'ALL',88:'B/C',93:'ALL',134:'B',151:'B/C',154:'ALL',163:'A',200:'B'};
for(const [number,answer] of Object.entries(important)){
 assert.equal(officialKey.answers[Number(number)-1],answer,'Official key Q'+number);
}
assert.equal(officialKey.answers.filter(x=>x==='ALL').length,4);
assert.equal(officialKey.answers.filter(x=>x.includes('/')).length,5);
assert.equal(officialKey.answers.length-officialKey.answers.filter(x=>x==='ALL').length,196);
const pages2025=JSON.parse(read('data/quizzes/tnpsc-g4-2025-original-page-index.json'));
const paper2025=data.papers.find(p=>p.year===2025);
assert.equal(paper2025.firstQuestionPdfPage,3);
assert.equal(paper2025.annotatedSource,true);
assert.equal(pages2025.paperId,paper2025.id);
assert.equal(pages2025.paperVersion,paper2025.paperVersion);
assert.equal(pages2025.questionCount,200);
const locs2025=Array(200).fill(null);
for(const span of pages2025.pageSpans){
 assert.ok(Number.isInteger(span.pdfPage)&&span.pdfPage>=3&&span.pdfPage<=123);
 assert.ok(span.firstQuestion>=1&&span.lastQuestion<=200&&span.firstQuestion<=span.lastQuestion);
 for(let n=span.firstQuestion;n<=span.lastQuestion;n++){
  assert.equal(locs2025[n-1],null,'No duplicate 2025 source question Q'+n);
  locs2025[n-1]=span.pdfPage;
 }
}
assert.ok(locs2025.every(Number.isInteger),'2025: all 200 source PDF pages present');
for(const [n,p] of [[1,3],[44,21],[100,44],[101,45],[112,54],[151,83],[189,118],[200,123]]){
 assert.equal(locs2025[n-1],p,'Original 2025 question '+n+' is on PDF page '+p);
}
const key2025=keyManifest.papers.find(p=>p.id===paper2025.id);
assert.equal(key2025.paperVersion,paper2025.paperVersion);
assert.equal(key2025.sourceUrl,paper2025.answerKeyUrl);
assert.equal(key2025.questionCount,200);
assert.equal(key2025.answers.length,200);
assert.equal(key2025.marksPerQuestion,1.5);
assert.ok(key2025.answers.every(x=>/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/.test(x)));
for(const [n,key] of Object.entries({1:'C',6:'ALL',44:'C',56:'ALL',68:'A/B/C',74:'ALL',77:'C/D',
  78:'C/D',100:'C',101:'C',107:'ALL',112:'ALL',122:'B/C',126:'B/C',138:'ALL',161:'ALL',162:'ALL',200:'B'})){
 assert.equal(key2025.answers[Number(n)-1],key,'2025 final key Q'+n);
}
assert.equal(key2025.answers.filter(x=>x==='ALL').length,8);
assert.equal(key2025.answers.filter(x=>x.includes('/')).length,5);
assert.equal(key2025.answers.length-key2025.answers.filter(x=>x==='ALL').length,192);
// 2011 Group I uses a different paper and final key from the uploaded 2011 Group II content.
const g1=data.papers.find(p=>p.year===2011);
const g1Key=keyManifest.papers.find(p=>p.id===g1.id);
assert.equal(g1.id,'tnpsc-group-i-2011-preliminary-general-knowledge-d');
assert.equal(g1.exam,'Group I (Preliminary)');
assert.equal(g1.paperVersion,'IDPC/2011 · General Knowledge · Series D');
assert.equal(g1.paperUrl,'https://www.tnpsc.gov.in/static_pdf/dptpreviousyearquestion/IDPC.pdf');
assert.equal(g1.answerKeyUrl,'https://www.tnpsc.gov.in/static_pdf/anskeys/05_06_2011_g1_gk.pdf');
assert.equal(g1.firstQuestionPdfPage,3);
assert.deepEqual(g1.optionLetters,['A','B','C','D']);
assert.equal(g1Key.paperVersion,g1.paperVersion);
assert.equal(g1Key.sourceUrl,g1.answerKeyUrl);
assert.equal(g1Key.questionCount,200);
assert.equal(g1Key.answers.length,200);
assert.equal(g1Key.marksPerQuestion,1.5);
assert.ok(g1Key.answers.every(a=>/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/.test(a)));
for(const [n,key] of Object.entries({1:'B',2:'A',3:'C',4:'ALL',5:'C',15:'A/B',17:'ALL',
  51:'D',74:'A/C',77:'ALL',78:'ALL',101:'C',114:'ALL',128:'B/C',129:'A/B',
  151:'A',152:'ALL',171:'ALL',185:'A/B',194:'ALL',200:'B'})){
 assert.equal(g1Key.answers[Number(n)-1],key,'TNPSC 2011 Series D final key Q'+n);
}
assert.deepEqual(g1Key.answers.flatMap((a,i)=>a==='ALL'?[i+1]:[]),[4,17,77,78,114,152,171,194]);
assert.deepEqual(g1Key.answers.flatMap((a,i)=>a.includes('/')?[i+1]:[]),[15,74,128,129,185]);
assert.equal((g1Key.answers.length-8)*g1.marksPerQuestion,288);
assert.match(hub,/Group I 2011 original-paper quiz/);
assert.equal(bank.filter(q=>q.SourceExam==='TNPSC Group IV'&&q.SourceYear==='2024').length,30,'Adapted questions remain separate');
assert.ok(!data.papers.some(x=>x.transcriptionStatus==='verified-full'));
assert.match(html,/The paper is not copied or transcribed into ClearExams/);
assert.match(html,/Indicative marks appear only where a separately checked, matching official final key is available/);
assert.match(html,/pyq-original-paper\.js/);
assert.match(html,/id="paperFrame"/,'Official PDF has an inline viewer');
assert.match(html,/id="paperQuestionPage"/,'Show source PDF page for each question');
assert.match(html,/id="showQuestions"/,'Mobile quiz tab available');
assert.match(html,/id="showPaper"/,'Mobile paper tab available');
assert.match(html,/id="quizWorkspace"/,'Responsive quiz workspace available');
assert.match(html,/id="sourceQuestionNumber"/,'Original source numbering is shown');
assert.match(html,/id="questionPanel"/,'Inline answer card available');
assert.match(html,/id="paperPanel"/,'Official question paper panel available');
assert.match(html,/id="adaptedQuizLink"/,'Adapted text MCQs clearly distinguished');
assert.match(html,/aria-label="Select original-paper answer option"/);
assert.match(html,/id="showBoth"/,'Mobile paper-plus-answer mode is present');
assert.match(html,/id="mobileAnswerDock"/,'Mobile A–E dock is present');
assert.match(html,/id="dockChoices"/,'Original-source answer choices remain interactive');
assert.match(js,/switchView\('both'\)/,'Original PDF and answer controls appear together by default');
assert.match(js,/renderDock\(\)/,'Mobile answer dock tracks the same original question number');
assert.match(js,/official-final-key-mapped-subject-496/,'2025 full-paper option is not excluded');
assert.match(js,/addEventListener\('click',\(\)=>finish\(false\)\)/,'Manual submit is not interpreted as timer expiry');
assert.match(hub,/Start 200-question original-paper quiz/,'Original 200 questions, not shortened adapted items, are the featured action');
assert.match(js,/switchView\('questions'\)/);
assert.match(js,/switchView\('paper'\)/);
assert.match(js,/paperFrame'\)\.src=safe\(p\.paperUrl\)/,'Embed only a validated official paper URL');
assert.match(js,/gradeResponses\(\)/,'Grade only where source-key map is available');
assert.match(js,/currentKey\.answers/,'Check against original official key option mappings');
assert.match(js,/token==='ALL'/,'Do not silently score ALL entries');
assert.match(js,/safe\(currentPaper\.paperUrl\)/,'Page navigation stays on verified official source');
assert.match(js,/tnpsc-g4-2024-original-page-index\.json/);
assert.match(js,/tnpsc-g4-2025-original-page-index\.json/);
assert.match(js,/lastShownPdfPage!==originalPage\)jumpPdfPage\(originalPage\)/,'Automatically synchronize PDF page to question');
assert.match(html,/id="goPdfPage"/);
assert.match(html,/id="readOriginal"/);
assert.match(html,/id="returnAnswers"/);
assert.match(html,/id="scoreSummary"/);
assert.match(html,/id="scanWarning"/);
assert.match(js,/aria-pressed/,'Mobile view buttons and answers communicate state');
assert.match(js,/new URLSearchParams\(\{exam:'TNPSC Group IV',year:String\(p\.year\)\}\)/);
assert.ok(!js.includes('innerHTML'),'Do not insert paper URLs, text or answers as untrusted HTML');

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
assert.match(hub,/Full-paper session/);
assert.match(hub,/Group IV 2022 · full PDF paper/);
assert.match(hub,/Group IV 2024 · full PDF paper/);
assert.match(hub,/Group IV 2025 · full PDF paper/);
assert.match(hub,/pyq-original-paper\.html/);
assert.match(hub,/pyq-full-quiz\.html/);
assert.match(adapted,/Previous Year Question Quiz/);
assert.match(adapted,/not verbatim full-paper transcriptions/);
assert.match(read('sitemap.xml'),/pyq-original-paper\.html/);
new vm.Script(js,{filename:'assets/js/pyq-original-paper.js'});
console.log('Four official source-PDF sessions; Group I 2011 Series D plus Group IV 2024/2025 final keys verified by manifest; 2022 awaits scoring.');
