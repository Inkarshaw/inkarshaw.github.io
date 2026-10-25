"""Functional regression tests for the Police Documents cell identifier decoder."""
from pathlib import Path
import shutil
import subprocess
import unittest

HTML = (Path(__file__).resolve().parents[1] / "policedocuments" / "cell_tower_locator.html")


def source_between(text, start, end):
    return text[text.index(start):text.index(end, text.index(start) + len(start))]


class CellTowerLocatorTests(unittest.TestCase):
    def test_lookup_requires_explicit_radio_for_ambiguous_combined_id(self):
        html = HTML.read_text(encoding="utf-8")
        self.assertIn("decodeCombinedId(raw,selectedRadio)", html)
        self.assertIn("composite&&composite.ambiguous", html)
        self.assertIn("combined=decodeCombinedId(r.cellid,q.radio)", html)
        self.assertIn("$('radio').addEventListener('change',syncCombinedCode)", html)

    @unittest.skipUnless(shutil.which("node"), "Node.js is required for JavaScript functional tests")
    def test_combined_lte_and_5g_parsing(self):
        html = HTML.read_text(encoding="utf-8")
        decoder = source_between(html, "function decodeCombinedId(", "function syncCombinedCode()")
        numeric = source_between(html, "function numberId(", "function decodeCombinedId(")
        query = source_between(html, "function query() {", "function validCoord(")
        script = numeric + decoder + """
const assert=require('node:assert/strict');
const fields={
  cellId:{value:'405869105200011'},
  radio:{value:'LTE'},
  mcc:{value:''},mnc:{value:''},lac:{value:''}
};
const $=id=>fields[id];
function integerField(id){
  const v=$(id).value.trim();
  return v===''?null:(/^\\d+$/.test(v)?Number(v):NaN);
}
""" + query + """
assert.deepEqual(query(),{cid:105200011,mcc:405,mnc:869,lac:null,radio:'LTE'});
assert.equal(Math.floor(query().cid/256),410937);
assert.equal(query().cid%256,139);
fields.radio.value='';
assert.throws(()=>query(),/Ambiguous numeric combined ID/);
fields.radio.value='NR';
assert.equal(query().cid,parseInt('105200011',16));
fields.radio.value='LTE';
fields.cellId.value='405869105B7C010';
assert.throws(()=>query(),/LTE ECI must be decimal/);
fields.radio.value='';
assert.equal(query().radio,'NR');
fields.cellId.value='405869999999999';
fields.radio.value='LTE';
assert.throws(()=>query(),/LTE ECI must be less/);
fields.cellId.value='105200011';
fields.mcc.value='405';
fields.mnc.value='869';
assert.equal(query().cid,105200011);
"""
        outcome = subprocess.run(["node", "-e", script], capture_output=True, text=True, timeout=15)
        self.assertEqual(outcome.returncode, 0, outcome.stderr)


if __name__ == "__main__":
    unittest.main()
