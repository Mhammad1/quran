import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
        <Star size={32} className="text-amber-300" />
      </div>
      <h2 className="text-xl font-semibold text-stone-700">لا توجد آيات محفوظة بعد</h2>
      <p className="text-stone-400 max-w-sm">
        أثناء القراءة، اضغط على أيقونة{' '}
        <Star size={14} className="inline text-amber-400" fill="currentColor" />{' '}
        بجانب أي آية لحفظها.
      </p>
      <Link
        to="/page/1"
        className="mt-2 px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
      >
        ابدأ القراءة
      </Link>
    </div>
  );
}
