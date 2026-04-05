import type { Aya, Surah } from '../../types/quran';

interface Props {
  ayat: Aya[];
  surahMap: Map<number, Surah>;
}

// Arabic ordinal names for juz (1–30)
const JUZ_NAMES: Record<number, string> = {
  1: 'الجُزءُ الأَوَّل', 2: 'الجُزءُ الثَّانِي', 3: 'الجُزءُ الثَّالِث',
  4: 'الجُزءُ الرَّابِع', 5: 'الجُزءُ الخَامِس', 6: 'الجُزءُ السَّادِس',
  7: 'الجُزءُ السَّابِع', 8: 'الجُزءُ الثَّامِن', 9: 'الجُزءُ التَّاسِع',
  10: 'الجُزءُ العَاشِر', 11: 'الجُزءُ الحَادِي عَشَر', 12: 'الجُزءُ الثَّانِي عَشَر',
  13: 'الجُزءُ الثَّالِث عَشَر', 14: 'الجُزءُ الرَّابِع عَشَر', 15: 'الجُزءُ الخَامِس عَشَر',
  16: 'الجُزءُ السَّادِس عَشَر', 17: 'الجُزءُ السَّابِع عَشَر', 18: 'الجُزءُ الثَّامِن عَشَر',
  19: 'الجُزءُ التَّاسِع عَشَر', 20: 'الجُزءُ العِشْرُون', 21: 'الجُزءُ الحَادِي والعِشْرُون',
  22: 'الجُزءُ الثَّانِي والعِشْرُون', 23: 'الجُزءُ الثَّالِث والعِشْرُون',
  24: 'الجُزءُ الرَّابِع والعِشْرُون', 25: 'الجُزءُ الخَامِس والعِشْرُون',
  26: 'الجُزءُ السَّادِس والعِشْرُون', 27: 'الجُزءُ السَّابِع والعِشْرُون',
  28: 'الجُزءُ الثَّامِن والعِشْرُون', 29: 'الجُزءُ التَّاسِع والعِشْرُون',
  30: 'الجُزءُ الثَّلَاثُون',
};

export default function PageHeader({ ayat, surahMap }: Props) {
  if (ayat.length === 0) return null;

  // Juz from the first aya on this page
  const juz = ayat[0].juz;
  const juzName = JUZ_NAMES[juz] ?? `الجُزء ${juz}`;

  // Surah: prefer the last surah on the page (matches mushaf convention)
  const lastSurahNum = ayat[ayat.length - 1].surah;
  const surah = surahMap.get(lastSurahNum);
  const surahName = surah
    ? surah.nameArabic.replace(/^سُورَةُ\s*/, '')
    : `سورة ${lastSurahNum}`;

  return (
    <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b-2 border-double border-amber-800/40 select-none">
      {/* Juz name — left side */}
      <span dir="rtl" lang="ar" className="font-quran text-sm text-amber-800">
        {juzName}
      </span>
      {/* Surah name — right side */}
      <span dir="rtl" lang="ar" className="font-quran text-sm text-amber-800">
        سُورَةُ {surahName}
      </span>
    </div>
  );
}
