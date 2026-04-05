import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toEasternNumeral } from '../../utils/arabic';

interface Props {
  currentPage: number;
  navPage?: number;   // page to navigate from (defaults to currentPage)
  step?: number;
  endPage?: number;
  totalPages?: number;
}

const TOTAL_PAGES = 604;

export default function PageNavigation({ currentPage, navPage, step = 1, endPage, totalPages = TOTAL_PAGES }: Props) {
  const navigate = useNavigate();
  const nav = navPage ?? currentPage;

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveStep = isMobile ? 1 : step;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    navigate(`/page/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const labelStart = endPage && endPage < currentPage ? endPage : currentPage;
  const labelEnd = endPage && endPage !== currentPage ? (endPage > currentPage ? endPage : currentPage) : null;
  const pageLabel = isMobile || !labelEnd
    ? toEasternNumeral(nav)
    : `${toEasternNumeral(labelStart)}-${toEasternNumeral(labelEnd)}`;

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {/* NEXT on LEFT — Arabic/Quran direction: advancing = going left */}
      <button
        onClick={() => goTo(nav + effectiveStep)}
        disabled={nav + effectiveStep - 1 >= totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
        التالي
      </button>

      <span className="text-sm text-stone-500 min-w-[120px] text-center" dir="rtl">
        صفحة{' '}
        <span className="font-semibold text-stone-800">{pageLabel}</span>
        {' '}من {toEasternNumeral(totalPages)}
      </span>

      {/* PREVIOUS on RIGHT — going back = going right */}
      <button
        onClick={() => goTo(nav - effectiveStep)}
        disabled={nav <= 1}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        السابق
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
