import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Aya, QCF4Line, QCF4Page, QCF4Word, Surah } from '../../types/quran';
import { useSpecialAyatStore } from '../../store/specialAyatStore';
import { getAllSurahs } from '../../utils/quranIndex';
import { toEasternNumeral } from '../../utils/arabic';
import SurahHeader from './SurahHeader';
import PageHeader from './PageHeader';

interface Props {
  ayat: Aya[];
  qcf4: QCF4Page | null;
  qcf4Ready: boolean;
  pageNumber: number;
  fontSize?: string;
  side?: 'right' | 'left';
}

// ── Single Mushaf line rendered with QCF4 font glyphs ───────────────────────
interface QCF4LineProps {
  line: QCF4Line;
  pageFont: string;
  isSpecialFn: (id: string) => boolean;
  assignedIds: Set<string>;
  fontSize: string;
  activeVk: string | null;
}

function QCF4MushafLine({ line, pageFont, isSpecialFn, assignedIds, fontSize, activeVk }: QCF4LineProps) {
  const nodes: ReactNode[] = [];

  for (let i = 0; i < line.w.length; i++) {
    const word: QCF4Word = line.w[i];
    const font = word.f ?? pageFont;
    const verseKey = word.v ?? null;
    const special = verseKey ? isSpecialFn(verseKey) : false;
    const active = verseKey !== null && verseKey === activeVk;

    // Highlight class + padding trick to bridge the flex gaps
    const hlClass = active
      ? 'bg-amber-300/60 rounded-sm'
      : special
      ? 'bg-amber-100 rounded-sm'
      : undefined;
    const hlStyle: CSSProperties = hlClass
      ? { fontFamily: font, paddingInline: '4px', marginInline: '-4px' }
      : { fontFamily: font };

    if (word.e) {
      nodes.push(
        <span
          key={`end-${i}`}
          data-vk={verseKey ?? undefined}
          className={hlClass ? `inline-block ${hlClass}` : 'inline-block'}
          style={{ ...hlStyle, direction: 'ltr', verticalAlign: 'middle' }}
        >
          {word.c}
        </span>
      );
    } else {
      const isFirst = verseKey && !assignedIds.has(verseKey);
      if (verseKey && isFirst) assignedIds.add(verseKey);

      const [s, a] = verseKey ? verseKey.split(':').map(Number) : [0, 0];
      const anchorId = isFirst ? `aya-${s}-${a}` : undefined;

      nodes.push(
        <span
          key={`w-${i}`}
          id={anchorId}
          data-vk={verseKey ?? undefined}
          className={hlClass}
          style={hlStyle}
        >
          {word.c}
        </span>
      );
    }
  }

  return (
    <div
      dir="rtl"
      className="flex items-center w-full"
      style={{ justifyContent: 'space-between', lineHeight: 2.0, fontSize }}
    >
      {nodes}
    </div>
  );
}

// ── Context menu ─────────────────────────────────────────────────────────────
interface CtxMenuState { x: number; y: number; verseKey: string }

function AyaContextMenu({
  menu,
  isSpecial,
  onAdd,
  onRemove,
  onClose,
}: {
  menu: CtxMenuState;
  isSpecial: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [surah, ayah] = menu.verseKey.split(':');
  const safeX = Math.min(menu.x, window.innerWidth - 220);
  const safeY = Math.min(menu.y, window.innerHeight - 110);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onMouseDown={onClose} onTouchStart={onClose} />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
        style={{ left: safeX, top: safeY }}
      >
        <div className="px-4 py-2 text-xs text-stone-400 bg-stone-50 border-b border-stone-100 text-right" dir="rtl">
          سورة {surah} · الآية {toEasternNumeral(parseInt(ayah))}
        </div>
        {isSpecial ? (
          <button
            onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            dir="rtl"
          >
            إزالة من المحفوظ
          </button>
        ) : (
          <button
            onMouseDown={(e) => { e.stopPropagation(); onAdd(); }}
            className="w-full text-right px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
            dir="rtl"
          >
            إضافة إلى المحفوظ
          </button>
        )}
      </div>
    </>
  );
}

// ── Main QuranPage component ──────────────────────────────────────────────────
export default function QuranPage({ ayat, qcf4, qcf4Ready, pageNumber, fontSize = 'var(--quran-font-size)', side }: Props) {
  const { isSpecial, addSpecial, removeSpecial } = useSpecialAyatStore();
  const surahMap = useRef<Map<number, Surah>>(new Map());
  const { hash } = useLocation();
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (surahMap.current.size === 0) {
    for (const s of getAllSurahs()) surahMap.current.set(s.number, s);
  }

  const ayaByKey = new Map<string, Aya>();
  for (const aya of ayat) {
    ayaByKey.set(`${aya.surah}:${aya.ayah}`, aya);
  }

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [hash, ayat]);

  // ── Interaction handlers (event delegation on the page container) ──────────
  const getVk = (target: EventTarget) =>
    (target as Element).closest('[data-vk]')?.getAttribute('data-vk') ?? null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const vk = getVk(e.target);
    if (vk) setCtxMenu({ x: e.clientX, y: e.clientY, verseKey: vk });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const vk = getVk(e.target);
    if (!vk) return;
    const touch = e.touches[0];
    touchTimer.current = setTimeout(() => {
      setCtxMenu({ x: touch.clientX, y: touch.clientY, verseKey: vk });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

  // Surahs whose first aya appears on this page
  const surahStarts = new Set<number>();
  for (const aya of ayat) {
    if (aya.ayah === 1) surahStarts.add(aya.surah);
  }

  // Map surahNum → first QCF4 line index containing that surah's content
  const surahFirstLineIdx = new Map<number, number>();
  if (qcf4) {
    for (let li = 0; li < qcf4.lines.length; li++) {
      for (const word of qcf4.lines[li].w) {
        if (!word.v) continue;
        const s = parseInt(word.v.split(':')[0], 10);
        if (surahStarts.has(s) && !surahFirstLineIdx.has(s)) {
          surahFirstLineIdx.set(s, li);
        }
      }
    }
  }

  const insertedHeaders = new Set<number>();
  const assignedIds = new Set<string>();
  const content: ReactNode[] = [];

  if (qcf4) {
    for (let li = 0; li < qcf4.lines.length; li++) {
      for (const [surahNum, firstLi] of surahFirstLineIdx) {
        if (li === firstLi && !insertedHeaders.has(surahNum)) {
          const surah = surahMap.current.get(surahNum);
          if (surah) {
            content.push(<SurahHeader key={`sh-${surahNum}`} surah={surah} />);
            insertedHeaders.add(surahNum);
          }
        }
      }

      content.push(
        <QCF4MushafLine
          key={`line-${li}`}
          line={qcf4.lines[li]}
          pageFont={qcf4.font}
          isSpecialFn={isSpecial}
          assignedIds={assignedIds}
          fontSize={fontSize}
          activeVk={ctxMenu?.verseKey ?? null}
        />
      );
    }
  }

  return (
    <>
      <div
        className="bg-white rounded-xl border-2 border-double border-amber-800/30 px-3 py-4 shadow-sm select-none"
        style={side === 'right' ? { borderRight: '3px solid #3b82f6' } : side === 'left' ? { borderLeft: '3px solid #ef4444' } : undefined}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <PageHeader ayat={ayat} surahMap={surahMap.current} />

        <div className={`mt-2 transition-opacity duration-300 ${qcf4Ready ? 'opacity-100' : 'opacity-30'}`}>
          {content.length > 0 ? content : (
            <div className="space-y-2 py-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="h-8 bg-amber-50 rounded animate-pulse" />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <span
            className="inline-block px-4 py-0.5 text-sm text-amber-800 border border-amber-800/30 rounded-sm"
            style={{ fontFamily: 'Amiri Quran, serif' }}
          >
            {toEasternNumeral(pageNumber)}
          </span>
        </div>
      </div>

      {ctxMenu && (
        <AyaContextMenu
          menu={ctxMenu}
          isSpecial={isSpecial(ctxMenu.verseKey)}
          onAdd={() => {
            const aya = ayaByKey.get(ctxMenu.verseKey);
            if (aya) addSpecial(aya);
            setCtxMenu(null);
          }}
          onRemove={() => {
            removeSpecial(ctxMenu.verseKey);
            setCtxMenu(null);
          }}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}
