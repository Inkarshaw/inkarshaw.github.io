import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../policedocuments/tahsildar_letter.html', import.meta.url), 'utf8');
assert.equal((html.match(/<script(?:\s[^>]*)?>/gi) || []).length, 3, 'Three legitimate script tags');
assert.equal((html.match(/<\/script>/gi) || []).length, 3, 'No embedded script-closing tag');
const js = html.slice(html.indexOf('<script>\n') + 8, html.lastIndexOf('</script>'));
assert.ok(js.includes('function toggleTalukFields()'), 'Recipient district switching exists');

const defaults = {
  districtSelect: 'chennai', talukDistrictSelect: 'chennai',
  policeStationDropdown: 'G7 சேத்துபட்டு காவல் நிலையம்',
  collectorNameDropdown: 'எழும்பூர் வட்டாட்சியர்',
  tahsildarAddress: 'எழும்பூர், சென்னை 600008', witnessNumber: 'PW 1',
  witnessName: 'சாட்சி', witnessAge: '31', witnessRelationship: 'சந்திரன்',
  relationshipType: 'father', witnessAddress: 'சென்னை',
  documentDate: '2026-10-22', caseNumber: '20/2026',
  caseSections: 'BNS 123', senderDesignation: 'காவல் ஆய்வாளர்'
};
const nodes = new Map();
function element(id) {
  if (!nodes.has(id)) nodes.set(id, {
    value: defaults[id] || '', style: {}, classList: { add() {}, remove() {} },
    innerHTML: '', options: [], focus() {}, addEventListener() {},
    appendChild() {}, cloneNode() { return { style: {}, remove() {} }; }
  });
  return nodes.get(id);
}
let printed = '', count = 0, saved = '';
const document = {
  getElementById: element, addEventListener() {}, fonts: { ready: Promise.resolve() },
  body: { appendChild() {} },
  createElement() { return { style: {}, appendChild() {}, remove() {}, innerHTML: '' }; }
};
const window = {
  jspdf: { jsPDF: class {
    constructor() { this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }; }
    addPage() {} addImage() {} save(filename) { saved = filename; }
  } },
  html2canvas() {},
  open() { return { document: { open() {}, write(value) { printed = value; }, close() {} },
    focus() {}, print() { count++; } }; }
};
const run = new Function('window', 'document', 'localStorage', 'html2canvas', 'setTimeout',
  js + '\nreturn { updatePreview, toggleTalukFields, validateForm, printDocument, generatePDF, resetForm };');
const app = run(window, document, { getItem() { return null; } },
  async () => ({ width: 1000, height: 1400, toDataURL: () => 'png' }), () => 0);
app.updatePreview();
assert.match(element('previewContent').innerHTML, /G7 சேத்துபட்டு/);
assert.match(element('previewContent').innerHTML, /எழும்பூர், சென்னை 600008/);
assert.doesNotMatch(element('previewContent').innerHTML, /600008, சென்னை-31/);

element('talukDistrictSelect').value = 'other_district';
element('collectorNameText').value = 'காஞ்சிபுரம் வட்டாட்சியர்';
element('tahsildarAddress').value = 'காஞ்சிபுரம் 631501';
app.toggleTalukFields();
assert.match(element('previewContent').innerHTML, /காஞ்சிபுரம் வட்டாட்சியர் அலுவலகம்/);
assert.match(element('previewContent').innerHTML, /G7 சேத்துபட்டு/);

element('witnessName').value = '<img src=x onerror=alert(1)>';
app.updatePreview();
assert.doesNotMatch(element('previewContent').innerHTML, /<img/);
assert.match(element('previewContent').innerHTML, /&lt;img/);
element('witnessName').value = 'சாட்சி';
assert.equal(app.validateForm(), true);
element('tahsildarAddress').value = '';
assert.equal(app.validateForm(), false);
element('tahsildarAddress').value = 'காஞ்சிபுரம் 631501';
app.printDocument();
assert.equal(count, 1);
assert.match(printed, /காஞ்சிபுரம்/);
assert.doesNotMatch(printed, /<script/);
await app.generatePDF();
assert.equal(saved, 'tahsildar_witness_address_2026-10-22.pdf');
app.resetForm();
assert.equal(element('caseNumber').value, '');
assert.equal(element('witnessName').value, '');
assert.match(element('documentDate').value, /^\d{4}-\d{2}-\d{2}$/);
console.log('Tahsildar letter generator regression checks passed.');
