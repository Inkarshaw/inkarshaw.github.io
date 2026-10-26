// TNPSC Group II/IIA 2024: item provenance, checked tentative answer choices and exact exam/year routing.
// This does NOT certify final-key alignment; that audit is explicitly pending.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const rows=JSON.parse(read("data/quizzes/verified-pyqs.json"));
const catalog=JSON.parse(read("data/quizzes/pyq-yearwise-catalog.json"));
const daily=read("daily-quiz.html"), hub=read("pyq-hub.html");
const paper="https://tnpsc.gov.in/Tentative/Document/08_2024_CCSEII_IIA_GS_GE.pdf";
const finalKey="https://tnpsc.gov.in/Document/Answerkeyfinalresult/08_2024_PE_14092024_FAK.pdf";
const tentative={2:"A",3:"D",4:"B",5:"A",7:"A",10:"C",11:"A",13:"A",14:"A",15:"B",16:"C",18:"A",19:"D",20:"B",21:"D",22:"C",23:"C",24:"B",25:"C",26:"A"};
const subset=rows.filter(q=>q.SourceExam==="TNPSC Group II/IIA"&&q.SourceYear==="2024");
assert.equal(subset.length,20,"Exactly 20 imported 2024 GS questions");
for(const q of subset){
 const n=Number(q.SourceQuestion);
 assert.ok(Object.hasOwn(tentative,n),"Only explicitly inspected source question numbers");
 assert.equal(q.CorrectAnswer,tentative[n],"Checked tentative question paper answer for Q"+n);
 assert.equal(q.SourceURL,paper);
 assert.equal(q.AnswerKeyURL,finalKey);
 assert.equal(q.Exam,"Previous Year Questions");
 assert.equal(q.SourceType,"Adapted PYQ");
 assert.equal(q.Active,"TRUE");
 assert.match(q.SourcePaper,/tentative-key.*final-key audit pending/i,"Visible caution about pending final check");
 assert.match(q.AnswerVerification,/final-key.*pending/i,"Editorial provenance explicitly does not claim completed final-key review");
 assert.ok(!/According to (the )?(textbook|passage)/i.test(q.Question));
 assert.ok(q.Question.length>=20,"Natural, useful question");
 const options="ABCD".split("").map(letter=>q["Option"+letter]);
 assert.equal(new Set(options).size,4,"Distinct four options");
 for(const letter of "ABCD")assert.ok(q["Explanation"+letter]?.length>=40,"Option-specific explanation, Q"+n+" "+letter);
}
assert.deepEqual(subset.map(q=>Number(q.SourceQuestion)).sort((a,b)=>a-b),Object.keys(tentative).map(Number).sort((a,b)=>a-b));
const entry=catalog.entries.find(e=>e.category==="TNPSC"&&e.exam==="Group II / IIA"&&e.year===2024);
assert.ok(entry?.quiz?.includes("pyqYear=2024")&&entry.quiz.includes("exam=TNPSC%20Group%20II%2FIIA"),"Deep link to correct year and exam");
assert.ok(entry.documents.some(d=>d.type==="paper"&&d.url.endsWith("08_2024_CCSEII_IIA_GS_GE.pdf")));
assert.ok(entry.documents.some(d=>d.type==="key"&&d.url.endsWith("08_2024_PE_14092024_FAK.pdf")));
assert.match(entry.notes,/final-key.*pending/i,"Year card is transparent");
assert.ok(hub.includes("Official final-key check incomplete or not documented"),"Year-wise quiz CTA transparently labels incomplete final-key audit");
const fn=name=>{const line=daily.split("\n").find(x=>x.startsWith("function "+name+"("));assert.ok(line,name+" missing");return line};
const ctx={PRACTICE_COUNT:10,bank:rows,examSelect:{value:"TNPSC Group II/IIA"},pyqYearSelect:{value:"2024"}};
vm.createContext(ctx);
vm.runInContext(["hash","topicFor","examRows","yearFiltered","dailySet"].map(fn).join("\n"),ctx,{timeout:1000});
let filtered=ctx.yearFiltered(ctx.examRows());
assert.equal(filtered.length,20);
assert.ok(filtered.every(q=>q.SourceYear==="2024"&&q.SourceExam==="TNPSC Group II/IIA"));
let ten=ctx.dailySet(filtered,"Previous Year Questions","2026-10-20","g2-2024");
assert.equal(ten.length,10);
assert.equal(new Set(ten.map(q=>q.ID)).size,10);
ctx.pyqYearSelect.value="2022";filtered=ctx.yearFiltered(ctx.examRows());
assert.equal(filtered.length,20);
assert.ok(filtered.every(q=>q.SourceYear==="2022"&&q.SourceExam==="TNPSC Group II/IIA"));
ctx.examSelect.value="TNPSC Group IV";ctx.pyqYearSelect.value="2024";
filtered=ctx.yearFiltered(ctx.examRows());
assert.equal(filtered.length,20);
assert.ok(filtered.every(q=>q.SourceExam==="TNPSC Group IV"));
for(const html of [hub,daily])for(const script of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/src\s*=|application\/ld\+json/i.test(script[1]))continue;
 new vm.Script(script[2]);
}
console.log("PASS: TNPSC Group II/IIA 2024 (20 adapted source-numbered items), explicit tentative answer status, distinct options, no cross-exam leakage, and valid JS.");
