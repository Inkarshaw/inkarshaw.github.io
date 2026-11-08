/* Source-linked original-paper practice.
   Displays the official question paper alongside an interactive quiz panel and a saved
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
  let papers=[],keyRecords=[],questionPageIndexes={},currentPaper=null,currentKey=null,answers=[],marked=[],index=0,deadline=0,timerHandle=null,lastShownPdfPage=0;
  const keyToken=/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/;
  function validFinalKey(k,p){
    return k&&k.id===p.id&&k.paperVersion===p.paperVersion&&
      k.questionCount===p.questionCount&&k.marksPerQuestion===p.marksPerQuestion&&
      !!safe(k.sourceUrl)&&Array.isArray(k.answers)&&k.answers.length===p.questionCount&&
      k.answers.every(answer=>typeof answer==='string'&&keyToken.test(answer)&&
        (answer==='ALL'||new Set(answer.split('/')).size===answer.split('/').length));
  }
  // The literal ALL in the official key has no unambiguous blank/E scoring rule here.
  // We exclude these questions from indicative marks rather than pretending a policy.
  function gradeResponses(){
    if(!currentPaper||!currentKey)return null;
    const detail=currentKey.answers.map((token,i)=>{
      const response=answers[i];
      if(token==='ALL')return {status:'ungraded',response,accepted:token};
      if(response===null)return {status:'blank',response,accepted:token};
      return {status:token.split('/').includes(response)?'correct':'incorrect',response,accepted:token};
    });
    const count=status=>detail.filter(d=>d.status===status).length;
    const correct=count('correct'),wrong=count('incorrect'),omitted=count('blank'),ungraded=count('ungraded');
    return {detail,correct,wrong,omitted,ungraded,gradedCount:detail.length-ungraded,
      marks:correct*currentPaper.marksPerQuestion,
      maximum:(detail.length-ungraded)*currentPaper.marksPerQuestion};
  }
  function jumpPdfPage(page){
    if(!currentPaper)return;
    const n=Number(page);
    if(!Number.isInteger(n)||n<1||n>500)return;
    $('pdfPage').value=String(n);
    $('paperFrame').src=(safe(currentPaper.paperUrl)||'about:blank')+'#page='+n;
    lastShownPdfPage=n;
  }
  function switchView(view){
    const paper=view==='paper',questions=view==='questions',both=view==='both';
    $('quizWorkspace').classList.toggle('mobile-paper',paper);
    $('quizWorkspace').classList.toggle('mobile-questions',questions);
    $('quizWorkspace').classList.toggle('mobile-both',both);
    $('showPaper').setAttribute('aria-pressed',String(paper));
    $('showQuestions').setAttribute('aria-pressed',String(questions));
    $('showBoth').setAttribute('aria-pressed',String(both));
  }
  $('showBoth').addEventListener('click',()=>switchView('both'));
  $('showPaper').addEventListener('click',()=>switchView('paper'));
  $('showQuestions').addEventListener('click',()=>switchView('questions'));

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
      ['official-pdf-only','official-final-key-mapped-subject-496'].includes(p.answerKeyStatus)&&
      !!safe(p.paperUrl)&&!!safe(p.answerKeyUrl)&&
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
  function renderDock(){
    if(!currentPaper||!answers.length)return;
    $('dockNumber').textContent='Original Q'+(index+1)+' / '+answers.length;
    $('dockSaved').textContent=answers.filter(Boolean).length+' answered · saved';
    const dock=$('dockChoices');dock.replaceChildren();
    for(const letter of currentPaper.optionLetters){
      const button=document.createElement('button');button.type='button';
      button.textContent=letter;
      button.setAttribute('aria-pressed',String(answers[index]===letter));
      button.title=letter==='E'?'Answer not known':('Select '+letter);
      button.addEventListener('click',()=>{answers[index]=letter;write();render()});
      dock.append(button);
    }
    $('dockPrevious').disabled=index===0;
    $('dockNext').disabled=index===answers.length-1;
  }
  function render(){
    if(!currentPaper)return;
    $('number').textContent='Question '+(index+1)+' of '+answers.length;
    $('sourceQuestionNumber').textContent=String(index+1);
    const originalPage=questionPageIndexes[currentPaper.id]?.pageByQuestion[index]??null;
    $('paperQuestionPage').textContent=Number.isInteger(originalPage)?
      'Original question '+(index+1)+' is on official PDF page '+originalPage+
      '. The PDF view follows your question automatically.':
      'Open the official paper and use the PDF page selector to locate the question.';
    if(Number.isInteger(originalPage)&&lastShownPdfPage!==originalPage)jumpPdfPage(originalPage);
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
    renderDock();
  }
  function setPaper(p){
    currentPaper=p;index=0;lastShownPdfPage=0;
    $('examTitle').textContent=p.board+' '+p.exam+' · '+p.year+' · '+p.paper;
    $('count').textContent=p.questionCount+' original numbered questions';
    currentKey=keyRecords.find(k=>validFinalKey(k,p))||null;
    $('notice').textContent='Original full-length official-PDF practice: '+p.questionCount+
      ' numbered questions; A–D for an answer, E for Answer not known. '+
      (currentKey?'Indicative scoring uses a Version A final key with special multi-answer rules; ALL entries remain ungraded.':
        'Automatic marking is unavailable until a complete matching official final key is checked.');
    plainLink($('sourcePaper'),p.paperUrl,'Open original official question paper (PDF) ↗');
    plainLink($('sourceKey'),p.answerKeyUrl,'Open official final answer key (PDF) ↗');
    $('paperFrame').src=safe(p.paperUrl)||'about:blank';
    $('scanWarning').hidden=!p.annotatedSource;
    $('pdfPage').value='1';
    $('firstQuestion').hidden=!Number.isInteger(p.firstQuestionPdfPage);
    $('paperFrame').title='TNPSC '+p.year+' official original question paper (PDF)';
    const adapted=new URLSearchParams({exam:'TNPSC Group IV',year:String(p.year)});
    $('adaptedQuizLink').href='pyq-full-quiz.html?'+adapted.toString();
    switchView('both');
    const saved=read(p.id);
    if(saved&&(saved.version===1||saved.version===2)&&Array.isArray(saved.answers)&&saved.answers.length===p.questionCount&&
       saved.answers.every(a=>a===null||allowedLetters.includes(a))&&Array.isArray(saved.marked)&&saved.marked.length===p.questionCount){
      answers=saved.answers;marked=saved.marked.map(Boolean);
      index=Number.isInteger(saved.index)?Math.max(0,Math.min(saved.index,p.questionCount-1)):0;
      deadline=Number.isFinite(saved.deadline)&&saved.deadline>0?saved.deadline:0;
    }else{answers=Array(p.questionCount).fill(null);marked=Array(p.questionCount).fill(false);deadline=0}
    $('timed').checked=deadline>0;
    startOrStopTimer();
    $('paperPicker').hidden=true;$('answerSheet').hidden=false;$('result').hidden=true;
    $('mobileAnswerDock').hidden=false;render();
  }
  function finish(expired=false){
    const attempted=answers.filter(Boolean).length;
    if(!expired&&attempted<answers.length&&!confirm((answers.length-attempted)+' answers are blank. Finish this answer-sheet attempt?'))return;
    deadline=0;startOrStopTimer();
    $('resultHeading').textContent=expired?'Time expired — original-paper responses saved':'Full-paper quiz submitted';
    const grade=gradeResponses();
    $('scoreSummary').textContent=grade?
      'Indicative marks: '+grade.marks+' / '+grade.maximum+' ('+grade.correct+
      ' correct · '+grade.wrong+' incorrect · '+grade.omitted+' blank · '+grade.ungraded+
      ' official ALL entries excluded). This is not an official TNPSC score.':'';
    $('scoreSummary').hidden=!grade;
    const unknown=answers.filter(a=>a==='E').length;
    $('resultBody').textContent=grade?
      attempted+'/'+answers.length+' responses recorded ('+unknown+' E / Answer not known). '+
      'Accepted multiple-choice alternatives are credited according to the linked official final key. '+
      'The '+grade.ungraded+' ALL questions are not included in the shown marks because their handling for blank/E responses is unverified. Check the official key and scoring rules for final marks.':
      attempted+'/'+answers.length+' OMR responses recorded ('+unknown+' E / Answer not known). Because the official final answer key has not been digitised and cross-checked for this paper version, this page does not calculate marks or identify correct answers. Compare your selections with the official answer-key PDF.';
    const rows=document.createElement('div');rows.className='answer-summary';
    answers.forEach((v,i)=>{
      const item=document.createElement('span');
      const outcome=grade?.detail[i];
      item.textContent=(i+1)+': '+(v||'—')+(outcome?' · '+(outcome.status==='ungraded'?'ALL':outcome.status==='correct'?'✓':outcome.status==='incorrect'?'✕': 'blank'):'');
      if(outcome)item.classList.add('grade-'+outcome.status);
      item.title=outcome?'Final key: '+outcome.accepted+'; '+outcome.status:'No digitized key available';
      rows.append(item);
    });
    $('answerOverview').replaceChildren(rows);
    plainLink($('resultSource'),currentPaper.answerKeyUrl,'Open the official final answer key PDF ↗');
    $('result').hidden=false;$('answerSheet').hidden=true;$('mobileAnswerDock').hidden=true;
    window.scrollTo(0,0);write();
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

  // Paper browsing and answer entry remain separate: never present a letter as
  // a verified correct answer without a complete, matched original final key.
  document.addEventListener('keydown',event=>{
    if(!currentPaper||$('answerSheet').hidden||event.altKey||event.ctrlKey||event.metaKey)return;
    const target=event.target;
    if(target&&['INPUT','TEXTAREA','SELECT'].includes(target.tagName))return;
    if(event.key==='ArrowRight'&&index<answers.length-1){index++;write();render()}
    if(event.key==='ArrowLeft'&&index>0){index--;write();render()}
  });
  $('readOriginal').addEventListener('click',()=>{switchView('paper')});
  $('returnAnswers').addEventListener('click',()=>{switchView('questions')});
  $('goPdfPage').addEventListener('click',()=>jumpPdfPage($('pdfPage').value));
  $('pdfPage').addEventListener('keydown',event=>{if(event.key==='Enter')jumpPdfPage($('pdfPage').value)});
  $('firstQuestion').addEventListener('click',()=>jumpPdfPage(currentPaper?.firstQuestionPdfPage));
  $('previous').addEventListener('click',()=>{if(index>0){index--;write();render()}});
  $('next').addEventListener('click',()=>{if(index<answers.length-1){index++;write();render()}});
  $('dockPrevious').addEventListener('click',()=>{if(index>0){index--;write();render()}});
  $('dockNext').addEventListener('click',()=>{if(index<answers.length-1){index++;write();render()}});
  $('clear').addEventListener('click',()=>{answers[index]=null;write();render()});
  $('flag').addEventListener('click',()=>{marked[index]=!marked[index];write();render()});
  $('finish').addEventListener('click',finish);
  $('changePaper').addEventListener('click',()=>{$('paperPicker').hidden=false;$('answerSheet').hidden=true;$('result').hidden=true;$('mobileAnswerDock').hidden=true});
  $('returnToSheet').addEventListener('click',()=>{$('answerSheet').hidden=false;$('result').hidden=true;$('mobileAnswerDock').hidden=false;render()});
  $('restart').addEventListener('click',()=>{
    if(!confirm('Erase answers and start this paper again?'))return;
    answers=Array(currentPaper.questionCount).fill(null);marked=Array(currentPaper.questionCount).fill(false);index=0;
    deadline=$('timed').checked?Date.now()+currentPaper.durationMinutes*60*1000:0;
    startOrStopTimer();write();
    $('answerSheet').hidden=false;$('result').hidden=true;$('mobileAnswerDock').hidden=false;render();
  });
  Promise.all([
    fetch('data/quizzes/original-paper-practice.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw Error('Official paper index unavailable');return r.json()}),
    fetch('data/quizzes/tnpsc-g4-2024-original-page-index.json',{cache:'no-store'})
      .then(r=>r.ok?r.json():null).catch(()=>null),
    fetch('data/quizzes/tnpsc-g4-2025-original-page-index.json',{cache:'no-store'})
      .then(r=>r.ok?r.json():null).catch(()=>null),
    fetch('data/quizzes/original-final-keys.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw Error('Official answer-key map unavailable');return r.json()})
      .catch(()=>null)
  ]).then(([data,page2024,page2025,keyData])=>{
      questionPageIndexes={};
      for(const sourceIndex of [page2024,page2025]){
        const maxPage=sourceIndex?.paperId==='tnpsc-group-iv-2024-general-tamil-general-studies'?91:
          sourceIndex?.paperId==='tnpsc-group-iv-2025-general-tamil-general-studies'?123:null;
        if(!maxPage||sourceIndex?.schemaVersion!==1||sourceIndex.questionCount!==200||
           !Array.isArray(sourceIndex.pageSpans))continue;
        const pages=Array(200).fill(null);
        let valid=true;
        for(const span of sourceIndex.pageSpans){
          if(!Number.isInteger(span.pdfPage)||span.pdfPage<3||span.pdfPage>maxPage||
             !Number.isInteger(span.firstQuestion)||!Number.isInteger(span.lastQuestion)||
             span.firstQuestion<1||span.lastQuestion>200||span.firstQuestion>span.lastQuestion){valid=false;break}
          for(let n=span.firstQuestion;n<=span.lastQuestion;n++){
            if(pages[n-1]!==null){valid=false;break}
            pages[n-1]=span.pdfPage;
          }
          if(!valid)break;
        }
        if(valid&&pages.every(Number.isInteger)){
          questionPageIndexes[sourceIndex.paperId]={paperId:sourceIndex.paperId,pageByQuestion:pages};
        }
      }
      keyRecords=keyData?.schemaVersion===1&&Array.isArray(keyData.papers)?keyData.papers:[];
      if(!data||data.schemaVersion!==1||!Array.isArray(data.papers))throw Error('Invalid paper index');
      papers=data.papers.filter(validPaper);
      $('papers').replaceChildren();
      if(!papers.length)throw Error('No original-paper PDF practice available');
      for(const paper of papers){
        const b=document.createElement('button');b.type='button';b.className='paper-choice';
        const title=document.createElement('strong');title.textContent=paper.board+' '+paper.exam+' · '+paper.year;
        const detail=document.createElement('small');detail.textContent=paper.paper+' · '+paper.questionCount+' original question numbers · '+paper.durationMinutes+' minutes';
        const cta=document.createElement('span');cta.textContent='Start / resume full-paper quiz →';
        b.append(title,detail,cta);
        b.addEventListener('click',()=>setPaper(paper));$('papers').append(b);
      }
      $('loading').textContent='Choose an exam year. The original paper opens alongside a full quiz answer interface.';
      const requested=papers.find(p=>p.id===url.get('paper'))||
        (!url.has('paper')?papers.find(p=>p.year===2024):null);
      if(requested)setPaper(requested);
    }).catch(err=>{$('loading').textContent=err.message});
})();