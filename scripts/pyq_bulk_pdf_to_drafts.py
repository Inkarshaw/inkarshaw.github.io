#!/usr/bin/env python3
"""Bulk PDF -> ungraded, page-preserving PYQ text candidates.

Uses official direct PDF links already in the ClearExams archive. Never fabricates
missing questions, scores answers, or labels OCR as verified/verbatim.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse, unquote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
HOSTS = {"tnpsc.gov.in", "www.tnpsc.gov.in", "tnusrb.tn.gov.in", "www.tnusrb.tn.gov.in"}
TAMIL_DIGITS = str.maketrans("௦௧௨௩௪௫௬௭௮௯", "0123456789")
TAMIL_OPTIONS = {"அ": "A", "ஆ": "B", "இ": "C", "ஈ": "D", "உ": "E"}
QSTART = re.compile(r"^\s*(?:Q(?:uestion)?\.?\s*(?:No\.?)?\s*[:.]?\s*)?([0-9]{1,3})\s*[).:]\s*(.*)$", re.I)
OSTART = re.compile(r"^\s*(?:\(([A-Ea-eஅஆஇஈஉ])\)|([A-Ea-eஅஆஇஈஉ])[).:])\s*(.*)$")
MAX_PDF_BYTES = 95 * 1024 * 1024


def source_papers(catalog: Path) -> list[dict]:
    data = json.loads(catalog.read_text(encoding="utf-8"))
    results, seen = [], set()
    for entry in data.get("entries", []):
        for document in entry.get("documents", []):
            if document.get("type") != "paper":
                continue
            url = document.get("url", "")
            parts = urlparse(url)
            if parts.scheme != "https" or parts.hostname not in HOSTS or not parts.path.lower().endswith(".pdf"):
                continue
            name = unquote(Path(parts.path).name)
            # The user requested Open/General-Candidates papers, not departmental-only papers.
            if re.search(r"dept|departmental", name, re.I):
                continue
            if url.lower() in seen:
                continue
            seen.add(url.lower())
            paper_id = re.sub(r"[^a-z0-9]+", "-", f"{entry.get('category', '')}-{entry.get('exam', '')}-{entry.get('year', '')}-{Path(name).stem}".lower()).strip("-")
            paper_id = paper_id[:95] + "-" + hashlib.sha256(url.encode()).hexdigest()[:8]
            results.append({
                "id": paper_id, "category": entry.get("category"), "exam": entry.get("exam"),
                "year": entry.get("year"), "description": entry.get("paper"),
                "url": url, "filename": name,
            })
    return results


def download(url: str, output: Path, timeout: int):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 ClearExamsPaperTextDraft/1.0", "Accept": "application/pdf"})
    with urlopen(req, timeout=timeout) as response:
        first = response.read(8)
        if not first.startswith(b"%PDF-"):
            raise ValueError("Official URL did not return a PDF")
        size = len(first)
        with output.open("wb") as f:
            f.write(first)
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_PDF_BYTES:
                    raise ValueError("PDF exceeds 95 MB safety limit")
                f.write(chunk)


def ocr_page(page) -> str:
    pixels = page.get_pixmap(dpi=145, alpha=False)
    png = pixels.tobytes("png")
    proc = subprocess.run(
        ["tesseract", "stdin", "stdout", "-l", "tam+eng", "--psm", "3"],
        input=png, capture_output=True, timeout=80, check=False,
    )
    if proc.returncode:
        raise RuntimeError(proc.stderr.decode("utf-8", "replace")[-450:])
    return proc.stdout.decode("utf-8", "replace").strip()


def pdf_pages(pdf: Path, allow_ocr: bool) -> list[dict]:
    import fitz  # PyMuPDF; install via requirements / GitHub Actions
    result = []
    with fitz.open(pdf) as doc:
        if len(doc) > 400:
            raise ValueError("Unusually long PDF; exceeds 400-page safety limit")
        for i, page in enumerate(doc):
            raw = page.get_text("text", sort=True).strip()
            method = "pdf-text-layer" if len(raw) >= 45 else "unreadable-text-layer"
            error = None
            if len(raw) < 45 and allow_ocr:
                try:
                    recognized = ocr_page(page)
                    if len(recognized) > len(raw):
                        raw, method = recognized, "machine-ocr-unverified"
                except (OSError, subprocess.TimeoutExpired, RuntimeError) as exc:
                    error = str(exc)[:500]
            result.append({"pdfPage": i + 1, "text": raw, "method": method, "ocrError": error})
    return result


def question_candidates(pages: list[dict]) -> list[dict]:
    blocks, current = [], None
    for page in pages:
        for line in page["text"].translate(TAMIL_DIGITS).splitlines():
            match = QSTART.match(line)
            n = int(match.group(1)) if match else 0
            if 1 <= n <= 300 and (current is None or n > current["number"]):
                current = {"number": n, "sourcePdfPage": page["pdfPage"], "lines": [match.group(2)]}
                blocks.append(current)
            elif current is not None:
                current["lines"].append(line)
    results = []
    for block in blocks:
        stem, choices, active = [], {c: "" for c in "ABCDE"}, None
        duplicate = False
        for line in block["lines"]:
            option = OSTART.match(line)
            if option:
                token = option.group(1) or option.group(2)
                active = TAMIL_OPTIONS.get(token, token.upper())
                if choices[active]:
                    duplicate = True
                choices[active] = (choices[active] + "\n" + option.group(3)).strip()
            elif active is not None:
                choices[active] = (choices[active] + "\n" + line).strip()
            else:
                stem.append(line)
        text = "\n".join(stem).strip()
        valid = len(text) >= 8 and all(choices[x] for x in "ABCD") and not duplicate
        results.append({
            "number": block["number"], "sourcePdfPage": block["sourcePdfPage"], "text": text,
            "options": choices, "fourOptionsDetected": bool(valid), "scoreEligible": False,
            "acceptedAnswers": [], "textStatus": "extracted-unverified",
            "rawBlock": "\n".join(block["lines"]).strip(),
        })
    return results


def work(paper: dict, output: Path, allow_ocr: bool, timeout: int, local_pdf_dir: Path | None) -> dict:
    status = {"id": paper["id"], "category": paper["category"], "exam": paper["exam"],
              "year": paper["year"], "url": paper["url"], "file": paper["id"] + ".json"}
    try:
        with tempfile.TemporaryDirectory(prefix="clearexams-pyq-") as tmp:
            pdf = Path(tmp) / "source.pdf"
            local = local_pdf_dir / paper["filename"] if local_pdf_dir else None
            if local and local.is_file():
                pdf.write_bytes(local.read_bytes())
            else:
                download(paper["url"], pdf, timeout)
            pages = pdf_pages(pdf, allow_ocr)
        questions = question_candidates(pages)
        payload = {
            "schemaVersion": 1, "id": paper["id"],
            "exam": paper["category"] + " " + paper["exam"], "year": paper["year"],
            "sourcePdf": paper["url"], "sourceFilename": paper["filename"],
            "sourceTextKind": "machine-extracted-draft-not-certified-original-text",
            "grading": "disabled", "officialFinalKeyMapped": False,
            "notes": "Entire PDF traversed. Scanned-page OCR and two-column bilingual layout may be inaccurate; no missing questions or choices are invented. Any rights clearance and visual verification remain separate.",
            "pages": pages, "questionCandidates": questions,
            "stats": {
                "pages": len(pages), "textPages": sum(bool(p["text"].strip()) for p in pages),
                "ocrPages": sum(p["method"] == "machine-ocr-unverified" for p in pages),
                "numberedCandidates": len(questions),
                "fourOptionCandidates": sum(q["fourOptionsDetected"] for q in questions),
                "unreadablePages": [p["pdfPage"] for p in pages if not p["text"].strip()],
            },
        }
        output.joinpath(status["file"]).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        status.update({"status": "extracted-unverified", **payload["stats"]})
    except Exception as exc:
        status.update({"status": "source-unavailable", "error": str(exc)[:600],
                       "pages": 0, "textPages": 0, "ocrPages": 0, "numberedCandidates": 0, "fourOptionCandidates": 0})
    return status


def main():
    ap = argparse.ArgumentParser(description="Extract all linked official PYQ PDFs as ungraded text in one batch.")
    ap.add_argument("--catalog", type=Path, default=ROOT / "data/quizzes/pyq-yearwise-catalog.json")
    ap.add_argument("--output", type=Path, default=ROOT / "data/quizzes/pyq-bulk-drafts")
    ap.add_argument("--ocr", action="store_true", help="Use Tesseract Tamil+English for image-only pages; slower")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--timeout", type=int, default=45)
    ap.add_argument("--local-pdf-dir", type=Path)
    args = ap.parse_args()
    papers = source_papers(args.catalog)
    if args.limit > 0:
        papers = papers[:args.limit]
    args.output.mkdir(parents=True, exist_ok=True)
    results = []
    with ThreadPoolExecutor(max_workers=max(1, min(5, args.workers))) as pool:
        tasks = {pool.submit(work, paper, args.output, args.ocr, args.timeout, args.local_pdf_dir): paper for paper in papers}
        for future in as_completed(tasks):
            status = future.result()
            results.append(status)
            print(status["id"], status["status"], status.get("textPages", 0), "text pages", flush=True)
    results.sort(key=lambda x: x["id"])
    index = {
        "schemaVersion": 1, "draftOnly": True, "gradingEnabled": False,
        "sourcePapersRequested": len(papers),
        "sourcePapersExtracted": sum(x["status"] == "extracted-unverified" for x in results),
        "note": "OCR text is an unverified editorial staging output; read the source PDF for exact options and all diagrams.",
        "papers": results,
    }
    args.output.joinpath("index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted source PDFs: {index['sourcePapersExtracted']}/{len(papers)}; no graded questions generated.")


if __name__ == "__main__":
    main()
