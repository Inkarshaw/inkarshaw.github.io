/* ClearExams textbook catalogue: lightweight filters, chapter search and collapsible sets. */
(() => {
  'use strict';
  const main=document.querySelector('main.wrap');
  if(!main)return;
  const p=new URLSearchParams(location.search);
  const cls=Number(p.get('class')||6);
  const subject=p.get('subject')||(cls>=11?'history':'science');
  const term=Number(p.get('term')||1);
  const selectedUnit=Number(p.get('unit')||0);
  let searchText='',didJump=false,scheduled=false;
  const labels={science:'Science','social-science':'Social Science',history:'History',geography:'Geography'};
  const termRoman={1:'I',2:'II',3:'III'};
  const styles=document.createElement('style');
  styles.textContent=[
    '.catalog-tools{background:white;border:1px solid #dfe7f0;padding:14px;border-radius:16px;margin:18px 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}',
    '.catalog-tools label{display:grid;gap:4px;font-size:.76rem;font-weight:850;color:#38516c}',
    '.catalog-tools select,.catalog-tools input{width:100%;padding:10px;border:1px solid #b8c9db;border-radius:9px;background:#fff;color:#10233b;font:inherit}',
    '.catalog-tools [hidden],.panel[hidden],.unit[hidden]{display:none!important}',
    '.catalog-tools .catalog-hint{grid-column:1/-1;color:#607086;font-size:.8rem}',
    '.unit .quick-practice{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}',
    '.unit details{margin-top:12px;border-top:1px solid #dfe7f0;padding-top:9px}',
    '.unit details summary{cursor:pointer;font-size:.85rem;font-weight:800;color:#1357c4;padding:6px 0}',
    '.unit details .sets{margin-top:8px}',
    '.unit.unit-selected{outline:2px solid #1463ff;outline-offset:2px}',
    '@media(max-width:700px){.catalog-tools{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media(max-width:440px){.catalog-tools{grid-template-columns:1fr}}'
  ].join('');
  document.head.appendChild(styles);
  function urlFor(c,s,t){
    const a=new URLSearchParams({class:String(c),subject:s});
    if(c<=8)a.set('term',String(t));
    return 'textbook-quiz.html?'+a.toString();
  }
  function makeSelect(id,items,value,change){
    const lab=document.createElement('label');lab.textContent=id;
    const control=document.createElement('select');
    control.setAttribute('aria-label',id);
    items.forEach(([v,t])=>{const opt=document.createElement('option');opt.value=String(v);opt.textContent=t;control.appendChild(opt)});
    control.value=String(value);control.onchange=()=>change(control.value);
    lab.appendChild(control);return lab;
  }
  function addTools(){
    if(main.querySelector('#catalogTools'))return;
    const panel=main.querySelector('section.panel');if(!panel)return;
    const div=document.createElement('section');div.id='catalogTools';div.className='catalog-tools';div.setAttribute('aria-label','Textbook quiz filters');
    const allowed=cls===11?[['history','History / வரலாறு']]:cls===12?[['history','History / வரலாறு'],['geography','Geography / புவியியல்']]:[['science','Science / அறிவியல்'],['social-science','Social Science / சமூக அறிவியல்']];
    div.appendChild(makeSelect('Class / வகுப்பு',[6,7,8,9,10,11,12].map(n=>[n,'Class '+n]),cls,v=>{
      const c=Number(v),s=c>=11?'history':allowed.some(a=>a[0]===subject)?subject:'science';
      location.href=urlFor(c,s,term);
    }));
    div.appendChild(makeSelect('Subject / பாடம்',allowed,allowed.some(a=>a[0]===subject)?subject:allowed[0][0],v=>location.href=urlFor(cls,v,term)));
    if(cls<=8)div.appendChild(makeSelect('Term / பருவம்',[[1,'Term I / பருவம் 1'],[2,'Term II / பருவம் 2'],[3,'Term III / பருவம் 3']],term,v=>location.href=urlFor(cls,subject,Number(v))));
    const lab=document.createElement('label');lab.textContent='Search unit / அலகைத் தேடு';const inp=document.createElement('input');inp.type='search';inp.placeholder='Chapter name / அலகின் பெயர்';inp.autocomplete='off';inp.oninput=()=>{searchText=inp.value.trim().toLocaleLowerCase();filterUnits()};lab.appendChild(inp);div.appendChild(lab);
    const hint=document.createElement('div');hint.className='catalog-hint';hint.textContent='Choose a unit to practise. Question totals reflect indexed records; textbook-level quality verification is ongoing. / அலகைத் தேர்ந்தெடுத்து பயிற்சி செய்யவும். வினாக்களின் தரச் சரிபார்ப்பு நடைபெறுகிறது.';div.appendChild(hint);
    panel.before(div);
  }
  function enhanceUnits(){
    const cards=[...main.querySelectorAll('article.unit')];
    for(const card of cards){
      if(card.dataset.catalogEnhanced)continue;
      card.dataset.catalogEnhanced='1';
      const links=card.querySelectorAll('a[href*="textbook-play.html"]');
      const first=[...links].find(a=>new URL(a.href).searchParams.get('quiz')==='1')||links[0];
      if(!first)continue;
      const unit=Number(new URL(first.href).searchParams.get('unit')||0);
      card.dataset.unit=String(unit);card.id='catalog-unit-'+unit+'-'+new URL(first.href).searchParams.get('term');
      const list=card.querySelector('.sets');if(!list)continue;
      const actions=document.createElement('div');actions.className='quick-practice';
      for(const [mode,title,extra] of [['practice','Practice 20 / 20 வினாக்கள்',''],['timed','Timed 20 / நேரத் தேர்வு',' · 20 min']]){
        const a=document.createElement('a');a.className='btn'+(mode==='practice'?' primary':'');
        const href=new URL(first.href);href.searchParams.set('mode',mode);a.href=href.pathname+href.search;
        a.textContent=title+extra;actions.appendChild(a);
      }
      list.before(actions);
      const details=document.createElement('details');const summary=document.createElement('summary');
      const count=[...links].filter(a=>new URL(a.href).searchParams.get('quiz')!=='all').length;
      summary.textContent='View '+count+' quiz sets / வினாடி வினா தொகுப்புகள்';
      details.appendChild(summary);list.before(details);details.appendChild(list);
      card.dataset.detailOpen='0';
      if(selectedUnit===unit&&!didJump){
        if(panelMatches(card.closest('section.panel'))){details.open=true;card.classList.add('unit-selected')}
      }
    }
  }
  function panelMatches(panel){
    if(cls!==6)return true;
    if(!panel)return false;
    const parts=(panel.querySelector('.crumb')?.textContent||'').split('→').map(s=>s.trim());
    return parts[0]==='6th Standard'&&parts[1]===labels[subject]&&parts[2]==='Term '+termRoman[term];
  }
  function filterUnits(){
    for(const panel of main.querySelectorAll('section.panel')){
      panel.hidden=!panelMatches(panel);
    }
    for(const article of main.querySelectorAll('article.unit')){
      const heading=article.querySelector('h3')?.textContent||'';
      article.hidden=!!searchText&&!heading.toLocaleLowerCase().includes(searchText);
    }
    if(selectedUnit&&!didJump){
      const match=[...main.querySelectorAll('article.unit.unit-selected')].find(el=>!el.hidden&&!el.closest('section.panel')?.hidden);
      if(match){didJump=true;requestAnimationFrame(()=>match.scrollIntoView({block:'start',behavior:'auto'}))}
    }
  }
  function enhance(){
    addTools();enhanceUnits();filterUnits();
  }
  function queue(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;enhance()})}
  const observer=new MutationObserver(queue);observer.observe(main,{childList:true});
  enhance();
})();
