#!/usr/bin/env python3
"""Select exact original Class 9 bilingual source pages before approving firsts."""
import hashlib,json
from pathlib import Path
from audit_class9_originals import fetch,MIRROR
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class9-final-firsts-page-evidence-2026-11-01.json"
IMAGES=ROOT/"data/textbook/_class9_final_private_pages"
SOURCES={
 "science_en":(MIRROR+"class-9-science-english.pdf",[33,77,111,203,206,245]),
 "science_ta":(MIRROR+"class-9-science-tamil.pdf",[34,35,76,77,78,112,209,210,211,249,250,251,252]),
 "social_en":(MIRROR+"class-9-social-science-english.pdf",[10,11,15,31,32,87,88,109,111,125,126,139,140,141,145]),
 "social_ta":(MIRROR+"class-9-social-science-tamil.pdf",[10,11,12,14,17,33,34,35,89,90,91,117,118,119,129,130,131,132,152,153,154,155])
}
TERMS={
 "science_en":["Roemer","first estimated the speed","kidney transplant","1954","Linnaeus","Sputnik"],
 "science_ta":["ஒளியின் வேக","ஒளி வேக","முர்ரே","முரே","முதல","சிறுநீர","லின்னேய","1954","1956","ஸ்புட"],
 "social_en":["Robert Bruce Foote","Yoritomo","first Shogunate","Ennigaldi-Nanna","Petrarch","First Continental Congress","Spinning Jenny","Clermont","Flying Shuttle"],
 "social_ta":["ராபர்ட் புரூஸ்","யோரிட்டோமோ","யோரோடோமோ","காமகுரா","பெட்ரார்க்","முதல்","என்னிகால்டி","மாநாடு","புரூஸ்","மாண"],
}
def main():
 import fitz
 IMAGES.mkdir(parents=True,exist_ok=True)
 result={"scope":"Selected bilingual Class 9 original-book source text plus internal page images; neither subject certified","date":"2026-11-01","sources":{}}
 for key,(url,pages) in SOURCES.items():
  try:
   raw=fetch(url);doc=fitz.open(stream=raw,filetype="pdf");txt=[p.get_text("text") for p in doc]
   excerpt={}
   for term in TERMS[key]:
    hits=[]
    for i,t in enumerate(txt):
     at=t.casefold().find(term.casefold())
     if at>=0:hits.append({"pdf_page":i+1,"excerpt":" ".join(t[max(at-330,0):at+650].split())[:800]})
    excerpt[term]=hits[:10]
   for n in pages:
    if n<1 or n>len(doc):continue
    filename=f"{key}_page{n:03}.png"
    doc[n-1].get_pixmap(matrix=fitz.Matrix(1.0,1.0),alpha=False).save(str(IMAGES/filename))
   result["sources"][key]={"url":url,"sha256":hashlib.sha256(raw).hexdigest(),"pdf_pages":len(doc),
        "excerpts":excerpt,"private_pdf_page_images":pages}
   print("SOURCE_OK",key,len(doc),flush=True)
   for term,hits in excerpt.items():
    for h in hits[:3]:print("EVIDENCE",key,term,"PDF",h["pdf_page"],h["excerpt"][:450],flush=True)
   doc.close()
  except Exception as ex:
   result["sources"][key]={"error":repr(ex)[:350],"url":url}
   print("SOURCE_ERROR",key,repr(ex),flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if __name__=="__main__":main()
