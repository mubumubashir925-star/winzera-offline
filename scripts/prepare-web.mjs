import{mkdir,copyFile,cp,readFile,writeFile,rm}from'node:fs/promises';await rm('www',{recursive:true,force:true});await mkdir('www',{recursive:true});for(const f of ['index.html','manifest.json'])await copyFile(f,'www/'+f);await cp('icons','www/icons',{recursive:true});const v=process.env.WINZERA_VERSION||JSON.parse(await readFile('package.json','utf8')).version;await writeFile('www/native-updater.js',(await readFile('scripts/native-updater.js','utf8')).replace('__VERSION__',v));await copyFile('scripts/native-startup-diagnostic.js','www/native-startup-diagnostic.js');await copyFile('scripts/native-share.js','www/native-share.js');await copyFile('scripts/native-back-navigation.js','www/native-back-navigation.js');let h=await readFile('www/index.html','utf8');h=h.replace(/<head>/i,'<head><script src="native-back-navigation.js"></script><script src="native-startup-diagnostic.js"></script><script src="native-share.js"></script><style>html,body{width:100%;max-width:100%;overflow-x:hidden}html{font-size:16px!important}body{min-width:0!important}#app{box-sizing:border-box!important;width:100%!important;max-width:100%!important;height:100dvh!important;padding-top:env(safe-area-inset-top, 28px)!important;padding-bottom:env(safe-area-inset-bottom, 0px)!important;overflow:hidden!important}.header{flex-shrink:0!important}.content{min-height:0!important;overflow-x:hidden!important}.bottom-nav{flex-shrink:0!important}.modal-overlay{box-sizing:border-box!important;max-width:100vw!important;padding-top:max(16px,env(safe-area-inset-top, 28px))!important;padding-bottom:max(12px,env(safe-area-inset-bottom, 12px))!important}.modal{max-width:calc(100vw - 20px)!important;box-sizing:border-box!important}.menu-grid{min-width:0!important}#splash{left:0;right:0;width:100vw;max-width:100vw;touch-action:none}#wz-native-diagnostic{left:0;right:0;width:100vw;max-width:100vw;box-sizing:border-box}</style>');// Repair report preview and PDF print typography without altering source data.
h=h.replace("word-break:break-word;font-weight:900;color:#000","word-break:normal;overflow-wrap:normal;font-weight:700;color:#000");
h=h.replace("+'@media print{'\\n    +'.ptbar{display:none!important}'","+'@media screen and (max-width:699px){.pgwrap,.pgcard{min-width:820px}.ptbar{position:fixed;left:0;right:0;width:100%}.pgwrap{padding-top:46px}body{overflow-x:auto!important}}'\\n    +'@media print{'\\n    +'table{table-layout:auto!important;font-size:8pt!important}'\\n    +'td,th{font-size:8pt!important;padding:3px 4px!important;word-break:normal!important;overflow-wrap:normal!important}'\\n    +'.pgwrap,.pgcard{min-width:0!important;width:100%!important}'\\n    +'.ptbar{display:none!important}'");

// Winzera data-integrity fixes. Keep original backup untouched; patch packaged source
// with exact-match guards so upstream changes fail visibly instead of silently.
function replaceRequired(before,after,label){
  if(!h.includes(before))throw new Error('Winzera safety patch target missing: '+label);
  h=h.replace(before,after);
}
// An item must NEVER vanish from Mark Entry because a code letter is missing.
// Code status is shown explicitly, and the existing mark modal remains accessible.
replaceRequired(
  "var allBaseItems=items.filter(hasParticipants).filter(allCodesAssigned);",
  "var allBaseItems=items.filter(hasParticipants);",
  'mark-entry visibility'
);
replaceRequired(
  "var base=(sec==='All'?items:items.filter(function(i){return i.section===sec;})).filter(function(i){return hasP(i)&&allCodes(i);});",
  "var base=(sec==='All'?items:items.filter(function(i){return i.section===sec;})).filter(hasP);",
  'mark-entry live search visibility'
);
replaceRequired(
  "base.length===0?'No items with all codes assigned yet. Go to Code Letters to assign codes.'",
  "base.length===0?'No registered items in this section.'",
  'empty mark list message'
);
replaceRequired(
  "var declBadge=item.declared?",
  "var codeBadge=!allCodesAssigned(item)?'<span class=\"badge badge-orange\" style=\"font-size:.62rem\">Codes Missing — check Code Letters</span>':''; var declBadge=item.declared?",
  'code status warning'
);
replaceRequired(
  "+statusBadge+declBadge+'</div>'",
  "+statusBadge+declBadge+codeBadge+'</div>'",
  'code status display'
);
// Rank recalculation must clear ranks and rank bonuses for zero/cleared entries,
// otherwise previous winners retain points and appear alongside new winners.
replaceRequired(
  "var itemMarks=marks.filter(function(m){return m.itemId===itemId&&m.total>0;});\n  itemMarks.sort",
  "marks.forEach(function(m){if(m.itemId===itemId){m.rank=0; if(!(m.total>0)){m.point=0;m.grade='';m.pct=0;}}});\n  var itemMarks=marks.filter(function(m){return m.itemId===itemId&&m.total>0;});\n  itemMarks.sort",
  'stale winner rank cleanup'
);

replaceRequired(
  "DB.saveMarks(marks);\n  assignRanks(itemId); // recompute Rank Points immediately, not just at Declare",
  "DB.saveMarks(marks);\n  var _changedItems=DB.items();var _ci=_changedItems.findIndex(function(i){return i.id===itemId;});if(_ci>=0&&_changedItems[_ci].declared){_changedItems[_ci].declared=false;DB.saveItems(_changedItems);}\n  assignRanks(itemId); // recompute Rank Points immediately, not just at Declare",
  'single mark declaration invalidation'
);
// Changing an individual mark must invalidate an already declared result,
// just as Save All does. Prevent publication of an outdated winner list.
replaceRequired(
  "DB.saveMarks(allMarks);\n  assignRanks(itemId); // recompute Rank Points immediately, not just at Declare",
  "DB.saveMarks(allMarks);\n  var _changedItems=DB.items();var _ci=_changedItems.findIndex(function(i){return i.id===itemId;});if(_ci>=0&&_changedItems[_ci].declared){_changedItems[_ci].declared=false;DB.saveItems(_changedItems);}\n  assignRanks(itemId); // recompute Rank Points immediately, not just at Declare",
  'autosave declaration invalidation'
);

const extracted=[];
let inlineIndex=0;
h=h.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(whole,attrs,js)=>{
  if(/\bsrc\s*=/.test(attrs))return whole;
  inlineIndex++;
  const filename='winzera-inline-'+inlineIndex+'.js';
  extracted.push({filename,js});
  return '<script src="'+filename+'"></script>';
});
for(const item of extracted)await writeFile('www/'+item.filename,item.js);
await writeFile('www/index.html',h.replace(/<\/body>/i,'<script src="native-updater.js"></script></body>'));