import { detectLanguage } from '@/lib/language-detection';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TO_GASTER_PROMPT = `You are an expert in Gaster language and symbolic communication systems (inspired by Undertale's Wingdings).

TASK:
- Translate the INPUT English text into Gaster language
- Use appropriate Wingdings symbols and special characters
- Create symbolic representations that maintain the original meaning
- Apply proper Gaster language conventions and symbol patterns

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context of the original text
- Keep the same paragraph structure and formatting
- Use appropriate symbolic conventions
- Apply proper character combinations and symbol patterns

OUTPUT:
- Return ONLY the Gaster language text, nothing else`;

const TO_ENGLISH_PROMPT = `You are an expert in Gaster language and symbolic communication systems (inspired by Undertale's Wingdings).

TASK:
- Translate the INPUT Gaster language symbols into modern English
- Provide accurate interpretation maintaining the original meaning and context
- Consider the symbolic and metaphorical meaning of the characters
- Use clear, modern English while preserving the essence of the symbolic language

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context
- Keep the same paragraph structure and formatting
- Provide a faithful interpretation of the symbolic language
- Maintain accuracy for Gaster language interpretation

OUTPUT:
- Return ONLY the English translation, nothing else`;

async function translateWithAI(
  text: string,
  direction: 'toGaster' | 'toEnglish'
): Promise<string> {
  try {
    const prompt =
      direction === 'toGaster' ? TO_GASTER_PROMPT : TO_ENGLISH_PROMPT;

    const { text: translatedText } = await generateText({
      model: google('gemini-2.0-flash'),
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
      temperature: 0.3, // Lower temperature for more accurate symbolic translation
    });

    return translatedText.trim();
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    // Only support English to Gaster translation
    const finalDirection: 'toGaster' = 'toGaster';

    // 清理文本
    const cleanedText = text.trim();

    // 执行翻译
    const translatedText = await translateWithAI(cleanedText, finalDirection);

    return NextResponse.json({
      original: cleanedText,
      translated: translatedText,
      direction: finalDirection,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing Gaster translation:', error);
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
      message: 'Gaster Translator API - Use POST method to translate English text to Gaster',
      version: '1.0',
      supported_directions: ['toGaster'], // Only support English to Gaster
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
