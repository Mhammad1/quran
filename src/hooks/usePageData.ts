import { useState, useEffect } from 'react';
import { getPage } from '../utils/quranIndex';
import type { Aya, QCF4Page } from '../types/quran';

// Cache: page number → QCF4 data
const qcf4Cache = new Map<number, QCF4Page>();
// Track which fonts are already loaded/loading
const loadedFonts = new Set<string>();

async function loadFont(fontName: string): Promise<void> {
  if (loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const num = fontName.replace('QCF4_Hafs_', '');
  const url = `/fonts/qcf4/QCF4_Hafs_${num}_W.woff2`;
  try {
    const face = new FontFace(fontName, `url(${url}) format('woff2')`);
    const loaded = await face.load();
    document.fonts.add(loaded);
  } catch {
    loadedFonts.delete(fontName); // allow retry
  }
}

async function fetchQCF4Page(pageNum: number): Promise<QCF4Page | null> {
  if (qcf4Cache.has(pageNum)) return qcf4Cache.get(pageNum)!;
  const num = String(pageNum).padStart(3, '0');
  try {
    const res = await fetch(`/qcf4-pages/${num}.json`);
    if (!res.ok) return null;
    const data: QCF4Page = await res.json();
    // Evict oldest entry if cache is too large
    if (qcf4Cache.size > 12) {
      const first = qcf4Cache.keys().next().value;
      if (first !== undefined) qcf4Cache.delete(first);
    }
    qcf4Cache.set(pageNum, data);
    return data;
  } catch {
    return null;
  }
}

interface PageData {
  ayat: Aya[];
  qcf4: QCF4Page | null;
  qcf4Ready: boolean;
}

export function usePageData(pageNum: number, indexReady: boolean): PageData {
  const ayat = indexReady ? getPage(pageNum) : [];

  const [qcf4, setQcf4] = useState<QCF4Page | null>(
    () => qcf4Cache.get(pageNum) ?? null
  );
  const [qcf4Ready, setQcf4Ready] = useState(() => qcf4Cache.has(pageNum));

  useEffect(() => {
    if (!indexReady) return;
    let cancelled = false;

    if (qcf4Cache.has(pageNum)) {
      const cached = qcf4Cache.get(pageNum)!;
      setQcf4(cached);
      setQcf4Ready(true);
      // Ensure font is loaded even for cached pages
      loadFont(cached.font);
      return;
    }

    setQcf4Ready(false);

    (async () => {
      const data = await fetchQCF4Page(pageNum);
      if (cancelled || !data) {
        if (!cancelled) { setQcf4(null); setQcf4Ready(true); }
        return;
      }
      // Load the font for this page, then mark ready
      await loadFont(data.font);
      if (!cancelled) {
        setQcf4(data);
        setQcf4Ready(true);
      }
    })();

    return () => { cancelled = true; };
  }, [pageNum, indexReady]);

  return { ayat, qcf4, qcf4Ready };
}
