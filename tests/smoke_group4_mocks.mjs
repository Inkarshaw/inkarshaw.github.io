/* Group IV mock reliability: Android-sized Chromium, refresh and full browser restart. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const origin=process.env.CLEAREXAMS_TEST_ORIGIN||'http://127.0.0.1:8765';
const data=JSON.parse(fs.readFileSync('data/quizzes/tnpsc-group4-full-mock-1.json','utf8'));
assert.equal(data.questionCount,200);
assert.equal(data.questions.length,200);
assert.equal(data.questions.filter(q=>q.section==='Tamil').length,100);
assert.equal(data.questions.filter(q=>q.section==='General Studies').length,75);
assert.equal(data.questions.filter(q=>q.section==='Aptitude').length,25);
assert.equal(data.durationMinutes,180);
assert.equal(data.tamilMinimumMarks,60);
assert.equal(data.overallMinimumMarks,90);
assert.ok(data.questions.every(q=>q.options.length>=4&&q.acceptedAnswers.length>=1));
const temp='/tmp/clearexams-group4-mock-android-profile-'+process.pid;
let context;
async function openProfile(){
 context=await chromium.launchPersistentContext(temp,{
  headless:true,viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
  userAgent:'Mozilla/5.0 (Linux; Android 17; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
 });
 return context.pages()[0]||await context.newPage();
}
let page=await openProfile();
try{
 for(let n=1;n<=4;n++){
  const url=origin+'/tnpsc/mocks/mock-'+n+'.html';
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#startBtn')&&!document.querySelector('#startBtn').disabled);
  await page.locator('#startBtn').click();
  await page.locator('#options button').first().click();
  await page.locator('#markBtn').click();
  await page.locator('#nextBtn').click();
  await page.waitForFunction(()=>document.querySelector('#qnum')?.textContent.includes('Question 2'));
  const key='clearexamsTNPSCGroup4MockSessionV2:'+n;
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  assert.equal(saved.answers[0],0,'Mock '+n+': answer persisted');
  assert.equal(saved.marked[0],true,'Mock '+n+': flag persisted');
  assert.equal(saved.current,1,'Mock '+n+': question position persisted');
  assert.ok(saved.deadline>Date.now(),'Mock '+n+': deadline persisted');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('#test')?.classList.contains('hidden'));
  assert.match(await page.locator('#qnum').innerText(),/Question 2 of 25/,'Mock '+n+': refreshed position');
  const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  assert.equal(after.deadline,saved.deadline,'Mock '+n+': timer must not restart');
  assert.equal(after.marked[0],true,'Mock '+n+': saved review flag');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=4,'Mock '+n+': Android width overflow '+overflow);
  console.log('PASS Mock '+n+': saved answer, review flag, position and deadline survive refresh');
 }
 // Closing the browser entirely must preserve mock 1 state on the same Android-like profile.
 const old=await page.evaluate(()=>JSON.parse(localStorage.getItem('clearexamsTNPSCGroup4MockSessionV2:1')));
 await context.close();
 page=await openProfile();
 await page.goto(origin+'/tnpsc/mocks/mock-1.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.querySelector('#test')?.classList.contains('hidden'));
 const again=await page.evaluate(()=>JSON.parse(localStorage.getItem('clearexamsTNPSCGroup4MockSessionV2:1')));
 assert.equal(again.deadline,old.deadline,'Android-style profile restart cannot restart deadline');
 assert.equal(again.answers[0],0);
 assert.equal(again.marked[0],true);
 assert.equal(again.current,1);
 console.log('PASS mock browser process restart preserves saved attempt');
 // Full-length mock uses the same deadline and resume semantics.
 await page.goto(origin+'/tnpsc/mocks/full-mock-1.html',{waitUntil:'domcontentloaded'});
 await page.locator('#startBtn').click();
 await page.locator('#options button').first().click();
 await page.locator('#markBtn').click();
 await page.locator('#nextBtn').click();
 const key='clearexamsTNPSCGroup4FullMockSessionV1';
 let state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 assert.equal(state.answers[0],0);assert.equal(state.marked[0],true);
 assert.equal(state.current,1);
 assert.ok(state.deadline-Date.now()>170*60000,'Full mock should begin with three hours');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.querySelector('#test')?.classList.contains('hidden'));
 let resumed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 assert.equal(resumed.deadline,state.deadline);
 assert.equal(resumed.current,1);
 const fullOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(fullOverflow<=4,'Full mock Android width overflow '+fullOverflow);
 console.log('PASS full mock 200 questions: saved answer, review flag, position and 3h deadline');
 // Qualifying rule: 39 correct Tamil answers is below 60 marks. No Part B score is released.
 state=await page.evaluate(({key,answers})=>{
   const s=JSON.parse(localStorage.getItem(key));s.answers=answers;localStorage.setItem(key,JSON.stringify(s));return s;
 },{key,answers:data.questions.map((q,i)=>i<39?q.acceptedAnswers[0]:null)});
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.querySelector('#test')?.classList.contains('hidden'));
 page.once('dialog',d=>d.accept());
 await page.locator('#submitBtn').click();
 await page.locator('#gateOutcome').waitFor({state:'visible'});
 assert.match(await page.locator('#gateOutcome').innerText(),/NOT satisfied/);
 assert.match(await page.locator('#subjectResults').innerText(),/not evaluated/);
 console.log('PASS full mock: Tamil gate blocks Part B below 60/150');
 // A fresh run with 40 Tamil + 20 GS key-matched answers reaches 90/300.
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('#startBtn').click();
 await page.evaluate(({key,answers})=>{
   const s=JSON.parse(localStorage.getItem(key));s.answers=answers;localStorage.setItem(key,JSON.stringify(s));
 },{key,answers:data.questions.map((q,i)=>i<40||(i>=100&&i<120)?q.acceptedAnswers[0]:null)});
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.querySelector('#test')?.classList.contains('hidden'));
 page.once('dialog',d=>d.accept());
 await page.locator('#submitBtn').click();
 assert.match(await page.locator('#gateOutcome').innerText(),/satisfied/);
 assert.match(await page.locator('#gateOutcome').innerText(),/90\/300 minimum/);
 assert.match(await page.locator('#score').innerText(),/90\.0 \/ 300/);
 console.log('PASS full mock: Tamil gate and 90/300 whole-paper minimum');
}finally{
 if(context)await context.close();
 fs.rmSync(temp,{recursive:true,force:true});
}
