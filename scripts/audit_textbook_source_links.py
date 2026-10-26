#!/usr/bin/env python3
"""Audit the *actual destinations* of English/Tamil textbook quiz source links.

Checks every question JSON, including supplemental -quiz-N[-part-N] batches.
This structural audit cannot establish that remote hosts still serve every PDF,
or that the printed page number matches the PDF viewer's physical page index.
"""
import argparse
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "textbook"
URL_FIELDS = ("source_en_url", "source_ta_url", "source_url", "textbook_url")


def is_direct_book_url(value):
    if not isinstance(value, str) or not value.strip():
        return False
    url = urlparse(value.strip())
    host = (url.hostname or "").lower()
    path = url.path.lower()
    if url.scheme != "https" or not host or host == "clearexams.ink" or host == "inkarshaw.github.io":
        return False
    if re.search(r"(?:textbook-play|textbook-quiz|daily-quiz|quiz-play)\.html$", path):
        return False
    if path.endswith(".pdf"):
        return True
    if host == "drive.google.com":
        return bool(re.match(r"^/file/d/[A-Za-z0-9_-]+/(?:view|preview)?$", url.path)
                    or path == "/open" and parse_qs(url.query).get("id"))
    return bool(re.search(r"(?:chapter|lesson)[-/\w]*\.html?$", path)
                or host == "tnebooks.github.io" and re.search(r"/docs/[^/]+/?$", path))


def base_document(file):
    """Supplemental quiz metadata is layered on the parent unit's metadata."""
    m = re.match(r"^(unit-\d+)-quiz-\d+(?:-(?:part|more)-\d+)?\.json$", file.name)
    if not m:
        return {}
    path = file.with_name(m.group(1) + ".json")
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8")).get("meta", {})
    except (ValueError, OSError):
        return {}


def source_choices(question, meta, registered, language):
    other = "ta" if language == "en" else "en"
    # Order mirrors safeSourceUrl() in textbook-play.html.
    return [
        question.get("source_" + language + "_url"),
        meta.get("source_" + language + "_url"),
        registered.get("source_" + language + "_url"),
        question.get("source_url"),
        meta.get("source_url"),
        meta.get("textbook_url"),
        question.get("source_" + other + "_url"),
        meta.get("source_" + other + "_url"),
        registered.get("source_" + other + "_url"),
    ]


def audit():
    registry = json.loads((DATA / "source-registry.json").read_text(encoding="utf-8"))["books"]
    counts = Counter()
    missing_by_book = Counter()
    missing_examples, invalid_examples, files = [], [], []
    for path in sorted(DATA.rglob("*.json")):
        if path.name in ("index.json", "source-registry.json"):
            continue
        relative = path.relative_to(DATA).as_posix()
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (ValueError, OSError) as exc:
            counts["unreadable_or_invalid_json_files"] += 1
            invalid_examples.append({"file": relative, "issue": str(exc)[:100]})
            continue
        if not isinstance(doc, dict) or not isinstance(doc.get("questions"), list):
            continue
        questions = doc["questions"]
        meta = {**base_document(path), **(doc.get("meta") or {})}
        registered = registry.get(path.parent.relative_to(DATA).as_posix(), {})
        counts["question_files"] += 1
        counts["question_entries"] += len(questions)
        files.append(relative)
        # All explicit URLs must point to book content, regardless of fallback availability.
        for key in URL_FIELDS:
            value = meta.get(key)
            if value and not is_direct_book_url(value):
                counts["invalid_metadata_urls"] += 1
                if len(invalid_examples) < 35:
                    invalid_examples.append({"file": relative, "field": "meta." + key, "url": str(value)[:160]})
        for n, q in enumerate(questions, 1):
            if not isinstance(q, dict):
                counts["invalid_question_records"] += 1
                continue
            for key in URL_FIELDS:
                value = q.get(key)
                if value and not is_direct_book_url(value):
                    counts["invalid_question_urls"] += 1
                    if len(invalid_examples) < 35:
                        invalid_examples.append({"file": relative, "question": q.get("id", n), "field": key, "url": str(value)[:160]})
            for language in ("en", "ta"):
                valid = any(is_direct_book_url(v) for v in source_choices(q, meta, registered, language))
                counts[language + "_linked" if valid else language + "_missing"] += 1
                if not valid:
                    missing_by_book[path.parent.relative_to(DATA).as_posix()] += 1
                exact = any(is_direct_book_url(v) for v in
                            (q.get("source_" + language + "_url"),
                             meta.get("source_" + language + "_url"),
                             registered.get("source_" + language + "_url")))
                if valid and not exact:
                    counts[language + "_fallback_to_other_or_unspecified"] += 1
                if not valid and len(missing_examples) < 35:
                    missing_examples.append({"file": relative, "question": q.get("id", n), "language": language})
    return {"counts": dict(sorted(counts.items())), "missing_by_book": dict(missing_by_book.most_common()), "files_scanned": files,
            "missing_examples": missing_examples, "invalid_examples": invalid_examples}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json-out", type=Path, help="Write machine-readable results")
    parser.add_argument("--strict", action="store_true", help="Fail on invalid explicit source links or malformed JSON")
    parser.add_argument("--require-coverage", action="store_true", help="Fail if any question has no direct source in either language")
    args = parser.parse_args()
    report = audit()
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Textbook source-link audit:")
    for key, value in report["counts"].items():
        print(f"  {key}: {value}")
    print("Missing by textbook:", json.dumps(dict(list(report["missing_by_book"].items())[:30]), ensure_ascii=False))
    print("Missing examples:", json.dumps(report["missing_examples"][:12], ensure_ascii=False))
    print("Invalid examples:", json.dumps(report["invalid_examples"][:12], ensure_ascii=False))
    counts = report["counts"]
    if args.strict and any(counts.get(k, 0) for k in (
            "invalid_metadata_urls", "invalid_question_urls", "unreadable_or_invalid_json_files", "invalid_question_records")):
        return 1
    if args.require_coverage and (counts.get("en_missing", 0) or counts.get("ta_missing", 0)):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
