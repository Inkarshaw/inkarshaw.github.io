#!/usr/bin/env node
/*
  TN textbook quiz QA audit. Read-only: flags issues for editorial review;
  never guesses, rewrites, deletes or auto-approves an answer.
  Run: node scripts/audit-textbook-bank.mjs [output-folder]
*/
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('data/textbook');
const out=path.resolve(process.argv[2]||'reports/textbook-qa');
const issues=[],records=[],stats={files:0,questions:0,invalid:0,duplicates:0,conceptRepetition:0,weakOptions:0};
function walk(folder){
 if(!fs.existsSync(folder))return [];
 return fs.readdirSync(folder,{withFileTypes:true}).flatMap(x=>{
  const f=path.join(folder,x.name);
  if(x.isDirectory())return walk(f);
  return x.isFile()&&/^unit-\d+.*\.json$/i.test(x.name)?[f]:[];
 });
}
const norm=s=>String(s??'').toLocaleLowerCase('en').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const fact=s=>String(s||'').toLowerCase().replace(/divided\s+by|÷/g,'/').replace(/\s+/g,' ').match(/\b(speed|distance|time)\s*=\s*(speed|distance|time)\s*\/\s*(speed|distance|time)\b/)?.[0].replace(/\s/g,'')||'';
const bucket=s=>{
 const x=norm(s);if(/^(none|all|both|neither|not yet|unknown|undeciphered|cannot|not known)/i.test(x))return 'meta-answer';
 if(/^\d+(\.\d+)?\s*(%|percent|km|m|kg|years?|centur(?:y|ies))?$/i.test(x))return 'numeric';
 if(/^(ce|bce|ad|bc)\s*\d+|\b\d{2,4}\s*(ce|bce|ad|bc)\b/i.test(x))return 'period';
 if(/\b(century|millennium|era|period)\b/i.test(x))return 'time-period';
 return 'text';
};
const emit=(severity,kind,rec,detail,other='')=>{
 issues.push({severity,kind,file:rec.file,id:rec.id,quiz:rec.quiz,page:rec.page,question:rec.question,detail,other});
};
for(const f of walk(root)){
 let data;try{data=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){issues.push({severity:'high',kind:'invalid-json',file:path.relative('.',f),detail:e.message});continue}
 if(!Array.isArray(data.questions))continue;
 stats.files++;const rel=path.relative('.',f).replace(/\\/g,'/');
 const unit=rel.replace(/-quiz-\d+(?:-(?:part|more)-\d+)?(?=\.json$)/,'').replace(/\.json$/,'');
 for(const [i,q] of data.questions.entries()){
  stats.questions++;const rec={file:rel,unit,id:String(q?.id??'#'+(i+1)),quiz:q?.quiz??null,page:q?.page??q?.page_en??null,question:q?.q_en??''};
  const en=q?.opts_en,ta=q?.opts_ta;
  const structurallyValid=typeof q?.q_en==='string'&&q.q_en.trim()&&typeof q?.q_ta==='string'&&q.q_ta.trim()&&
    Array.isArray(en)&&en.length===4&&Array.isArray(ta)&&ta.length===4&&
    Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3&&
    [...en,...ta].every(x=>typeof x==='string'&&x.trim())&&
    new Set(en?.map(norm)).size===4&&new Set(ta?.map(norm)).size===4;
  if(!structurallyValid){stats.invalid++;emit('high','invalid-structure',rec,'Missing bilingual stem, non-distinct options or invalid correct index');continue}
  if(!q.exp_en?.trim()||!q.exp_ta?.trim())emit('high','missing-explanation',rec,'Missing English or Tamil explanation');
  if(!Number.isInteger(Number(rec.page))||Number(rec.page)<1)emit('medium','unverified-page',rec,'No usable textbook page reference');
  if(/^(What is the correct textbook answer for|Which option is correctly associated with|Identify the correct .* for:)/i.test(q.q_en))
    emit('high','mechanical-stem',rec,'Boilerplate rather than a natural assessment question');
  const b=en.map(bucket),metaCount=b.filter(v=>v==='meta-answer').length;
  if(metaCount&&metaCount<4){stats.weakOptions++;emit('medium','inconsistent-distractor',rec,'A status or meta-answer is mixed with topical options; review plausibility')}
  if(b.filter(v=>v==='numeric').length===3||b.filter(v=>v==='period').length===3){
    stats.weakOptions++;emit('medium','option-category-mismatch',rec,'Three options share a number/time category and one differs; review whether justified');
  }
  const chosen=norm(en[q.correct]);
  records.push({...rec,stem:norm(q.q_en),answer:chosen,formula:fact(q.exp_en),description:norm(q.exp_en)});
 }
}
const byStem=new Map(),byFormula=new Map();
for(const q of records){
 const key=q.unit+'|'+q.stem;
 if(!byStem.has(key))byStem.set(key,[]);
 byStem.get(key).push(q);
 if(q.formula){
  const fk=q.unit+'|'+q.formula;
  if(!byFormula.has(fk))byFormula.set(fk,[]);
  byFormula.get(fk).push(q);
 }
}
for(const group of byStem.values()){
 if(group.length<2)continue;
 const answers=new Set(group.map(x=>x.answer));
 for(const x of group.slice(1)){stats.duplicates++;emit(answers.size>1?'high':'medium',answers.size>1?'conflicting-answer':'duplicate-stem',x,'Repeated normalized stem within this unit',group[0].id)}
}
for(const group of byFormula.values()){
 if(group.length<2)continue;
 const differentStems=new Set(group.map(x=>x.stem));
 if(differentStems.size<2)continue;
 for(const x of group.slice(1)){stats.conceptRepetition++;emit('medium','repeated-concept',x,'Same formula appears in another question; check that it tests a distinct application',group[0].id)}
}
const ranking={high:0,medium:1,low:2};issues.sort((a,b)=>(ranking[a.severity]??3)-(ranking[b.severity]??3)||a.file.localeCompare(b.file));
stats.flagged=issues.length;stats.reviewOnly=true;
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({generated_at:new Date().toISOString(),stats,issue_types:issues.reduce((o,x)=>(o[x.kind]=(o[x.kind]||0)+1,o),{}),sample:issues.slice(0,50)},null,2));
const cols=['severity','kind','file','id','quiz','page','question','detail','other'];
const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
fs.writeFileSync(path.join(out,'issues.csv'),[cols.join(','),...issues.map(x=>cols.map(k=>csvCell(x[k])).join(','))].join('\n'));
console.log(JSON.stringify({stats,report:out},null,2));
