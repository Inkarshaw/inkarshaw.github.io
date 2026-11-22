/* CDS II 2020 original-PDF response-sheet safety and browser interaction test. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const coverage=JSON.parse(read('data/quizzes/cds-gk/coverage-gaps-2008-2020.json'));
const source=coverage.slots.find(p=>p.year===2020&&p.session==='II');
assert.equal(source.status,'provisional-english-text-available');
assert.equal(source.paperId,'cds-ii-2020-gk');
assert.equal(source.questionPositions,120);
assert.equal(source.responseSheetPositions,120);
assert.equal(source.sourcePaperId,'cds-ii-2020-gk');
assert.equal(source.officialBookletSeries,'A');
assert.equal(source.officialSourceInspected,true);
assert.equal(source.officialFinalAnswerKeyVerified,false);
assert.equal(source.scoringEnabled,false);
assert.equal(source.originalPaperResponseSheetUrl,'pyq-cds-source.html?paper=cds-ii-2020-gk');
assert.equal(source.officialSourcePdf,'https://www.upsc.gov.in/sites/default/files/QP-CDS2-20-GENERAL_KNOWLEDGE.pdf');
const html=read('pyq-cds-source.html'), js=read('assets/js/pyq-cds-source.js'),library=read('pyq-cds.html');
for(const v of ['id="paperTitle"','id="officialPdf"','id="pdfFrame"','id="practice"','id="choices"','id="palette"','id="exportAnswers"','id="clearAnswers"','id="attemptCount"'])
 assert.ok(html.includes(v),'Original-source practice UI is missing '+v);
assert.ok(library.includes('href="pyq-cds-source.html?paper=cds-ii-2020-gk"'));
assert.ok(library.includes('All 120 English question stems and A–D options have now been imported'));
assert.ok(html.includes('not a typed or scored quiz'));
assert.ok(!js.includes('innerHTML'),'PDF source and stored answers must not be injected as HTML');
new vm.Script(js,{filename:'assets/js/pyq-cds-source.js'});

class Node{
 constructor(tag='div',id=''){this.tagName=tag;this.id=id;this.children=[];this.listeners={};this.attributes={};this.hidden=true;this.text='';this.className='';this.style={};}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];this.text='';}
 set textContent(t){this.text=String(t);this.children=[];}
 get textContent(){return this.text+this.children.map(c=>c.textContent??'').join('');}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(k,fn){this.listeners[k]=fn;}
 click(){if(this.listeners.click)this.listeners.click({});}
 remove(){}
}
const ids=['paperTitle','paperMeta','officialPdf','pdfFrame','practice','currentQuestion','choices','palette','attemptCount','previous','next','jump','jumpButton','exportAnswers','clearAnswers','status'];
const nodes=Object.fromEntries(ids.map(id=>[id,new Node('div',id)]));
nodes.jump.value='';
let lastBlob=null,downloadName=null,confirmations=0;
const storage=new Map();
const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))};
const document={
 getElementById:id=>nodes[id]??null,
 createElement:tag=>{const n=new Node(tag);if(tag==='a')n.click=()=>{downloadName=n.download;};return n;},
 createDocumentFragment:()=>new Node('fragment'),
 body:new Node('body')
};
const fakeURL={
 createObjectURL(blob){lastBlob=blob;return 'blob:test';},
 revokeObjectURL(){}
};
const context={document,fetch:async url=>{
 assert.equal(url,'data/quizzes/cds-gk/coverage-gaps-2008-2020.json');
 return {ok:true,json:async()=>coverage};
},location:{search:'?paper=cds-ii-2020-gk'},URLSearchParams,
URL:fakeURL,localStorage,Blob,setTimeout:fn=>fn(),
window:{confirm(){confirmations++;return true;}},console};
new vm.Script(js,{filename:'assets/js/pyq-cds-source.js'}).runInNewContext(context,{timeout:3000});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(nodes.practice.hidden,false,'Valid official PDF should open response sheet');
assert.equal(nodes.officialPdf.href,source.officialSourcePdf);
assert.equal(nodes.pdfFrame.src,source.officialSourcePdf);
assert.equal(nodes.choices.children.length,4);
assert.equal(nodes.palette.children.length,1,'Palette is appended as a single document fragment');
assert.equal(nodes.palette.children[0].children.length,120,'120 numbered response positions must display');
assert.equal(nodes.attemptCount.textContent,'0 / 120 responses recorded · ungraded');
nodes.choices.children[2].click(); // Q1 C
assert.equal(nodes.attemptCount.textContent,'1 / 120 responses recorded · ungraded');
nodes.next.click(); // Q2
assert.equal(nodes.currentQuestion.textContent,'Question 2 of 120');
nodes.choices.children[3].click(); // Q2 D
nodes.palette.children[0].children[119].click(); // Q120
assert.equal(nodes.currentQuestion.textContent,'Question 120 of 120');
nodes.choices.children[0].click(); // Q120 A
assert.equal(nodes.attemptCount.textContent,'3 / 120 responses recorded · ungraded');
nodes.exportAnswers.click();
assert.equal(downloadName,'cds-ii-2020-gk-ungraded-responses.json');
const exported=JSON.parse(await lastBlob.text());
assert.equal(exported.paperId,'cds-ii-2020-gk');
assert.equal(exported.questionTextIncluded,false);
assert.equal(exported.officialKeyMapped,false);
assert.equal(exported.score,null);
assert.equal(exported.graded,false);
assert.deepEqual(JSON.stringify(exported.responses),JSON.stringify([
 {number:1,selected:'C'}, {number:2,selected:'D'}, {number:120,selected:'A'}
]));
nodes.clearAnswers.click();
assert.equal(confirmations,1);
assert.equal(nodes.attemptCount.textContent,'0 / 120 responses recorded · ungraded');
console.log('PASS CDS II 2020 official PDF source-only practice: 120 answer positions, local save, export, reset, no invented question text and no scoring.');
