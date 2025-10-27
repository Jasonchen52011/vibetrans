/**
 * Al Bhed language translation utilities
 */

// Al Bhed alphabet mapping
const alBhedAlphabet: { [key: string]: string } = {
  A: 'Y',
  B: 'P',
  C: 'L',
  D: 'T',
  E: 'A',
  F: 'V',
  G: 'K',
  H: 'R',
  I: 'E',
  J: 'Z',
  K: 'G',
  L: 'D',
  M: 'Q',
  N: 'O',
  O: 'S',
  P: 'I',
  Q: 'U',
  R: 'W',
  S: 'F',
  T: 'H',
  U: 'C',
  V: 'M',
  W: 'X',
  X: 'B',
  Y: 'N',
  Z: 'J',
  a: 'y',
  b: 'p',
  c: 'l',
  d: 't',
  e: 'a',
  f: 'v',
  g: 'k',
  h: 'r',
  i: 'e',
  j: 'z',
  k: 'g',
  l: 'd',
  m: 'q',
  n: 'o',
  o: 's',
  p: 'i',
  q: 'u',
  r: 'w',
  s: 'f',
  t: 'h',
  u: 'c',
  v: 'm',
  w: 'x',
  x: 'b',
  y: 'n',
  z: 'j',
};

// Reverse mapping for decoding
const alBhedReverse: { [key: string]: string } = {};
Object.entries(alBhedAlphabet).forEach(([key, value]) => {
  alBhedReverse[value] = key;
});

/**
 * Encode English text to Al Bhed
 */
export function encodeToAlBhed(text: string): string {
  return text
    .split('')
    .map((char) => alBhedAlphabet[char] || char)
    .join('');
}

/**
 * Decode Al Bhed text to English
 */
export function decodeFromAlBhed(text: string): string {
  return text
    .split('')
    .map((char) => alBhedReverse[char] || char)
    .join('');
}

/**
 * Auto-detect and translate Al Bhed text
 */
export function translateAlBhed(text: string): {
  text: string;
  isAlBhed: boolean;
} {
  // Simple heuristic: if most letters are in Al Bhed range, assume it's Al Bhed
  const alBhedChars = text
    .replace(/[^a-zA-Z]/g, '')
    .split('')
    .filter((char) => Object.values(alBhedReverse).includes(char)).length;

  const totalChars = text.replace(/[^a-zA-Z]/g, '').length;
  const isAlBhed = totalChars > 0 && alBhedChars / totalChars > 0.5;

  const translatedText = isAlBhed
    ? decodeFromAlBhed(text)
    : encodeToAlBhed(text);

  return { text: translatedText, isAlBhed };
}

// Alias for compatibility
export const smartAutoTranslate = translateAlBhed;
