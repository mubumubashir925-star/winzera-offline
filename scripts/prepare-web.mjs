import{mkdir,copyFile,cp,readFile,writeFile,rm}from'node:fs/promises';await rm('www',{recursive:true,force:true});await mkdir('www',{recursive:true});for(const f of ['index.html','manifest.json'])await copyFile(f,'www/'+f);await cp('icons','www/icons',{recursive:true});const v=process.env.WINZERA_VERSION||JSON.parse(await readFile('package.json','utf8')).version;await writeFile('www/native-updater.js',(await readFile('scripts/native-updater.js','utf8')).replace('__VERSION__',v));await copyFile('scripts/native-startup-diagnostic.js','www/native-startup-diagnostic.js');let h=await readFile('www/index.html','utf8');h=h.replace(/<head>/i,'<head><script src="native-startup-diagnostic.js"></script><style>html,body{width:100%;max-width:100%;overflow-x:hidden}#splash{left:0;right:0;width:100vw;max-width:100vw;touch-action:none}#wz-native-diagnostic{left:0;right:0;width:100vw;max-width:100vw;box-sizing:border-box}</style>');const extracted=[];
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