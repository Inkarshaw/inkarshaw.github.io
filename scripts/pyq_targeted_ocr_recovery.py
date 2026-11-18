#!/usr/bin/env python3
"""Focused official-PDF OCR of blank/garbled TNPSC source pages (ungraded).

Do not infer questions, answers, option labels, or official keys. This produces
machine text only, preserving source PDF page numbers for later editorial work.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import tempfile
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/quizzes/pyq-reader-drafts"
# These are the known missing-text source pages, NOT an invented list of questions.
PAGE_TARGETS = {
    "tnpsc-group-ii-iia-2022-general-english-ccs2e-2022-answer-key-opt-a4ab2eb8":
        (7, 16, 17, 21, 23, 25),
    "tnpsc-group-ii-iia-2022-general-studies-ccs2e-2022-answer-key-opt-5aaa9a34":
        (28, 36, 40, 62, 66),
    "tnpsc-group-iv-2016-06-11-2016-g4-gs-3a616959":
        (16, 24, 39, 43),
}


def source(paper_id: str, root: Path = SOURCE) -> dict:
    if paper_id not in PAGE_TARGETS:
        raise ValueError("Unknown focused OCR source paper")
    doc = json.loads((root / (paper_id + ".json")).read_text(encoding="utf-8"))
    url = doc.get("sourcePdf", "")
    parsed = urlparse(url)
    if (doc.get("id") != paper_id or doc.get("grading") != "disabled"
            or doc.get("draftOnly") is not True
            or parsed.scheme != "https"
            or parsed.hostname not in {"tnpsc.gov.in", "www.tnpsc.gov.in"}
            or not parsed.path.lower().endswith(".pdf")):
        raise ValueError("Untrusted PDF or invalid original-source provenance")
    return doc


def overlay(paper: dict, recognized: list[dict]) -> dict:
    pages = []
    seen = set()
    for page in recognized:
        n = page.get("pdfPage")
        text = page.get("text", "")
        if (not isinstance(n, int) or n not in PAGE_TARGETS[paper["id"]]
                or n in seen or not isinstance(text, str)):
            continue
        seen.add(n)
        pages.append({
            "pdfPage": n,
            "text": text[:30000],
            "method": "tesseract-tam-eng-unverified",
            "ocrStatus": "readable-unverified" if len(text.strip()) >= 60 else "still-unreadable",
        })
    pages.sort(key=lambda p: p["pdfPage"])
    return {
        "schemaVersion": 1, "paperId": paper["id"], "sourcePdf": paper["sourcePdf"],
        "draftOnly": True, "verifiedOriginalText": False, "grading": "disabled",
        "officialFinalKeyMapped": False,
        "notes": "Automated OCR of selected source PDF pages. Unverified text; no invented options, keys or marks. Retain original printed PDF for figures and accurate Tamil/English.",
        "pages": pages
    }


def recover(paper_id: str, dest: Path, timeout: int) -> dict:
    from pyq_bulk_pdf_to_drafts import download, ocr_page
    import fitz
    report = {"paperId": paper_id, "status": "unavailable", "targetPages": len(PAGE_TARGETS[paper_id])}
    try:
        doc = source(paper_id)
        with tempfile.TemporaryDirectory(prefix="clearexams-pyq-gap-") as tmp:
            pdf = Path(tmp) / "original.pdf"
            download(doc["sourcePdf"], pdf, timeout)
            with fitz.open(pdf) as archive:
                selected = []
                for n in PAGE_TARGETS[paper_id]:
                    if n < 1 or n > len(archive):
                        continue
                    try:
                        txt = ocr_page(archive[n-1])
                    except Exception as err:
                        txt = ""
                        print(f"OCR page {n} failed: {str(err)[:160]}", flush=True)
                    selected.append({"pdfPage": n, "text": txt})
        result = overlay(doc, selected)
        dest.mkdir(parents=True, exist_ok=True)
        (dest / (paper_id + ".json")).write_text(
            json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
        )
        count = sum(p["ocrStatus"] == "readable-unverified" for p in result["pages"])
        report.update(status="ocr-draft-staged",pages=len(result["pages"]),readablePages=count)
    except Exception as err:
        report["error"] = str(err)[:350]
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=SOURCE / "ocr-recovery")
    parser.add_argument("--timeout", type=int, default=55)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        tasks = {pool.submit(recover, pid, args.output, args.timeout): pid for pid in PAGE_TARGETS}
        reports = [f.result() for f in as_completed(tasks)]
    reports.sort(key=lambda r: r["paperId"])
    index = {
        "schemaVersion": 1, "draftOnly": True, "gradingEnabled": False,
        "targetedPaperCount": len(PAGE_TARGETS), "papers": reports
    }
    (args.output / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("Focused OCR status:", json.dumps(reports, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
