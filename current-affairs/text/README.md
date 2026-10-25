# ClearExams daily current affairs — searchable text editions

Text edition archive: `/current-affairs/text/`. PDFs remain available at `/current-affairs/`.

## Daily publishing checklist

1. Collect **current** releases from official primary sources (PIB, RBI, ISRO, government ministry sites, international organisations, etc.). For independent news, corroborate significant details. Verify the event date, publication date, numbers, names and status (proposed/announced/launched/completed).
2. Write an **original** text summary for each significant story. Include category, headline, concise explanation, static-GK link, high-yield exam facts, and an original source URL. Do not copy complete publisher text.
3. Include MCQs with unambiguous answers and a short explanation, and if bilingual text is included, review the Tamil translation. Do not invent sources or duplicate questions.
4. Create a dated HTML page in this folder (`YYYY-MM-DD.html`), using `2026-10-14.html` as the working example. Correct the title, canonical URL, metadata, article date and any "partial edition" label.
5. Link the new page in `index.html`, newest first. Update the "Read Latest Text Edition" link and search metadata for that edition.
6. Add that dated page to the top-level `sitemap.xml` and commit. Verify the GitHub Pages deployment and production URL.
7. If a PDF exists for that edition, cross-link it. Do not publish an old edition under a new date or present a draft as a completed daily digest.

**Important:** The current text edition is a verified *initial afternoon digest*, not a promise of automatic daily publication. The separate PDF workflows do not currently create or populate text articles. A source-aware daily publisher needs editorial validation and a real content feed before scheduling unattended website updates.

## Structured publication (now connected to Website Queue)

A verified editorial source can be published by naming it
`current-affairs/text/data/YYYY-MM-DD.json`. Refer to
[`EDITORIAL-FORMAT.md`](EDITORIAL-FORMAT.md) for the required data fields.

Validate locally:

```bash
python3 current-affairs/text/build_text_editions.py --validate edition.json --date YYYY-MM-DD
python3 -m unittest discover -s tests -p 'test_current_affairs_text.py'
python3 current-affairs/text/build_text_editions.py
```

Use the existing Website Queue action `PUBLISH_URL`, target
`current-affairs/text/data/YYYY-MM-DD.json`, with the actual source URL and
`sha256=<64-hexadecimal-digest>` in Notes. The queue checks the checksum and
date, then generates the text article, `editions.json`, and sitemap, and
verifies publication after deploying GitHub Pages.

**No fabricated news:** Pages generation is automated; sourcing and
independent editorial fact checking are not. An infographic image-only PDF
is not a verified text article. The existing manual 2026-10-14 pilot stays
in the archive without needing conversion.
