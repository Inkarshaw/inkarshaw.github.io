/* Browser-like smoke checks: CDS papers appear and filter in the typed PYQ library. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cds=JSON.parse(read('data/quizzes/cds-gk/index.json'));
assert.equal(cds.paperStatuses.length,16);

class Element {
 constructor(tag='div',id=''){
  this.tagName=tag;this.id=id;this.children=[];this.style={};
  this.hidden=false;this.value='';this.className='';this.href='';
  this.listeners={};this._text='';
 }
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];this._text='';}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text+this.children.map(e=>e.textContent??'').join('');}
 setAttribute(name,value){this[name]=String(value);}
 addEventListener(name,fn){this.listeners[name]=fn;}
 dispatch(name){assert.equal(typeof this.listeners[name],'function','Missing '+name+' listener on '+this.id);this.listeners[name]({target:this,type:name});}
}
const ids=['search','examFilter','coverageFilter','yearFilter','cards','stats','showing','empty','showMore','dataNotice'];
const nodes=Object.fromEntries(ids.map(id=>[id,new Element('div',id)]));
for(const id of ['search','examFilter','coverageFilter','yearFilter'])nodes[id].tagName='input';
nodes.search.value='';
nodes.examFilter.value='all';
nodes.coverageFilter.value='all';
nodes.yearFilter.value='all';
const document={
 getElementById:id=>nodes[id]??null,
 createElement:tag=>new Element(tag)
};
const fetch=async url=>{
 const clean=String(url);
 assert.match(clean,/^data\/quizzes\/[a-z0-9/_-]+\.json$/);
 return {ok:true,json:async()=>JSON.parse(read(clean))};
};
const js=read('assets/js/typed-pyq-catalog.js');
new vm.Script(js,{filename:'assets/js/typed-pyq-catalog.js'}).runInNewContext({document,fetch,URLSearchParams,console},{timeout:4000});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(nodes.dataNotice.textContent,'All indexed examination years loaded.');
function cdsCards(){
 return nodes.cards.children.filter(card=>card.children.some(child=>child.tagName==='h2'&&/^CDS (?:I|II) · General Knowledge$/.test(child.textContent)));
}
function links(card){return card.children.filter(child=>child.tagName==='a').map(child=>child.href);}
assert.equal(cdsCards().length,16,'All 16 CDS paper cards must load on the initial PYQ library screen');
assert.ok(nodes.stats.textContent.includes('5050'),'Complete numbered positions must combine 3130 existing and 1920 CDS');
const expected=cds.paperStatuses.map(x=>'pyq-cds.html?paper='+x.id).sort();
assert.deepEqual(cdsCards().flatMap(links).sort(),expected,'Every CDS card must deep-link to its own question paper');
assert.ok(cdsCards().every(card=>card.textContent.includes('Scoring disabled / not verified')),'No CDS card may claim scoring');

nodes.examFilter.value='UPSC';nodes.examFilter.dispatch('change');
assert.equal(cdsCards().length,16,'UPSC board filter must show all 16 CDS papers');

nodes.yearFilter.value='2019';nodes.yearFilter.dispatch('change');
assert.deepEqual(cdsCards().map(x=>x.children.find(y=>y.tagName==='h2').textContent).sort(),
 ['CDS I · General Knowledge','CDS II · General Knowledge']);
assert.deepEqual(cdsCards().flatMap(links).sort(),
 ['pyq-cds.html?paper=cds-i-2019-gk','pyq-cds.html?paper=cds-ii-2019-gk']);

nodes.yearFilter.value='2020';nodes.yearFilter.dispatch('change');
assert.deepEqual(cdsCards().flatMap(links),['pyq-cds.html?paper=cds-i-2020-gk']);

nodes.yearFilter.value='all';nodes.yearFilter.dispatch('change');
nodes.search.value='CDS';nodes.search.dispatch('input');
assert.equal(cdsCards().length,16,'Searching CDS must display all CDS paper cards');

nodes.coverageFilter.value='source-only';nodes.coverageFilter.dispatch('change');
assert.equal(cdsCards().length,0,'CDS text papers must not be mislabelled source-only');

nodes.coverageFilter.value='full-numbered-draft';nodes.coverageFilter.dispatch('change');
assert.equal(cdsCards().length,16,'All CDS text papers belong in complete-numbered draft coverage');

console.log('PASS CDS discoverability: 16 selectable full-paper cards, UPSC/year/search/coverage filters and safe deep links.');
