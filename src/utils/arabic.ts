/**
 * Strip the Basmala prefix from aya 1 text for surahs 2–113.
 * The alquran.cloud API embeds the Basmala as the first 4 words of aya 1
 * for every surah that has one. We display it separately via SurahHeader.
 * Al-Fatiha (1) aya 1 IS the Basmala entirely — don't strip.
 * At-Tawba (9) has no Basmala — nothing to strip.
 */
export function stripBasmala(text: string, surah: number, ayah: number): string {
  if (ayah !== 1 || surah === 1 || surah === 9) return text;
  // Basmala is always exactly 4 words: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  const words = text.split(' ');
  if (words.length > 4) {
    return words.slice(4).join(' ').trim();
  }
  return text;
}

/** Convert Western Arabic numerals to Eastern Arabic (٠١٢٣٤٥٦٧٨٩) */
export function toEasternNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) =>
    String.fromCharCode(0x0660 + parseInt(d))
  );
}

/** Wrap a number in Quran ornamental brackets ﴿١﴾ */
export function ayaOrnament(n: number): string {
  return `﴿${toEasternNumeral(n)}﴾`;
}
