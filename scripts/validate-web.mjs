import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const html=await readFile('www/index.html','utf8');
const regex=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match,count=0;
await mkdir('www/.syntax-check',{recursive:true});
while((match=regex.exec(html))){
  if(/\bsrc\s*=/.test(match[1]))continue;
  count++;
  const file='www/.syntax-check/inline-'+count+'.js';
  await writeFile(file,match[2]);
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0){
    console.error('JavaScript syntax error in inline script #'+count+' (HTML line '+(html.slice(0,match.index).split('\n').length)+')');
    console.error(result.stderr||result.stdout);
    process.exit(1);
  }
}
console.log('Checked '+count+' inline JavaScript blocks successfully');
