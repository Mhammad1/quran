import type { Aya, PageLine, Surah } from '../types/quran';

// These are loaded lazily via dynamic import in useQuranData
let _pageMap: Map<number, Aya[]> | null = null;
let _surahAyatMap: Map<number, Aya[]> | null = null;
let _ayaById: Map<string, Aya> | null = null;
let _surahStartPage: Map<number, number> | null = null;
let _allAyat: Aya[] = [];
let _surahs: Surah[] = [];
// Line data: indexed [page-1], each entry = array of PageLine for that page
let _linesData: PageLine[][] = [];

export function buildIndex(ayat: Aya[], surahs: Surah[]) {
  _allAyat = ayat;
  _surahs = surahs;

  _pageMap = new Map();
  _surahAyatMap = new Map();
  _ayaById = new Map();
  _surahStartPage = new Map();

  for (const aya of ayat) {
    const pageList = _pageMap.get(aya.page) ?? [];
    pageList.push(aya);
    _pageMap.set(aya.page, pageList);

    const surahList = _surahAyatMap.get(aya.surah) ?? [];
    surahList.push(aya);
    _surahAyatMap.set(aya.surah, surahList);

    _ayaById.set(`${aya.surah}:${aya.ayah}`, aya);
  }

  for (const surah of surahs) {
    _surahStartPage.set(surah.number, surah.startPage);
  }
}

export function getPage(page: number): Aya[] {
  return _pageMap?.get(page) ?? [];
}

export function getSurahAyat(surahNum: number): Aya[] {
  return _surahAyatMap?.get(surahNum) ?? [];
}

export function getAyaById(surah: number, ayah: number): Aya | undefined {
  return _ayaById?.get(`${surah}:${ayah}`);
}

export function getSurahStartPage(surahNum: number): number {
  return _surahStartPage?.get(surahNum) ?? 1;
}

export function getAllSurahs(): Surah[] {
  return _surahs;
}

export function getAllAyat(): Aya[] {
  return _allAyat;
}

export function searchSurahs(query: string): Surah[] {
  if (!query.trim()) return _surahs;
  const q = query.toLowerCase().trim();
  return _surahs.filter(
    (s) =>
      s.nameEnglish.toLowerCase().includes(q) ||
      s.nameTranslit.toLowerCase().includes(q) ||
      s.nameArabic.includes(query) ||
      String(s.number) === q
  );
}

/** Store the pre-fetched line-by-line Mushaf layout data */
export function buildLineIndex(data: PageLine[][]): void {
  _linesData = data;
}

/** Return the Mushaf lines for a given page (1-based). Empty array if data not loaded. */
export function getPageLines(page: number): PageLine[] {
  return _linesData[page - 1] ?? [];
}


export function isIndexReady(): boolean {
  return _pageMap !== null;
}
