#!/usr/bin/env python3
"""Build carefully selected 'Firsts' expansions from local bilingual TN unit banks.

Reads editor-authored IDs and replacement stems; refuses duplicate IDs, missing
answers, missing translations or missing source links. The records are emitted to
workflow logs for review, never auto-committed to the public quiz.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/special-quizzes/firsts-curation-manifest.json"
BANK = ROOT / "data/special-quizzes/firsts.json"
SOURCE = ROOT / "data/textbook"
REGISTRY = json.loads((SOURCE / "source-registry.json").read_text(encoding="utf-8"))["books"]
CANONICAL = re.compile(r"unit-0*\d+\.json$")


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))["items"]
    existing = json.loads(BANK.read_text(encoding="utf-8"))
    existing_ids = {q.get("source_id") for q in existing["questions"]}
    wanted = {q["source_id"]: q for q in manifest}
    if len(wanted) != len(manifest):
        raise ValueError("Duplicate manifest source IDs")
    found = {}
    for path in sorted(SOURCE.rglob("*.json")):
        if not CANONICAL.fullmatch(path.name):
            continue
        d = json.loads(path.read_text(encoding="utf-8"))
        for q in d.get("questions", []):
            ident = q.get("id")
            if ident in wanted and ident not in found:
                found[ident] = (path, d.get("meta") or {}, q)
    output = []
    errors = []
    for row in manifest:
        ident = row["source_id"]
        if ident in existing_ids:
            continue
        if ident not in found:
            errors.append("Missing question: " + ident)
            continue
        path, meta, q = found[ident]
        en = q.get("opts_en") or []
        ta = q.get("opts_ta") or []
        index = q.get("correct")
        if len(en) != 4 or len(ta) != 4 or len(set(en)) != 4 or not isinstance(index, int) or index not in range(4):
            errors.append("Invalid options or key: " + ident)
            continue
        relative = path.relative_to(ROOT).as_posix()
        parts = relative.split("/")
        class_no = int(parts[2].replace("class-", ""))
        key = "/".join(parts[2:-1])
        registry = REGISTRY.get(key, {})
        href = registry.get("source_en_url") or meta.get("source_en_url") or registry.get("source_ta_url") or meta.get("source_ta_url")
        ta_href = registry.get("source_ta_url") or meta.get("source_ta_url") or href
        if not isinstance(href, str) or not href.startswith("https://"):
            errors.append("No direct book URL: " + ident + " " + key)
            continue
        result = {
            "category": row["category"], "class_no": class_no,
            "q_en": row["q_en"], "q_ta": row["q_ta"],
            "opts_en": en, "opts_ta": ta, "correct": index,
            "exp_en": q.get("exp_en") or "Answer: " + en[index],
            "exp_ta": q.get("exp_ta") or "பதில்: " + ta[index],
            "book_en": "Class " + str(class_no) + " · " + str(meta.get("unit_en") or ""),
            "book_ta": str(class_no) + "ஆம் வகுப்பு · " + str(meta.get("unit_ta") or meta.get("unit_en") or ""),
            "page": q.get("page_en") or q.get("page") or None,
            "source_id": ident, "source_path": relative,
            "source_link": href, "source_ta_link": ta_href,
            "review_status": "bank_answer_reviewed_source_page_pending"
        }
        output.append(result)
        print("FIRSTS_ADD_JSON " + json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    print("FIRSTS_BUILD_SUMMARY " + json.dumps({"requested": len(manifest), "new": len(output), "errors": errors}))
    if errors:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
