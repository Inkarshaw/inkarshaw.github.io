/* TNUSRB SI 2019 recruitment, held January 2020, booklet C — user-supplied OCR.
   Source texts are user-provided; Series C keys come from a TNUSRB-issued final key PDF copy,
   not an independently accessible official-host answer-key PDF. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const STORAGE='clearexams:tnusrb:si:2020:series-c:v1:';
  const LETTERS=['A','B','C','D'];
  let bank=null,questions=[],attempt=null,storeKey='',interval=null;
  const getSaved=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const save=()=>{if(attempt)try{localStorage.setItem(storeKey,JSON.stringify(attempt))}catch{}};
  function validate(data){
    if(data?.schemaVersion!==1||data?.year!==2020||data?.bookletSeries!=='C'||
      data?.originalQuestionCount!==140||data?.suppliedQuestionCount!==122||
      !Array.isArray(data.questions)||data.questions.length!==122||
      !Array.isArray(data.missingNumbers)||data.missingNumbers.length!==18||
      !Array.isArray(data.blockedNumbers)||data.blockedNumbers.length!==7||
      data.ungradedSourceDisputeCount!==1||
      data?.answerKey?.answers?.length!==140){
      throw Error('TNUSRB SI 2020 Series C question-bank manifest is incomplete');
    }
    let previous=0;
    for(const q of data.questions){
      if(!Number.isInteger(q.number)||q.number<=previous||q.number>140||
         typeof q.question!=='string'||!q.question.trim()||
         !q.options||!LETTERS.every(l=>typeof q.options[l]==='string'&&q.options[l].trim())||
         !/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/.test(q.answerKeyToken)||
         q.answerKeyToken!==data.answerKey.answers[q.number-1]||
         !['scored_with_final_key','ungraded_all_correct','ungraded_source_dispute','blocked_source_incomplete'].includes(q.scoringStatus))
          throw Error('Incomplete entry at original question '+q.number);
      if(q.answerKeyToken==='ALL'&&q.scoringStatus!=='ungraded_all_correct'&&q.scoringStatus!=='blocked_source_incomplete')throw Error('Special key status mismatch');
      if(q.scoringStatus==='ungraded_source_dispute'&&
         (q.number!==22||q.acceptedAnswers.length!==0||!q.answerReviewReason||data.blockedNumbers.includes(22)))
        throw Error('Disputed Q22 must not be graded or presented with an answer');
      previous=q.number;
    }
    const playable=data.questions.filter(q=>q.scoringStatus!=='blocked_source_incomplete');
    if(playable.length!==data.playableQuestionCount||playable.length!==115||
       playable.filter(q=>q.scoringStatus==='scored_with_final_key').length!==111||
       playable.filter(q=>q.scoringStatus==='ungraded_all_correct').length!==3||
       playable.filter(q=>q.scoringStatus==='ungraded_source_dispute').length!==1){
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
    // Keep responses from the previous 114-item order, keyed by original question number.
    const oldPositions=questions.map((q,i)=>q.number!==22?i:-1).filter(i=>i>=0);
    if(!saved||saved.finished||saved.version!==1||saved.mode!==mode||oldPositions.length!==114||
      !Array.isArray(saved.answers)||saved.answers.length!==114||
      !Array.isArray(saved.checked)||saved.checked.length!==114||
      !Array.isArray(saved.marked)||saved.marked.length!==114||
      !Number.isInteger(saved.index)||saved.index<0||saved.index>=114)return null;
    const restored={...saved,answers:Array(questions.length).fill(null),
      checked:Array(questions.length).fill(false),marked:Array(questions.length).fill(false),
      index:oldPositions[saved.index]};
    for(let j=0;j<oldPositions.length;j++){
      const k=oldPositions[j];
      restored.answers[k]=saved.answers[j];
      restored.checked[k]=saved.checked[j];
      restored.marked[k]=saved.marked[j];
    }
    return validSaved(restored,mode)?restored:null;
  }
  function updateStart(){
    if(!questions.length)return;
    const prior=migratedAttempt($('mode').value);
    $('start').textContent=(prior?'Resume':'Start')+' '+questions.length+'-question quiz →';
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
    if(prior)attempt=prior;
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
    div.hidden=!visible;if(!visible)return;
    const disputed=q.scoringStatus==='ungraded_source_dispute';
    const all=q.scoringStatus==='ungraded_all_correct';
    const graded=q.scoringStatus==='scored_with_final_key';
    const choice=attempt.answers[attempt.index],right=graded&&q.acceptedAnswers.includes(choice);
    div.className=graded?(right?'':'issue'):'issue';
    const heading=document.createElement('strong');
    heading.textContent=disputed?'Ungraded — printed choice/key conflict':
      all?'Final key: ALL · excluded from score':right?'Correct (published final key)':'Incorrect (published final key)';
    div.append(heading);
    const info=document.createElement('p');
    info.textContent=disputed?
      'Your answer: '+choice+'. No answer is marked right or wrong. '+q.answerReviewReason:
      all?'Published Series C final key records ALL; this source item is excluded from indicative scoring.':
      'Series C final-key entry: '+q.answerKeyToken+'. Your answer: '+choice+'.';
    div.append(info);
    if(graded){
      const accepted=document.createElement('p');
      accepted.textContent='Accepted: '+q.acceptedAnswers.map(letter=>letter+') '+q.options[letter]).join(' / ');
      div.append(accepted);
    }
    const foot=document.createElement('p');
    foot.textContent=disputed?
      'The printed source key entry is kept for provenance only. Verify the original Open Candidates booklet before grading.':
      'Answer mapping: the published TNUSRB final key for the 2019 General Candidates recruitment, Series C; user-supplied question OCR still needs visual source checks.';
    div.append(foot);
  }
  function render(scroll=false){
    if(!attempt||attempt.finished)return;
    const i=attempt.index,q=questions[i];
    $('position').textContent='Original Q'+q.number+' · '+(i+1)+' / '+questions.length;
    $('section').textContent=q.section+(q.scoringStatus==='ungraded_source_dispute'?' · Ungraded key review':'');
    $('status').textContent=answered()+' / '+questions.length+' answered · '+attempt.marked.filter(Boolean).length+' marked';
    $('progressFill').style.width=(100*answered()/questions.length).toFixed(1)+'%';
    $('progressBar').setAttribute('aria-valuemax',String(questions.length));
    $('progressBar').setAttribute('aria-valuenow',String(answered()));
    $('instruction').hidden=!q.instruction;
    $('instruction').textContent=q.instruction||'';
    $('passage').hidden=!q.passage;
    $('passage').textContent=q.passage||'';
    $('questionTitle').textContent=q.question;
    const locked=attempt.mode==='practice'&&attempt.checked[i];
    $('options').replaceChildren();
    for(const letter of LETTERS){
      const b=document.createElement('button');b.type='button';b.className='option';
      b.setAttribute('aria-pressed',String(attempt.answers[i]===letter));
      const l=document.createElement('b');l.textContent=letter;
      const content=document.createElement('span');content.textContent=q.options[letter];
      b.append(l,content);
      if(locked&&q.scoringStatus==='scored_with_final_key'&&q.acceptedAnswers.includes(letter))b.classList.add('right');
      if(locked&&q.scoringStatus==='scored_with_final_key'&&attempt.answers[i]===letter&&!q.acceptedAnswers.includes(letter))b.classList.add('wrong');
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
    const scored=questions.filter(q=>q.scoringStatus==='scored_with_final_key');
    const correct=questions.reduce((sum,q,i)=>sum+(q.scoringStatus==='scored_with_final_key'&&q.acceptedAnswers.includes(attempt.answers[i])?1:0),0);
    const wrong=questions.reduce((sum,q,i)=>sum+(q.scoringStatus==='scored_with_final_key'&&attempt.answers[i]&&!q.acceptedAnswers.includes(attempt.answers[i])?1:0),0);
    const allEntries=questions.filter(q=>q.scoringStatus==='ungraded_all_correct').length;
    const disputed=questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').length;
    $('resultTitle').textContent=expired?'Time expired — answers submitted':'TNUSRB SI 2020 Series C practice result';
    $('score').textContent=(correct*0.5).toFixed(1)+' / '+(scored.length*0.5).toFixed(1)+' marks';
    $('scoreDetails').textContent=correct+' correct · '+wrong+' incorrect · '+blank+' unanswered · '+
      allEntries+' ALL entries and '+disputed+' disputed-key question ungraded · '+questions.length+' readable questions. '+
      'Score excludes 18 absent source numbers and seven source-incomplete or missing-diagram items; not a full 140-question exam result.';
    $('reviewFilter').value='all';renderReview();show('result');
  }
  function renderReview(){
    const filter=$('reviewFilter').value;
    $('reviewList').replaceChildren();
    for(let i=0;i<questions.length;i++){
      const q=questions[i],answer=attempt.answers[i];
      const graded=q.scoringStatus==='scored_with_final_key';
      const all=q.scoringStatus==='ungraded_all_correct';
      const disputed=q.scoringStatus==='ungraded_source_dispute';
      const right=graded&&q.acceptedAnswers.includes(answer);
      if(filter==='wrong'&&(!graded||!answer||right))continue;
      if(filter==='blank'&&answer)continue;
      if(filter==='marked'&&!attempt.marked[i])continue;
      if(filter==='ungraded'&&graded)continue;
      const details=document.createElement('details');details.className='result-item';
      const summary=document.createElement('summary');
      summary.textContent='Q'+q.number+' · '+q.question+' — '+(disputed?'Key disputed / ungraded':
        all?'ALL / ungraded':!answer?'Not answered':right?'Correct':'Incorrect');
      details.append(summary);
      const body=document.createElement('div');body.className='result-body';
      if(q.passage){const context=document.createElement('p');context.textContent=q.passage;body.append(context)}
      const response=document.createElement('p');
      response.textContent='Your choice: '+(answer||'not answered')+
        (graded?' · TNUSRB Series C key: '+q.answerKeyToken:
         disputed?' · printed key disputed; no correct answer asserted':' · final-key special ALL entry');
      body.append(response);
      if(disputed){const note=document.createElement('p');note.textContent=q.answerReviewReason;body.append(note)}
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
  fetch('data/quizzes/tnusrb-si-2020-series-c.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Quiz JSON unavailable');return response.json()})
    .then(data=>{questions=validate(data);bank=data;
      const withheld=$('sourceGaps');withheld.replaceChildren();
      data.missingNumbers.forEach(n=>{const li=document.createElement('li');li.textContent='Q'+n+': source transcription not yet available';withheld.append(li)});
      data.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').forEach(q=>{
        const li=document.createElement('li');li.textContent='Q'+q.number+': '+q.sourceIssue;withheld.append(li);
      });
      $('loadStatus').textContent=questions.length+' readable original-numbered questions: 111 provisionally scored, '+
        '3 final-key ALL entries and Q22 key dispute ungraded; 7 blocked and 18 missing source positions.';
      updateStart();
    })
    .catch(err=>{$('loadStatus').textContent='Quiz could not load: '+err.message;
      $('start').disabled=true;$('start').textContent='Quiz unavailable'});
})();