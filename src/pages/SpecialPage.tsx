import { useMemo, useEffect } from 'react';
import { useSpecialAyatStore } from '../store/specialAyatStore';
import { getAllSurahs } from '../utils/quranIndex';
import { useQuranData } from '../hooks/useQuranData';
import { toEasternNumeral } from '../utils/arabic';
import SpecialFilters from '../components/special/SpecialFilters';
import SpecialAyaCard from '../components/special/SpecialAyaCard';
import EmptyState from '../components/special/EmptyState';
import type { SortOrder, Surah } from '../types/quran';

export default function SpecialPage() {
  const { items, removeSpecial, updateNote, filterSurah, filterSort, filterShuffleSeed, setFilter, reshuffleFilter } = useSpecialAyatStore();
  const { ready } = useQuranData();
  const selectedSurah = filterSurah;
  const sortOrder = filterSort;
  const shuffleSeed = filterShuffleSeed;

  useEffect(() => {
    document.title = 'الآيات المحفوظة — القرآن';
  }, []);

  const allSurahs: Surah[] = ready ? getAllSurahs() : [];

  const surahMap = useMemo(() => {
    const m = new Map<number, Surah>();
    for (const s of allSurahs) m.set(s.number, s);
    return m;
  }, [allSurahs]);

  const sorted = useMemo(() => {
    let list = Object.values(items);

    if (selectedSurah !== null) {
      list = list.filter((a) => a.surah === selectedSurah);
    }

    if (sortOrder === 'asc') {
      list = [...list].sort((a, b) => a.globalAyah - b.globalAyah);
    } else if (sortOrder === 'desc') {
      list = [...list].sort((a, b) => b.globalAyah - a.globalAyah);
    } else if (sortOrder === 'recent') {
      list = [...list].sort((a, b) => b.addedAt - a.addedAt);
    } else {
      list = [...list].sort(() => {
        return shuffleSeed % 2 === 0 ? 0.5 - Math.random() : Math.random() - 0.5;
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedSurah, sortOrder, shuffleSeed]);

  const handleSortChange = (order: SortOrder) => {
    setFilter(selectedSurah, order);
    if (order === 'random') reshuffleFilter();
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-500 text-sm">جارٍ التحميل…</p>
      </div>
    );
  }

  const isEmpty = Object.keys(items).length === 0;
  const count = Object.keys(items).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">الآيات المحفوظة</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {toEasternNumeral(count)} آية محفوظة
          </p>
        </div>
        {sortOrder === 'random' && !isEmpty && (
          <button
            onClick={() => reshuffleFilter()}
            className="px-4 py-2 text-sm bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
          >
            ⇄ ترتيب عشوائي
          </button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <SpecialFilters
            surahs={allSurahs}
            selectedSurah={selectedSurah}
            sortOrder={sortOrder}
            onSurahChange={(s) => setFilter(s, sortOrder)}
            onSortChange={handleSortChange}
          />

          {sorted.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              لا توجد آيات محفوظة في هذه السورة.
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((special) => (
                <SpecialAyaCard
                  key={special.id}
                  special={special}
                  surah={surahMap.get(special.surah)}
                  onDelete={removeSpecial}
                  onUpdateNote={updateNote}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
