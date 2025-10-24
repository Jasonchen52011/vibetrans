import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Ogham to English letter mapping
const OGHAM_TO_ENGLISH: { [key: string]: string } = {
  ' ': 'B', // Beith
  ᚁ: 'L', // Luis
  ᚂ: 'F', // Fearn
  ᚃ: 'S', // Sail
  ᚄ: 'N', // Nion
  ᚅ: 'H', // Uath
  ᚆ: 'H', // Dair (corrected: mapped to H for consistency)
  ᚇ: 'D', // Tinne (corrected: mapped to D, corresponding to Dair)
  ᚈ: 'C', // Coll
  ᚉ: 'Q', // Ceirt
  ᚊ: 'M', // Muin
  ᚋ: 'G', // Gort
  ᚌ: 'NG', // Gétal
  ᚍ: 'T', // Straif (corrected: mapped to T, corresponding to Tinne)
  ᚎ: 'R', // Ruis
  ᚏ: 'A', // Ailm
  ᚐ: 'O', // Onn
  ᚑ: 'U', // Úr
  ᚒ: 'E', // Eadhadh
  ᚓ: 'I', // Iodhadh
  ᚔ: 'EA', // Éabhadh
  ᚕ: 'OI', // Ór
  ᚖ: 'UI', // Uilleand
  ᚗ: 'IO', // Ifín
  ᚘ: 'AE', // Eamhancholl
  ᚙ: 'P', // Peith
  ᚚ: 'X', // Forfeda
};

// English to Ogham letter mapping
const ENGLISH_TO_OGHAM: { [key: string]: string } = {
  B: ' ',
  L: 'ᚁ',
  F: 'ᚂ',
  S: 'ᚃ',
  N: 'ᚄ',
  H: 'ᚅ',
  D: 'ᚆ',
  T: 'ᚇ',
  C: 'ᚈ',
  Q: 'ᚉ',
  M: 'ᚊ',
  G: 'ᚋ',
  NG: 'ᚌ',
  Z: 'ᚍ',
  R: 'ᚎ',
  A: 'ᚏ',
  O: 'ᚐ',
  U: 'ᚑ',
  E: 'ᚒ',
  I: 'ᚓ',
  P: 'ᚙ',
  X: 'ᚚ',
  // Digraph mappings
  EA: 'ᚔ',
  OI: 'ᚕ',
  UI: 'ᚖ',
  IO: 'ᚗ',
  AE: 'ᚘ',
};

// Translation function: detect input type and translate accordingly
function translateOgham(
  text: string,
  direction: 'to-ogham' | 'to-english' = 'to-ogham'
): string {
  if (!text) return '';

  const cleanText = text.trim();

  if (direction === 'to-ogham') {
    // English to Ogham
    const result = [];
    let i = 0;
    const upperText = cleanText.toUpperCase();
    while (i < upperText.length) {
      const char = upperText[i];
      // First check digraph combinations
      if (
        char === 'E' ||
        char === 'A' ||
        char === 'O' ||
        char === 'U' ||
        char === 'I'
      ) {
        const nextChar = upperText[i + 1];
        const digraph = char + (nextChar || '');
        if (ENGLISH_TO_OGHAM[digraph]) {
          result.push(ENGLISH_TO_OGHAM[digraph]);
          i += 2; // Skip the next character
          continue;
        }
      }
      result.push(ENGLISH_TO_OGHAM[char] || char);
      i++;
    }
    return result.join('');
  } else {
    // Ogham to English
    return cleanText
      .split('')
      .map((char) => OGHAM_TO_ENGLISH[char] || char)
      .join('');
  }
}

// Auto-detect input type
function detectDirection(text: string): 'to-ogham' | 'to-english' {
  // If text contains Ogham characters, translate to English
  const hasOgham = /[ -ᚚ]/.test(text);
  return hasOgham ? 'to-english' : 'to-ogham';
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Ogham Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
  });
}

export async function POST(request: Request) {
  try {
    const { text, direction } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Auto-detect or use specified direction
    const translationDirection = direction || detectDirection(text);

    const translated = translateOgham(text, translationDirection);

    // Check if actual translation occurred
    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      direction: translationDirection,
      detectedDirection: !direction,
      isTranslated,
      type:
        translationDirection === 'to-ogham'
          ? 'English to Ogham'
          : 'Ogham to English',
      message: isTranslated
        ? 'Translation successful'
        : 'No translation needed - input appears to be in target format',
    });
  } catch (error) {
    console.error('Ogham translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
