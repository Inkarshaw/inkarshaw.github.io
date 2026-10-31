#!/usr/bin/env python3
"""Repository-wide structural audit for ClearExams bilingual textbook banks.

This tool verifies objective data integrity. It cannot certify factual accuracy,
semantic English-Tamil alignment, distractor relevance, or textbook provenance;
those still require editorial comparison with the cited Tamil Nadu textbooks.

Examples:
    python3 scripts/audit_textbook_repository.py --all
    python3 scripts/audit_textbook_repository.py data/textbook/class-8/science/term-3/unit-6.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
TAMIL = re.compile(r"[\u0B80-\u0BFF]")
WORD = re.compile(r"[A-Za-z\u0B80-\u0BFF]{4,}")


def normalize(value: str) -> str:
    return " ".join(unicodedata.normalize("NFC", value).casefold().split())


# Case-sensitive SI symbols must not be conflated with ordinary repeated words.
NOTATION_STEM = re.compile(
    r"\b(?:symbols?|notation|capitali[sz](?:ed|ation)|uppercase|lowercase|"
    r"letter[-\s]+case|SI[-\s]+style|SI[-\s]+unit)\b", re.IGNORECASE
)


def distinct_options(options: list[str], stem: str) -> bool:
    if len({normalize(option) for option in options}) == len(options):
        return True
    if not NOTATION_STEM.search(stem):
        return False
    # Letter case may distinguish symbols such as kg and Kg; do not allow
    # options differing by whitespace alone or exact repeats.
    exact = [" ".join(unicodedata.normalize("NFC", x).split()) for x in options]
    return len(set(exact)) == len(options)


def stem_signature(value: str) -> str:
    value = unicodedata.normalize("NFC", value).casefold()
    return " ".join(re.sub(r"[^\w\u0B80-\u0BFF ]", " ", value).split())


def audit_bank(path: Path, data: Any) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    if not isinstance(data, dict) or not isinstance(data.get("questions"), list):
        return {"path": str(path), "questions": 0, "errors": ["bank must be an object with a questions array"], "warnings": []}

    questions = data["questions"]
    ids: set[str] = set()
    stems: dict[str, str] = {}
    for position, question in enumerate(questions, 1):
        label = f"question {position}"
        if not isinstance(question, dict):
            errors.append(f"{label}: record must be an object")
            continue
        ident = question.get("id")
        if not isinstance(ident, str) or not ident.strip():
            errors.append(f"{label}: missing string id")
        elif ident in ids:
            errors.append(f"{label} ({ident}): duplicate id")
        else:
            ids.add(ident)

        required = ("q_en", "q_ta", "exp_en", "exp_ta")
        for key in required:
            if not isinstance(question.get(key), str) or not question[key].strip():
                errors.append(f"{label} ({ident or 'no id'}): missing {key}")
        q_en = question.get("q_en") if isinstance(question.get("q_en"), str) else ""
        q_ta = question.get("q_ta") if isinstance(question.get("q_ta"), str) else ""
        if q_en:
            signature = stem_signature(q_en)
            if signature in stems:
                warnings.append(f"{label} ({ident or 'no id'}): repeated English stem; first seen at {stems[signature]}")
            else:
                stems[signature] = ident or label
        if q_ta and not TAMIL.search(q_ta):
            warnings.append(f"{label} ({ident or 'no id'}): Tamil question contains no Tamil script; verify translation")

        options_en, options_ta = question.get("opts_en"), question.get("opts_ta")
        if not isinstance(options_en, list) or not isinstance(options_ta, list):
            errors.append(f"{label} ({ident or 'no id'}): both option arrays are required")
            continue
        if len(options_en) != 4 or len(options_ta) != 4:
            errors.append(f"{label} ({ident or 'no id'}): exactly four English and Tamil options are required")
            continue
        for lang, options in (("English", options_en), ("Tamil", options_ta)):
            if any(not isinstance(option, str) or not option.strip() for option in options):
                errors.append(f"{label} ({ident or 'no id'}): empty or non-string {lang} option")
            else:
                if not distinct_options(options, q_en):
                    errors.append(f"{label} ({ident or 'no id'}): duplicate {lang} options")
                elif len({normalize(option) for option in options}) != 4:
                    warnings.append(f"{label} ({ident or 'no id'}): case-sensitive {lang} options; verify symbol notation")
            # Shared notation, formulae, numbers and units may be identical in
            # both languages; Tamil script in the stem is a more reliable
            # translation-presence signal than requiring script in every choice.

        correct = question.get("correct")
        if not isinstance(correct, int) or isinstance(correct, bool) or correct not in range(4):
            errors.append(f"{label} ({ident or 'no id'}): correct must be an integer from 0 to 3")
            continue
        exp_en = question.get("exp_en") if isinstance(question.get("exp_en"), str) else ""
        exp_ta = question.get("exp_ta") if isinstance(question.get("exp_ta"), str) else ""
        if len(exp_en.strip()) < 40 or len(exp_ta.strip()) < 25:
            warnings.append(f"{label} ({ident or 'no id'}): one or both explanations are very short; review usefulness")
        if isinstance(options_en[correct], str) and WORD.search(options_en[correct]) and options_en[correct] not in exp_en:
            warnings.append(f"{label} ({ident or 'no id'}): English explanation does not name the keyed option; verify answer/explanation")
        if isinstance(options_ta[correct], str) and WORD.search(options_ta[correct]) and options_ta[correct] not in exp_ta:
            warnings.append(f"{label} ({ident or 'no id'}): Tamil explanation does not name the keyed option; verify answer/explanation")

    return {"path": str(path), "questions": len(questions), "errors": errors, "warnings": warnings}


def bank_paths(args: argparse.Namespace) -> list[Path]:
    if args.all:
        return sorted(
            path for path in (ROOT / "data/textbook").glob("class-*/**/*.json")
            if not path.name.startswith("index")
        )
    if args.changed_from:
        import subprocess
        result = subprocess.run(
            ["git", "diff", "--name-only", f"{args.changed_from}...HEAD", "--", "data/textbook/"],
            cwd=ROOT, text=True, capture_output=True, check=True,
        )
        return [
            ROOT / line for line in result.stdout.splitlines()
            if (line.endswith(".json")
                and len(Path(line).parts) >= 4
                and Path(line).parts[:2] == ("data", "textbook")
                and re.fullmatch(r"class-(?:6|7|8|9|10|11|12)", Path(line).parts[2])
                and not Path(line).name.startswith("index"))
        ]
    return [Path(value).resolve() for value in args.paths]


def questions_unchanged(base: Any, current: Any) -> bool:
    """Source-only metadata revisions should not re-gate unchanged question bodies."""
    return (
        isinstance(base, dict) and isinstance(current, dict)
        and isinstance(base.get("questions"), list)
        and isinstance(current.get("questions"), list)
        and base["questions"] == current["questions"]
    )


def exclude_metadata_only_paths(paths: list[Path], ref: str) -> list[Path]:
    """Compare original question arrays with the merge-base revision."""
    import subprocess
    result = []
    for path in paths:
        if not path.is_file():
            result.append(path)
            continue
        relative = path.relative_to(ROOT).as_posix()
        base = subprocess.run(
            ["git", "show", f"{ref}:{relative}"],
            cwd=ROOT, text=True, capture_output=True,
        )
        if base.returncode:
            result.append(path)  # New question banks must be fully audited.
            continue
        try:
            old_data = json.loads(base.stdout)
            new_data = json.loads(path.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError, OSError):
            result.append(path)  # Bad JSON must still be rejected.
            continue
        if not questions_unchanged(old_data, new_data):
            result.append(path)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--all", action="store_true", help="audit every Class 6–12 textbook JSON file")
    group.add_argument("--changed-from", metavar="REF", help="audit textbook JSON files changed since REF")
    parser.add_argument("paths", nargs="*", help="one or more textbook JSON files")
    parser.add_argument("--changed-questions-only", action="store_true",
                        help="with --changed-from, skip banks where only metadata changed")
    parser.add_argument("--json", action="store_true", help="print a machine-readable report")
    args = parser.parse_args()
    if sum((bool(args.all), bool(args.changed_from), bool(args.paths))) != 1:
        parser.error("choose exactly one of --all, --changed-from REF, or one or more file paths")
    if args.changed_questions_only and not args.changed_from:
        parser.error("--changed-questions-only requires --changed-from")
    paths = bank_paths(args)
    if args.changed_questions_only:
        paths = exclude_metadata_only_paths(paths, args.changed_from)
    report: list[dict[str, Any]] = []
    invalid_json = 0
    for path in paths:
        if not path.is_file():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            invalid_json += 1
            report.append({"path": str(path), "questions": 0, "errors": [f"invalid or unreadable JSON: {error}"], "warnings": []})
            continue
        if path.name.startswith("index"):
            continue
        report.append(audit_bank(path, data))

    errors = sum(len(item["errors"]) for item in report)
    warnings = sum(len(item["warnings"]) for item in report)
    total_questions = sum(item["questions"] for item in report)
    summary = {
        "banks_audited": len(report), "questions_audited": total_questions,
        "errors": errors, "warnings": warnings, "invalid_json_files": invalid_json,
        "banks": report,
    }
    if args.json:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print(f"Audited {len(report)} banks / {total_questions} questions: {errors} structural errors, {warnings} editorial warnings.")
        for item in report:
            if item["errors"] or item["warnings"]:
                print(f"{item['path']}: {len(item['errors'])} errors, {len(item['warnings'])} warnings")
                for message in item["errors"][:3]:
                    print(f"  ERROR {message}")
                for message in item["warnings"][:2]:
                    print(f"  REVIEW {message}")
                if len(item["errors"]) > 3 or len(item["warnings"]) > 2:
                    print("  ... more findings in JSON report")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
