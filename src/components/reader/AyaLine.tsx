import { Star } from 'lucide-react';
import type { Aya } from '../../types/quran';
import { ayaOrnament, stripBasmala } from '../../utils/arabic';

interface Props {
  aya: Aya;
  isSpecial: boolean;
  onToggle: () => void;
}

export default function AyaLine({ aya, isSpecial, onToggle }: Props) {
  const id = `aya-${aya.surah}-${aya.ayah}`;

  return (
    <div
      id={id}
      className={`group flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
        isSpecial
          ? 'bg-amber-50 border-r-4 border-amber-400'
          : 'hover:bg-stone-50'
      }`}
    >
      {/* Star button (LTR side) */}
      <button
        onClick={onToggle}
        title={isSpecial ? 'Remove from special' : 'Mark as special'}
        className={`flex-shrink-0 mt-1 p-1 rounded transition-colors ${
          isSpecial
            ? 'text-amber-500 hover:text-amber-700'
            : 'text-stone-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star
          size={16}
          fill={isSpecial ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      </button>

      {/* Arabic text block */}
      <div
        dir="rtl"
        lang="ar"
        className="flex-1 font-quran text-2xl leading-quran text-stone-800 text-right"
      >
        {stripBasmala(aya.text, aya.surah, aya.ayah)}
        {/* Aya number ornament */}
        <span className="mx-2 text-lg text-amber-600 select-none">
          {ayaOrnament(aya.ayah)}
        </span>
      </div>
    </div>
  );
}
