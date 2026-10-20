// Contract and smoke tests for sourced Daily Quiz PYQs. Run: node tests/test_daily_quiz_pyq.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../daily-quiz.html",import.meta.url),"utf8");
const rows=JSON.parse(readFileSync(new URL("../data/quizzes/verified-pyqs.json",import.meta.url),"utf8"));
const letters=["A","B","C","D"];
const counts={};
const ids=new Set();
const paperQuestions=new Set();
for(const q of rows){
  assert.ok(q.ID && !ids.has(q.ID), "unique question ID");
  ids.add(q.ID);
  assert.equal(q.Exam,"Previous Year Questions");
  assert.equal(q.Topic,"Previous Year Questions");
  assert.equal(q.SourceType,"Adapted PYQ");
  assert.match(q.SourceYear,/^(19|20)\d{2}$/);
  assert.ok(Number(q.SourceYear)<=2026);
  assert.ok(q.SourceExam && q.SourcePaper && q.SourceQuestion && q.PYQSubject);
  assert.ok(["www.upsc.gov.in","www.tnpsc.gov.in"].includes(new URL(q.SourceURL).hostname));
  assert.ok(!paperQuestions.has(q.SourceExam+q.SourceYear+q.SourceQuestion),"unique original paper question reference");
  paperQuestions.add(q.SourceExam+q.SourceYear+q.SourceQuestion);
  assert.ok(q.Question?.trim());
  assert.ok(letters.includes(q.CorrectAnswer));
  assert.equal(new Set(letters.map(l=>q["Option"+l]?.trim())).size,4);
  for(const l of letters){
    assert.ok(q["Option"+l]?.trim());
    assert.ok(q["Explanation"+l]?.trim());
  }
  counts[q.SourceExam]=(counts[q.SourceExam]||0)+1;
}
assert.ok(counts["TNPSC Group IV"]>=10);
assert.ok(counts["UPSC Civil Services Prelims"]>=10);

function fn(prefix){
  const line=html.split("\n").find(x=>x.startsWith(prefix));
  assert.ok(line,"Daily Quiz function missing: "+prefix);
  return line;
}
const functions=[
  "function hash(","function parseCSV(","function valid(","function topicFor(",
  "function dailySet(","function examRows(","function showQuestionSource(","async function loadBank("
].map(fn).join("\n");
const nodes={};
for(const id of ["sourceMeta","sourceExamYear","sourceDetail","sourceLink"]){
  nodes[id]={hidden:false,textContent:"",href:"",removeAttribute(k){delete this[k]}};
}
const ctx={
  PRACTICE_COUNT:10,letters,document:{getElementById(id){return nodes[id]}},
  bank:rows,examSelect:{value:""},console,
  FALLBACK_CSV_URL:"data/quizzes/daily-quiz.csv",
  VERIFIED_PYQ_URL:"data/quizzes/verified-pyqs.json",
  GOOGLE_SHEET_CSV_URL:"https://example.test/sheet.csv"
};
vm.createContext(ctx);
vm.runInContext(functions,ctx,{timeout:2000});
const date="2026-10-20";
const ten=ctx.dailySet(rows,"Previous Year Questions",date,"all");
assert.equal(ten.length,10,"Default daily PYQ mix is ten");
assert.equal(new Set(ten.map(x=>x.ID)).size,10);
const nTn=ten.filter(q=>q.SourceExam==="TNPSC Group IV").length;
const nUp=ten.filter(q=>q.SourceExam==="UPSC Civil Services Prelims").length;
assert.equal(nTn,5,"PYQ mix includes five TNPSC questions");
assert.equal(nUp,5,"PYQ mix includes five UPSC questions");
assert.equal(ctx.dailySet(rows,"Previous Year Questions",date,"all").map(q=>q.ID).join(),ten.map(q=>q.ID).join(),"Fixed date/context selects deterministic questions");
assert.equal(ctx.dailySet(rows.filter(q=>q.SourceExam==="TNPSC Group IV"),"Previous Year Questions",date,"tnpsc").length,10);

ctx.examSelect.value="TNPSC Group IV";
assert.equal(ctx.examRows().filter(x=>x.Exam==="Previous Year Questions").length,counts["TNPSC Group IV"]);
ctx.examSelect.value="UPSC";
assert.equal(ctx.examRows().filter(x=>x.Exam==="Previous Year Questions").length,counts["UPSC Civil Services Prelims"]);
ctx.examSelect.value="Previous Year Questions";
assert.equal(ctx.examRows().length,rows.length);
ctx.examSelect.value="";

ctx.showQuestionSource(rows[0]);
assert.equal(nodes.sourceMeta.hidden,false);
assert.ok(nodes.sourceExamYear.textContent.includes("TNPSC Group IV · 2024"));
assert.ok(nodes.sourceDetail.textContent.includes("Q134"));
assert.ok(nodes.sourceLink.href.startsWith("https://"));
ctx.showQuestionSource(rows.find(q=>q.SourceExam==="UPSC Civil Services Prelims"));
assert.ok(nodes.sourceExamYear.textContent.includes("UPSC Civil Services Prelims · 2023"));
ctx.showQuestionSource({Question:"Ordinary practice",Exam:"TNPSC"});
assert.equal(nodes.sourceMeta.hidden,true,"Unsourced regular questions must not be labelled PYQ");
assert.equal(nodes.sourceLink.href,undefined);

assert.ok(html.includes('id="sourceExamYear"'));
assert.ok(html.includes('id="sourceDetail"'));
assert.ok(html.includes('id="sourceLink"'));
assert.ok(html.includes("showQuestionSource(q);"));
assert.ok(html.includes("VERIFIED_PYQ_URL"));

ctx.fetch=async url=>url===ctx.VERIFIED_PYQ_URL?{ok:true,json:async()=>rows}:{ok:false,status:404};
const pyqOnly=await ctx.loadBank();
assert.equal(pyqOnly.length,rows.length,"Sourced questions load when third-party feed is unavailable");

const csvHeader="ID,Active,Exam,Topic,Subtopic,PublishDate,Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,ExplanationA,ExplanationB,ExplanationC,ExplanationD";
const csvLine="LEGACY-1,TRUE,TNUSRB,History,General Knowledge,,Legacy question?,First,Second,Third,Fourth,A,Correct,No,No,No";
ctx.fetch=async url=>url===ctx.FALLBACK_CSV_URL?{ok:true,text:async()=>csvHeader+"\n"+csvLine}:{ok:false,status:503};
const legacyOnly=await ctx.loadBank();
assert.equal(legacyOnly.length,1,"Existing fallback still works without PYQ feed");
assert.equal(legacyOnly[0].ID,"LEGACY-1");
assert.equal(ctx.dailySet(legacyOnly,"History",date,"legacy").length,1);
ctx.showQuestionSource(legacyOnly[0]);
assert.equal(nodes.sourceMeta.hidden,true);
console.log("Daily Quiz PYQs: "+rows.length+" sourced questions, balanced mixed set, dedicated exam filters, source badges and feed fallbacks passed.");
