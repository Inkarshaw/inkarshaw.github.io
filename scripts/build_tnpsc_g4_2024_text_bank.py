#!/usr/bin/env python3
"""Stage the full 200-question TNPSC Group IV 2024 text bank from a public typed index.

The original user-supplied TNPSC booklet and official final-key/page maps are
authoritative. A typed third-party index is a transcription aid only; this
script never claims complete manual source-page verification. All 200 question
numbers, options and answers must pass structural and official-key checks.
"""
from __future__ import annotations
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data/quizzes/tnpsc-g4-2024-original-questions.json"
OUT = ROOT / "data/quizzes/tnpsc-g4-2024-text-quiz.json"
URL = "https://www.tnpscguide.com/exams/group-4/papers/group-4-2024-question-paper"
ALPHABET = "ABCD"

def fetch_page(page: int) -> BeautifulSoup:
    url = URL if page == 1 else f"{URL}/{page}"
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ClearExams/1.0; editorial verification)",
                                   "Accept": "text/html,application/xhtml+xml"})
    with urlopen(request, timeout=40) as response:
        raw = response.read()
    return BeautifulSoup(raw, "html.parser")

def text_content(element) -> str:
    return re.sub(r"\s+", " ", element.get_text(" ", strip=True)).strip()

def parse_page(page: int) -> list[dict]:
    soup = fetch_page(page)
    entries = []
    for node in soup.select('ol[data-testid="question-list"] > li[data-question]'):
        number = int(node["data-question"])
        stem_node = node.find("p", class_="whitespace-pre-line", recursive=False)
        options_node = node.find("ol", recursive=False)
        if not stem_node or not options_node:
            raise ValueError(f"Missing stem/options for question {number} on page {page}")
        question = text_content(stem_node)
        options = {}
        for option in options_node.find_all("li", recursive=False):
            label = option.find("span", recursive=False)
            if not label:
                raise ValueError(f"Missing option label for Q{number}")
            letter = text_content(label).strip(" .()")
            if letter not in ALPHABET:
                raise ValueError(f"Unexpected option label {letter!r} at Q{number}")
            label.extract()
            options[letter] = text_content(option)
        if not question or len(options) != 4 or any(not options.get(k) for k in ALPHABET):
            raise ValueError(f"Question {number} is incomplete")
        details = node.select_one('details[data-testid="answer"]')
        published_answer = None
        if details:
            answer_text = text_content(details)
            match = re.search(r"Correct answer\s*:\s*([A-D])\s*[.]",answer_text)
            if match:
                published_answer = match.group(1)
        entries.append({"number": number,"question": question,"options": options,
                        "publishedAnswer": published_answer,"referencePage": page})
    print(f"Page {page}: {len(entries)} full question records, "
          + (f"Q{entries[0]['number']}–Q{entries[-1]['number']}" if entries else "no questions"))
    if not entries:
        raise ValueError(f"No numbered question cards found at pagination page {page}")
    return entries

def main() -> None:
    original = json.loads(SRC.read_text(encoding="utf-8"))
    assert original["totalOriginalQuestions"] == 200
    official = original["questions"]
    assert [x["number"] for x in official] == list(range(1,201))
    typed = []
    for page in range(1,25):
        typed.extend(parse_page(page))
    positions = [x["number"] for x in typed]
    if positions != list(range(1,201)):
        missing=sorted(set(range(1,201))-set(positions))
        repeated=sorted({n for n in positions if positions.count(n)>1})
        raise ValueError(f"Original source order incomplete; total {len(typed)}, missing {missing}, repeats {repeated}")
    output = []
    disagreements=[]
    for candidate, original_row in zip(typed,official):
        number=candidate["number"]
        token=original_row["finalKeyToken"]
        published=candidate["publishedAnswer"]
        choices={**candidate["options"],"E":"விடை தெரியவில்லை" if number <= 100 else "Answer not known"}
        if token != "ALL" and published and published not in token.split("/"):
            disagreements.append((number,published,token))
        output.append({
            "number": number,
            "section": original_row["section"],
            "language": "ta" if number<=100 else "en",
            "question": candidate["question"],
            "options": choices,
            "finalKeyToken": token,
            "correctAnswers": [] if token=="ALL" else token.split("/"),
            "sourcePdfPage": original_row["sourcePdfPage"],
            "sourcePaperURL": original["sourcePaperURL"],
            "answerKeyURL": original["officialFinalKeyURL"],
            "sourceTextStatus": "typed_transcription_unverified_against_scan",
            "answerVerificationStatus": "reconciled_to_official_final_key",
            "typedReferenceURL": URL if candidate["referencePage"]==1 else URL+"/"+str(candidate["referencePage"]),
            "typedReferenceAnswer": published,
            "keyDisagreement": published is not None and token!="ALL" and published not in token.split("/"),
            "requiresSourcePageReview": True,
        })
    if disagreements:
        raise ValueError("Typed-index answers disagree with the official final key: "+str(disagreements))
    bank={
        "schemaVersion": 1,
        "paperId": original["paperId"],
        "exam": "TNPSC Group IV",
        "year": 2024,
        "bookletVersion": original["bookletVersion"],
        "title": "TNPSC Group IV 2024 — General Tamil + General Studies",
        "questionCount": 200,
        "answerCount": 200,
        "completeTextCount": 200,
        "manuallySourceVerifiedTextCount": 0,
        "textStatus": "source-attributed typed draft; official scan text comparison pending",
        "officialPaperURL": original["sourcePaperURL"],
        "officialAnswerKeyURL": original["officialFinalKeyURL"],
        "typedReferenceIndexURL": URL,
        "notes": "All 200 items have text and A-E choices; answer letters are from TNPSC's official final key. Text is an editorial transcription aided by a public typed index, not yet manually checked line-by-line against the scanned question booklet. Special ALL final-key entries are ungraded.",
        "questions": output,
    }
    OUT.write_text(json.dumps(bank,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("WROTE",OUT,"count",len(output),"all options populated",
          sum(all(q["options"].get(k) for k in ALPHABET) for q in output))
    print("Official final key mismatches:",len(disagreements))
    print("Text manual verification: 0, do not label as official verbatim digitization")

if __name__ == "__main__":
    main()
