#!/usr/bin/env python3
"""Report exam-board review debt. Does not fetch or 'verify' live notices."""
import argparse, json
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
POLICY=ROOT/"data/exams/review-schedule.json"
CATALOG=ROOT/"data/exams/exam-catalog.json"

def review_due(policy, today):
    rows=[]
    for board,entry in policy["boards"].items():
        cadence=int(policy["cadenceDays"][board])
        last=date.fromisoformat(entry["lastReviewed"])
        age=(today-last).days
        rows.append({"board":board,"name":entry["name"],"lastReviewed":last.isoformat(),
                     "daysSinceReview":age,"cadenceDays":cadence,"overdue":age>cadence,
                     "source":entry["source"],"owner":entry.get("owner","Calendar editor")})
    return rows

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--today",default=date.today().isoformat())
    p.add_argument("--output",default="")
    args=p.parse_args()
    policy=json.loads(POLICY.read_text(encoding="utf-8"))
    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    assert set(policy["boards"])==set(catalog),"All board types require a review cadence"
    rows=review_due(policy,date.fromisoformat(args.today))
    output={"asOf":args.today,"overdue":[x for x in rows if x["overdue"]],"boards":rows,
            "notice":"An overdue check is not an official date update. Review official board pages before modifying the calendar."}
    data=json.dumps(output,ensure_ascii=False,indent=2)+"\n"
    if args.output:Path(args.output).write_text(data,encoding="utf-8")
    print(data)
