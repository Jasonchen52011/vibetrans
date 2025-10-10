import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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

async function translateWithAI(
  text: string,
  mode: 'toEsperanto' | 'toEnglish'
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
      temperature: 0.3, // Lower temperature for more accurate translations
    });

    return translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toEsperanto' | 'toEnglish';
    };
    const { text, mode = 'toEsperanto' } = body;

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

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Perform translation using AI
    const translatedText = await translateWithAI(text, mode);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
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
