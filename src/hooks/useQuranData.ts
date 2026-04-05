import { useState, useEffect } from 'react';
import {
  buildIndex,
  getAllSurahs,
  searchSurahs,
  isIndexReady,
} from '../utils/quranIndex';
import type { Aya, Surah } from '../types/quran';

let indexBuilt = false;
let buildPromise: Promise<void> | null = null;

function ensureIndex(): Promise<void> {
  if (indexBuilt) return Promise.resolve();
  if (buildPromise) return buildPromise;

  buildPromise = (async () => {
    const [quranModule, surahsModule] = await Promise.all([
      import('../data/quran.json'),
      import('../data/surahs.json'),
    ]);
    buildIndex(quranModule.default as Aya[], surahsModule.default as Surah[]);
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
