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
 // Original paper question prefixes sometimes have double dots, apostrophes,
 // commas, or backtick-like marks. Missing numbers are never invented.
 const trimmed=String(line||'').replace(/^[\s•·*~'\x60.,-]+/u,'').trimStart();
 let m=trimmed.match(/^(\d{1,3})\s*[.,'\x60·:]{1,3}\s*(.{5,})$/);
 if(!m&&page===1&&c.from===101){
  m=trimmed.match(/^IO\s*1\s*[.]\s*(.{5,})$/i);
  if(m)return {number:101,stem:m[1].trim(),normalized:'IO 1. -> 101. (OCR-number normalization)'};
 }
 if(!m&&c.from===101){
  // A maths expression can precede the next printed question on one PDF text line.
  const inline=trimmed.match(/^.{8,140}?\s{3,}(\d{3})\s*[.]\s+(.{8,})$/);
  if(inline&&/[\d)\/%^+\-=]/.test(trimmed.slice(0,trimmed.indexOf(inline[1]))))
   return {number:Number(inline[1]),stem:inline[2].trim(),
    normalized:'Question number appeared after previous maths on same OCR line; visual review required'};
 }
 if(!m&&c.from===101){
  // Printed text is present, but OCR split these specific source headers.
  // Retain audit notes; do not apply a broad numeric guess to other lines.
  const spaced174=page===39&&trimmed.match(/^17\s+4\.\s+(Which of these describes.{10,})$/i);
  if(spaced174)return {number:174,stem:spaced174[1].trim(),
   normalized:'Printed 174 was extracted as 17 4.; source-image review pending'};
  const letter183=page===43&&trimmed.match(/^[lI]\s*83\.\s+(Who remarked.{10,})$/i);
  if(letter183)return {number:183,stem:letter183[1].trim(),
   normalized:'Printed 183 was extracted as l 83.; source-image review pending'};
  const formula145=page===24&&trimmed.match(/^.{14,170}?\s+145\.\s+(Th,e va ue o.{5,})$/i);
  if(formula145)return {number:145,stem:formula145[1].trim(),
   normalized:'Printed 145 follows an OCR-displaced mathematical expression; stem is incomplete; inspect PDF'};
 }
 if(!m)return null;
 const n=Number(m[1]);
 if(n<c.from||n>c.to)return null;
 return {number:n,stem:m[2].trim()};
}
function optionMarkers(text){
 // Detect explicitly printed A-E alternatives. Some source scans print B as 8.
 // Never infer other obscured option labels from a guessed ordering.
 const regex=/(?:^[ \t]*|[ \t]{2,})(?:\(([A-Ea-e8])\)|([A-Ea-e])[).])(?:[ \t]+|(?=\S))/gm;
 const result=[];
 for(const match of text.matchAll(regex)){
  const raw=(match[1]||match[2]),letter=raw==='8'?'B':raw.toUpperCase();
  result.push({letter,start:match.index,end:match.index+match[0].length,
   normalized:raw==='8',original:raw});
 }
 return result;
}
function optionsAndStem(lines){
 const raw=lines.join('\n').replace(/\r/g,'');
 const marks=optionMarkers(raw);
 const empty={A:'',B:'',C:'',D:'',E:''};
 if(!marks.length)return {text:raw.trim().slice(0,2400),options:empty,
  fourOptionsDetected:false,detectedOptions:[],normalizedLabels:[],
  alternativeGroups:0,issues:['No printed option labels were machine-detected.']};
 const groups=[];
 let group=null;
 const flush=()=>{if(group&&group.marks.length)groups.push(group);group=null};
 for(const mark of marks){
  if(!group)group={marks:[],letters:new Set()};
  // Original Tamil/English documents repeat A-E in translated answer rows.
  // Avoid concatenating multiple alternate language copies as one set.
  if(group.letters.has(mark.letter)||
     (mark.letter==='A'&&group.marks.length>=2&&group.letters.has('C'))||
     (group.letters.has('E')&&mark.letter!=='E')){
   flush();group={marks:[],letters:new Set()};
  }
  group.marks.push(mark);group.letters.add(mark.letter);
 }
 flush();
 function pack(group){
  const options={A:'',B:'',C:'',D:'',E:''};
  const normalized=[];
  for(let i=0;i<group.marks.length;i++){
   const marker=group.marks[i],after=group.marks[i+1]?.start??raw.length;
   let value=raw.slice(marker.end,after).trim()
    .replace(/\n[ \t]*(?:CCS2E\/2022|GRFT3|SPACE FOR ROUGH WORK)[^\n]*/i,'')
    .trim();
   if(marker.letter==='E'){
    const match=value.match(/^.{0,120}?\banswer\s*(?:not\s*)?(?:known|kno|finown|knotwn)[^\n]*/i);
    if(match)value=match[0];
   }
   options[marker.letter]=value.slice(0,900);
   if(marker.normalized)normalized.push(marker.letter);
  }
  const coverage='ABCD'.split('').filter(l=>options[l].length>=2).length;
  const english=Object.values(options).join(' ').match(/[a-zA-Z]{3,}/g)?.length||0;
  // Earlier groups often present English before the Tamil translation.
  const score=coverage*30+Math.min(english,20)-group.marks[0].start/raw.length*12;
  return {options,normalized,coverage,score};
 }
 const variants=groups.map(pack);
 const best=variants.reduce((prev,cur)=>!prev||cur.score>prev.score?cur:prev,null);
 let stem=raw.slice(0,marks[0].start).trim();
 stem=stem.replace(/[ \t]{5,}/g,' ').slice(0,2400).trim();
 const issues=[];
 if(best.normalized.length)issues.push('OCR printed option "(8)" mapped to "(B)"; check original PDF');
 if(variants.length>1)issues.push('Multiple English/Tamil option groups found; a source group was selected');
 const all=LETTERS.filter(l=>best.options[l].length>=2);
 const complete=stem.length>=8&&'ABCD'.split('').every(l=>all.includes(l));
 if(!complete)issues.push('One or more printed A-D alternatives were not recoverable');
 return {text:stem,options:best.options,
  fourOptionsDetected:complete,detectedOptions:all,
  normalizedLabels:best.normalized,alternativeGroups:variants.length-1,issues};
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
