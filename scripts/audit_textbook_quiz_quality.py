#!/usr/bin/env python3
"""Offline bilingual MCQ quality gate for ClearExams textbook review batches.

Checks structural correctness, obvious distractor/template failures, and answer-key
alignment. It does NOT establish historical factual truth or quality of translation;
those require comparison with textbooks and independent references.

Usage:
    python3 scripts/audit_textbook_quiz_quality.py \
      data/textbook/class-11/history/unit-04.json --start 160 --count 100
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

BAD_FRAGMENTS = (
    "what is the correct textbook answer for:",
    "layout of city and construction of buildings",
    "waterways for trade and travel",
    "chakravartin / ekarat",
    "identify the correct historical source, work, author",
)
RE_NUM = re.compile(r"\d[\d,]*(?:[–-]\d+)?")
RE_START_NUMBER = re.compile(r"^\s*[0-9]")
RE_EN_DATE = re.compile(r"\b(?:bce|ce|bc|ad)\b", re.IGNORECASE)


def normalize(text: str) -> str:
    """Normalize labels without erasing Tamil and other combining vowel marks.

    Python's \\w does not include all Unicode mark categories. Stripping marks
    would conflate distinct Tamil words such as பாகா and போகா, wrongly
    flagging legitimate bilingual distractors as duplicates.
    """
    normalized = unicodedata.normalize("NFC", text.casefold())
    safe = "".join(
        char if (char.isspace() or unicodedata.category(char)[0] in "LNM" or char in "+-−√≠=<>/×÷·^²³°%:")
        else " "
        for char in normalized
    )
    return " ".join(safe.split())


def audit(records: list[dict], start: int, count: int) -> dict:
    problems: list[str] = []
    warnings: list[str] = []
    stop = start + count
    if start < 0 or count < 1 or stop > len(records):
        raise ValueError("Reviewed window must lie inside the question bank")
    # Quizzes have 20 items except a legitimate trailing partial quiz.
    # A non-multiple-of-20 window is valid only if it consumes the entire
    # remaining tail, beginning at a real 20-item quiz boundary.
    if start % 20 or (count % 20 and stop != len(records)):
        raise ValueError("Use complete 20-question quiz boundaries, except for the final bank tail")

    ids = [q.get("id", "") for q in records]
    if len(ids) != len(set(ids)):
        problems.append("Question IDs are duplicated in the full bank")

    seen_en: dict[str, str] = {}
    answer_positions = Counter()
    for ordinal, q in enumerate(records[start:stop], start=start + 1):
        ident = q.get("id") or f"position {ordinal}"
        for key in ("q_en", "q_ta", "exp_en", "exp_ta"):
            if not isinstance(q.get(key), str) or not q[key].strip():
                problems.append(f"{ident}: missing {key}")
        en, ta = q.get("q_en", ""), q.get("q_ta", "")
        if not en.endswith("?") or not ta.endswith("?"):
            problems.append(f"{ident}: both language questions must end with '?'")
        if any(frag in en.casefold() for frag in BAD_FRAGMENTS):
            problems.append(f"{ident}: machine-generated question stem")
        if len(en.strip()) < 34 or len(ta.strip()) < 18:
            problems.append(f"{ident}: underspecified question")
        if len(q.get("exp_en", "").strip()) < 75 or len(q.get("exp_ta", "").strip()) < 50:
            problems.append(f"{ident}: explanation lacks useful bilingual detail")

        clean = normalize(en)
        if clean in seen_en:
            problems.append(f"{ident}: duplicate question with {seen_en[clean]}")
        seen_en[clean] = ident

        options_en, options_ta = q.get("opts_en"), q.get("opts_ta")
        if not isinstance(options_en, list) or not isinstance(options_ta, list):
            problems.append(f"{ident}: bilingual options are missing")
            continue
        if len(options_en) != 4 or len(options_ta) != 4:
            problems.append(f"{ident}: exactly 4 aligned options needed per language")
            continue
        for lang, items in (("en", options_en), ("ta", options_ta)):
            if not all(isinstance(v, str) and v.strip() for v in items):
                problems.append(f"{ident}: empty {lang} option")
                continue
            if len({normalize(x) for x in items}) != 4:
                problems.append(f"{ident}: duplicate {lang} distractors")
            if any(any(f in x.casefold() for f in BAD_FRAGMENTS[2:]) for x in items):
                problems.append(f"{ident}: unrelated boilerplate distractor in {lang}")
        index = q.get("correct")
        if not isinstance(index, int) or isinstance(index, bool) or index not in range(4):
            problems.append(f"{ident}: invalid correct-answer index")
            continue
        answer_positions["ABCD"[index]] += 1
        chosen_en, chosen_ta = options_en[index], options_ta[index]
        if chosen_en not in q.get("exp_en", "") or chosen_ta not in q.get("exp_ta", ""):
            warnings.append(f"{ident}: explanation does not literally name the keyed answer in both languages")

        # Numerical keys must retain the same Arabic-digit values across languages.
        en_nums, ta_nums = RE_NUM.findall(chosen_en), RE_NUM.findall(chosen_ta)
        if en_nums and (en_nums != ta_nums):
            problems.append(f"{ident}: numerical answer differs in Tamil and English")
        # A numerical/date option must be compared with the same kind of answers.
        all_en_num = [bool(RE_START_NUMBER.match(x)) for x in options_en]
        if any(all_en_num) and not all(all_en_num):
            problems.append(f"{ident}: mixed numeric and nonnumeric answer options")
        all_en_date = [bool(RE_EN_DATE.search(x)) for x in options_en]
        if any(all_en_date) and not all(all_en_date):
            problems.append(f"{ident}: mixed chronology and nonchronology options")

    return {
        "reviewed_start": start,
        "reviewed_count": count,
        "reviewed_quizzes": f"{start // 20 + 1}–{(stop + 19) // 20}",
        "answer_positions": dict(sorted(answer_positions.items())),
        "warnings": warnings,
        "errors": problems,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--start", type=int, required=True, help="zero-based reviewed starting record")
    parser.add_argument("--count", type=int, required=True, help="reviewed count, in complete 20-item quizzes")
    parser.add_argument("--json", action="store_true", help="print machine-readable audit output")
    args = parser.parse_args()
    data = json.loads(args.path.read_text(encoding="utf-8"))
    records = data.get("questions")
    if not isinstance(records, list):
        parser.error("input does not contain a questions list")
    try:
        result = audit(records, args.start, args.count)
    except ValueError as err:
        parser.error(str(err))
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Audited {args.path} quizzes {result['reviewed_quizzes']}: {result['reviewed_count']} bilingual MCQs.")
        print(f"Answer distribution: {result['answer_positions']}")
        for item in result["warnings"][:10]:
            print("WARNING:", item)
        if len(result["warnings"]) > 10:
            print(f"... {len(result['warnings']) - 10} more warnings")
        for item in result["errors"]:
            print("ERROR:", item)
    return 1 if result["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
