// Run with: node tests/test_group2a_text_notes.mjs
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const page=read('syllabus.html');
const reader=read('assets/js/tnpsc-group2a-reader.js');
const notesSrc=read('assets/js/tn-school-notes-data.js');
const notePage=read('tn-school-notes.html');

new vm.Script(reader,{filename:'tnpsc-group2a-reader.js'});
new vm.Script(notesSrc,{filename:'tn-school-notes-data.js'});
assert.match(page,/if\(exam\.id==='tnpsc-group-2-2a'\)/);
assert.match(page,/window\.mountGroup2ASyllabus/);
assert.match(page,/tnpsc-group2a-reader\.js/);
assert.match(notePage,/tn-school-notes-data\.js/);
assert.doesNotMatch(page,/G2_Revised_Scheme_Syllabus_27012022\.pdf/);

const notesContext={window:{}};vm.runInNewContext(notesSrc,notesContext);
const notes=notesContext.window.ClearExamsTNSchoolNotes;
const ids=new Set(notes.map(n=>n.id));
assert.equal(ids.size,notes.length,'Unique note IDs');
assert.ok(notes.length>=120,'School books plus expanded Secretariat, economy and welfare sources');
for(const n of notes){
  assert.ok(n.title&&n.chapter&&Array.isArray(n.points)&&n.points.length>=3);
  assert.ok(n.href||n.source_url,n.id+': needs a published quiz or actual textbook source');
  if(n.source_url)assert.match(n.source_url,/^https:\/\//,n.id+': secure textbook source required');
  if(!n.href)continue; // The chapter itself exists, but a ClearExams chapter quiz has not been published.
  const params=new URL(n.href,'https://clearexams.ink/').searchParams;
  assert.equal(new URL(n.href,'https://clearexams.ink/').pathname,'/textbook-play.html');
  assert.equal(params.get('quiz'),'1');
  const c=Number(params.get('class')),subject=params.get('subject'),t=params.get('term'),u=params.get('unit');
  const p=(c<=8?'data/textbook/class-'+c+'/'+subject+'/term-'+t+'/unit-'+u+'.json':'data/textbook/class-'+c+'/'+subject+'/unit-'+u+'.json');
  assert.ok(existsSync(new URL(p,root)),n.id+': missing '+p);
}
const match=reader.match(/const blocks=(\[[\s\S]*?\]);\nconst url/);
assert.ok(match,'Structured syllabus data');
const blocks=JSON.parse(match[1]);
const find=id=>blocks.find(b=>b.id===id);
assert.equal(find('pre-gs').units.reduce((n,u)=>n+u.count,0),75);
assert.equal(find('pre-aptitude').units.reduce((n,u)=>n+u.count,0),25);
assert.equal(find('pre-language-tamil').units.reduce((n,u)=>n+u.count,0),100);
assert.equal(find('pre-language-english').units.reduce((n,u)=>n+u.count,0),100);
assert.equal(find('main-gs').units.reduce((n,u)=>n+u.count,0),150);
assert.equal(find('main-reasoning').units[0].count,50);
assert.equal(find('main-reasoning').units[0].topics.length,27);
let links=0;
for(const b of blocks)for(const u of b.units)for(const t of u.topics){
  if(Array.isArray(t)&&t[1]){assert.ok(ids.has(t[1]),'Unresolved school-book note: '+t[1]);links++;}
}
assert.ok(links>=231,'Topic mapping covers State finances, welfare and Secretariat administration');
assert.ok(notes.some(n=>n.id==='sangam')&&notes.some(n=>n.id==='gandhi-mass')&&notes.some(n=>n.id==='state-government')&&notes.some(n=>n.id==='biotech'),'History, polity and science chapter links present');
const socialReforms=['brahmo-samaj','arya-samaj','ramakrishna-mission','theosophical-society','prarthana-samaj','satyashodhak','narayana-guru','pandita-ramabai','aligarh-movement','vaikunda-swami','vallalar','iyothee-thass','christian-missions'];
for(const id of socialReforms){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing social reform note: '+id);assert.match(note.chapter,/Class 11 History · Unit 19: Towards Modernity/);assert.equal(new URL(note.href,'https://clearexams.ink/').searchParams.get('unit'),'19');assert.ok(links>0);}
for(const id of ['governor','chief-minister','legislative-assembly']){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing state polity note: '+id);assert.match(note.chapter,/Class 7 Social Science · Term II · Civics: State Government/);const u=new URL(note.href,'https://clearexams.ink/').searchParams;assert.equal(u.get('class'),'7');assert.equal(u.get('term'),'2');assert.equal(u.get('unit'),'6');}
const taggedIds=new Set(blocks.flatMap(b=>b.units.flatMap(u=>u.topics.filter(t=>Array.isArray(t)&&t[1]).map(t=>t[1]))));
for(const id of [...socialReforms,'governor','chief-minister','legislative-assembly'])assert.ok(taggedIds.has(id),'Note not linked from syllabus: '+id);
assert.equal(find('main-gs').units.reduce((n,u)=>n+u.count,0),150,'Question distribution was not altered');

const newSocialIds=['justice-party','non-brahmin-manifesto','justice-party-reforms','communal-representation','hindu-endowment-1926','self-respect-movement','periyar-journals','self-respect-marriages','dravidar-kazhagam','anti-hindi-agitation','rettamalai-srinivasan','mc-rajah','tamil-renaissance','tani-tamil'];
const localIds=['local-bodies-structure','gram-sabha','village-panchayat','panchayat-union','district-panchayat','urban-local-government','local-body-finance','local-elections'];
for(const id of [...newSocialIds,...localIds]){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing new textbook note: '+id);assert.ok(!note.href,'Do not invent a quiz route for '+id);assert.match(note.source_url,/^https:\/\//);assert.ok(taggedIds.has(id),'New note not linked in the syllabus: '+id);}
for(const id of newSocialIds)assert.match(notes.find(n=>n.id===id).chapter,/Class 10 Social Science/);
for(const id of localIds)assert.match(notes.find(n=>n.id===id).chapter,/Class 6 Social Science/);
const gram=notes.find(n=>n.id==='gram-sabha');assert.ok(gram.update_url&&gram.points.join(' ').includes('six per year'),'Current Tamil Nadu Gram Sabha meeting frequency must be shown');
assert.match(notePage,/data-quiz-pending/,'Unpublished chapter must be explicitly labelled');
assert.match(notePage,/Read source textbook/,'Notes must offer source chapters');

const adminIds=['tn-district-collector','tn-dro','tn-rdo','tn-tahsildar','tn-revenue-inspector','tn-vao','tn-revenue-structure','tn-bdo-roles','tn-district-rural-development','tn-tnega','tn-esevai-certificates','tn-pension-delivery','tn-land-records','tn-2026-integrated-land','tn-patta-transfer-history','tn-cm-helpline','tn-disaster-revenue'];
for(const id of adminIds){
 const note=notes.find(n=>n.id===id);
 assert.ok(note,'Missing official administration note: '+id);
 assert.equal(note.source_kind,'government',id+': incorrect source category');
 assert.ok(!note.href,id+': official-reference notes cannot pretend to have a textbook quiz');
 assert.ok(note.source_url&&note.source_url.startsWith('https://'),id+': missing primary reference');
 const host=new URL(note.source_url).hostname;
 assert.ok(host.endsWith('.tn.gov.in')||host.endsWith('.nic.in')||host==='tn.nic.in'||host==='cmhelpline.tnega.org',id+': not a primary government reference: '+host);
 assert.ok(note.chapter&&note.points.length>=3&&note.ta,id+': incomplete bilingual title or revision summary');
 assert.ok(taggedIds.has(id),id+': missing direct syllabus topic-to-note link');
}
assert.match(notePage,/note.source_kind==='government'/,'Render official sources separately from school-books');
assert.match(notePage,/Read official government source/,'Show a real official source link');
assert.match(notePage,/Official government reference:/,'Identify the source category');
assert.match(notePage,/note.source_kind==='government'\?'':/,'Official notes must not display missing-quiz placeholders');

const nextIds=['tn-secretariat','tn-business-rules','tn-hrm','tn-finance-consultation','tn-budget-process','tn-budget-deficits','tn-gsdp','tn-gva-sectors','tn-state-income-estimates','tn-agri-statistics','tn-industry-sipcot','tn-msme-dic','tn-startup-ecosystem','tn-naan-mudhalvan','tn-pudhumai-penn','tn-tamil-pudhalvan','tn-magalir-urimai','tn-breakfast-scheme','tn-shg-mahalir','tn-rural-welfare','tn-social-pensions','tn-women-commission'];
for(const id of nextIds){
  const note=notes.find(n=>n.id===id);
  assert.ok(note,'Missing development administration note: '+id);
  assert.equal(note.source_kind,'government',id+': not clearly labelled a government source');
  assert.ok(!note.href,id+': do not create a non-existent textbook quiz route');
  assert.match(note.source_url,/^https:\/\/\S+/,id+': no government link');
  const host=new URL(note.source_url).hostname;
  assert.ok(host.endsWith('.tn.gov.in')||host.endsWith('.nic.in')||host==='tn.nic.in',id+': not Tamil Nadu official source: '+host);
  assert.ok(note.points.length>=3,id+': needs at least three useful facts');
  assert.ok(taggedIds.has(id),id+': not linked from the Group IIA syllabus');
}
assert.match(notePage,/id="noteCategory"/,'Filter textbook vs government notes');
assert.match(notePage,/value="government"/,'Government notes filter choice');
assert.match(notePage,/value="textbook"/,'School-book notes filter choice');
assert.match(notePage,/setOptions\(/,'Source filter updates the note selector');
assert.match(notePage,/inCategory\(n\)/,'Search respects selected source category');

const depthIds=['tn-budget-process','tn-budget-deficits','tn-gsdp','tn-gva-sectors','tn-state-income-estimates','tn-finance-consultation','tn-agri-statistics','tn-industry-sipcot','tn-msme-dic','tn-naan-mudhalvan','tn-pudhumai-penn','tn-tamil-pudhalvan','tn-magalir-urimai','tn-breakfast-scheme','tn-shg-mahalir','tn-rural-welfare','tn-social-pensions','tn-secretariat','tn-business-rules'];
assert.equal(depthIds.length,19,'Focused syllabus revision batch');
for(const id of depthIds){
  const note=notes.find(n=>n.id===id);
  assert.ok(note,'Missing expanded note: '+id);
  assert.equal(note.source_kind,'government',id+': expansion must remain an official-reference note');
  assert.ok(note.points.length>=7,id+': expanded note must have substantive coverage');
  assert.ok(typeof note.exam_focus==='string'&&note.exam_focus.length>45,id+': missing exam distinction');
  assert.ok(typeof note.worked_example==='string'&&note.worked_example.length>45,id+': missing original illustration');
  assert.ok(note.quick_check?.question?.length>18&&note.quick_check?.answer?.length>5,id+': missing revision question/answer');
  assert.ok(taggedIds.has(id),id+': deep revision must remain linked from TNPSC syllabus');
}
assert.match(notePage,/class="exam-focus"/,'Highlight exam distinctions');
assert.match(notePage,/class="worked-example"/,'Render practical worked examples');
assert.match(notePage,/<details class="quick-check">/,'Quick-check answer should be revealable');
assert.match(notePage,/class="additional-sources"/,'Render independently verified additional references');
const gdp=notes.find(n=>n.id==='tn-gsdp');
assert.ok(gdp.additional_sources.some(url=>url.includes('mospi.gov.in')),'2026 MoSPI national-base-year source missing');
assert.match(gdp.exam_focus,/GSDP versus GVA/,'Differentiate state product and value-added');
assert.match(gdp.points.join(' '),/2011–12-base series/,'Label historical DES base-year series');
const fisc=notes.find(n=>n.id==='tn-budget-deficits');
assert.match(fisc.points.join(' '),/fiscal deficit.*non-debt capital receipts/is,'Fiscal deficit must exclude borrowings');
assert.match(fisc.quick_check.answer,/35 crore/,'Numerical primary deficit example must be internally consistent');
const pPenn=notes.find(n=>n.id==='tn-pudhumai-penn');
const pBoy=notes.find(n=>n.id==='tn-tamil-pudhalvan');
assert.match(pPenn.exam_focus,/girl/i,'Pudhumai Penn intended beneficiary');
assert.match(pBoy.exam_focus,/boy/i,'Tamil Pudhalvan intended beneficiary');

const bilingualIds=['equality','political-parties','state-government','governor','chief-minister','legislative-assembly','local-bodies-structure','gram-sabha','nationalism','swadeshi','gandhi-mass','sangam','justice-party','self-respect-movement','indus','cholas-pandyas'];
assert.equal(bilingualIds.length,16);
for(const id of bilingualIds){
  const note=notes.find(n=>n.id===id);
  assert.ok(note,'Missing bilingual study note: '+id);
  assert.ok(Array.isArray(note.points_ta),id+': Tamil facts missing');
  assert.equal(note.points.length,7,id+': English facts should be expanded to seven');
  assert.equal(note.points_ta.length,note.points.length,id+': every English fact must have Tamil equivalent');
  assert.ok(note.points_ta.every(x=>typeof x==='string'&&/[\u0B80-\u0BFF]/u.test(x)),id+': Tamil fact not translated');
  assert.ok(note.exam_focus?.length>45&&/[\u0B80-\u0BFF]/u.test(note.exam_focus_ta),id+': bilingual exam focus missing');
  assert.ok(note.worked_example?.length>45&&/[\u0B80-\u0BFF]/u.test(note.worked_example_ta),id+': bilingual practical example missing');
  assert.ok(note.quick_check?.question?.length>15&&note.quick_check?.answer?.length>3,id+': English answer check missing');
  assert.ok(/[\u0B80-\u0BFF]/u.test(note.quick_check.question_ta)&&( /[\u0B80-\u0BFF]/u.test(note.quick_check.answer_ta)||/^[\d\s.,–-]+$/.test(note.quick_check.answer_ta)),id+': Tamil answer check missing');
  assert.ok(taggedIds.has(id),id+': bilingual note is not linked from syllabus');
}
assert.equal(notes.filter(n=>n.points_ta?.length===n.points?.length).length,25,'Expanded science, finance, geography drafts plus the original sixteen');
for(const id of ['measurements','force-motion','matter']){
 const n=notes.find(note=>note.id===id);
 assert.equal(n.points.length,7,id+': seven substantive English points required');
 assert.equal(n.points_ta.length,n.points.length,id+': matching Tamil explanations required');
 assert.ok(n.exam_focus_ta&&n.worked_example_ta&&n.quick_check?.question_ta&&n.quick_check?.answer_ta,id+': bilingual revision aids required');
 assert.notEqual(n.editorial_review,'approved',id+': draft must not claim editorial approval');
}
for(const id of ['electricity','organs','solar-system']){
 const n=notes.find(note=>note.id===id);
 assert.ok(n,id+': missing expanded note');
 assert.equal(n.points.length,7,id+': seven substantive English facts required');
 assert.equal(n.points_ta.length,7,id+': aligned Tamil details required');
 assert.ok(n.points_ta.every(v=>/[\u0B80-\u0BFF]/.test(v)),id+': missing Tamil-script explanation');
 assert.ok(n.exam_focus?.length>45&&n.exam_focus_ta?.length>35,id+': bilingual exam focus required');
 assert.ok(n.worked_example?.length>45&&n.worked_example_ta?.length>35,id+': bilingual worked example required');
 assert.ok(n.quick_check?.question_ta&&n.quick_check?.answer_ta,id+': bilingual quick-check required');
 assert.ok(!n.editorial_review,id+': human editorial approval must not be invented');
}
assert.match(notes.find(n=>n.id==='electricity').points.join(' '),/chemical energy.*electrical energy/,'Cell energy conversion');
assert.match(notes.find(n=>n.id==='organs').points.join(' '),/ureters.*urinary bladder/,'Correct excretory pathway');
assert.match(notes.find(n=>n.id==='solar-system').points.join(' '),/light-year.*distance/,'Light-year is distance');
for(const id of ['tn-naan-mudhalvan'])assert.ok(!notes.find(n=>n.id===id).points_ta,'Do not claim existing English-only notes are fully bilingual');
for(const id of ['tn-budget-process','tn-budget-deficits','tn-finance-consultation']){const n=notes.find(x=>x.id===id);assert.equal(n.points_ta.length,n.points.length,id+': Tamil point-by-point alignment');assert.ok(n.quick_check.question_ta&&n.quick_check.answer_ta,id+': bilingual check missing');assert.match(n.translation_status,/awaiting independent/i,id+': editorial review must not be asserted');}
assert.match(notePage,/id="noteLanguage"/,'Reader must offer a study-language selector');
assert.match(notePage,/<option value="ta">தமிழ்<\/option>/,'Tamil-only reading mode missing');
assert.match(notePage,/<option value="both">English \+ தமிழ்<\/option>/,'Side-by-side reading mode missing');
assert.match(notePage,/language.addEventListener\('change',render\)/,'Language controls must change the note display');
assert.match(notePage,/mode=bilingual\?language.value:'en'/,'Untranslated topics must remain clearly in English');
assert.match(notePage,/Full Tamil explanations for this topic are not published yet/,'Partial coverage must be disclosed');
assert.match(notePage,/note.points_ta\[i\]/,'Fact-by-fact Tamil display not wired');
assert.match(notePage,/quick_check.question_ta/,'Tamil revision questions not displayed');
assert.match(notePage,/quick_check.answer_ta/,'Tamil revision answers not displayed');

assert.match(notePage,/id="noteSearch"/,'Notes have topic search');
assert.match(notePage,/id="noteMatches"/,'Topic search has accessible results');
const scripts=[...notePage.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
assert.ok(scripts.length);for(const script of scripts)new vm.Script(script,{filename:'tn-school-notes.html'});
console.log('Group IIA syllabus valid: '+blocks.length+' subjects, '+notes.length+' notes, '+links+' note-linked topics.');
