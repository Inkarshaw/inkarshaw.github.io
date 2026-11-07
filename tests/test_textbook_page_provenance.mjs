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
const mediumNotice=sandbox.textbookMediumNotice;
const editionNotice=sandbox.textbookEditionNotice;
assert.equal(typeof editionNotice,'function');
assert.equal(typeof page,'function');
assert.equal(typeof link,'function');
assert.equal(typeof mediumNotice,'function');
assert.equal(mediumNotice({language:'en'},'en'),'','Matching English-medium book needs no fallback banner');
assert.equal(mediumNotice({language:'ta'},'ta'),'','Matching Tamil-medium book needs no fallback banner');
assert.equal(mediumNotice(null,'ta'),'','No valid source is already covered by the missing-source label');
assert.match(mediumNotice({language:'ta'},'en'),/opens a Tamil textbook/);
assert.match(mediumNotice({language:'en'},'ta'),/ஆங்கிலப் பாடநூல் இணைப்பு/);
assert.match(mediumNotice({language:null},'en'),/language is unverified/);
assert.match(mediumNotice({language:null},'ta'),/மொழி உறுதிசெய்யப்படவில்லை/);
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
// Exercise the actual source-selection function with an existing Tamil-only
// Class 12 History source to prevent pretending the English edition is verified.
const safeStart=html.indexOf('function safeSourceUrl(q){');
const safeEnd=html.indexOf('function render(){',safeStart);
assert.ok(safeStart>0&&safeEnd>safeStart,'Source selection function must exist');
const sourceCtx=vm.createContext({
 classNo:12,subject:'history',term:1,lang:'en',
 meta:{},sourceRegistry:{'class-12/history':{
  source_ta_url:'https://example.org/class12-history-tamil.pdf'
 }},
 location:{href:'https://clearexams.ink/textbook-play.html',hostname:'clearexams.ink'},
 URL
});
vm.runInContext(html.slice(safeStart,safeEnd),sourceCtx);
const fallback=sourceCtx.safeSourceUrl({});
assert.equal(fallback.language,'ta','Fallback must describe the actual linked language');
assert.equal(fallback.href,'https://example.org/class12-history-tamil.pdf');
assert.match(mediumNotice(fallback,'en'),/English-medium source has not been verified/);
sourceCtx.lang='ta';
const matched=sourceCtx.safeSourceUrl({});
assert.equal(matched.language,'ta');
assert.equal(mediumNotice(matched,'ta'),'');
sourceCtx.lang='en';
sourceCtx.meta.source_en_url='https://example.org/class12-history-english.pdf';
const preferred=sourceCtx.safeSourceUrl({});
assert.equal(preferred.language,'en','Prefer a correctly labelled same-medium textbook');
assert.equal(mediumNotice(preferred,'en'),'');
sourceCtx.meta.source_en_url='https://example.org/generic-catalogue';
const safeFallback=sourceCtx.safeSourceUrl({});
assert.equal(safeFallback.language,'ta','Invalid metadata must not mask a valid other-medium source');
sourceCtx.meta.source_en_url='';
sourceCtx.meta.source_url='https://example.org/book-source.pdf';
const unspecified=sourceCtx.safeSourceUrl({});
assert.equal(unspecified.language,null);
assert.match(mediumNotice(unspecified,'en'),/unverified/);
assert.match(html,/id="sourceMediumNotice" role="status" hidden/);
const registry=JSON.parse(readFileSync(new URL('../data/textbook/source-registry.json',import.meta.url),'utf8')).books;
const history=registry['class-12/history'];
const science=registry['class-8/science/term-1'];
assert.ok(history.source_note_en.includes('not independently checked'));
assert.ok(science.source_note_en.includes('2019'));
assert.ok(science.source_note_ta.includes('2025'));
assert.equal(editionNotice({href:history.source_en_url,language:'en'},'en',history),history.source_note_en);
assert.equal(editionNotice({href:history.source_ta_url,language:'ta'},'ta',history),history.source_note_ta);
assert.equal(editionNotice({href:science.source_ta_url,language:'ta'},'ta',science),science.source_note_ta);
assert.equal(editionNotice({href:science.source_en_url,language:'en'},'en',science),science.source_note_en);
assert.equal(editionNotice({href:'https://example.org/unregistered.pdf',language:'en'},'en',history),'');
assert.equal(editionNotice(null,'ta',science),'');
assert.equal(editionNotice({href:history.source_en_url},'en',null),'');
assert.match(html,/const referenceNote=textbookEditionNotice\(src,lang,sourceRegistry\[referenceKey\]\)/);
assert.match(html,/\[textbookMediumNotice\(src,lang\),referenceNote\]\.filter\(Boolean\)\.join\(' '\)/);
assert.match(html,/notice\.textContent=mediumNotice;notice\.hidden=!mediumNotice;/);
console.log('Textbook medium-aware source fallback, page provenance and visible caution labels pass.');
