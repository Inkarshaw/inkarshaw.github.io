#!/usr/bin/env python3
"""Class 9 full-year original English/Tamil textbook evidence audit.

All PDF page text is scanned and candidate passages are recorded with PDF-page
indexes. Source scanning does not certify a full book or current prescription.
Only short excerpts saved, not copyrighted full chapters.
"""
import hashlib
import json
import re
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/"data/textbook/class9-full-year-original-audit-2026-11-01.json"
UA="Mozilla/5.0 ClearExams original SCERT source audit"
BASE="https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/"
MIRROR="https://cleartnpsc.com/books/download/"
SOURCES={
 "science_en":[MIRROR+"class-9-science-english.pdf", BASE+"9th_Science_EM_Text.pdf"],
 "science_ta":[MIRROR+"class-9-science-tamil.pdf", BASE+"9th_Science_TM_Text.pdf"],
 "social_en":[MIRROR+"class-9-social-science-english.pdf", BASE+"9th_Social%20Science%20_EM%20_Text.pdf", "https://nammakalvi.com/books/8em/ss.pdf"],
 "social_ta":[MIRROR+"class-9-social-science-tamil.pdf", BASE+"9th_Social%20Science_TM_Text.pdf"],
}
E=re.compile(r"\b(first|earliest|founder|pioneer|invention|invented|discovery|discovered|firstly|introduced|established|began|oldest)\b",re.I)
T=re.compile(r"(முதல்|முதன்|முதலாவ|முதன்முறை|கண்டுபிடி|கண்டறி|நிறுவிய|தொடங்கிய|முன்னோடி|பழமையான)")
TARGETS={
 "history_pioneers":["first museum","father of history","first emperor","first president","first congress","first railway","flying shuttle","spinning jenny","first steam","founder","first woman","முதல்","நிறுவிய"],
 "science_discoveries":["first","discovered","invented","first scientist","first woman","neutron","barometer","electricity","light","periodic","radioactivity","கண்டுபிடி","முதல்","முதன்முறை"],
 "social_firsts":["first election","first parliament","first corporation","first in india","first in tamil nadu","oldest","earliest","முதன்மை","முதலாவது"],
}
MAX_BYTES=200*1024*1024

def fetch(url):
 req=urllib.request.Request(url,headers={"User-Agent":UA})
 with urllib.request.urlopen(req,timeout=90) as res:
  chunks=[];size=0
  while True:
   buf=res.read(2*1024*1024)
   if not buf:break
   size+=len(buf)
   if size>MAX_BYTES:raise ValueError("PDF over size cap")
   chunks.append(buf)
 data=b"".join(chunks)
 if not data.startswith(b"%PDF"):raise ValueError(f"not PDF: {data[:75]!r}")
 return data

def page_windows(texts, keywords, max_pages_per_term=4):
 """Full-paragraph windows. Keyword hits are only potential evidence."""
 found={}
 for name,terms in keywords.items():
  rows=[]
  for term in terms:
   shown=0
   for p,text in enumerate(texts):
    at=text.casefold().find(term.casefold())
    if at<0:continue
    context=" ".join(text[max(0,at-230):at+390].split())[:600]
    rows.append({"term":term,"pdf_page":p+1,"context":context})
    shown+=1
    if shown>=max_pages_per_term:break
  found[name]=rows[:45]
 return found

def scan_pdf(data,key):
 import fitz
 doc=fitz.open(stream=data,filetype="pdf")
 rx=T if key.endswith("_ta") else E
 candidate=[]; page_stats=[];texts=[]
 for n,p in enumerate(doc):
  txt=p.get_text("text")
  texts.append(txt)
  lines=[" ".join(line.split()) for line in txt.splitlines()]
  matches=[line[:340] for line in lines if len(line)>24 and rx.search(line)]
  page_stats.append({"pdf_page":n+1,"text_chars":len(txt),"candidate_lines":len(matches),"images":len(p.get_images(full=False))})
  for ln in matches[:12]:
   candidate.append({"pdf_page":n+1,"snippet":ln})
 total=sum(x["candidate_lines"] for x in page_stats)
 results={"pdf_pages":len(doc),"pages_with_text":sum(bool(t.strip()) for t in texts),"pages_with_images":sum(x["images"]>0 for x in page_stats),
 "keyword_candidate_lines":total,"candidate_sample":candidate[:550],"page_statistics":page_stats,
 "target_windows":page_windows(texts,TARGETS)}
 doc.close()
 return results

def main():
 report={"title":"Class 9 full-year Science/Social Science English/Tamil original SCERT source audit",
  "date":"2026-11-01","certification":"NOT_FULLY_CERTIFIED",
  "method":"all-page text layer scan and selected keyword passage identification; no exhaustive visual/book signoff",
  "files":{}}
 for key,urls in SOURCES.items():
  errors=[];file=None;url_used=None
  for url in urls:
   try:
    file=fetch(url);url_used=url;break
   except Exception as exc:
    errors.append({"url":url,"error":str(exc)[:190]})
  if not file:
   report["files"][key]={"attempts":errors,"status":"not_retrieved"}
   print("SOURCE_ERROR",key,json.dumps(errors),flush=True)
   continue
  scan=scan_pdf(file,key)
  report["files"][key]={"url":url_used,"bytes":len(file),
   "sha256":hashlib.sha256(file).hexdigest(),"scan":scan,
   "status":"all_page_text_scanned_not_original_book_certified"}
  print("SOURCE_OK",key,json.dumps({"url":url_used,"bytes":len(file),"sha256":report["files"][key]["sha256"],
    "pages":scan["pdf_pages"],"pages_with_text":scan["pages_with_text"],
    "candidate_lines":scan["keyword_candidate_lines"]}),flush=True)
  for x in scan["candidate_sample"][:185]:
   print("CAND",key,x["pdf_page"],x["snippet"][:170],flush=True)
  for topic,hits in scan["target_windows"].items():
   for hit in hits[:15]:
    print("TARGET",key,topic,hit["term"],hit["pdf_page"],hit["context"][:320],flush=True)
 OUTPUT.parent.mkdir(parents=True,exist_ok=True)
 OUTPUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("RESULT",json.dumps({k:{"status":v["status"],"pages":v.get("scan",{}).get("pdf_pages")}
      for k,v in report["files"].items()}),flush=True)
 if not any(v.get("status")=="all_page_text_scanned_not_original_book_certified" and k.endswith("_ta") for k,v in report["files"].items()):
  print("LIMITATION: no Tamil original retrieved; cannot corroborate source bilingually",flush=True)

if __name__=="__main__":main()
