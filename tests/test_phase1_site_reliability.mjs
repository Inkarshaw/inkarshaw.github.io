// Phase 1: guard core navigation, damaged saved sessions, and blocked browser storage.
// Run: node tests/test_phase1_site_reliability.mjs
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(root,name),'utf8');
const daily=read('daily-quiz.html');
const player=read('textbook-play.html');

for(const file of ['index.html','start.html','practice.html','daily-quiz.html','dashboard.html',
  'textbook-quiz.html','textbook-play.html','textbook-topics.html',
  'ncert-school-book-quiz.html','pyq-hub.html','exam-calendar.html',
  'current-affairs/text/index.html','practice-demo.html']){
  assert.ok(existsSync(resolve(root,file)), 'Core route missing: '+file);
}

// Verify that every local primary navigation destination is a real file or directory.
// Keep the scope to entry pages; the repository-wide site-health job audits the rest.
for(const file of ['index.html','start.html','practice.html','dashboard.html']){
  const html=read(file);
  for(const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)){
    const raw=match[1];
    if(/^(?:https?:|mailto:|tel:|#|javascript:|data:)/i.test(raw))continue;
    const path=raw.split(/[?#]/,1)[0];if(!path)continue;
    const target=resolve(root, path.startsWith('/')?'.'+path:dirname(file)+'/'+path);
    assert.ok(existsSync(target)||existsSync(target+'.html')||existsSync(resolve(target,'index.html')),
      file+' has a broken navigation link: '+raw);
  }
}

for(const file of ['daily-quiz.html','textbook-play.html','start.html','practice.html','dashboard.html']){
  const page=read(file);
  const scripts=[...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([,attributes,body])=>!(/\bsrc\s*=|application\/ld\+json/i.test(attributes))&&body.trim())
    .map(x=>x[2]);
  for(const [i,script] of scripts.entries())new vm.Script(script,{filename:file+'#script'+(i+1)});
}
const line=(name)=>{const v=daily.split('\n').find(x=>x.startsWith('function '+name+'('));assert.ok(v,name+' missing');return v};
const context=vm.createContext({
  localStorage:{
    getItem(){throw Error('SecurityError: access blocked')},
    setItem(){throw Error('QuotaExceededError')},
    removeItem(){throw Error('SecurityError')}
  },
  TARGET_KEY:'target', SESSION_KEY:'session', WRONG_KEY:'wrong', HISTORY_KEY:'history',
  quiz:[{ID:'a'}], current:0, answers:[null], checked:[false],retryMode:false,
  currentQuizContext:()=>({exam:'TNPSC',topic:'History',date:'2026-11-07',count:10}),
  getQuizHistory:()=>[],refreshSummary(){},renderHistory(){},
  examFamily:()=> 'tnpsc', activeDate:'2026-11-07',activeTopic:'History',
  document:{getElementById:()=>({value:'TNPSC'})}
});
vm.runInContext(['getSavedValue','setSavedValue','removeSavedValue','saveQuizSession',
  'clearQuizSession','saveWrongBook','saveAttempt'].map(line).join('\n'),context);
assert.equal(context.getSavedValue('target'),null);
assert.doesNotThrow(()=>context.setSavedValue('target','tnpsc'));
assert.doesNotThrow(()=>context.removeSavedValue('target'));
assert.doesNotThrow(()=>context.saveQuizSession());
assert.doesNotThrow(()=>context.saveWrongBook([{id:'a'}]));
assert.doesNotThrow(()=>context.saveAttempt(0,10,10,[]));
assert.doesNotThrow(()=>context.clearQuizSession());

const start=read('start.html'),practice=read('practice.html'),dashboard=read('dashboard.html');
for(const [name,html] of [['start',start],['practice',practice],['dashboard',dashboard]]){
  assert.match(html,/function readTargetExam\(\)/,name+' needs safe target reads');
  assert.match(html,/function rememberTargetExam\(value\)/,name+' needs safe target writes');
}
assert.match(daily,/Retry loading questions/);
assert.match(daily,/Browse other practice quizzes/);
assert.match(player,/Return to chapters/);
assert.match(player,/Retry loading/);

// Exercise the actual saved-textbook-session loader with malformed old-browser data.
const startAt=player.indexOf('function loadSaved(){');
const endAt=player.indexOf('function renderPalette(){',startAt);
assert.ok(startAt>0&&endAt>startAt,'Textbook session loader missing');
let fixture={s:{idx:1.5,answers:[0,5,'2'],checked:[true,true,true],marked:['yes',true,false],deadline:'bad'}};
const saved=vm.createContext({
  safeTextbookRead:()=>JSON.stringify(fixture),KEY:'progress',storageId:'s',
  qs:Array.from({length:3},()=>({opts_en:['A','B','C','D']})),
  idx:0,answers:[],checked:[],marked:[],deadline:0
});
vm.runInContext(player.slice(startAt,endAt),saved);
saved.loadSaved();
assert.equal(saved.idx,0,'Reject fractional saved position');
assert.equal(JSON.stringify(saved.answers),JSON.stringify([0,null,null]));
assert.equal(JSON.stringify(saved.checked),JSON.stringify([true,false,false]));
assert.equal(JSON.stringify(saved.marked),JSON.stringify([false,true,false]));
assert.equal(saved.deadline,0,'Reject non-numeric timers');
fixture={s:{idx:99,answers:[1,2,3],checked:'corrupted',marked:null,deadline:5000}};
saved.loadSaved();
assert.equal(saved.idx,2,'Clamp out-of-range position');
assert.equal(saved.checked.filter(Boolean).length,0);
assert.equal(saved.marked.filter(Boolean).length,0);
fixture=null;
assert.doesNotThrow(()=>saved.loadSaved());

// Easy navigation: four high-frequency study routes and a compact More dialog.
// Do not hide PYQs or exam selection behind the mobile overflow menu again.
const shell=read('assets/js/pwa.js');
new vm.Script(shell,{filename:'assets/js/pwa.js'});
for(const [label,href] of [['Home','/index.html'],['Exams','/start.html'],['Practice','/practice.html'],['PYQs','/pyq-hub.html']]){
 assert.ok(shell.includes("label:'"+label+"'"),'Mobile main nav needs '+label);
 assert.ok(shell.includes("href:'"+href+"'"),'Missing mobile nav route '+href);
 assert.ok(existsSync(resolve(root,'.'+href)),'Mobile destination does not exist: '+href);
}
assert.match(shell,/aria-haspopup','dialog'/);
assert.match(shell,/aria-expanded','false'/);
assert.match(shell,/e\.key==='Escape'/);
for(const name of ['dashboard.html','current-affairs/text/','pyq-cds.html','tnpsc/mocks/']){
 assert.ok(shell.includes('/'+name),'More panel must expose '+name);
}
assert.match(read('pyq-cds.html'),/src="assets\/js\/pwa\.js"/,'CDS reader needs global navigation');
assert.match(read('tnpsc/mocks/index.html'),/src="\.\.\/\.\.\/assets\/js\/pwa\.js"/,'Mock hub needs global navigation');
assert.match(read('index.html'),/href="start\.html">Exams<\/a>/,'Homepage must name the exam-selection action');
assert.match(read('index.html'),/href="practice\.html">Practice<\/a>/,'Homepage must name the practice action');

console.log('Phase 1 site navigation and quiz resilience checks passed.');
