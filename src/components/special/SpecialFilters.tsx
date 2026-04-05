import type { SortOrder, Surah } from '../../types/quran';

interface Props {
  surahs: Surah[];
  selectedSurah: number | null;
  sortOrder: SortOrder;
  onSurahChange: (surahNum: number | null) => void;
  onSortChange: (order: SortOrder) => void;
}

export default function SpecialFilters({
  surahs,
  selectedSurah,
  sortOrder,
  onSurahChange,
  onSortChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6" dir="rtl">
      {/* Surah filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-stone-600 font-medium">السورة:</label>
        <select
          value={selectedSurah ?? ''}
          onChange={(e) => onSurahChange(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          dir="rtl"
        >
          <option value="">كل السور</option>
          {surahs.map((s) => (
            <option key={s.number} value={s.number}>
              {s.nameArabic}
            </option>
          ))}
        </select>
      </div>

      {/* Sort order */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-stone-600 font-medium">الترتيب:</label>
        <div className="flex rounded-lg border border-stone-200 overflow-hidden">
          {(
            [
              { value: 'asc', label: '↑ تصاعدي' },
              { value: 'desc', label: '↓ تنازلي' },
              { value: 'random', label: '⇄ عشوائي' },
            ] as { value: SortOrder; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSortChange(value)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                sortOrder === value
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
