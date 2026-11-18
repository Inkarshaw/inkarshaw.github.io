/* ClearExams: conservative question-number segmentation for three recovered TNPSC PDF text drafts.
   Extraction is not verification. Never reconstruct a missing question, option or correct answer. */
(function(root){
'use strict';
const LETTERS=['A','B','C','D','E'];
const CONFIG=[
 {pattern:/group-ii-iia-2022-general-english/,from:1,to:100,firstPage:3,lastPage:26},
 {pattern:/group-ii-iia-2022-general-studies/,from:101,to:200,firstPage:2,lastPage:65},
 {pattern:/group-iv-2016/,from:101,to:200,firstPage:1,lastPage:51}
];
function rule(id){
 return CONFIG.find(c=>c.pattern.test(String(id||'')))||null;
}
function numberMarker(line,c,page){
 const trimmed=String(line||'').replace(/^[\s•·*~'-]+/u,'').trimStart();
 let m=trimmed.match(/^[.]?\s*(\d{1,3})\s*[.]\s+(.{5,})$/);
 if(!m&&page===1&&c.from===101){
  m=trimmed.match(/^IO\s*1\s*[.]\s+(.{5,})$/i);
  if(m)return {number:101,stem:m[1].trim(),normalized:'IO 1. -> 101. (OCR suspected)'};
 }
 if(!m)return null;
 const n=Number(m[1]);
 if(n<c.from||n>c.to)return null;
 return {number:n,stem:m[2].trim()};
}
function optionsAndStem(lines){
 const stem=[],options={A:'',B:'',C:'',D:'',E:''};
 const issues=[],found=new Set();
 let active=null,stopped=false;
 function append(target,part){
  const value=String(part||'').trim();
  if(!value)return;
  if(target&&options[target])options[target]+='\n'+value;
  else if(target)options[target]=value;
  else stem.push(value);
 }
 for(const original of lines){
  if(stopped)break;
  const line=String(original||'').replace(/\r/g,'').trim();
  if(!line)continue;
  if(/^CCS2E\/2022|^GRFT3\b|SPACE FOR ROUGH WORK/i.test(line)&&active)break;
  // An OCR scan that reads (B) as (8) is not corrected.
  const regex=/(?:^|[\s])(?:\(([A-E])\)|([A-E])\s*[).])(?:[ \t]+|(?=\S))/g;
  const markers=[...line.matchAll(regex)].map(m=>({
   letter:m[1]||m[2],start:m.index,after:m.index+m[0].length
  }));
  if(!markers.length){
   if(active){
    if(/^[§©®\u0b80-\u0bff]/u.test(line)&&found.has('D'))break;
    append(active,line);
   }else stem.push(line);
   continue;
  }
  if(markers[0].start>0)append(active,line.slice(0,markers[0].start));
  for(let i=0;i<markers.length;i++){
   const marker=markers[i],letter=marker.letter;
   if(found.has(letter)){
    issues.push('Repeated printed '+letter+' option label, possibly bilingual text or OCR.');
    stopped=true;break;
   }
   found.add(letter);active=letter;
   const right=i+1<markers.length?markers[i+1].start:line.length;
   append(letter,line.slice(marker.after,right));
  }
  if(found.has('E')&&/answer\s+not\s+(?:known|kno)/i.test(options.E))break;
 }
 const question=stem.join('\n').trim().slice(0,2400);
 for(const l of LETTERS)options[l]=options[l].trim().slice(0,900);
 const hasFour=question.length>=8&&LETTERS.slice(0,4).every(x=>options[x].length>=2)&&!issues.length;
 return {text:question,options,fourOptionsDetected:hasFour,
  detectedOptions:LETTERS.filter(l=>!!options[l]),issues};
}
function parse(draft){
 if(!draft||!Array.isArray(draft.pages))return null;
 const c=rule(draft.id);
 if(!c)return null;
 const blocks=new Map(),pageText=draft.pages.filter(p=>p&&
  Number.isInteger(p.pdfPage)&&p.pdfPage>=c.firstPage&&p.pdfPage<=c.lastPage)
  .sort((a,b)=>a.pdfPage-b.pdfPage);
 let active=null,last=c.from-1;
 for(const page of pageText){
  if(typeof page.text!=='string')continue;
  for(const line of page.text.split(/\r?\n/)){
   const marker=numberMarker(line,c,page.pdfPage);
   if(marker&&marker.number>last&&marker.number-last<=10){
    active={number:marker.number,sourcePdfPage:page.pdfPage,lines:[marker.stem],
     numberReview:marker.normalized||null};
    blocks.set(marker.number,active);last=marker.number;
   }else if(active)active.lines.push(line);
  }
 }
 const questions=[];
 let stems=0,complete=0,atLeastTwo=0;
 for(let n=c.from;n<=c.to;n++){
  const block=blocks.get(n);
  if(!block){
   questions.push({number:n,text:'[Original question text not recovered from PDF]',
    sourcePdfPage:null,options:{A:'',B:'',C:'',D:'',E:''},
    fourOptionsDetected:false,textRecovered:false,
    textStatus:'source-question-not-detected',scoreEligible:false,
    acceptedAnswers:[],rawBlock:'',
    issues:['This original question number is expected, but its text was not detected.']});
   continue;
  }
  const parsed=optionsAndStem(block.lines);
  const flags=[...parsed.issues];
  if(block.numberReview)flags.push(block.numberReview);
  if(parsed.text.length<8)flags.push('Question stem is missing or too short.');
  if(!parsed.fourOptionsDetected)flags.push('All four printed A–D options not reliably recovered.');
  const raw=block.lines.join('\n').trim();
  questions.push({number:n,text:parsed.text||'[Question stem unreadable in source]',
   sourcePdfPage:block.sourcePdfPage,options:parsed.options,
   fourOptionsDetected:parsed.fourOptionsDetected,textRecovered:parsed.text.length>=8,
   textStatus:parsed.fourOptionsDetected?'machine-split-complete-unverified':'machine-split-partial-unverified',
   scoreEligible:false,acceptedAnswers:[],rawBlock:raw.slice(0,6500),issues:flags});
  if(parsed.text.length>=8)stems++;
  if(parsed.fourOptionsDetected)complete++;
  if(parsed.detectedOptions.length>=2)atLeastTwo++;
 }
 return {schemaVersion:1,sourcePdf:draft.sourcePdf,paperId:draft.id,
  expectedRange:{from:c.from,to:c.to},questions,
  stats:{numberedPositions:questions.length,recoveredStems:stems,
   aToDOptionSets:complete,atLeastTwoOptions:atLeastTwo,
   missingStems:questions.filter(q=>!q.textRecovered).map(q=>q.number)},
  grading:'disabled',verifiedOriginalText:false,
  sourceStatus:'machine-segmented-editorial-draft-unverified'};
}
root.ClearExamsPYQSourceSplitter={parse,rule,numberMarker,optionsAndStem};
})(typeof window!=='undefined'?window:globalThis);
