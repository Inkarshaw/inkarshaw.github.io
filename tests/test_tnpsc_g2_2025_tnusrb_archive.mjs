// 2025 TNPSC Group II/IIA question provenance and official TNUSRB paper links.
// Run: node tests/test_tnpsc_g2_2025_tnusrb_archive.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const rows=JSON.parse(read("data/quizzes/verified-pyqs.json"));
const cat=JSON.parse(read("data/quizzes/pyq-yearwise-catalog.json"));
const quiz=read("daily-quiz.html"),hub=read("pyq-hub.html");
const source="https://arivark.com/tnpsc-group-2-question-paper-2025";
const keys={5:"A",7:"C",8:"A",9:"B",12:"B",15:"D",17:"A",18:"B",19:"A",20:"A",21:"C",22:"A",23:"B",25:"D",26:"D",27:"B",28:"D",29:"C",30:"C",31:"B"};
const newRows=rows.filter(q=>q.SourceExam==="TNPSC Group II/IIA"&&q.SourceYear==="2025");
assert.equal(newRows.length,20,"Exactly 20 source-indexed 2025 items");
for(const q of newRows){
  const idx=Number(q.SourceQuestion?.replace("GS-index-",""));
  assert.ok(Object.hasOwn(keys,idx),"Source must be a real index in the separate 2025 GS transcription");
  assert.equal(q.CorrectAnswer,keys[idx],"Third-party 2025 key matches independently checked result: GS-index-"+idx);
  assert.equal(q.ID,"PYQ-TNPSC-G2-2025-GS-"+String(idx).padStart(3,"0"));
  assert.equal(q.SourceType,"Adapted PYQ");
  assert.equal(q.Exam,"Previous Year Questions");
  assert.equal(q.Topic,"Previous Year Questions");
  assert.equal(q.SupportingTranscriptURL,source);
  assert.ok(q.SourceURL.startsWith("https://www.tnpsc.gov.in/Tentative/Document/11_2025_"));
  assert.match(q.SourcePaper,/official booklet number unverified/);
  assert.match(q.AnswerVerification,/final answer key is pending/);
  assert.equal(q.Active,"TRUE");
  assert.ok(q.Question.length>=30&& !/according to (the )?textbook/i.test(q.Question));
  const options="ABCD".split("").map(l=>q["Option"+l]);
  assert.equal(new Set(options).size,4);
  for(const l of "ABCD")assert.ok(q["Explanation"+l]?.length>=26,"Explanation "+l+" GS-index-"+idx);
}
const entry=cat.entries.find(q=>q.category==="TNPSC"&&q.exam==="Group II / IIA"&&q.year===2025);
assert.ok(entry&&entry.quiz?.includes("pyqYear=2025")&&entry.quiz.includes("TNPSC%20Group%20II%2FIIA"));
assert.match(entry.notes,/not the official TNPSC booklet question number/);
assert.match(entry.notes,/final key/);
const tnPapers=entry.documents.filter(d=>d.type==="paper");
assert.ok(tnPapers.length>=2&&tnPapers.some(d=>d.label.includes("General Tamil")));
assert.ok(tnPapers.every(d=>new URL(d.url).hostname.endsWith("tnpsc.gov.in")));
const siRecords=cat.entries.filter(q=>q.category==="TNUSRB"&&q.exam==="SI (Taluk / AR)");
assert.deepEqual(siRecords.map(q=>q.year).sort((a,b)=>a-b),[2019,2022,2023,2025]);
const officialPdfs=siRecords.flatMap(q=>q.documents||[]);
assert.equal(officialPdfs.length,10);
assert.ok(officialPdfs.every(d=>new URL(d.url).hostname==="www.tnusrb.tn.gov.in"&&d.url.endsWith(".pdf")));
for(const [year,min] of [[2019,1],[2022,3],[2023,4],[2025,2]]){
 const r=siRecords.find(q=>q.year===year);assert.ok(r.documents.length>=min);assert.ok(!r.quiz,"Do not advertise an untranscribed paper as a PYQ quiz");
}
assert.ok(hub.includes("original booklet-number / key audit pending"),"Year-wise quiz card discloses incomplete verification");
assert.ok(quiz.includes('Transcript GS #'),"Source label distinguishes transcript index from official question number");
const fn=name=>{const line=quiz.split("\n").find(l=>l.startsWith("function "+name+"("));assert.ok(line);return line};
const ctx={bank:rows,examSelect:{value:"TNPSC Group II/IIA"},pyqYearSelect:{value:"2025"},PRACTICE_COUNT:10};
vm.createContext(ctx);
vm.runInContext(["hash","topicFor","examRows","yearFiltered","dailySet"].map(fn).join("\n"),ctx,{timeout:1000});
const set=ctx.yearFiltered(ctx.examRows());assert.equal(set.length,20);assert.ok(set.every(q=>q.SourceYear==="2025"&&q.SourceExam==="TNPSC Group II/IIA"));
const daily=ctx.dailySet(set,"Previous Year Questions","2026-10-20","TNPSC G2 2025");
assert.equal(daily.length,10);assert.equal(new Set(daily.map(q=>q.ID)).size,10);
ctx.pyqYearSelect.value="2024";assert.equal(ctx.yearFiltered(ctx.examRows()).length,20);
ctx.pyqYearSelect.value="2022";assert.equal(ctx.yearFiltered(ctx.examRows()).length,20);
ctx.examSelect.value="TNPSC Group IV";ctx.pyqYearSelect.value="2025";assert.equal(ctx.yearFiltered(ctx.examRows()).length,0);
for(const html of [hub,quiz])for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/src\s*=|application\/ld\+json/i.test(m[1]))continue;
 new vm.Script(m[2]);
}
console.log("PASS: 20 accurately labelled transcript-indexed TNPSC G2/IIA 2025 questions, 10 direct TNUSRB SI PDFs, strict exam/year selection and JS syntax");
