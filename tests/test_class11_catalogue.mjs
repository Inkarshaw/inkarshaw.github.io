#!/usr/bin/env node
// Verify Class 11 History catalog links against the production client-side curation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/textbook-quality.js'),'utf8'),context);
const quality=context.window.TextbookQuality;
assert.equal(typeof quality?.curate,'function','Production quality guard did not load');

const html=fs.readFileSync(path.join(root,'textbook-quiz.html'),'utf8');
const start=html.indexOf('const units11=['),stop=html.indexOf('];',start);
assert.ok(start>=0&&stop>start,'Class 11 catalogue definition missing');
const catalog=html.slice(start,stop);
const rows=[...catalog.matchAll(/^\s*\[(\d+),'[^']+','[^']+',\d+,(\d+),(\d+)\],?\s*$/gm)]
  .map(x=>({unit:Number(x[1]),sets:Number(x[2]),questions:Number(x[3])}));
assert.equal(rows.length,19,'Expected 19 History units');

let total=0;
for(const row of rows){
  const filename=`data/textbook/class-11/history/unit-${String(row.unit).padStart(2,'0')}.json`;
  const data=JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
  const result=quality.curate(data.questions);
  assert.ok(result.expanded,`Class 11 History Unit ${row.unit}: mechanical variants unexpectedly changed`);
  assert.equal(row.questions,result.questions.length,`Unit ${row.unit}: catalogue question total differs from playable count`);
  assert.equal(row.sets,Math.ceil(result.questions.length/20),`Unit ${row.unit}: catalogue contains broken quiz links`);
  total+=result.questions.length;
  if(row.unit===1){
    const first=result.questions[0];
    assert.match(first.q_en,/Which type of evidence/,'History opening question is still boilerplate');
    assert.equal(first.opts_en[first.correct],'Archaeological remains');
    assert.ok(!first.opts_en.some(x=>/Not yet deciphered|Stone Age|Pre-historic period/.test(x)),
      'Opening question mixes unrelated option types');
    assert.ok(first.q_ta&&first.opts_ta?.length===4&&first.exp_ta,'Tamil opening question is incomplete');
    const opening=result.questions.slice(0,20);
    assert.equal(opening.length,20,'Opening competitive-review quiz must have 20 questions');
    for(const q of opening){
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),
        `History first quiz still contains a mechanical stem: ${q.id}`);
      assert.equal(q.opts_en.length,4,`Missing English alternatives: ${q.id}`);
      assert.equal(q.opts_ta?.length,4,`Missing Tamil alternatives: ${q.id}`);
      assert.ok(q.exp_en?.length>40&&q.exp_ta?.length>20,
        `Explanation too weak or missing: ${q.id}`);
    }
  }
}
console.log(`Class 11 catalogue verified: ${rows.length} units and ${total} playable curated questions.`);
