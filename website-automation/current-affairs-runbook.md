# Automatic daily current-affairs publication

## Schedule (Asia/Kolkata)

- Competitive Affairs Infographics: check every two hours; create and upload one
  infographic when there is a meaningful fresh development.
- Daily CA Cover: 21:05.
- Daily CA Publish: 21:30; assemble, verify, upload, queue, trigger and verify publication.
- Website Queue publisher: every five minutes and on changes to
  `.github/website-queue-trigger`.

The repository-assets PDF builder has no recurring schedule. Its manual fallback
must be given an explicit edition date.

## Inputs and edition date

Fix the edition date in Asia/Kolkata at the start of the run and keep it unchanged
through delayed retries. Read existing source images from Drive folder
`1JjSbWiPmAhRYj-pN7EOxz0OXPnQXgjTz` (Scheduled Infographics). Use that date's
`YYYY-MM-DD-cover.png` first and `YYYY-MM-DD-HHMM-topic.png` files in time order.
Require the cover and at least one infographic. Exclude unrelated files and exact
duplicates. Reuse existing images; do not recreate missing infographic content.
The nightly edition includes the qualifying files available when assembly starts.

## Assemble and upload

Create and compress `YYYY-MM-DD.pdf`, inspect every rendered page, and calculate
its SHA-256 checksum. Save the finished PDF using the normal artifact workflow.
Replace the bytes of Drive file `1BVklPd77i1fb_dIQUjKe7N6QE2jYUIcd`
(`current-affairs-latest.pdf`) through the supported local-file upload action.
Preserve its existing link and anyone-reader sharing. Verify the successful upload,
PDF MIME type, non-zero size, modification time and sharing before queueing it.
If an input or upload is blocked, preserve the last good published edition and
report the exact failed step. Never reuse an older PDF under today's date.

## Submit the website job

Read live metadata and bounded cells in spreadsheet
`1apIHpkbfBHAmU3RgyZOzTVJLnLAkxfcV_iJkBMLRtx8` (ClearExams Automation Control Centre),
tab `Website Queue`. Match the logical job by `CA-YYYY-MM-DD`.

| Column | Value for a new job |
| --- | --- |
| A Job ID | `CA-YYYY-MM-DD` |
| B Page / Section | Daily Current Affairs and the edition date |
| C Action | `PUBLISH_URL` |
| D Source | `https://drive.google.com/file/d/1BVklPd77i1fb_dIQUjKe7N6QE2jYUIcd/view` |
| E Target Path | `current-affairs/YYYY-MM-DD.pdf` |
| F Scheduled Date | The fixed edition date |
| G Status | `READY` |
| H GitHub Run | Empty; filled by the publisher |
| I Published URL | Empty; filled after verification |
| J Retry Count | `0` |
| K Last Error | Empty |
| L Notes | `sha256=<64-character checksum>; pages=<count>; edition=YYYY-MM-DD` |
| M Scheduled Time | Empty; this already-built edition is due now |
| N Commit SHA | Empty; filled by the publisher |
| O Completed At | Empty; filled after verification |
| P Processing At | Empty; filled by the publisher |

Create the complete row atomically in the next verified unused row, retaining
validation and formatting. Reuse an existing row rather than creating duplicate
edition IDs. A matching `READY` or `PROCESSING` row must not be reset or duplicated.
An already `PUBLISHED` row with the expected checksum and a working live PDF is a
successful no-op. If the same date has different newly verified content, update
its row only when it is not `PROCESSING`; preserve history fields until the new
attempt is ready and requeue that single row. Do not overwrite active unrelated jobs.
If a previous day's mutable Drive source was replaced before its job completed,
the checksum guard will reject it instead of publishing the wrong edition.

## Start publication automatically

After the row is verified `READY`, use the connected GitHub action to read and
update `.github/website-queue-trigger` on `Inkarshaw/inkarshaw.github.io`, branch
`main`, using the latest blob SHA. Include the edition ID and current UTC timestamp
in the file so this produces a real change. Preserve all unrelated repository
files. This starts the same publishing workflow that was tested successfully.
The five-minute scheduled queue poll is the fallback if the immediate trigger fails.
Do not create a replacement publishing workflow or pause this recurring task.

## Verification and retries

The workflow downloads the PDF, checks its SHA-256 against the queued value,
publishes to the explicit edition path, rebuilds `pdfs.json` and deploys Pages.
It compares the live PDF bytes with the expected checksum and checks that the
live index contains the same edition date and file before marking `PUBLISHED`.
It records the run URL, published URL, commit and completion time in the row.

Observe the existing queue row and associated Actions run until complete when the
run window permits. Only report publication after the live PDF and index verify.
Report `queued`, `processing` or `failed` accurately if publication is still pending.
The existing bridge retries failed attempts up to its configured limit (default
three attempts) and recovers stale processing jobs. Preserve its retry history;
do not repeatedly reset the count. Missing sources, upload failures or exhausted
retries must produce a clear notification rather than a false success.

## Companion searchable text edition (new workflow support)

In addition to the PDF, ClearExams can now publish an original, source-linked
text article for the **same fixed edition date**. The text publisher does not
extract text from image-only PDFs or invent stories. Provide an **editorially
reviewed** JSON input matching
[`current-affairs/text/EDITORIAL-FORMAT.md`](../current-affairs/text/EDITORIAL-FORMAT.md)
and validate it using:

```bash
python3 current-affairs/text/build_text_editions.py --validate /path/to/edition.json --date YYYY-MM-DD
```

Ensure the `date` in the JSON and its public source filename are the edition
date, with at least two source-linked original news summaries and two distinct
four-option MCQs. Cover a representative selection of relevant national,
Tamil Nadu and global developments when verified news is available. Do not
convert old PDFs into new-dated articles, invent facts, invent citations or
translate unverified content.

Host the *actual verified JSON bytes* at a stable HTTPS/Google Drive URL and
calculate their SHA-256. In the existing Website Queue, create a **separate**
row (never overwrite the PDF job):

| Column | Value |
| --- | --- |
| A Job ID | `CATEXT-YYYY-MM-DD` |
| B Page / Section | Daily Current Affairs Text, YYYY-MM-DD |
| C Action | `PUBLISH_URL` |
| D Source | HTTPS or Google Drive URL to the verified JSON |
| E Target Path | `current-affairs/text/data/YYYY-MM-DD.json` |
| F Scheduled Date | Fixed edition date |
| G Status | `READY` |
| L Notes | `sha256=<SHA-256 of exact JSON bytes>; edition=YYYY-MM-DD` |

Preserve normal row bookkeeping, trigger via `.github/website-queue-trigger`
or the five-minute fallback and check the published state. Existing queue
processing compares the JSON checksum, validates date, source URLs and MCQs,
generates `current-affairs/text/YYYY-MM-DD.html`, refreshes
`current-affairs/text/editions.json` and `sitemap.xml`, and verifies the
live HTML, published editorial JSON checksum and archive before acknowledging
publication. The PDF and text jobs are independent: either can fail without
claiming the other succeeded.

The site deployment also runs the text renderer whenever JSON edition files
are already checked into `current-affairs/text/data/`. The text-first
workflow is only automated **after verified editorial JSON is supplied**;
there is no unattended, fact-checking news collector in this repository.

