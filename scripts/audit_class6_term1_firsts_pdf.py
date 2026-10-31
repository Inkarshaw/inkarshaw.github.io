#!/usr/bin/env python3
"""Check PDF evidence for Class 6 Term-I Science source, never auto-certify volume."""
import hashlib
import json
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import fitz
import gdown

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    {
        "id": "c6-science-term1-2025-en", "lang": "en",
        "url": "https://drive.google.com/file/d/1MNffWH1uuujW9LsRneDOCY8g6H0-RsEz/view",
        "google_id": "1MNffWH1uuujW9LsRneDOCY8g6H0-RsEz",
        "quiz": {
            "F033": ["Augusta Ada Lovelace", "Ada Lovelace"],
            "F034": ["Vacuum tube", "vacuum tubes"],
            "F035": ["E N I A C", "ENIAC", "Electronic Numerical Integrator"],
        }
    },
    {
        "id": "c6-science-term1-2025-ta", "lang": "ta",
        "url": "https://drive.google.com/file/d/1HeN_3ffnP9A3LsQ8aq8UKtOg-Yf5mumb/view",
        "google_id": "1HeN_3ffnP9A3LsQ8aq8UKtOg-Yf5mumb",
        "quiz": {
            "F033": ["அடா லவ்லேஸ்"],
            "F034": ["வெற்றிடக் குழாய்", "வெற்றிடக்குழாய்"],
            "F035": ["ENIAC", "இனியாக்", "ஈனியாக்", "பொதுப் பயன்பாட்டுக் கணினி"],
        }
    },
]
PATTERN = re.compile(r"\b(first|earliest|invented|discovered|pioneering|founded|oldest)\b", re.I)

def main():
    out = {"audit": "Class 6 Term 1 Science both mediums", "ran_at": datetime.now(timezone.utc).isoformat(), "original_textbook_complete_certification": False, "volumes": []}
    with tempfile.TemporaryDirectory() as d:
        for spec in TARGETS:
            filename = str(Path(d) / (spec["id"] + ".pdf"))
            print("BOOK_START", spec["id"], spec["url"], flush=True)
            try:
                downloaded = gdown.download(id=spec["google_id"], output=filename, quiet=True, fuzzy=True)
                if not downloaded:
                    raise RuntimeError("Google Drive download was not completed")
                data=Path(filename).read_bytes()
                if not data.startswith(b"%PDF"):
                    raise RuntimeError("Downloaded content is not a PDF")
                sha=hashlib.sha256(data).hexdigest()
                with fitz.open(filename) as pdf:
                    pages=[p.get_text("text",sort=True) for p in pdf]
                    missing=[i+1 for i,txt in enumerate(pages) if len(txt.strip())<50]
                    candidates=[i+1 for i,t in enumerate(pages) if PATTERN.search(t)]
                    found={}
                    for qid,needles in spec["quiz"].items():
                        hits=[]
                        for i,txt in enumerate(pages):
                            norm=" ".join(txt.split())
                            low=norm.casefold()
                            for needle in needles:
                                pos=low.find(needle.casefold())
                                if pos>=0:
                                    hits.append({"pdf_page":i+1,"keyword":needle,"context":norm[max(0,pos-85):pos+len(needle)+110]})
                                    break
                        found[qid]=hits[:6]
                    frontmatter=" ".join(" ".join(pages[:6]).split())[:700]
                    row={"id":spec["id"],"language":spec["lang"],"url":spec["url"],"sha256":sha,"bytes":len(data),"pdf_pages":len(pdf),"low_text_pages":missing[:100],"keyword_candidate_pages":len(candidates),"first_candidate_pdf_pages":candidates[:30],"frontmatter_excerpt":frontmatter,"quiz_matches":found,"whole_volume_manual_review":False,"layout_and_image_review":False}
                    out["volumes"].append(row)
                    print("BOOK_RESULT",json.dumps(row,ensure_ascii=False),flush=True)
            except Exception as e:
                row={"id":spec["id"],"url":spec["url"],"error":repr(e),"whole_volume_manual_review":False}
                out["volumes"].append(row)
                print("BOOK_ERROR",json.dumps(row,ensure_ascii=False),flush=True)
    dest=ROOT/"data/textbook/class6-term1-pdf-evidence.json"
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if any("error" in b for b in out["volumes"]):
        print("INCOMPLETE: one or more source PDFs unavailable")
        return 1
    return 0

if __name__=="__main__":
    raise SystemExit(main())
