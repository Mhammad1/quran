/**
 * fetch-quran-lines.mjs
 *
 * Fetches word-level data with exact Madinah Mushaf line numbers from the
 * quran.com API v4.  Run once:
 *
 *   node scripts/fetch-quran-lines.mjs
 *
 * Output: src/data/quran-lines.json
 *
 * Data shape (array indexed by page-1, i.e. allPages[0] = page 1):
 *   Array<           // 604 pages
 *     Array<         // lines on that page (sorted by line number)
 *       {
 *         n: number,   // line number within the page (1-based, from Mushaf)
 *         w: Array<{
 *           t: string,   // Uthmani text of the word / end-marker
 *           s: number,   // surah number
 *           a: number,   // ayah number within surah
 *           p: number,   // word position within ayah (1-based)
 *           e?: 1        // present when this entry is an aya-end marker
 *         }>
 *       }
 *     >
 *   >
 */

import { writeFileSync } from 'fs';

const TOTAL_PAGES = 604;
const DELAY_MS    = 250;   // polite delay between pages
const PER_PAGE    = 50;    // quran.com max; should cover any Mushaf page

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = attempt * 800;
      console.error(`  ↺ retry ${attempt}/${retries - 1} after ${wait}ms — ${err.message}`);
      await sleep(wait);
    }
  }
}

async function fetchAllVersesForPage(pageNum) {
  let apiPage = 1;
  const allVerses = [];

  while (true) {
    const url =
      `https://api.quran.com/api/v4/verses/by_page/${pageNum}` +
      `?words=true` +
      `&word_fields=text_uthmani,line_number,page_number` +
      `&per_page=${PER_PAGE}` +
      `&page=${apiPage}` +
      `&fields=verse_key`;

    const data = await fetchWithRetry(url);
    allVerses.push(...data.verses);

    // Check for additional pages
    if (data.pagination && data.pagination.next_page) {
      apiPage = data.pagination.next_page;
    } else {
      break;
    }
  }

  return allVerses;
}

function buildLinesFromVerses(verses) {
  // Map: lineNum → word entries
  const lineMap = new Map();

  for (const verse of verses) {
    const [s, a] = verse.verse_key.split(':').map(Number);

    for (const word of verse.words) {
      const ln = word.line_number;
      if (!ln) continue; // skip if no line number

      if (!lineMap.has(ln)) lineMap.set(ln, []);

      const entry = {
        t: word.text_uthmani,
        s,
        a,
        p: word.position,
      };
      if (word.char_type_name === 'end') entry.e = 1;

      lineMap.get(ln).push(entry);
    }
  }

  return [...lineMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([n, w]) => ({ n, w }));
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`Fetching line data for ${TOTAL_PAGES} pages from quran.com…\n`);

const allPages = new Array(TOTAL_PAGES);

for (let p = 1; p <= TOTAL_PAGES; p++) {
  process.stdout.write(`\r  Page ${String(p).padStart(3)} / ${TOTAL_PAGES} …`);

  try {
    const verses = await fetchAllVersesForPage(p);
    allPages[p - 1] = buildLinesFromVerses(verses);
  } catch (err) {
    console.error(`\n  ✗ Failed page ${p}: ${err.message}`);
    allPages[p - 1] = [];
  }

  if (p < TOTAL_PAGES) await sleep(DELAY_MS);
}

console.log('\n\nWriting src/data/quran-lines.json …');
writeFileSync('src/data/quran-lines.json', JSON.stringify(allPages));

const totalLines = allPages.reduce((s, p) => s + p.length, 0);
const totalWords = allPages.reduce((s, p) => p.reduce((s2, l) => s2 + l.w.length, 0) + s, 0);
console.log(`✓ Done — ${totalLines} lines, ${totalWords} word entries across ${TOTAL_PAGES} pages.`);
