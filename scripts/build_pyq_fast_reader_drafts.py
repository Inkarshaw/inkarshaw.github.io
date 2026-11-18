#!/usr/bin/env python3
"""Produce a browser-readable, explicitly unverified PYQ page-text shelf.

Input is the finished fast PDF extraction artifact. Entire source PDFs were
traversed by that job. Only PDFs with readable text layers are exposed, and
machine-parsed question numbers/options are discarded until source review.
This module NEVER publishes verified PYQ quizzes or final-key scores.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def build(source: Path, dest: Path, min_pages: int = 10) -> dict:
    manifest = json.loads((source / "index.json").read_text(encoding="utf-8"))
    if manifest.get("gradingEnabled") is not False or not manifest.get("draftOnly"):
        raise ValueError("Only ungraded source-labelled PDF drafts are accepted")
    dest.mkdir(parents=True, exist_ok=True)
    entries = []
    for paper in manifest.get("papers", []):
        if paper.get("status") != "extracted-unverified":
            continue
        filename = paper.get("file", "")
        if not filename.endswith(".json") or "/" in filename or "\\" in filename:
            continue
        draft_path = source / filename
        if not draft_path.is_file():
            continue
        draft = json.loads(draft_path.read_text(encoding="utf-8"))
        if draft.get("sourcePdf") != paper.get("url") or draft.get("id") != paper.get("id"):
            raise ValueError("Original PDF and fast-extraction identity mismatch")
        good_pages = [
            {"pdfPage": page["pdfPage"], "text": page["text"],
             "method": page.get("method", "pdf-text-layer")}
            for page in draft.get("pages", [])
            if isinstance(page.get("pdfPage"), int)
            and isinstance(page.get("text"), str) and len(page["text"].strip()) >= 30
        ]
        if len(good_pages) < min_pages:
            continue
        clean = {
            "schemaVersion": 1, "id": draft["id"],
            "exam": draft["exam"], "year": draft["year"],
            "sourcePdf": draft["sourcePdf"],
            "sourceFilename": draft.get("sourceFilename"),
            "sourceTextKind": "unverified-original-pdf-text-layer-page-draft",
            "draftOnly": True, "officialFinalKeyMapped": False, "grading": "disabled",
            "questionCandidates": [],
            "pages": good_pages,
            "stats": {"pages": len(draft.get("pages", [])), "textPages": len(good_pages)},
            "notes": "Unverified PDF text layer; displayed by original PDF page, NOT a complete numbered MCQ quiz. Equations, Tamil, choices, tables, figures and column order may be corrupted. No guesses, grading or source certification.",
        }
        out_name = draft["id"] + ".json"
        (dest / out_name).write_text(json.dumps(clean, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        entries.append({
            "id": draft["id"], "exam": draft["exam"], "year": draft["year"],
            "category": paper.get("category"), "paperName": draft.get("sourceFilename"),
            "sourcePdf": draft["sourcePdf"], "file": out_name,
            "textPages": len(good_pages),
            "totalPdfPages": len(draft.get("pages", [])),
            "status": "machine-extracted-page-text-unverified",
            "ungraded": True,
        })
    entries.sort(key=lambda e: (e["category"] or "", e["exam"], -e["year"], e["id"]))
    output = {
        "schemaVersion": 1, "draftOnly": True, "gradingEnabled": False,
        "description": "Machine-extracted typewritten PDF pages for study. These are not original-numbered playable MCQ quizzes, and exact source text is not guaranteed.",
        "availablePapers": len(entries),
        "sourcePapersChecked": len(manifest.get("papers", [])),
        "entries": entries,
    }
    (dest / "index.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    keep = {"index.json", *(e["file"] for e in entries)}
    for existing in dest.glob("*.json"):
        if existing.name not in keep:
            existing.unlink()
    return output

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=ROOT / "data/quizzes/pyq-fast-drafts")
    parser.add_argument("--output", type=Path, default=ROOT / "data/quizzes/pyq-reader-drafts")
    parser.add_argument("--min-readable-pages", type=int, default=10)
    args = parser.parse_args()
    index = build(args.input, args.output, args.min_readable_pages)
    print("Published ungraded typed PDF page drafts:", index["availablePapers"],
          "/", index["sourcePapersChecked"], "source PDFs checked")

if __name__ == "__main__":
    main()
