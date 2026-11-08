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
  // Newly adapted Tamil questions retain English text while existing questions
  // fall back to English until translations have been individually reviewed.
  const display=(q,field)=>$('quizLanguage').value==='ta'
    ?safeText(q[field+'Tamil'])||safeText(q[field]):safeText(q[field]);
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
  function limitFor(pool){const count=$('lengthSelect').value;return count==='all'?pool.length:Math.min(pool.length,Number(count)||10)}
  function shuffle(rows){const copy=rows.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
  function getKey(exam,year){const base=SESSION_PREFIX+encodeURIComponent(exam||'all')+':'+(year||'all');return base+($('lengthSelect').value==='all'?'':':'+$('lengthSelect').value)}
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
  function validSaved(s,pool){
    if(!s||s.version!==1||!Array.isArray(s.ids)||s.ids.length!==limitFor(pool))return false;
    const ids=new Set(pool.map(q=>q.ID));
    return new Set(s.ids).size===s.ids.length&&s.ids.every(id=>ids.has(id))&&
      Array.isArray(s.answers)&&s.answers.length===s.ids.length&&
      Array.isArray(s.marked)&&s.marked.length===s.ids.length&&
      s.marked.every(v=>typeof v==='boolean')&&
      Number.isInteger(s.index)&&s.index>=0&&s.index<s.ids.length&&
      s.answers.every(v=>v===null||abc.includes(v));
  }
  function updatePreview(){
    const pool=currentSelection();
    const count=limitFor(pool),exam=$('examSelect').value,year=$('yearSelect').value;
    const key=getKey(exam,year);
    const saved=storageRead(key);
    const reusable=validSaved(saved,pool)&&!saved.finished;
    $('preview').textContent=count
      ?count+' adapted questions · '+(exam||'Mixed exams')+' · '+(year||'All years')+
        (pool.length>count?' · '+pool.length+' in the available bank.':' · Entire available bank.')
      :'No reviewed PYQs are available for this selection.';
    $('startBtn').disabled=!count;
    $('startBtn').textContent=reusable?'Resume quiz ('+count+' questions)':'Start '+count+'-question quiz →';
    const hist=storageRead(HISTORY)||[];
    const latest=Array.isArray(hist)?hist.find(h=>h.key===key):null;
    $('previousScore').textContent=latest?'Last attempt: '+latest.correct+'/'+latest.total+' correct · '+latest.accuracy+'%':'';
  }
  function save(){if(session&&activeKey)storageWrite(activeKey,session)}
  function show(which){
    setup.hidden=which!=='setup';quizView.hidden=which!=='quiz';results.hidden=which!=='results';
    window.scrollTo(0,0);
  }
  function start(){
    const pool=currentSelection();
    if(!pool.length){setStatus('No questions available.');return}
    activeKey=getKey($('examSelect').value,$('yearSelect').value);
    const saved=storageRead(activeKey);
    if(validSaved(saved,pool)&&!saved.finished){
      session=saved;
      const lookup=new Map(pool.map(q=>[q.ID,q]));
      qs=saved.ids.map(id=>lookup.get(id));
    }else{
      qs=shuffle(pool).slice(0,limitFor(pool));
      session={version:1,ids:qs.map(q=>q.ID),answers:Array(qs.length).fill(null),marked:Array(qs.length).fill(false),
        index:0,timed:$('timedCheck').checked,deadline:$('timedCheck').checked?Date.now()+qs.length*60000:null,finished:false};
      save();
    }
    endTimer();timingHandle=setInterval(tick,1000);
    $('quizTitle').textContent=($('examSelect').value||'Mixed exams')+' · '+($('yearSelect').value||'All years')+
      ' · '+qs.length+' questions';
    show('quiz');renderQuestion(true);tick();
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
      b.addEventListener('click',()=>{session.index=i;save();renderQuestion(true)});grid.append(b);
    });
  }
  function renderQuestion(scrollToQuestion=false){
    if(!session||session.finished)return;
    const i=session.index,q=qs[i];
    $('questionNumber').textContent='Question '+(i+1)+' of '+qs.length;
    $('sourceLabel').textContent=q.SourceExam+' · '+q.SourceYear+(q.SourcePaper?' · '+q.SourcePaper:'')+
      (q.SourceQuestion?' · source Q'+q.SourceQuestion:'');
    $('questionText').textContent=display(q,'Question');
    const options=$('options');options.replaceChildren();
    abc.forEach(letter=>{
      const b=document.createElement('button');b.type='button';b.className='option';
      if(session.answers[i]===letter)b.classList.add('selected');
      b.setAttribute('aria-pressed',String(session.answers[i]===letter));
      const lead=document.createElement('strong');lead.textContent=letter;
      b.append(lead,document.createTextNode(display(q,'Option'+letter)));
      b.addEventListener('click',()=>{
        session.answers[i]=letter;save();
        options.querySelectorAll('button.option').forEach((choice,index)=>{
          const picked=abc[index]===letter;choice.classList.toggle('selected',picked);
          choice.setAttribute('aria-pressed',String(picked));
        });
        updateProgress();
      });
      options.append(b);
    });
    $('markBtn').textContent=session.marked[i]?'⚑ Marked for review':'⚐ Review later';
    $('clearBtn').disabled=!session.answers[i];
    $('prevBtn').disabled=i===0;
    const last=i===qs.length-1;
    $('nextBtn').hidden=last;
    $('submitBtn').textContent=last?'Finish & review':'Finish quiz';
    $('quizView').querySelector('.actions').classList.toggle('on-last',last);
    updateProgress();
    if(scrollToQuestion)$('questionNumber').scrollIntoView({block:'start',behavior:'instant'});
    save();
  }
  function updateProgress(){
    $('clearBtn').disabled=!session.answers[session.index];
    const count=answeredCount();
    $('progressText').textContent=count+' of '+qs.length+' answered · '+session.marked.filter(Boolean).length+' marked';
    $('progressBar').style.width=Math.round(100*count/qs.length)+'%';
    const track=$('progressBar').parentElement;
    track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(qs.length));
    track.setAttribute('aria-valuenow',String(count));
    renderPalette();
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
    if(!expired&&missing&&!confirm(missing+' questions are unanswered. Finish this attempt anyway?'))return;
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
      const head=document.createElement('summary');head.textContent=(i+1)+'. '+display(q,'Question')+' — '+(answer===null?'Unattempted':right?'Correct':'Incorrect');
      item.append(head);
      const caption=document.createElement('p');caption.textContent=q.SourceExam+' · '+q.SourceYear+
        (q.SourceQuestion?' · original question '+q.SourceQuestion:'');
      item.append(caption);
      const result=document.createElement('p');result.className=right?'correct-text':'wrong-text';
      result.textContent='Your answer: '+(answer?answer+'. '+display(q,'Option'+answer):'Not answered')+
        ' | Correct: '+q.CorrectAnswer+'. '+display(q,'Option'+q.CorrectAnswer);
      item.append(result);
      const options=document.createElement('div');options.className='review-options';
      abc.forEach(letter=>{
        const block=document.createElement('p');const text=letter+'. '+display(q,'Option'+letter);
        block.textContent=text+' — '+(display(q,'Explanation'+letter)||'Explanation not recorded');
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
  $('quizLanguage').addEventListener('change',()=>{if(session){if(session.finished)renderReview();else renderQuestion()}});
  $('examSelect').addEventListener('change',()=>{updateYears('');updatePreview()});
  $('yearSelect').addEventListener('change',updatePreview);
  $('lengthSelect').addEventListener('change',updatePreview);
  $('startBtn').addEventListener('click',start);
  $('prevBtn').addEventListener('click',()=>{if(session.index){session.index--;renderQuestion(true)}});
  $('nextBtn').addEventListener('click',()=>{if(session.index<qs.length-1){session.index++;renderQuestion(true)}});
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
  fetch(FEED,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('PYQ question bank unavailable');return r.json()})
    .then(data=>{
      if(!Array.isArray(data))throw Error('Invalid PYQ bank');
      bank=collect(data);
      if(!bank.length)throw Error('No eligible PYQs found');
      const exams=[...new Set(bank.map(q=>q.SourceExam))].sort();
      fillOptions($('examSelect'),exams,'All exams (mixed practice)',urlParams.get('exam')||'');
      updateYears(urlParams.get('year')||'');
      const requestedLength=urlParams.get('count');
      $('lengthSelect').value=['10','20','all'].includes(requestedLength)?requestedLength:'10';
      if(urlParams.get('lang')==='ta')$('quizLanguage').value='ta';
      setStatus(bank.length+' reviewed adapted questions available.');
      updatePreview();
      if(urlParams.get('start')==='1'&&!$('startBtn').disabled)start();
    }).catch(err=>{setStatus('Could not load PYQ quizzes: '+err.message);$('startBtn').disabled=true});
})();
