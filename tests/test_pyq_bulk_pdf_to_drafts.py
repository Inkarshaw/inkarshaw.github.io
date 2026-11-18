"""Keep PDF-to-text machine drafts source-linked and ungraded."""
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("bulk",root/"scripts/pyq_bulk_pdf_to_drafts.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
sources=module.source_papers(root/"data/quizzes/pyq-yearwise-catalog.json")
assert len(sources)>=12
assert len({p["id"] for p in sources})==len(sources)
assert all("dept" not in p["filename"].lower() for p in sources)
assert any(p["category"]=="TNUSRB" and p["year"]==2023 for p in sources)
assert any(p["exam"]=="Group II / IIA" for p in sources)
pages=[
 {"pdfPage":1,"text":"1. A source question?\n(A) Alpha\n(B) Beta\n(C) Gamma\n(D) Delta"},
 {"pdfPage":2,"text":"2. தமிழ் வினா என்ன?\n(அ) ஒன்று\n(ஆ) இரண்டு\n(இ) மூன்று\n(ஈ) நான்கு"}]
qs=module.question_candidates(pages)
assert [q["number"] for q in qs]==[1,2]
assert all(q["fourOptionsDetected"] for q in qs)
assert qs[1]["options"]["D"]=="நான்கு"
assert all(q["scoreEligible"] is False and q["acceptedAnswers"]==[] for q in qs)
with TemporaryDirectory() as td:
 p=Path(td)/"catalog.json"
 p.write_text(json.dumps({"entries":[{"category":"TNUSRB","exam":"SI","year":2023,"documents":[
  {"type":"paper","url":"https://www.tnusrb.tn.gov.in/pdfs/SI_Open.pdf"},
  {"type":"paper","url":"https://www.tnusrb.tn.gov.in/pdfs/SI_DEPT_Qns.pdf"},
  {"type":"paper","url":"https://evil.invalid/papers/other.pdf"}]}]}))
 assert len(module.source_papers(p))==1
print("Bulk official PDF importer: source list, Tamil options, no answers invented.")
