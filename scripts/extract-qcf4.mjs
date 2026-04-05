/**
 * extract-qcf4.mjs
 *
 * Extracts the QCF4 King Fahd Complex Font v4 data from the quran-qcf4
 * package and produces:
 *
 *   public/fonts/qcf4/            — 47 juz WOFF2 fonts + QBSML header font
 *   src/data/qcf4-pages.json      — compact per-page line/word data
 *
 * Run once:  node scripts/extract-qcf4.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const PKG = resolve('node_modules/quran-qcf4');

// ── 1. Copy font files ────────────────────────────────────────────────────────
const FONT_SRC  = join(PKG, 'fonts-woff2');
const FONT_DEST = 'public/fonts/qcf4';
mkdirSync(FONT_DEST, { recursive: true });

const fonts = [];
for (let i = 1; i <= 47; i++) {
  const name = `QCF4_Hafs_${String(i).padStart(2, '0')}_W.woff2`;
  copyFileSync(join(FONT_SRC, name), join(FONT_DEST, name));
  fonts.push(`QCF4_Hafs_${String(i).padStart(2, '0')}`);
}
copyFileSync(join(FONT_SRC, 'QCF4_QBSML.woff2'), join(FONT_DEST, 'QCF4_QBSML.woff2'));
console.log(`✓ Copied 48 font files to ${FONT_DEST}`);

// ── 2. Build compact page data ────────────────────────────────────────────────
// Format:
//   Array of 604 page objects, indexed [pageNum - 1]:
//   {
//     font: "QCF4_Hafs_01",   // main font for this page
//     lines: [
//       {
//         n: 3,                // Mushaf line number (1-based within page)
//         w: [
//           { c: "…",          // PUA char → rendered by font as glyph
//             v: "2:1",        // verse_key (word & end types only)
//             e: 1,            // aya-end marker flag (optional)
//             q: 1,            // quarter/hizb marker flag (optional)
//             f: "QCF4_QBSML" // font override (optional, when differs from page font)
//           }
//         ]
//       }
//     ]
//   }
//
// surah_header and bismillah lines are EXCLUDED — we render those ourselves.

console.log('Building compact QCF4 page data for 604 pages…');

const allPages = new Array(604);

for (let p = 1; p <= 604; p++) {
  process.stdout.write(`\r  Page ${String(p).padStart(3)} / 604 …`);

  const padded = String(p).padStart(3, '0');
  const json = JSON.parse(readFileSync(join(PKG, 'pages', `${padded}.json`), 'utf8'));

  const lines = [];

  for (const line of json.lines) {
    // Filter out surah_header and bismillah lines
    // (we render those via our SurahHeader React component)
    const words = line.words.filter(
      (w) => w.type !== 'surah_header' && w.type !== 'bismillah'
    );
    if (words.length === 0) continue;

    const compactWords = words.map((w) => {
      const entry = { c: w.char };

      if (w.verse_key)        entry.v = w.verse_key;
      if (w.type === 'end')   entry.e = 1;
      if (w.type === 'quarter') entry.q = 1;

      // Only include font override when it differs from the page font
      if (w.font && w.font !== json.font) entry.f = w.font;

      return entry;
    });

    lines.push({ n: line.line, w: compactWords });
  }

  allPages[p - 1] = { font: json.font, lines };
}

console.log('\n\nWriting src/data/qcf4-pages.json …');
writeFileSync('src/data/qcf4-pages.json', JSON.stringify(allPages));

const totalLines = allPages.reduce((s, p) => s + p.lines.length, 0);
const totalWords = allPages.reduce((s, p) =>
  p.lines.reduce((s2, l) => s2 + l.w.length, 0) + s, 0);

const fileSizeMB = (readFileSync('src/data/qcf4-pages.json').length / 1024 / 1024).toFixed(2);
console.log(`✓ Done — ${totalLines} lines, ${totalWords} word entries, ${fileSizeMB} MB`);
