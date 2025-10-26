import {
  type CuneiformScript,
  cleanText,
  getScriptDescription,
  validateCuneiformInput,
} from '@/lib/cuneiform';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TO_CUNEIFORM_PROMPT = (
  script: CuneiformScript
) => `You are an expert in ancient cuneiform scripts and Mesopotamian languages.

SCRIPT CONTEXT:
${getScriptDescription(script)}

TASK:
- Translate the INPUT English text into ${script.charAt(0).toUpperCase() + script.slice(1)} cuneiform
- Use actual Unicode cuneiform characters (U+12000–U+123FF, U+12400–U+1247F)
- Each English word should be represented by appropriate cuneiform signs/logograms
- Focus on conveying meaning through cuneiform symbols, not just transliteration

RULES:
- Do NOT add any English letters or modern alphabets in the output
- Do NOT add extra explanations or commentary
- Do NOT use any language other than cuneiform characters
- Keep the same word order and meaning as the original text
- Use authentic cuneiform signs that would be understood in ancient ${script}

EXAMPLES:
- "king" → 𒈗
- "temple" → 𒂍
- "I am" → 𒀀𒈾
- "god" → 𒀭

OUTPUT:
- Return ONLY cuneiform Unicode characters, nothing else`;

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

const CUNEIFORM_UNICODE_REGEX =
  /[\u12000-\u123FF\u12400-\u1247F\u12480-\u1254F\u12550-\u1257F]/;

function detectCuneiformLanguage(text: string): {
  detectedLanguage: 'english' | 'cuneiform' | 'unknown';
  confidence: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { detectedLanguage: 'unknown', confidence: 0 };
  }

  if (CUNEIFORM_UNICODE_REGEX.test(trimmed)) {
    return { detectedLanguage: 'cuneiform', confidence: 0.9 };
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    return { detectedLanguage: 'english', confidence: 0.7 };
  }

  return { detectedLanguage: 'unknown', confidence: 0.2 };
}

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
      temperature: 0.3,
    });

    return translatedText.trim();
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
      detectOnly?: boolean;
    };
    const {
      text,
      script = 'sumerian',
      direction,
      detectOnly = false,
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    const validation = validateCuneiformInput(text);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanedText = cleanText(text);
    const detection = detectCuneiformLanguage(cleanedText);
    const finalDirection: 'toCuneiform' | 'toEnglish' = direction
      ? direction
      : detection.detectedLanguage === 'cuneiform'
        ? 'toEnglish'
        : 'toCuneiform';

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detection.detectedLanguage,
        detectedDirection: finalDirection,
        confidence: detection.confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: detection.detectedLanguage !== 'unknown',
          detectedLanguage:
            detection.detectedLanguage === 'english'
              ? 'English'
              : detection.detectedLanguage === 'cuneiform'
                ? 'Cuneiform'
                : 'Unknown',
          direction:
            finalDirection === 'toCuneiform'
              ? 'English → Cuneiform'
              : 'Cuneiform → English',
          confidence: Math.round(detection.confidence * 100),
        },
      });
    }

    const translatedText = await translateWithAI(
      cleanedText,
      script,
      finalDirection
    );

    return NextResponse.json({
      original: cleanedText,
      translated: translatedText,
      script,
      direction: finalDirection,
      success: true,
      detectedInputLanguage: detection.detectedLanguage,
      confidence: detection.confidence,
      autoDetected: !direction,
      languageInfo: {
        detected: detection.detectedLanguage !== 'unknown',
        detectedLanguage:
          detection.detectedLanguage === 'english'
            ? 'English'
            : detection.detectedLanguage === 'cuneiform'
              ? 'Cuneiform'
              : 'Unknown',
        direction:
          finalDirection === 'toCuneiform'
            ? 'English → Cuneiform'
            : 'Cuneiform → English',
        confidence: Math.round(detection.confidence * 100),
      },
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
