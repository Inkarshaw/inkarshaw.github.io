#!/usr/bin/env python3
"""Stage OCR of the official 2024 Group IV scanned booklet into existing 200 JSON slots.

This is an EDITORIAL DRAFT. No OCR candidate is source-verified or suitable for public
verbatim original-question display without manual page-by-page verification.
The original paper comes directly from TNPSC; no student upload is required.
Only one batch Tesseract process is launched for the scanned source pages.
"""
from __future__ import annotations
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/quizzes/tnpsc-g4-2024-original-questions.json"
PAGE_FILE = ROOT / "data/quizzes/tnpsc-g4-2024-ocr-page-draft.json"
LETTERS = "ABCDE"
SOURCE_PAGE_START = 3
SOURCE_PAGE_END = 91
NUMBER = re.compile(r"^\s*([1-9]\d{0,2})\s*[.)]\s*")
OPTION = re.compile(r"(?<!\w)\(?([A-E])\)\s*[.:]?\s*")


def download_paper(url: str, dest: Path) -> None:
    urls = [url, url.replace("www.tnpsc.gov.in", "tnpsc.gov.in")]
    errors = []
    for candidate in urls:
        try:
            request = Request(candidate, headers={
                "User-Agent": "Mozilla/5.0 (compatible; ClearExamsPYQEditor/1.0)",
                "Accept": "application/pdf,*/*",
            })
            with urlopen(request, timeout=90) as response:
                data = response.read()
            if len(data) < 100000 or not data.startswith(b"%PDF"):
                raise ValueError("Response did not contain the official PDF")
            dest.write_bytes(data)
            print("Downloaded official source:", len(data), "bytes")
            return
        except Exception as exc:
            errors.append(str(exc))
    raise RuntimeError("Could not retrieve official TNPSC scanned PDF: " + " / ".join(errors))


def ocr_once(pdf: Path, work: Path) -> list[str]:
    images = work / "pages"
    images.mkdir()
    # Single PDF render and one batch OCR call; do not call Tesseract per page.
    subprocess.run([
        "pdftoppm", "-f", str(SOURCE_PAGE_START), "-l", str(SOURCE_PAGE_END),
        "-r", "165", "-gray", "-tiff", str(pdf), str(images / "page")
    ], check=True, timeout=900)
    files = sorted(images.glob("page-*.tif*"))
    if len(files) != SOURCE_PAGE_END - SOURCE_PAGE_START + 1:
        raise RuntimeError(f"Expected 89 rendered scanned pages, got {len(files)}")
    multipage = work / "booklet.tiff"
    subprocess.run(["tiffcp", *map(str, files), str(multipage)], check=True, timeout=300)
    output = work / "ocr"
    subprocess.run([
        "tesseract", str(multipage), str(output), "-l", "tam+eng", "--psm", "3", "txt"
    ], check=True, timeout=1800)
    raw = (work / "ocr.txt").read_text(encoding="utf-8", errors="replace")
    pages = raw.split("\f")
    while pages and not pages[-1].strip():
        pages.pop()
    if len(pages) != len(files):
        raise RuntimeError(f"OCR page count {len(pages)} differs from source page count {len(files)}")
    return pages


def split_source_questions(lines: list[str], expected: list[int]) -> dict[int, list[str]]:
    """Use only expected official question numbers for this PDF page."""
    expected_set = set(expected)
    buckets: dict[int, list[str]] = {}
    current = None
    for line in lines:
        marker = NUMBER.match(line)
        if marker and int(marker.group(1)) in expected_set:
            current = int(marker.group(1))
            buckets[current] = [line[marker.end():].strip()]
        elif current is not None:
            buckets[current].append(line)
    return buckets


def parse_options(block: str) -> tuple[str | None, dict[str, str | None]]:
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    # Native scans sometimes put A and B on the same physical line.
    pieces = []
    for line in lines:
        spans = list(OPTION.finditer(line))
        if spans:
            if spans[0].start() > 0:
                pieces.append(("", line[:spans[0].start()].strip()))
            for i, span in enumerate(spans):
                right = spans[i+1].start() if i+1 < len(spans) else len(line)
                value = line[span.end():right].strip()
                pieces.append((span.group(1), value))
        else:
            pieces.append(("", line))
    question_lines = []
    opts = {letter: None for letter in LETTERS}
    last = None
    for letter, value in pieces:
        if letter and opts[letter] is None:
            opts[letter] = value or None
            last = letter
        elif last and opts[last]:
            opts[last] = (opts[last] + " " + value).strip()
        else:
            question_lines.append(value)
    question = " ".join(x for x in question_lines if x).strip() or None
    return question, opts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, help="Use a local copy of the official source PDF")
    args = parser.parse_args()
    data = json.loads(DATA.read_text(encoding="utf-8"))
    rows = data["questions"]
    assert len(rows) == 200
    assert [q["number"] for q in rows] == list(range(1, 201))
    with tempfile.TemporaryDirectory(prefix="tnpsc-2024-extract-") as folder:
        work = Path(folder)
        pdf = args.pdf or work / "original.pdf"
        if args.pdf is None:
            download_paper(data["sourcePaperURL"], pdf)
        pages = ocr_once(pdf, work)
    page_json = []
    for page_num, page_text in enumerate(pages, start=SOURCE_PAGE_START):
        expected = [q["number"] for q in rows if q["sourcePdfPage"] == page_num]
        page_json.append({
            "sourcePdfPage": page_num,
            "expectedQuestionNumbers": expected,
            "rawOcrText": page_text.strip(),
            "status": "machine_ocr_unverified",
        })
        parsed = split_source_questions(page_text.splitlines(), expected)
        for number, block in parsed.items():
            q = rows[number - 1]
            raw = "\n".join(block).strip()
            question, options = parse_options(raw)
            q["rawOcrCandidate"] = raw or None
            if q["textStatus"] == "manual_source_inspection_pending_review":
                continue  # Do not overwrite previously inspected Tamil text.
            if question and len(question) >= 5:
                q["question"] = question
            for letter in "ABCD":
                if options[letter] and len(options[letter]) >= 2:
                    q["options"][letter] = options[letter]
            complete = bool(q["question"]) and all(q["options"][k] for k in "ABCD")
            q["textStatus"] = "ocr_full_candidate_unverified" if complete else "ocr_partial_candidate_unverified"
    data["questionTextCoverage"] = sum(bool(q["question"]) for q in rows)
    data["optionSetCoverage"] = sum(all(q["options"][a] for a in "ABCD") for q in rows)
    data["questionTextVerified"] = 0
    data["sourceDigitization"] = "ocr_editorial_draft_not_live"
    data["notes"] = "OCR candidates from TNPSC official scan are UNVERIFIED; never publish as exact text without visual comparison. Original page/number and final-key tokens remain authoritative."
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    PAGE_FILE.write_text(json.dumps({"schemaVersion": 1, "paperId": data["paperId"], "pages": page_json,
        "status": "unverified_machine_ocr"}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OCR candidate stems: {data['questionTextCoverage']}/200; complete A-D sets: {data['optionSetCoverage']}/200")
    print("Verified stems: 0; original source pages and official final keys retained for all 200.")
    print("All OCR results are editorial staging, not live quiz questions.")


if __name__ == "__main__":
    main()
