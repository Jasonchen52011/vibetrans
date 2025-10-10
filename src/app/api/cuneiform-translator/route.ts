import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import {
  type CuneiformScript,
  cleanText,
  getScriptDescription,
  validateCuneiformInput,
} from '@/lib/cuneiform';

export const runtime = 'edge';

const TO_CUNEIFORM_PROMPT = (
  script: CuneiformScript
) => `You are an expert in ancient cuneiform scripts and Mesopotamian languages.

SCRIPT CONTEXT:
${getScriptDescription(script)}

TASK:
- Translate the INPUT text into ${script.charAt(0).toUpperCase() + script.slice(1)} cuneiform representation
- Use Unicode cuneiform characters (U+12000–U+123FF, U+12400–U+1247F) where appropriate
- Provide accurate scholarly transliteration if full Unicode representation is not possible
- Be historically accurate in your translation
- Maintain the scholarly conventions of cuneiform transliteration

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context of the original text
- Keep the same paragraph structure and formatting
- Use appropriate cuneiform conventions for ${script}
- Be academically rigorous and historically accurate

OUTPUT:
- Return ONLY the cuneiform text or transliteration, nothing else`;

const TO_ENGLISH_PROMPT = (
  script: CuneiformScript
) => `You are an expert in ancient cuneiform scripts and Mesopotamian languages.

SCRIPT CONTEXT:
${getScriptDescription(script)}

TASK:
- Translate the INPUT ${script.charAt(0).toUpperCase() + script.slice(1)} cuneiform text into modern English
- Provide accurate scholarly translation maintaining the original meaning and context
- Consider the historical and cultural context of the text
- Use clear, modern English while preserving the essence of the ancient text

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context
- Keep the same paragraph structure and formatting
- Provide a faithful academic translation
- Maintain scholarly accuracy

OUTPUT:
- Return ONLY the English translation, nothing else`;

async function translateWithAI(
  text: string,
  script: CuneiformScript,
  direction: 'toCuneiform' | 'toEnglish'
): Promise<string> {
  try {
    const prompt =
      direction === 'toCuneiform'
        ? TO_CUNEIFORM_PROMPT(script)
        : TO_ENGLISH_PROMPT(script);

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
      temperature: 0.3, // Lower temperature for more accurate scholarly translation
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
      script?: CuneiformScript;
      direction?: 'toCuneiform' | 'toEnglish';
    };
    const { text, script = 'sumerian', direction = 'toCuneiform' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateCuneiformInput(text);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Clean text
    const cleanedText = cleanText(text);

    // Perform translation using AI
    const translatedText = await translateWithAI(
      cleanedText,
      script,
      direction
    );

    return NextResponse.json({
      original: cleanedText,
      translated: translatedText,
      script: script,
      direction: direction,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing cuneiform translation:', error);
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
      message: 'Cuneiform Translator API - Use POST method to translate text',
      version: '1.0',
      supported_scripts: ['sumerian', 'akkadian', 'babylonian'],
      supported_directions: ['toCuneiform', 'toEnglish'],
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
