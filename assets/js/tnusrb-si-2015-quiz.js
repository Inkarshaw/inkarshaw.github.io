/* TNUSRB SI 2015 Open Quota — user-supplied bilingual OCR.
   133 readable: 116 provisional-keyed, 17 ungraded source review; 7 held for missing source.  */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const STORAGE='clearexams:tnusrb:si:2015:open:v1:';
  const LETTERS=['A','B','C','D'];
  let bank=null,questions=[],attempt=null,storeKey='',interval=null;
  const getSaved=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const save=()=>{if(attempt)try{localStorage.setItem(storeKey,JSON.stringify(attempt))}catch{}};
  function validate(data){
    if(data?.schemaVersion!==1||data?.year!==2015||data?.maxOriginalQuestions!==140||
       data?.providedQuestionCount!==140||!Array.isArray(data.questions)||data.questions.length!==140||
       !Array.isArray(data.blockedNumbers)||data.blockedNumbers.length!==7||
       data.ungradedReadableQuestionCount!==17||
       !Array.isArray(data.answerKey?.answers)||data.answerKey.answers.length!==140)
       throw Error('TNUSRB SI 2015 source manifest incomplete');
    for(let i=0;i<140;i++){
      const q=data.questions[i];
      if(q.number!==i+1||typeof q.question!=='string'||!q.options||
         q.answerKeyToken!==data.answerKey.answers[i]||
         !['blocked_source_incomplete','provisional_secondary_key','ungraded_source_dispute'].includes(q.scoringStatus))
        throw Error('Invalid source record Q'+(i+1));
      if(q.scoringStatus==='provisional_secondary_key'&&
         (!q.question.trim()||!LETTERS.includes(q.answerKeyToken)||
          !LETTERS.every(a=>typeof q.options[a]==='string'&&q.options[a].trim())))
        throw Error('Incomplete playable Q'+q.number);
      if(q.scoringStatus==='ungraded_source_dispute'&&
         (!q.question.trim()||!LETTERS.every(a=>typeof q.options[a]==='string'&&q.options[a].trim())||
          q.acceptedAnswers.length!==0||!q.scoringReviewReason||data.blockedNumbers.includes(q.number)))
        throw Error('Ungraded source-review record is incomplete Q'+q.number);
      if(q.scoringStatus==='blocked_source_incomplete'&&!data.blockedNumbers.includes(q.number))
        throw Error('Undisclosed incomplete Q'+q.number);
    }
    const reviewed=data.questions.filter(q=>q.secondaryBilingualSourceURL);
    if(data.bilingualNumberedReaderReview?.reviewedOriginalNumbers?.length!==10||
       reviewed.length!==10||reviewed.some(q=>q.number<11||q.number>20||
         !q.questionTamil?.trim()||!LETTERS.every(k=>q.optionsTamil?.[k]?.trim())||
         q.secondaryBilingualSourceURL!==data.bilingualNumberedReaderReview.sourceURL))
      throw Error('SI 2015 numbered Open Candidates bilingual-review manifest is inconsistent');
    const playable=data.questions.filter(q=>q.scoringStatus!=='blocked_source_incomplete');
    if(playable.length!==133||playable.length!==data.playableQuestionCount||
       playable.filter(q=>q.scoringStatus==='provisional_secondary_key').length!==116||
       playable.filter(q=>q.scoringStatus==='ungraded_source_dispute').length!==17||
       data.provisionallyScoreableQuestionCount!==116)
      throw Error('SI 2015 playback, graded and ungraded manifest totals disagree');
    return playable;
  }
  const storageKey=()=>STORAGE+$('mode').value;
  const validSaved=(s,mode)=>s&&s.version===1&&s.mode===mode&&!s.finished&&
    Array.isArray(s.answers)&&s.answers.length===questions.length&&s.answers.every(a=>a===null||LETTERS.includes(a))&&
    Array.isArray(s.checked)&&s.checked.length===questions.length&&s.checked.every(a=>typeof a==='boolean')&&
    Array.isArray(s.marked)&&s.marked.length===questions.length&&s.marked.every(a=>typeof a==='boolean')&&
    Number.isInteger(s.index)&&s.index>=0&&s.index<questions.length;
  function resumeSaved(mode){
    const saved=getSaved(storageKey());
    if(validSaved(saved,mode))return saved;
    // Preserve the old original-number position order for all historical sizes.
    // Never regenerate prior 109-item positions using today's score-status flags.
    const newlyReadable=new Set([21,27,34,45,60,73,80,90,92,93,95,120]);
    const earlierFigureRecovery=new Set([119,129]);
    const originalFigureRecovery=new Set([109]);
    const initialUngraded=new Set([8,14,29,30,33,65,66,84,127]);
    const old121=questions.map((q,i)=>newlyReadable.has(q.number)?-1:i).filter(i=>i>=0);
    const old119=old121.filter(i=>!earlierFigureRecovery.has(questions[i].number));
    const old118=old119.filter(i=>!originalFigureRecovery.has(questions[i].number));
    const old109=old118.filter(i=>!initialUngraded.has(questions[i].number));
    const map={121:old121,119:old119,118:old118,109:old109};
    const indices=map[saved?.answers?.length];
    if(!saved||!indices||saved.finished||saved.version!==1||saved.mode!==mode||
       saved.answers?.length!==indices.length||saved.checked?.length!==indices.length||
       saved.marked?.length!==indices.length||!Number.isInteger(saved.index)||
       saved.index<0||saved.index>=indices.length)return null;
    const restored={...saved,answers:Array(questions.length).fill(null),
      checked:Array(questions.length).fill(false),marked:Array(questions.length).fill(false),
      index:indices[saved.index]};
    indices.forEach((index,j)=>{restored.answers[index]=saved.answers[j];
      restored.checked[index]=saved.checked[j];restored.marked[index]=saved.marked[j]});
    return validSaved(restored,mode)?restored:null;
  }
  function updateStart(){
    if(!questions.length)return;
    const prior=resumeSaved($('mode').value);
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
    const mode=$('mode').value,prior=resumeSaved(mode);
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
    const scored=q.scoringStatus==='provisional_secondary_key';
    const choice=attempt.answers[attempt.index],right=scored&&q.acceptedAnswers.includes(choice);
    div.className=scored?(right?'':'issue'):'issue';
    const heading=document.createElement('strong');
    heading.textContent=scored?(right?'Correct per provisional key':'Incorrect per provisional key'):'Ungraded — source/key review needed';
    div.append(heading);
    const info=document.createElement('p');
    info.textContent=scored?'2015 secondary answer-table entry: '+q.answerKeyToken+'. Your answer: '+choice+'.':
      'Your choice: '+choice+'. This question is excluded from all score calculations because the secondary key is disputed or missing.';
    div.append(info);
    if(scored){
      const answer=document.createElement('p');
      answer.textContent='Provisional accepted choice: '+q.answerKeyToken+') '+q.options[q.answerKeyToken];
      div.append(answer);
    }else{
      const note=document.createElement('p');
      note.textContent=q.scoringReviewReason||q.sourceIssue||'Original booklet or final answer key needs review.';
      div.append(note);
    }
    const foot=document.createElement('p');
    foot.textContent=scored?
      'Unofficial secondary answer table. Original question and TNUSRB final key have not been independently fully verified.':
      'Do not infer an official correct answer from the disputed secondary answer table.';
    div.append(foot);
  }
  function render(scroll=false){
    if(!attempt||attempt.finished)return;
    const i=attempt.index,q=questions[i];
    $('position').textContent='Original Q'+q.number+' · '+(i+1)+' / '+questions.length;
    $('section').textContent=q.section+(q.scoringStatus==='ungraded_source_dispute'?' · Ungraded source review':'');
    $('status').textContent=answered()+' / '+questions.length+' answered · '+attempt.marked.filter(Boolean).length+' marked';
    $('progressFill').style.width=(100*answered()/questions.length).toFixed(1)+'%';
    $('progressBar').setAttribute('aria-valuemax',String(questions.length));
    $('progressBar').setAttribute('aria-valuenow',String(answered()));
    $('instruction').hidden=!q.instruction;
    $('instruction').textContent=q.instruction||'';
    $('passage').hidden=!q.passage;
    $('passage').textContent=q.passage||'';
    $('questionTitle').textContent=q.question;
    $('questionFigure').hidden=!q.figureAsset;
    $('questionFigure').src=q.figureAsset||'';
    $('questionFigure').alt=q.figureAlt||'';
    $('questionTamil').hidden=!q.questionTamil;
    $('questionTamil').textContent=q.questionTamil||'';
    $('sourceReader').hidden=!q.secondaryBilingualSourceURL;
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
        const tamil=document.createElement('span');
        tamil.lang='ta';tamil.className='choice-tamil';
        tamil.textContent=q.optionsTamil[letter];
        content.append(tamil);
      }
      b.append(l,content);
      if(locked&&q.scoringStatus==='provisional_secondary_key'&&q.acceptedAnswers.includes(letter))b.classList.add('right');
      if(locked&&q.scoringStatus==='provisional_secondary_key'&&attempt.answers[i]===letter&&!q.acceptedAnswers.includes(letter))b.classList.add('wrong');
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
    const scoreable=questions.filter(q=>q.scoringStatus==='provisional_secondary_key').length;
    const ungraded=questions.length-scoreable;
    const correct=questions.reduce((sum,q,i)=>sum+(q.scoringStatus==='provisional_secondary_key'&&q.acceptedAnswers.includes(attempt.answers[i])?1:0),0);
    const wrong=questions.reduce((sum,q,i)=>sum+(q.scoringStatus==='provisional_secondary_key'&&attempt.answers[i]&&!q.acceptedAnswers.includes(attempt.answers[i])?1:0),0);
    $('resultTitle').textContent=expired?'Time expired — submitted':'TNUSRB SI 2015 provisional result';
    $('score').textContent=(correct*0.5).toFixed(1)+' / '+(scoreable*0.5).toFixed(1)+' provisional marks';
    $('scoreDetails').textContent=correct+' provisionally correct · '+wrong+' provisionally incorrect · '+blank+' unanswered · '+
      ungraded+' readable questions ungraded · '+questions.length+' playable questions · 7 held for missing/incomplete sources. '+
      'The secondary answer table is not an officially confirmed TNUSRB key.';
    $('reviewFilter').value='all';renderReview();show('result');
  }
  function renderReview(){
    const filter=$('reviewFilter').value;
    $('reviewList').replaceChildren();
    for(let i=0;i<questions.length;i++){
      const q=questions[i],answer=attempt.answers[i];
      const scored=q.scoringStatus==='provisional_secondary_key';
      const right=scored&&q.acceptedAnswers.includes(answer);
      if(filter==='wrong'&&(!scored||!answer||right))continue;
      if(filter==='blank'&&answer)continue;
      if(filter==='marked'&&!attempt.marked[i])continue;
      if(filter==='ungraded'&&scored)continue;
      const details=document.createElement('details');details.className='result-item';
      const summary=document.createElement('summary');
      summary.textContent='Q'+q.number+' · '+q.question+' — '+(!scored?'Ungraded source/key issue':!answer?'Not answered':right?'Correct (provisional)':'Incorrect (provisional)');
      details.append(summary);
      const body=document.createElement('div');body.className='result-body';
      if(q.passage){const p=document.createElement('p');p.textContent=q.passage;body.append(p)}
      const response=document.createElement('p');
      response.textContent='Your choice: '+(answer||'not answered')+
        (scored?' · provisional answer-table entry: '+q.answerKeyToken:' · ungraded: secondary key disputed or missing');
      body.append(response);
      if(!scored){const issue=document.createElement('p');issue.textContent=q.scoringReviewReason||q.sourceIssue||'Source review pending';body.append(issue)}
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
  fetch('data/quizzes/tnusrb-si-2015-open.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Quiz JSON unavailable');return response.json()})
    .then(data=>{questions=validate(data);bank=data;
      const issues=$('sourceIssues');issues.replaceChildren();
      data.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').forEach(q=>{
        const li=document.createElement('li');li.textContent='Original Q'+q.number+': '+q.sourceIssue;
        issues.append(li);
      });
      const ungradedList=$('ungradedIssues');ungradedList.replaceChildren();
      data.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').forEach(q=>{
        const li=document.createElement('li');li.textContent='Original Q'+q.number+': '+q.scoringReviewReason;
        ungradedList.append(li);
      });
      const recoveredGraphText=$('graphRecovery');recoveredGraphText.replaceChildren();
      data.questions.filter(q=>q.graphSourceEvidence).forEach(q=>{
        const li=document.createElement('li');
        li.textContent='Q'+q.number+' — '+q.question+' Choices: '+LETTERS.map(k=>k+') '+q.options[k]).join('; ')+'. Graph missing; not gradeable.';
        recoveredGraphText.append(li);
      });
      $('loadStatus').textContent=questions.length+' readable original-numbered practice questions loaded: '+
        '10 indexed bilingual Tamil/English study items Q11–20, 116 provisionally scored, '+
        '17 source/key disputed or source-instruction ungraded, 7 incomplete or graph-dependent records held.';
      updateStart();
    })
    .catch(err=>{$('loadStatus').textContent='Quiz could not load: '+err.message;
      $('start').disabled=true;$('start').textContent='Quiz unavailable'});
})();