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

const professionalStyleChecks=['wz-professional-ui-v4','prefers-reduced-motion:reduce','focus-visible','--wz-touch:44px'];
for(const needle of professionalStyleChecks){
  if(!html.includes(needle))throw new Error('Professional modal UI missing: '+needle);
}
console.log('Validated professional modal styling and accessibility rules');

const coreDesignChecks=['wz-core-design-v1','.menu-card','.bottom-nav','.search-box','.empty-state','.toast','wzShimmer','prefers-reduced-motion:reduce'];
for(const needle of coreDesignChecks){
  if(!html.includes(needle))throw new Error('Core design regression: '+needle);
}
console.log('Validated dashboard, navigation, search, empty, loading and toast styling');

/* Critical interaction-flow contract checks.
 * These are packaging-time guards, NOT a substitute for Android UI tests. */
const interactionChecks=[
  ['dashboard route',/function\s+navigate\s*\(/],
  ['back navigation',/function\s+goBack\s*\(/],
  ['modal open',/function\s+showModal\s*\(/],
  ['modal close',/function\s+closeModal\s*\(/],
  ['unsaved confirmation',/function\s+_showUnsavedConfirm\s*\(/],
  ['modal save action',/_modalSaveBtn/],
  ['modal cancel action',/_modalCancelBtn/],
  ['modal discard action',/_modalDiscardBtn/],
  ['settings save',/function\s+saveConfig\s*\(/],
  ['mark entry',/function\s+renderMarks\s*\(/],
  ['search input',/search-box/],
  ['navigation stack',/pageStack\.push\s*\(/],
];
for(const [name,pattern] of interactionChecks){
  if(!pattern.test(combined))throw new Error('Critical flow missing: '+name);
}
const modalActions=['_modalSaveBtn','_modalCancelBtn','_modalDiscardBtn'];
for(const id of modalActions){
  if(!combined.includes("getElementById('"+id+"').onclick"))
    throw new Error('Missing unsaved modal action binding: '+id);
}
if(!html.includes('id="modalOverlay"')||!html.includes('id="modalContent"')||
   !html.includes('bottom-nav'))throw new Error('Navigation/modal shell missing');
console.log('Validated '+interactionChecks.length+' critical flow contracts and 3 modal button bindings');

const markLiveStart=combined.indexOf('function filterMarkList(');
if(markLiveStart<0)throw new Error('Mark Entry live search missing');
const markLiveEnd=combined.indexOf('function renderMarks(',markLiveStart);
const markLive=combined.slice(markLiveStart,markLiveEnd>markLiveStart?markLiveEnd:markLiveStart+10000);
if(!markLive.includes('var codeBadge=!allCodes(item)?')||
   markLive.includes('var codeBadge=!allCodesAssigned(item)?'))
  throw new Error('Mark Entry runtime regression: code badge uses wrong function scope');
const cameraSource=await readFile('www/native-camera.js','utf8');
if(!html.includes('native-camera.js')||
   !cameraSource.includes("camera.getPhoto(")||
   !cameraSource.includes("window._openPhotoCropper(photo.dataUrl)"))
  throw new Error('Native camera integration missing');
if(!html.includes('wz-mobile-action-spacing-v5'))throw new Error('Modal button spacing missing');
console.log('Validated Mark Entry scope, camera integration and modal action spacing');
