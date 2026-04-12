import { create } from 'zustand';
import type { Aya, SpecialAya, SortOrder } from '../types/quran';
import { loadSpecialAyat, saveSpecialAyat } from '../utils/localStorage';

interface SpecialAyatState {
  items: Record<string, SpecialAya>;
  lastPage: number;
  // Filter state — persists across navigation
  filterSurah: number | null;
  filterSort: SortOrder;
  filterShuffleSeed: number;
  setFilter: (surah: number | null, sort: SortOrder) => void;
  reshuffleFilter: () => void;
  addSpecial: (aya: Aya) => void;
  removeSpecial: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  isSpecial: (id: string) => boolean;
  count: () => number;
  setLastPage: (page: number) => void;
}

export const useSpecialAyatStore = create<SpecialAyatState>((set, get) => ({
  items: loadSpecialAyat(),
  lastPage: parseInt(localStorage.getItem('quran_last_page') || '1', 10),
  filterSurah: null,
  filterSort: 'recent',
  filterShuffleSeed: 0,

  setFilter: (surah, sort) => set({ filterSurah: surah, filterSort: sort }),
  reshuffleFilter: () => set((s) => ({ filterShuffleSeed: s.filterShuffleSeed + 1 })),

  addSpecial: (aya) => {
    const id = `${aya.surah}:${aya.ayah}`;
    const newItem: SpecialAya = {
      id,
      surah: aya.surah,
      ayah: aya.ayah,
      globalAyah: aya.globalAyah,
      page: aya.page,
      note: '',
      addedAt: Date.now(),
    };
    set((state) => {
      const items = { ...state.items, [id]: newItem };
      saveSpecialAyat(items);
      return { items };
    });
  },

  removeSpecial: (id) => {
    set((state) => {
      const items = { ...state.items };
      delete items[id];
      saveSpecialAyat(items);
      return { items };
    });
  },

  updateNote: (id, note) => {
    set((state) => {
      if (!state.items[id]) return state;
      const items = {
        ...state.items,
        [id]: { ...state.items[id], note },
      };
      saveSpecialAyat(items);
      return { items };
    });
  },

  isSpecial: (id) => id in get().items,

  count: () => Object.keys(get().items).length,

  setLastPage: (page) => {
    localStorage.setItem('quran_last_page', String(page));
    set({ lastPage: page });
  },
}));
