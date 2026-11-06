// Regression: page-language labels must reflect the cited textbook edition,
// not simply the language selected in the quiz interface.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../textbook-play.html',import.meta.url),'utf8');
const start=html.indexOf('function textbookPageLabel(q,selectedLang,sourceMeta){');
const end=html.indexOf('function safeSourceUrl(q){',start);
assert.ok(start>0 && end>start,'Textbook page provenance helpers must exist');
const sandbox=vm.createContext({});
vm.runInContext(html.slice(start,end),sandbox);
const page=sandbox.textbookPageLabel,link=sandbox.textbookSourceLabel;
assert.equal(typeof page,'function');
assert.equal(typeof link,'function');
const approx={source_review:'Individual printed English page references are approximate and require checking.'};
assert.equal(page({page_en:40},'ta',approx),'ஆங்கிலப் பாடநூல் பக்கம் 40 (தோராயமான பக்க எண்)');
assert.equal(page({page_en:40},'en',approx),'English textbook page 40 (approximate page)');
assert.equal(page({page_ta:22},'en',{}),'Tamil textbook page 22');
assert.equal(page({page_en:40,page_ta:22},'ta',{}),'தமிழ்ப் பாடநூல் பக்கம் 22');
assert.equal(page({page_en:40,page_ta:22},'en',{}),'English textbook page 40');
assert.equal(page({page:7},'ta',{}),'பாடநூல் பக்கம் 7');
assert.equal(page({page:7},'en',{}),'Textbook page 7');
assert.equal(page({},'en',{}),'Textbook page —');
assert.equal(page({},'ta',{}),'பாடநூல் பக்கம் —');
assert.equal(page({page_en:40,page_verified:true},'ta',approx),'ஆங்கிலப் பாடநூல் பக்கம் 40');
assert.equal(link({language:'en'},'ta'),'ஆங்கிலப் பாடநூலைத் திற ↗');
assert.equal(link({language:'ta'},'en'),'View Tamil textbook ↗');
assert.equal(link({language:null},'en'),'View textbook source (language unverified) ↗');
assert.match(link({language:null},'ta'),/மொழி உறுதிசெய்யப்படவில்லை/);
assert.ok(html.includes("textbookPageLabel(q,lang,meta)"),'Quiz render must display page provenance');
assert.ok(html.includes("textbookSourceLabel(src,lang)"),'Quiz render must display source language provenance');
console.log('Textbook source and printed-page provenance labels: English/Tamil and missing-language cases pass.');
