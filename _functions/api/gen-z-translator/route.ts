import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TO_GENZ_PROMPT = `You are "Gen Z Translator", a tool for translating standard English into authentic Gen Z slang.

TASK:
- Translate the INPUT text into Gen Z slang while keeping the meaning intact
- Use popular Gen Z terms like: no cap, bussin, fire, drip, mid, bet, sus, slaps, hella, dead, cringe, salty, flexing, tea, say less, bae, vibes, yeet, stan, ghost, periodt, etc.
- Keep the tone casual and Gen Z-authentic
- Preserve the structure and formatting of the original text
- Make it sound natural, like a real Gen Z person is speaking

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Make translations feel natural and contextual
- Use slang appropriately based on context

OUTPUT:
- Return ONLY the translated text in Gen Z slang, nothing else`;

const TO_STANDARD_PROMPT = `You are "Gen Z Translator", a tool for translating Gen Z slang into standard English.

TASK:
- Translate Gen Z slang in the INPUT text into clear, standard English
- Replace slang terms like: no cap → for real, bussin → really good, fire → amazing, drip → stylish, mid → mediocre, etc.
- Keep the tone neutral and professional
- Preserve the structure and formatting of the original text

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Translate all Gen Z slang to standard equivalents

OUTPUT:
- Return ONLY the translated text in standard English, nothing else`;

async function translateWithAI(
  text: string,
  mode: 'toGenZ' | 'toStandard'
): Promise<string> {
  try {
    const prompt = mode === 'toGenZ' ? TO_GENZ_PROMPT : TO_STANDARD_PROMPT;

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
      temperature: 0.7, // Higher temperature for more creative slang translations
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
      mode?: 'toGenZ' | 'toStandard';
    };
    const { text, mode = 'toGenZ' } = body;

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
    console.error('Error processing Gen Z translation:', error);
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
      message: 'Gen Z Translator API - Use POST method to translate text',
      version: '2.0',
      supported_modes: ['toGenZ', 'toStandard'],
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
