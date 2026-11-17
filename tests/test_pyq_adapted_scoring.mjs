// Do not present editorial PYQ answers as official final-key grades.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const js=read('assets/js/pyq-full-quiz.js');
const html=read('pyq-full-quiz.html');
const bank=JSON.parse(read('data/quizzes/verified-pyqs.json'));
assert.ok(Array.isArray(bank)&&bank.length>=160,'Expected adapted PYQ question bank');
new vm.Script(js,{filename:'assets/js/pyq-full-quiz.js'});

const sourceUrl=js.match(/  const safeSource=url=>\{[\s\S]*?\n  \};/);
const policy=js.match(/  function isKeyMatched\(q\)\{[\s\S]*?\n  \}/);
assert.ok(sourceUrl&&policy,'Scoring must reuse the official-source URL allowlist');
const ctx={URL};
vm.runInNewContext(`
const safeText=value=>String(value??'').trim();
${sourceUrl[0]}
${policy[0]}
this.matched=isKeyMatched;
`,ctx);
const matched=ctx.matched;

assert.equal(bank.filter(matched).length,90,'Initial officially matched adapted answer count must remain reviewable');
assert.equal(bank.filter(q=>!matched(q)).length,70,'Pending answers should stay ungraded');
for(const q of bank){
  if(/pending|unverified|incomplete/i.test(q.AnswerVerification||''))assert.equal(matched(q),false,q.ID+' must remain ungraded');
}
assert.equal(matched({...bank[0],AnswerKeyURL:'https://example.com/final.pdf'}),false,'Third-party URLs cannot establish official grading');
assert.equal(matched({...bank[0],AnswerKeyURL:''}),false,'Missing final-key URL cannot establish official grading');
assert.equal(matched({...bank[0],AnswerVerification:''}),false,'Missing reconciliation evidence cannot establish official grading');
assert.equal(matched({...bank[0],AnswerVerification:'Official final answer is B'}),false,'Undocumented official claim cannot establish grading');
assert.equal(matched({...bank[0],AnswerVerification:bank[0].AnswerVerification+'; reconciliation pending'}),false,'Pending status overrides earlier match wording');
assert.equal(matched(bank[0]),true,'Documented TNPSC final-key match remains graded');

// Both practice and exam paths must call the same grading policy.
assert.match(js,/if\(checked&&isKeyMatched\(q\)&&letter===q\.CorrectAnswer\)/);
assert.match(js,/const graded=isKeyMatched\(q\);/);
assert.match(js,/const graded=qs\.filter\(isKeyMatched\)\.length;/);
assert.match(js,/isKeyMatched\(q\)&&session\.answers\[i\]===q\.CorrectAnswer/);
assert.match(js,/scoringPolicy:2/);
assert.match(js,/if\(filter==='ungraded'&&graded\)return;/);
assert.match(html,/<option value="ungraded">Study-only \/ ungraded<\/option>/);
assert.match(html,/Only questions matched to an official final key receive provisional marks/);
console.log('Adapted PYQ scoring policy: 90 key-matched, 70 study-only; safe grading and review checks passed.');
