/* ClearExams: TNPSC Group IV 2024 source-attributed 200-question text quiz.
   Answers are mapped to the official Version A final key. Transcribed text
   remains editorial until individually source-page-checked. */
(() => {
  'use strict';
  const DATA='data/quizzes/tnpsc-g4-2024-text-quiz.json';
  const CACHE_PREFIX='clearexams:tnpsc:g4:2024:text200:v1:';
  const LETTERS=['A','B','C','D','E'];
  const $=id=>document.getElementById(id);
  const clean=value=>String(value??'').trim();
  let questions=[],bank=null,session=null,sessionKey='',handle=null;
  const setup=$('setup'),quiz=$('quiz'),results=$('results');
  function good(q,i){
    return q&&q.number===i+1&&clean(q.question)&&
      q.options&&LETTERS.every(letter=>clean(q.options[letter]))&&
      Number.isInteger(q.sourcePdfPage)&&q.sourcePdfPage>=3&&q.sourcePdfPage<=96&&
      (/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/).test(q.finalKeyToken)&&
      q.sourceTextStatus==='typed_transcription_unverified_against_scan';
  }
  function validate(data){
    if(!data||data.paperId!=='tnpsc-group-iv-2024-general-tamil-general-studies'||
       data.year!==2024||data.questionCount!==200||
       !Array.isArray(data.questions)||data.questions.length!==200||
       !data.questions.every(good))throw Error('The 200-question original-order text bank is incomplete or unverified in structure.');
    return data.questions;
  }
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function save(){if(session)write(sessionKey,session)}
  function key(){return CACHE_PREFIX+$('mode').value}
  function validSaved(s,mode){
    return s&&s.version===1&&s.mode===mode&&!s.finished&&
      Array.isArray(s.answers)&&s.answers.length===200&&s.answers.every(a=>a===null||LETTERS.includes(a))&&
      Array.isArray(s.checked)&&s.checked.length===200&&s.checked.every(BooleanValue=>typeof BooleanValue==='boolean')&&
      Array.isArray(s.marked)&&s.marked.length===200&&s.marked.every(BooleanValue=>typeof BooleanValue==='boolean')&&
      Number.isInteger(s.index)&&s.index>=0&&s.index<200;
  }
  function updateStart(){
    if(!questions.length){$('startBtn').disabled=true;return}
    const saved=read(key());
    const resume=validSaved(saved,$('mode').value);
    $('startBtn').textContent=resume?'Resume 200-question '+$('mode').value+' →':'Start all 200 questions →';
    $('startBtn').disabled=false;
  }
  function show(view){
    setup.hidden=view!=='setup';quiz.hidden=view!=='quiz';results.hidden=view!=='results';
    window.scrollTo(0,0);
  }
  function stopTimer(){if(handle){clearInterval(handle);handle=null}}
  function tick(){
    if(!session||session.finished||!session.deadline){$('clock').hidden=true;return}
    const left=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));
    $('clock').hidden=false;
    $('clock').textContent='Time left '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
    if(!left)finish(true);
  }
  function start(){
    if(!questions.length)return;
    sessionKey=key();
    const old=read(sessionKey);
    const mode=$('mode').value;
    if(validSaved(old,mode)){session=old}
    else{
      const duration=$('timerMode').value==='180'?180:0;
      session={version:1,mode,answers:Array(200).fill(null),checked:Array(200).fill(false),
        marked:Array(200).fill(false),index:0,startedAt:Date.now(),
        deadline:duration?Date.now()+duration*60000:null,finished:false};
      save();
    }
    $('quizTitle').textContent='Group IV 2024 · '+(session.mode==='practice'?'Practice':'Exam');
    stopTimer();if(session.deadline)handle=setInterval(tick,1000);
    show('quiz');render(true);tick();
  }
  const answered=()=>session.answers.filter(a=>a!==null).length;
  function renderPalette(){
    const nav=$('palette');nav.replaceChildren();
    questions.forEach((q,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=i+1;
      b.className=(session.answers[i]!==null?'done ':'')+(session.marked[i]?'review ':'')+(i===session.index?'current':'');
      b.setAttribute('aria-label','Go to original question '+(i+1)+(session.answers[i]?' answered':''));
      if(i===session.index)b.setAttribute('aria-current','step');
      b.addEventListener('click',()=>{session.index=i;render(true)});
      nav.append(b);
    });
  }
  function renderFeedback(q){
    const div=$('feedback');div.replaceChildren();
    const checked=session.mode==='practice'&&session.checked[session.index];
    div.hidden=!checked;
    if(!checked)return;
    const actual=session.answers[session.index],token=q.finalKeyToken;
    const heading=document.createElement('strong');
    const valid=token!=='ALL'&&token.split('/').includes(actual);
    heading.textContent=token==='ALL'?'Final key: ALL (special / ungraded)':valid?'Correct answer':'Incorrect answer';
    div.className=valid?'':'incorrect';
    div.append(heading);
    const p=document.createElement('p');
    p.textContent=token==='ALL'?'This question is excluded from the indicative score until its special key treatment is confirmed.':
      'Official final key: '+token+'. Your selection: '+(actual||'not answered')+'.';
    div.append(p);
    if(token!=='ALL'){
      const options=document.createElement('p');options.textContent='Accepted choice: '+
        token.split('/').map(a=>a+'. '+q.options[a]).join(' / ');
      div.append(options);
    }
    const foot=document.createElement('p');foot.className='small-source';
    foot.textContent='Answer verified against the published final key; question wording remains a typed transcription awaiting line-by-line source review.';
    div.append(foot);
  }
  function render(scroll=false){
    if(!session||session.finished)return;
    const i=session.index,q=questions[i],checked=session.mode==='practice'&&session.checked[i];
    $('position').textContent='Question '+(i+1)+' / 200';
    $('sourceQuestion').textContent='Official source Q'+q.number+' · PDF p.'+q.sourcePdfPage;
    $('section').textContent=q.section;
    $('stem').textContent=q.question;
    $('originalPageLink').href=bank.officialPaperURL+'#page='+q.sourcePdfPage;
    const options=$('options');options.replaceChildren();
    LETTERS.forEach(letter=>{
      const b=document.createElement('button');b.className='option';b.type='button';
      b.setAttribute('aria-pressed',String(session.answers[i]===letter));
      if(checked&&q.finalKeyToken!=='ALL'&&q.correctAnswers.includes(letter))b.classList.add('right');
      if(checked&&session.answers[i]===letter&&q.finalKeyToken!=='ALL'&&!q.correctAnswers.includes(letter))b.classList.add('wrong');
      b.disabled=checked;
      const label=document.createElement('span');label.className='letter';label.textContent=letter;
      const text=document.createElement('span');text.textContent=q.options[letter];
      b.append(label,text);
      b.addEventListener('click',()=>{
        if(checked)return;
        session.answers[i]=letter;save();render();
      });
      options.append(b);
    });
    $('checkBtn').hidden=session.mode!=='practice'||checked;
    $('checkBtn').disabled=!session.answers[i];
    $('clearBtn').disabled=!session.answers[i]||checked;
    $('flagBtn').textContent=session.marked[i]?'⚑ Marked':'⚐ Mark for review';
    $('prevBtn').disabled=i===0;
    $('nextBtn').hidden=i===199;
    $('submitBtn').textContent=i===199?'Finish & review':'Finish';
    $('answerStats').textContent=answered()+' / 200 answered · '+session.marked.filter(Boolean).length+' marked';
    $('progressFill').style.width=(answered()/2)+'%';
    const track=$('progressFill').parentElement;
    track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','200');
    track.setAttribute('aria-valuenow',String(answered()));
    renderFeedback(q);renderPalette();save();
    if(scroll)$('position').scrollIntoView({block:'start',behavior:'instant'});
  }
  function checkAnswer(){
    if(!session||session.mode!=='practice'||session.finished)return;
    const i=session.index;
    if(!session.answers[i]||session.checked[i])return;
    session.checked[i]=true;save();render();
    $('feedback').scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function finish(expired=false){
    if(!session||session.finished)return;
    const unanswered=200-answered();
    if(!expired&&unanswered&&!window.confirm(unanswered+' questions are unanswered. Finish and review the attempt?'))return;
    stopTimer();session.finished=true;save();
    const graded=questions.filter(q=>q.finalKeyToken!=='ALL');
    const correct=questions.reduce((a,q,i)=>a+(q.finalKeyToken!=='ALL'&&q.correctAnswers.includes(session.answers[i])?1:0),0);
    const special=200-graded.length;
    const incorrect=questions.reduce((a,q,i)=>a+(q.finalKeyToken!=='ALL'&&session.answers[i]!==null&&!q.correctAnswers.includes(session.answers[i])?1:0),0);
    const unknown=session.answers.filter(a=>a==='E').length;
    $('resultsTitle').textContent=expired?'Time expired — 200-question attempt saved':'200-question quiz complete';
    $('score').textContent=(correct*1.5).toFixed(1)+' / '+(graded.length*1.5).toFixed(1);
    $('resultsSummary').textContent=correct+' correct · '+incorrect+' incorrect (including E choices) · '+unanswered+
      ' unattempted · '+unknown+' E / Answer not known · '+special+' special ALL entries excluded. '+
      'Indicative marks out of '+graded.length+' gradable original-number questions; not TNPSC’s official result.';
    $('reviewFilter').value='all';renderReview();
    show('results');
  }
  function renderReview(){
    const list=$('reviewList');list.replaceChildren();
    const filter=$('reviewFilter').value;
    questions.forEach((q,i)=>{
      const ans=session.answers[i],token=q.finalKeyToken,correct=token!=='ALL'&&q.correctAnswers.includes(ans);
      if(filter==='wrong'&&(ans===null||correct||token==='ALL'))return;
      if(filter==='unanswered'&&ans!==null)return;
      if(filter==='flagged'&&!session.marked[i])return;
      if(filter==='special'&&token!=='ALL')return;
      const box=document.createElement('details');box.className='review-row';
      const head=document.createElement('summary');
      head.textContent='Q'+q.number+' · '+q.question+' — '+(token==='ALL'?'Ungraded / ALL':ans===null?'Unanswered':correct?'Correct':'Incorrect');
      box.append(head);
      const body=document.createElement('div');body.className='review-content';
      const solution=document.createElement('p');
      solution.textContent='Your answer: '+(ans?ans+'. '+q.options[ans]:'not answered')+' | Final key: '+token;
      body.append(solution);
      LETTERS.forEach(letter=>{
        const p=document.createElement('p');p.textContent=letter+'. '+q.options[letter];body.append(p);
      });
      const source=document.createElement('a');source.href=bank.officialPaperURL+'#page='+q.sourcePdfPage;
      source.textContent='Original paper page '+q.sourcePdfPage;source.target='_blank';source.rel='noopener noreferrer';
      body.append(source);box.append(body);list.append(box);
    });
    if(!list.childElementCount)list.textContent='No questions match this filter.';
  }
  $('mode').addEventListener('change',updateStart);
  $('startBtn').addEventListener('click',start);
  $('checkBtn').addEventListener('click',checkAnswer);
  $('prevBtn').addEventListener('click',()=>{if(session.index>0){session.index--;render(true)}});
  $('nextBtn').addEventListener('click',()=>{if(session.index<199){session.index++;render(true)}});
  $('flagBtn').addEventListener('click',()=>{session.marked[session.index]=!session.marked[session.index];render()});
  $('clearBtn').addEventListener('click',()=>{
    if(session.mode==='practice'&&session.checked[session.index])return;
    session.answers[session.index]=null;render();
  });
  $('submitBtn').addEventListener('click',()=>finish(false));
  $('reviewFilter').addEventListener('change',renderReview);
  $('reviewAgainBtn').addEventListener('click',()=>{$('reviewList').scrollIntoView({block:'start',behavior:'smooth'})});
  $('retryBtn').addEventListener('click',()=>{
    if(!window.confirm('Start a new 200-question attempt? Your previous responses will be replaced on this device.'))return;
    session=null;write(key(),null);show('setup');updateStart();
  });
  fetch(DATA,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('200-question text bank unavailable');return r.json()})
    .then(data=>{
      questions=validate(data);bank=data;
      $('loadStatus').textContent='200/200 numbered text questions and official answer-key positions loaded. Text remains source-review pending.';
      updateStart();
    }).catch(err=>{
      $('loadStatus').textContent='The complete original-order text quiz is not yet available: '+err.message;
      $('startBtn').disabled=true;$('startBtn').textContent='Question bank incomplete';
    });
})();