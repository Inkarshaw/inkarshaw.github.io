#!/usr/bin/env python3
"""Selected original Class 10 English/Tamil PDF source facts + page images.

Full-text matching is candidate discovery, NOT all-page textbook certification.
Saved short snippets and internal reviewer-only images; do not publish page images.
"""
import hashlib
import json
from pathlib import Path
from audit_class10_originals import fetch, MIRROR

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class10-selected-page-evidence-2026-11-02.json"
IMAGES=ROOT/"data/textbook/_class10_private_source_images"
SOURCES={
 "science_en":MIRROR+"class-10-science-english.pdf",
 "science_ta":MIRROR+"class-10-science-tamil.pdf",
 "social_en":MIRROR+"class-10-social-science-english.pdf",
 "social_ta":MIRROR+"class-10-social-science-tamil.pdf",
}
PROBES={
"science_en":{
 "terms":["Becquerel","radioactivity","Mendeleev","periodic table","Louis Pasteur",
   "Oparin","Haldane","Apsara","APSARA","Tarapur","first nuclear","first atomic",
   "Homi Jahangir","Atomic Energy Commission","first chairman","nuclear reactor",
   "Lippershey","first telescope","family planning","India has been","nuclear power station"],
 "pages":[35,82,83,84,92,93,94,95,96,97,110,113,114,115,261,262,283,284,285,287]},
"science_ta":{
 "terms":["பெக்கரல்","பெக்ரல்","கதிரியக்கம்","மெண்டலீவ்","மெண்டலீஃப்","ஆபரின்",
   "ஓபரின்","ஹால்டேன்","ஹால்டேன்","பாஸ்டர்","பாஸ்தர்","அப்சரா","அப்சர","ஆப்சரா",
   "தாராப்பூர்","தாராபூர்","ஹோமி","பாபா","பாபா","அணு உலை","அணுமின்",
   "குடும்ப நலத்திட்டம்","குடும்பக் கட்டுப்பாடு","குடும்ப நலம்","1952"],
 "pages":[35,82,83,84,92,93,94,95,96,97,113,114,115,116,262,263,283,284,285,288]},
"social_en":{
 "terms":["T. Muthuswami","Muthuswami","Muthuswamy","Rangaiah","Rukmani","Lakshmipathi",
   "Rajagopalachari","Rajaji","Madras Mahajana Sabha","Parithimar",
   "Subbarayalu","Scinde","Karachi","postage stamp","League of Nations",
   "Louis Botha","first Prime Minister","Union of South Africa","first President",
   "W.C. Bonnerjee","the first President","first Home Rule League","Belgrade"],
 "pages":[17,27,28,50,55,88,89,111,112,113,114,120,121,122,123,124,125,199,200,201]},
"social_ta":{
 "terms":["முத்துசாமி","முத்துசுவாமி","முத்துஸ்வாமி","ரங்கையா","ரங்கைய்யா",
   "ருக்மணி","ருக்மண","லட்சுமிபதி","லட்சுமிபதி","இராஜாஜி","ராஜாஜி",
   "பரிதிமாற்","மகாஜன","கராச்சி","சிந்த்","அஞ்சல்","முதல் அஞ்சல்","போத்தா",
   "லூயிஸ் போத்தா","தென் ஆப்பிரிக்க ஒன்றியம்","1937","முதல் இந்திய",
   "1921","1852"],
 "pages":[17,27,28,50,55,88,89,113,114,115,116,118,120,122,123,124,125,130,201,202,203]}
}
def main():
 import fitz
 report={"date":"2026-11-02","scope":"Selected English/Tamil Class 10 original SCERT pages; not full textbook proof",
         "certification":"NOT_FULLY_CERTIFIED","files":{}}
 IMAGES.mkdir(parents=True,exist_ok=True)
 for key,url in SOURCES.items():
  try:
   raw=fetch(url);doc=fitz.open(stream=raw,filetype="pdf")
   pages=[p.get_text("text") for p in doc]
   hits={}
   for term in PROBES[key]["terms"]:
    matches=[]
    for idx,txt in enumerate(pages):
     pos=txt.casefold().find(term.casefold())
     if pos>=0:
      matches.append({"pdf_page":idx+1,
        "excerpt":" ".join(txt[max(0,pos-370):min(len(txt),pos+650)].split())[:900]})
    hits[term]=matches[:9]
   wanted=set(PROBES[key]["pages"])
   for term in PROBES[key]["terms"]:
    for hit in hits[term][:2]:wanted.add(hit["pdf_page"])
   # Targeted sample only; all embedded PDF text pages were scanned separately.
   rendered=[]
   for p in sorted(wanted)[:43]:
    if p>len(doc):continue
    fn=f"{key}_pdf{p:03d}.png"
    doc[p-1].get_pixmap(matrix=fitz.Matrix(1.1,1.1),alpha=False).save(str(IMAGES/fn))
    rendered.append({"pdf_page":p,"file":fn})
   report["files"][key]={"url":url,"sha256":hashlib.sha256(raw).hexdigest(),
       "pdf_pages":len(doc),"term_matches":hits,"private_selected_images":rendered}
   print("SOURCE",key,"pages",len(doc),"image_sample",len(rendered),flush=True)
   for term,rows in hits.items():
    for r in rows[:3]:
     print("CHECK",key,term,"PDF",r["pdf_page"],r["excerpt"][:560],flush=True)
   doc.close()
  except Exception as e:
   report["files"][key]={"url":url,"error":repr(e)[:320]}
   print("ERROR",key,repr(e),flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({k:{"pages":v.get("pdf_pages"),"error":v.get("error")} for k,v in report["files"].items()}),flush=True)
 if len(report["files"])!=4 or any(x.get("error") for x in report["files"].values()):
  raise SystemExit("Some source pages unavailable; not approved for publication")
if __name__=="__main__":main()
