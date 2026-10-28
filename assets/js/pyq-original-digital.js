/* Verbatim full original-paper player: runs only on a completely vetted,
   version-matched, reproduction-authorised paper. Never synthesizes gaps. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const api=window.ClearExamsFullOriginal;
 const ABC=api?.choices||['A','B','C','D'];
 const search=new URLSearchParams(location.search);
 const STORE='clearexamsVerifiedOriginalPaperProgressV1:';
 let papers=[],paper=null,state=null,lang='en',timer=0;
 const read=(id)=>{try{return JSON.parse(localStorage.getItem(STORE+id)||'null')}catch{return null}};
 const persist=()=>{if(paper&&state)try{localStorage.setItem(STORE+paper.id,JSON.stringify(state))}catch{}};
 function show(which){for(const id of ['picker','quiz','results'])$(id).hidden=id!==which;window.scrollTo(0,0)}
 function text(en,ta){return lang==='ta'?(ta||en):en}
 function safeLink(box,url,label){
   box.replaceChildren();const valid=api.sourceURL(url);if(!valid)return;
   const a=document.createElement('a');a.href=valid;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;box.append(a);
 }
 function countAnswered(){return state.answers.filter(Boolean).length}
 function palette(){
   const box=$('palette');box.replaceChildren();
   paper.questions.forEach((q,i)=>{
     const b=document.createElement('button');b.type='button';b.textContent=i+1;
     b.className='number'+(i===state.index?' current':'')+(state.answers[i]?' answered':'')+(state.marked[i]?' marked':'');
     b.setAttribute('aria-label','Question '+(i+1)+(state.answers[i]?', answered':''));
     b.addEventListener('click',()=>{state.index=i;persist();render()});box.append(b);
   });
 }
 function makeVisuals(items,placement,language){
   const fragment=document.createDocumentFragment();
   (Array.isArray(items)?items:[]).filter(v=>v.placement===placement&&(v.language===language||v.language==='both'||!v.language)).forEach(v=>{
     const img=document.createElement('img');img.src=v.src;img.alt=v.alt;img.loading='lazy';img.className='original-figure';fragment.append(img);
   });
   return fragment;
 }
 function render(){
   if(!paper||!state||state.finished)return;
   document.documentElement.lang=lang;
   const q=paper.questions[state.index];
   $('languageToggle').hidden=paper.language!=='ta-en';
   $('languageToggle').textContent=lang==='ta'?'English':'தமிழ்';
   $('progressLabel').textContent=(state.index+1)+' / '+paper.questionCount+' · '+countAnswered()+' answered';
   $('progressBar').style.width=(100*countAnswered()/paper.questionCount)+'%';
   $('number').textContent=text('Question '+q.number,'வினா '+q.number);
   $('questionText').textContent=q.text[lang]||q.text[paper.language==='ta-en'?'ta':paper.language];
   const figures=$('questionFigures');figures.replaceChildren(makeVisuals(q.visuals,'stem',lang));
   const options=q.options[lang]||q.options[paper.language==='ta-en'?'ta':paper.language];
   const wrap=$('options');wrap.replaceChildren();
   ABC.forEach(letter=>{
     const b=document.createElement('button');b.type='button';b.className='option'+(state.answers[state.index]===letter?' selected':'');
     b.textContent=letter+'. '+options[letter];
     b.append(makeVisuals(q.visuals,letter,lang));
     b.setAttribute('aria-pressed',state.answers[state.index]===letter?'true':'false');
     b.addEventListener('click',()=>{state.answers[state.index]=letter;persist();render()});
     wrap.append(b);
   });
   $('prev').disabled=state.index===0;
   $('next').disabled=state.index===paper.questionCount-1;
   $('clear').disabled=!state.answers[state.index];
   $('mark').textContent=state.marked[state.index]?'⚑ Marked for review':'⚐ Mark for review';
   palette();persist();clock();
 }
 function clock(){
   if(!paper||!state||state.finished)return;
   const remaining=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
   $('clock').textContent='Time left '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');
   if(remaining===0)finish(true);
 }
 function launch(p){
   const validation=api.validate(p);if(!validation.ok)throw Error('Paper failed readiness gate: '+validation.errors[0]);
   paper=p;lang=p.language==='ta'?'ta':p.language==='ta-en'?'ta':'en';
   const old=read(p.id),ids=p.questions.map(q=>q.number);
   if(old&&old.version===1&&!old.finished&&Array.isArray(old.ids)&&old.ids.length===p.questionCount&&
      old.ids.every((id,i)=>id===ids[i])&&Array.isArray(old.answers)&&old.answers.length===p.questionCount&&
      old.answers.every(a=>a===null||ABC.includes(a))&&Array.isArray(old.marked)&&old.marked.length===p.questionCount){
     state=old;
   }else{
     state={version:1,ids,answers:Array(p.questionCount).fill(null),marked:Array(p.questionCount).fill(false),
        index:0,deadline:Date.now()+(Number.isInteger(p.durationMinutes)?p.durationMinutes:180)*60000,finished:false};
   }
   $('paperHeading').textContent=p.exam+' · '+p.year+' · '+p.paperVersion;
   safeLink($('paperSource'),p.officialPaperUrl,'Original official PDF ↗');
   safeLink($('finalKeySource'),p.finalKeyUrl,'Official final answer key ↗');
   show('quiz');render();
 }
 function finish(expired=false){
   if(!state||state.finished)return;
   const missing=paper.questionCount-countAnswered();
   if(!expired&&missing&&!confirm(missing+' questions are unanswered. Submit the full original paper?'))return;
   state.finished=true;persist();
   const correct=paper.questions.reduce((n,q,i)=>n+(state.answers[i]===q.correct?1:0),0);
   const attempted=countAnswered(),wrong=attempted-correct;
   const scoreMax=paper.questionCount*(paper.marksPerQuestion||1);
   const totalMarks=correct*(paper.marksPerQuestion||1)-wrong*(paper.negativeMarks||0);
   $('resultHeading').textContent=expired?'Time expired — full paper submitted':'Full original paper completed';
   $('resultScore').textContent=correct+' / '+paper.questionCount+' correct';
   $('resultStats').textContent=attempted+' attempted · '+wrong+' incorrect · '+(paper.questionCount-attempted)+' unanswered · '+totalMarks+' / '+scoreMax+' marks';
   renderReview();show('results');
 }
 function renderReview(){
   const box=$('review');box.replaceChildren();const filter=$('reviewFilter').value;
   paper.questions.forEach((q,i)=>{
      const a=state.answers[i],right=a===q.correct;
      if(filter==='wrong'&&(right||!a))return;
      if(filter==='unanswered'&&a)return;
      if(filter==='marked'&&!state.marked[i])return;
      const el=document.createElement('details');el.className='review-item';
      el.append(makeVisuals(q.visuals,'stem',lang));
      const summary=document.createElement('summary');summary.textContent=q.number+'. '+(q.text[lang]||q.text[paper.language==='ta-en'?'ta':paper.language])+
        ' — '+(!a?'Unanswered':right?'Correct':'Incorrect');el.append(summary);
      const opts=q.options[lang]||q.options[paper.language==='ta-en'?'ta':paper.language];
      ABC.forEach(letter=>{
        const p=document.createElement('p');p.textContent=letter+'. '+opts[letter];
        p.append(makeVisuals(q.visuals,letter,lang));
        if(letter===q.correct)p.className='correct';if(letter===a&&letter!==q.correct)p.className='incorrect';
        el.append(p);
      });
      const status=document.createElement('p');status.className='answer-key';
      status.textContent='Your answer: '+(a||'Unanswered')+' · Official final-key answer: '+q.correct;el.append(status);
      box.append(el);
   });
   if(!box.childElementCount)box.textContent='No questions match this review filter.';
 }
 $('languageToggle').addEventListener('click',()=>{lang=lang==='en'?'ta':'en';if(state?.finished)renderReview();else render()});
 $('prev').addEventListener('click',()=>{state.index--;render()});
 $('next').addEventListener('click',()=>{state.index++;render()});
 $('clear').addEventListener('click',()=>{state.answers[state.index]=null;render()});
 $('mark').addEventListener('click',()=>{state.marked[state.index]=!state.marked[state.index];render()});
 $('submit').addEventListener('click',()=>finish(false));
 $('reviewFilter').addEventListener('change',renderReview);
 $('backToPapers').addEventListener('click',()=>show('picker'));
 $('tryAgain').addEventListener('click',()=>{if(!confirm('Clear answers and start a new full paper attempt?'))return;state=null;launch(paper)});
 timer=setInterval(clock,1000);
 fetch('data/quizzes/verified-full-original-papers.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Full-paper manifest unavailable');return r.json()}).then(manifest=>{
   if(manifest.schemaVersion!==1||!Array.isArray(manifest.papers))throw Error('Invalid paper manifest');
   papers=manifest.papers.filter(x=>api.validate(x).ok);
   const box=$('paperList');box.replaceChildren();
   if(!papers.length){$('availability').textContent='No complete, authorised, final-key-verified digital transcriptions have been published. Use the official PDF-linked answer sheet instead.';return}
   $('availability').textContent=papers.length+' complete verified digital papers available.';
   papers.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='paper-choice';
     b.textContent=p.exam+' · '+p.year+' · '+p.paperVersion+' · '+p.questionCount+' original questions';
     b.addEventListener('click',()=>launch(p));box.append(b)});
   const requested=papers.find(p=>p.id===search.get('paper'));if(requested)launch(requested);
 }).catch(err=>{$('availability').textContent='Could not load verified full papers: '+err.message});
})();