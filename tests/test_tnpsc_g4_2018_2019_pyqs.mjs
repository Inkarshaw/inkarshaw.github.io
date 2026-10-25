// CI regression: 2018 and 2019 TNPSC Group IV Q101-200 source reconciliation.
// Executed with: node tests/test_tnpsc_g4_2018_2019_pyqs.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const rows=JSON.parse(read("data/quizzes/verified-pyqs.json"));
const catalog=JSON.parse(read("data/quizzes/pyq-yearwise-catalog.json"));
const daily=read("daily-quiz.html");
const officialKeys={
  2018:{101:"B",102:"C",103:"A",105:"D",106:"C",107:"C",109:"C",110:"C",111:"D",112:"B",114:"B",115:"C",116:"D",124:"C",127:"B",133:"A",134:"B",135:"B",139:"B",147:"B"},
  2019:{102:"A",105:"D",106:"A",108:"A",109:"B",110:"D",111:"A",112:"D",113:"B",114:"C",115:"B",116:"C",117:"A",118:"A",119:"A",120:"B",121:"C",122:"D",123:"A",124:"C"}
};
const sourceKeys={
  2018:"https://tnpsc.gov.in/Document/Answerkeyfinalresult/GROUP_IV_FIN_ANS_KEY_23_2017.pdf",
  2019:"https://tnpsc.gov.in/Document/Answerkeyfinalresult/2019_19_GR_IV_FINANS_KEY.pdf"
};
for(const year of [2018,2019]){
 const y=String(year), expected=officialKeys[year],selected=rows.filter(q=>q.SourceExam==="TNPSC Group IV"&&q.SourceYear===y);
 assert.equal(selected.length,20,year+" exactly 20 questions");
 const found=new Set;
 for(const q of selected){
  const n=Number(q.SourceQuestion);
  assert.ok(n>=101&&n<=200,"Question position within original General Studies 101–200");
  assert.ok(!found.has(n),year+" unique original number "+n);found.add(n);
  assert.equal(q.CorrectAnswer,expected[n],year+" Q"+n+" official final-key mapping");
  assert.equal(q.SourceType,"Adapted PYQ");
  assert.equal(q.Exam,"Previous Year Questions");
  assert.equal(q.Topic,"Previous Year Questions");
  assert.equal(q.AnswerKeyURL,sourceKeys[year]);
  assert.match(q.AnswerVerification,/Matched to official TNPSC final key/);
  assert.ok(q.SourceURL.startsWith("https://www.tnpsc.gov.in/Tentative/Document/"));
  assert.ok(q.PYQSubject);
  assert.ok(q.Question.length>=24,"Meaningful question stem");
  assert.ok(!/according to (the )?(textbook|question)/i.test(q.Question));
  const options="ABCD".split("").map(l=>q["Option"+l]);assert.equal(new Set(options).size,4);
  for(const l of "ABCD")assert.ok(q["Explanation"+l]?.length>=25,"Substantive explanation for "+year+" Q"+n+" "+l);
  for(const l of "ABCD")assert.ok(!q["Explanation"+l].includes("does not fit this source question"),"No generic wrong-option explanation");
 }
 assert.deepEqual([...found].sort((a,b)=>a-b),Object.keys(expected).map(Number).sort((a,b)=>a-b));
 const entry=catalog.entries.find(e=>e.category==="TNPSC"&&e.exam==="Group IV"&&e.year===year);
 assert.ok(entry?.quiz?.includes("pyqYear="+year),year+" linked from PYQ catalog");
 assert.ok(entry.documents.some(x=>x.type==="paper"&&/^https:\/\/(?:www\.)?tnpsc.gov.in\//.test(x.url)));
 assert.ok(entry.documents.some(x=>x.type==="key"&&x.url===sourceKeys[year]));
}
const lines=daily.split("\n");
const fnYear=lines.find(x=>x.startsWith("function yearFiltered("));
const fnTopic=lines.find(x=>x.startsWith("function dailySet("));
const fnHash=lines.find(x=>x.startsWith("function hash("));
const fnTopicFor=lines.find(x=>x.startsWith("function topicFor("));
const ctx={PRACTICE_COUNT:10,pyqYearSelect:{value:"2019"}};
vm.createContext(ctx);
vm.runInContext([fnHash,fnTopicFor,fnYear,fnTopic].join("\n"),ctx,{timeout:1000});
for(const year of [2018,2019]){
 ctx.pyqYearSelect.value=String(year);
 const selected=ctx.yearFiltered(rows);
 assert.equal(selected.length,20);
 const ten=ctx.dailySet(selected,"Previous Year Questions","2026-10-20","TNPSC Group IV");
 assert.equal(ten.length,10);
 assert.ok(ten.every(q=>q.SourceYear===String(year)));
 assert.equal(new Set(ten.map(q=>q.ID)).size,10);
}
assert.ok(!rows.some(q=>q.SourceYear==="2019"&&["101","125","155","160","171","173","174","188"].includes(q.SourceQuestion)),"No all-options-accepted 2019 questions");
console.log("TNPSC 2018+2019: 40 original question references, official Version A answer choices, non-generic explanations, year-filtered 10-question sets and paper links verified.");
