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
      data?.originalQuestionCount!==140||data?.suppliedQuestionCount!==137||
      !Array.isArray(data.questions)||data.questions.length!==137||
      !Array.isArray(data.missingNumbers)||data.missingNumbers.length!==3||
      !Array.isArray(data.blockedNumbers)||data.blockedNumbers.length!==0||
      data.ungradedSourceDisputeCount!==7||
      data?.answerKey?.answers?.length!==140){
      throw Error('TNUSRB SI 2020 Series C question-bank manifest is incomplete');
    }
    const translatedNumbers=new Set(data.bilingualEditorialReview?.reviewedOriginalNumbers||[]);
    const sourceTamilNumbers=new Set(data.bilingualEditorialReview?.alreadySourceTamilNumberedOriginals||[]);
    if(data.bilingualEditorialReview?.questionCount!==80||translatedNumbers.size!==80||
       sourceTamilNumbers.size!==8||
       data.bilingualEditorialReview?.originalTamilPrintVerified!==false||
       [...sourceTamilNumbers].some(n=>translatedNumbers.has(n))||
       [15,37,39,40,41,42,47].some(n=>translatedNumbers.has(n)))
      throw Error('Tamil study/source-language provenance is incomplete');
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
         (![15,22,37,47,84,95,103].includes(q.number)||q.acceptedAnswers.length!==0||!q.answerReviewReason||data.blockedNumbers.includes(q.number)))
        throw Error('Unverified reference-diagram question must not be graded or given an accepted answer');
      const hasTamil=typeof q.questionTamil==='string'&&q.questionTamil.trim();
      if(hasTamil){
        if(!translatedNumbers.has(q.number)||q.translationStatus!=='editorial_tamil_study_translation_not_verified_original_booklet'||
           q.originalTamilPaperTextVerified!==false||!q.optionsTamil||
           !LETTERS.every(l=>typeof q.optionsTamil[l]==='string'&&q.optionsTamil[l].trim()))
          throw Error('Unverified Tamil study option set '+q.number);
      }else if(translatedNumbers.has(q.number))throw Error('Missing scheduled Tamil translation '+q.number);
      const sourceTamil=q.sourceTextLanguage==='ta';
      if(sourceTamil){
        if(!sourceTamilNumbers.has(q.number)||q.questionTamil||
           q.sourceLanguageStatus!=='original_numbered_tamil_transcription_pending_primary_series_c_booklet'||
           q.originalTamilPaperTextVerified!==false||
           !/[\u0B80-\u0BFF]/u.test(q.question)||
           !LETTERS.every(l=>/[\u0B80-\u0BFF]/u.test(q.options[l])))
          throw Error('Incorrectly labelled Tamil-original-numbered transcription '+q.number);
      }else if(sourceTamilNumbers.has(q.number))throw Error('Missing source Tamil label '+q.number);
      previous=q.number;
    }
    const playable=data.questions.filter(q=>q.scoringStatus!=='blocked_source_incomplete');
    if(playable.length!==data.playableQuestionCount||playable.length!==137||
       playable.filter(q=>q.scoringStatus==='scored_with_final_key').length!==127||
       playable.filter(q=>q.scoringStatus==='ungraded_all_correct').length!==3||
       playable.filter(q=>q.scoringStatus==='ungraded_source_dispute').length!==7){
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
    // Old attempts had no Series C Q46/Q47 and withheld Q121: preserve
    // response mapping by original paper number when restoring older sizes.
    const prior13=new Set([28,29,30,31,32,33,34,35,41,42,44,45,48]);
    const crossSeries3=new Set([14,15,37]);
    const newDiagrams=new Set([84,95,103]);
    const newMath=new Set([46,47,121]);
    const old134=questions.map((q,i)=>newMath.has(q.number)?-1:i).filter(i=>i>=0);
    const old131=old134.filter(i=>!newDiagrams.has(questions[i].number));
    const old128=old131.filter(i=>!crossSeries3.has(questions[i].number));
    const old115=old128.filter(i=>!prior13.has(questions[i].number));
    const old114=old115.filter(i=>questions[i].number!==22);
    const map={134:old134,131:old131,128:old128,115:old115,114:old114};
    const oldPositions=map[saved?.answers?.length];
    if(!saved||!oldPositions||saved.finished||saved.version!==1||saved.mode!==mode||
       saved.answers?.length!==oldPositions.length||
       saved.checked?.length!==oldPositions.length||saved.marked?.length!==oldPositions.length||
       !Number.isInteger(saved.index)||saved.index<0||saved.index>=oldPositions.length)return null;
    const restored={...saved,answers:Array(questions.length).fill(null),
      checked:Array(questions.length).fill(false),marked:Array(questions.length).fill(false),
      index:oldPositions[saved.index]};
    oldPositions.forEach((index,j)=>{restored.answers[index]=saved.answers[j];
      restored.checked[index]=saved.checked[j];restored.marked[index]=saved.marked[j]});
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
    const language=$('language').value;
    const hasTamil=!!q.questionTamil&&!!q.optionsTamil;
    const sourceTamil=q.sourceTextLanguage==='ta';
    const onlyTamil=language==='ta'&&hasTamil;
    $('questionTitle').hidden=onlyTamil;
    $('questionTitle').textContent=q.question;
    $('questionTitle').lang=sourceTamil?'ta':'en';
    $('questionTamil').hidden=language==='en'||!hasTamil;
    $('questionTamil').textContent=q.questionTamil||'';
    $('translationNotice').hidden=language==='en'&&!sourceTamil;
    $('translationNotice').textContent=hasTamil?
      'ClearExams editorial Tamil study translation — NOT independently verified as the original Series C Tamil booklet. English wording and answer-option letters remain the source reference.':
      sourceTamil?
      'This original-numbered source transcription is already in Tamil. No independently verified English version or printed original Tamil Series C page is available; its Tamil text is shown in every language mode.':
      'Tamil translation is not yet reviewed for this original question number. Showing the source-numbered English text instead.';
    $('questionFigure').hidden=!q.figureAsset;
    $('questionFigure').src=q.figureAsset||'';
    $('questionFigure').alt=q.figureAlt||'';
    $('referenceNote').hidden=!q.figureAsset;
    $('referenceNote').textContent=q.figureAsset?'Illustrative reference redraw from independent matching reasoning examples, NOT the verified 2020 Series C original figure. Shown for learning without marks.':'';
    const locked=attempt.mode==='practice'&&attempt.checked[i];
    $('options').replaceChildren();
    for(const letter of LETTERS){
      const b=document.createElement('button');b.type='button';b.className='option';
      b.setAttribute('aria-pressed',String(attempt.answers[i]===letter));
      const l=document.createElement('b');l.textContent=letter;
      const content=document.createElement('span');
      content.textContent=onlyTamil?q.optionsTamil[letter]:q.options[letter];
      if(onlyTamil||sourceTamil)content.setAttribute('lang','ta');
      const copy=document.createElement('span');copy.className='option-copy';copy.append(content);
      if(language==='both'&&hasTamil){
        const tamil=document.createElement('span');tamil.className='tamil-option';
        tamil.lang='ta';tamil.textContent=q.optionsTamil[letter];copy.append(tamil);
      }
      b.append(l,copy);
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
      allEntries+' ALL entries and '+disputed+' disputed source/key questions ungraded · '+questions.length+' readable questions. '+
      'Score excludes three still-absent Series C original numbers and the ungraded Series D comparison matrix Q47; all other source-review diagrams remain ungraded. Not a full 140-question exam result.';
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
      const lang=$('language').value;
      summary.textContent='Q'+q.number+' · '+(lang==='ta'&&q.questionTamil?q.questionTamil:q.question)+' — '+(disputed?'Key disputed / ungraded':
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
        const p=document.createElement('p');
        const tamil=q.optionsTamil?.[letter];
        p.textContent=letter+') '+(lang==='ta'&&tamil?tamil:q.options[letter])+
          (lang==='both'&&tamil?' / '+tamil:'');
        if((lang==='ta'&&tamil)||q.sourceTextLanguage==='ta')p.lang='ta';
        body.append(p);
      }
      details.append(body);$('reviewList').append(details);
    }
    if(!$('reviewList').childElementCount)$('reviewList').textContent='No questions match this filter.';
  }
  $('mode').addEventListener('change',updateStart);
  $('language').addEventListener('change',()=>{
    if(attempt&&!attempt.finished)render();
    if(attempt?.finished)renderReview();
  });
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
      if(!data.originalBookletAccess?.url?.includes('SI_2019_WT_QUESTION.pdf')||
         data.originalBookletAccess?.originalBookletVerifiedByClearExams!==false||
         data.missingNumbers.some(n=>!data.missingSourceEvidence?.[String(n)]))
        throw Error('2020 SI source evidence manifest requires review');
      const withheld=$('sourceGaps');withheld.replaceChildren();
      data.missingNumbers.forEach(n=>{
        const li=document.createElement('li');
        li.textContent='Q'+n+': no verified original Series C question wording or A–D options recovered. This original-numbered entry remains absent from the quiz.';
        withheld.append(li);
      });
      data.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').forEach(q=>{
        const li=document.createElement('li');li.textContent='Q'+q.number+': '+q.sourceIssue;withheld.append(li);
      });
      $('loadStatus').textContent=questions.length+' readable original-numbered questions: 127 provisionally scored, '+
        '3 ALL tokens and 7 source/wording review items ungraded; 3 missing original Series C numbers Q114–116.';
      updateStart();
    })
    .catch(err=>{$('loadStatus').textContent='Quiz could not load: '+err.message;
      $('start').disabled=true;$('start').textContent='Quiz unavailable'});
})();