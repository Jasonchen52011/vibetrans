import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

type TranslationDirection = 'al-to-en' | 'en-to-al';

type TranslationBody = {
  text?: string;
  direction?: TranslationDirection;
  detectOnly?: boolean;
};

async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'VibeTrans/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

function normaliseDirection(
  direction: TranslationDirection | undefined,
  detected: string
): TranslationDirection {
  if (direction) return direction;
  if (detected === 'english') return 'en-to-al';
  if (detected === 'albanian') return 'al-to-en';
  return 'al-to-en';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslationBody;
    const { text, direction, detectOnly = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const detection = detectLanguage(text, 'albanian');
    const { detectedLanguage, confidence } = detection;
    const finalDirection = normaliseDirection(direction, detectedLanguage);

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: finalDirection,
        confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: detectedLanguage !== 'unknown',
          detectedLanguage:
            detectedLanguage === 'english'
              ? 'English'
              : detectedLanguage === 'albanian'
                ? 'Albanian'
                : 'Unknown',
          direction:
            finalDirection === 'al-to-en'
              ? 'Albanian → English'
              : 'English → Albanian',
          confidence: Math.round(confidence * 100),
        },
      });
    }

    const langpair = finalDirection === 'al-to-en' ? 'sq|en' : 'en|sq';
    const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;
    const data = await fetchWithRetry(apiUrl);

    return NextResponse.json({
      translated:
        data.responseData?.translatedText || 'Translation not available',
      original: text,
      direction: finalDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: !direction,
      message: 'Translation successful',
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
