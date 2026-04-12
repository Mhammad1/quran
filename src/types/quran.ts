export interface Aya {
  surah: number;       // 1-114
  ayah: number;        // within surah
  globalAyah: number;  // 1-6236
  text: string;        // Uthmani Arabic text
  page: number;        // 1-604 (Madinah mushaf)
  juz: number;         // 1-30
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslit: string;
  ayahCount: number;
  startPage: number;
  revelationType: string;
}

export interface SpecialAya {
  id: string;          // `${surah}:${ayah}`
  surah: number;
  ayah: number;
  globalAyah: number;
  page: number;
  note: string;
  addedAt: number;     // Date.now()
}

export type SortOrder = 'random' | 'asc' | 'desc' | 'recent';

/** One word (or aya-end marker) entry inside a Mushaf page line */
export interface PageWordEntry {
  t: string;   // Uthmani text of the word / end-marker glyph
  s: number;   // surah number (1-114)
  a: number;   // ayah number within surah
  p: number;   // word position within the ayah (1-based)
  e?: 1;       // present (=1) when this is the aya-end marker
}

/** One physical line of the Madinah Mushaf */
export interface PageLine {
  n: number;           // line number within the page (1-based, from Mushaf)
  w: PageWordEntry[];  // words on this line, in reading order (RTL: first word = rightmost)
}

// ── QCF4 King Fahd Complex Font v4 types ─────────────────────────────────────

/** One word/marker entry from QCF4 page data */
export interface QCF4Word {
  c: string;    // Unicode PUA character — renders as Mushaf glyph in the QCF4 font
  v?: string;   // verse_key "surah:ayah" — present for word and end types
  e?: 1;        // aya-end marker flag
  q?: 1;        // quarter/hizb marker flag
  f?: string;   // font override (when this word uses a different font than the page default)
}

/** One physical Mushaf line from QCF4 data */
export interface QCF4Line {
  n: number;        // line number within the page
  w: QCF4Word[];    // words on this line
}

/** QCF4 data for a single Mushaf page */
export interface QCF4Page {
  font: string;       // main QCF4 font name for this page, e.g. "QCF4_Hafs_01"
  lines: QCF4Line[];  // text lines (surah headers and Bismillahs excluded)
}
