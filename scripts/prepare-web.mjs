import{mkdir,copyFile,cp,readFile,writeFile,rm}from'node:fs/promises';await rm('www',{recursive:true,force:true});await mkdir('www',{recursive:true});for(const f of ['index.html','manifest.json'])await copyFile(f,'www/'+f);await cp('icons','www/icons',{recursive:true});const v=process.env.WINZERA_VERSION||JSON.parse(await readFile('package.json','utf8')).version;await writeFile('www/native-updater.js',(await readFile('scripts/native-updater.js','utf8')).replace('__VERSION__',v));await copyFile('scripts/native-startup-diagnostic.js','www/native-startup-diagnostic.js');await copyFile('scripts/native-share.js','www/native-share.js');await copyFile('scripts/modal-layout.js','www/modal-layout.js');await copyFile('scripts/native-camera.js','www/native-camera.js');await copyFile('scripts/native-back-navigation.js','www/native-back-navigation.js');let h=await readFile('www/index.html','utf8');h=h.replace(/<head>/i,'<head><script src="native-back-navigation.js"></script><script src="native-startup-diagnostic.js"></script><script src="native-share.js"></script><style>html,body{width:100%;max-width:100%;overflow-x:hidden}html{font-size:16px!important}body{min-width:0!important}#app{box-sizing:border-box!important;width:100%!important;max-width:100%!important;height:100dvh!important;padding-top:env(safe-area-inset-top, 28px)!important;padding-bottom:env(safe-area-inset-bottom, 0px)!important;overflow:hidden!important}.header{flex-shrink:0!important}.content{min-height:0!important;overflow-x:hidden!important}.bottom-nav{flex-shrink:0!important}.modal-overlay{box-sizing:border-box!important;max-width:100vw!important;padding-top:max(16px,env(safe-area-inset-top, 28px))!important;padding-bottom:max(12px,env(safe-area-inset-bottom, 12px))!important}.modal{max-width:calc(100vw - 20px)!important;box-sizing:border-box!important}.menu-grid{min-width:0!important}#splash{left:0;right:0;width:100vw;max-width:100vw;touch-action:none}#wz-native-diagnostic{left:0;right:0;width:100vw;max-width:100vw;box-sizing:border-box}</style>');// Repair report preview and PDF print typography without altering source data.
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


 // Generic modal dirty guard: Save must not silently do nothing when a modal
 // has no registered save callback. Keep the edited form open and explain why.
replaceRequired(
  "if (_modalSaveCallback) {\n      _modalSaveCallback();\n    }",
  "if (_modalSaveCallback) {\n      _modalSaveCallback();\n    } else {\n      _modalDirty=true;\n      if(typeof toast==='function') toast('No save action is available here. Use the form Save button.','error');\n    }",
  'unsaved modal save feedback'
);


 // Setup modal: prevent the dirty-listener timer from resetting the snapshot
 // after the user has already edited a field.
replaceRequired(
  "    _snapModalInputs();\n    // If a photo was changed",
  "    if(!_modalDirty && !_checkModalDirty()) _snapModalInputs();\n    // If a photo was changed",
  'dirty snapshot race'
);
// Keep all unsaved-confirm buttons above native gesture areas and other overlays.
h=h.replace(/<\/head>/i,
  '<style id="wz-modal-safety">#modalOverlay:not(.hidden){z-index:99999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:max(12px,env(safe-area-inset-top,12px)) 12px max(20px,env(safe-area-inset-bottom,20px))!important;box-sizing:border-box!important}#modalOverlay:not(.hidden) .modal{max-height:calc(100dvh - 48px)!important;max-width:min(100%,520px)!important;overflow-y:auto!important;margin:auto!important}#modalContent button{position:relative;z-index:2;min-height:46px;touch-action:manipulation;pointer-events:auto!important}#modalContent .modal-handle{pointer-events:none}</style></head>');


// When the user chooses Save from the generic unsaved-changes confirmation,
// do not silently swallow a missing callback, and avoid racing the dirty-state
// snapshot against the callback that redraws the settings modal.
replaceRequired(
  "    _attachDirtyListeners();   // This will take a fresh snapshot after save is complete\n    _modalDirty = false;\n    _modalDirtySnap = null;",
  "    _modalDirty = false;\n    _modalDirtySnap = null;",
  'settings save callback race'
);
// Prevent stacked confirmation dialogs when a user presses Back repeatedly.
replaceRequired(
  "function _showUnsavedConfirm(onDiscard){\n  var mc = document.getElementById('modalContent');",
  "function _showUnsavedConfirm(onDiscard){\n  if(document.getElementById('_modalSaveBtn'))return;\n  var mc = document.getElementById('modalContent');",
  'duplicate unsaved confirmation guard'
);


/* Android viewport + safe area: fix top X escaping its modal, and keep
   scrollable content and footer controls inside the visible viewport. */
h=h.replace(/<\/head>/i,
  '<style id="wz-responsive-modal-v2">'+
  '#modalOverlay:not(.hidden){position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px calc(env(safe-area-inset-bottom,0px) + 16px)!important;box-sizing:border-box!important}'+
  '#modalOverlay>.modal{position:relative!important;flex:0 1 auto!important;width:100%!important;min-width:0!important;max-width:520px!important;max-height:100%!important;margin:0 auto!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;border-radius:20px!important;padding:24px 16px max(20px,env(safe-area-inset-bottom,0px))!important;box-sizing:border-box!important}'+
  '#modalContent>.modal-close-btn{position:absolute!important;top:14px!important;right:14px!important;left:auto!important;transform:none!important;width:38px!important;height:38px!important;min-height:38px!important;z-index:3!important}'+
  '#modalContent>.modal-close-btn.wz-duplicate-close{display:none!important}'+
  '#modalContent>.modal-title{overflow-wrap:anywhere;max-width:100%;box-sizing:border-box}'+
  '@media(max-width:380px){#modalOverlay:not(.hidden){padding-left:8px!important;padding-right:8px!important}#modalOverlay>.modal{padding-left:12px!important;padding-right:12px!important}}'+
  '</style></head>');


/* Consistent four-corner modal radius, including tall scrollable sheets. */
h=h.replace(/<\/head>/i,
  '<style id="wz-modal-rounded-v3">'+
  '#modalOverlay>.modal{border-radius:22px!important;background-clip:padding-box!important;overflow-x:hidden!important;overflow-y:auto!important;box-shadow:0 16px 48px rgba(0,0,0,.32)!important}'+
  '#modalOverlay:not(.hidden){align-items:center!important;justify-content:center!important}'+
  '#modalContent .btn{border-radius:14px;min-height:46px}'+
  '@media(max-height:650px){#modalOverlay:not(.hidden){padding-top:8px!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 8px)!important}#modalOverlay>.modal{max-height:100%!important}}'+
  '</style></head>');


/* Winzera visual refinement: appearance only; retain every existing action. */
h=h.replace(/<\/head>/i,
  '<style id="wz-professional-ui-v4">'+
  ':root{--wz-touch:44px}'+
  '#modalOverlay{isolation:isolate}'+
  '#modalOverlay>.modal{border:1px solid var(--border)!important;border-radius:22px!important;scrollbar-width:thin;scrollbar-color:var(--border) transparent;-webkit-overflow-scrolling:touch;scroll-padding-bottom:24px;contain:layout style}'+
  '#modalContent>.modal-title{font-size:clamp(1.04rem,3.8vw,1.22rem)!important;line-height:1.4!important;letter-spacing:-.015em;margin-bottom:16px!important;padding-right:0}'+
  '#modalContent>.modal-close-btn:not(.wz-duplicate-close)~.modal-title{padding-right:42px}'+
  '#modalContent .form-group{min-width:0;max-width:100%}'+
  '#modalContent .form-label{display:block;font-size:.77rem;line-height:1.45;letter-spacing:.035em;font-weight:700;margin-bottom:7px}'+
  '#modalContent input:not([type=checkbox]):not([type=radio]):not([type=hidden]),#modalContent select,#modalContent textarea{box-sizing:border-box;max-width:100%;min-width:0;min-height:44px;border-radius:12px;transition:border-color .16s ease,box-shadow .16s ease}'+
  '#modalContent textarea{min-height:110px;resize:vertical}'+
  '#modalContent input:focus-visible,#modalContent select:focus-visible,#modalContent textarea:focus-visible,#modalContent button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}'+
  '#modalContent .btn{max-width:100%;min-height:var(--wz-touch);border-radius:13px!important;font-weight:700;line-height:1.3;white-space:normal;overflow-wrap:anywhere;transition:filter .15s ease,transform .15s ease}'+
  '#modalContent .btn:active{transform:scale(.99);filter:brightness(.96)}'+
  '#modalContent .tabs{max-width:100%;min-width:0;flex-wrap:wrap;gap:6px}'+
  '#modalContent .tab{min-height:40px;display:flex;align-items:center;justify-content:center;min-width:0}'+
  '#modalContent .form-row{min-width:0;max-width:100%}'+
  '#modalContent img,#modalContent canvas,#modalContent table{max-width:100%}'+
  '@media(max-width:420px){#modalOverlay>.modal{padding:22px 16px 18px!important}#modalContent>.modal-title{font-size:1.08rem!important}}'+
  '@media(prefers-reduced-motion:reduce){#modalOverlay>.modal,#modalContent .btn,#modalContent input,#modalContent select,#modalContent textarea{animation:none!important;transition:none!important}}'+
  '</style></head>');


/* Winzera Core Design v1 — visual-only modernization of existing controls. */
h=h.replace(/<\/head>/i,
  '<style id="wz-core-design-v1">'+
  ':root{--wz-radius-card:17px;--wz-radius-control:12px;--wz-focus:var(--accent)}'+
  '.menu-grid{gap:12px!important;min-width:0!important}'+
  '.menu-card{min-width:0;border-radius:var(--wz-radius-card)!important;padding:18px 12px!important;box-shadow:0 3px 14px rgba(0,0,0,.08);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease!important}'+
  '.menu-card .mc-title{font-weight:800;line-height:1.35;overflow-wrap:anywhere}'+
  '.menu-card .mc-sub{line-height:1.45}'+
  '.menu-card:active{transform:scale(.98)!important}'+
  '.bottom-nav{box-sizing:border-box;min-width:0;padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -5px 22px rgba(0,0,0,.10)}'+
  '.nav-item{min-width:0;min-height:56px!important;gap:3px;padding:8px 2px!important;border-radius:12px;justify-content:center}'+
  '.nav-item.active{background:color-mix(in srgb,var(--accent) 12%,transparent);font-weight:800}'+
  '.nav-item .nav-label{font-size:clamp(.55rem,2.3vw,.68rem)!important;line-height:1.2;text-align:center;overflow-wrap:anywhere}'+
  '.search-box{box-sizing:border-box;min-width:0;max-width:100%;border-radius:var(--wz-radius-control)!important;min-height:46px;transition:border-color .15s ease,box-shadow .15s ease}'+
  '.search-box:focus-within{border-color:var(--accent)!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 18%,transparent)}'+
  '.search-box input{min-width:0;width:100%;font-size:16px!important}'+
  '.filter-chip,.filter-btn,.chip{border-radius:999px;min-height:36px;touch-action:manipulation}'+
  '.empty-state,.empty-msg,.no-results{max-width:100%;box-sizing:border-box;text-align:center;padding:24px 16px;border:1px dashed var(--border);border-radius:16px;color:var(--text2);line-height:1.6}'+
  '.toast{box-sizing:border-box;max-width:min(420px,calc(100vw - 32px))!important;width:max-content;overflow-wrap:anywhere;line-height:1.45;border-radius:14px!important;box-shadow:0 12px 32px rgba(0,0,0,.22)!important;z-index:100000!important}'+
  '.spinner,.loading-spinner{animation-duration:.8s;will-change:transform}'+
  '.skeleton,.loading-skeleton{border-radius:12px;background:linear-gradient(90deg,var(--card) 25%,var(--bg3) 50%,var(--card) 75%);background-size:200% 100%;animation:wzShimmer 1.5s ease-in-out infinite}'+
  '@keyframes wzShimmer{from{background-position:200% 0}to{background-position:-200% 0}}'+
  '.menu-card:focus-visible,.nav-item:focus-visible,.filter-chip:focus-visible,.filter-btn:focus-visible{outline:2px solid var(--wz-focus);outline-offset:2px}'+
  '@media(max-width:380px){.menu-grid{gap:9px!important}.menu-card{padding:14px 8px!important}.nav-item .nav-label{font-size:.55rem!important}}'+
  '@media(prefers-reduced-motion:reduce){.menu-card,.search-box,.spinner,.loading-spinner,.skeleton,.loading-skeleton{animation:none!important;transition:none!important}}'+
  '</style></head>');


/* Fix Mark Entry crash: live-search renderer has allCodes(), not
   allCodesAssigned(). The earlier safety patch used the wrong scope. */
replaceRequired(
  "var codeBadge=!allCodesAssigned(item)?",
  "var codeBadge=!allCodes(item)?",
  'mark entry live search code badge scope'
);
// Keep modal action rows separated, including preview-generated buttons.
h=h.replace(/<\/head>/i,
  '<style id="wz-mobile-action-spacing-v5">'+
  '#modalContent .btn-row,#modalContent .button-row,#modalContent .action-row,#modalContent .form-actions{display:flex;flex-wrap:wrap;gap:12px!important;align-items:stretch;min-width:0}'+
  '#modalContent .btn-row>.btn,#modalContent .button-row>.btn,#modalContent .action-row>.btn,#modalContent .form-actions>.btn{flex:1 1 140px;min-width:0;margin:0!important}'+
  '#modalContent .btn+.btn{margin-left:0!important}'+
  '#modalOverlay>.modal{margin:auto!important;max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 24px)!important}'+
  '#modalOverlay:not(.hidden){align-items:center!important;justify-content:center!important}'+
  '#modalContent button{touch-action:manipulation}'+
  '@media(max-width:390px){#modalContent .btn-row,#modalContent .button-row,#modalContent .action-row,#modalContent .form-actions{gap:10px!important}}'+
  '</style></head>');


h=h.replace(/<\/head>/i,
  '<style id="wz-bulk-preview-layout-v6">'+
  '#ba-i-preview-wrap>div[style*="display:flex"],#ba-i-preview-wrap div[style*="display:flex;gap:8px"]{gap:12px!important;flex-wrap:wrap!important;align-items:stretch!important}'+
  '#ba-i-preview-wrap div[style*="display:flex;gap:8px"]>.btn{flex:1 1 140px!important;min-width:0!important;margin:0!important}'+
  '#modalContent .btn-primary,#modalContent .btn-secondary{box-sizing:border-box}'+
  '</style></head>');


/* Dirty guard correctness: compare current values to baseline, not whether
   an input/change event ever fired. Dynamic controls get stable identity. */
replaceRequired(
  "function _modalInputChanged(){ _modalDirty=true; }",
  "function _modalInputChanged(){ _modalDirty=_checkModalDirty() || !!_participantPhotoChanged; }",
  'dirty guard actual value comparison'
);
replaceRequired(
  "  if(!_modalDirtyIgnore&&(_modalDirty||_checkModalDirty())){",
  "  if(!_modalDirtyIgnore&&(_checkModalDirty() || !!_participantPhotoChanged)){",
  'close modal only on actual unsaved changes'
);
// Don't let an old listener timer snapshot a newer modal, or overwrite edits.
replaceRequired(
  "  setTimeout(function(){\\n    var mc=document.getElementById('modalContent'); if(!mc) return;",
  "  var expectedHtml=document.getElementById('modalContent')?.firstElementChild;\\n  setTimeout(function(){\\n    var mc=document.getElementById('modalContent'); if(!mc||mc.firstElementChild!==expectedHtml) return;",
  'dirty listener timer modal identity'
);
// A successful form save should clear the old baseline before close.
replaceRequired(
  "function _closeModalClean(){\\n  _modalDirty=false; _modalDirtySnap=null; _modalDirtyIgnore=true;",
  "function _closeModalClean(){\\n  _modalDirty=false; _modalDirtySnap=null; _participantPhotoChanged=false; _modalDirtyIgnore=true;",
  'clean close resets photo dirty state'
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
await writeFile('www/index.html',h.replace(/<\/body>/i,'<script src="modal-layout.js"></script><script src="native-camera.js"></script><script src="native-updater.js"></script></body>'));