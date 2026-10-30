import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
const out = 'www';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'manifest.json']) {
  await copyFile(file, join(out, file));
}
await cp('icons', join(out, 'icons'), { recursive: true });
console.log('Prepared original Winzera assets for native packaging');
