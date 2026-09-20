# Uploading Daily Current Affairs PDFs

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
