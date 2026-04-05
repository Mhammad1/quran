import type { Surah } from '../../types/quran';

interface Props {
  surah: Surah;
}

// The Basmala — shown below the surah name band for all surahs except At-Tawbah (9).
// For Al-Fatiha (1) the Basmala IS aya 1; we still show it centred here and the
// renderer skips the aya-1 line so it is never displayed twice.
const NO_BASMALA = new Set([9]);

// Decorative rosette used as ornament flanking the surah name
const ROSETTE = '۞';

export default function SurahHeader({ surah }: Props) {
  return (
    <div className="my-4 select-none" dir="rtl">
      {/* ── Surah name band ── */}
      <div className="relative flex items-center justify-center py-2 my-2">
        {/* Full-width horizontal rules */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-double border-amber-800/50" />
        {/* Surah name pill */}
        <div className="relative z-10 flex items-center gap-2 bg-amber-50 border-2 border-double border-amber-800/50 px-6 py-1 rounded-sm">
          <span className="text-amber-700 text-sm">{ROSETTE}</span>
          <span
            lang="ar"
            className="font-quran text-xl text-amber-900 tracking-wide"
          >
            سُورَةُ {surah.nameArabic.replace(/^سُورَةُ\s*/, '')}
          </span>
          <span className="text-amber-700 text-sm">{ROSETTE}</span>
        </div>
      </div>


      {/* ── Basmala ── */}
      {!NO_BASMALA.has(surah.number) && (
        <div
          lang="ar"
          className="font-quran text-2xl text-center text-stone-800 leading-quran my-2"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </div>
      )}
    </div>
  );
}
