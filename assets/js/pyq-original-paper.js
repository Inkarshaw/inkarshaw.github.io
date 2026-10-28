/* Source-linked original-paper practice.
   Displays the original official PDF in a separate tab and provides a saved
   A–E answer sheet, including the printed E (Answer not known) response. This deliberately does not claim a verbatim transcription
   or score a paper without an audited complete original answer key. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const STORE='clearexamsOriginalPaperResponsesV1:';
  const safe=(url)=>{
    try {const u=new URL(url);return u.protocol==='https:'&&/^(?:www\.)?tnpsc\.gov\.in$/.test(u.hostname)?u.href:null}
    catch{return null}
  };
  const allowedLetters=['A','B','C','D','E'];
  const url=new URLSearchParams(location.search);
  let papers=[],currentPaper=null,answers=[],marked=[],index=0,deadline=0,timerHandle=null;
  function write(){
    if(!currentPaper)return;
    try{localStorage.setItem(STORE+currentPaper.id,JSON.stringify({version:2,answers,marked,index,deadline,updatedAt:Date.now()}))}catch{}
  }
  function read(id){
    try{return JSON.parse(localStorage.getItem(STORE+id)||'null')}
    catch{return null}
  }
  function plainLink(el,raw,label){
    const link=safe(raw);el.replaceChildren();if(!link)return;
    const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent=label;el.append(a);
  }
  function validPaper(p){
    return p&&/^[a-z0-9-]+$/.test(String(p.id||''))&&
      Number.isInteger(p.questionCount)&&p.questionCount>=1&&p.questionCount<=300&&
      p.format==='official-pdf-answer-sheet'&&p.transcriptionStatus==='not-transcribed'&&
      p.answerKeyStatus==='official-pdf-only'&&!!safe(p.paperUrl)&&!!safe(p.answerKeyUrl)&&
      Array.isArray(p.optionLetters)&&p.optionLetters.join(',')==='A,B,C,D,E'&&
      Number.isInteger(p.durationMinutes)&&p.durationMinutes>=30&&p.durationMinutes<=240;
  }
  function updateStatus(){
    const answered=answers.filter(Boolean).length,flags=marked.filter(Boolean).length;
    $('status').textContent=answered+'/'+answers.length+' answered · '+flags+' marked · progress saved in this browser';
    $('fill').style.width=Math.round(100*answered/answers.length)+'%';
  }
  function renderPalette(){
    const wrap=$('palette');wrap.replaceChildren();
    for(let j=0;j<answers.length;j++){
      const b=document.createElement('button');b.type='button';
      b.textContent=j+1;b.className='slot'+(answers[j]?' done':'')+(marked[j]?' flagged':'')+(j===index?' selected':'');
      b.setAttribute('aria-label','Question '+(j+1)+(answers[j]?' answered':''));
      b.addEventListener('click',()=>{index=j;write();render()});
      wrap.append(b);
    }
  }
  function render(){
    if(!currentPaper)return;
    $('number').textContent='Answer for original question '+(index+1)+' of '+answers.length;
    $('answerChoices').replaceChildren();
    for(const letter of currentPaper.optionLetters){
      const button=document.createElement('button');button.type='button';
      button.className='answer'+(answers[index]===letter?' selected':'');
      button.textContent=letter==='E'?'E · Answer not known / விடை தெரியவில்லை':letter;
      button.setAttribute('aria-pressed',answers[index]===letter?'true':'false');
      button.addEventListener('click',()=>{answers[index]=letter;write();render()});
      $('answerChoices').append(button);
    }
    $('flag').textContent=marked[index]?'⚑ Marked':'⚐ Mark for review';
    $('clear').disabled=!answers[index];
    $('previous').disabled=index===0;
    $('next').disabled=index===answers.length-1;
    updateStatus();
    renderPalette();
  }
  function setPaper(p){
    currentPaper=p;index=0;
    $('examTitle').textContent=p.board+' '+p.exam+' · '+p.year+' · '+p.paper;
    $('count').textContent=p.questionCount+' original numbered questions';
    $('notice').textContent='Original full-length PDF-linked practice: '+p.questionCount+' numbered questions; A–D for an answer, E for Answer not known. The original question text is in the official PDF. Automatic scoring requires the audited version-matched final key and is not yet available.';
    plainLink($('sourcePaper'),p.paperUrl,'Open original official question paper (PDF) ↗');
    plainLink($('sourceKey'),p.answerKeyUrl,'Open official final answer key (PDF) ↗');
    const saved=read(p.id);
    if(saved&&(saved.version===1||saved.version===2)&&Array.isArray(saved.answers)&&saved.answers.length===p.questionCount&&
       saved.answers.every(a=>a===null||allowedLetters.includes(a))&&Array.isArray(saved.marked)&&saved.marked.length===p.questionCount){
      answers=saved.answers;marked=saved.marked.map(Boolean);
      index=Number.isInteger(saved.index)?Math.max(0,Math.min(saved.index,p.questionCount-1)):0;
      deadline=Number.isFinite(saved.deadline)&&saved.deadline>0?saved.deadline:0;
    }else{answers=Array(p.questionCount).fill(null);marked=Array(p.questionCount).fill(false);deadline=0}
    $('timed').checked=deadline>0;
    startOrStopTimer();
    $('paperPicker').hidden=true;$('answerSheet').hidden=false;$('result').hidden=true;render();
  }
  function finish(expired=false){
    const attempted=answers.filter(Boolean).length;
    if(!expired&&attempted<answers.length&&!confirm((answers.length-attempted)+' answers are blank. Finish this answer-sheet attempt?'))return;
    deadline=0;startOrStopTimer();
    $('resultHeading').textContent=expired?'Time expired — original-paper responses saved':'Original-paper answer sheet completed';
    const unknown=answers.filter(a=>a==='E').length;
    $('resultBody').textContent=attempted+'/'+answers.length+' OMR responses recorded ('+unknown+' E / Answer not known). Because the official final answer key has not been digitised and cross-checked for this paper version, this page does not calculate marks or identify correct answers. Compare your selections with the official answer-key PDF.';
    const rows=document.createElement('div');rows.className='answer-summary';
    answers.forEach((v,i)=>{const s=document.createElement('span');s.textContent=(i+1)+': '+(v||'—');rows.append(s)});
    $('answerOverview').replaceChildren(rows);
    plainLink($('resultSource'),currentPaper.answerKeyUrl,'Open the official final answer key PDF ↗');
    $('result').hidden=false;$('answerSheet').hidden=true;window.scrollTo(0,0);write();
  }
  function tick(){
    if(!currentPaper||!deadline||$('answerSheet').hidden)return;
    const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
    $('timer').textContent='Time remaining: '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');
    if(!remaining){deadline=0;startOrStopTimer();finish(true)}
  }
  function startOrStopTimer(){
    if(timerHandle){clearInterval(timerHandle);timerHandle=null}
    $('timer').hidden=!deadline;
    if(deadline){timerHandle=setInterval(tick,1000);tick()}
    else $('timer').textContent='';
  }
  $('timed').addEventListener('change',()=>{
    if(!currentPaper)return;
    deadline=$('timed').checked?Date.now()+currentPaper.durationMinutes*60*1000:0;
    startOrStopTimer();write();
  });
  $('previous').addEventListener('click',()=>{if(index>0){index--;write();render()}});
  $('next').addEventListener('click',()=>{if(index<answers.length-1){index++;write();render()}});
  $('clear').addEventListener('click',()=>{answers[index]=null;write();render()});
  $('flag').addEventListener('click',()=>{marked[index]=!marked[index];write();render()});
  $('finish').addEventListener('click',finish);
  $('changePaper').addEventListener('click',()=>{$('paperPicker').hidden=false;$('answerSheet').hidden=true;$('result').hidden=true});
  $('returnToSheet').addEventListener('click',()=>{$('answerSheet').hidden=false;$('result').hidden=true;render()});
  $('restart').addEventListener('click',()=>{
    if(!confirm('Erase answers and start this paper again?'))return;
    answers=Array(currentPaper.questionCount).fill(null);marked=Array(currentPaper.questionCount).fill(false);index=0;
    deadline=$('timed').checked?Date.now()+currentPaper.durationMinutes*60*1000:0;
    startOrStopTimer();write();
    $('answerSheet').hidden=false;$('result').hidden=true;render();
  });
  fetch('data/quizzes/original-paper-practice.json',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('Official paper index unavailable');return r.json()})
    .then(data=>{
      if(!data||data.schemaVersion!==1||!Array.isArray(data.papers))throw Error('Invalid paper index');
      papers=data.papers.filter(validPaper);
      $('papers').replaceChildren();
      if(!papers.length)throw Error('No original-paper PDF practice available');
      for(const paper of papers){
        const b=document.createElement('button');b.type='button';b.className='paper-choice';
        b.textContent=paper.board+' '+paper.exam+' · '+paper.year+' · '+paper.paper+' · '+paper.questionCount+' questions';
        b.addEventListener('click',()=>setPaper(paper));$('papers').append(b);
      }
      $('loading').textContent='Choose an original paper to practise. Answer the numbered questions using the official PDF.';
      const requested=papers.find(p=>p.id===url.get('paper'));
      if(requested)setPaper(requested);
    }).catch(err=>{$('loading').textContent=err.message});
})();