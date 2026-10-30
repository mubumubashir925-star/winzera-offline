import { mkdir, copyFile, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
const out='www';
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of ['index.html','manifest.json']) await copyFile(file,join(out,file));
await cp('icons',join(out,'icons'),{recursive:true});
// The native WebView loads packaged assets; the website service worker must not cache stale app shells.
let html=await readFile(join(out,'index.html'),'utf8');
html=html.replace(/navigator\\.serviceWorker\\.register\\s*\\(/g,'Promise.reject(new Error("Native app: service worker disabled")) /* register */ (');
await writeFile(join(out,'index.html'),html);
console.log('Prepared bundled Winzera assets in www/');
