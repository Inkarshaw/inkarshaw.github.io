(()=>{'use strict';
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}))}
/* Observe later-site visits by candidates who started the Group IV diagnostic.
   Only a first-start timestamp and anonymous return flag are stored locally. */
if(!document.querySelector('script[src*="group4-diagnostic-analytics.js"]')){
  const diagnosticTracker=document.createElement('script');
  diagnosticTracker.src='/assets/js/group4-diagnostic-analytics.js';
  diagnosticTracker.defer=true;
  document.head.appendChild(diagnosticTracker);
}
let promptEvent=null;const installButton=()=>document.getElementById('installApp');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;document.querySelectorAll('#installApp,#ceInstallApp').forEach(b=>b.hidden=false)});
window.addEventListener('appinstalled',()=>{promptEvent=null;document.querySelectorAll('#installApp,#ceInstallApp').forEach(b=>b.hidden=true);if(window.gtag)gtag('event','pwa_installed')});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#installApp,#ceInstallApp');if(!b||!promptEvent)return;promptEvent.prompt();const choice=await promptEvent.userChoice.catch(()=>null);if(window.gtag)gtag('event','pwa_install_prompt',{outcome:choice&&choice.outcome||'unknown'});promptEvent=null;b.hidden=true});

const THEME_KEY='clearexamsThemeV1',TARGET_KEY='clearexamsTargetExamV1';
const targetNames={tnpsc:'TNPSC',tnusrb:'TNUSRB',upsc:'UPSC',ssc:'SSC',banking:'Banking',railways:'Railways'};
function readPreference(key){
  try{return localStorage.getItem(key)}catch{return null}
}
function theme(){return document.documentElement.dataset.ceTheme||readPreference(THEME_KEY)||'light'}
function applyTheme(value){document.documentElement.dataset.ceTheme=value;try{localStorage.setItem(THEME_KEY,value)}catch{}const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=value==='dark'?'#08131f':'#071c33';document.querySelectorAll('[data-ce-theme-label]').forEach(x=>x.textContent=value==='dark'?'Use light mode':'Use dark mode')}
applyTheme(theme());

const style=document.createElement('style');style.textContent=`
.ce-bottom-nav,.ce-more-sheet,.ce-target-chip{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.ce-bottom-nav{display:none}.ce-more-backdrop{display:none}.ce-target-chip{position:fixed;right:14px;top:78px;z-index:45;display:none;align-items:center;gap:6px;padding:7px 10px;border:1px solid #c6d8ef;border-radius:999px;background:rgba(255,255,255,.95);box-shadow:0 7px 22px rgba(7,28,51,.12);color:#174b96;font-size:.75rem;font-weight:850;backdrop-filter:blur(12px)}
.ce-target-chip::before{content:"●";font-size:.58rem;color:#1463ff}
.ce-more-sheet{position:fixed;left:10px;right:10px;bottom:78px;z-index:101;display:none;max-height:min(76vh,630px);overflow-y:auto;overscroll-behavior:contain;padding:14px;border:1px solid #dbe5ef;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(7,28,51,.24)}
.ce-more-sheet.open{display:block}.ce-more-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}.ce-more-head h2{margin:0;font-size:1.04rem;color:#10233b}.ce-more-close{min-width:44px;min-height:44px;border:1px solid #cbd8e6;border-radius:10px;background:transparent;color:#294b70;font:inherit;font-weight:850;cursor:pointer}.ce-more-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ce-more-grid a,.ce-more-grid button{min-height:48px;display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid #dbe5ef;border-radius:12px;background:#f8fbff;color:#10233b;text-decoration:none;font:inherit;font-weight:750;text-align:left}.ce-more-grid a.ce-more-feature{background:#eaf3ff;border-color:#a6c7ed;align-items:center}.ce-more-feature span{display:flex;flex-direction:column;gap:1px}.ce-more-feature small{font-size:.72rem;font-weight:550;color:#486780}.ce-more-grid a:focus-visible,.ce-more-grid button:focus-visible,.ce-more-close:focus-visible,.ce-bottom-nav a:focus-visible,.ce-bottom-nav button:focus-visible{outline:3px solid #2474e8;outline-offset:2px}.ce-more-backdrop.open{display:block;position:fixed;inset:0;z-index:100;background:rgba(7,28,51,.28)}
html[data-ce-theme="dark"]{color-scheme:dark}html[data-ce-theme="dark"] body{background:#08131f!important;color:#e5eef8!important}
html[data-ce-theme="dark"] header,html[data-ce-theme="dark"] .header,html[data-ce-theme="dark"] .site-header,html[data-ce-theme="dark"] .panel,html[data-ce-theme="dark"] .card,html[data-ce-theme="dark"] .resource,html[data-ce-theme="dark"] .tile,html[data-ce-theme="dark"] .today,html[data-ce-theme="dark"] .step,html[data-ce-theme="dark"] .toolbar,html[data-ce-theme="dark"] .quick a,html[data-ce-theme="dark"] .target-actions,html[data-ce-theme="dark"] .post,html[data-ce-theme="dark"] .summary-card,html[data-ce-theme="dark"] .notification-card,html[data-ce-theme="dark"] .reader-unit,html[data-ce-theme="dark"] .comp-card,html[data-ce-theme="dark"] .study-step,html[data-ce-theme="dark"] .question-box,html[data-ce-theme="dark"] .timer,html[data-ce-theme="dark"] .framework,html[data-ce-theme="dark"] .day{background:#0f2030!important;color:#e5eef8!important;border-color:#294157!important}
html[data-ce-theme="dark"] .muted,html[data-ce-theme="dark"] .source,html[data-ce-theme="dark"] .tile p,html[data-ce-theme="dark"] .card p,html[data-ce-theme="dark"] .step span,html[data-ce-theme="dark"] .post p,html[data-ce-theme="dark"] .post-body p,html[data-ce-theme="dark"] .post-body ul,html[data-ce-theme="dark"] .summary-card span,html[data-ce-theme="dark"] .notification-card p{color:#a9bbcd!important}
html[data-ce-theme="dark"] select,html[data-ce-theme="dark"] input,html[data-ce-theme="dark"] textarea,html[data-ce-theme="dark"] .button.secondary,html[data-ce-theme="dark"] .tab,html[data-ce-theme="dark"] .toggle button,html[data-ce-theme="dark"] .clear-filter{background:#13283a!important;color:#e5eef8!important;border-color:#35536d!important}
html[data-ce-theme="dark"] .ce-more-sheet{background:#0f2030;border-color:#294157}html[data-ce-theme="dark"] .ce-more-head h2{color:#e5eef8}html[data-ce-theme="dark"] .ce-more-close{color:#e5eef8;border-color:#35536d}html[data-ce-theme="dark"] .ce-more-grid a.ce-more-feature{background:#183759;border-color:#315b83}html[data-ce-theme="dark"] .ce-more-feature small{color:#bdd1e8}html[data-ce-theme="dark"] .ce-more-grid a,html[data-ce-theme="dark"] .ce-more-grid button{background:#13283a;color:#e5eef8;border-color:#35536d}html[data-ce-theme="dark"] .ce-target-chip{background:rgba(15,32,48,.96);color:#9fc7ff;border-color:#35536d}
@media(max-width:760px){
 body{padding-bottom:76px!important}.footer,footer{padding-bottom:92px!important}
 .ce-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:99;display:grid;grid-template-columns:repeat(5,1fr);padding:7px max(6px,env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));border-top:1px solid #dbe5ef;background:rgba(255,255,255,.96);box-shadow:0 -8px 26px rgba(7,28,51,.08);backdrop-filter:blur(16px)}
 .ce-bottom-nav a,.ce-bottom-nav button{min-height:52px;border:0;background:transparent;color:#607086;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-decoration:none;font:inherit;font-size:.68rem;font-weight:750}
 .ce-bottom-nav .ico{font-size:1.22rem;line-height:1}.ce-bottom-nav a,.ce-bottom-nav button{touch-action:manipulation}.ce-bottom-nav .active{color:#1463ff}.ce-target-chip{display:flex;top:70px}
 html[data-ce-theme="dark"] .ce-bottom-nav{background:rgba(15,32,48,.97);border-color:#294157}html[data-ce-theme="dark"] .ce-bottom-nav a,html[data-ce-theme="dark"] .ce-bottom-nav button{color:#a9bbcd}html[data-ce-theme="dark"] .ce-bottom-nav .active{color:#72a6ff}
}
`;document.head.appendChild(style);


function primarySection(path){
  const p=path.replace(/\/+$/,'')||'/';
  if(p==='/'||p==='/index.html')return 'home';
  if(['/start.html','/exam-preparation.html','/exam-overview.html','/tnpsc.html','/tnusrb.html','/upsc.html','/exam-posts.html','/syllabus.html'].includes(p))return 'exams';
  if(p==='/pyq-hub.html'||p.startsWith('/pyq-')||p.includes('-pyq')||p.includes('/previous_year_questions'))return 'pyqs';
  if(p==='/practice.html'||p==='/daily-quiz.html'||p==='/group4-diagnostic.html'||
     (p==='/tnpsc/mocks'||p.startsWith('/tnpsc/mocks/'))||p==='/tnpsc-group4-mocks.html'||p.includes('textbook')||p.includes('school-book-quiz')||p.endsWith('-quiz.html')||
     p==='/wrong-answers.html')return 'practice';
  return 'more';
}
function initShell(){
  if(document.querySelector('.ce-bottom-nav'))return;
  const section=primarySection(location.pathname);
  const nav=document.createElement('nav');nav.className='ce-bottom-nav';nav.setAttribute('aria-label','Quick student navigation');
  const items=[
    {icon:'⌂',label:'Home',href:'/index.html',section:'home'},
    {icon:'▤',label:'Exams',href:'/start.html',section:'exams'},
    {icon:'✓',label:'Practice',href:'/practice.html',section:'practice'},
    {icon:'▣',label:'PYQs',href:'/pyq-hub.html',section:'pyqs'}
  ];
  for(const item of items){
    const a=document.createElement('a');a.href=item.href;
    if(section===item.section){a.classList.add('active');a.setAttribute('aria-current','page')}
    const ico=document.createElement('span');ico.className='ico';ico.setAttribute('aria-hidden','true');ico.textContent=item.icon;
    const label=document.createElement('span');label.textContent=item.label;
    a.append(ico,label);nav.append(a);
  }
  const more=document.createElement('button');more.type='button';more.id='ceMoreBtn';
  more.setAttribute('aria-haspopup','dialog');more.setAttribute('aria-controls','ceMoreSheet');
  more.setAttribute('aria-expanded','false');more.setAttribute('aria-label','More study resources');
  if(section==='more')more.classList.add('active');
  const icon=document.createElement('span');icon.className='ico';icon.textContent='•••';icon.setAttribute('aria-hidden','true');
  const lbl=document.createElement('span');lbl.textContent='More';more.append(icon,lbl);
  nav.append(more);document.body.append(nav);

  const backdrop=document.createElement('div');backdrop.className='ce-more-backdrop';document.body.append(backdrop);
  const sheet=document.createElement('div');sheet.className='ce-more-sheet';sheet.id='ceMoreSheet';
  sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
  sheet.setAttribute('aria-labelledby','ceMoreHeading');sheet.setAttribute('aria-hidden','true');
  sheet.innerHTML='<div class="ce-more-head"><h2 id="ceMoreHeading">More study resources</h2><button type="button" class="ce-more-close" id="ceMoreClose" aria-label="Close resources menu">✕</button></div>'+
    '<div class="ce-more-grid">'+
    '<a class="ce-more-feature" href="/dashboard.html"><span aria-hidden="true">▦</span><span><strong>My dashboard</strong><small>Progress and review</small></span></a>'+
    '<a class="ce-more-feature" href="/current-affairs/text/"><span aria-hidden="true">◫</span><span><strong>Current affairs</strong><small>Daily text editions</small></span></a>'+
    '<a href="/start.html#exam-directory">▤ All exams</a><a href="/search.html">⌕ Search</a><a href="/daily-quiz.html">✓ Daily Quiz</a>'+
    '<a href="/textbook-quiz.html">▤ TN School Quiz</a><a href="/ncert-school-book-quiz.html">▤ NCERT Quiz</a>'+
    '<a href="/tnpsc/mocks/">◷ Group IV Mocks</a><a href="/pyq-cds.html">▣ CDS PYQs</a>'+
    '<a href="/syllabus.html">≡ Syllabus</a><a href="/exam-calendar.html">▦ Exam calendar</a>'+
    '<a href="/exam-notifications.html">◉ Notifications</a><a href="/wrong-answers.html">↻ Wrong answers</a>'+
    '<button type="button" id="ceThemeToggle">◐ <span data-ce-theme-label></span></button>'+
    '<button type="button" id="ceInstallApp" hidden>⬇ Install app</button></div>';
  document.body.append(sheet);

  const target=readPreference(TARGET_KEY);
  if(targetNames[target]){
    const chip=document.createElement('a');chip.className='ce-target-chip';
    const pages={tnpsc:'/tnpsc.html',tnusrb:'/tnusrb.html',upsc:'/upsc.html'};
    chip.href=pages[target]||'/start.html';chip.textContent='My exam · '+targetNames[target];
    chip.setAttribute('aria-label','Open '+targetNames[target]+' preparation');
    document.body.append(chip);
  }
  const visibleControls=()=>[...sheet.querySelectorAll('a,button')].filter(el=>!el.hidden&&el.getClientRects().length);
  function close(restoreFocus=false){
    if(!sheet.classList.contains('open'))return;
    sheet.classList.remove('open');backdrop.classList.remove('open');
    more.setAttribute('aria-expanded','false');sheet.setAttribute('aria-hidden','true');
    if(restoreFocus)more.focus();
  }
  function open(){
    sheet.classList.add('open');backdrop.classList.add('open');
    more.setAttribute('aria-expanded','true');sheet.setAttribute('aria-hidden','false');
    sheet.querySelector('#ceMoreClose').focus();
  }
  more.addEventListener('click',()=>sheet.classList.contains('open')?close(true):open());
  backdrop.addEventListener('click',()=>close(true));
  sheet.querySelector('#ceMoreClose').addEventListener('click',()=>close(true));
  sheet.addEventListener('click',e=>{if(e.target.closest('a'))close()});
  document.addEventListener('keydown',e=>{
    if(!sheet.classList.contains('open'))return;
    if(e.key==='Escape'){e.preventDefault();close(true);return}
    if(e.key!=='Tab')return;
    const controls=visibleControls(),first=controls[0],last=controls[controls.length-1];
    if(!first)return;
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  sheet.querySelector('#ceThemeToggle').addEventListener('click',()=>applyTheme(theme()==='dark'?'light':'dark'));
  applyTheme(theme());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initShell);else initShell();
})();