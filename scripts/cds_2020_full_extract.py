#!/usr/bin/env python3
"""Recover CDS II 2020 GK English question text without importing answers.

Output is a strict, *unverified* 120-question source draft. It is not added to
the playable index until the source-recovery audit is separately reviewed.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SOURCE_URL = "https://mcqquestion.com/cds/cds-ii-2020-general-knowledge-full-question-paper/"
ORIGINAL_URL = "https://www.upsc.gov.in/sites/default/files/QP-CDS2-20-GENERAL_KNOWLEDGE.pdf"
DEST = Path("data/quizzes/cds-gk/source-recovery/cds-ii-2020-gk-provisional.json")


def clean(text: str) -> str:
    text = text.replace("\u00a0", " ").replace("\u200b", "")
    text = re.sub(r"[\t\r ]+", " ", text)
    text = re.sub(r"\s*\n\s*", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select("div.mcqx-upsc-card[id^='q']")
    print(f"Found {len(cards)} source cards", flush=True)
    if len(cards) != 120:
        raise ValueError(f"Expected exactly 120 numbered source cards, found {len(cards)}")

    questions = []
    for card in cards:
        ident = card.get("id", "")
        if re.fullmatch(r"q\d{1,3}", ident) is None:
            raise ValueError(f"Unrecognized question id: {ident}")
        number = int(ident[1:])
        p = card.select_one("p.mcqx-upsc-q")
        if p is None:
            raise ValueError(f"Q{number}: missing printed-question text")
        # Preserve explicit HTML line breaks if provided by the typeset source.
        for br in p.find_all("br"):
            br.replace_with("\n")
        stem = clean(p.get_text(" ", strip=True))
        if len(stem) < 5:
            raise ValueError(f"Q{number}: empty/invalid stem: {stem!r}")
        options = {}
        lis = card.select("ul.mcqx-upsc-opts > li")
        for li in lis:
            raw = clean(li.get_text(" ", strip=True))
            match = re.match(r"^\(?([a-dA-D])\)\s*(.+)$", raw, re.DOTALL)
            if match is None:
                raise ValueError(f"Q{number}: malformed printed choice {raw[:100]!r}")
            letter = match.group(1).upper()
            if letter in options:
                raise ValueError(f"Q{number}: duplicate choice {letter}")
            options[letter] = clean(match.group(2))
        if set(options) != {"A", "B", "C", "D"}:
            raise ValueError(f"Q{number}: expected four A-D choices, found {list(options)}")
        if not all(options[c] for c in "ABCD"):
            raise ValueError(f"Q{number}: empty choice")
        if len(set(o.casefold() for o in options.values())) != 4:
            raise ValueError(f"Q{number}: repeated options; verify source")
        if card.find("img") or card.find("svg"):
            raise ValueError(f"Q{number}: figure present; must be recovered visually")
        issues = [
            "English wording/options extracted from a third-party reproduction, not fully verified against the original UPSC Series A booklet.",
            "The official UPSC PDF is linked, but its source text, option order, figures and bilingual content have not yet been independently certified.",
            "Third-party answer keys/explanations were excluded. Correct answer and scoring remain disabled.",
        ]
        questions.append({
            "number": number,
            "text": stem,
            "options": options,
            "sourcePages": [],
            "extraction": "provisional-four-options",
            "issues": issues,
            "correctAnswer": None,
            "scoreEligible": False,
            "ungraded": True,
            "sourceMethod": "third-party-html-transcription-official-upsc-booklet-audit-pending",
        })
    questions.sort(key=lambda q: q["number"])
    if [q["number"] for q in questions] != list(range(1, 121)):
        raise ValueError("Missing, duplicate, or out-of-order question numbers")
    # Content anchors separately witnessed in the scan and an independent printed reproduction.
    anchors = {
        1: ["Budget Estimates", "Corporation Tax"],
        13: ["female franchise", "Government of India Bill"],
        102: ["luminous object", "converging lens"],
        120: ["Indian Ocean island nations", "environmental emergency"],
    }
    for n, fragments in anchors.items():
        text = questions[n - 1]["text"]
        if not all(x.lower() in text.lower() for x in fragments):
            raise ValueError(f"Source anchor mismatch at Q{n}: {text[:160]}")
    return questions


def main() -> None:
    session = requests.Session()
    session.headers["User-Agent"] = "Mozilla/5.0 (compatible; ClearExamsSourceAudit/1.0)"
    response = session.get(SOURCE_URL, timeout=40)
    response.raise_for_status()
    questions = extract(response.text)
    draft = {
        "schemaVersion": 1,
        "id": "cds-ii-2020-gk",
        "exam": "UPSC CDS",
        "session": "II",
        "year": 2020,
        "section": "General Knowledge",
        "sourceFile": "QP-CDS2-20-GENERAL_KNOWLEDGE.pdf",
        "sourceType": "commission-hosted-original-pdf-reference-with-third-party-typed-text",
        "originalSourceUrl": ORIGINAL_URL,
        "sourceAttribution": SOURCE_URL,
        "sourceNote": "The source PDF is authentic UPSC Series A. Text/options are provisional third-party English retyping and must be cross-checked against the original booklet before certified reproduction.",
        "sourceTypeDetail": "third-party-English-HTML-transcription-unverified",
        "originalQuestionCountExpected": 120,
        "numberedPositions": 120,
        "paperPdfPages": 40,
        "textExtractionMethod": "english-html-card-parser-full-paper-single-run-provisional",
        "officialOriginalConfirmed": False,
        "officialAnswerKeyChecked": False,
        "grading": "disabled",
        "warning": "All 120 source-numbered questions and options are a provisional transcription, NOT an independently authenticated verbatim original. No official answer key, explanations, marks or scores.",
        "stats": {
            "textStems": 120,
            "provisionalFourOptionSets": 120,
            "missingOrPartialPositions": 0,
            "numberedPositions": 120,
        },
        "unresolvedQuestionNumbers": [],
        "questions": questions,
    }
    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(json.dumps(draft, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"SUCCESS {DEST}: {len(questions)} full A-D text sets, Q1={questions[0]['text'][:80]!r}, Q120={questions[-1]['text'][:80]!r}, all ungraded.", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"EXTRACTION FAILED: {type(error).__name__}: {error}", file=sys.stderr, flush=True)
        raise
