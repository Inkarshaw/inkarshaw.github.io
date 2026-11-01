#!/usr/bin/env python3
"""Create internal-only targeted bilingual Class 7 Term I original-page evidence.

Only selected pages, keyword contexts and review images are inspected.
This does not certify either book in full.
"""
import hashlib
import json
from pathlib import Path
from audit_class7_term1_originals import fetch, MIRROR

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class7-term1-source-probe-2026-11-01.json"
IMAGES=ROOT/"data/textbook/_class7_term1_private_review_images"
SOURCES={
 "science_en": MIRROR+"class-7-term-1-science-english.pdf",
 "science_ta": MIRROR+"class-7-term-1-science-tamil.pdf",
 "social_en": MIRROR+"class-7-term-1-social-science-english.pdf",
 "social_ta": MIRROR+"class-7-term-1-social-science-tamil.pdf",
}
PROBES={
 "science_en":{
  "terms":["Robert Boyle","Dalton","first scientist","Alexander Fleming","penicillin","first"],
  "pages":[35,36,48,92]
 },
 "science_ta":{
  "terms":["பாயில்","பாய்ல்","டால்டன்","முதன்","1928","பெனிசிலின்","கண்டுபிடித்த"],
  "pages":[36,37,38,49,50]
 },
 "social_en":{
  "terms":["Nagabhatta I","Gopala","founder of Pala","first official history","Hasan Nizami","Taj-ul","First Sultan","Razia","first woman","1191"],
  "pages":[9,16,17,21,38,40]
 },
 "social_ta":{
  "terms":["நாகபட்ட","கோபால","பாலர்","ஹசன் நிஜாமி","ஹசன் நிஜா","தாஜ்-உல்","முதல் சுல்தான்","ரஸியா","ரசியா","1191"],
  "pages":[10,19,21,26,27,47,49]
 }
}
def main():
 import fitz
 result={"scope":"original Class 7 Term I selected English/Tamil firsts passages and page images",
  "date":"2026-11-01","certified_book":False,"sources":{}}
 IMAGES.mkdir(parents=True,exist_ok=True)
 for key,url in SOURCES.items():
  try:
   data=fetch(url)
   doc=fitz.open(stream=data,filetype="pdf")
   pages=[p.get_text("text") for p in doc]
   matches={}
   for word in PROBES[key]["terms"]:
    arr=[]
    for i,t in enumerate(pages):
     at=t.casefold().find(word.casefold())
     if at>=0:
      arr.append({"pdf_page":i+1,"context":" ".join(t[max(at-200,0):at+510].split())[:660]})
    matches[word]=arr[:15]
   screenshots=[]
   for n in PROBES[key]["pages"]:
    if n>len(doc):continue
    p=doc[n-1]
    pix=p.get_pixmap(matrix=fitz.Matrix(.85,.85),alpha=False)
    filename=f"{key}_page{n}.png"
    pix.save(IMAGES/filename)
    screenshots.append({"pdf_page":n,"filename":filename})
   result["sources"][key]={
    "url":url,"sha256":hashlib.sha256(data).hexdigest(),
    "pdf_pages":len(doc),"term_matches":matches,"internal_page_images":screenshots
   }
   print("SOURCE",key,"verified",len(doc),"pages",flush=True)
   for term,arr in matches.items():
    for x in arr[:4]:
     print("EVIDENCE",key,term,"pdf_page",x["pdf_page"],x["context"][:540],flush=True)
   doc.close()
  except Exception as exc:
   result["sources"][key]={"url":url,"error":str(exc)[:440]}
   print("SOURCE_ERROR",key,str(exc)[:300],flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({k:{"pages":v.get("pdf_pages"),"error":v.get("error")} for k,v in result["sources"].items()}),flush=True)

if __name__=="__main__":main()
