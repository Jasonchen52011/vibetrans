import { NextResponse } from 'next/server';

interface RecognizeTranslateRequest {
  imageData?: string; // base64 encoded image (optional for now)
  text?: string; // direct text input (fallback)
}

interface RecognizeTranslateResponse {
  originalText?: string;
  translatedText?: string;
  detectedLanguage?: 'english' | 'japanese' | 'unknown';
  error?: string;
}

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { imageData, text }: RecognizeTranslateRequest = await req.json();

    // Handle image upload (placeholder for future implementation)
    if (imageData) {
      // TODO: Implement image recognition when vision models are available
      return NextResponse.json(
        {
          originalText: '[Image Text Recognition Coming Soon]',
          translatedText: '[画像認識機能近日公開]',
          detectedLanguage: 'unknown',
          error:
            'Image recognition is temporarily unavailable. Please type the text manually or try again later.',
        } as RecognizeTranslateResponse,
        { status: 200 }
      );
    }

    // Handle text input
    if (text) {
      const detectedLanguage = detectLanguage(text);

      if (detectedLanguage === 'english') {
        // English → Japanese
        try {
          const response = await fetch(
            'https://manga-translator-api.vercel.app/translate',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: text,
                from_lang: 'en',
                to_lang: 'ja',
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Translation failed');
          }

          return NextResponse.json({
            originalText: text,
            translatedText: data.translated_text,
            detectedLanguage: 'english',
          } as RecognizeTranslateResponse);
        } catch (translationError) {
          console.error('Translation error:', translationError);
          return NextResponse.json({
            originalText: text,
            translatedText: `[翻訳一時的に利用できません] ${text}`,
            detectedLanguage: 'english',
            error: 'Translation temporarily unavailable',
          } as RecognizeTranslateResponse);
        }
      } else if (detectedLanguage === 'japanese') {
        // Japanese → English
        try {
          const response = await fetch(
            'https://manga-translator-api.vercel.app/translate',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: text,
                from_lang: 'ja',
                to_lang: 'en',
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Translation failed');
          }

          return NextResponse.json({
            originalText: text,
            translatedText: data.translated_text,
            detectedLanguage: 'japanese',
          } as RecognizeTranslateResponse);
        } catch (translationError) {
          console.error('Translation error:', translationError);
          return NextResponse.json({
            originalText: text,
            translatedText: `[Translation temporarily unavailable] ${text}`,
            detectedLanguage: 'japanese',
            error: 'Translation temporarily unavailable',
          } as RecognizeTranslateResponse);
        }
      } else {
        // Unknown language - return as is
        return NextResponse.json({
          originalText: text,
          translatedText: text,
          detectedLanguage: 'unknown',
          error:
            'Language not detected. Please enter English or Japanese text.',
        } as RecognizeTranslateResponse);
      }
    }

    return NextResponse.json(
      { error: 'No text or image data provided' } as RecognizeTranslateResponse,
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in recognize-translate API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' } as RecognizeTranslateResponse,
      { status: 500 }
    );
  }
}

// Language detection function
function detectLanguage(text: string): 'english' | 'japanese' | 'unknown' {
  // Japanese character patterns (Hiragana, Katakana, Kanji)
  const JAPANESE_PATTERNS = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

  if (JAPANESE_PATTERNS.test(text)) {
    return 'japanese';
  }

  // Basic English detection (latin characters)
  if (/[a-zA-Z]/.test(text) && text.length > 2) {
    return 'english';
  }

  return 'unknown';
}
