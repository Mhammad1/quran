import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { SpecialAya, Surah } from '../../types/quran';
import { getAyaById } from '../../utils/quranIndex';
import { ayaOrnament, stripBasmala, toEasternNumeral } from '../../utils/arabic';
import { useQuranData } from '../../hooks/useQuranData';
import { usePageData } from '../../hooks/usePageData';

interface Props {
  special: SpecialAya;
  surah: Surah | undefined;
  onDelete: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

export default function SpecialAyaCard({ special, surah, onDelete, onUpdateNote }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState(!!special.note);
  const [noteValue, setNoteValue] = useState(special.note);

  const aya = getAyaById(special.surah, special.ayah);
  const { ready } = useQuranData();
  const { qcf4, qcf4Ready } = usePageData(special.page, ready);

  const verseKey = `${special.surah}:${special.ayah}`;
  const ayaWords = qcf4
    ? qcf4.lines.flatMap((l) => l.w).filter((w) => w.v === verseKey)
    : [];

  const handleNoteChange = useCallback(
    (value: string) => {
      setNoteValue(value);
      onUpdateNote(special.id, value);
    },
    [special.id, onUpdateNote]
  );

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      {/* Arabic text */}
      <div className="px-5 pt-5 pb-3">
        {qcf4Ready && ayaWords.length > 0 ? (
          <div
            dir="rtl"
            className="flex flex-wrap items-center text-stone-800 select-none"
            style={{ fontSize: '1.6rem', lineHeight: 2.2, justifyContent: 'flex-end' }}
          >
            {ayaWords.map((word, i) => (
              <span
                key={i}
                style={{
                  fontFamily: word.f ?? qcf4!.font,
                  ...(word.e ? { direction: 'ltr' as const } : {}),
                }}
              >
                {word.c}
              </span>
            ))}
          </div>
        ) : (
          <div
            dir="rtl"
            lang="ar"
            className="font-quran text-2xl md:text-3xl leading-quran text-stone-800 text-right"
          >
            {aya ? stripBasmala(aya.text, aya.surah, aya.ayah) : '...'}
            <span className="mx-2 text-xl text-amber-600 select-none">
              {ayaOrnament(special.ayah)}
            </span>
          </div>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center justify-between px-5 py-2 bg-stone-50 border-t border-stone-100" dir="rtl">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {surah && (
            <span dir="rtl" lang="ar" className="font-quran text-base text-stone-700 leading-none">
              {surah.nameArabic}
            </span>
          )}
          <span className="text-stone-400">· الآية {toEasternNumeral(special.ayah)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/page/${special.page}#aya-${special.surah}-${special.ayah}`}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors"
          >
            <ExternalLink size={13} />
            ص {toEasternNumeral(special.page)}
          </Link>
        </div>
      </div>

      {/* Note section */}
      <div className="px-5 py-3 border-t border-stone-100" dir="rtl">
        <button
          onClick={() => setNoteExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors mb-2"
        >
          {noteExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {noteValue ? 'ملاحظة' : 'إضافة ملاحظة'}
        </button>

        {noteExpanded && (
          <textarea
            value={noteValue}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="مثال: صعبة الحفظ، نهايتها تشبه آية أخرى…"
            rows={2}
            dir="rtl"
            className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 text-stone-700 placeholder-stone-300"
          />
        )}

        {!noteExpanded && noteValue && (
          <p className="text-sm text-stone-500 italic">{noteValue}</p>
        )}
      </div>

      {/* Delete row */}
      <div className="flex justify-start px-5 py-2 border-t border-stone-100 bg-stone-50" dir="rtl">
        {confirmDelete ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-500">حذف هذه الآية؟</span>
            <button
              onClick={() => onDelete(special.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors"
            >
              نعم، احذف
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 border border-stone-200 text-stone-600 rounded-lg text-xs hover:bg-stone-100 transition-colors"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
