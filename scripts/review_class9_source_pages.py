#!/usr/bin/env python3
"""Class 9 selected bilingual original-page evidence; NEVER full book certification."""
import hashlib,json
from pathlib import Path
from audit_class9_originals import fetch,MIRROR
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data/textbook/class9-source-page-probe-2026-11-01.json"
IMAGES=ROOT/"data/textbook/_class9_private_review_images"
SOURCES={k:MIRROR+"class-9-"+sub+"-"+lang+".pdf" for sub in ("science","social-science") for lang in ("english","tamil") for k in [("science" if sub=="science" else "social")+"_"+("en" if lang=="english" else "ta")]}
PROBES={
 "science_en":{
  "terms":["Torricelli","mercury barometer","first designed by an",
    "Roemer","Rømer","first estimated the speed of light","Michelson","Fizeau",
    "sputnik","Sputnik","1956","1957","Aryabhatta","first human",
    "first successful kidney","kidney transplant","Joseph Murray","first microbiologist",
    "Carolus Linnaeus","binomial nomenclature","Newlands","Mendeleev",
    "National Dairy","Varghese Kurien","first anti diabetic","Dr. Funk"],
  "pages":[33,34,77,78,106,111,113,142,143,144,203,206,245,252,263,284]},
 "science_ta":{
  "terms":["டாரிசெல்லி","டாரிசெலி","டோரிசெல்லி","பாரமானி","பாரோமீட்டர்",
  "ரோமர்","ரோமெர்","ரோமர்","ரொமர்","ஒளியின் வேகம்","ஒளி வேகம்",
  "ஸ்புட்னிக்","ஸ்புட்னிக","1956","1957","ஆரியபட்ட","செயற்கைக்கோள்",
  "சிறுநீரக மாற்று","சிறுநீரகம்","ஜோசப் முர்ரே","நியூலாந்து","நியூலண்ட்ஸ்",
  "லின்னேயஸ்","லின்னேயஸ","முதலில்"],
  "pages":[35,36,78,79,80,110,113,115,146,148,213,252,255,273,295]},
 "social_en":{
  "terms":["Herodotus","Father of History","Ennigaldi-Nanna","museum was established",
   "Qin Shi Huang","first emperor","Petrarch","father of humanism",
   "First Continental Congress","George Washington","Stockton","Darlington",
   "Robert Fulton","Clermont","Trevithick","Puffing Devil","John Kay",
   "Spinning Jenny","Robert Bruce Foote","Pallavaram",
   "Liu Pang","Liu Bang","first Shogunate","Yoritomo",
   "Tolkappiyam","earliest written work on Tamil grammar","first national",
   "first postage stamp","first radio"],
  "pages":[10,11,15,21,31,32,41,79,87,88,105,111,122,126,131,133,138,143,144]},
 "social_ta":{
  "terms":["ஹெரோடோட்டஸ்","ஹெரோடோடஸ்","ஹீரோடோட்டஸ்","வரலாற்றின் தந்தை",
   "என்னிகால்டி","என்னிகால்டி","கின் ஷி","சின் ஷி","சின் ஷி ஹுவாங்",
   "பெட்ரார்க்","பெட்ரார்க்","மனிதநேய","கான்டினென்டல்","முதலாம் மாநாடு",
   "வாஷிங்டன்","ஸ்டாக்டன்","டார்லிங்டன்","கிளெர்மான்ட்","ஃபுல்டன்",
   "ட்ரெவித்திக்","பஃபிங்","ஜான் கே","ஸ்பின்னிங் ஜென்னி",
   "ராபர்ட் புரூஸ்","பல்லாவரம்","லியூ பாங்","யோரிட்டோமோ","காமகுரா",
   "முதல்","நிறுவினார்"],
  "pages":[12,13,16,18,23,25,34,35,44,83,89,93,98,114,118,124,130,137,144,148,152]}
}
def main():
 import fitz
 record={"date":"2026-11-01","claim":"selected original bilingual text and private page images, NOT full textbook verification","sources":{}}
 IMAGES.mkdir(parents=True,exist_ok=True)
 for key,url in SOURCES.items():
  try:
   blob=fetch(url);doc=fitz.open(stream=blob,filetype="pdf")
   texts=[p.get_text("text") for p in doc]
   matches={}
   for word in PROBES[key]["terms"]:
    hits=[]
    for index,txt in enumerate(texts):
     at=txt.casefold().find(word.casefold())
     if at>=0:
      hits.append({"pdf_page":index+1,
       "context":" ".join(txt[max(0,at-280):at+540].split())[:730]})
    matches[word]=hits[:10]
   selected=set(PROBES[key]["pages"])
   for word,hits in matches.items():
    for h in hits[:2]:
     selected.add(h["pdf_page"])
   img=[]
   for pageno in sorted(selected)[:35]:
    if not (1<=pageno<=len(doc)):continue
    fname=f"{key}_page{pageno:03}.png"
    doc[pageno-1].get_pixmap(matrix=fitz.Matrix(.88,.88),alpha=False).save(str(IMAGES/fname))
    img.append({"page":pageno,"name":fname})
   record["sources"][key]={"url":url,"sha256":hashlib.sha256(blob).hexdigest(),"pdf_pages":len(doc),"matches":matches,"internal_images":img}
   print("SOURCE",key,len(doc),"rendered",len(img),flush=True)
   for word,hits in matches.items():
    for hit in hits[:3]:
     print("CHECK",key,word,"PDF",hit["pdf_page"],hit["context"][:480],flush=True)
   doc.close()
  except Exception as exc:
   record["sources"][key]={"url":url,"error":repr(exc)[:420]}
   print("ERROR",key,repr(exc),flush=True)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(record,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("SUMMARY",json.dumps({k:{"pages":v.get("pdf_pages"),"error":v.get("error")} for k,v in record["sources"].items()}),flush=True)
if __name__=="__main__":main()
