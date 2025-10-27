import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Al Bhed to English mapping (from Final Fantasy X)
const AL_BHED_TO_ENGLISH: Record<string, string> = {
  Y: 'A',
  P: 'B',
  L: 'C',
  T: 'D',
  A: 'E',
  V: 'F',
  K: 'G',
  R: 'H',
  E: 'I',
  Z: 'J',
  G: 'K',
  M: 'L',
  S: 'M',
  H: 'N',
  U: 'O',
  B: 'P',
  X: 'Q',
  N: 'R',
  C: 'S',
  D: 'T',
  I: 'U',
  F: 'V',
  W: 'W',
  O: 'X',
  Q: 'Y',
  J: 'Z',
};

// English to Al Bhed mapping (reverse of the above)
const ENGLISH_TO_AL_BHED: Record<string, string> = {
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
  L: 'M',
  M: 'S',
  N: 'H',
  O: 'U',
  P: 'B',
  Q: 'X',
  R: 'N',
  S: 'C',
  T: 'D',
  U: 'I',
  V: 'F',
  W: 'W',
  X: 'O',
  Y: 'Q',
  Z: 'J',
};

/**
 * Translate text using Al Bhed cipher
 * @param text - Input text to translate
 * @param mode - Translation mode: 'toAlBhed' or 'toEnglish'
 * @returns Translated text
 */
function translateAlBhed(text: string, mode: 'toAlBhed' | 'toEnglish'): string {
  const mapping = mode === 'toAlBhed' ? ENGLISH_TO_AL_BHED : AL_BHED_TO_ENGLISH;

  return text
    .split('')
    .map((char) => {
      const upperChar = char.toUpperCase();
      if (mapping[upperChar]) {
        // Preserve case: if original was lowercase, return lowercase
        const translatedChar = mapping[upperChar];
        return char === char.toLowerCase()
          ? translatedChar.toLowerCase()
          : translatedChar;
      }
      // Keep non-alphabetic characters unchanged (spaces, punctuation, numbers)
      return char;
    })
    .join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toAlBhed' | 'toEnglish';
    };
    const { text, mode = 'toAlBhed' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 10000 characters allowed.' },
        { status: 400 }
      );
    }

    // Perform translation using Al Bhed cipher
    const translatedText = translateAlBhed(text, mode);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing Al Bhed translation:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process translation',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Al Bhed Translator API - Use POST method to translate text',
      version: '1.0',
      supported_modes: ['toAlBhed', 'toEnglish'],
      maxLength: 10000,
      description:
        'Translate between English and Al Bhed language from Final Fantasy X',
      cipher_type: 'Simple substitution cipher',
    },
    { status: 200 }
  );
}
