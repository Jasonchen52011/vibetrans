/**
 * Al Bhed Translation Utilities
 *
 * Al Bhed is a fictional language from Final Fantasy X that uses
 * a simple letter substitution cipher. Each English letter maps
 * to a specific Al Bhed letter consistently.
 *
 * Official Al Bhed Cipher:
 * A↔Y, B↔P, C↔L, D↔T, E↔A, F↔V, G↔R, H↔O, I↔E, J↔B,
 * K↔G, L↔M, M↔N, N↔H, O↔U, P↔C, Q↔D, R↔I, S↔J, T↔S,
 * U↔V, V↔K, W↔W, X↔Z, Y↔Q, Z↔X
 *
 * Numbers, spaces, and punctuation remain unchanged.
 */

// Al Bhed cipher mapping (English to Al Bhed)
const ENGLISH_TO_ALBHED: Record<string, string> = {
  a: 'y',
  b: 'p',
  c: 'l',
  d: 't',
  e: 'a',
  f: 'v',
  g: 'r',
  h: 'o',
  i: 'e',
  j: 'b',
  k: 'g',
  l: 'm',
  m: 'n',
  n: 'h',
  o: 'u',
  p: 'c',
  q: 'd',
  r: 'i',
  s: 'j',
  t: 's',
  u: 'v',
  v: 'k',
  w: 'w',
  x: 'z',
  y: 'q',
  z: 'x',
};

// Al Bhed to English (reverse mapping)
const ALBHED_TO_ENGLISH: Record<string, string> = {};
for (const [eng, alb] of Object.entries(ENGLISH_TO_ALBHED)) {
  ALBHED_TO_ENGLISH[alb] = eng;
}

/**
 * Translates English text to Al Bhed
 * @param text - English text to translate
 * @returns Al Bhed translation
 */
export function englishToAlBhed(text: string): string {
  return translateText(text, ENGLISH_TO_ALBHED);
}

/**
 * Translates Al Bhed text to English
 * @param text - Al Bhed text to translate
 * @returns English translation
 */
export function alBhedToEnglish(text: string): string {
  return translateText(text, ALBHED_TO_ENGLISH);
}

/**
 * Core translation function that applies cipher mapping
 * @param text - Text to translate
 * @param mapping - Cipher mapping dictionary
 * @returns Translated text
 */
function translateText(text: string, mapping: Record<string, string>): string {
  return text
    .split('')
    .map((char) => {
      const lowerChar = char.toLowerCase();
      const isUpperCase = char !== lowerChar;

      // If character exists in mapping, translate it
      if (lowerChar in mapping) {
        const translated = mapping[lowerChar];
        return isUpperCase ? translated.toUpperCase() : translated;
      }

      // Otherwise, keep original character (numbers, punctuation, spaces)
      return char;
    })
    .join('');
}

/**
 * Detects if text is likely English or Al Bhed based on character frequency
 * @param text - Text to analyze
 * @returns 'english' | 'albhed' | 'unknown'
 */
export function detectLanguage(text: string): 'english' | 'albhed' | 'unknown' {
  const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');

  if (cleanText.length < 3) {
    return 'unknown';
  }

  // Common English letters vs Al Bhed letters
  const commonEnglish = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h'];
  const commonAlBhed = ['a', 's', 'y', 'u', 'e', 'h', 'j', 'o'];

  let englishScore = 0;
  let albhedScore = 0;

  for (const char of cleanText) {
    if (commonEnglish.includes(char)) englishScore++;
    if (commonAlBhed.includes(char)) albhedScore++;
  }

  // If scores are similar, return unknown
  if (Math.abs(englishScore - albhedScore) < cleanText.length * 0.1) {
    return 'unknown';
  }

  return englishScore > albhedScore ? 'english' : 'albhed';
}

/**
 * Auto-translates text based on detected language
 * @param text - Text to translate
 * @returns Translated text
 */
export function autoTranslate(text: string): string {
  const language = detectLanguage(text);

  if (language === 'albhed') {
    return alBhedToEnglish(text);
  }

  // Default to English to Al Bhed translation
  return englishToAlBhed(text);
}
