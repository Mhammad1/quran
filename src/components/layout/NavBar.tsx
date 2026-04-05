import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Star } from 'lucide-react';
import { useSpecialAyatStore } from '../../store/specialAyatStore';
import PageSearch from '../reader/PageSearch';
import { useQuranData } from '../../hooks/useQuranData';

export default function NavBar() {
  const { count, lastPage } = useSpecialAyatStore();
  const { ready } = useQuranData();
  const location = useLocation();
  const specialCount = count();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to={`/page/${lastPage}`}
          className="flex items-center gap-2 text-stone-800 hover:text-amber-700 transition-colors flex-shrink-0"
        >
          <BookOpen size={20} className="text-amber-500" />
          <span className="font-bold text-base hidden sm:block">القرآن</span>
        </Link>

        {/* Search */}
        {ready && <PageSearch />}

        {/* Special ayat link */}
        <Link
          to="/special"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            location.pathname === '/special'
              ? 'bg-amber-100 text-amber-800'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Star size={15} className={specialCount > 0 ? 'text-amber-500' : ''} fill={specialCount > 0 ? 'currentColor' : 'none'} />
          <span>المحفوظ</span>
          {specialCount > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
              {specialCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
