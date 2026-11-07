// Ensure catalogue renders actual Class 9 Science source status and live starter counts.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('textbook-quiz.html');
const catalogue=JSON.parse(read('data/textbook/class-9/science/index.json'));
const social=JSON.parse(read('data/textbook/class-9/social-science/index.json'));
const first=html.indexOf('  async function render(){');
const last=html.indexOf('  render().catch(',first);
assert.ok(first>=0&&last>first,'Expected real class catalogue renderer');
const renderer=html.slice(first,last);
async function pageFor(cls,subject,index){
  const main={innerHTML:''},requests=[];
  const scope=vm.createContext({
    cls,subject,term:1,main,units11:[],
    fetch:async url=>{requests.push(url);return {ok:true,json:async()=>index}}
  });
  await vm.runInContext(renderer+'\nrender()',scope,{timeout:3000});
  return {page:main.innerHTML,requests};
}
assert.equal(catalogue.meta.published_unit_count,25);
assert.equal(catalogue.meta.total_questions,2340);
assert.equal(catalogue.meta.total_quiz_sets,117);
assert.equal(catalogue.units.length,25);
const rendered=await pageFor(9,'science',catalogue);
assert.deepEqual(rendered.requests,['data/textbook/class-9/science/index.json']);
assert.match(rendered.page,/25\/25 chapters playable/,'Dynamic chapter progress in heading');
assert.match(rendered.page,/2,340 available questions in 117 quiz sets/,'Accurate totals from actual index');
assert.match(rendered.page,/English reference 2019\/2020 · Tamil revision 2022 review pending/);
assert.match(rendered.page,/starter banks, not exhaustive chapter coverage/);
assert.match(rendered.page,/currently prescribed 2026–27 edition and exact item-to-page matches are unverified/);
assert.match(rendered.page,/தமிழ் மூலநூல் ஒப்பீடும்/);
assert.doesNotMatch(rendered.page,/supplied Tamil Nadu State Board 2022 English and Tamil/);
assert.doesNotMatch(rendered.page,/Coming next/);
assert.equal((rendered.page.match(/class="unit ready"/g)||[]).length,25,'All 25 chapters appear');
assert.equal((rendered.page.match(/All available questions · /g)||[]).length,25,'Avoid claims that starters cover entire chapters');
for(let unit=1;unit<=25;unit++){
  assert.ok(rendered.page.includes('textbook-play.html?class=9&subject=science&unit='+unit+'&quiz=1'),'Playable URL for Unit '+unit);
}
const simulated=structuredClone(catalogue);
simulated.units[24].ready=false;
simulated.units[24].total=0;
simulated.units[24].quiz_count=0;
delete simulated.units[24].path;
const partial=await pageFor(9,'science',simulated);
assert.match(partial.page,/24\/25 chapters playable/,'Progress must not be hardcoded');
assert.match(partial.page,/2,320 available questions in 116 quiz sets/,'Totals must follow ready unit data');
assert.equal((partial.page.match(/class="unit ready"/g)||[]).length,24);
assert.equal((partial.page.match(/class="unit locked"/g)||[]).length,1);
const other=await pageFor(9,'social-science',social);
assert.ok(other.page.includes('Class 9 Social Science chapters'));
assert.doesNotMatch(other.page,/Class 9 Science source and coverage/);
assert.doesNotMatch(other.page,/English reference 2019\/2020 · Tamil revision 2022/);
console.log('Class 9 catalogue renders 25/25 and accurate live quiz totals with explicit source/edition limitations.');
