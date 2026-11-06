// Regression checks for class/subject routing and complete-answer quiz navigation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const catalog = read('assets/js/textbook-catalog-controls.js');
const daily = read('daily-quiz.html');
const textbook = read('textbook-play.html');
const catalogHelpers = catalog.slice(catalog.indexOf('  function subjectChoicesForClass('), catalog.indexOf('  function urlFor('));
assert.ok(catalogHelpers.startsWith('  function subjectChoicesForClass('));
const routes = vm.createContext({});
vm.runInContext(catalogHelpers, routes);
assert.equal(routes.subjectForClass(12,'geography'), 'geography');
assert.equal(routes.subjectForClass(11,'geography'), 'history');
assert.equal(routes.subjectForClass(8,'history'), 'science');
assert.equal(routes.subjectForClass(7,'social-science'), 'social-science');
assert.equal(routes.subjectForClass(6,'geography'), 'science');
assert.equal(routes.subjectChoicesForClass(12).length, 2);
assert.match(catalog, /const subject=subjectForClass\(cls,/);
assert.match(catalog, /const c=Number\(v\),s=subjectForClass\(c,subject\)/);
assert.match(catalog, /\[1,2,3\]\.includes\(requestedTerm\)/);

// Saved data is controlled by the visitor's browser and may be malformed or left
// behind by an older version. A damaged value must not stop the Daily Quiz loading.
const saved = new Map();
const savedCtx = vm.createContext({
  HISTORY_KEY:'history', WRONG_KEY:'wrong', SESSION_KEY:'session',
  localStorage:{getItem(key){return saved.has(key)?saved.get(key):null}}
});
const savedFunctions = ['storedRows','getQuizHistory','wrongBook','quizSession'].map(name=>{
  const line=daily.split('\n').find(s=>s.startsWith('function '+name+'('));
  assert.ok(line, 'Saved-data function missing: '+name);
  return line;
}).join('\n');
vm.runInContext(savedFunctions,savedCtx);
for(const malformed of ['{','null','{}','42','"not-an-array"']){
  saved.set('history',malformed);saved.set('wrong',malformed);
  assert.equal(savedCtx.getQuizHistory().length,0,'Ignore damaged history: '+malformed);
  assert.equal(savedCtx.wrongBook().length,0,'Ignore damaged notebook: '+malformed);
}
saved.set('history',JSON.stringify([null,17,[],{}, {date:'2026-11-06',score:8,total:10}]));
assert.equal(savedCtx.getQuizHistory().length,2,'Retain only object-shaped history records');
saved.set('wrong',JSON.stringify([null,[],{}, {id:4},{id:' '},{id:'question-1',status:'needs-review'}]));
assert.equal(savedCtx.wrongBook().length,1,'Retain only valid notebook IDs');
saved.set('session','[]');assert.equal(savedCtx.quizSession(),null,'A session cannot be an array');
saved.set('session','"stale"');assert.equal(savedCtx.quizSession(),null,'A session cannot be a string');
saved.set('session','{');assert.equal(savedCtx.quizSession(),null,'A damaged session cannot crash startup');
saved.set('session',JSON.stringify({date:'2026-11-06',current:2}));
assert.equal(savedCtx.quizSession().current,2,'Keep valid saved sessions');

// Exercise actual Daily Quiz navigation handler, not a copied implementation.
function functionLine(src, name) {
  const line = src.split('\n').find(s => s.startsWith('function ' + name + '('));
  assert.ok(line, 'Function not found: ' + name);
  return line;
}
let dailyFinishes = 0, dailyRenders = 0;
const dailyContext = vm.createContext({
  current:2, checked:[true,false,true], answers:['A','B','C'], quiz:[{},{},{}],
  saveQuizSession(){}, render(){dailyRenders++}, finish(){dailyFinishes++}
});
vm.runInContext(functionLine(daily,'firstUncheckedIndex') + '\n' + functionLine(daily,'checkOrNext'), dailyContext);
dailyContext.checkOrNext();
assert.equal(dailyContext.current, 1, 'Last question redirects to an unanswered question');
assert.equal(dailyFinishes, 0, 'Cannot finish prematurely');
dailyContext.checkOrNext();
assert.equal(dailyContext.checked[1], true, 'Checking the final unanswered question succeeds');
dailyContext.current = 2;
dailyContext.checkOrNext();
assert.equal(dailyFinishes, 1, 'Completion works after all questions are checked');
assert.ok(dailyRenders >= 2);
assert.match(daily, /Next unanswered/);

// Exercise the textbook player's real next-button callback.
let textbookFinishes = 0, textbookRenders = 0;
const nextButton = {};
const playerContext = vm.createContext({
  idx:2, qs:[{},{},{}], answers:[0,1,2], checked:[true,false,true],
  $:name=>name==='next'?nextButton:null,
  txt:en=>en,
  alert(){throw Error('Unexpected answer prompt')},
  render(){textbookRenders++}, finish(){textbookFinishes++}
});
vm.runInContext(functionLine(textbook,'firstUncheckedIndex'), playerContext);
const nextLine = textbook.split('\n').find(s => s.startsWith("$('next').onclick="));
assert.ok(nextLine, 'Textbook next handler missing');
vm.runInContext(nextLine, playerContext);
nextButton.onclick();
assert.equal(playerContext.idx, 1, 'Textbook last-question action returns to unanswered item');
assert.equal(textbookFinishes, 0);
nextButton.onclick();
assert.equal(playerContext.checked[1], true);
playerContext.idx = 2;
nextButton.onclick();
assert.equal(textbookFinishes, 1);
assert.ok(textbookRenders >= 2);
assert.match(textbook, /விடையளிக்காத அடுத்த வினா/);

// Check both inline quiz scripts still parse as JavaScript.
for (const [name, html] of [['daily-quiz.html',daily],['textbook-play.html',textbook]]) {
  const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
  for (const code of inline) new vm.Script(code, {filename:name});
}
console.log('Class navigation and both complete-answer quiz flows passed.');
