# Uploading Daily Current Affairs PDFs

1. Rename the PDF to its publication date using **`YYYY-MM-DD.pdf`** (for example, `2026-09-05.pdf`).
2. Upload or delete the file in this `current-affairs` folder and commit the change to `main`.
3. GitHub Actions automatically rebuilds `pdfs.json`; no HTML or JSON editing is needed.

Only correctly named `.pdf` files are published. The home page displays them newest first with a standard bilingual title and description. If the folder has no dated PDFs, the page displays “No PDFs uploaded yet.”

To regenerate the list locally, run:

```bash
python3 current-affairs/generate-pdf-list.py
```
# Daily Current Affairs PDFs

1. Copy each PDF into this folder.
2. Add an object to `pdfs.json` using the format below. Dates must use `YYYY-MM-DD`.

```json
[
  {
    "date": "2026-09-05",
    "title_en": "Daily Current Affairs — 5 September 2026",
    "title_ta": "தினசரி நடப்பு நிகழ்வுகள் — 5 செப்டம்பர் 2026",
    "description_en": "A concise summary of the day's exam-relevant news.",
    "description_ta": "தேர்வுக்குப் பயன்படும் இன்றைய செய்திகளின் சுருக்கம்.",
    "file": "current-affairs-2026-09-05.pdf"
  }
]
```

The home page automatically sorts entries newest first. File paths are relative to this folder. Keep the array empty (`[]`) when no PDFs are available; the page will show its empty-state message and will not create download links.
