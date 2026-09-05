# Uploading Daily Current Affairs PDFs

1. Rename the PDF to its publication date using **`YYYY-MM-DD.pdf`** (for example, `2026-09-05.pdf`).
2. Upload or delete the file in this `current-affairs` folder and commit the change to `main`.
3. The GitHub Pages workflow automatically builds the PDF list and deploys it with the website; no HTML or JSON editing is needed.

Only correctly named `.pdf` files are published. The home page displays them newest first with a standard bilingual title and description. If the folder has no dated PDFs, the page displays “No PDFs uploaded yet.”

The checked-in `pdfs.json` is an empty fallback. During every Pages deployment, the list is regenerated from the PDFs in this folder before Jekyll builds the site.

To preview the generated list locally, run:

```bash
python3 current-affairs/generate-pdf-list.py
```
