"""Machine-extracted page-text publication remains unverified and ungraded."""
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("publisher",root/"scripts/build_pyq_fast_reader_drafts.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with TemporaryDirectory() as temp:
 src=Path(temp)/"input";dst=Path(temp)/"output";src.mkdir()
 paper={"schemaVersion":1,"id":"example-2022","exam":"TNPSC Group II / IIA","year":2022,
 "sourcePdf":"https://tnpsc.gov.in/test.pdf","sourceFilename":"test.pdf",
 "pages":[{"pdfPage":1,"text":"1. Example question text extracted by machine.\\nA) First\\nB) Second\\nC) Third\\nD) Fourth","method":"pdf-text-layer"},
 {"pdfPage":2,"text":"2. Another question text from the same original source page.\\nA) Alpha\\nB) Beta\\nC) Gamma\\nD) Delta","method":"pdf-text-layer"},
 {"pdfPage":3,"text":"","method":"unreadable-text-layer"}],
 "questionCandidates":[{"number":1,"options":{"A":"WRONG"}}]}
 (src/"example.json").write_text(json.dumps(paper),encoding="utf-8")
 manifest={"draftOnly":True,"gradingEnabled":False,"papers":[
  {"id":"example-2022","status":"extracted-unverified","url":paper["sourcePdf"],"file":"example.json","category":"TNPSC"},
  {"id":"source-missing","status":"source-unavailable","url":"https://tnpsc.gov.in/missing.pdf","file":"missing.json"}
 ]}
 (src/"index.json").write_text(json.dumps(manifest),encoding="utf-8")
 out=module.build(src,dst,min_pages=2)
 assert out["availablePapers"]==1 and out["sourcePapersChecked"]==2
 content=json.loads((dst/"example-2022.json").read_text())
 assert content["questionCandidates"]==[] and content["grading"]=="disabled"
 assert content["officialFinalKeyMapped"] is False and content["draftOnly"] is True
 assert len(content["pages"])==2 and content["pages"][0]["pdfPage"]==1
 assert content["sourcePdf"]==paper["sourcePdf"]
 assert not (dst/"source-missing.json").exists()
 (src/"index.json").write_text(json.dumps({**manifest,"gradingEnabled":True}))
 try:
  module.build(src,dst,min_pages=2)
 except ValueError:
  pass
 else:
  raise AssertionError("Graded paper must be rejected")
print("PASS fast PDF text draft shelf is source-linked, page-preserving and ungraded")
