import {
  decodeFromAlBhed,
  encodeToAlBhed,
  translateAlBhed as smartTranslate,
} from '@/lib/al-bhed';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const MAX_LENGTH = 10000;

function translateText(text: string, mode: 'toAlBhed' | 'toEnglish'): string {
  return mode === 'toAlBhed' ? encodeToAlBhed(text) : decodeFromAlBhed(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toAlBhed' | 'toEnglish';
      autoDetect?: boolean;
    };

    const { text, mode = 'toAlBhed', autoDetect = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    if (trimmed.length > MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `Text is too long. Maximum ${MAX_LENGTH} characters allowed.`,
        },
        { status: 400 }
      );
    }

    if (autoDetect) {
      const result = smartTranslate(trimmed);
      return NextResponse.json({
        original: text,
        translated: result.text,
        detectedMode: result.isAlBhed ? 'toEnglish' : 'toAlBhed',
        autoDetected: true,
        success: true,
      });
    }

    const translatedText = translateText(trimmed, mode);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing Al Bhed translation:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to process translation',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Al Bhed Translator API - Use POST method to translate text',
      version: '1.1',
      supported_modes: ['toAlBhed', 'toEnglish'],
      features: ['autoDetect'],
      maxLength: MAX_LENGTH,
      description:
        'Translate between English and Al Bhed using the official substitution cipher.',
      cipher_type: 'Simple substitution cipher',
    },
    { status: 200 }
  );
}
