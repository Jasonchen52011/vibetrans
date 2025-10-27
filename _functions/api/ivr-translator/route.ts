import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslatorDirection = 'ivr-to-en' | 'en-to-ivr';

type TranslationBody = {
  text?: string;
  direction?: TranslatorDirection;
  detectOnly?: boolean;
};

function detectIvrLanguage(text: string): {
  detectedLanguage: 'ivr' | 'english' | 'unknown';
  confidence: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { detectedLanguage: 'unknown', confidence: 0 };
  }

  const keypadMatch = /press|key|dial|\b[0-9]\b|\b[0-9]{1,2}\b|#|\*/i.test(
    trimmed
  );
  const englishLetters = /[a-zA-Z]/.test(trimmed);

  if (keypadMatch && !englishLetters) {
    return { detectedLanguage: 'ivr', confidence: 0.7 };
  }

  if (englishLetters) {
    return { detectedLanguage: 'english', confidence: 0.6 };
  }

  return { detectedLanguage: 'unknown', confidence: 0.2 };
}

function normaliseDirection(
  direction: TranslatorDirection | undefined,
  detection: 'ivr' | 'english' | 'unknown'
): TranslatorDirection {
  if (direction) return direction;
  if (detection === 'ivr') return 'ivr-to-en';
  if (detection === 'english') return 'en-to-ivr';
  return 'ivr-to-en';
}

function convertIvrToEnglish(text: string): string {
  const cleaned = text
    .replace(/press/i, 'Press')
    .replace(/#/g, ' pound ')
    .replace(/\*/g, ' star ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || text;
}

function convertEnglishToIvr(text: string): string {
  const normalized = text
    .replace(/press/gi, 'Press')
    .replace(/for/gi, 'for')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized || text;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslationBody;
    const { text, direction, detectOnly = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const detection = detectIvrLanguage(text);
    const finalDirection = normaliseDirection(
      direction,
      detection.detectedLanguage
    );

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detection.detectedLanguage,
        detectedDirection: finalDirection,
        confidence: detection.confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: detection.detectedLanguage !== 'unknown',
          detectedLanguage:
            detection.detectedLanguage === 'ivr'
              ? 'IVR Keypad Input'
              : detection.detectedLanguage === 'english'
                ? 'English'
                : 'Unknown',
          direction:
            finalDirection === 'ivr-to-en' ? 'IVR → English' : 'English → IVR',
          confidence: Math.round(detection.confidence * 100),
        },
      });
    }

    let translated: string;
    if (finalDirection === 'ivr-to-en') {
      translated = convertIvrToEnglish(text);
    } else {
      translated = convertEnglishToIvr(text);
    }

    if (!translated.trim()) {
      throw new Error('Translation produced empty result');
    }

    return NextResponse.json({
      translated,
      original: text,
      direction: finalDirection,
      detectedDirection: finalDirection,
      detectedInputLanguage: detection.detectedLanguage,
      confidence: detection.confidence,
      autoDetected: !direction,
      message: 'Translation successful',
    });
  } catch (error: any) {
    console.error('IVR translation error:', error);
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
