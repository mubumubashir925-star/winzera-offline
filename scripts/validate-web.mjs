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
