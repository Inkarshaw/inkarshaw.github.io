#!/usr/bin/env python3
"""Publish vetted, date-scoped ClearExams current-affairs JSON as static HTML.

This renderer never invents news or fetches unreviewed stories. A publisher must
provide the original, fact-checked editorial input with source references.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime
from html import escape, unescape
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
SECTION = ROOT / "current-affairs" / "text"
DATA = SECTION / "data"
CATALOG = SECTION / "editions.json"
SITEMAP = ROOT / "sitemap.xml"
SITE = "https://clearexams.ink"
DATED = re.compile(r"\d{4}-\d{2}-\d{2}")
PAGE = re.compile(r"(\d{4}-\d{2}-\d{2})\.html")

def require_text(item, field, minimum=1, maximum=2500):
    value = item.get(field)
    if not isinstance(value, str) or not minimum <= len(value.strip()) <= maximum:
        raise ValueError(f"Field {field} must be text of {minimum}–{maximum} characters")
    return value.strip()

def validate(payload, filename_date):
    if not isinstance(payload, dict):
        raise ValueError("Edition JSON must be an object")
    actual_date = require_text(payload, "date", 10, 10)
    if actual_date != filename_date or not DATED.fullmatch(actual_date):
        raise ValueError("Edition date does not match the source filename")
    try:
        edition_day = date.fromisoformat(actual_date)
    except ValueError as exc:
        raise ValueError("Invalid edition date") from exc
    if edition_day > date.today(ZoneInfo("Asia/Kolkata")):
        raise ValueError("Future edition dates are not permitted")
    status = payload.get("status", "complete")
    if status not in ("partial", "complete"):
        raise ValueError("status must be partial or complete")
    require_text(payload, "description", 45, 320)
    stories = payload.get("stories")
    if not isinstance(stories, list) or len(stories) < 2 or len(stories) > 40:
        raise ValueError("An edition requires 2 to 40 verified stories")
    source_urls = set()
    titles = set()
    for story in stories:
        if not isinstance(story, dict):
            raise ValueError("Each story must be an object")
        for field, lo, hi in (
            ("category", 3, 100), ("title", 12, 180), ("summary", 60, 1700),
            ("exam_link", 15, 600), ("source_title", 5, 180),
        ):
            require_text(story, field, lo, hi)
        title = story["title"].casefold()
        if title in titles:
            raise ValueError("Duplicate story titles in one edition")
        titles.add(title)
        facts = story.get("key_facts")
        if not isinstance(facts, list) or not 1 <= len(facts) <= 10:
            raise ValueError("Each story requires 1–10 key facts")
        for fact in facts:
            if not isinstance(fact, str) or not 10 <= len(fact.strip()) <= 500:
                raise ValueError("Key facts must be meaningful text")
        url = require_text(story, "source_url", 12, 900)
        parts = urlsplit(url)
        if (parts.scheme != "https" or not parts.hostname or parts.username or
                parts.password or any(c.isspace() for c in url)):
            raise ValueError("Each story needs an HTTPS primary source link")
        if url in source_urls:
            raise ValueError("Duplicate source URL in one edition")
        source_urls.add(url)
    mcqs = payload.get("mcqs")
    if not isinstance(mcqs, list) or not 2 <= len(mcqs) <= 50:
        raise ValueError("An edition requires 2–50 original MCQs")
    question_set = set()
    for mcq in mcqs:
        if not isinstance(mcq, dict):
            raise ValueError("Each MCQ must be an object")
        question = require_text(mcq, "question", 16, 420)
        if question.casefold() in question_set:
            raise ValueError("Duplicate MCQ questions")
        question_set.add(question.casefold())
        options = mcq.get("options")
        if (not isinstance(options, list) or len(options) != 4 or
                any(not isinstance(o, str) or not 1 <= len(o.strip()) <= 250 for o in options) or
                len(set(o.casefold().strip() for o in options)) != 4):
            raise ValueError("Each MCQ needs four distinct nonempty options")
        answer = mcq.get("answer_index")
        if type(answer) is not int or answer not in (0, 1, 2, 3):
            raise ValueError("answer_index must be an integer from 0 to 3")
        require_text(mcq, "explanation", 15, 500)
    return payload

def text(value):
    return escape(str(value), quote=True)

def render(payload):
    edition = payload["date"]
    published = date.fromisoformat(edition).strftime("%-d %B %Y")
    description = payload["description"]
    status = payload.get("status", "complete")
    heading = f"Daily Current Affairs — {published}"
    canonical = f"{SITE}/current-affairs/text/{edition}.html"
    stories_html = []
    for index, item in enumerate(payload["stories"], 1):
        facts = "".join(f"<li>{text(fact)}</li>" for fact in item["key_facts"])
        stories_html.append(f"""<article class="story">
<div class="category">{text(item['category'])}</div>
<h2>{index}. {text(item['title'])}</h2>
<p>{text(item['summary'])}</p>
<h3>Important exam facts</h3><ul>{facts}</ul>
<p class="exam"><strong>Static GK connection:</strong> {text(item['exam_link'])}</p>
<p class="source"><strong>Source:</strong> <a href="{text(item['source_url'])}" rel="noopener noreferrer" target="_blank">{text(item['source_title'])}</a></p>
</article>""")
    questions = []
    for index, mcq in enumerate(payload["mcqs"], 1):
        options = "".join(f"<li>{text(option)}</li>" for option in mcq["options"])
        letter = "ABCD"[mcq["answer_index"]]
        answer_text = mcq["options"][mcq["answer_index"]]
        questions.append(f"""<section class="question"><h3>{index}. {text(mcq['question'])}</h3>
<ol type="A">{options}</ol><details><summary>Show answer and explanation</summary>
<p><strong>{letter}. {text(answer_text)}</strong> — {text(mcq['explanation'])}</p></details></section>""")
    schema = json.dumps({
        "@context": "https://schema.org", "@type": "Article", "headline": heading,
        "datePublished": edition, "dateModified": edition, "description": description,
        "inLanguage": "en", "url": canonical,
        "publisher": {"@type": "Organization", "name": "ClearExams"},
    }, ensure_ascii=False).replace("<", "\\u003c")
    pdf_link = ""
    if (SECTION.parent / f"{edition}.pdf").is_file():
        pdf_link = f'<a class="button secondary" href="../{edition}.pdf" target="_blank" rel="noopener">View infographic PDF</a>'
    label = "Initial / partial edition" if status == "partial" else "Verified daily edition"
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{text(heading)} | ClearExams</title>
<meta name="description" content="{text(description)}">
<meta name="theme-color" content="#071c33">
<link rel="canonical" href="{text(canonical)}">
<meta property="og:type" content="article"><meta property="og:title" content="{text(heading)}">
<meta property="og:description" content="{text(description)}"><meta property="og:url" content="{text(canonical)}">
<script type="application/ld+json">{schema}</script>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#f3f7fc;color:#18344f;font:16px/1.7 system-ui,-apple-system,Segoe UI,sans-serif}}
a{{color:#1558bd}}.wrap{{width:min(850px,calc(100% - 28px));margin:auto}}
nav{{background:white;border-bottom:1px solid #dae4ef;padding:17px 0}}nav .wrap{{display:flex;gap:20px;flex-wrap:wrap;justify-content:space-between}}nav a{{font-weight:750;text-decoration:none}}
.hero{{background:linear-gradient(125deg,#071c33,#13476d);color:white;padding:42px 0}}.hero h1{{font-size:clamp(2rem,5.5vw,3rem);line-height:1.14;margin:12px 0}}.hero p{{color:#cce3f5}}.eyebrow{{color:#9cdaff;font-size:.8rem;font-weight:850;text-transform:uppercase}}
main{{padding:26px 0 65px}}.story,.quiz,.intro{{background:white;border:1px solid #dbe5ef;border-radius:16px;padding:23px 25px;margin-bottom:17px;box-shadow:0 4px 17px rgba(3,28,50,.04)}}
h2{{font-size:1.4rem;line-height:1.35;margin:7px 0 12px}}h3{{font-size:1.02rem;margin:17px 0 6px}}
.category{{color:#126484;text-transform:uppercase;font-size:.75rem;letter-spacing:.05em;font-weight:900}}
.exam{{border-left:4px solid #1870d1;background:#f0f6ff;padding:10px 13px}}.source{{border-top:1px solid #e5ecf3;padding-top:12px;overflow-wrap:anywhere}}
details{{padding:12px 15px;border:1px solid #dae4ef;border-radius:11px;background:#fbfdff}}summary{{cursor:pointer;font-weight:800}}.question{{border-top:1px solid #e2eaf3;padding:12px 0}}
.button{{display:inline-block;background:#1765dd;color:white;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:800;margin:7px 7px 3px 0}}.button.secondary{{background:#fff;color:#123658;border:1px solid #9fb3c8}}
footer{{background:#071c33;color:#e1ebf4;text-align:center;padding:25px}}@media(max-width:550px){{.story,.quiz,.intro{{padding:16px}}}}
</style></head><body>
<nav><div class="wrap"><a href="../../index.html">ClearExams.</a><a href="./">All text editions</a><a href="../">PDF Archive</a></div></nav>
<header class="hero"><div class="wrap"><div class="eyebrow">{text(label)} · {text(edition)}</div>
<h1>{text(heading)}</h1><p>{text(description)}</p></div></header>
<main class="wrap"><section class="intro"><strong>{len(payload['stories'])} sourced news briefs · {len(payload['mcqs'])} practice MCQs</strong>
<p>This study edition contains original summaries of sources linked below. Updates described as proposals, plans or announcements are not presented as completed outcomes.</p>
<a class="button" href="#practice">Practice MCQs ↓</a>{pdf_link}</section>
{''.join(stories_html)}
<section class="quiz" id="practice"><h2>Practice MCQs</h2>{''.join(questions)}</section>
<p><a href="./">← Back to all text editions</a></p></main>
<footer>© 2026 ClearExams · Source-linked competitive exam notes</footer></body></html>
"""

def page_details(path):
    match = PAGE.fullmatch(path.name)
    if not match:
        return None
    edition = match.group(1)
    try:
        date.fromisoformat(edition)
    except ValueError:
        return None
    source = DATA / f"{edition}.json"
    if source.exists():
        payload = validate(json.loads(source.read_text(encoding="utf-8")), edition)
        description = payload["description"]
        titles = " · ".join(item["title"] for item in payload["stories"][:4])
        status = payload.get("status", "complete")
    else:
        content = path.read_text(encoding="utf-8")
        meta = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', content, re.I)
        description = unescape(meta.group(1)) if meta else "Exam-focused daily notes with source links."
        titles = f"Daily Current Affairs — {date.fromisoformat(edition).strftime('%-d %B %Y')}"
        status = "partial" if "initial afternoon edition" in content.lower() else "complete"
    return {"date": edition, "file": path.name, "title": titles,
            "description": description, "status": status}

def refresh_index():
    pages = []
    for path in SECTION.glob("????-??-??.html"):
        details = page_details(path)
        if details:
            pages.append(details)
    pages.sort(key=lambda item: item["date"], reverse=True)
    CATALOG.write_text(json.dumps(pages, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if SITEMAP.exists():
        data = SITEMAP.read_text(encoding="utf-8")
        data = re.sub(r'\s*<url><loc>https://clearexams\.ink/current-affairs/text/\d{4}-\d{2}-\d{2}\.html</loc>.*?</url>',
                      "", data)
        if f"{SITE}/current-affairs/text/</loc>" not in data:
            marker = "</urlset>"
            data = data.replace(marker,
                f'  <url><loc>{SITE}/current-affairs/text/</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n{marker}')
        block = "".join(
            f'  <url><loc>{SITE}/current-affairs/text/{p["file"]}</loc><lastmod>{p["date"]}</lastmod><changefreq>never</changefreq><priority>0.8</priority></url>\n'
            for p in pages
        )
        data = data.replace("</urlset>", block + "</urlset>")
        SITEMAP.write_text(data, encoding="utf-8")
    return pages

def build():
    DATA.mkdir(parents=True, exist_ok=True)
    SECTION.mkdir(parents=True, exist_ok=True)
    generated = 0
    for source in sorted(DATA.glob("????-??-??.json")):
        edition = source.stem
        payload = validate(json.loads(source.read_text(encoding="utf-8")), edition)
        target = SECTION / f"{edition}.html"
        html = render(payload)
        if not target.exists() or target.read_text(encoding="utf-8") != html:
            target.write_text(html, encoding="utf-8")
        generated += 1
    pages = refresh_index()
    print(f"Validated {generated} data editions; catalog lists {len(pages)} text pages.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate", metavar="JSON_FILE")
    parser.add_argument("--date", help="Expected YYYY-MM-DD for --validate")
    args = parser.parse_args()
    if args.validate:
        source = Path(args.validate)
        if not args.date:
            parser.error("--date required with --validate")
        validate(json.loads(source.read_text(encoding="utf-8")), args.date)
        print(f"Verified editorial schema and date: {args.date}")
    else:
        build()
