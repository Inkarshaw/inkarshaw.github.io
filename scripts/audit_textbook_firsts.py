#!/usr/bin/env python3
"""Inventory firsts-related MCQ candidates across *all present* TN textbook banks.

This is a discovery audit, NOT certification against the original printed books.
It deliberately avoids automatically approving answers or treating every 'first'
in a process, date or sequence as a historical superlative.

Run: python scripts/audit_textbook_firsts.py [output_json]
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data" / "textbook"
AUDIT_VERSION = "2026-10-30.1"
CANONICAL = re.compile(r"unit-0*[1-9][0-9]*\.json$")
FIRST = re.compile(
    r"\b(first|earliest|pioneer(?:ing)?|invent(?:ed|or|ion)|discover(?:ed|er|y)"
    r"|founded|founder|established|introduced|inaugurated)\b", re.I
)
HIGH = re.compile(
    r"\b(first|earliest)\s+(?:ever\s+)?"
    r"(?:Indian|woman|female|man|human|person|state|president|minister|governor"
    r"|school|university|college|institution|trade union|satellite|space"
    r"|newspaper|daily|computer|railway|passenger|factory|mill|king|queen"
    r"|ruler|dynasty|empire|legislator|judge|mission|meeting|session|flight"
    r"|language|scientist|novel|book|reformer|party|movement|battle|may day)"
    r"|\bwho\s+(?:first|invented|discovered|founded|established)\b"
    r"|\bwhich\s+.*\b(first|invented|discovered)\b", re.I
)
NOISE = re.compile(
    r"\bfirst\s+(?:step|stage|few|one|two|three|half|quarter|time"
    r"|process|line|example|number|stage|attempt|in the sequence"
    r"|to be done|column|row|generation|thing|move|phase)\b", re.I
)


def main() -> int:
    out_path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "firsts-audit-candidates.json"
    coverage: list[dict] = []
    candidates: list[dict] = []
    rejected: list[dict] = []
    errors: list[dict] = []
    unit_files = sorted(p for p in BANK.rglob("*.json") if CANONICAL.fullmatch(p.name))
    for path in unit_files:
        rel = path.relative_to(ROOT).as_posix()
        class_match = re.search(r"class-(\d+)", rel)
        class_num = int(class_match.group(1)) if class_match else -1
        subject = rel.split("/")[3] if len(rel.split("/")) > 3 else "unknown"
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            questions = data.get("questions", [])
            if not isinstance(questions, list):
                raise ValueError("questions is not a list")
            m = data.get("meta") or {}
            coverage.append({"path": rel, "class": class_num, "subject": subject,
                             "unit": m.get("unit_en", ""), "questions": len(questions),
                             "source": m.get("source") or m.get("source_en_url") or ""})
            for q in questions:
                en = str(q.get("q_en", "") or "")
                if not FIRST.search(en):
                    continue
                options = q.get("opts_en") or []
                correct = q.get("correct")
                answer = options[correct] if isinstance(correct, int) and 0 <= correct < len(options) else None
                item = {
                    "class": class_num, "subject": subject, "path": rel,
                    "unit": m.get("unit_en", ""), "source_id": q.get("id"),
                    "q_en": en, "q_ta": q.get("q_ta", ""),
                    "answer": answer, "options_en": options, "options_ta": q.get("opts_ta"),
                    "correct": correct, "exp_en": q.get("exp_en"),
                    "exp_ta": q.get("exp_ta"), "page_en": q.get("page_en") or q.get("page"),
                    "review_status": "not_checked_against_source",
                }
                item["priority"] = "high" if HIGH.search(en) and not NOISE.search(en) else "review"
                if not answer or len(options) != 4:
                    rejected.append({**item, "reason": "invalid_answer_or_options"})
                else:
                    candidates.append(item)
        except Exception as e:
            errors.append({"path": rel, "error": str(e)})
    coverage_summary = {str(i): {"units": sum(x["class"] == i for x in coverage),
                                  "questions": sum(x["questions"] for x in coverage if x["class"] == i),
                                  "first_candidates": sum(x["class"] == i for x in candidates),
                                  "high_priority": sum(x["class"] == i and x["priority"] == "high" for x in candidates),
                                  "subjects": sorted({x["subject"] for x in coverage if x["class"] == i})}
                        for i in range(6, 13)}
    result = {
        "version": AUDIT_VERSION, "scope": "present canonical TN school-bank files only",
        "original_book_verification": False,
        "coverage": coverage_summary, "units": coverage,
        "candidates": candidates, "rejected": rejected, "parse_errors": errors,
        "summary": {"units_scanned": len(unit_files), "banks_read": len(coverage),
                    "questions_scanned": sum(x["questions"] for x in coverage),
                    "potential_firsts": len(candidates),
                    "high_priority": sum(x["priority"] == "high" for x in candidates),
                    "rejected": len(rejected), "errors": len(errors)},
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("FIRSTS_AUDIT_SUMMARY " + json.dumps(result["summary"], ensure_ascii=False))
    print("FIRSTS_CLASS_COVERAGE " + json.dumps(coverage_summary, ensure_ascii=False))
    for x in candidates:
        if x["priority"] == "high":
            record = {"c": x["class"], "unit": x["unit"], "path": x["path"],
                      "id": x["source_id"], "q": x["q_en"], "a": x["answer"],
                      "pg": x["page_en"]}
            print("FIRSTS_HIGH " + json.dumps(record, ensure_ascii=False))
    if errors:
        for x in errors:
            print("FIRSTS_ERROR " + json.dumps(x, ensure_ascii=False))
    return 0 if not errors else 2


if __name__ == "__main__":
    raise SystemExit(main())
