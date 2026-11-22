(function(){
  'use strict';
  // A local, anonymous first-start cohort. No candidate identity or answers are transmitted.
  const KEY='clearexamsGroup4DiagnosticV1';
  const SESSION_KEY='clearexamsGroup4DiagnosticBrowserSessionV1';
  const DAY=86400000, WEEK=7*DAY, RETURN_GAP=30*60000;
  const PAPER_ID='tnpsc-group-iv-2024-general-tamil-general-studies';
  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&typeof x==='object'?x:null}catch{return null}}
  function save(state){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
  function sessionToken(){
    try{
      let id=sessionStorage.getItem(SESSION_KEY);
      if(!id){id=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);sessionStorage.setItem(SESSION_KEY,id)}
      return id;
    }catch{return null}
  }
  function send(name,params){
    if(typeof window.gtag!=='function')return;
    try{window.gtag('event',name,Object.assign({exam_name:'TNPSC Group IV',paper_year:2024,question_count:200,diagnostic_format:'official_pdf_companion',transport_type:'beacon'},params||{}))}catch{}
  }
  function start(entryPoint,deferred){
    const now=Date.now(),old=read()||{};
    if(old.last_started_at&&!old.attempt_completed)return {resumed:true};
    const fresh=!old.first_started_at||now-old.first_started_at>WEEK;
    const state=fresh?{}:old;
    state.first_started_at=fresh?now:state.first_started_at;
    state.returned_at=fresh?null:(state.returned_at||null);
    state.attempt_number=(Number(state.attempt_number)||0)+1;
    state.last_started_at=now;
    state.attempt_completed=false;
    state.last_completed_at=null;
    state.launch_session=sessionToken();
    state.pending_start=!!deferred;
    state.entry_point=entryPoint||'diagnostic';
    save(state);
    if(!deferred)send('g4_diagnostic_start',{entry_point:state.entry_point,attempt_number:state.attempt_number});
    return {resumed:false};
  }
  function flushStart(){
    const state=read();
    if(!state||!state.pending_start)return;
    if(!/\/pyq-original-paper\.html$/.test(location.pathname)||new URLSearchParams(location.search).get('diagnostic')!=='group4')return;
    state.pending_start=false;save(state);
    send('g4_diagnostic_start',{entry_point:state.entry_point||'landing',attempt_number:state.attempt_number||1});
  }
  function complete(info){
    const state=read();
    if(!state||!state.last_started_at||state.attempt_completed)return false;
    state.attempt_completed=true;
    state.last_completed_at=Date.now();
    save(state);
    const p=info||{};
    send('g4_diagnostic_complete',{
      answered_count:Number(p.answered)||0,
      graded_count:Number(p.graded)||0,
      correct_count:Number(p.correct)||0,
      score_percent:Number(p.accuracy)||0,
      auto_submit:!!p.autoSubmit,
      attempt_number:state.attempt_number||1
    });
    return true;
  }
  function checkReturn(){
    const state=read(),now=Date.now();
    if(!state||!state.first_started_at||state.returned_at)return;
    const age=now-state.first_started_at;
    if(age<RETURN_GAP||age>WEEK||state.launch_session===sessionToken())return;
    state.returned_at=now;
    save(state);
    send('g4_diagnostic_return_7d',{
      days_since_first_start:Math.floor(age/DAY),
      completed_before_return:!!state.attempt_completed
    });
  }
  window.ceGroup4Diagnostic={
    paperId:PAPER_ID,
    start:start,
    complete:complete,
    getState:read,
    hasActiveAttempt:function(){const state=read();return !!(state&&state.last_started_at&&!state.attempt_completed)},
    trackHomepageClick:function(){send('g4_diagnostic_home_cta_click',{placement:'homepage_hero'})}
  };
  flushStart();
  checkReturn();
})();