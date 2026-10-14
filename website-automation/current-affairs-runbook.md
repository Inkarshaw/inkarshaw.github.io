# ClearExams Current Affairs: TEXT-ONLY daily publishing

**Policy effective: 14 October 2026.** New current affairs are published **only as searchable HTML text articles with primary-source links and four-option MCQs**. Do not create or upload PDF digests, covers, or daily PDF compilations. Existing PDFs are historical files only and are retained at `current-affairs/pdf-archive.html`. The public route `/current-affairs/` opens `/current-affairs/text/`.

## Daily publication task (Asia/Kolkata)

- **Daily CA Text Publish** at **21:30 IST** (enabled).
- **Daily CA Cover** at 21:05 IST (disabled, no longer needed).
- Other non-PDF projects, including independently scheduled Instagram infographics, are separate and not inputs to the text publisher.
- GitHub Pages automatically builds and publishes new vetted text JSON; the Website Queue runs every five minutes if needed.

## Editorial data

Fix the edition date `YYYY-MM-DD` in Asia/Kolkata. Research verifiable, same-date news from trustworthy primary sources including Union and Tamil Nadu government, PIB, RBI, ISRO and international bodies. Use original summary wording. Keep proposed, planned and completed events distinct. No fabricated citations, stale news under new dates, or duplicate questions.

The schema and validation are defined in:

- `current-affairs/text/EDITORIAL-FORMAT.md`
- `current-affairs/text/build_text_editions.py`

Write `current-affairs/text/data/YYYY-MM-DD.json`. Required fields:

- `date` matching filename; `status` (`partial` or `complete`); substantive `description`
- `stories`: each `category`, `title`, `summary`, `key_facts` (array), `exam_link`, `source_title`, `source_url` (HTTPS)
- `mcqs`: each `question`, four distinct `options`, integer `answer_index` 0–3, and `explanation`

At least two fully verified stories and two genuine original MCQs are required; publish fewer rather than invent filler. Prepare English first. Tamil translation may be added only after verification.

## Preferred publishing route: connected GitHub

1. Validate locally or against the repository schema for the same edition date. Review sources and MCQs.
2. On repo `Inkarshaw/inkarshaw.github.io`, branch `main`, create or update only `current-affairs/text/data/YYYY-MM-DD.json`. If editing an existing edition, fetch its current blob SHA before changing it.
3. The `jekyll-gh-pages.yml` workflow runs text tests, generates `current-affairs/text/YYYY-MM-DD.html`, rebuilds `current-affairs/text/editions.json` and `sitemap.xml`, and deploys the site.
4. Check the GitHub Pages workflow and live `https://clearexams.ink/current-affairs/text/YYYY-MM-DD.html` and `/current-affairs/text/`. Do not claim publication until verified.

## Alternate publishing route: Website Queue

Only if direct GitHub publishing is unavailable, place the *verified exact JSON bytes* at a stable HTTPS/Google Drive URL and compute their SHA-256. Use spreadsheet `1apIHpkbfBHAmU3RgyZOzTVJLnLAkxfcV_iJkBMLRtx8`, tab `Website Queue`:

| Field | Value |
|---|---|
| Job ID | `CATEXT-YYYY-MM-DD` |
| Page / Section | Daily Current Affairs Text, YYYY-MM-DD |
| Action | `PUBLISH_URL` |
| Source | Stable public URL of verified JSON |
| Target Path | `current-affairs/text/data/YYYY-MM-DD.json` |
| Scheduled Date | Explicit edition date |
| Status | `READY` |
| Notes | `sha256=<64-hex checksum>; edition=YYYY-MM-DD` |

Preserve all other queue fields and ongoing jobs. The publisher verifies exact JSON bytes, edition date, original sources/MCQ structure and resulting live HTML/catalog before reporting success. Never submit `current-affairs/YYYY-MM-DD.pdf` jobs; these are now rejected.

## PDF publication disabled

The PDF actions in these workflows are deliberately disabled:
- `.github/workflows/daily-current-affairs.yml`
- `.github/workflows/pull-current-affairs-from-drive.yml`
- `.github/workflows/update-current-affairs.yml`

`scripts/process_website_job.py` rejects new current-affairs PDF publications. Do not remove historical PDFs, update the old latest-PDF Drive file, or generate a new current-affairs PDF list/compilation for publication.

## Failure and reporting policy

If fact-checking, source URLs, JSON validation, connector write access or deployment verification fails, keep the last verified text edition unchanged. Report `not published`, `committed`, `queued` or `failed` according to the observed state, with a concrete error and link when available. Do not manufacture success reports or automatically fall back to PDF.
