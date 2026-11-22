/* Easy navigation regression: all mobile primary destinations are one tap away. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const origin=process.env.CLEAREXAMS_TEST_ORIGIN||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(String(e.message)));
try{
 const paths=[
  ['/', 'home'], ['/start.html','exams'], ['/practice.html','practice'],
  ['/pyq-hub.html','pyqs'], ['/dashboard.html','more'],
  ['/pyq-cds.html','pyqs'], ['/tnpsc/mocks/','practice']
 ];
 for(const [path,tab] of paths){
  errors.length=0;
  await page.goto(origin+path,{waitUntil:'domcontentloaded'});
  const nav=page.locator('.ce-bottom-nav');
  await nav.waitFor({state:'visible',timeout:15000});
  assert.equal(await nav.locator('a,button').count(),5,path+': must offer five direct controls');
  const actual=await nav.locator('a').allTextContents();
  assert.deepEqual(actual.map(x=>x.trim()),['⌂Home','▤Exams','✓Practice','▣PYQs'],path+' primary labels');
  const selected=await nav.locator('.active').count();
  assert.equal(selected,1,path+' must highlight exactly one current destination');
  if(tab==='more')assert.equal(await nav.locator('#ceMoreBtn.active').count(),1);
  else {
   const position={home:0,exams:1,practice:2,pyqs:3}[tab];
   assert.equal(await nav.locator('a').nth(position).getAttribute('aria-current'),'page',path+' active route');
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=5,path+' mobile overflow '+overflow);
  assert.deepEqual(errors,[],path+' page JS errors');
  console.log('PASS five-route mobile navigation '+path);
 }
 // Primary journey: Homepage -> Exams -> Practice -> PYQs.
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
 await page.locator('.ce-bottom-nav a').nth(1).click();
 assert.ok(new URL(page.url()).pathname==='/start.html','Exams opens exam selection');
 await page.locator('.ce-bottom-nav a').nth(2).click();
 assert.ok(new URL(page.url()).pathname==='/practice.html','Practice opens question hub');
 await page.locator('.ce-bottom-nav a').nth(3).click();
 assert.ok(new URL(page.url()).pathname==='/pyq-hub.html','PYQs opens year-wise papers');
 console.log('PASS home -> exams -> practice -> PYQs requires one tap per destination');
 // More is a keyboard-safe menu and surfaces progress/current affairs directly.
 const more=page.locator('#ceMoreBtn'),sheet=page.locator('#ceMoreSheet');
 await more.click();
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 assert.equal(await sheet.getAttribute('aria-hidden'),'false');
 assert.equal(await sheet.locator('a[href="/dashboard.html"]').count(),1);
 assert.equal(await sheet.locator('a[href="/current-affairs/text/"]').count(),1);
 assert.equal(await sheet.locator('a[href="/pyq-cds.html"]').count(),1);
 assert.equal(await sheet.locator('a[href="/tnpsc/mocks/"]').count(),1);
 await page.keyboard.press('Escape');
 assert.equal(await more.getAttribute('aria-expanded'),'false');
 assert.equal(await sheet.getAttribute('aria-hidden'),'true');
 assert.equal(await more.evaluate(e=>document.activeElement===e),true,'Escape restores keyboard focus');
 await more.click();
 await sheet.locator('a[href="/dashboard.html"]').click();
 assert.ok(new URL(page.url()).pathname==='/dashboard.html','Progress in More opens dashboard');
 await page.locator('#ceMoreBtn').click();
 await page.locator('#ceMoreSheet a[href="/current-affairs/text/"]').click();
 assert.ok(new URL(page.url()).pathname.startsWith('/current-affairs/text/'),'Current affairs in More');
 console.log('PASS accessible More -> Dashboard and Current Affairs links');
 // A reader opened from the CDS library also has a one-tap return to PYQ hub.
 await page.goto(origin+'/pyq-cds.html',{waitUntil:'domcontentloaded'});
 await page.locator('.ce-bottom-nav a[href="/pyq-hub.html"]').click();
 assert.ok(new URL(page.url()).pathname==='/pyq-hub.html','CDS reader can return to PYQs directly');
 // User's chosen exam opens its hub rather than an unrelated dashboard.
 await page.evaluate(()=>localStorage.setItem('clearexamsTargetExamV1','tnpsc'));
 await page.reload({waitUntil:'domcontentloaded'});
 const target=page.locator('.ce-target-chip');
 await target.waitFor({state:'visible'});
 assert.equal(await target.getAttribute('href'),'/tnpsc.html');
 await target.click();
 assert.ok(new URL(page.url()).pathname==='/tnpsc.html');
 console.log('PASS CDS back to PYQs and chosen exam direct shortcut');

 // Exam finder: visible from one-tap Exams with actual support levels and no broken route.
 errors.length=0;
 await page.goto(origin+'/start.html',{waitUntil:'domcontentloaded'});
 await page.locator('.ce-exam-category').first().waitFor({state:'visible',timeout:15000});
 assert.equal(await page.locator('.ce-exam-category').count(),12,'All twelve broad exam categories are discoverable');
 assert.match(await page.locator('#ceExamSummary').innerText(),/90 exam routes/);
 const select=page.locator('#ceExamCategory'),search=page.locator('#ceExamSearch');
 await select.selectOption('defence');
 assert.equal(await page.locator('.ce-exam-item').count(),8,'Defence covers CDS, NDA, CAPF and armed forces');
 const cds=page.locator('.ce-exam-item').filter({hasText:'UPSC CDS'});
 assert.equal(await cds.locator('a').getAttribute('href'),'pyq-cds.html');
 assert.match(await cds.innerText(),/Provisional PYQ practice/);
 await select.selectOption('all');
 await search.fill('ctet');
 assert.equal(await page.locator('.ce-exam-item').count(),1);
 assert.match(await page.locator('.ce-exam-item').innerText(),/Shared foundation only/);
 await search.fill('NEET');
 assert.equal(await page.locator('.ce-exam-item').count(),2);
 await search.fill('');
 await select.selectOption('tnpsc');
 const group4=page.locator('.ce-exam-item').filter({hasText:'TNPSC Group IV'});
 assert.equal(await group4.locator('a').getAttribute('href'),'tnpsc/mocks/');
 assert.match(await group4.innerText(),/Exam practice available/);
 await select.selectOption('ssc');
 const cgl=page.locator('.ce-exam-item').filter({hasText:'Combined Graduate Level'});
 assert.equal(await cgl.locator('a').getAttribute('href'),'exam-preparation.html?exam=ssc-cgl');
 await cgl.locator('a').click();
 assert.equal(new URL(page.url()).searchParams.get('exam'),'ssc-cgl');
 assert.equal(new URL(page.url()).pathname,'/exam-preparation.html');
 console.log('PASS exam directory: 12 categories, 90 routes, search and honest practice status');
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
 const allExamsLink=page.locator('.exam-picker a[href="start.html#exam-directory"]');
 await allExamsLink.click();
 assert.equal(new URL(page.url()).hash,'#exam-directory');
 await page.locator('#ceExamSearch').waitFor({state:'visible'});
 const overflowFinder=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflowFinder<=5,'Exam finder must not overflow phone screen');
 assert.deepEqual(errors,[],'No navigation errors during exam discovery');
 console.log('PASS homepage to exam directory in one tap, phone-sized view');
 
 // Desktop retains the ordinary page header, with no intrusive mobile navigation.
 await page.setViewportSize({width:1280,height:800});
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
 await page.locator('.ce-bottom-nav').waitFor({state:'attached'});
 assert.equal(await page.locator('.ce-bottom-nav').isVisible(),false,'Mobile dock hidden on desktop');
 assert.equal(await page.locator('nav.links a[href="practice.html"]').isVisible(),true);
 console.log('PASS desktop navigation and responsive visibility');
}finally{
 await browser.close();
}
