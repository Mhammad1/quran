import { useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuranData } from '../hooks/useQuranData';
import { usePageData } from '../hooks/usePageData';
import { useSpecialAyatStore } from '../store/specialAyatStore';
import QuranPage from '../components/reader/QuranPage';
import PageNavigation from '../components/reader/PageNavigation';

const TOTAL_PAGES = 604;

export default function ReaderPage() {
  const { pageNum } = useParams<{ pageNum: string }>();
  const navigate = useNavigate();
  const { ready } = useQuranData();
  const setLastPage = useSpecialAyatStore((s) => s.setLastPage);

  const parsed = Math.max(1, Math.min(TOTAL_PAGES, parseInt(pageNum ?? '1', 10) || 1));
  const rightPage = parsed % 2 === 1 ? parsed : parsed - 1;
  const leftPage = Math.min(rightPage + 1, TOTAL_PAGES);

  const { ayat: rightAyat, qcf4: rightQcf4, qcf4Ready: rightReady } = usePageData(rightPage, ready);
  const { ayat: leftAyat, qcf4: leftQcf4, qcf4Ready: leftReady } = usePageData(leftPage, ready);

  useEffect(() => {
    document.title = `صفحة ${rightPage}-${leftPage} — القرآن`;
    setLastPage(rightPage);
  }, [rightPage, leftPage, setLastPage]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const step = window.innerWidth < 768 ? 1 : 2;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        if (parsed + step <= TOTAL_PAGES) navigate(`/page/${parsed + step}`);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        if (parsed - step >= 1) navigate(`/page/${parsed - step}`);
      }
    },
    [parsed, navigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Swipe navigation (mobile only)
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const dx = swipeStart.current.x - e.changedTouches[0].clientX;
    const dy = Math.abs(swipeStart.current.y - e.changedTouches[0].clientY);
    swipeStart.current = null;
    // Only horizontal swipes wider than 50px and not mostly vertical
    if (Math.abs(dx) < 50 || dy > Math.abs(dx) * 0.8) return;
    if (dx > 0 && parsed + 1 <= TOTAL_PAGES) navigate(`/page/${parsed + 1}`);
    else if (dx < 0 && parsed - 1 >= 1) navigate(`/page/${parsed - 1}`);
  }, [parsed, navigate]);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-500 text-sm">جارٍ التحميل…</p>
      </div>
    );
  }

  if (rightAyat.length === 0) {
    return <div className="text-center py-20 text-stone-400">الصفحة غير موجودة.</div>;
  }

  return (
    <div
      className="max-w-[420px] md:max-w-[780px] mx-auto px-2 pb-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <PageNavigation currentPage={rightPage} navPage={parsed} step={2} endPage={leftPage} />

      {/* Spread layout:
          Mobile  → single right (odd) page, full width, fills screen
          Desktop → even (left) | spine | odd (right) */}
      <div className="flex gap-0 items-start">

        {/* Left page — even: always on desktop, mobile only when URL is even */}
        <div className={`${parsed % 2 === 0 ? 'w-full' : 'hidden'} md:block md:flex-1 min-w-0`}>
          <QuranPage
            ayat={leftAyat}
            qcf4={leftQcf4}
            qcf4Ready={leftReady}
            pageNumber={leftPage}
            side="left"
          />
        </div>

        {/* Spine — hidden on mobile */}
        <div className="hidden md:flex w-3 self-stretch flex-shrink-0 items-stretch">
          <div className="mx-auto w-px bg-amber-800/25" />
        </div>

        {/* Right page — odd: always on desktop, mobile only when URL is odd */}
        <div className={`${parsed % 2 === 1 ? 'w-full' : 'hidden'} md:block md:flex-1 min-w-0`}>
          <QuranPage
            ayat={rightAyat}
            qcf4={rightQcf4}
            qcf4Ready={rightReady}
            pageNumber={rightPage}
            side="right"
          />
        </div>
      </div>

      <PageNavigation currentPage={rightPage} navPage={parsed} step={2} endPage={leftPage} />
    </div>
  );
}
