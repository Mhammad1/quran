import { useState, useEffect } from 'react';
import {
  buildIndex,
  buildLineIndex,
  getAllSurahs,
  searchSurahs,
  isIndexReady,
} from '../utils/quranIndex';
import type { Aya, PageLine, Surah } from '../types/quran';

let indexBuilt = false;
let buildPromise: Promise<void> | null = null;

function ensureIndex(): Promise<void> {
  if (indexBuilt) return Promise.resolve();
  if (buildPromise) return buildPromise;

  buildPromise = (async () => {
    const [quranModule, surahsModule, linesModule] = await Promise.all([
      import('../data/quran.json'),
      import('../data/surahs.json'),
      import('../data/quran-lines.json'),
    ]);
    buildIndex(quranModule.default as Aya[], surahsModule.default as Surah[]);
    buildLineIndex(linesModule.default as PageLine[][]);
    indexBuilt = true;
  })();

  return buildPromise;
}

export function useQuranData() {
  const [ready, setReady] = useState(isIndexReady());

  useEffect(() => {
    if (ready) return;
    ensureIndex().then(() => setReady(true));
  }, [ready]);

  return {
    ready,
    getAllSurahs,
    searchSurahs,
  };
}
