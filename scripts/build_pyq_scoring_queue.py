#!/usr/bin/env python3
"""Deterministic CSV queue for pending original-numbered PYQ scoring review.

Never infers an answer letter. Each row corresponds to a source register exception.
Use --check in CI to prevent silently stale downloadable review inventories.
"""
from __future__ import annotations
import argparse
import csv
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "data/quizzes/pyq-scoring-review.json"
OUTPUT = ROOT / "data/quizzes/pyq-source-review-queue.csv"
COLUMNS = ("paper_id", "paper", "year", "original_question_number", "category",
           "source_problem", "source_url", "required_action", "review_status")


def create_rows(payload):
    rows = []
    for p in payload["papers"]:
        warnings = {e["number"]: e["reason"] for e in p.get("additionalTextWarnings", [])}
        base = (p["id"], p["name"], p["year"])
        for num in range(1, p["notMappedToQuestionText"] + 1):
            problem = ("Key must be linked to the printed TNPSC specimen number and A-E options."
                       + (" OCR/figure warning: " + warnings[num] if num in warnings else ""))
            rows.append(base + (num, "unmapped_official_key", problem,
                                p["sourceUrl"], p["reviewNextStep"], "unverified"))
        for num in p["specialAllNumbers"]:
            rows.append(base + (num, "special_all_excluded",
                                "Special ALL-key entry. Current practice score excludes it; check board marking policy.",
                                p["sourceUrl"], p["reviewNextStep"], "policy_review"))
        for item in p["sourceDisputes"]:
            rows.append(base + (item["number"], "source_or_key_dispute",
                                item.get("reason") or "Question/source verification pending",
                                p["sourceUrl"], p["reviewNextStep"], "unverified"))
    expected = payload["totals"]["notScored"]
    if len(rows) != expected:
        raise ValueError(f"Expected {expected} exceptions, got {len(rows)}")
    unique = {(r[0], r[3]) for r in rows}
    if len(unique) != len(rows):
        raise ValueError("Duplicate paper/question in review queue")
    return rows


def render(payload):
    file = io.StringIO(newline="")
    writer = csv.writer(file, lineterminator="\n")
    writer.writerow(COLUMNS)
    writer.writerows(create_rows(payload))
    return file.getvalue()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Reject a stale committed CSV")
    args = parser.parse_args()
    expected = render(json.loads(REGISTER.read_text(encoding="utf-8")))
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            raise SystemExit("PYQ scoring CSV is stale: run python3 scripts/build_pyq_scoring_queue.py")
        print(f"PASS: {len(expected.splitlines()) - 1} ungraded source positions reconciled")
    else:
        OUTPUT.write_text(expected, encoding="utf-8")
        print(f"Created {OUTPUT.relative_to(ROOT)}")
if __name__ == "__main__":
    main()
