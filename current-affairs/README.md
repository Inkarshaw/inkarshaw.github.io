# Current Affairs: TEXT-ONLY publication

**Effective 14 October 2026:** New ClearExams current affairs are published only as searchable text articles and MCQs at [`/current-affairs/text/`](text/). The root [`/current-affairs/`](index.html) opens the text archive.

The PDFs already in this folder are **historical archives**. Existing PDF downloads are preserved at [`pdf-archive.html`](pdf-archive.html), but no new PDFs, covers, or compiled PDF digests should be generated, uploaded or published. The former PDF GitHub Actions jobs have been disabled, and the Website Queue rejects new current-affairs PDF jobs.

**For future editions:** use [`text/EDITORIAL-FORMAT.md`](text/EDITORIAL-FORMAT.md), publish verified `text/data/YYYY-MM-DD.json`, and let `text/build_text_editions.py` generate the public article and archive. See [`website-automation/current-affairs-runbook.md`](../website-automation/current-affairs-runbook.md) for workflow details.

---

## Historical PDF workflow — discontinued (reference only)


1. Name the PDF using the **edition date printed on its cover**, as **`YYYY-MM-DD.pdf`** (for example, `2026-09-05.pdf`). A delayed upload or workflow run must keep the original edition date.
2. Upload or delete the file in this `current-affairs` folder and commit the change to `main`.
3. The GitHub Pages workflow automatically builds the PDF list and deploys it with the website; no HTML or JSON editing is needed.

Only correctly named `.pdf` files are listed. The page displays them newest first with a standard bilingual title and description. Identical PDFs stored under multiple dates are listed only under their earliest filename date, so an older digest cannot appear as a new issue. If the folder has no dated PDFs, the page displays “No PDFs uploaded yet.”

The checked-in `pdfs.json` is a generated fallback. During every Pages deployment, the list is regenerated from the PDFs in this folder before Jekyll builds the site.

The **Pull current affairs PDF from Google Drive** workflow requires both `date` (the verified edition date) and `file_id`. There is no fallback to the execution date. The Drive workflow and website publishing queue download to temporary storage and reject content already published under another date before replacing any file. A missing or unchanged daily Drive upload must never be relabelled as today's digest.

When assembling a daily digest, carry one edition date through the cover, PDF filename and publishing request. Replace the existing Drive latest file in place only after the correct edition is ready, retaining its file ID and sharing. Pass that same edition date explicitly to the publisher, even if upload completes after midnight. A successful PDF build is separate from a successful Drive upload and website deployment; verify each result before reporting completion.

To preview the generated list locally, run:

```bash
python3 current-affairs/generate-pdf-list.py
```
