import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslatorDirection = 'en-og' | 'og-en';

const OGHAM_TO_ENGLISH: Record<string, string> = {
  ' ': 'B',
  ᚁ: 'L',
  ᚂ: 'F',
  ᚃ: 'S',
  ᚄ: 'N',
  ᚅ: 'H',
  ᚆ: 'D',
  ᚇ: 'T',
  ᚈ: 'C',
  ᚉ: 'Q',
  ᚊ: 'M',
  ᚋ: 'G',
  ᚌ: 'NG',
  ᚍ: 'Z',
  ᚎ: 'R',
  ᚏ: 'A',
  ᚐ: 'O',
  ᚑ: 'U',
  ᚒ: 'E',
  ᚓ: 'I',
  ᚔ: 'EA',
  ᚕ: 'OI',
  ᚖ: 'UI',
  ᚗ: 'IO',
  ᚘ: 'AE',
  ᚙ: 'P',
  ᚚ: 'X',
};

const ENGLISH_TO_OGHAM: Record<string, string> = Object.entries(
  OGHAM_TO_ENGLISH
).reduce(
  (acc, [ogham, english]) => {
    acc[english] = ogham;
    return acc;
  },
  {} as Record<string, string>
);

function translateOgham(text: string, direction: TranslatorDirection): string {
  if (!text) return '';

  if (direction === 'en-og') {
    const upper = text.toUpperCase();
    const result: string[] = [];
    for (let i = 0; i < upper.length; i++) {
      const current = upper[i];
      const next = upper[i + 1];
      const digraph = current + (next || '');
      if (ENGLISH_TO_OGHAM[digraph]) {
        result.push(ENGLISH_TO_OGHAM[digraph]);
        i += 1;
        continue;
      }
      result.push(ENGLISH_TO_OGHAM[current] || current);
    }
    return result.join('');
  }

  return text
    .split('')
    .map((char) => OGHAM_TO_ENGLISH[char] || char)
    .join('');
}

function determineDirection(
  detectedLanguage: string,
  provided?: TranslatorDirection
): TranslatorDirection {
  if (provided) return provided;
  if (detectedLanguage === 'ogham') return 'og-en';
  if (detectedLanguage === 'english') return 'en-og';
  return 'en-og';
}

function buildLanguageInfo(
  detectedLanguage: string,
  direction: TranslatorDirection,
  confidence: number
) {
  const friendlyLanguage =
    detectedLanguage === 'ogham'
      ? 'Ogham'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction: direction === 'en-og' ? 'English → Ogham' : 'Ogham → English',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'ogham'
        ? 'Auto-detected Ogham runes, converted to English'
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, converted to Ogham'
          : 'Translation completed',
  };
}

function fallbackTranslation(text: string, direction: TranslatorDirection) {
  const note =
    direction === 'en-og'
      ? ' (unable to render into Ogham, showing original text)'
      : ' (unable to interpret runes, showing original text)';
  return `${text}${note}`;
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Ogham Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      direction?: TranslatorDirection;
      detectOnly?: boolean;
    };

    const { text, direction, detectOnly = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const detection = detectLanguage(text, 'ogham');
    const detectedLanguage = detection.detectedLanguage;
    const confidence = detection.confidence;
    const detectedDirection = determineDirection(detectedLanguage, direction);
    const autoDetected = !direction;

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection,
        confidence,
        autoDetected,
        languageInfo: buildLanguageInfo(
          detectedLanguage,
          detectedDirection,
          confidence
        ),
      });
    }

    let translated = translateOgham(text, detectedDirection);

    if (translated.trim().toLowerCase() === text.trim().toLowerCase()) {
      translated = fallbackTranslation(text, detectedDirection);
    }

    return NextResponse.json({
      translated: translated.trim(),
      original: text,
      detectedInputLanguage: detectedLanguage,
      detectedDirection,
      confidence,
      autoDetected,
      languageInfo: buildLanguageInfo(
        detectedLanguage,
        detectedDirection,
        confidence
      ),
    });
  } catch (error) {
    console.error('Ogham translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
