#!/usr/bin/env python3
"""Selected Class 7 Term III original PDF passage and small page-image probes.
Internal editorial evidence only; never certify full textbooks from this scan.
"""
import hashlib
import json
from pathlib import Path
from audit_class7_term3_originals import fetch, MIRROR
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class7-term3-source-probe-2026-11-01.json"
IMAGES=ROOT/"data/textbook/_class7_term3_private_review_images"
SOURCES={
"science_en":MIRROR+"class-7-term-3-science-english.pdf",
"science_ta":MIRROR+"class-7-term-3-science-tamil.pdf",
"social_en":MIRROR+"class-7-term-3-social-science-english.pdf",
"social_ta":MIRROR+"class-7-term-3-social-science-tamil.pdf",
}
PROBES={
"science_en":{
 "terms":["Hans Lippershey","telescope was invented","Galileo Galilei first",
          "Rohini","first satellite to be placed","Aryabhatta",
          "Mangalyaan","first attempt to Mars",
          "Alexander Parkes","Parkesine","first plastic",
          "first fully","nylon","rayon","Alexander Fleming","penicillin",
          "first antibiotic","First viral disease","first artificial silk"],
 "pages":[8,32,37,38,40,41,44,50,55,66,72,82]},
"science_ta":{
 "terms":["லிப்பர்ஷே","லிப்பெர்ஷே","ஹான்ஸ்","கலிலியோ",
          "ரோகிணி","ரோஹிணி","ஆரியபட்ட","மங்கள்யான்","செவ்வாய்",
          "பார்க்ஸ்","பார்க்சீன்","பார்கசின்","நெகிழி","பிளாஸ்டிக்",
          "நைலான்","ரேயான்","பெனிசிலின்","பென்சிலின்","பிளெமிங்"],
 "pages":[10,38,40,45,47,48,55,58,66,72,79,80,90]},
"social_en":{
 "terms":["Mandagapattu","Mahendravarman","first rock-cut temple",
          "oldest structural temple","Kailasanatha",
          "first Jain council","Pataliputra","first Buddhist commentator",
          "founder of Ajivika","Savitribai","first woman","first female",
          "first Women’s University","first girls","Guru Nanak"],
 "pages":[10,14,15,20,22,24,25,29,30,33,85,86,88]},
"social_ta":{
 "terms":["மண்டகப்பட்டு","மண்டகப்","மகேந்திரவர்ம","கைலாசநாத",
          "முதல் சமண","சமண","பாடலிபுத்திர","பாடலிபுத்ர",
          "புத்தகோசர்","புத்தகோஷர்","சாவித்திரி","பெண்","நானக்","குருநானக்",
          "முதன்முதலில்","முதலாவது","பாரம்பரிய"],
 "pages":[12,16,17,18,21,24,26,27,29,30,35,37,103,104,105]},
}
def main():
 import fitz
 rec={"audit":"Class 7 Term III SCERT Science Social Science original bilingual excerpts",
      "date":"2026-11-01","certification":"NOT_CERTIFIED_WHOLE_VOLUME",
      "files":{}}
 IMAGES.mkdir(parents=True,exist_ok=True)
 for key,url in SOURCES.items():
  try:
   raw=fetch(url);doc=fitz.open(stream=raw,filetype="pdf");texts=[p.get_text("text") for p in doc]
   hits={}
   for term in PROBES[key]["terms"]:
    arr=[]
    for index,tx in enumerate(texts):
     pos=tx.casefold().find(term.casefold())
     if pos>=0:arr.append({"pdf_page":index+1,"excerpt":" ".join(tx[max(0,pos-240):pos+420].split())[:640]})
    hits[term]=arr[:10]
   renders=[]
   for n in PROBES[key]["pages"]:
    if 1<=n<=len(doc):
     filename=f"{key}_page{n:03}.png"
     doc[n-1].get_pixmap(matrix=fitz.Matrix(1.15,1.15),alpha=False).save(str(IMAGES/filename))
     renders.append({"pdf_page":n,"file":filename})
   rec["files"][key]={"url":url,"sha256":hashlib.sha256(raw).hexdigest(),
     "pdf_pages":len(doc),"term_matches":hits,"internal_page_images":renders}
   print("SOURCE",key,len(doc),flush=True)
   for term,arr in hits.items():
    for row in arr[:3]:
     print("CHECK",key,term,"PDF",row["pdf_page"],row["excerpt"][:400],flush=True)
   doc.close()
  except Exception as exc:
   rec["files"][key]={"url":url,"error":repr(exc)[:340]}
   print("ERROR",key,repr(exc)[:300],flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(rec,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({k:{"pages":v.get("pdf_pages"),"error":v.get("error")} for k,v in rec["files"].items()}),flush=True)
if __name__=="__main__":main()
