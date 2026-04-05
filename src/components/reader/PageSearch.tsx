import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchSurahs, getSurahStartPage } from '../../utils/quranIndex';
import type { Surah } from '../../types/quran';

export default function PageSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Surah[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    // If it's a pure number, treat it as a page number
    const asNum = parseInt(value, 10);
    if (/^\d+$/.test(value.trim())) {
      setResults([]);
      setOpen(false);
      return;
    }

    const found = searchSurahs(value).slice(0, 8);
    setResults(found);
    setOpen(found.length > 0);
    void asNum;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const asNum = parseInt(trimmed, 10);
    if (/^\d+$/.test(trimmed) && asNum >= 1 && asNum <= 604) {
      navigate(`/page/${asNum}`);
      setQuery('');
      setOpen(false);
      return;
    }

    // Try surah match
    const found = searchSurahs(trimmed);
    if (found.length > 0) {
      navigate(`/page/${getSurahStartPage(found[0].number)}`);
      setQuery('');
      setOpen(false);
    }
  };

  const selectSurah = (surah: Surah) => {
    navigate(`/page/${getSurahStartPage(surah.number)}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="اسم السورة أو رقم الصفحة"
            className="pl-9 pr-4 py-1.5 text-sm border border-stone-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          />
        </div>
      </form>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((s) => (
            <button
              key={s.number}
              onClick={() => selectSurah(s)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-50 text-left transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-stone-800" dir="rtl">
                  {s.nameArabic}
                </span>
              </div>
              <span dir="rtl" lang="ar" className="font-quran text-lg text-stone-700">
                {s.nameArabic}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
