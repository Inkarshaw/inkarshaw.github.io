// Check TNPSC Group IV 2022 source attribution and direct year-wise PDFs.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const rows=JSON.parse(read("data/quizzes/verified-pyqs.json"));
const catalog=JSON.parse(read("data/quizzes/pyq-yearwise-catalog.json"));
const page=read("pyq-hub.html"),quiz=read("daily-quiz.html");
const tn=rows.filter(q=>q.SourceExam==="TNPSC Group IV"&&q.SourceYear==="2022");
assert.equal(tn.length,20,"Exactly 20 curated 2022 questions imported");
const refs=new Set,allIds=new Set;
for(const q of rows){
 assert.ok(!allIds.has(q.ID),q.ID+" reused");allIds.add(q.ID);
 assert.ok(q.SourceExam&&q.SourceYear&&q.SourceQuestion&&q.SourceURL);
 assert.match(q.SourceURL,/^https:\/\/(?:www\.)?(?:tnpsc\.gov\.in|upsc\.gov\.in)\//);
 assert.equal(new Set("ABCD".split("").map(l=>q["Option"+l])).size,4);
 for(const l of "ABCD")assert.ok(q["Explanation"+l].trim().length>0,q.ID+": Explanation"+l);
 assert.ok("ABCD".includes(q.CorrectAnswer),q.ID+": answer");
}
for(const q of tn){
 for(const l of "ABCD")assert.ok(q["Explanation"+l].trim().length>=20,q.ID+": weak new explanation "+l);
 assert.ok(!refs.has(q.SourceQuestion),"Duplicate 2022 source question "+q.SourceQuestion);refs.add(q.SourceQuestion);
 assert.equal(q.Exam,"Previous Year Questions");
 assert.equal(q.SourceType,"Adapted PYQ");
 assert.equal(q.SourceURL,"https://www.tnpsc.gov.in/Tentative/Document/CCS4T_2022_OPT.pdf");
 assert.ok(q.AnswerKeyURL.endsWith("/07_22_GR_IV_FINAL_KEY.pdf"));
 assert.match(q.AnswerVerification,/Editorial review/);
 assert.ok(Number(q.SourceQuestion)>=139&&Number(q.SourceQuestion)<=162);
}
const expectedYears=[2016,2018,2019,2022,2024,2025];
let directPapers=0,officialKeys=0;
for(const year of expectedYears){
 const entry=catalog.entries.find(x=>x.category==="TNPSC"&&x.exam==="Group IV"&&x.year===year);
 assert.ok(entry,year+" catalog record");
 assert.ok(Array.isArray(entry.documents)&&entry.documents.some(x=>x.type==="paper"),year+" direct PDF");
 for(const d of entry.documents){
  assert.match(d.url,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\//);
  assert.ok(d.url.toLowerCase().endsWith(".pdf"),"Not an official PDF link");
  assert.ok(["paper","key"].includes(d.type));
  if(d.type==="paper")directPapers++;else officialKeys++;
 }
 if(year===2022){assert.ok(entry.quiz?.includes("pyqYear=2022"),"Year-specific attempt link is published")}
}
assert.ok(directPapers>=6);
assert.ok(officialKeys>=3);
assert.match(page,/for\(const doc of x\.documents\|\|\[\]\)/);
assert.match(page,/Practise 10 adapted PYQs/);
assert.match(page,/Practise all 20 adapted PYQs/);
assert.match(page,/Official final answer key reconciled/);
const line=quiz.split("\n").find(s=>s.startsWith("function yearFiltered("));
assert.ok(line);
const ctx={pyqYearSelect:{value:"2022"}};vm.createContext(ctx);vm.runInContext(line,ctx,{timeout:500});
const selected=ctx.yearFiltered(rows);
assert.equal(selected.filter(q=>q.SourceExam==="TNPSC Group IV").length,20);
assert.equal(selected.filter(q=>q.SourceExam==="TNPSC Group II/IIA").length,20);
ctx.pyqYearSelect.value="2024";assert.equal(ctx.yearFiltered(rows).length,40);
ctx.pyqYearSelect.value="2023";assert.equal(ctx.yearFiltered(rows).length,10);
ctx.pyqYearSelect.value="";assert.equal(ctx.yearFiltered(rows).length,rows.length);
for(const h of [page,quiz])for(const s of h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/ld\+json/i.test(s[1]))new vm.Script(s[2]);
console.log("TNPSC Group IV 2022: "+tn.length+" curated questions; "+directPapers+" direct papers; "+officialKeys+" final keys; year filtering and syntax passed.");
