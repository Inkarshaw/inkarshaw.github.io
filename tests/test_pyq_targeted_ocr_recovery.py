"""Targeted OCR output keeps original identifiers and never certifies answers."""
from pathlib import Path
import importlib.util
import json
import tempfile

root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("recovery",root/"scripts/pyq_targeted_ocr_recovery.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assert len(module.PAGE_TARGETS)==3
assert all(len(v)<=8 for v in module.PAGE_TARGETS.values())
paper_id=next(iter(module.PAGE_TARGETS))
with tempfile.TemporaryDirectory() as directory:
    local=Path(directory)
    original={"schemaVersion":1,"id":paper_id,"sourcePdf":"https://www.tnpsc.gov.in/Tentative/Document/original.pdf",
      "draftOnly":True,"grading":"disabled","pages":[]}
    (local/(paper_id+".json")).write_text(json.dumps(original),encoding="utf-8")
    loaded=module.source(paper_id,local)
    assert loaded["id"]==paper_id
    n=module.PAGE_TARGETS[paper_id][0]
    result=module.overlay(loaded,[
      {"pdfPage":n,"text":"A machine-read source question and A–D options, unverified and not scored."},
      {"pdfPage":999,"text":"Never include unrequested pages"},
      {"pdfPage":n,"text":"Duplicate ignored"}
    ])
    assert len(result["pages"])==1
    assert result["pages"][0]["pdfPage"]==n
    assert result["grading"]=="disabled"
    assert result["officialFinalKeyMapped"] is False
    assert result["verifiedOriginalText"] is False
    assert "questionCandidates" not in result and "correctAnswer" not in result
    modified={**original,"sourcePdf":"https://example.com/other.pdf"}
    (local/(paper_id+".json")).write_text(json.dumps(modified),encoding="utf-8")
    try:module.source(paper_id,local)
    except ValueError:pass
    else:raise AssertionError("Non-official source host must be blocked")
print("PASS focused TNPSC OCR preserves source page numbers and never invents keys.")
