import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const unit = JSON.parse(read('data/textbook/class-12/history/unit-1.json'));
const index = JSON.parse(read('data/textbook/class-12/history/index.json'));
const questions = unit.questions;
const topics = unit.meta.topics;
assert.equal(questions.length, 133, 'Do not silently lose existing unit questions');
assert.equal(topics.length, 12, 'Topic selector must list the prepared topic groups');
assert.equal(index.units.find(x => x.id === 1).topic_count, topics.length);
const ids = questions.map(q => q.id);
assert.equal(new Set(ids).size, ids.length, 'Every question needs a stable unique ID');
const covered = new Set();
for (const topic of topics) {
  assert.match(topic.slug, /^[a-z0-9-]+$/);
  assert.ok(topic.title_en.trim() && topic.title_ta.trim(), 'Bilingual topic title missing');
  assert.ok(topic.question_ids.length >= 1, 'Empty topic: ' + topic.slug);
  for (const id of topic.question_ids) {
    assert.ok(ids.includes(id), 'Topic references a nonexistent question: ' + id);
    assert.ok(!covered.has(id), 'Question assigned to more than one topic: ' + id);
    covered.add(id);
  }
}
assert.equal(covered.size, questions.length, 'Topic groups must cover the entire unit bank');
for (const q of questions) {
  assert.equal(q.opts_en.length, 4);
  assert.equal(q.opts_ta.length, 4);
  assert.ok(q.correct >= 0 && q.correct < 4);
}
const catalog = read('textbook-quiz.html');
const player = read('textbook-play.html');
const picker = read('textbook-topics.html');
for (const [name, html] of [['textbook-quiz.html', catalog], ['textbook-play.html', player], ['textbook-topics.html', picker]]) {
  const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)].map(m => m[1]).filter(Boolean);
  for (const script of scripts) new vm.Script(script, {filename:name});
}
assert.match(catalog, /u\\.topic_count/);
assert.match(catalog, /textbook-topics\\.html\\?class=/);
assert.match(picker, /textbook-play\\.html\\?/);
assert.match(picker, /args\\.set\\('topic',t\\.slug\\)/);
assert.match(player, /topicIds\\.has\\(q\\.id\\)/);
assert.match(player, /-topic-/);
assert.match(player, /Back to topics/);
assert.match(player, /TextbookQuality/);
console.log('TN topic-wise quiz: 12 bilingual topics, 133 unique questions, routes and inline JavaScript validated.');
