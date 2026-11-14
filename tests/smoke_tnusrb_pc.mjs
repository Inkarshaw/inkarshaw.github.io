/* Local http.server student journey for the three new TNUSRB PC papers. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
const ctx = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const page = await ctx.newPage();
const faults=[];
page.on('pageerror',error=>faults.push(error.message));
const origin='http://127.0.0.1:8765';
async function open(year){
 await page.goto(origin+'/tnusrb-pc-quiz.html?year='+year,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('#setup:not([hidden])',{timeout:10000});
 assert.match(await page.locator('#heading').innerText(),new RegExp(year));
 assert.match(await page.locator('#loadStatus').innerText(),/questions loaded/);
}
try{
 await open(2022);
 assert.match(await page.locator('#sourceNote').innerText(),/141/);
 await page.locator('#start').click();
 assert.match(await page.locator('#position').innerText(),/Question 1 of 150/);
 await page.locator('#options button').first().click();
 await page.locator('#check').click();
 assert.match(await page.locator('#feedback').innerText(),/Provisional/);
 await page.locator('#flag').click();
 assert.match(await page.locator('#status').innerText(),/1 flagged/);
 await page.locator('#next').click();
 assert.match(await page.locator('#position').innerText(),/Question 2/);
 await page.reload();
 await page.waitForSelector('#quiz:not([hidden])',{timeout:10000});
 assert.match(await page.locator('#position').innerText(),/Question 2/);
 await page.locator('#palette button').nth(16).click();
 assert.match(await page.locator('#position').innerText(),/Question 17/);
 await page.locator('#check').click();
 assert.match(await page.locator('#feedback').innerText(),/Ungraded/);
 await page.locator('#palette button').nth(47).click();
 assert.match(await page.locator('#questionSource').innerText(),/F11/);
 assert.match(await page.locator('#questionSource').innerText(),/original paper/i);
 await page.locator('#finish').click();
 assert.match(await page.locator('#scoreDetails').innerText(),/9 ungraded/);
 await open(2019);
 assert.match(await page.locator('#sourceNote').innerText(),/No exam marks/);
 await page.locator('#start').click();
 await page.locator('#options button').first().click();
 await page.locator('#check').click();
 assert.match(await page.locator('#feedback').innerText(),/Unofficial worked-study answer/);
 await page.locator('#finish').click();
 assert.equal((await page.locator('#score').innerText()).trim(),'Ungraded study paper');
 await open(2020);
 assert.match(await page.locator('#sourceNote').innerText(),/No exam marks/);
 await page.locator('#start').click();
 assert.match(await page.locator('#position').innerText(),/Question 1 of 80/);
 assert.equal(faults.length,0,'No uncaught browser errors: '+faults.join(' ; '));
 console.log('PASS mobile Chromium TNUSRB PC 2022/2019/2020: visible questions, answered/flagged state, local reload, ungraded protections and 2022 marks.');
} finally {
 await browser.close();
}
