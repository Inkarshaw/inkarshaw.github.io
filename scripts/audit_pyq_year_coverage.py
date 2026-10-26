#!/usr/bin/env python3
"""Year-wise PYQ coverage inventory; never treats a linked paper as transcribed MCQs.

Editorial intake: add new *source-checked* adaptations to verified-pyqs.json only
after inspecting the original question paper and recording a real source question
number, explanations, and key review provenance. Do not generate synthetic PYQs.
"""
import json,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
QUESTION_PATH=ROOT/"data/quizzes/verified-pyqs.json"
CATALOG_PATH=ROOT/"data/quizzes/pyq-yearwise-catalog.json"
def audit(rows,catalog):
    problems=[]
    by_year=collections.Counter()
    seen_id=set();seen_source=set()
    for q in rows:
        key=(q.get("SourceExam"),str(q.get("SourceYear")))
        source_ref=(*key,str(q.get("SourceQuestion")))
        if q.get("ID") in seen_id:problems.append("Duplicate ID "+str(q.get("ID")))
        seen_id.add(q.get("ID"))
        if source_ref in seen_source:problems.append("Duplicate official paper reference "+str(source_ref))
        seen_source.add(source_ref)
        if q.get("SourceType")!="Adapted PYQ":problems.append("Source must be marked adapted "+str(q.get("ID")))
        if not q.get("SourceURL","").startswith("https://"):problems.append("Missing source PDF "+str(q.get("ID")))
        if not q.get("SourceQuestion"):problems.append("Missing original question reference "+str(q.get("ID")))
        if q.get("CorrectAnswer") not in "ABCD":problems.append("Bad answer letter "+str(q.get("ID")))
        if len(set(q.get("Option"+letter,"") for letter in "ABCD"))!=4:problems.append("Duplicate options "+str(q.get("ID")))
        if not all(q.get("Explanation"+letter) for letter in "ABCD"):problems.append("Missing option reasoning "+str(q.get("ID")))
        by_year[key]+=1
    entries=[]
    for x in catalog["entries"]:
        name={"Group IV":"TNPSC Group IV","Group II / IIA":"TNPSC Group II/IIA",
              "Civil Services Prelims":"UPSC Civil Services Prelims"}.get(x["exam"],"")
        if x["category"]!="TNPSC" and x["category"]!="UPSC":name=""
        cnt=by_year.get((name,str(x["year"])),0) if name else 0
        entries.append({"category":x["category"],"exam":x["exam"],"year":x["year"],
                        "originalArchive":x["url"],"adaptedQuestions":cnt,
                        "practice10":cnt>=10,"practice20":cnt>=20,
                        "hasOriginalPaper":x["access"]=="official-paper" or any(d.get("type")=="paper" for d in x.get("documents",[])),
                        "hasListedKey":any(d.get("type")=="key" for d in x.get("documents",[])),
                        "note":"Adapted question count is not a complete original paper"})
    return {"records":len(entries),"adaptedQuestions":len(rows),"byRecord":entries,"problems":problems}
if __name__=="__main__":
    result=audit(json.loads(QUESTION_PATH.read_text(encoding="utf-8")),json.loads(CATALOG_PATH.read_text(encoding="utf-8")))
    print(json.dumps({"records":result["records"],"adaptedQuestions":result["adaptedQuestions"],
                      "practiceReady10":sum(x["practice10"] for x in result["byRecord"]),
                      "practiceReady20":sum(x["practice20"] for x in result["byRecord"]),
                      "issues":result["problems"]},indent=2))
    if result["problems"]:raise SystemExit(1)
