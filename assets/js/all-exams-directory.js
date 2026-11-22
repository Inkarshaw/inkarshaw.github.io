/* Read-only exam discovery. The directory describes actual support levels;
   a shared textbook quiz is never presented as an exam-specific paper. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const search=$('ceExamSearch'),categorySelect=$('ceExamCategory'),
  root=$('ceExamResults'),status=$('ceExamSummary'),back=$('ceExamReturn');
if(!search||!categorySelect||!root||!status||!back)return;
let directory=null;
const levelNames={
  practice:'Exam practice available',
  pyq:'Provisional PYQ practice',
  guide:'Exam guide / syllabus',
  foundation:'Shared foundation only'
};
const normalize=text=>String(text||'').toLocaleLowerCase('en-IN').normalize('NFKD');
const appendText=(parent,tag,value,cls)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 node.textContent=value;
 parent.append(node);
 return node;
};
function validate(data){
 if(!data||data.schemaVersion!==1||!Array.isArray(data.categories)||data.categories.length<6)throw Error('Directory data is incomplete');
 const known=new Set(),allowed=new Set(Object.keys(levelNames));
 let count=0;
 for(const cat of data.categories){
  if(!cat.id||!cat.title||!Array.isArray(cat.exams)||!cat.exams.length)throw Error('Invalid exam group');
  for(const exam of cat.exams){
   if(!exam.id||!exam.name||known.has(exam.id)||!allowed.has(exam.level)||typeof exam.href!=='string')throw Error('Invalid exam item');
   const parsed=new URL(exam.href,location.href);
   if(parsed.origin!==location.origin||!parsed.pathname.endsWith('.html')&&!parsed.pathname.endsWith('/mocks/'))throw Error('Unsupported exam link');
   known.add(exam.id);count++;
  }
 }
 return {data,count};
}
function setCategory(id){
 categorySelect.value=id;
 render();
}
function renderCategories(){
 const grid=document.createElement('div');grid.className='ce-exam-category-grid';
 for(const cat of directory.data.categories){
  const button=document.createElement('button');button.type='button';button.className='ce-exam-category';
  appendText(button,'strong',cat.title);
  appendText(button,'small',cat.exams.length+' exam routes');
  button.addEventListener('click',()=>{
   search.value='';
   setCategory(cat.id);
   status.scrollIntoView?.({behavior:'smooth',block:'nearest'});
  });
  grid.append(button);
 }
 root.append(grid);
}
function renderExams(category,term){
 const grid=document.createElement('div');grid.className='ce-exam-list';
 const groups=directory.data.categories.filter(cat=>category==='all'||cat.id===category);
 let results=0;
 for(const group of groups)for(const exam of group.exams){
  const haystack=normalize([group.title,exam.name,exam.id,...(exam.aliases||[])].join(' '));
  if(term&&!haystack.includes(term))continue;
  const card=document.createElement('article');card.className='ce-exam-item';
  appendText(card,'h3',exam.name);
  appendText(card,'span',levelNames[exam.level]+' · '+group.title,'ce-exam-status');
  if(exam.note)appendText(card,'p',exam.note);
  const a=appendText(card,'a',({practice:'Open practice',pyq:'Open PYQs',guide:'Open exam guide',foundation:'Open shared resources'})[exam.level]+' →');
  a.href=exam.href;
  grid.append(card);results++;
 }
 if(results)root.append(grid);
 else appendText(root,'p','No matching exam found. Try another spelling or select All categories.','ce-exam-noresults');
 return results;
}
function render(){
 if(!directory)return;
 const term=normalize(search.value.trim());
 const category=categorySelect.value;
 root.replaceChildren();
 back.hidden=category==='all'&&!term;
 if(category==='all'&&!term){
  status.textContent=directory.count+' exam routes across '+directory.data.categories.length+' categories. Choose a category or search an exam name.';
  renderCategories();
 }else{
  const shown=renderExams(category,term);
  status.textContent=shown+' exam'+(shown===1?'':'s')+' shown · '+directory.count+' routes in directory. Availability is labelled on each card.';
 }
}
search.addEventListener('input',render);
categorySelect.addEventListener('change',render);
back.addEventListener('click',()=>{
 search.value='';categorySelect.value='all';render();
});
fetch('data/exams/all-exams-directory.json',{cache:'no-store'}).then(r=>{
 if(!r.ok)throw Error('Directory is not available');
 return r.json();
}).then(data=>{
 directory=validate(data);
 const opts=data.categories.map(cat=>({id:cat.id,title:cat.title}));
 for(const item of opts){
  const opt=document.createElement('option');opt.value=item.id;opt.textContent=item.title;
  categorySelect.append(opt);
 }
 const initial=new URLSearchParams(location.search).get('examCategory');
 if(opts.some(x=>x.id===initial))categorySelect.value=initial;
 render();
}).catch(()=>{
 status.textContent='Exam directory could not load. These core exam hubs remain available:';
 root.replaceChildren();
 const p=document.createElement('p');
 for(const [name,href] of [['TNPSC','tnpsc.html'],['TNUSRB','tnusrb.html'],['UPSC','upsc.html'],['SSC / Banking / Railways','exam-posts.html'],['Syllabus directory','syllabus.html']]){
  const a=appendText(p,'a',name+' · ');a.href=href;
 }
 root.append(p);
});
})();
