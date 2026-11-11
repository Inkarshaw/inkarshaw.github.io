/* TNUSRB SI 2010 Open Candidates Type A — user-supplied partial PYQ.
   Source texts are user-provided; Type A keys derive from a published mirror,
   not an independently accessible official-host answer-key PDF. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const STORAGE='clearexams:tnusrb:si:2010:open-a:v1:';
  const LETTERS=['A','B','C','D'];
  let bank=null,questions=[],attempt=null,storeKey='',interval=null;
  const getSaved=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const save=()=>{if(attempt)try{localStorage.setItem(storeKey,JSON.stringify(attempt))}catch{}};
  function validate(data){
    if(data?.schemaVersion!==1||data?.year!==2010||data?.bookletType!=='A'||
      data?.originalPaperQuestionCount!==140||data?.providedQuestionCount!==140||
      !Array.isArray(data.questions)||data.questions.length!==140||
      !Array.isArray(data.missingNumbers)||data.missingNumbers.length!==0){
      throw Error('TNUSRB 2010 question-bank manifest is incomplete');
    }
    let previous=0;
    for(const q of data.questions){
      if(!Number.isInteger(q.number)||q.number<=previous||q.number>140||
         typeof q.question!=='string'||!q.question.trim()||
         !q.options||!LETTERS.every(l=>typeof q.options[l]==='string'&&q.options[l].trim())||
         !/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/.test(q.keyToken)||
         !['provisional_mirrored_final_key','ungraded_all_correct','blocked_source_incomplete'].includes(q.scoringStatus))
          throw Error('Incomplete entry at original question '+q.number);
      if(q.keyToken==='ALL'&&q.scoringStatus!=='ungraded_all_correct')throw Error('Special key status mismatch');
      previous=q.number;
    }
    const bilingual=data.questions.filter(q=>q.questionTamil&&q.optionsTamil);
    if(data.bilingualPubliclyReviewedCount!==10||bilingual.length!==10||
       bilingual.some(q=>q.number>10||!LETTERS.every(l=>q.optionsTamil[l]?.trim())||
         !q.secondaryBilingualSourceURL?.startsWith('https://civilserviceaspirants.in/')))
      throw Error('2010 Open Candidates secondary bilingual source review manifest changed');
    const playable=data.questions.filter(q=>q.scoringStatus!=='blocked_source_incomplete');
    if(playable.length!==data.availableForQuizCount||playable.length!==138||
       playable.filter(q=>q.scoringStatus==='provisional_mirrored_final_key').length!==134){
      throw Error('Source exclusions or scoring coverage changed unexpectedly');
    }
    return playable;
  }
  const storageKey=()=>STORAGE+$('mode').value;
  const validSaved=(s,mode)=>s&&s.version===1&&s.mode===mode&&!s.finished&&
    Array.isArray(s.answers)&&s.answers.length===questions.length&&s.answers.every(a=>a===null||LETTERS.includes(a))&&
    Array.isArray(s.checked)&&s.checked.length===questions.length&&s.checked.every(a=>typeof a==='boolean')&&
    Array.isArray(s.marked)&&s.marked.length===questions.length&&s.marked.every(a=>typeof a==='boolean')&&
    Number.isInteger(s.index)&&s.index>=0&&s.index<questions.length;
  function migratedAttempt(mode){
    const saved=getSaved(storageKey());
    if(validSaved(saved,mode))return saved;
    const recoveredNumbers=new Set([67,68,69,70,71,72,73,74,75,76,77,78,79,80,86,114,115,116]);
    const oldPositions=questions.map((q,i)=>recoveredNumbers.has(q.number)?-1:i).filter(i=>i>=0);
    if(!saved||saved.finished||saved.version!==1||saved.mode!==mode||
      oldPositions.length!==120||saved.answers?.length!==120||
      saved.checked?.length!==120||saved.marked?.length!==120||
      !Number.isInteger(saved.index)||saved.index<0||saved.index>=120)return null;
    const updated={...saved,answers:Array(questions.length).fill(null),
      checked:Array(questions.length).fill(false),marked:Array(questions.length).fill(false),
      index:oldPositions[saved.index]};
    oldPositions.forEach((index,j)=>{updated.answers[index]=saved.answers[j];
      updated.checked[index]=saved.checked[j];updated.marked[index]=saved.marked[j]});
    return validSaved(updated,mode)?updated:null;
  }
  function updateStart(){
    if(!questions.length)return;
    const prior=migratedAttempt($('mode').value);
    $('start').textContent=(validSaved(prior,$('mode').value)?'Resume':'Start')+' '+questions.length+'-question quiz →';
    $('start').disabled=false;
  }
  function show(view){
    $('setup').hidden=view!=='setup';
    $('quiz').hidden=view!=='quiz';
    $('result').hidden=view!=='result';
    window.scrollTo(0,0);
  }
  function clearTimer(){if(interval){clearInterval(interval);interval=null}}
  function tick(){
    if(!attempt||!attempt.deadline||attempt.finished||$('quiz').hidden){$('clock').hidden=true;return}
    const seconds=Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000));
    $('clock').hidden=false;
    $('clock').textContent='Time left: '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
    if(!seconds)finish(true);
  }
  function start(){
    if(!questions.length)return;
    storeKey=storageKey();
    const mode=$('mode').value,prior=migratedAttempt(mode);
    if(validSaved(prior,mode))attempt=prior;
    else {
      const minutes=Number($('timer').value);
      attempt={version:1,mode,answers:Array(questions.length).fill(null),
        checked:Array(questions.length).fill(false),marked:Array(questions.length).fill(false),
        index:0,startedAt:Date.now(),deadline:minutes?Date.now()+minutes*60000:null,finished:false};
      save();
    }
    clearTimer();
    show('quiz');
    render(true);tick();
    if(attempt.deadline)interval=setInterval(tick,1000);
  }
  function renderPalette(){
    const nav=$('palette');nav.replaceChildren();
    questions.forEach((q,i)=>{
      const b=document.createElement('button');
      b.type='button';b.textContent=q.number;
      b.className=(attempt.answers[i]?'done ':'')+(attempt.marked[i]?'flag ':'')+(attempt.index===i?'current':'');
      b.setAttribute('aria-label','Original question '+q.number+(attempt.answers[i]?' answered':''));
      b.addEventListener('click',()=>{attempt.index=i;render(true)});
      nav.append(b);
    });
  }
  const answered=()=>attempt.answers.filter(Boolean).length;
  function feedback(q){
    const div=$('feedback');div.replaceChildren();
    const visible=attempt.mode==='practice'&&attempt.checked[attempt.index];
    div.hidden=!visible;
    if(!visible)return;
    const choice=attempt.answers[attempt.index],special=q.keyToken==='ALL';
    const right=!special&&q.acceptedAnswers.includes(choice);
    div.className=special?'issue':'';
    const heading=document.createElement('strong');
    heading.textContent=special?'Special key: ALL CORRECT · ungraded':right?'Correct answer':'Incorrect answer';
    div.append(heading);
    const info=document.createElement('p');
    info.textContent=special?
      'The mirrored Type A final key lists “All Correct”; this item is not included in indicative marks.':
      'Type A final-key entry: '+q.keyToken+'. Your answer: '+choice+'.';
    div.append(info);
    if(!special){
      const p=document.createElement('p');
      p.textContent='Accepted: '+q.acceptedAnswers.map(letter=>letter+') '+q.options[letter]).join(' / ');
      div.append(p);
    }
    const foot=document.createElement('p');
    foot.textContent='Key from a publicly mirrored 2010 final-key copy, not directly verified on a TNUSRB-hosted file.';
    div.append(foot);
  }
  function render(scroll=false){
    if(!attempt||attempt.finished)return;
    const i=attempt.index,q=questions[i];
    $('position').textContent='Original Q'+q.number+' · '+(i+1)+' / '+questions.length;
    $('section').textContent=q.section;
    $('status').textContent=answered()+' / '+questions.length+' answered · '+attempt.marked.filter(Boolean).length+' marked';
    $('progressFill').style.width=(100*answered()/questions.length).toFixed(1)+'%';
    $('progressBar').setAttribute('aria-valuemax',String(questions.length));
    $('progressBar').setAttribute('aria-valuenow',String(answered()));
    $('instruction').hidden=!q.instruction;
    $('instruction').textContent=q.instruction||'';
    $('passage').hidden=!q.passage;
    $('passage').textContent=q.passage||'';
    $('questionTitle').textContent=q.question;
    $('questionTamil').hidden=!q.questionTamil;
    $('questionTamil').textContent=q.questionTamil||'';
    $('sourceReader').hidden=!q.questionTamil;
    const locked=attempt.mode==='practice'&&attempt.checked[i];
    $('options').replaceChildren();
    for(const letter of LETTERS){
      const b=document.createElement('button');b.type='button';b.className='option';
      b.setAttribute('aria-pressed',String(attempt.answers[i]===letter));
      const l=document.createElement('b');l.textContent=letter;
      const content=document.createElement('span');
      content.className=q.optionsTamil?'bilingual-choice':'';
      const english=document.createElement('span');english.textContent=q.options[letter];
      content.append(english);
      if(q.optionsTamil){
        const tamil=document.createElement('span');tamil.lang='ta';tamil.className='choice-tamil';
        tamil.textContent=q.optionsTamil[letter];
        content.append(tamil);
      }
      b.append(l,content);
      if(locked&&q.keyToken!=='ALL'&&q.acceptedAnswers.includes(letter))b.classList.add('right');
      if(locked&&q.keyToken!=='ALL'&&attempt.answers[i]===letter&&!q.acceptedAnswers.includes(letter))b.classList.add('wrong');
      b.disabled=locked;
      b.addEventListener('click',()=>{if(locked)return;attempt.answers[i]=letter;render()});
      $('options').append(b);
    }
    $('check').hidden=attempt.mode!=='practice'||locked;
    $('check').disabled=!attempt.answers[i];
    $('clear').disabled=!attempt.answers[i]||locked;
    $('mark').textContent=attempt.marked[i]?'⚑ Marked for review':'⚐ Mark for review';
    $('previous').disabled=i===0;$('next').disabled=i===questions.length-1;
    feedback(q);renderPalette();save();
    if(scroll)$('position').scrollIntoView({block:'start',behavior:'instant'});
  }
  function finish(expired=false){
    if(!attempt||attempt.finished)return;
    const blank=questions.length-answered();
    if(!expired&&blank&&!window.confirm(blank+' questions are unanswered. Submit and see results?'))return;
    attempt.finished=true;clearTimer();save();
    const scored=questions.filter(q=>q.scoringStatus==='provisional_mirrored_final_key');
    const correct=questions.reduce((sum,q,i)=>sum+(q.scoringStatus==='provisional_mirrored_final_key'&&q.acceptedAnswers.includes(attempt.answers[i])?1:0),0);
    const wrong=questions.reduce((sum,q,i)=>sum+(q.scoringStatus==='provisional_mirrored_final_key'&&attempt.answers[i]&&!q.acceptedAnswers.includes(attempt.answers[i])?1:0),0);
    const ungraded=questions.filter(q=>q.scoringStatus==='ungraded_all_correct').length;
    $('resultTitle').textContent=expired?'Time expired — answers submitted':'TNUSRB SI 2010 practice result';
    $('score').textContent=(correct*0.5).toFixed(1)+' / '+(scored.length*0.5).toFixed(1)+' marks';
    $('scoreDetails').textContent=correct+' correct · '+wrong+' incorrect · '+blank+' unanswered · '+
      ungraded+' All Correct entries ungraded · '+questions.length+' source-readable questions available. '+
      'Score excludes absent/garbled questions and does not represent the full 140-question examination.';
    $('reviewFilter').value='all';renderReview();show('result');
  }
  function renderReview(){
    const filter=$('reviewFilter').value;
    $('reviewList').replaceChildren();
    for(let i=0;i<questions.length;i++){
      const q=questions[i],answer=attempt.answers[i],special=q.keyToken==='ALL',
        right=!special&&q.acceptedAnswers.includes(answer);
      if(filter==='wrong'&&(!answer||special||right))continue;
      if(filter==='blank'&&answer)continue;
      if(filter==='marked'&&!attempt.marked[i])continue;
      if(filter==='ungraded'&&!special)continue;
      const details=document.createElement('details');details.className='result-item';
      const summary=document.createElement('summary');
      summary.textContent='Q'+q.number+' · '+q.question+' — '+(special?'ALL / ungraded':!answer?'Not answered':right?'Correct':'Incorrect');
      details.append(summary);
      const body=document.createElement('div');body.className='result-body';
      if(q.passage){const context=document.createElement('p');context.textContent=q.passage;body.append(context)}
      const response=document.createElement('p');response.textContent='Your choice: '+(answer||'not answered')+
        ' · mirrored final key: '+q.keyToken;body.append(response);
      for(const letter of LETTERS){
        const p=document.createElement('p');p.textContent=letter+') '+q.options[letter];body.append(p);
      }
      details.append(body);$('reviewList').append(details);
    }
    if(!$('reviewList').childElementCount)$('reviewList').textContent='No questions match this filter.';
  }
  $('mode').addEventListener('change',updateStart);
  $('start').addEventListener('click',start);
  $('check').addEventListener('click',()=>{
    const i=attempt.index;if(!attempt.answers[i]||attempt.checked[i]||attempt.mode!=='practice')return;
    attempt.checked[i]=true;render();
    $('feedback').scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  $('clear').addEventListener('click',()=>{
    if(attempt.mode==='practice'&&attempt.checked[attempt.index])return;
    attempt.answers[attempt.index]=null;render();
  });
  $('mark').addEventListener('click',()=>{attempt.marked[attempt.index]=!attempt.marked[attempt.index];render()});
  $('previous').addEventListener('click',()=>{if(attempt.index>0){attempt.index--;render(true)}});
  $('next').addEventListener('click',()=>{if(attempt.index<questions.length-1){attempt.index++;render(true)}});
  $('finish').addEventListener('click',()=>finish(false));
  $('reviewFilter').addEventListener('change',renderReview);
  $('resumeReview').addEventListener('click',()=>{$('reviewList').scrollIntoView({block:'start',behavior:'smooth'})});
  $('newAttempt').addEventListener('click',()=>{
    if(!window.confirm('Start over and replace your saved answers for this mode?'))return;
    try{localStorage.removeItem(storeKey)}catch{}
    attempt=null;show('setup');updateStart();
  });
  fetch('data/quizzes/tnusrb-si-2010-open-type-a.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Quiz JSON unavailable');return response.json()})
    .then(data=>{questions=validate(data);bank=data;
      const gapList=$('sourceGaps');gapList.replaceChildren();
      data.missingNumbers.forEach(n=>{
        const li=document.createElement('li');li.textContent='Original Q'+n+': open-candidates question text not recovered';
        gapList.append(li);
      });
      data.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').forEach(q=>{
        const li=document.createElement('li');li.textContent='Original Q'+q.number+': '+(q.sourceIssue||'Original math/figure review required');
        gapList.append(li);
      });
      $('loadStatus').textContent=questions.length+' readable Open Candidates questions loaded: '+
        '10 bilingual source-reviewed Q1–10, 134 provisional key scores, '+
        '4 ALL entries ungraded; all 17 missing numbers recovered, 2 source-blocked (Q64, Q106).';
      updateStart();
    })
    .catch(err=>{$('loadStatus').textContent='Quiz could not load: '+err.message;
      $('start').disabled=true;$('start').textContent='Quiz unavailable'});
})();