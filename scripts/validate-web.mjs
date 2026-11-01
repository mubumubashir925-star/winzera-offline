import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const html=await readFile('www/index.html','utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)].map(m=>m[1]);
if(scripts.length<4)throw new Error('Expected bundled scripts are missing: '+scripts.length);
for(const file of scripts){
  if(!/^[a-zA-Z0-9._-]+\.js$/.test(file))continue;
  const result=spawnSync(process.execPath,['--check','www/'+file],{encoding:'utf8'});
  if(result.status!==0){
    console.error('JavaScript syntax error: '+file+'\n'+(result.stderr||result.stdout));
    process.exit(1);
  }
}
console.log('Validated '+scripts.length+' bundled script references');

const combined=(await Promise.all(scripts.filter(f=>f.startsWith('winzera-inline-')).map(f=>readFile('www/'+f,'utf8')))).join('\n');
const safetyChecks=[
  ['all registered items visible in Mark Entry',"var allBaseItems=items.filter(hasParticipants);"],
  ['live search includes registered items',".filter(hasP);"],
  ['missing code warning',"Codes Missing — check Code Letters"],
  ['old ranks cleared before recalculation',"m.rank=0; if(!(m.total>0)){m.point=0;"],
  ['single mark edit invalidates declaration',"var _changedItems=DB.items();var _ci="]
];
for(const [name,needle] of safetyChecks){
  if(!combined.includes(needle))throw new Error('Winzera safety regression: '+name);
}
console.log('Validated '+safetyChecks.length+' mark-entry/result safety checks');

const uiSafetyChecks=[
  ['settings save race removed',"if (_modalSaveCallback) {"],
  ['duplicate confirmation protected',"if(document.getElementById('_modalSaveBtn'))return;"],
  ['modal safe-area layout',"wz-modal-safety"]
];
for(const [name,needle] of uiSafetyChecks){
  const source=name==='modal safe-area layout'?html:combined;
  if(!source.includes(needle))throw new Error('Winzera UI safety regression: '+name);
}
const nativeBack=await readFile('www/native-back-navigation.js','utf8');
if(!nativeBack.includes("document.addEventListener('DOMContentLoaded',register)")||
   !nativeBack.includes("document.addEventListener('resume',register)"))
  throw new Error('Native back registration regression');
console.log('Validated settings modal and Android back regression guards');

const layoutScript=await readFile('www/modal-layout.js','utf8');
if(!html.includes('wz-responsive-modal-v2')||!html.includes('modal-layout.js')||
   !layoutScript.includes("label==='close'")||
   !layoutScript.includes("top.classList.toggle('wz-duplicate-close',bottom)"))
  throw new Error('Responsive modal / duplicate close regression');
console.log('Validated modal layout and user-approved duplicate close policy');
