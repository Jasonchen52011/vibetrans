import { detectLanguage } from '@/lib/language-detection';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationMode = 'toEsperanto' | 'toEnglish';
type TranslationDirection = 'en-to-eo' | 'eo-to-en';

const TO_ESPERANTO_PROMPT = `You are "Esperanto Translator", a professional translation tool for translating English into Esperanto.

TASK:
- Translate the INPUT text from English into grammatically correct Esperanto
- Follow proper Esperanto grammar rules (accusative case with -n, verb tenses, etc.)
- Use appropriate vocabulary and maintain natural phrasing
- Preserve the structure and formatting of the original text
- Apply Esperanto's systematic and logical grammar consistently

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Use proper Esperanto characters (ĉ, ĝ, ĥ, ĵ, ŝ, ŭ)
- Make translations feel natural and contextual

OUTPUT:
- Return ONLY the translated text in Esperanto, nothing else`;

const TO_ENGLISH_PROMPT = `You are "Esperanto Translator", a professional translation tool for translating Esperanto into English.

TASK:
- Translate the INPUT text from Esperanto into clear, natural English
- Understand Esperanto grammar (accusative case, verb tenses, etc.)
- Preserve the structure and formatting of the original text
- Make the English translation sound natural and fluent

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Translate Esperanto to natural English equivalents

OUTPUT:
- Return ONLY the translated text in English, nothing else`;

const DIRECTION_TO_MODE: Record<TranslationDirection, TranslationMode> = {
  'en-to-eo': 'toEsperanto',
  'eo-to-en': 'toEnglish',
};

const MODE_TO_DIRECTION: Record<TranslationMode, TranslationDirection> = {
  toEsperanto: 'en-to-eo',
  toEnglish: 'eo-to-en',
};

async function translateWithAI(
  text: string,
  mode: TranslationMode
): Promise<string> {
  try {
    const prompt =
      mode === 'toEsperanto' ? TO_ESPERANTO_PROMPT : TO_ENGLISH_PROMPT;

    const { text: translatedText } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return translatedText.trim();
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

function inferDirectionFromDetection(
  detectedLanguage: string,
  fallback: TranslationDirection
): TranslationDirection {
  if (detectedLanguage === 'english') {
    return 'en-to-eo';
  }
  if (detectedLanguage === 'esperanto') {
    return 'eo-to-en';
  }
  return fallback;
}

function normaliseDirection(
  direction: unknown,
  fallback: TranslationDirection
): TranslationDirection {
  if (direction === 'en-to-eo' || direction === 'eo-to-en') {
    return direction;
  }
  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      direction?: TranslationDirection;
      detectOnly?: boolean;
      inputType?: 'text' | 'audio' | 'image';
    };
    const { text, direction, detectOnly = false } = body;

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

    if (trimmed.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    const detection = detectLanguage(trimmed, 'esperanto');
    const { detectedLanguage, confidence } = detection;
    const finalDirection = direction
      ? normaliseDirection(direction, 'en-to-eo')
      : inferDirectionFromDetection(detectedLanguage, 'en-to-eo');

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: finalDirection,
        confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'english'
              ? 'English'
              : detectedLanguage === 'esperanto'
                ? 'Esperanto'
                : 'Unknown',
          direction:
            finalDirection === 'en-to-eo'
              ? 'English → Esperanto'
              : 'Esperanto → English',
          confidence: Math.round((confidence ?? 0) * 100),
        },
      });
    }

    const mode = DIRECTION_TO_MODE[finalDirection];
    const translatedText = await translateWithAI(trimmed, mode);

    return NextResponse.json({
      translated: translatedText,
      original: trimmed,
      direction: finalDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: !direction,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'english'
            ? 'English'
            : detectedLanguage === 'esperanto'
              ? 'Esperanto'
              : 'Unknown',
        direction:
          finalDirection === 'en-to-eo'
            ? 'English → Esperanto'
            : 'Esperanto → English',
        confidence: Math.round((confidence ?? 0) * 100),
      },
    });
  } catch (error: any) {
    console.error('Error processing Esperanto translation:', error);
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
      message: 'Esperanto Translator API - Use POST method to translate text',
      version: '1.0',
      supported_modes: ['toEsperanto', 'toEnglish'],
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
