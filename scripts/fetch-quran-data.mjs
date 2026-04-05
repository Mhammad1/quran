/**
 * One-time script to fetch Quran data from alquran.cloud and bundle it as static JSON.
 * Run: node scripts/fetch-quran-data.mjs
 * Output: src/data/quran.json, src/data/surahs.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');

mkdirSync(dataDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error(`API code ${json.code}`);
      return json.data;
    } catch (e) {
      console.warn(`  Retry ${i + 1}/${retries} for ${url}: ${e.message}`);
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

// ── Fetch surahs metadata ─────────────────────────────────────────────────────
console.log('Fetching surah metadata...');
const surahsRaw = await fetchWithRetry('https://api.alquran.cloud/v1/surah');
const surahs = surahsRaw.map((s) => ({
  number: s.number,
  nameArabic: s.name,
  nameEnglish: s.englishName,
  nameTranslit: s.englishName, // alquran.cloud uses englishName as transliteration
  ayahCount: s.numberOfAyahs,
  startPage: 0, // will fill from page data
  revelationType: s.revelationType,
}));

// ── Fetch all 604 pages ───────────────────────────────────────────────────────
const ayatMap = new Map(); // globalAyah → Aya (dedup)
const surahStartPages = new Map(); // surahNum → first page seen

console.log('Fetching 604 pages (this takes a few minutes)...');
for (let page = 1; page <= 604; page++) {
  process.stdout.write(`\r  Page ${page}/604`);
  const data = await fetchWithRetry(
    `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`
  );

  for (const aya of data.ayahs) {
    const surahNum = aya.surah.number;
    const ayahNum = aya.numberInSurah;
    const globalAyah = aya.number;
    const key = globalAyah;

    if (!ayatMap.has(key)) {
      ayatMap.set(key, {
        surah: surahNum,
        ayah: ayahNum,
        globalAyah,
        text: aya.text,
        page,
        juz: aya.juz,
      });
    }

    if (!surahStartPages.has(surahNum)) {
      surahStartPages.set(surahNum, page);
    }
  }

  await sleep(80); // ~80ms between requests
}
process.stdout.write('\n');

// Fill startPage into surahs
for (const surah of surahs) {
  surah.startPage = surahStartPages.get(surah.number) ?? 1;
}

// Sort ayat by globalAyah
const ayat = Array.from(ayatMap.values()).sort((a, b) => a.globalAyah - b.globalAyah);

// ── Write output ──────────────────────────────────────────────────────────────
writeFileSync(join(dataDir, 'quran.json'), JSON.stringify(ayat));
writeFileSync(join(dataDir, 'surahs.json'), JSON.stringify(surahs));

console.log(`Done!`);
console.log(`  quran.json  → ${ayat.length} ayat`);
console.log(`  surahs.json → ${surahs.length} surahs`);
