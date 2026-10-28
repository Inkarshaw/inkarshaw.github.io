// Publication readiness gate: never convert a partial paper into a "Full Original Paper".
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const digital=read('pyq-original-digital.html');
const script=read('assets/js/pyq-original-digital.js');
const validator=read('assets/js/pyq-original-validator.js');
const manifest=JSON.parse(read('data/quizzes/verified-full-original-papers.json'));
const ctx={window:{},URL};vm.runInNewContext(validator,ctx);
const gate=ctx.window.ClearExamsFullOriginal;
assert.ok(gate&&typeof gate.validate==='function');
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.papers.length,0,'No original full-paper transcriptions may be published without rights and verification');
assert.match(digital,/Exact examination-paper questions/);
assert.match(digital,/Incomplete and adapted question banks are excluded/);
assert.match(digital,/pyq-original-validator\.js/);
assert.match(digital,/pyq-original-digital\.js/);
assert.match(script,/\.filter\(x=>api\.validate\(x\)\.ok\)/);
assert.match(script,/paper\.questions\[state\.index\]/);
assert.match(script,/state\.answers\[i\]===q\.correct/);
assert.match(script,/reviewFilter/);
assert.match(read('sitemap.xml'),/pyq-original-digital\.html/);
new vm.Script(script,{filename:'assets/js/pyq-original-digital.js'});
const template={
 id:'example-verified-test-paper',exam:'Sample test only',year:2020,paperVersion:'Set A',
 language:'ta-en',officialPaperUrl:'https://www.tnpsc.gov.in/test/example-paper.pdf',
 finalKeyUrl:'https://www.tnpsc.gov.in/test/example-final-key.pdf',
 questionCount:3,durationMinutes:3,marksPerQuestion:1,
 reproductionPermission:{status:'approved',rightsHolder:'TEST FIXTURE',evidence:'TEST FIXTURE',reviewedBy:'TEST FIXTURE'},
 editorialReview:{status:'complete',reviewedBy:'TEST FIXTURE',reviewedOn:'2026-10-28',paperVersion:'Set A',finalKeyVersion:'Set A'},
 questions:[1,2,3].map(n=>({
  number:n,text:{ta:'சோதனை வினா '+n+'?',en:'Sample exam question '+n+'?'},
  options:{ta:{A:'முதல்'+n,B:'இரண்டாம்'+n,C:'மூன்றாம்'+n,D:'நான்காம்'+n},en:{A:'First '+n,B:'Second '+n,C:'Third '+n,D:'Fourth '+n}},
  correct:'B',keyQuestionNumber:n,textVerified:true,optionsVerified:true,finalKeyVerified:true,originalHasVisuals:false
 }))
};
assert.equal(gate.validate(template).ok,true,'Valid complete licensed paper structure should pass');
assert.equal(gate.validate({...template,questions:template.questions.slice(1)}).ok,false,'Missing original question rejected');
assert.equal(gate.validate({...template,questions:[template.questions[1],template.questions[0],template.questions[2]]}).ok,false,'Original question order required');
assert.equal(gate.validate({...template,reproductionPermission:{status:'unknown'}}).ok,false,'Rights clearance required');
assert.equal(gate.validate({...template,editorialReview:{status:'pending'}}).ok,false,'Final key version review required');
assert.equal(gate.validate({...template,questions:template.questions.map((q,i)=>i===1?{...q,options:{...q.options,en:{...q.options.en,D:''}}}:q)}).ok,false,'All original options required');
assert.equal(gate.validate({...template,questions:template.questions.map((q,i)=>i===2?{...q,keyQuestionNumber:7}:q)}).ok,false,'Official answer number match required');
assert.equal(gate.validate({...template,questions:template.questions.map((q,i)=>i===0?{...q,originalHasVisuals:true}:q)}).ok,false,'Untranscribed original figures rejected');
assert.equal(gate.validate({...template,questions:template.questions.map((q,i)=>i===0?{...q,originalHasVisuals:true,visuals:[{src:'assets/pyq-original/example-chart.png',alt:'Original chart',placement:'stem',verified:true}]}:q)}).ok,true,'Reviewed original figures accepted');

console.log('Full original-paper gate: completeness, sequence, language, answer key, rights, and JS syntax passed.');
