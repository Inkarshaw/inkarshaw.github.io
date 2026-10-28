/* ClearExams: entire available source-attributed PYQ bank by exam/year.
   "Full" means all curated questions available here, NOT a full official paper. */
(() => {
  'use strict';
  const FEED='data/quizzes/verified-pyqs.json';
  const SESSION_PREFIX='clearexamsPyqFullSessionV1:';
  const HISTORY='clearexamsPyqFullHistoryV1';
  const $=id=>document.getElementById(id);
  const abc=['A','B','C','D'];
  const urlParams=new URLSearchParams(location.search);
  const safeText=value=>String(value??'').trim();
  const active=q=>safeText(q.Active).toUpperCase()!=='FALSE';
  const safeSource=url=>{
    try {
      const u=new URL(url);
      return u.protocol==='https:'&&/^(?:www\.)?(?:tnpsc\.gov\.in|upsc\.gov\.in)$/.test(u.hostname)?u.href:null;
    } catch {return null}
  };
  function valid(q){
    return q&&safeText(q.ID)&&safeText(q.Question)&&safeText(q.SourceExam)&&
      /^20\d{2}$/.test(safeText(q.SourceYear))&&q.SourceType==='Adapted PYQ'&&
      abc.includes(q.CorrectAnswer)&&abc.every(letter=>safeText(q['Option'+letter]))&&
      new Set(abc.map(letter=>safeText(q['Option'+letter]).toLowerCase())).size===4&&
      !!safeSource(q.SourceURL)&&active(q);
  }
  function collect(rows){
    const seen=new Set();
    return rows.filter(q=>{
      if(!valid(q)||seen.has(q.ID))return false;
      seen.add(q.ID);return true;
    });
  }
  const choose=(rows,exam,year)=>rows.filter(q=>(!exam||q.SourceExam===exam)&&(!year||safeText(q.SourceYear)===safeText(year)));
  function getKey(exam,year){return SESSION_PREFIX+encodeURIComponent(exam||'all')+':'+(year||'all')}
  function storageRead(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
  function storageWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function link(parent,url,label){
    const href=safeSource(url);if(!href)return;
    const a=document.createElement('a');a.href=href;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
  }
  let bank=[],qs=[],session=null,activeKey='',timingHandle=null;
  const setup=$('setup'),quizView=$('quizView'),results=$('results'),status=$('status');
  function setStatus(message){status.textContent=message}
  function fillOptions(select,items,placeholder,preferred){
    select.replaceChildren();
    const blank=document.createElement('option');blank.value='';blank.textContent=placeholder;select.append(blank);
    for(const value of items){const o=document.createElement('option');o.value=value;o.textContent=value;select.append(o)}
    select.value=items.includes(preferred)?preferred:'';
  }
  function updateYears(preferred){
    const exam=$('examSelect').value;
    const years=[...new Set(choose(bank,exam,'').map(q=>q.SourceYear))].sort((a,b)=>Number(b)-Number(a));
    fillOptions($('yearSelect'),years,'All available years',preferred||'');
  }
  function currentSelection(){return choose(bank,$('examSelect').value,$('yearSelect').value)}
  function validSaved(s,rows){
    return s&&s.version===1&&Array.isArray(s.ids)&&s.ids.length===rows.length&&
      rows.every((q,i)=>q.ID===s.ids[i])&&
      Array.isArray(s.answers)&&s.answers.length===rows.length&&
      Array.isArray(s.marked)&&s.marked.length===rows.length&&
      s.answers.every(v=>v===null||abc.includes(v));
  }
  function updatePreview(){
    const selected=currentSelection();
    const count=selected.length,exam=$('examSelect').value,year=$('yearSelect').value;
    const saved=storageRead(getKey(exam,year));
    const reusable=validSaved(saved,selected)&&!saved.finished;
    $('preview').textContent=count
      ?count+' adapted PYQs ready · '+(exam||'All available exams')+' · '+(year||'All years')+
        '. This is the complete available question set, not the complete official examination paper.'
      :'No reviewed PYQs are available for this selection.';
    $('startBtn').disabled=!count;
    $('startBtn').textContent=reusable?'Resume saved full quiz ('+selected.length+' questions)':'Start full available quiz ('+count+' questions)';
    const hist=(storageRead(HISTORY)||[]);
    const latest=Array.isArray(hist)?hist.find(h=>h.key===getKey(exam,year)):null;
    $('previousScore').textContent=latest?'Last completed attempt: '+latest.correct+'/'+latest.total+' correct · '+latest.accuracy+'%':'';
  }
  function save(){if(session&&activeKey)storageWrite(activeKey,session)}
  function show(which){
    setup.hidden=which!=='setup';quizView.hidden=which!=='quiz';results.hidden=which!=='results';
    window.scrollTo(0,0);
  }
  function start(){
    qs=currentSelection();
    if(!qs.length){setStatus('No questions available.');return}
    activeKey=getKey($('examSelect').value,$('yearSelect').value);
    const saved=storageRead(activeKey);
    if(validSaved(saved,qs)&&!saved.finished){
      session=saved;
    }else{
      session={version:1,ids:qs.map(q=>q.ID),answers:Array(qs.length).fill(null),marked:Array(qs.length).fill(false),
        index:0,timed:$('timedCheck').checked,deadline:$('timedCheck').checked?Date.now()+qs.length*60000:null,finished:false};
      save();
    }
    $('quizTitle').textContent=(qs[0].SourceExam===qs[qs.length-1].SourceExam&&$('examSelect').value?$('examSelect').value:'Mixed exams')+
      ' · '+($('yearSelect').value||'All years')+' · '+qs.length+' adapted PYQs';
    show('quiz');renderQuestion();tick();
  }
  function answeredCount(){return session.answers.filter(Boolean).length}
  function renderPalette(){
    const grid=$('palette');grid.replaceChildren();
    qs.forEach((q,i)=>{
      const b=document.createElement('button');b.type='button';
      b.textContent=String(i+1);b.title='Question '+(i+1);
      b.className='palette-item'+(session.answers[i]?' answered':'')+(session.marked[i]?' flagged':'')+(i===session.index?' current':'');
      b.setAttribute('aria-label','Go to question '+(i+1)+(session.answers[i]?', answered':'')+(session.marked[i]?', marked':''));
      if(i===session.index)b.setAttribute('aria-current','step');
      b.addEventListener('click',()=>{session.index=i;save();renderQuestion()});grid.append(b);
    });
  }
  function renderQuestion(){
    if(!session||session.finished)return;
    const i=session.index,q=qs[i];
    $('questionNumber').textContent='Question '+(i+1)+' of '+qs.length;
    $('sourceLabel').textContent=q.SourceExam+' · '+q.SourceYear+(q.SourcePaper?' · '+q.SourcePaper:'')+
      (q.SourceQuestion?' · source Q'+q.SourceQuestion:'');
    $('questionText').textContent=q.Question;
    const options=$('options');options.replaceChildren();
    abc.forEach(letter=>{
      const b=document.createElement('button');b.type='button';b.className='option';
      if(session.answers[i]===letter)b.classList.add('selected');
      b.setAttribute('aria-pressed',String(session.answers[i]===letter));
      const lead=document.createElement('strong');lead.textContent=letter+'. ';
      b.append(lead,document.createTextNode(safeText(q['Option'+letter])));
      b.addEventListener('click',()=>{session.answers[i]=letter;save();renderQuestion()});
      options.append(b);
    });
    $('markBtn').textContent=session.marked[i]?'⚑ Marked for review':'⚐ Mark for review';
    $('clearBtn').disabled=!session.answers[i];
    $('prevBtn').disabled=i===0;
    $('nextBtn').disabled=i===qs.length-1;
    $('progressText').textContent=answeredCount()+' answered · '+session.marked.filter(Boolean).length+' marked · '+qs.length+' total';
    $('progressBar').style.width=Math.round(100*answeredCount()/qs.length)+'%';
    renderPalette();
    save();
  }
  function tick(){
    if(!session||session.finished||!session.timed){$('clock').hidden=true;return}
    $('clock').hidden=false;
    const seconds=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));
    const m=Math.floor(seconds/60),s=String(seconds%60).padStart(2,'0');
    $('clock').textContent='Time left '+m+':'+s;
    if(!seconds)finish(true);
  }
  function endTimer(){if(timingHandle){clearInterval(timingHandle);timingHandle=null}}
  function finish(expired=false){
    if(!session||session.finished)return;
    const missing=qs.length-answeredCount();
    if(!expired&&missing&&!confirm(missing+' questions are unanswered. Submit your full available PYQ quiz?'))return;
    endTimer();
    session.finished=true;save();
    const correct=qs.reduce((n,q,i)=>n+(session.answers[i]===q.CorrectAnswer?1:0),0);
    const attempted=answeredCount(),wrong=attempted-correct,accuracy=Math.round(correct/qs.length*100);
    $('resultHeading').textContent=expired?'Time expired — quiz submitted':'Full available PYQ quiz completed';
    $('resultSummary').textContent=qs.length+' available adapted questions · '+correct+' correct · '+wrong+' incorrect · '+(qs.length-attempted)+' unattempted · '+accuracy+'% of total';
    $('score').textContent=correct+' / '+qs.length;
    const history=storageRead(HISTORY);
    const items=Array.isArray(history)?history.filter(x=>x&&x.key!==activeKey):[];
    items.unshift({key:activeKey,total:qs.length,correct,accuracy,ts:new Date().toISOString()});
    storageWrite(HISTORY,items.slice(0,30));
    $('reviewFilter').value='all';renderReview();
    show('results');
  }
  function renderReview(){
    const list=$('reviewList');list.replaceChildren();
    if(!session)return;
    const filter=$('reviewFilter').value;
    qs.forEach((q,i)=>{
      const answer=session.answers[i],right=answer===q.CorrectAnswer;
      if(filter==='wrong'&&(answer===null||right))return;
      if(filter==='unanswered'&&answer!==null)return;
      if(filter==='review'&&!session.marked[i])return;
      const item=document.createElement('details');item.className='review-item';
      const head=document.createElement('summary');head.textContent=(i+1)+'. '+q.Question+' — '+(answer===null?'Unattempted':right?'Correct':'Incorrect');
      item.append(head);
      const caption=document.createElement('p');caption.textContent=q.SourceExam+' · '+q.SourceYear+
        (q.SourceQuestion?' · original question '+q.SourceQuestion:'');
      item.append(caption);
      const result=document.createElement('p');result.className=right?'correct-text':'wrong-text';
      result.textContent='Your answer: '+(answer?answer+'. '+q['Option'+answer]:'Not answered')+
        ' | Correct: '+q.CorrectAnswer+'. '+q['Option'+q.CorrectAnswer];
      item.append(result);
      const options=document.createElement('div');options.className='review-options';
      abc.forEach(letter=>{
        const block=document.createElement('p');const text=letter+'. '+q['Option'+letter];
        block.textContent=text+' — '+(q['Explanation'+letter]||'Explanation not recorded');
        if(letter===q.CorrectAnswer)block.classList.add('correct-text');
        options.append(block);
      });
      item.append(options);
      if(q.AnswerVerification){const info=document.createElement('p');info.className='verification';info.textContent='Answer verification: '+q.AnswerVerification;item.append(info)}
      const sources=document.createElement('div');sources.className='source-links';
      link(sources,q.SourceURL,'Original question paper ↗');
      link(sources,q.AnswerKeyURL,'Answer key ↗');
      item.append(sources);
      list.append(item);
    });
    if(!list.childElementCount)list.textContent='No questions match this review filter.';
  }
  $('examSelect').addEventListener('change',()=>{updateYears('');updatePreview()});
  $('yearSelect').addEventListener('change',updatePreview);
  $('startBtn').addEventListener('click',start);
  $('prevBtn').addEventListener('click',()=>{if(session.index){session.index--;renderQuestion()}});
  $('nextBtn').addEventListener('click',()=>{if(session.index<qs.length-1){session.index++;renderQuestion()}});
  $('markBtn').addEventListener('click',()=>{session.marked[session.index]=!session.marked[session.index];renderQuestion()});
  $('clearBtn').addEventListener('click',()=>{session.answers[session.index]=null;renderQuestion()});
  $('submitBtn').addEventListener('click',()=>finish(false));
  $('reviewFilter').addEventListener('change',renderReview);
  $('returnBtn').addEventListener('click',()=>{endTimer();session=null;qs=[];show('setup');updatePreview()});
  $('backToSetup').addEventListener('click',()=>{endTimer();save();session=null;qs=[];show('setup');updatePreview()});
  $('retryBtn').addEventListener('click',()=>{
    if(!confirm('Start a new attempt? Your completed score remains in local history.'))return;
    storageWrite(activeKey,null);session=null;show('setup');start();
  });
  timingHandle=setInterval(tick,1000);
  fetch(FEED,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('PYQ question bank unavailable');return r.json()})
    .then(data=>{
      if(!Array.isArray(data))throw Error('Invalid PYQ bank');
      bank=collect(data);
      if(!bank.length)throw Error('No eligible PYQs found');
      const exams=[...new Set(bank.map(q=>q.SourceExam))].sort();
      fillOptions($('examSelect'),exams,'All available exams',urlParams.get('exam')||'');
      updateYears(urlParams.get('year')||'');
      setStatus('Loaded '+bank.length+' source-attributed adapted PYQs.');
      updatePreview();
    }).catch(err=>{setStatus('Could not load PYQ quizzes: '+err.message);$('startBtn').disabled=true});
})();
