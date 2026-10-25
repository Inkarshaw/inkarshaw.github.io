// Regression for official TNPSC Group II/IIA preliminary 2022 source-traced quiz.
// Run: node tests/test_tnpsc_group2_2022_pyqs.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const rows=JSON.parse(read("data/quizzes/verified-pyqs.json"));
const catalog=JSON.parse(read("data/quizzes/pyq-yearwise-catalog.json"));
const daily=read("daily-quiz.html"),hub=read("pyq-hub.html");
const paper="https://www.tnpsc.gov.in/Tentative/Document/General%20Studies%20-%20CCS2E%20-%202022%20-%20Answer%20Key_opt.pdf";
const official="https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GROUP_II_032022_PRELIMS_FIN_KEY.pdf";
// TNPSC's final key, General Tamil with General Studies, Version A, question numbers 101–125.
const key={101:"B",102:"D",103:"C",104:"A",105:"D",106:"B",107:"D",108:"C",109:"C",110:"C",111:"A",112:"A",113:"A",115:"C",116:"D",117:"D",118:"A",119:"B",121:"C",125:"D"};
const selected=rows.filter(q=>q.SourceExam==="TNPSC Group II/IIA"&&q.SourceYear==="2022");
assert.equal(selected.length,20,"20 source-checked adapted GS PYQs");
const identifiers=new Set();
for(const question of rows){assert.ok(!identifiers.has(question.ID),"Unique global question IDs");identifiers.add(question.ID)}
for(const q of selected){
 const number=Number(q.SourceQuestion);
 assert.equal(q.CorrectAnswer,key[number],"Official final-key Version A answer, Q"+number);
 assert.equal(q.SourceType,"Adapted PYQ");
 assert.equal(q.Active,"TRUE");
 assert.equal(q.Exam,"Previous Year Questions");
 assert.equal(q.Topic,"Previous Year Questions");
 assert.equal(q.SourcePaper,"Preliminary Examination · General Studies · Version A");
 assert.equal(q.SourceURL,paper);
 assert.equal(q.AnswerKeyURL,official);
 assert.match(q.AnswerVerification,/TNPSC 2022 final key/);
 assert.ok(q.Question.length>=38,"Real contextual question");
 assert.ok(!/According to (the )?(textbook|question)/i.test(q.Question));
 const options="ABCD".split("").map(c=>q["Option"+c]);
 assert.equal(new Set(options).size,4,"Different, meaningful options");
 for(const c of "ABCD"){
  const explanation=q["Explanation"+c];
  assert.ok(explanation&&explanation.length>=30,"Meaningful option-specific explanation, "+c+" for "+number);
  assert.ok(!/does not fit this source question|is not correct here/i.test(explanation),"No generic feedback");
 }
}
assert.deepEqual(selected.map(q=>Number(q.SourceQuestion)).sort((a,b)=>a-b),Object.keys(key).map(Number).sort((a,b)=>a-b));

for(const year of [2022,2024,2025]){
 const archive=catalog.entries.find(e=>e.category==="TNPSC"&&e.exam==="Group II / IIA"&&e.year===year);
 assert.ok(archive&&archive.documents.some(d=>d.type==="paper"&&d.url.includes("tnpsc.gov.in")),year+" official question PDF");
 if(year!==2025)assert.ok(archive.documents.some(d=>d.type==="key"&&d.url.includes("tnpsc.gov.in")),year+" final key");
 if(year===2022){
  assert.ok(archive.quiz.includes("exam=TNPSC%20Group%20II%2FIIA")&&archive.quiz.includes("pyqYear=2022"));
  assert.ok(archive.documents.some(d=>d.url===paper));
  assert.ok(archive.documents.some(d=>d.url===official));
 }
}
assert.ok(hub.includes('row.exam==="Group II / IIA"')&&hub.includes('return "TNPSC Group II/IIA"'),"PYQ hub displays correct quiz count");
assert.ok(daily.includes('q.SourceExam===selected'),"Dedicated exam filter matches exact source exam");
assert.ok(daily.includes('if(!exams.includes(q.SourceExam))exams.push(q.SourceExam)'),"New sourced exams enter exam menu");

const fn=name=>{const found=daily.split("\n").find(x=>x.startsWith("function "+name+"("));assert.ok(found,"Missing "+name);return found};
const context={bank:rows,examSelect:{value:"TNPSC Group II/IIA"},pyqYearSelect:{value:"2022"},PRACTICE_COUNT:10};
vm.createContext(context);
vm.runInContext(["hash","topicFor","examRows","yearFiltered","dailySet"].map(fn).join("\n"),context,{timeout:1000});
const options=context.yearFiltered(context.examRows());
assert.equal(options.length,20,"Exact exam/year gives only Group II 2022");
const quiz=context.dailySet(options,"Previous Year Questions","2026-10-20","group2-2022");
assert.equal(quiz.length,10,"Daily quiz remains 10 questions");
assert.ok(quiz.every(q=>q.SourceExam==="TNPSC Group II/IIA"&&q.SourceYear==="2022"),"Never mix exams or years");
assert.equal(new Set(quiz.map(q=>q.ID)).size,10,"No duplicated questions");
context.examSelect.value="TNPSC Group IV";
assert.equal(context.examRows().filter(q=>q.SourceExam==="TNPSC Group II/IIA").length,0);
context.examSelect.value="UPSC";
assert.equal(context.examRows().filter(q=>q.SourceExam==="TNPSC Group II/IIA").length,0);
for(const html of [hub,daily])for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/src\s*=|application\/ld\+json/i.test(script[1]))continue;
 new vm.Script(script[2]);
}
console.log("PASS: 20 TNPSC Group II/IIA 2022 source-keyed questions, 7 official PDFs, exam/year isolation, option quality and site syntax.");
