#!/usr/bin/env python3
"""Internal short-excerpt and selected-page probe: Class 7 Term II SCERT originals.

Only source-fact leads; NEVER treats extraction as whole-volume certification.
Selected images are internal CI artifacts, not redistributed in the quiz.
"""
import hashlib
import json
from pathlib import Path
from audit_class7_term2_originals import fetch, MIRROR

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class7-term2-source-probe-2026-11-01.json"
IMAGES=ROOT/"data/textbook/_class7_term2_private_review_images"
SOURCES={
 "science_en":MIRROR+"class-7-term-2-science-english.pdf",
 "science_ta":MIRROR+"class-7-term-2-science-tamil.pdf",
 "social_en":MIRROR+"class-7-term-2-social-science-english.pdf",
 "social_ta":MIRROR+"class-7-term-2-social-science-tamil.pdf",
}
PROBES={
 "science_en":{
   "terms":["Alessandro Volta","first battery","voltaic pile","1799","1800",
            "Calcutta Electric Supply","first thermal power","Hans Christian Oersted",
            "first electric bulb","Louis Pasteur","first person to describe",
            "Linnaeus","binomial nomenclature"],
   "pages":[17,23,24,32,34,51,87,88]},
 "science_ta":{
   "terms":["வோல்டா","வோல்ட்டா","வோல்டா","மின்கலம்","மின்கல","1800","1799",
            "கல்கத்தா","கல்கத்","மின்னுற்பத்தி","மின் நிலைய","ஆர்ஸ்டெட்",
            "லின்னேயஸ்","லின்னே","பாஸ்டர்","முதன்"],
   "pages":[20,26,27,28,35,38,39,56,100,101]},
 "social_en":{
   "terms":["Harihara and Bukka","foundation of Vijayanagara",
            "Ala-ud-din Hasan","Bahmani kingdom","Babur was the founder",
            "Babur founded the Mughal Empire","Mansabdari system",
            "first English fortress","Fort St. George","first fortress",
            "one of the first metals","printing press was invented"],
   "pages":[5,6,11,13,17,18,25,28,29,73,81]},
 "social_ta":{
   "terms":["ஹரிஹர","புக்க","விஜயநகர","பாமினி","பாபர்","முகலாய","முகலா",
            "மன்சப்தாரி","மன்சப்","அக்பர்","ஆலாவுதீன்","ஹசன்","செயின்ட் ஜார்ஜ்",
            "கோட்டை","சென்னை","முதன்"],
   "pages":[7,8,10,13,15,19,20,21,28,30,32,84,93,94]},
}
def main():
 import fitz
 data={"audit":"Class 7 Term II selected bilingual SCERT PDF pages",
       "date":"2026-11-01","certification":"NOT_FULLY_CERTIFIED",
       "method":"Short selected English/Tamil original PDF contexts + private page images","files":{}}
 IMAGES.mkdir(parents=True,exist_ok=True)
 for key,url in SOURCES.items():
  try:
   raw=fetch(url)
   doc=fitz.open(stream=raw,filetype="pdf")
   texts=[p.get_text("text") for p in doc]
   matches={}
   for term in PROBES[key]["terms"]:
    arr=[]
    for i,txt in enumerate(texts):
     pos=txt.casefold().find(term.casefold())
     if pos<0:continue
     arr.append({"pdf_page":i+1,"short_context":" ".join(txt[max(0,pos-240):min(len(txt),pos+430)].split())[:620]})
    matches[term]=arr[:8]
   renders=[]
   for idx in PROBES[key]["pages"]:
    if 1<=idx<=len(doc):
     filename=f"{key}_pdf{idx:03}.png"
     doc[idx-1].get_pixmap(matrix=fitz.Matrix(1.15,1.15),alpha=False).save(str(IMAGES/filename))
     renders.append({"pdf_page":idx,"filename":filename})
   data["files"][key]={"url":url,"sha256":hashlib.sha256(raw).hexdigest(),
      "pdf_pages":len(doc),"term_matches":matches,"internal_page_images":renders}
   print("SOURCE",key,len(doc),len(renders),flush=True)
   for term,arr in matches.items():
    for rec in arr[:3]:
     print("CHECK",key,term,"P",rec["pdf_page"],rec["short_context"][:460],flush=True)
   doc.close()
  except Exception as exc:
   data["files"][key]={"url":url,"error":repr(exc)[:380]}
   print("ERROR",key,str(exc)[:300],flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("COMPLETE",json.dumps({k:{"page_count":v.get("pdf_pages"),"error":v.get("error")} for k,v in data["files"].items()}),flush=True)
if __name__=="__main__":main()
