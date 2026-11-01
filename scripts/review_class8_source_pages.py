#!/usr/bin/env python3
"""Internal short-context and selected-page image probe for Class 8 SCERT originals.

Bilingual fact checks only; no full-year volume or 2026–27 edition certified.
"""
import json,hashlib
from pathlib import Path
from audit_class8_originals import fetch, MIRROR

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class8-source-page-probe-2026-11-01.json"
IMG=ROOT/"data/textbook/_class8_private_review_images"
SOURCES={
"science_en": MIRROR+"class-8-science-english.pdf",
"science_ta": MIRROR+"class-8-science-tamil.pdf",
"social_en": MIRROR+"class-8-social-science-english.pdf",
"social_ta": MIRROR+"class-8-social-science-tamil.pdf"
}
PROBES={
"science_en":{
 "terms":["first KVK","Pondicherry","1974","Krishi Vigyan","first electroscope","William Gilbert","Gilbert",
 "Chadwick","neutron","Apollo-8","Apollo-11","Neil Armstrong","Aryabhata","first woman project director",
 "first National Park","first oil well","vaccination","Edward Jenner","first person to discover small",
 "Torricelli","first constructed","ice-calorimeter","first satellite","Chandrayaan"],
 "pages":[18,23,45,54,77,90,91,92,93,94,95,96,130,131,178,189,203,258,272]},
"science_ta":{
 "terms":["KVK","1974","புதுச்சேரி","கிருஷி","கில்பர்ட்","கில்பர்ட","எலக்ட்ரோஸ்கோப்","ஆரியபட்டா",
 "சாட்விக்","சாட்விக","நியூட்ரான்","அப்பல்லோ","அப்போலோ","ஆம்ஸ்ட்ராங்","ஆர்ம்ஸ்ட்ராங்",
 "தடுப்பூசி","முதல் தேசியப் பூங்கா","முதல்","முதன்முறை","சந்திரயான்"],
 "pages":[19,24,48,55,60,82,90,94,96,98,100,102,110,136,139,195,205,265,280]},
"social_en":{
 "terms":["first Governor","Almeida","first factory","Masulipatnam","Satyendranath","first Indian to pass",
 "first Indian Chief Justice","Elijah Impey","Hyderabad","Subsidiary Alliance",
 "Velu Nachiyar","Puli Thevar","first queen","first Palayakkar","First Carnatic",
 "University of Madras","University of Madras","first education policy","National Policy on Education",
 "Sharada Sadan","Pandita Ramabai","first British","first municipality","Rishra",
 "first girls school","first Indian university","First Indian","first"],
 "pages":[9,10,11,12,13,25,27,28,34,43,44,45,55,56,59,61,65,67,78,80,81,82]},
"social_ta":{
 "terms":["அல்மெய்டா","அல்மெடா","சத்தியேந்திரநாத்","சத்தியேந்திர","ஹைதராபாத்",
 "துணைப்படை","வேலுநாச்சியார்","வேலு நாச்சியார்","பூலித்தேவர்","புலித்தேவர்",
 "மசூலிப்பட்டினம்","மசூலிப்பட்டணம்","மெட்ராஸ் பல்கலைக்கழகம்","சென்னைப் பல்கலைக்கழகம்",
 "தேசியக் கல்விக் கொள்கை","1968","பண்டிதா ரமாபாய்","சாரதா சதன்",
 "டச்சு","போர்த்துகீசிய","ஆங்கில","முதல்"],
 "pages":[11,12,13,14,15,26,28,29,30,44,46,55,56,60,62,65,68,80,82,90,92,94]}
}
def main():
 import fitz
 IMG.mkdir(parents=True,exist_ok=True)
 results={"audit":"Class 8 full-year original Science and Social Science selected bilingual pages",
          "scope":"Selected source text and private images, NOT whole-book certification",
          "date":"2026-11-01","files":{}}
 for key,url in SOURCES.items():
  try:
   raw=fetch(url); doc=fitz.open(stream=raw,filetype="pdf");txts=[p.get_text("text") for p in doc]
   terms={}
   for term in PROBES[key]["terms"]:
    hits=[]
    for idx,txt in enumerate(txts):
     p=txt.casefold().find(term.casefold())
     if p>=0:
      hits.append({"pdf_page":idx+1,"context":" ".join(txt[max(0,p-260):p+500].split())[:720]})
    terms[term]=hits[:12]
   wanted=set(PROBES[key]["pages"])
   for term in PROBES[key]["terms"]:
    for h in terms[term][:2]:wanted.add(h["pdf_page"])
   images=[]
   # Capped at 30 pages per source; all kept as non-public CI artifacts.
   for p in sorted(wanted)[:30]:
    if p>len(doc):continue
    name=f"{key}_p{p:03}.png"
    doc[p-1].get_pixmap(matrix=fitz.Matrix(0.9,0.9),alpha=False).save(str(IMG/name))
    images.append({"pdf_page":p,"file":name})
   results["files"][key]={"url":url,"sha256":hashlib.sha256(raw).hexdigest(),"pdf_pages":len(doc),"hits":terms,"internal_page_images":images}
   print("SOURCE",key,len(doc),"rendered",len(images),flush=True)
   for term in PROBES[key]["terms"]:
    for h in terms[term][:3]:
     print("CHECK",key,term,"PDF",h["pdf_page"],h["context"][:440],flush=True)
   doc.close()
  except Exception as exc:
   results["files"][key]={"error":repr(exc)[:350],"url":url}
   print("ERROR",key,repr(exc),flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({k:{"pages":v.get("pdf_pages"),"error":v.get("error")} for k,v in results["files"].items()}),flush=True)
if __name__=="__main__":main()
