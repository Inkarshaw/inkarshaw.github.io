/* Group IV Android-like Chromium offline survival test.
   Proves the first online visit installs a complete 200-question offline pack. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const origin=process.env.CLEAREXAMS_TEST_ORIGIN||'http://127.0.0.1:8765';
const profile='/tmp/clearexams-g4-offline-smoke-'+process.pid;
const appOptions={headless:true,viewport:{width:390,height:844},deviceScaleFactor:2,
  isMobile:true,hasTouch:true,serviceWorkers:'allow',
  userAgent:'Mozilla/5.0 (Linux; Android 17; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'};
let browserContext;
async function openProfile(){
  browserContext=await chromium.launchPersistentContext(profile,appOptions);
  return browserContext.pages()[0]||await browserContext.newPage();
}
function keyValue(page,key){
 return page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);
}
let page=await openProfile();
const key='clearexamsTNPSCGroup4FullMockSessionV1';
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
  const response=await page.goto(origin+'/tnpsc/mocks/full-mock-1.html',
    {waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(response?.status(),200,'Full mock loads online');
  await page.waitForFunction(()=>document.querySelector('#offlineStatus')?.textContent.includes('Offline-ready'),
    undefined,{timeout:40000});
  assert.match(await page.locator('#offlineStatus').innerText(),/Offline-ready/);
  const savedCaches=await page.evaluate(async()=>({
    keys:await caches.keys(),
    stored:await Promise.all([
      '/tnpsc/mocks/full-mock-1.html','/tnpsc/mocks/mock-1.html',
      '/assets/js/group4-full-mock.js','/assets/js/group4-short-mock.js',
      '/assets/js/mock-offline.js',
      '/data/quizzes/tnpsc-group4-full-mock-1.json',
      '/data/quizzes/tnpsc-group4-mock-1.json',
    ].map(async url=>[url,!!await caches.match(url)]))
  }));
  assert.ok(savedCaches.keys.some(x=>x==='clearexams-shell-v10-group4-offline-mocks'));
  assert.ok(savedCaches.stored.every(([,ok])=>ok),'Full and short mocks are pre-cached');
  console.log('PASS online install: 200-question data and mock pages are available offline');

  await page.locator('#startBtn').click();
  await page.locator('#options button').first().click();
  await page.locator('#markBtn').click();
  await page.locator('#nextBtn').click();
  const initial=await keyValue(page,key);
  assert.equal(initial.answers[0],0);
  assert.equal(initial.marked[0],true);
  assert.equal(initial.current,1);
  assert.ok(initial.deadline-Date.now()>170*60000,'180-minute timer started');

  await browserContext.setOffline(true);
  const offlineResponse=await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(offlineResponse?.status(),200,'Offline mock document loads from service-worker cache');
  await page.waitForFunction(()=>document.querySelector('#qnum')?.textContent.includes('Question 2 of 200'),
    undefined,{timeout:15000});
  assert.equal(await page.locator('#options button').count(),5);
  const restored=await keyValue(page,key);
  assert.equal(restored.deadline,initial.deadline,'Offline reload preserves original deadline');
  assert.equal(restored.answers[0],0,'Offline reload preserves selected answer');
  assert.equal(restored.marked[0],true,'Offline reload preserves review flag');
  assert.equal(restored.current,1,'Offline reload preserves current question');
  console.log('PASS offline reload: question bank, selected answer, flag and deadline remain');

  await page.locator('#options button').nth(1).click();
  const afterAnswer=await keyValue(page,key);
  assert.equal(afterAnswer.answers[1],1,'Can answer next question without network');
  await page.goto(origin+'/tnpsc/mocks/mock-1.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#startBtn').click();
  await page.locator('#options button').first().click();
  const shortState=await keyValue(page,'clearexamsTNPSCGroup4MockSessionV2:1');
  assert.equal(shortState.answers[0],0,'Short mock also runs without network');
  console.log('PASS offline first visit to short mock: cached 25-question bank is playable');

  await browserContext.close();
  page=null;
  page=await openProfile();
  await browserContext.setOffline(true);
  const reopened=await page.goto(origin+'/tnpsc/mocks/full-mock-1.html',
    {waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(reopened?.status(),200,'Offline browser restart serves cached full mock');
  await page.waitForFunction(()=>document.querySelector('#qnum')?.textContent.includes('Question 2 of 200'),
    undefined,{timeout:15000});
  const final=await keyValue(page,key);
  assert.equal(final.deadline,initial.deadline,'Browser restart offline does not reset the clock');
  assert.equal(final.answers[0],0);
  assert.equal(final.answers[1],1);
  assert.equal(final.marked[0],true);
  console.log('PASS offline browser restart: full-length mock and all answers resume intact');
  await page.locator('#jumpGS').click();
  assert.match(await page.locator('#qnum').innerText(),/Question 101 of 200/);
  assert.equal(await page.locator('#jumpGS').getAttribute('aria-pressed'),'true');
  await page.locator('#options button').first().click();
  assert.match(await page.locator('#jumpGS').innerText(),/1 \/ 75 answered/);
  await page.locator('#jumpApt').click();
  assert.match(await page.locator('#qnum').innerText(),/Question 176 of 200/);
  const beforeSectionReload=await keyValue(page,key);
  assert.equal(beforeSectionReload.current,175,'Aptitude jump saves the correct zero-based index');
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#qnum')?.textContent.includes('Question 176 of 200'),
    undefined,{timeout:15000});
  const afterSectionReload=await keyValue(page,key);
  assert.equal(afterSectionReload.deadline,initial.deadline,'Section navigation does not extend timer');
  assert.equal(afterSectionReload.answers[100],0,'General Studies answer survived offline navigation and refresh');
  assert.equal(await page.locator('#jumpApt').getAttribute('aria-pressed'),'true');
  console.log('PASS offline section jumps: Tamil / GS / Aptitude preserve question, answer and deadline');
  assert.deepEqual(errors,[],'No runtime errors during online/offline transition');
}finally{
  if(browserContext)await browserContext.close();
  fs.rmSync(profile,{recursive:true,force:true});
}
