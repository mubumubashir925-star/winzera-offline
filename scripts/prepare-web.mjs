import { mkdir, copyFile, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
const out = 'www';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'manifest.json']) await copyFile(file, join(out, file));
await cp('icons', join(out, 'icons'), { recursive: true });
// Native builds have their own packaged assets; disable service-worker registration
// without altering the original web app or changing unrelated application logic.
let html = await readFile(join(out, 'index.html'), 'utf8');
html = html.replace(/navigator\.serviceWorker\.register\s*\(/g, 'Promise.reject(new Error("Native shell: service worker disabled")) /* native */ (');
await writeFile(join(out, 'index.html'), html);
console.log('Prepared Winzera mobile assets');
