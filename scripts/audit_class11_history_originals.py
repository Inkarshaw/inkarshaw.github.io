#!/usr/bin/env python3
"""Class 11 SCERT History Volume I/II English/Tamil original PDF discovery.

Source fingerprints and candidate excerpts only. No full visual audit or edition certification.
"""
import hashlib,json,re,time,urllib.request
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class11-history-original-inventory-2026-11-02.json"
MIRROR="https://cleartnpsc.com/books/download/"
CDN="https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/"
SOURCES={
"history_v1_en":[MIRROR+"class-11-history-volume-1-english.pdf",MIRROR+"class-11-history-vol-1-english.pdf",CDN+"11th_History_Vol1_EM_Text.pdf",CDN+"11th_History_Vol_1_EM_Text.pdf"],
"history_v1_ta":[MIRROR+"class-11-history-volume-1-tamil.pdf",MIRROR+"class-11-history-vol-1-tamil.pdf",CDN+"11th_History_Vol1_TM_Text.pdf",CDN+"11th_History_Vol_1_TM_Text.pdf"],
"history_v2_en":[MIRROR+"class-11-history-volume-2-english.pdf",MIRROR+"class-11-history-vol-2-english.pdf",CDN+"11th_History_Vol2_EM_Text.pdf",CDN+"11th_History_Vol_2_EM_Text.pdf"],
"history_v2_ta":[MIRROR+"class-11-history-volume-2-tamil.pdf",MIRROR+"class-11-history-vol-2-tamil.pdf",CDN+"11th_History_Vol2_TM_Text.pdf",CDN+"11th_History_Vol_2_TM_Text.pdf"],
}
PAT=re.compile(r"\b(first|earliest|pioneer|founded|discovered|established|introduced|firstly)\b|முதல|முதல்|கண்டுபிடி|தொடங்கிய|நிறுவிய",re.I)
def fetch(url):
 req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 ClearExams educational source inventory"})
 with urllib.request.urlopen(req,timeout=35) as f:
  data=f.read(110*1024*1024)
 if not data.startswith(b"%PDF"):raise ValueError("not a PDF")
 return data
def main():
 result={"date":"2026-11-02","scope":"Class 11 History original SCERT Volume I and II bilingual first-pass provenance; NOT fully certified","files":{}}
 for key,urls in SOURCES.items():
  errors=[]
  for url in urls:
   try:
    raw=fetch(url)
    doc=fitz.open(stream=raw,filetype="pdf")
    count=len(doc);texts=[p.get_text("text") for p in doc]
    candidates=[]
    for i,t in enumerate(texts):
     for line in t.splitlines():
      if PAT.search(line) and len(line.strip())>15:
       candidates.append({"pdf_page":i+1,"excerpt":line.strip()[:260]})
    result["files"][key]={"status":"all_page_text_scanned_not_certified","url":url,"sha256":hashlib.sha256(raw).hexdigest(),"pdf_pages":count,"text_pages":sum(bool(t.strip()) for t in texts),"candidate_count":len(candidates),"candidate_sample":candidates[:140],"front_matter":' '.join(texts[:4])[:2000]}
    print("SOURCE_OK",key,url,count,"text",result["files"][key]["text_pages"],"candidate",len(candidates),flush=True)
    doc.close()
    break
   except Exception as e:
    errors.append({"url":url,"error":str(e)[:120]})
  else:
   result["files"][key]={"status":"not_found","attempts":errors}
   print("SOURCE_NOT_FOUND",key,errors,flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({k:{"status":v["status"],"pages":v.get("pdf_pages")} for k,v in result["files"].items()}),flush=True)
if __name__=="__main__":main()
