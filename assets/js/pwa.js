(()=>{'use strict';
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}))}
let promptEvent=null;const installButton=()=>document.getElementById('installApp');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;const b=installButton();if(b)b.hidden=false});
window.addEventListener('appinstalled',()=>{promptEvent=null;const b=installButton();if(b)b.hidden=true;if(window.gtag)gtag('event','pwa_installed')});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#installApp');if(!b||!promptEvent)return;promptEvent.prompt();const choice=await promptEvent.userChoice.catch(()=>null);if(window.gtag)gtag('event','pwa_install_prompt',{outcome:choice&&choice.outcome||'unknown'});promptEvent=null;b.hidden=true});

const THEME_KEY='clearexamsThemeV1',TARGET_KEY='clearexamsTargetExamV1';
const targetNames={tnpsc:'TNPSC',tnusrb:'TNUSRB',upsc:'UPSC',ssc:'SSC',banking:'Banking',railways:'Railways'};
function theme(){return localStorage.getItem(THEME_KEY)||'light'}
function applyTheme(value){document.documentElement.dataset.ceTheme=value;localStorage.setItem(THEME_KEY,value);document.querySelectorAll('[data-ce-theme-label]').forEach(x=>x.textContent=value==='dark'?'Use light mode':'Use dark mode')}
applyTheme(theme());

const style=document.createElement('style');style.textContent=`
.ce-bottom-nav,.ce-more-sheet,.ce-target-chip{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.ce-bottom-nav{display:none}.ce-more-backdrop{display:none}.ce-target-chip{position:fixed;right:14px;top:78px;z-index:45;display:none;align-items:center;gap:6px;padding:7px 10px;border:1px solid #c6d8ef;border-radius:999px;background:rgba(255,255,255,.95);box-shadow:0 7px 22px rgba(7,28,51,.12);color:#174b96;font-size:.75rem;font-weight:850;backdrop-filter:blur(12px)}
.ce-target-chip::before{content:"●";font-size:.58rem;color:#1463ff}
.ce-more-sheet{position:fixed;left:10px;right:10px;bottom:78px;z-index:101;display:none;padding:12px;border:1px solid #dbe5ef;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(7,28,51,.24)}
.ce-more-sheet.open{display:block}.ce-more-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ce-more-grid a,.ce-more-grid button{min-height:48px;display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid #dbe5ef;border-radius:12px;background:#f8fbff;color:#10233b;text-decoration:none;font:inherit;font-weight:750;text-align:left}.ce-more-backdrop.open{display:block;position:fixed;inset:0;z-index:100;background:rgba(7,28,51,.28)}
html[data-ce-theme="dark"]{color-scheme:dark}html[data-ce-theme="dark"] body{background:#08131f!important;color:#e5eef8!important}
html[data-ce-theme="dark"] header,html[data-ce-theme="dark"] .header,html[data-ce-theme="dark"] .site-header,html[data-ce-theme="dark"] .panel,html[data-ce-theme="dark"] .card,html[data-ce-theme="dark"] .resource,html[data-ce-theme="dark"] .tile,html[data-ce-theme="dark"] .today,html[data-ce-theme="dark"] .step,html[data-ce-theme="dark"] .toolbar,html[data-ce-theme="dark"] .quick a,html[data-ce-theme="dark"] .target-actions{background:#0f2030!important;color:#e5eef8!important;border-color:#294157!important}
html[data-ce-theme="dark"] .muted,html[data-ce-theme="dark"] .source,html[data-ce-theme="dark"] .tile p,html[data-ce-theme="dark"] .card p,html[data-ce-theme="dark"] .step span{color:#a9bbcd!important}
html[data-ce-theme="dark"] select,html[data-ce-theme="dark"] input,html[data-ce-theme="dark"] .button.secondary{background:#13283a!important;color:#e5eef8!important;border-color:#35536d!important}
html[data-ce-theme="dark"] .ce-more-sheet{background:#0f2030;border-color:#294157}html[data-ce-theme="dark"] .ce-more-grid a,html[data-ce-theme="dark"] .ce-more-grid button{background:#13283a;color:#e5eef8;border-color:#35536d}html[data-ce-theme="dark"] .ce-target-chip{background:rgba(15,32,48,.96);color:#9fc7ff;border-color:#35536d}
@media(max-width:760px){
 body{padding-bottom:76px!important}.footer,footer{padding-bottom:92px!important}
 .ce-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:99;display:grid;grid-template-columns:repeat(5,1fr);padding:7px max(6px,env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));border-top:1px solid #dbe5ef;background:rgba(255,255,255,.96);box-shadow:0 -8px 26px rgba(7,28,51,.08);backdrop-filter:blur(16px)}
 .ce-bottom-nav a,.ce-bottom-nav button{min-height:52px;border:0;background:transparent;color:#607086;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-decoration:none;font:inherit;font-size:.68rem;font-weight:750}
 .ce-bottom-nav .ico{font-size:1.22rem;line-height:1}.ce-bottom-nav .active{color:#1463ff}.ce-target-chip{display:flex;top:70px}
 html[data-ce-theme="dark"] .ce-bottom-nav{background:rgba(15,32,48,.97);border-color:#294157}html[data-ce-theme="dark"] .ce-bottom-nav a,html[data-ce-theme="dark"] .ce-bottom-nav button{color:#a9bbcd}html[data-ce-theme="dark"] .ce-bottom-nav .active{color:#72a6ff}
}
`;document.head.appendChild(style);

function activeFor(path,href){if(href==='/index.html')return path==='/'||path.endsWith('/index.html');return path.includes(href.replace(/^//,''))}
function initShell(){
 if(document.querySelector('.ce-bottom-nav'))return;
 const path=location.pathname;
 const nav=document.createElement('nav');nav.className='ce-bottom-nav';nav.setAttribute('aria-label','Mobile navigation');
 const items=[['⌂','Home','/index.html'],['✓','Quiz','/daily-quiz.html'],['◫','Current','/current-affairs/'],['▦','Dashboard','/dashboard.html']];
 items.forEach(([ico,label,href])=>{const a=document.createElement('a');a.href=href;if(activeFor(path,href))a.classList.add('active');a.innerHTML='<span class="ico">'+ico+'</span><span>'+label+'</span>';nav.appendChild(a)});
 const more=document.createElement('button');more.type='button';more.id='ceMoreBtn';more.innerHTML='<span class="ico">•••</span><span>More</span>';nav.appendChild(more);document.body.appendChild(nav);
 const backdrop=document.createElement('div');backdrop.className='ce-more-backdrop';document.body.appendChild(backdrop);
 const sheet=document.createElement('div');sheet.className='ce-more-sheet';sheet.innerHTML='<div class="ce-more-grid"><a href="/start.html">🚀 Start</a><a href="/syllabus.html">📚 Syllabus</a><a href="/pyq-hub.html">📝 PYQs</a><a href="/exam-calendar.html">📅 Calendar</a><a href="/exam-notifications.html">🔔 Notifications</a><a href="/search.html">🔎 Search</a><button type="button" id="ceThemeToggle">◐ <span data-ce-theme-label></span></button><a href="/exam-posts.html">☰ All exams</a></div>';document.body.appendChild(sheet);
 const target=localStorage.getItem(TARGET_KEY)||'';if(targetNames[target]){const chip=document.createElement('a');chip.className='ce-target-chip';chip.href='/dashboard.html';chip.textContent=targetNames[target];document.body.appendChild(chip)}
 const close=()=>{sheet.classList.remove('open');backdrop.classList.remove('open');more.setAttribute('aria-expanded','false')};const open=()=>{sheet.classList.add('open');backdrop.classList.add('open');more.setAttribute('aria-expanded','true')};
 more.setAttribute('aria-expanded','false');more.onclick=()=>sheet.classList.contains('open')?close():open;backdrop.onclick=close;
 sheet.querySelector('#ceThemeToggle').onclick=()=>applyTheme(theme()==='dark'?'light':'dark');applyTheme(theme());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initShell);else initShell();
})();