/* CDS previous-paper study: 17 complete-numbered ungraded source drafts. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const choices=['A','B','C','D'];
const paperCache=new Map();let index=null,active=null,selected=0,responses={},visible=[];
const safe=(v)=>typeof v==='string'?v:'';
function el(tag,text,cls){const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=text;return n;}
function status(message,error=false){const n=$('status');n.textContent=message;n.setAttribute('role',error?'alert':'status');}
function paperURL(id){return 'pyq-cds.html?paper='+encodeURIComponent(id);}
function validate(p){if(!p||p.schemaVersion!==1||p.exam!=='UPSC CDS'||p.grading!=='disabled'||p.officialAnswerKeyChecked!==false||p.officialOriginalConfirmed!==false||!Array.isArray(p.questions)||p.questions.length!==120)throw Error('Invalid or improperly certified paper source');
 for(let i=0;i<120;i++){const q=p.questions[i];if(q?.number!==i+1||q.correctAnswer!==null||q.scoreEligible!==false||q.ungraded!==true||!q.options||choices.some(l=>typeof q.options[l]!=='string'))throw Error('Source question validation failed at position '+(i+1));}
 return p;}
function needsSourceReview(q){return q.extraction!=='provisional-four-options'||q.diagramStatus==='unresolved-original-figure';}
function fillYears(){const years=[...new Set(index.paperStatuses.map(q=>q.year))].sort((a,b)=>b-a);for(const y of years){let o=el('option',String(y));o.value=String(y);$('yearFilter').append(o);}}
function drawCards(){if(!index)return;const year=$('yearFilter').value,session=$('sessionFilter').value,source=$('sourceFilter').value,root=$('paperCards');root.replaceChildren();let filtered=index.paperStatuses.filter(p=>(year==='all'||String(p.year)===year)&&(session==='all'||p.session===session)&&(source==='all'||(source==='scan'?p.sourceMode.includes('scan'):p.sourceMode.includes('pdf-text'))));
 filtered=filtered.sort((a,b)=>b.year-a.year||a.session.localeCompare(b.session));
 for(const p of filtered){const card=el('article','','card');card.append(el('h3',`CDS ${p.session} ${p.year} — GK`));card.append(el('p',`${p.textStems} of 120 question stems recovered`));card.append(el('p',`${p.provisionalFourOptionSets} provisional A–D text sets · ${p.unresolvedPositions} missing text/choices`));if(p.unresolvedSourceVisualNumbers?.length)card.append(el('p',`${p.unresolvedSourceVisualNumbers.length} questions need original map figures`));if(p.unresolvedSourceLanguages?.length)card.append(el('p',`Original ${p.unresolvedSourceLanguages.join(', ')} text not yet transcribed`));card.append(el('p',p.sourceMode.includes('third-party')?'Third-party English transcription (UPSC original comparison pending)':p.sourceMode.includes('scan')?(p.sourceMode.includes('manual')?'Manually transcribed English scan (not officially verified)':'Scanned English pages (OCR-assisted, not officially verified)'):'Source PDF text-layer extraction (not officially verified)'));const bar=el('div','','progress');const fill=el('span');fill.style.width=(p.textStems/120*100).toFixed(1)+'%';bar.append(fill);card.append(bar);const button=el('button','Start full paper (ungraded)','primary');button.type='button';button.addEventListener('click',()=>openPaper(p.id));card.append(button);root.append(card);}
 $('catalogStats').textContent=filtered.length+' source papers shown. '+index.sourceUploadedPapers+' uploaded CDS GK PDFs plus public 2020 II transcription; full text does not imply original-paper fidelity or verified answer keys.';
 if(!filtered.length)root.append(el('p','No papers match these filters.'));
}
function cacheKey(){return 'clearexams:cds-gk:ungraded:'+active.id;}
function restore(){responses={};try{const saved=JSON.parse(localStorage.getItem(cacheKey())||'{}');if(saved&&typeof saved==='object'){for(const [n,l] of Object.entries(saved)){if(Number(n)>=1&&Number(n)<=120&&choices.includes(l)&&active.questions[Number(n)-1]?.extraction==='provisional-four-options'&&active.questions[Number(n)-1]?.diagramStatus!=='unresolved-original-figure'&&active.questions[Number(n)-1]?.options?.[l]?.trim())responses[n]=l;}}}catch{}}
function persist(){try{localStorage.setItem(cacheKey(),JSON.stringify(responses));}catch{}}
function answered(){return Object.keys(responses).length;}
async function openPaper(id){try{
 if(!/^[a-z0-9-]{10,55}$/.test(id)||!index.paperStatuses.some(x=>x.id===id))throw Error('Paper is not listed in the source catalog');
 status('Loading full question paper…');let p=paperCache.get(id);
 if(!p){const r=await fetch('data/quizzes/cds-gk/'+id+'.json',{cache:'no-store'});if(!r.ok)throw Error('Paper JSON is not published yet');p=validate(await r.json());paperCache.set(id,p);}
 active=p;restore();selected=0;visible=Array.from({length:active.questions.length},(_,i)=>i);$('quizLayout').hidden=false;
 const summary=index.paperStatuses.find(x=>x.id===id);
 $('paperName').textContent=`CDS ${p.session} ${p.year} — General Knowledge`;
 $('paperStats').textContent=`120 numbered positions · ${summary.textStems} stems extracted · ${summary.provisionalFourOptionSets} provisional A–D sets · ${summary.unresolvedPositions} missing text/choices · ${(summary.unresolvedSourceVisualNumbers||[]).length} unresolved source maps · ${(summary.unresolvedSourceLanguages||[]).length?`missing ${summary.unresolvedSourceLanguages.join(', ')} transcription · `:''}no scoring`;
 history.replaceState(null,'',paperURL(id));render();
 $('quizLayout').scrollIntoView({behavior:'smooth',block:'start'});status('Opened full CDS GK paper. Questions and selected answers remain ungraded.');
 }catch(err){status('Unable to open paper: '+err.message,true);}}
function showIndex(i){selected=i;render();}
function render(){if(!active)return;const q=active.questions[selected];
 $('attemptText').textContent=answered()+' / 120 answers saved on this device · no scoring';
 $('position').textContent='Question '+q.number+' of 120';
 $('sourcePage').textContent=q.sourcePages.length?'Source PDF page '+q.sourcePages.join(', '):q.text?.trim()?'Source PDF page not yet mapped':'Question text not recovered';
 $('questionText').textContent=q.text||'[Original question text not extracted — do not assume its wording]';
 const missingFigure=q.diagramStatus==='unresolved-original-figure';const group=$('choices');group.replaceChildren();for(const l of choices){const content=q.options[l],btn=el('button','','choice'+(content&&!missingFigure?'':' source-missing'));btn.type='button';btn.disabled=missingFigure||needsSourceReview(q)||!content.trim();btn.setAttribute('aria-pressed',String(responses[q.number]===l));btn.append(el('span',l,'letter'));btn.append(el('span',content||'[Printed option wording not recovered — consult uploaded paper]'));btn.addEventListener('click',()=>{responses[q.number]=l;persist();render();});group.append(btn);}
 const issues=q.issues||[];$('questionWarning').textContent=(missingFigure?'Original numbered map is missing; answer selection is disabled until the source figure is recovered. ':q.extraction==='provisional-four-options'?'Provisional source text (not officially checked). ':'Incomplete source extraction — verify the original booklet. ')+issues.join(' · ');
 $('prev').disabled=visible.indexOf(selected)<=0;$('next').disabled=visible.indexOf(selected)>=visible.length-1;
 const palette=$('palette');palette.replaceChildren();const frag=document.createDocumentFragment();for(const i of visible){const item=active.questions[i];const cls=(needsSourceReview(item)?' incomplete':'')+(responses[item.number]?' answered':'')+(i===selected?' active':'');const btn=el('button',String(item.number),cls);btn.type='button';btn.title='Q'+item.number+(item.diagramStatus==='unresolved-original-figure'?' · source map missing':needsSourceReview(item)?' · transcription needed':' · 4 options detected');btn.addEventListener('click',()=>showIndex(i));frag.append(btn);}palette.append(frag);
}
function move(n){const i=visible.indexOf(selected),next=visible[Math.min(visible.length-1,Math.max(0,i+n))];if(next!==undefined){selected=next;render();}}
function download(name,data){const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function exportResponses(){if(!active)return;download(active.id+'-ungraded-responses.json',{schemaVersion:1,kind:'clearexams-cds-gk-local-answers',paperId:active.id,sourceFile:active.sourceFile,officialKeyMapped:false,score:null,grading:'disabled',responses:Object.entries(responses).sort((a,b)=>+a[0]- +b[0]).map(([n,l])=>({number:+n,selected:l}))});}
function exportPaper(){if(!active)return;download(active.id+'-source-text-unverified.json',active);}
function clearResponses(){if(!active||!window.confirm('Clear all 120 saved answers for this CDS paper?'))return;responses={};persist();render();status('Saved responses cleared for this paper only.');}
function nextIncomplete(){
 if(!active)return;
 const available=q=>!responses[q.number]&&!needsSourceReview(q);
 let i=active.questions.findIndex((q,i)=>i>selected&&available(q));
 if(i<0)i=active.questions.findIndex(available);
 if(i<0){status('All playable questions have a saved response.');return;}
 selected=i;render();
}
async function init(){try{const r=await fetch('data/quizzes/cds-gk/index.json',{cache:'no-store'});if(!r.ok)throw Error('CDS catalog is not available');const data=await r.json();if(data.schemaVersion!==1||data.exam!=='UPSC CDS'||data.gradingEnabled!==false||data.officialAnswerKeyMapped!==false||!Array.isArray(data.paperStatuses))throw Error('Invalid CDS metadata');index=data;fillYears();const params=new URLSearchParams(location.search),wanted=params.get('paper'),linked=index.paperStatuses.find(p=>p.id===wanted);const year=params.get('year'),session=params.get('session');if(linked){$('yearFilter').value=String(linked.year);$('sessionFilter').value=linked.session;}else{if(index.paperStatuses.some(p=>String(p.year)===year))$('yearFilter').value=year;if(session==='I'||session==='II')$('sessionFilter').value=session;}drawCards();if(wanted)await openPaper(wanted);else status('Select a CDS I or II paper to start.');}catch(err){status('CDS source library failed to load: '+err.message,true);$('catalogStats').textContent='Paper data unavailable';}}
$('yearFilter').addEventListener('change',drawCards);$('sessionFilter').addEventListener('change',drawCards);$('sourceFilter').addEventListener('change',drawCards);
$('prev').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));$('nextIncomplete').addEventListener('click',nextIncomplete);
$('exportResponse').addEventListener('click',exportResponses);$('exportSource').addEventListener('click',exportPaper);$('clearResponse').addEventListener('click',clearResponses);
init();
})();