// Year-wise PYQ catalog, exam/year routing, and source-integrity tests.
// Run: node tests/test_pyq_yearwise.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const catalog=JSON.parse(read("data/quizzes/pyq-yearwise-catalog.json"));
const qs=JSON.parse(read("data/quizzes/verified-pyqs.json"));
const hub=read("pyq-hub.html"), daily=read("daily-quiz.html");
assert.equal(catalog.schemaVersion,1);
assert.ok(catalog.entries.length>=60,"Large year-wise official archive inventory is available");
const ids=new Set();
for(const record of catalog.entries){
 assert.ok(!ids.has(record.id),"No duplicate exam-year records: "+record.id);
 ids.add(record.id);
 assert.match(record.url,/^https:\/\//);
 assert.ok(record.year>=2012&&record.year<=2026);
 assert.ok(["TNPSC","TNUSRB","UPSC","SSC","Railways"].includes(record.category));
 assert.ok(["official-archive","official-paper","login-or-limited"].includes(record.access));
 if(record.access==="official-paper")assert.ok(record.url.toLowerCase().includes(".pdf"),"Claim direct PDF only for actual PDF links");
 if(record.quiz){
  const year=new URL(record.quiz,"https://clearexams.ink").searchParams.get("pyqYear");
  assert.equal(Number(year),record.year,"Quiz year matches source year");
  const source=record.category==="TNPSC"?(record.exam==="Group IV"?"TNPSC Group IV":record.exam==="Group II / IIA"?"TNPSC Group II/IIA":""):"UPSC Civil Services Prelims";
  assert.ok(source,"Quiz source mapping is known");
  assert.ok(qs.filter(q=>q.SourceExam===source&&Number(q.SourceYear)===record.year).length>=10,"Practice link only where 10 reviewed questions exist");
 }
}
assert.ok(catalog.limitations.IBPS.includes("does not release"));
assert.ok(catalog.entries.some(x=>x.category==="TNUSRB"&&x.year===2019));
assert.ok(catalog.entries.some(x=>x.category==="UPSC"&&x.year===2026));
assert.ok(catalog.entries.some(x=>x.category==="TNPSC"&&x.year===2012));
assert.ok(catalog.entries.some(x=>x.category==="SSC"&&x.access==="login-or-limited"));
for(const html of [hub,daily]){
 let scripts=0;
 for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
  if(/src\s*=|application\/ld\+json/i.test(m[1]))continue;
  new vm.Script(m[2],{filename:"inline.js"});scripts++;
 }
 assert.ok(scripts>=1,"Inline JavaScript compiles");
}
for(const id of ["pyqSearch","pyqFamily","pyqExam","pyqYear","pyqItems","catalogStats"])assert.ok(hub.includes('id="'+id+'"'));
for(const id of ["pyqYearSelect","pyqYearField"])assert.ok(daily.includes('id="'+id+'"'));
const yearLine=daily.split("\n").find(l=>l.startsWith("function yearFiltered("));
assert.ok(yearLine);
const ctx={pyqYearSelect:{value:"2023"}};
vm.createContext(ctx);
vm.runInContext(yearLine,ctx,{timeout:1000});
let out=ctx.yearFiltered(qs);
assert.equal(out.length,10);
assert.ok(out.every(q=>q.SourceExam==="UPSC Civil Services Prelims"));
ctx.pyqYearSelect.value="2024";
out=ctx.yearFiltered(qs);
assert.equal(out.length,30);
assert.equal(out.filter(q=>q.SourceExam==="TNPSC Group IV").length,10);
assert.equal(out.filter(q=>q.SourceExam==="TNPSC Group II/IIA").length,20);
ctx.pyqYearSelect.value="";
assert.equal(ctx.yearFiltered(qs).length,qs.length);
assert.ok(daily.includes("pyqYear:pyqYearSelect?.value"),"Resume state includes source year");
assert.ok(daily.includes('u.searchParams.set("pyqYear",pyqYearSelect.value)'),"Share link includes source year");
assert.ok(daily.includes("fillYearChoices(quizParams.get(\"pyqYear\"))"),"Deep links restore year");
assert.ok(daily.includes("pyqYearSelect.addEventListener"),"Changing exam year selects a new set");
console.log("Year-wise PYQs: "+catalog.entries.length+" official/source-access records across "+new Set(catalog.entries.map(x=>x.category)).size+" boards, 20 reviewed quiz questions and year-specific routes validated.");
