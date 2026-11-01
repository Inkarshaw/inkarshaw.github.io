#!/usr/bin/env python3
"""Extract limited evidence and selected page images for Class 6 Term III editorial review.

No automatic full-book signoff. Copyrighted page images are only preserved
as internal audit artifacts; never included in the public question bank.
"""
import hashlib
import json
import re
from pathlib import Path
from audit_class6_term3_originals import PDFS, fetch, scan_pdf

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class6-term3-source-probe-2026-11-01.json"
IMAGES=ROOT/"data/textbook/_term3_private_review_images"
PROBES={
 "science_en":{
  "terms":["Joseph Aspdin","Portland cement","1824","Chinese discovered","mariner","magnetic compass","800 years ago"],
  "pages":[9,13,43]
 },
 "science_ta":{
  "terms":["1824","Aspdin","Portland","சீனர்","சீன","திசைகாட்டி","ஆஸ்ப்டின்","போர்ட்லேண்ட்"],
  "pages":[9,10,12,17,45,46]
 },
 "social_en":{
  "terms":["Walajahpet","town Panchayat","first state","Susruta","Vasudeva","first Gupta ruler","first Indian astronomer","Girnar inscription","first emporium","oldest local body","first country"],
  "pages":[13,19,20,31,37,118,122,123]
 },
 "social_ta":{
  "terms":["வாலாஜாபேட்டை","வாலாஜா","வாசுதேவ","வாசு","சுசுருத","சுஸ்ருத","பேரூராட்சி","நகராட்சி","கண்வ","குப்தர்","1893","1688","நியூசி"],
  "pages":[20,21,22,40,42,110,111,133,134,135,136,137,138]
 }
}
def main():
 import fitz
 results={"audit":"Class 6 Term III original-page spot checks","date":"2026-11-01",
 "status":"selected source text and images only, not full book certified","sources":{}}
 IMAGES.mkdir(parents=True,exist_ok=True)
 for key,url in PDFS.items():
  try:
   data,_=fetch(url,timeout=100)
   if not data.startswith(b"%PDF"):raise ValueError("not PDF")
   doc=fitz.open(stream=data,filetype="pdf")
   entries={}
   for term in PROBES[key]["terms"]:
    matches=[]
    for index,page in enumerate(doc):
     t=page.get_text("text")
     pos=t.casefold().find(term.casefold())
     if pos>=0:
      excerpt=" ".join(t[max(0,pos-220):min(len(t),pos+420)].split())
      matches.append({"pdf_page":index+1,"excerpt":excerpt[:620]})
    entries[term]=matches[:12]
   screenshots=[]
   for n in PROBES[key]["pages"]:
    if n>len(doc):continue
    page=doc[n-1]
    pix=page.get_pixmap(matrix=fitz.Matrix(1.1,1.1),alpha=False)
    filename=f"{key}_pdfpage{n:03}.png"
    pix.save(IMAGES/filename)
    screenshots.append({"page":n,"filename":filename})
   results["sources"][key]={"url":url,"sha256":hashlib.sha256(data).hexdigest(),"pdf_pages":len(doc),
    "term_matches":entries,"screenshots":screenshots}
   print("SOURCE",key,"pages",len(doc),flush=True)
   for term,matches in entries.items():
    for row in matches[:4]:
     print("EVIDENCE",key,term,"PDF",row["pdf_page"],row["excerpt"][:490],flush=True)
   doc.close()
  except Exception as exc:
   results["sources"][key]={"url":url,"error":repr(exc)}
   print("ERROR",key,repr(exc),flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({"sources":{k:{"pages":v.get("pdf_pages"),"error":v.get("error")} for k,v in results["sources"].items()}}),flush=True)

if __name__=="__main__":main()
