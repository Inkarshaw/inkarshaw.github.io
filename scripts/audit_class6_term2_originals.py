#!/usr/bin/env python3
"""Evidence-first Class 6 Term-II SCERT source inspection; NO book certification.

The primary source candidates are original SCERT-published PDF content in
English/Tamil. Every page is inspected via its embedded text layer and unparsed
pages are counted. Source URL success and machine matches are NOT equivalent
to exhaustive printed-page, image, edition or fact review.
"""
import hashlib
import json
import re
import time
import urllib.request
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "data/textbook/class6-term2-original-audit-2026-11-01.json"
BASE = "https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/"
HF = "https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/"
UA = "Mozilla/5.0 (compatible; ClearExams term-II source audit; +https://clearexams.ink)"
MAX_BYTES = 170*1024*1024
PDFS = {
 "combined_en": BASE + "6th_Science%20%26%20Social%20Science_EM_Term_2_Text.pdf",
 "combined_ta": BASE + "6th_Science%20%26%20Social%20Science_TM_Term_2_Text.pdf",
 "science_en": "https://drive.google.com/file/d/1qgd4KO23frMWGpKFNYW5yKM-8nwAAt_b/view",
 "science_ta": "https://drive.google.com/file/d/1z8NtNrp0uqYsNSVLCVwCnLrW5uJB7pvc/view",
 "social_en": "https://drive.google.com/file/d/152VLmu2VZcCh7_EnkbPOjEOHHizLvnNU/view",
 "social_ta": "https://drive.google.com/file/d/1Q87SpVWx0D64OAnuM7goGASkPCRIIpBG/view",
}
TERMS_EN = re.compile(r"\b(first|earliest|founder|discover(?:ed|y)?|invent(?:ed|ion|or)|pione(?:er|ering)|introduc(?:ed|tion)|origin(?:al|ated)?|establish(?:ed|ment)|oldest|initially)\b", re.I)
TERMS_TA = re.compile(r"(முதல்|முதன்|முதலாவது|முதன்முறை|கண்டுபிடி|கண்டறி|நிறுவிய|தொடங்கிய|முன்னோடி|பழமையான)")
TARGETS = {
 "F041_cell": ["Robert Hooke", "1665", "cork"],
 "basic_electricity": ["Volta", "electric", "cell", "battery", "Faraday"],
 "national_symbols": ["first flag", "National Flag", "Pingali Venkayya", "Constituent Assembly"],
 "vedic": ["Rig Veda", "earliest Veda", "Megalithic"],
 "great_thinkers": ["Buddha", "Jain", "Mahavira", "first sermon", "Tirthankara"],
 "empires": ["Magadha", "Bimbisara", "Mahajanapadas", "first empire"],
 "economics": ["economics", "Adam Smith", "first economist", "Kautilya"],
}

def fetch(url, size_cap=MAX_BYTES, timeout=80):
    req = urllib.request.Request(url, headers={"User-Agent":UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        pieces=[];size=0
        while True:
            part=resp.read(1024*1024)
            if not part:break
            size+=len(part)
            if size>size_cap:raise ValueError("exceeds allowed size")
            pieces.append(part)
        return b"".join(pieces), resp.headers.get("content-type", "")

def fetch_gdrive(url):
    import gdown
    import tempfile
    with tempfile.TemporaryDirectory() as temp:
        out=Path(temp)/"source.pdf"
        result=gdown.download(url=url,output=str(out),quiet=True,fuzzy=True)
        if not result or not out.exists():raise ValueError("Google Drive download refused")
        if out.stat().st_size>MAX_BYTES:raise ValueError("Drive PDF too large")
        return out.read_bytes(),"application/pdf; gdown"

def scan_pdf(data, medium):
    import fitz
    pdf=fitz.open(stream=data, filetype="pdf")
    rx=TERMS_TA if medium=="ta" else TERMS_EN
    pages=[]; candidates=[]; extracts={}
    text_pages=0
    for index,page in enumerate(pdf):
        text=page.get_text("text")
        if text.strip():text_pages+=1
        lines=[]
        for ln in text.splitlines():
            cleaned=" ".join(ln.split()).strip()
            if rx.search(cleaned) and len(cleaned)>=22:
                lines.append(cleaned[:320])
        pages.append({"pdf_page":index+1,"extracted_chars":len(text),"candidate_lines":len(lines),"image_count":len(page.get_images(full=False))})
        for ln in lines[:12]:
            candidates.append({"pdf_page":index+1,"text":ln})
        extracts[index+1]=text
    return pdf, extracts, {
        "pdf_pages":len(pdf), "pages_with_extractable_text":text_pages,
        "pages_without_extractable_text":len(pdf)-text_pages,
        "pages_with_images":sum(p["image_count"]>0 for p in pages),
        "pages_statistics":pages,
        "keyword_candidate_count":sum(p["candidate_lines"] for p in pages),
        "keyword_candidate_sample":candidates[:220]
    }

def target_windows(extracts, needles, max_hits=4):
    ans={}
    for label,terms in needles.items():
        hits=[]
        for term in terms:
            count=0
            for page,raw in extracts.items():
                at=raw.casefold().find(term.casefold())
                if at>=0:
                    hits.append({"term":term,"pdf_page":page,
                                 "context":" ".join(raw[max(0,at-170):at+330].split())[:500]})
                    count+=1
                    if count>=max_hits:break
        ans[label]=hits
    return ans

def fetch_transcriptions(report):
    """Use transcript data only as supplemental review, not as original evidence."""
    for medium in ("English","Tamil"):
        uri=f"https://huggingface.co/api/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/tree/main/6th-standard/{medium}"
        try:
            raw,_=fetch(uri,size_cap=2*1024*1024,timeout=20)
            files=[x["path"] for x in json.loads(raw) if x.get("type")=="file"
                   and re.search(r"term.?_?2",x.get("path",""),re.I)
                   and ("Science_" in x["path"] or "Social_Science_" in x["path"])]
            report["transcriptions"][medium]={"candidate_files":files}
            print("TRANSCRIPTS",medium,json.dumps(files),flush=True)
            for path in files:
                try:
                    url=HF+"resolve/main/"+"/".join(__import__("urllib.parse",fromlist=["quote"]).quote(segment,safe="") for segment in path.split("/"))
                    data,_=fetch(url,size_cap=3*1024*1024,timeout=30)
                    text=data.decode("utf-8-sig","replace")
                    regex=TERMS_TA if medium=="Tamil" else TERMS_EN
                    hits=[{"line":i,"text":line.strip()[:240]}
                           for i,line in enumerate(text.splitlines(),1)
                           if regex.search(line) and len(line.strip())>24]
                    report["transcriptions"][medium].setdefault("files",[]).append({
                        "url":url,"sha256":hashlib.sha256(data).hexdigest(),
                        "lines":len(text.splitlines()),"candidate_count":len(hits),"sample":hits[:100]})
                    print("TRANSCRIPT_READ",medium,path,len(hits),flush=True)
                    for h in hits[:45]:print("TEXT_CAND",medium,path,h["line"],h["text"][:180],flush=True)
                except Exception as exc:
                    report["transcriptions"][medium].setdefault("errors",[]).append({path:str(exc)[:220]})
        except Exception as exc:report["transcriptions"][medium]={"error":str(exc)[:220]}

def main():
    report={"audit":"Class 6 Term II SCERT original English/Tamil PDFs",
            "run_date":"2026-11-01", "certification":"not_fully_certified",
            "meaning":"All-page text scans with targeted fact review only; images not exhaustively visually inspected",
            "sources":{},"transcriptions":{},"errors":[]}
    for key,url in PDFS.items():
        try:
            if key in ("science_en","science_ta","social_en","social_ta"):
                # Drive can be rate-limited; combined original PDFs are preferred.
                data,ctype=fetch_gdrive(url)
            else:
                data,ctype=fetch(url,timeout=100)
            if not data.startswith(b"%PDF"):raise ValueError("Downloaded data is not PDF: "+repr(data[:65]))
            medium=key.rsplit("_",1)[-1]
            doc, extracts, scan=scan_pdf(data,medium)
            doc.close()
            report["sources"][key]={"url":url,"size":len(data),"sha256":hashlib.sha256(data).hexdigest(),
                                    "content_type":ctype,"scan":scan,
                                    "target_windows":target_windows(extracts,TARGETS)}
            print("SOURCE_OK",key,"bytes",len(data),"sha256",report["sources"][key]["sha256"],
                  "pages",scan["pdf_pages"],"textpages",scan["pages_with_extractable_text"],
                  "candidates",scan["keyword_candidate_count"],flush=True)
            for row in scan["keyword_candidate_sample"][:140]:
                print("CAND",key,row["pdf_page"],row["text"][:210],flush=True)
            for target,hits in report["sources"][key]["target_windows"].items():
                for h in hits[:5]:
                    print("TARGET",key,target,h["pdf_page"],h["context"][:330],flush=True)
        except Exception as exc:
            report["sources"][key]={"url":url,"error":repr(exc)[:440]}
            print("SOURCE_ERROR",key,repr(exc)[:400],flush=True)
    fetch_transcriptions(report)
    DEST.parent.mkdir(parents=True,exist_ok=True)
    DEST.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("SUMMARY",json.dumps({"path":str(DEST),
          "successful_pdfs":[k for k,v in report["sources"].items() if "sha256" in v],
          "failed_pdfs":[k for k,v in report["sources"].items() if "error" in v],
          "certification":"not_fully_certified"}),flush=True)

if __name__=="__main__":main()
