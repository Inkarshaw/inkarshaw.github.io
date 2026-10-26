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
  // 'expanded' signals that at least 18% of the bank still uses mechanical
  // prompts. A cleaned, direct-only bank need not keep triggering that flag.
  // 'expanded' is true only if the mechanical-stem share exceeds the
  // browser threshold. Units 4, 5 and 6 now have fully reviewed banks,
  // and Unit 7's completed 492/492 now falls below the expansion threshold.
  if(![4,5,6,7].includes(row.unit)){
    assert.ok(result.expanded,`Class 11 History Unit ${row.unit}: mechanical variants unexpectedly changed`);
  }else{
    assert.equal(result.expanded,false,`Reviewed Class 11 Unit ${row.unit} unexpectedly crossed the mechanical threshold`);
  }
  assert.equal(row.questions,result.questions.length,`Unit ${row.unit}: catalogue question total differs from playable count`);
  assert.equal(row.sets,Math.ceil(result.questions.length/20),`Unit ${row.unit}: catalogue contains broken quiz links`);
  if([4,5,6,7,8].includes(row.unit)){
    // Curated direct-only banks retain old source q.quiz labels (6/7 records).
    // The live player MUST route all catalogue links by 20-question position.
    const allIds=[];
    for(let n=1;n<=row.sets;n++){
      const expected=result.questions.slice((n-1)*20,n*20);
      const selected=quality.selectReviewedQuiz(data.meta,data.questions,result.questions,n);
      assert.ok(selected!==null,`Unit ${row.unit} quiz ${n}: reviewed routing not enabled`);
      assert.equal(selected.length,expected.length,`Unit ${row.unit} quiz ${n}: incorrect question count`);
      assert.deepEqual(Array.from(selected,q=>q.id),Array.from(expected,q=>q.id),
        `Unit ${row.unit} quiz ${n}: wrong question order or links`);
      allIds.push(...selected.map(q=>q.id));
    }
    assert.equal(allIds.length,result.questions.length,`Unit ${row.unit}: inaccessible questions`);
    assert.equal(new Set(allIds).size,result.questions.length,`Unit ${row.unit}: duplicated quiz records`);
    assert.equal(quality.selectReviewedQuiz(data.meta,data.questions,result.questions,row.sets+1).length,0,
      `Unit ${row.unit}: invalid quiz link must be empty`);
    const markedIncomplete=quality.selectReviewedQuiz({...data.meta,qa_reviewed_prefix:0},data.questions,result.questions,1);
    if(row.unit===8){
      assert.equal(data.questions.length,468,'Unit 8 distinct source count changed');
      assert.equal(data.meta.total_questions,468);
      assert.equal(data.meta.quiz_sets.length,24);
      assert.equal(data.meta.qa_reviewed_prefix,340);
      assert.equal(data.meta.qa_reviewed_quizzes,17);
      assert.equal(data.meta.source_records_before_editorial_curation,1404);
      assert.equal(data.meta.mechanically_generated_variants_removed,936);
      assert.equal(data.meta.positional_quiz_sets,true);
      assert.ok(data.questions.every(q=>q.type==='direct'),'Unit 8 generated variants resurfaced');
      assert.equal(result.questions[0].id,'C11H08-Q001');
      assert.equal(result.questions[99].id,'C11H08-Q298');
      assert.equal(result.questions.slice(460).length,8,'Unit 8 final quiz should hold eight records');
      for(const q of result.questions.slice(0,100)){
        assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' bilingual question');
        assert.equal(new Set(q.opts_en).size,4,q.id+' English choices');
        assert.equal(new Set(q.opts_ta).size,4,q.id+' Tamil choices');
        assert.ok(q.exp_en.length>=75&&q.exp_ta.length>=50,q.id+' explanations');
        assert.ok(!/correct textbook answer for/i.test(q.q_en),q.id+' template stem');
      }
    }
    if(row.unit===7){
    assert.equal(data.questions.length,492,'Unit 7 must retain all 492 unique source records');
    assert.equal(data.meta.total_questions,492);
    assert.equal(data.meta.quiz_sets.length,25);
    assert.equal(data.meta.source_records_before_editorial_curation,1476);
    assert.equal(data.meta.mechanically_generated_variants_removed,984);
    assert.equal(data.meta.qa_reviewed_prefix,492);
    assert.equal(data.meta.qa_reviewed_quizzes,25);
    assert.equal(data.meta.positional_quiz_sets,true);
    assert.ok(data.questions.every(q=>q.type==='direct'),'Unit 7 generated variants resurfaced');
    assert.equal(result.questions[0].id,'C11H07-Q001');
    assert.equal(result.questions[99].id,'C11H07-Q298');
    assert.equal(result.questions.slice(480).length,12,'Unit 7 final quiz should have 12 records');
    const allIds=[];
    for(let n=1;n<=row.sets;n++){
      const expected=result.questions.slice((n-1)*20,n*20);
      const selected=quality.selectReviewedQuiz(data.meta,data.questions,result.questions,n);
      assert.ok(selected!==null,'Unit 7 positional direct routing missing');
      assert.deepEqual(Array.from(selected,q=>q.id),Array.from(expected,q=>q.id),
        `Unit 7 quiz ${n}: broken positional catalogue link`);
      allIds.push(...selected.map(q=>q.id));
    }
    assert.equal(new Set(allIds).size,492,'Unit 7 unique links or records missing');
    assert.equal(allIds.length,492,'Unit 7 some questions unreachable');
    for(const q of result.questions.slice(200,300)){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' bilingual question mark');
      assert.equal(new Set(q.opts_en).size,4,q.id+' English options');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' Tamil options');
      assert.ok(q.exp_en.length>=75&&q.exp_ta.length>=50,q.id+' explanation');
      assert.ok(!/correct textbook answer for/i.test(q.q_en),q.id+' boilerplate question');
    }
    for(const q of result.questions.slice(0,100)){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' bilingual question mark');
      assert.equal(new Set(q.opts_en).size,4,q.id+' English options');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' Tamil options');
      assert.ok(q.exp_en.length>=75&&q.exp_ta.length>=50,q.id+' explanation');
      assert.ok(!/correct textbook answer for/i.test(q.q_en),q.id+' mechanical stem');
    }
  }
  if([6,7,8].includes(row.unit)){
      assert.equal(markedIncomplete.length,20,'Explicit positional Unit 6 routing must persist across editorial batches');
    }else{
      assert.equal(markedIncomplete,null,'Fully reviewed banks without positional opt-in require complete markers');
    }
  }
  if(row.unit===6){
    assert.equal(data.questions.length,276,'Unit 6 must preserve 276 distinct source questions');
    assert.equal(data.meta.total_questions,276,'Unit 6 catalogue count differs');
    assert.equal(data.meta.quiz_sets.length,14,'Unit 6 must have 14 playable links');
    assert.equal(data.meta.source_records_before_editorial_curation,828);
    assert.equal(data.meta.mechanically_generated_variants_removed,552);
    assert.equal(data.meta.qa_reviewed_prefix,276,'Unit 6 full editorial review marker');
    assert.equal(data.meta.qa_reviewed_quizzes,14,'Unit 6 complete quiz review marker');
    assert.equal(result.questions.slice(260).length,16,'Unit 6 Quiz 14 must have sixteen questions');
    assert.equal(data.meta.positional_quiz_sets,true,'Unit 6 must keep curated quiz routing');
    assert.ok(data.questions.every(q=>q.type==='direct'),'Unit 6 generated variants resurfaced');
    assert.equal(result.questions[0].id,'C11H06-Q001');
    assert.equal(result.questions[99].id,'C11H06-Q298');
    for(const q of result.questions.slice(0,100)){
      assert.equal(q.opts_en.length,4,q.id+' missing choices');
      assert.equal(q.opts_ta.length,4,q.id+' missing Tamil choices');
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' incomplete question');
      assert.ok(q.exp_en.length>=75&&q.exp_ta.length>=50,q.id+' weak explanation');
    }
  }
  if(row.unit===5){
    assert.equal(data.questions.length,348,'Unit 5 must retain exactly 348 direct playable questions');
    assert.ok(data.questions.every(q=>q.type==='direct'),'Unit 5 generated variants resurfaced');
    assert.equal(data.meta.source_records_before_editorial_curation,1044);
    assert.equal(data.meta.generated_variants_removed,696);
    assert.equal(data.meta.qa_reviewed_prefix,348,'Unit 5 final editorial status regressed');
    assert.equal(data.meta.qa_reviewed_quizzes,18,'Unit 5 must mark all 18 quizzes reviewed');
    assert.equal(data.meta.total_questions,348);
    assert.equal(data.meta.quiz_sets.length,18);
    assert.equal(result.questions.length,348);
    assert.equal(result.questions[0].id,'C11H05-Q001');
    assert.equal(result.questions[99].id,'C11H05-Q298');
    const firstFive=result.questions.slice(0,100);
    assert.equal(firstFive.length,100);
    for(const q of firstFive){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' weak bilingual question');
      assert.ok(!/What is the correct textbook answer for:/i.test(q.q_en),q.id+' mechanical stem');
      assert.equal(new Set(q.opts_en).size,4,q.id+' repeated English option');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' repeated Tamil option');
      assert.ok(q.exp_en.length>=75&&q.exp_ta.length>=50,q.id+' weak bilingual explanation');
    }
  }
  total+=result.questions.length;
  if(row.unit===1){
    assert.equal(data.questions.length,265,'Unit 1 should retain 265 quality-filtered direct source records');
    assert.ok(data.questions.every(x=>x.type==='direct'),'Generated associations or statement variants resurfaced');
    assert.equal(data.meta.duplicated_association_and_generated_statement_variants_removed,536);

    const first=result.questions[0];
    assert.match(first.q_en,/Which archaeological finds most directly indicate stone-tool manufacture/,'Opening question needs specific archaeological focus');
    assert.equal(first.opts_en[first.correct],'Chipped stone flakes and cores');
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
  if(row.unit===4){
    assert.equal(data.questions.length,394,'Unit 4 must retain 394 editorially distinct source questions');
    assert.equal(data.meta.quiz_sets.length,20,'Unit 4 metadata must show 20 playable sets');
    assert.equal(data.meta.total_questions,394,'Unit 4 metadata count differs from questions');
    assert.deepEqual(Object.values(data.meta.qa_answer_position_counts).reduce((a,b)=>a+b,0),394,
      'Metadata answer-position tally must match source records');
    assert.ok(data.questions.every(q=>q.type==='direct'),'Unit 4 autogenerated variants resurfaced');
    assert.equal(data.meta.duplicated_association_and_generated_statement_variants_removed,792);
    const first=result.questions.slice(0,20);
    assert.equal(first.length,20,'History Unit 4 first quiz must contain 20 questions');
    assert.equal(first[0].opts_en[first[0].correct],'6th–3rd centuries BCE');
    for(const q of first){
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),q.id+' still has mechanical wording');
      assert.ok(q.q_en.endsWith('?') && q.q_ta.endsWith('?'),q.id+' has incomplete bilingual stem');
      assert.equal(q.opts_en.length,4,q.id+' lacks four options');
      assert.equal(q.opts_ta.length,4,q.id+' lacks Tamil options');
      assert.equal(new Set(q.opts_en).size,4,q.id+' repeats distractors');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' repeats Tamil distractors');
      assert.ok(q.exp_en.length>95 && q.exp_ta.length>65,q.id+' lacks useful bilingual explanation');
    }
  }
  if(row.unit===4){
    assert.equal(data.meta.duplicated_or_low_value_direct_records_removed,2);
    const second=result.questions.slice(20,40);
    assert.equal(second.length,20,'History Unit 4 Quiz 2 must contain 20 questions');
    assert.ok(!data.questions.some(q=>q.id==='C11H04-Q118'),
      'Repeated Bimbisara identification must stay removed');
    assert.equal(second.at(-1).id,'C11H04-Q121',
      'Quiz 2 must end with the next distinct state-expansion concept');
    for(const q of second){
      assert.ok(q.q_en?.endsWith('?')&&q.q_ta?.endsWith('?'),q.id+' has a weak bilingual stem');
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),q.id+' has a template stem');
      assert.equal(q.opts_en.length,4,q.id+' has incomplete English options');
      assert.equal(q.opts_ta.length,4,q.id+' has incomplete Tamil options');
      assert.equal(new Set(q.opts_en).size,4,q.id+' repeats English options');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' repeats Tamil options');
      assert.ok(q.opts_ta[q.correct],q.id+' has missing Tamil keyed answer');
      assert.ok(q.exp_en.length>=65&&q.exp_ta.length>=50,q.id+' has weak explanation');
    }
    assert.equal(second.find(q=>q.id==='C11H04-Q070').opts_en[
      second.find(q=>q.id==='C11H04-Q070').correct
    ],'1915','Maski inscription discovery date drift');
  }
  if(row.unit===4){
    assert.equal(data.meta.duplicated_or_low_value_direct_records_removed,2);
    assert.ok(!data.questions.some(q=>q.id==='C11H04-Q145'),
      'Repeated Ajatashatru succession question must stay removed');
    const third=result.questions.slice(40,60);
    assert.equal(third.length,20,'History Unit 4 Quiz 3 must contain 20 questions');
    assert.equal(third[0].id,'C11H04-Q124','Unit 4 Quiz 3 start changed');
    assert.equal(third[19].id,'C11H04-Q184','Quiz 3 needs next distinct Nanda question');
    const specific={
      'C11H04-Q124':'Prasenajit',
      'C11H04-Q130':'Lichchhavis',
      'C11H04-Q148':'He imprisoned and caused the death of his father Bimbisara',
      'C11H04-Q166':'461 BCE',
      'C11H04-Q175':'Nagadasaka',
      'C11H04-Q184':'Mahapadma Nanda'
    };
    for(const q of third){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' lacks interrogative bilingual stems');
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),q.id+' has a machine-generated stem');
      assert.equal(q.opts_en.length,4,q.id+' has incorrect English option count');
      assert.equal(q.opts_ta.length,4,q.id+' has incorrect Tamil option count');
      assert.equal(new Set(q.opts_en).size,4,q.id+' repeats English answer options');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' repeats Tamil answer options');
      assert.ok(q.exp_en.length>=80&&q.exp_ta.length>=45,q.id+' needs a bilingual explanation');
      assert.ok(q.opts_ta[q.correct]?.length>0,q.id+' has an unmatched Tamil answer');
      if(specific[q.id]) assert.equal(q.opts_en[q.correct],specific[q.id],q.id+' answer key drifted');
    }
    const traditions=third.find(q=>q.id==='C11H04-Q148');
    assert.match(traditions.q_en,/According to Buddhist narratives/,'Accession tradition must be attributed');
    assert.match(traditions.exp_en,/Jain versions/,'Contested historical accounts must be qualified');
    assert.match(third.find(q=>q.id==='C11H04-Q157').exp_en,/narrower claim/,'Avoid categorical Kosala annexation claim');
  }
  if(row.unit===4){
    const fourth=result.questions.slice(60,80);
    assert.equal(fourth.length,20,'History Unit 4 Quiz 4 must have 20 playable questions');
    assert.equal(fourth[0].id,'C11H04-Q187','Quiz 4 starts at the wrong source concept');
    assert.equal(fourth.at(-1).id,'C11H04-Q244','Quiz 4 must end at the Gandara inscription fact');
    const expectedAnswers={
      'C11H04-Q187':'362 BCE',
      'C11H04-Q190':'Dhana Nanda',
      'C11H04-Q202':'Hathigumpha inscription',
      'C11H04-Q223':'Cyrus II',
      'C11H04-Q232':'Herodotus',
      'C11H04-Q235':'Seventh',
      'C11H04-Q238':'The Indians of the twentieth district',
      'C11H04-Q241':'Darius I',
      'C11H04-Q244':'Gadāra'
    };
    const stems=new Set();
    for(const q of fourth){
      assert.ok(q.q_en?.endsWith('?')&&q.q_ta?.endsWith('?'),q.id+' lacks complete bilingual stems');
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),q.id+' has mechanical wording');
      assert.equal(q.opts_en.length,4,q.id+' lacks four English options');
      assert.equal(q.opts_ta.length,4,q.id+' lacks four Tamil options');
      assert.equal(new Set(q.opts_en).size,4,q.id+' repeats English options');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' repeats Tamil options');
      assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3,q.id+' answer index invalid');
      assert.ok(q.opts_ta[q.correct]?.trim(),q.id+' Tamil correct answer missing');
      assert.ok(q.exp_en.length>=85&&q.exp_ta.length>=50,q.id+' has thin explanations');
      assert.ok(!stems.has(q.q_en),q.id+' duplicates a quiz stem');
      stems.add(q.q_en);
      if(expectedAnswers[q.id])assert.equal(q.opts_en[q.correct],expectedAnswers[q.id],q.id+' historical key changed');
    }
    assert.match(fourth.find(q=>q.id==='C11H04-Q235').exp_en,/twentieth district.*Indians/i,
      'Gandarans seventh vs Indians twentieth distinction must survive');
    assert.match(fourth.find(q=>q.id==='C11H04-Q226').exp_en,/debated/i,
      'Cyrus campaign date should not be represented as indisputable');
  }
  if(row.unit===4){
    const fifth=result.questions.slice(80,100);
    assert.equal(fifth.length,20,'History Unit 4 Quiz 5 must contain 20 questions');
    assert.equal(fifth[0].id,'C11H04-Q247','Quiz 5 start source changed');
    assert.equal(fifth.at(-1).id,'C11H04-Q304','Quiz 5 end source changed');
    const expectedAnswers={
      'C11H04-Q247':'Harauvatiš',
      'C11H04-Q250':'Maka',
      'C11H04-Q262':'Sir Mortimer Wheeler',
      'C11H04-Q265':'Panini',
      'C11H04-Q268':'Eight',
      'C11H04-Q274':'Kharosthi',
      'C11H04-Q280':'Right to left',
      'C11H04-Q283':'Silver siglos (sigloi)',
      'C11H04-Q286':'Twenty',
      'C11H04-Q292':'Lipi',
      'C11H04-Q295':'Dipi',
      'C11H04-Q301':'Lion capital of Sarnath'
    };
    for(const q of fifth){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' question phrasing is incomplete');
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),q.id+' has boilerplate wording');
      assert.equal(q.opts_en.length,4,q.id+' missing English distractors');
      assert.equal(q.opts_ta.length,4,q.id+' missing Tamil distractors');
      assert.equal(new Set(q.opts_en).size,4,q.id+' duplicate English distractors');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' duplicate Tamil distractors');
      assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,q.id+' invalid key');
      assert.ok(q.opts_ta[q.correct]?.trim(),q.id+' missing Tamil answer');
      assert.ok(q.exp_en.length>=95 && q.exp_ta.length>=55,q.id+' explanation is insufficient');
      if(expectedAnswers[q.id])assert.equal(q.opts_en[q.correct],expectedAnswers[q.id],
        q.id+' historical answer drift');
    }
    assert.match(fifth.find(q=>q.id==='C11H04-Q262').exp_en,/1913 and 1934/,
      'John Marshall versus Mortimer Wheeler excavation chronology needs retaining');
    assert.match(fifth.find(q=>q.id==='C11H04-Q286').exp_en,/twenty silver sigloi/,
      'Achaemenid daric/siglos conversion needs retaining');
  }
  if(row.unit===4){
    const sixth=result.questions.slice(100,120);
    assert.equal(sixth.length,20,'Unit 4 Quiz 6 must have 20 questions');
    assert.equal(sixth[0].id,'C11H04-Q307','Quiz 6 opening source changed');
    assert.equal(sixth.at(-1).id,'C11H04-Q364','Quiz 6 final source changed');
    const answers={
      'C11H04-Q307':'Pillared hall remains at Kumrahar',
      'C11H04-Q310':'Avesta',
      'C11H04-Q313':'Thomas Burrow',
      'C11H04-Q316':'Bogazkoy Hittite–Mitanni treaty',
      'C11H04-Q319':'14th century BCE (about 1380 BCE)',
      'C11H04-Q322':'It invokes names resembling Vedic deities outside South Asia',
      'C11H04-Q325':'Varuna',
      'C11H04-Q328':'Mitra',
      'C11H04-Q331':'The Ashvins (Nasatyas)',
      'C11H04-Q334':'327–325 BCE',
      'C11H04-Q337':'Dhana Nanda',
      'C11H04-Q343':'Long campaigning, exhaustion and concern about further major resistance',
      'C11H04-Q346':'Darius I',
      'C11H04-Q349':'Hinduš',
      'C11H04-Q352':'Indos (Indus)',
      'C11H04-Q355':'326 BCE',
      'C11H04-Q358':'Ambhi',
      'C11H04-Q361':'Porus',
      'C11H04-Q364':'Battle of the Hydaspes'
    };
    const seen=new Set();
    for(const q of sixth){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' requires bilingual interrogative stem');
      assert.ok(!/^(What is the correct textbook answer for:|According to Unit 4, what is the correct textbook answer for:)/i.test(q.q_en),q.id+' still has boilerplate');
      assert.equal(q.opts_en.length,4,q.id+' missing English distractors');
      assert.equal(q.opts_ta.length,4,q.id+' missing Tamil distractors');
      assert.equal(new Set(q.opts_en).size,4,q.id+' duplicate English distractors');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' duplicate Tamil distractors');
      assert.ok(q.exp_en?.length>=95&&q.exp_ta?.length>=65,q.id+' needs explanatory bilingual feedback');
      assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3,q.id+' invalid answer key');
      assert.ok(q.opts_ta[q.correct],q.id+' lacks correct Tamil answer');
      assert.ok(!seen.has(q.q_en),q.id+' duplicates another quiz stem');
      seen.add(q.q_en);
      if(answers[q.id])assert.equal(q.opts_en[q.correct],answers[q.id],q.id+' answer key has changed');
    }
    assert.match(sixth.find(q=>q.id==='C11H04-Q361').exp_en,/Jhelum and Chenab/,'Porus geography correction disappeared');
    assert.match(sixth.find(q=>q.id==='C11H04-Q352').exp_en,/more accurate.*Indu/i,'Sindhu to Greek etymology caution disappeared');
    assert.match(sixth.find(q=>q.id==='C11H04-Q343').exp_en,/not the sole verified cause/,'Hyphasis reasons must be nuanced');
  }
  if(row.unit===4){
    const seventh=result.questions.slice(120,140);
    assert.equal(seventh.length,20,'Unit 4 Quiz 7 must have 20 playable questions');
    assert.equal(seventh[0].id,'C11H04-Q367','Quiz 7 opening ID changed');
    assert.equal(seventh.at(-1).id,'C11H04-Q424','Quiz 7 final ID changed');
    const expected={
      'C11H04-Q370':'Babylon',
      'C11H04-Q379':'Alexandria on the Caucasus',
      'C11H04-Q382':'Boukephala (Bucephala)',
      'C11H04-Q385':'The lower Indus and Sindh region',
      'C11H04-Q394':'Chandragupta Maurya',
      'C11H04-Q403':'Sandrokottos (Sandrocottus)',
      'C11H04-Q406':'It connects Indian dynastic history with dated Hellenistic events',
      'C11H04-Q409':'321 BCE',
      'C11H04-Q418':'Seleucus I Nicator',
      'C11H04-Q421':'305–303 BCE',
      'C11H04-Q424':'An agreement involved eastern territories and the transfer of war elephants to Seleucus'
    };
    const stems=new Set();
    for(const q of seventh){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' needs complete bilingual stems');
      assert.ok(!/^(What is the correct textbook answer for:|According to Unit 4, what is the correct textbook answer for:)/i.test(q.q_en),q.id+' has mechanical boilerplate');
      assert.equal(q.opts_en.length,4,q.id+' lacks English options');
      assert.equal(q.opts_ta.length,4,q.id+' lacks Tamil options');
      assert.equal(new Set(q.opts_en).size,4,q.id+' has repeated English distractors');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' has repeated Tamil distractors');
      assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3,q.id+' has invalid answer index');
      assert.ok(q.opts_ta[q.correct],q.id+' has no Tamil keyed answer');
      assert.ok(q.exp_en.length>=95&&q.exp_ta.length>=65,q.id+' needs more informative explanations');
      assert.ok(!stems.has(q.q_en),q.id+' duplicates a question stem');
      stems.add(q.q_en);
      if(expected[q.id])assert.equal(q.opts_en[q.correct],expected[q.id],q.id+' key drifted');
    }
    assert.match(seventh.find(q=>q.id==='C11H04-Q382').exp_en,/not near Peshawar/i,
      'Corrected Boukephala geography disappeared');
    assert.match(seventh.find(q=>q.id==='C11H04-Q421').exp_en,/about 305–303 BCE/,
      'Seleucid chronological precision disappeared');
    assert.match(seventh.find(q=>q.id==='C11H04-Q400').exp_en,/not independently verified/i,
      'Chandragupta residence should not be asserted as certain');
  }
  if(row.unit===4){
    const eighth=result.questions.slice(140,160);
    assert.equal(eighth.length,20,'History Unit 4 Quiz 8 must have 20 playable questions');
    assert.equal(eighth[0].id,'C11H04-Q427','Quiz 8 opening ID changed');
    assert.equal(eighth.at(-1).id,'C11H04-Q484','Quiz 8 final ID changed');
    const correctKeys={
      'C11H04-Q427':'500',
      'C11H04-Q430':'Megasthenes',
      'C11H04-Q433':'Indica',
      'C11H04-Q436':'The complete original text is lost',
      'C11H04-Q439':'Strabo, Arrian and Diodorus',
      'C11H04-Q445':'Kautilya',
      'C11H04-Q448':'Vishnugupta',
      'C11H04-Q451':'Arthashastra',
      'C11H04-Q454':"Winning the former Nanda minister Rakshasa to Chandragupta's side",
      'C11H04-Q457':'Bindusara',
      'C11H04-Q460':'297 BCE',
      'C11H04-Q463':"Bindusara's succession is accepted, but details of the handover are not securely documented",
      'C11H04-Q469':'Chandragiri',
      'C11H04-Q472':'Karnataka',
      'C11H04-Q475':'Diplomatic contacts with Hellenistic rulers in western Asia',
      'C11H04-Q481':'25 years',
      'C11H04-Q484':'272 BCE'
    };
    const seen=new Set();
    for(const q of eighth){
      assert.ok(q.q_en?.endsWith('?')&&q.q_ta?.endsWith('?'),q.id+' incomplete bilingual question');
      assert.ok(!/^(What is the correct textbook answer for:|According to Unit 4, what is the correct textbook answer for:)/i.test(q.q_en),q.id+' still uses generated boilerplate');
      assert.equal(q.opts_en.length,4,q.id+' English options missing');
      assert.equal(q.opts_ta.length,4,q.id+' Tamil options missing');
      assert.equal(new Set(q.opts_en).size,4,q.id+' repeated English alternatives');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' repeated Tamil alternatives');
      assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,q.id+' invalid answer index');
      assert.ok(q.opts_ta[q.correct],q.id+' missing Tamil keyed option');
      assert.ok(q.exp_en.length>=85&&q.exp_ta.length>=55,q.id+' weak bilingual explanations');
      assert.ok(!seen.has(q.q_en),q.id+' duplicated stem');
      seen.add(q.q_en);
      if(correctKeys[q.id])assert.equal(q.opts_en[q.correct],correctKeys[q.id],q.id+' answer drift');
    }
    assert.match(eighth.find(q=>q.id==='C11H04-Q463').exp_en,/peaceful and natural/,
      'Bindusara succession must not be described as proven peaceful');
    assert.match(eighth.find(q=>q.id==='C11H04-Q445').exp_en,/complex editorial history/,
      'Arthashastra single-author certainty must be qualified');
    assert.match(eighth.find(q=>q.id==='C11H04-Q466').exp_en,/not fully verified/,
      'Chandragupta Jain renunciation must be presented as later tradition');
    assert.match(eighth.find(q=>q.id==='C11H04-Q484').exp_en,/273 BCE/,
      'Distinguish textbook chronology from modern alternative chronology');
  }
  if(row.unit===4){
    assert.equal(data.meta.qa_reviewed_prefix,394,'Unit 4 reviewed source prefix changed');
    assert.equal(data.meta.qa_reviewed_quizzes,20,'Unit 4 editorial quiz marker changed');
    const hundred=result.questions.slice(160,260);
    assert.equal(hundred.length,100,'History Unit 4 batch must contain 100 playable questions');
    assert.equal(hundred[0].id,'C11H04-Q487');
    assert.equal(hundred.at(-1).id,'C11H04-Q784');
    const keyed={
      'C11H04-Q487':'268 BCE',
      'C11H04-Q511':'The Kalinga campaign',
      'C11H04-Q526':'Categories and repeated copies are counted differently',
      'C11H04-Q529':'14',
      'C11H04-Q532':'2',
      'C11H04-Q535':'7',
      'C11H04-Q565':'Brahmi',
      'C11H04-Q574':'Kharosthi',
      'C11H04-Q601':'250 BCE',
      'C11H04-Q616':'Mahinda',
      'C11H04-Q619':'Sanghamitta',
      'C11H04-Q631':'It controlled much of the subcontinent, but not every southern kingdom',
      'C11H04-Q652':'48,000 panas',
      'C11H04-Q661':'Prescriptive text',
      'C11H04-Q682':'Suvarnagiri',
      'C11H04-Q697':'Samaharta',
      'C11H04-Q703':'Sannidhata (treasurer)',
      'C11H04-Q724':'One-sixth',
      'C11H04-Q727':'About one-fourth',
      'C11H04-Q763':'Dharmasthiya',
      'C11H04-Q766':'Kantakasodhana',
      'C11H04-Q772':'Amatyas'
    };
    for(const q of hundred){
      assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' incomplete bilingual stem');
      assert.ok(!/What is the correct textbook answer for:/i.test(q.q_en),q.id+' boilerplate stem');
      assert.equal(q.opts_en.length,4,q.id+' missing options');
      assert.equal(q.opts_ta.length,4,q.id+' missing Tamil alternatives');
      assert.equal(new Set(q.opts_en).size,4,q.id+' duplicate options');
      assert.equal(new Set(q.opts_ta).size,4,q.id+' duplicate Tamil options');
      assert.ok(q.exp_en.length>=75&&q.exp_ta.length>=50,q.id+' explanation too short');
      assert.ok(q.opts_ta[q.correct],q.id+' missing keyed Tamil answer');
      if(keyed[q.id])assert.equal(q.opts_en[q.correct],keyed[q.id],q.id+' keyed historical concept changed');
    }
    assert.match(hundred.find(q=>q.id==='C11H04-Q520').exp_en,/not established/,
      'Do not imply an independently established date of Ashoka conversion');
    assert.match(hundred.find(q=>q.id==='C11H04-Q601').exp_en,/later Buddhist chronicles/,
      'Third Buddhist Council must be attributed to Buddhist tradition');
  }
  if(row.unit===1){
    assert.equal(data.meta.duplicated_or_ambiguous_direct_records_removed,3);
    const second=result.questions.slice(20,40);
    assert.equal(second.length,20,'History Unit 1 quiz 2 must have 20 items');
    const prohibited=new Set(['C11H01-Q088','C11H01-Q091','C11H01-Q124']);
    for(const q of second){
      assert.ok(!prohibited.has(q.id),'Ambiguous or duplicate History question resurfaced');
      assert.ok(!/^What is the correct textbook answer for:/i.test(q.q_en),'Mechanical History stem '+q.id);
      assert.ok(q.q_en.endsWith('?') && q.q_ta.endsWith('?'),'Bilingual stem incomplete: '+q.id);
      assert.equal(q.opts_ta.length,4,'Bilingual options missing: '+q.id);
      assert.equal(new Set(q.opts_en).size,4,'English distractor repeats: '+q.id);
      assert.equal(new Set(q.opts_ta).size,4,'Tamil distractor repeats: '+q.id);
      assert.ok(q.exp_en.length>95 && q.exp_ta.length>50,'Weak explanation: '+q.id);
    }
  }
  if(row.unit===2){
    const opening=result.questions.slice(0,20);
    assert.equal(opening.length,20,'Class 11 History Unit 2 must offer a full first quiz');
    const ids=[
      'C11H02-Q001','C11H02-Q004','C11H02-Q007','C11H02-Q010','C11H02-Q013',
      'C11H02-Q016','C11H02-Q019','C11H02-Q022','C11H02-Q025','C11H02-Q028',
      'C11H02-Q031','C11H02-Q034','C11H02-Q037','C11H02-Q040','C11H02-Q043',
      'C11H02-Q046','C11H02-Q049','C11H02-Q052','C11H02-Q055','C11H02-Q058'
    ];
    assert.deepEqual(Array.from(opening,q=>q.id),ids,'Reviewed Unit 2 quiz order unexpectedly changed');
    const stems=new Set();
    for(const q of opening){
      assert.ok(!/^(What is the correct textbook answer for:|Which option is correctly associated with:)/i.test(q.q_en),
        `History Unit 2 still contains a mechanical stem: ${q.id}`);
      assert.ok(q.q_en.trim().endsWith('?'),`Question needs clear interrogative wording: ${q.id}`);
      assert.ok(q.exp_en?.length>65&&q.exp_ta?.length>35,
        `Explanation needs bilingual editorial review: ${q.id}`);
      assert.ok(q.opts_ta?.length===4&&new Set(q.opts_ta).size===4,
        `Tamil distractors are missing or repeated: ${q.id}`);
      assert.equal(new Set(q.opts_en).size,4,`English distractors repeat: ${q.id}`);
      assert.ok(q.opts_en[q.correct]&&q.opts_ta[q.correct],
        `Correct option is not aligned across languages: ${q.id}`);
      assert.ok(!stems.has(q.q_en),`Duplicated stem in opening quiz: ${q.id}`);
      stems.add(q.q_en);
    }
    assert.ok(opening[0].opts_en.every(x=>/BCE|CE/.test(x)),
      'Unit 2 date question mixes a period with unrelated facts');
    assert.equal(opening[0].opts_en[opening[0].correct],'c. 2000–600 BCE');
    assert.equal(opening.find(q=>q.id==='C11H02-Q025').opts_en[
      opening.find(q=>q.id==='C11H02-Q025').correct
    ],'Rig Veda');
  }
  if(row.unit===3){
    const opening=result.questions.slice(0,20);
    assert.equal(opening.length,20,'History Unit 3 must provide 20 playable questions');
    const expected=[
      ['C11H03-Q001','About 1000 BCE',33],
      ['C11H03-Q004','Iron technology',33],
      ['C11H03-Q007','Iron ploughshares',33],
      ['C11H03-Q010','Urbanisation',33],
      ['C11H03-Q013','Buddhism',33],
      ['C11H03-Q016','Jainism',33],
      ['C11H03-Q019','Mahabharata',33],
      ['C11H03-Q022','Ramayana',33],
      ['C11H03-Q025','Tripitakas',33],
      ['C11H03-Q028','Jatakas',33],
      ['C11H03-Q031','Arrian',33],
      ['C11H03-Q034','D. D. Kosambi',33],
      ['C11H03-Q037','R. S. Sharma',33],
      ['C11H03-Q040','Makkhan Lal',33],
      ['C11H03-Q043','A. Ghosh and Niharranjan Ray',33],
      ['C11H03-Q046','Wet rice cultivation',34],
      ['C11H03-Q049','Agrarian surplus',34],
      ['C11H03-Q052','Growth of crafts',34],
      ['C11H03-Q055','Vibrant trade',34],
      ['C11H03-Q058','Second urbanisation',34],
    ];
    const stems=new Set();
    for(const [i,q] of opening.entries()){
      const [id,answer,page]=expected[i];
      assert.equal(q.id,id,`History Unit 3 question order changed at ${i+1}`);
      assert.equal(q.opts_en[q.correct],answer,`Unit 3 answer key drift: ${id}`);
      assert.equal(q.page_en,page,`Unit 3 source page changed: ${id}`);
      assert.ok(q.q_en?.trim().endsWith('?')&&q.q_ta?.trim().endsWith('?'),
        `Unit 3 bilingual question stem incomplete: ${id}`);
      assert.ok(!/^(What is the correct textbook answer for:|Which option is correctly associated with:)/i.test(q.q_en),
        `Unit 3 boilerplate returned: ${id}`);
      assert.ok(q.exp_en?.length>85&&q.exp_ta?.length>65,
        `Unit 3 English/Tamil explanation too weak: ${id}`);
      assert.ok(q.opts_en.length===4&&q.opts_ta?.length===4,
        `Unit 3 bilingual options missing: ${id}`);
      assert.equal(new Set(q.opts_en).size,4,`Unit 3 repeated English option: ${id}`);
      assert.equal(new Set(q.opts_ta).size,4,`Unit 3 repeated Tamil option: ${id}`);
      assert.ok(q.opts_ta[q.correct]?.trim(),`Unit 3 Tamil answer missing: ${id}`);
      assert.ok(!stems.has(q.q_en),`Unit 3 duplicate stem: ${id}`);
      stems.add(q.q_en);
    }
    const ironViews=opening.filter(q=>['C11H03-Q034','C11H03-Q037','C11H03-Q040','C11H03-Q043'].includes(q.id));
    assert.equal(ironViews.length,4,'Unit 3 historian comparisons incomplete');
    assert.ok(ironViews.every(q=>q.opts_en.every(x=>!/^[0-9]|technology|century/i.test(x))),
      'Unit 3 historian questions contain a date or unrelated technical option');
    const first=opening[0];
    assert.ok(first.opts_en.every(x=>/BCE/.test(x)),'Unit 3 opening chronology options are mixed types');
  }
}
console.log(`Class 11 catalogue verified: ${rows.length} units and ${total} playable curated questions.`);
