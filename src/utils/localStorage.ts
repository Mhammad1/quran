import type { SpecialAya } from '../types/quran';

const KEY = 'quran_special_ayat';
const CURRENT_VERSION = 1;

interface StorageSchema {
  version: number;
  items: Record<string, SpecialAya>;
}

export function loadSpecialAyat(): Record<string, SpecialAya> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StorageSchema>;
    const migrated = migrate(parsed);
    return migrated.items;
  } catch {
    return {};
  }
}

export function saveSpecialAyat(items: Record<string, SpecialAya>): void {
  const schema: StorageSchema = { version: CURRENT_VERSION, items };
  localStorage.setItem(KEY, JSON.stringify(schema));
}

function migrate(data: Partial<StorageSchema>): StorageSchema {
  // v0 → v1: wrap bare items array into schema
  if (!data.version) {
    return { version: CURRENT_VERSION, items: {} };
  }
  return { version: CURRENT_VERSION, items: data.items ?? {} };
}
