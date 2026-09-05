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
