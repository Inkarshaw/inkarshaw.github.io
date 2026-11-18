/* ClearExams whole-paper typing assistant. Source text is a draft; never assign answers. */
(function(root){
'use strict';
const digitMap={'௦':'0','௧':'1','௨':'2','௩':'3','௪':'4','௫':'5','௬':'6','௭':'7','௮':'8','௯':'9'};
const tamilOptions={'அ':'A','ஆ':'B','இ':'C','ஈ':'D','உ':'E'};
function normalize(source){
  return String(source||'').replace(/\r\n?/g,'\n').replace(/[௦-௯]/g,ch=>digitMap[ch])
    .replace(/\u00a0/g,' ').replace(/\f/g,'\n');
}
function questionStart(line){
 const match=line.match(/^\s*(?:(?:Q(?:uestion)?\.?\s*(?:No\.?)?\s*[:.]?\s*)?([0-9]{1,3})\s*[.):]\s*)(.*)$/i);
 return match?{number:Number(match[1]),text:match[2].trim()}:null;
}
function optionStart(line){
 const match=line.match(/^\s*(?:\(([A-Ea-eஅஆஇஈஉ])\)|([A-Ea-eஅஆஇஈஉ])\s*[).:])\s*(.*)$/u);
 if(!match)return null;
 const value=match[1]||match[2];
 return {letter:tamilOptions[value]||value.toUpperCase(),text:match[3].trim()};
}
function parse(source,expectedCount=200){
 if(!Number.isInteger(expectedCount)||expectedCount<1||expectedCount>400)throw Error('Invalid paper question count');
 const lines=normalize(source).split('\n');const blocks=[];let current=null;
 let ignoredHeader=0,duplicateStarts=0,ascendingGaps=0;
 for(const line of lines){
  const start=questionStart(line);
  if(start&&start.number>=1&&start.number<=expectedCount){
   if(current&&start.number===current.number){current.lines.push(line);duplicateStarts++;continue;}
   if(current&&start.number<current.number){current.lines.push(line);continue;}
   if(current&&start.number>current.number+1)ascendingGaps++;
   current={number:start.number,lines:[start.text],lineCount:1};
   blocks.push(current);continue;
  }
  if(current){current.lines.push(line);current.lineCount++;}
  else if(line.trim())ignoredHeader++;
 }
 const seen=new Set(),questions=[];let complete=0;
 for(const block of blocks){
  if(seen.has(block.number))continue;
  seen.add(block.number);
  const stem=[],options={A:'',B:'',C:'',D:'',E:''},duplicateOptions=[];
  let active=null;
  for(const line of block.lines){
   const opt=optionStart(line);
   if(opt){
    if(options[opt.letter])duplicateOptions.push(opt.letter);
    active=opt.letter;
    options[active]=options[active]?[options[active],opt.text].join('\n'):opt.text;
   }else if(active)options[active]=[options[active],line].join('\n');
   else stem.push(line);
  }
  const text=stem.join('\n').trim(),missing=['A','B','C','D'].filter(k=>!options[k].trim());
  const valid=text.length>=8&&missing.length===0&&duplicateOptions.length===0;
  if(valid)complete++;
  questions.push({number:block.number,text,options,complete:valid,missingOptions:missing,
   duplicateOptions,sourceStatus:'bulk-text-draft-unverified',raw:block.lines.join('\n')});
 }
 return {schemaVersion:1,questions,found:questions.length,complete,
  incomplete:questions.length-complete,missingNumbers:Array.from({length:expectedCount},(_,i)=>i+1).filter(n=>!seen.has(n)),
  expectedCount,ignoredHeaderLines:ignoredHeader,duplicateStarts,ascendingGaps,
  sourceStatus:'machine-split-unverified',answerKeysProvided:false};
}
root.ClearExamsBulkPYQ={parse,normalize,questionStart,optionStart};
})(typeof window!=='undefined'?window:globalThis);
