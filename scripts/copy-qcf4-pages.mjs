/**
 * copy-qcf4-pages.mjs
 *
 * Copies the compact per-page QCF4 data into public/qcf4-pages/
 * so they can be fetched lazily at runtime (one fetch per page navigation).
 *
 * Run once:  node scripts/copy-qcf4-pages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const src  = 'src/data/qcf4-pages.json';
const dest = 'public/qcf4-pages';

mkdirSync(dest, { recursive: true });

console.log(`Reading ${src}…`);
const allPages = JSON.parse(readFileSync(src, 'utf8'));

console.log(`Writing ${allPages.length} per-page files to ${dest}/…`);
for (let i = 0; i < allPages.length; i++) {
  const num = String(i + 1).padStart(3, '0');
  writeFileSync(`${dest}/${num}.json`, JSON.stringify(allPages[i]));
  if ((i + 1) % 100 === 0) process.stdout.write(`\r  ${i + 1} / ${allPages.length}`);
}

console.log(`\n✓ Done — ${allPages.length} files written to ${dest}/`);
