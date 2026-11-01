#!/usr/bin/env python3
"""Evidence-first scan of Class 6 Term-I original SCERT Science/Social Science books.

This script inspects all extractable pages. It never upgrades a book to
English/Tamil certified from a keyword search alone. Outputs a machine-readable
report and candidate snippets for human editorial follow-up.
"""
import hashlib
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "data/textbook/class6-term1-original-audit-2026-11-01.json"
USER_AGENT = "Mozilla/5.0 (compatible; ClearExams source verification/1.0)"
HF = "https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/resolve/main/6th-standard/"
SOURCES = {
 "english_original": [
  "https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/6th_Science%20%26%20Social%20Science_EM_Term_1_Text.pdf",
  "https://educationsource.in/wp-content/uploads/2023/08/6th-class-science-Term-1-TN-Textbook.pdf",
 ],
 "tamil_original": [
  "https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/6th_Science%20%26%20Social%20Science_TM_Term_1_Text.pdf",
  "https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/6th_Science%20%26%20Social%20Science_TM_Term_1.pdf",
 ],
 "english_2025_transcription": [
  HF + "English/Class_6_Science_and_Social_Science_English_Medium-Term_1-2025_Edition.md",
 ],
 "tamil_2025_transcription": [
  HF + "Tamil/Class_6_Science_and_Social_Science_Tamil_Medium-Term_1-2025_Edition.md",
 ],
}
EN_PATTERN = re.compile(r"\b(first|earliest|pioneer|introduced|invented|discovered|founder|initially|oldest)\b", re.I)
TA_PATTERN = re.compile(r"(முதல்|முதன்|முதன்முறை|முதன்முதலில்|கண்டுபிடி|முன்னோடி|தொடங்கிய|முதலாவது)")
FACT_TERMS = {
 "F033": {"en": ["Lovelace", "first programmer"], "ta": ["லவ்லேஸ்"]},
 "F034": {"en": ["First-generation", "Vacuum"], "ta": ["வெற்றிட", "கணினி"]},
 "F035": {"en": ["ENIAC", "1946"], "ta": ["ENIAC"]},
 "F043": {"en": ["Charles Masson", "Harappa"], "ta": ["மேசன்", "ஹரப்பா"]},
 "F044": {"en": ["Viswanathan Anand", "Khel Ratna"], "ta": ["ஆனந்த்", "கேல்"]},
}
MAX_BYTES = 165*1024*1024
def download(label, urls):
  errors = []
  for url in urls:
    try:
      req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT})
      with urllib.request.urlopen(req,timeout=75) as resp:
        typ=resp.headers.get("content-type","")
        chunks=[];size=0
        while True:
          buf=resp.read(1024*1024)
          if not buf:break
          size+=len(buf)
          if size>MAX_BYTES:raise ValueError("download exceeds 165 MB")
          chunks.append(buf)
      data=b"".join(chunks)
      if "original" in label and not data.startswith(b"%PDF"):
        raise ValueError("not PDF: "+repr(data[:80]))
      return {"url":url,"sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),"http_content_type":typ},data
    except Exception as exc:
      errors.append({"url":url,"error":str(exc)[:240]})
  return {"error":"all sources unavailable","attempts":errors},None

def scan_pdf(data, lang):
  import fitz
  pdf=fitz.open(stream=data,filetype="pdf")
  pages=[]; candidate=[]; count_nonempty=0
  pattern= EN_PATTERN if lang=="en" else TA_PATTERN
  alltext=[]
  for n,page in enumerate(pdf):
    t=page.get_text("text")
    if t.strip(): count_nonempty+=1
    alltext.append(t)
    matches=[]
    for line in t.splitlines():
      clean=" ".join(line.split())
      if 18<=len(clean)<=420 and pattern.search(clean):
        matches.append(clean)
    pages.append({"pdf_page":n+1,"text_chars":len(t),"candidate_lines":len(matches)})
    for line in matches[:9]:
      candidate.append({"pdf_page":n+1,"text":line[:320]})
  return {"pdf_pages":len(pdf),"extractable_pages":count_nonempty,"pages_without_text":len(pdf)-count_nonempty,"candidate_lines_sample":candidate[:150],"total_candidate_lines_in_first_nine_each_page":sum(x["candidate_lines"] for x in pages),"page_stats":pages},alltext

def scan_md(data, lang):
  s=data.decode("utf-8-sig",errors="replace")
  lines=s.splitlines()
  pattern= EN_PATTERN if lang=="en" else TA_PATTERN
  candidates=[]
  for i,line in enumerate(lines):
    clean=" ".join(line.split())
    if len(clean)>18 and pattern.search(clean) and not clean.startswith("> [Image:"):
      candidates.append({"line":i+1,"text":clean[:500]})
  return {"chars":len(s),"lines":len(lines),"candidate_line_count":len(candidates),"candidate_lines_sample":candidates[:200]},s

def windowed_evidence(text, needles, max_per_needle=3):
  output={}
  folded=text.casefold()
  for needle in needles:
    records=[];start=0
    for i in range(max_per_needle):
      n=folded.find(needle.casefold(),start)
      if n<0:break
      records.append(" ".join(text[max(0,n-170):min(len(text),n+260)].split())[:420])
      start=n+len(needle)
    output[needle]=records
  return output

def main():
  report={
    "audit":"TN Class 6 Term I, combined Science + Social Science",
    "date":"2026-11-01",
    "method":"all-page PDF text extraction + 2025 reprint transcriptions; snippet inventory",
    "certification":"pending_full_original_page_visual_review_bilingual_edition_comparison",
    "sources":{},
    "question_evidence":{},
    "caveats":[
      "A text extraction scan does not certify diagrams, scans, all printed facts or translation accuracy.",
      "Hosting names/2025 file labels do not independently establish prescribed 2026–27 edition.",
      "Unverified or failed download paths are not treated as inspected.",
    ]
  }
  cache={}
  for label, urls in SOURCES.items():
    info, data=download(label,urls)
    report["sources"][label]=info
    print("SOURCE",label,json.dumps(info,ensure_ascii=False),flush=True)
    if not data:continue
    if label.endswith("original"):
      lang="en" if label.startswith("english") else "ta"
      try:
        scanned,pages=scan_pdf(data,lang)
        report["sources"][label]["scan"]=scanned
        cache[label]="\n".join(pages)
      except Exception as exc:
        report["sources"][label]["error_read"]=str(exc)
        continue
      print("PDF_SCAN",label,json.dumps({k:v for k,v in scanned.items() if k not in ["candidate_lines_sample","page_stats"]}),flush=True)
      for c in scanned["candidate_lines_sample"][:40]:
        print("CANDIDATE",label,c["pdf_page"],c["text"][:190],flush=True)
    else:
      lang="en" if label.startswith("english") else "ta"
      scan,text=scan_md(data,lang)
      report["sources"][label]["scan"]=scan
      cache[label]=text
      print("MD_SCAN",label,json.dumps({k:v for k,v in scan.items() if k!="candidate_lines_sample"}),flush=True)
      for c in scan["candidate_lines_sample"][:55]:
        print("TRANSCRIPT_CANDIDATE",label,c["line"],c["text"][:190],flush=True)
  for qid, terms in FACT_TERMS.items():
    report["question_evidence"][qid]={}
    for label,source_text in cache.items():
      lang="en" if label.startswith("english") else "ta"
      report["question_evidence"][qid][label]=windowed_evidence(source_text,terms[lang])
    print("QUESTION",qid,json.dumps(report["question_evidence"][qid],ensure_ascii=False)[:2300],flush=True)
  DEST.parent.mkdir(parents=True,exist_ok=True)
  DEST.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
  print("SUMMARY",json.dumps({"output":str(DEST),"available_sources":list(cache),"certification":report["certification"]}),flush=True)
  if "english_original" not in cache or "tamil_original" not in cache:
    print("WARNING: both original PDFs NOT available; cannot certify bilingual original volume",flush=True)

if __name__=="__main__":
  main()
