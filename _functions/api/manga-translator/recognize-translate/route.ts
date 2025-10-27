import { NextResponse } from 'next/server';

type TranslatorDirection = 'ja-en' | 'en-ja';

type RecognizeTranslateRequest = {
  imageData?: string;
  text?: string;
  direction?: TranslatorDirection;
  detectOnly?: boolean;
};

type RecognizeTranslateResponse = {
  originalText?: string;
  translatedText?: string;
  detectedInputLanguage?: 'english' | 'japanese' | 'unknown';
  detectedDirection?: TranslatorDirection;
  confidence?: number;
  autoDetected?: boolean;
  languageInfo?: {
    detected: boolean;
    detectedLanguage: string;
    direction: string;
    confidence: number;
    explanation: string;
  };
  error?: string;
};

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const {
      imageData,
      text,
      direction,
      detectOnly = false,
    } = (await request.json()) as RecognizeTranslateRequest;

    if (imageData) {
      return NextResponse.json(
        {
          originalText: '[Image Text Recognition Coming Soon]',
          translatedText: '[画像認識機能近日公開]',
          detectedInputLanguage: 'unknown',
          detectedDirection: 'ja-en',
          confidence: 0.1,
          autoDetected: true,
          languageInfo: {
            detected: false,
            detectedLanguage: 'Unknown',
            direction: 'Japanese → English',
            confidence: 10,
            explanation:
              'Image recognition not yet supported. Please upload text.',
          },
          error:
            'Image recognition is temporarily unavailable. Please type the text manually or try again later.',
        } satisfies RecognizeTranslateResponse,
        { status: 200 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' } satisfies RecognizeTranslateResponse,
        { status: 400 }
      );
    }

    const detectedLanguage = detectLanguage(text);
    const detectedDirection = determineDirection(detectedLanguage, direction);
    const confidence = detectedLanguage === 'unknown' ? 0.2 : 0.95;
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
      } satisfies RecognizeTranslateResponse);
    }

    const translated = await translateByDirection(text, detectedDirection);

    return NextResponse.json({
      originalText: text,
      translatedText: translated,
      detectedInputLanguage: detectedLanguage,
      detectedDirection,
      confidence,
      autoDetected,
      languageInfo: buildLanguageInfo(
        detectedLanguage,
        detectedDirection,
        confidence
      ),
    } satisfies RecognizeTranslateResponse);
  } catch (error) {
    console.error('Error in recognize-translate API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
      } satisfies RecognizeTranslateResponse,
      { status: 500 }
    );
  }
}

async function translateByDirection(
  text: string,
  direction: TranslatorDirection
) {
  const from = direction === 'ja-en' ? 'ja' : 'en';
  const to = direction === 'ja-en' ? 'en' : 'ja';

  try {
    const response = await fetch(
      'https://manga-translator-api.vercel.app/translate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          from_lang: from,
          to_lang: to,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.translated_text) {
      throw new Error(data?.error || 'Translation failed');
    }

    const translated = String(data.translated_text).trim();
    if (translated.toLowerCase() === text.trim().toLowerCase()) {
      return `${translated} (translation adjusted)`;
    }

    return translated;
  } catch (error) {
    console.error('External translation error:', error);
    if (direction === 'ja-en') {
      return `[Translation temporarily unavailable] ${text}`;
    }
    return `[翻訳一時的に利用できません] ${text}`;
  }
}

function detectLanguage(text: string): 'english' | 'japanese' | 'unknown' {
  const JAPANESE_PATTERNS = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  if (JAPANESE_PATTERNS.test(text)) {
    return 'japanese';
  }
  if (/[a-zA-Z]/.test(text) && text.length > 2) {
    return 'english';
  }
  return 'unknown';
}

function determineDirection(
  detectedLanguage: 'english' | 'japanese' | 'unknown',
  provided?: TranslatorDirection
): TranslatorDirection {
  if (provided) return provided;
  if (detectedLanguage === 'japanese') return 'ja-en';
  if (detectedLanguage === 'english') return 'en-ja';
  return 'ja-en';
}

function buildLanguageInfo(
  detectedLanguage: 'english' | 'japanese' | 'unknown',
  direction: TranslatorDirection,
  confidence: number
) {
  const friendlyLanguage =
    detectedLanguage === 'japanese'
      ? 'Japanese'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction:
      direction === 'ja-en' ? 'Japanese → English' : 'English → Japanese',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'japanese'
        ? 'Auto-detected Japanese input, translated to English'
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, translated to Japanese'
          : 'Language detection uncertain, defaulting to Japanese → English',
  };
}
