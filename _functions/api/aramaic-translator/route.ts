import { detectLanguage } from '@/lib/language-detection';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TO_ARAMAIC_PROMPT = `You are an expert in Aramaic language and ancient Semitic languages.

TASK:
- Translate the INPUT English text into Aramaic
- Use appropriate Aramaic script (Syriac script: U+0700–U+074F)
- Provide accurate translation maintaining the original meaning
- Use proper Aramaic grammar and vocabulary
- Be historically and linguistically accurate

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context of the original text
- Keep the same paragraph structure and formatting
- Use appropriate Aramaic script conventions
- Be academically rigorous and historically accurate

OUTPUT:
- Return ONLY the Aramaic text, nothing else`;

const TO_ENGLISH_PROMPT = `You are an expert in Aramaic language and ancient Semitic languages.

TASK:
- Translate the INPUT Aramaic text into modern English
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
  direction: 'toAramaic' | 'toEnglish'
): Promise<string> {
  try {
    const prompt =
      direction === 'toAramaic' ? TO_ARAMAIC_PROMPT : TO_ENGLISH_PROMPT;

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

    return translatedText.trim();
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, direction = 'auto', detectOnly = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    // 智能检测输入语言和翻译方向
    const detection = detectLanguage(text, 'aramaic');
    const hasAramaicChars = /[\u0700-\u074F\u0840-\u085F]/.test(text);

    let finalDirection: 'toAramaic' | 'toEnglish' =
      direction === 'auto' ? 'toAramaic' : direction;
    let explanation = '';

    if (direction === 'auto') {
      if (detection.suggestedDirection === 'toAramaic') {
        finalDirection = 'toAramaic';
        explanation = 'Detected English text, translating to Aramaic.';
      } else if (detection.suggestedDirection === 'toEnglish') {
        finalDirection = 'toEnglish';
        explanation = 'Detected Aramaic script, translating to English.';
      } else if (hasAramaicChars) {
        finalDirection = 'toEnglish';
        explanation = 'Aramaic characters detected, translating to English.';
      } else {
        finalDirection = 'toAramaic';
        explanation =
          'Unable to confirm language, defaulting to English → Aramaic.';
      }
    } else {
      explanation = `Using user-selected direction: ${direction}`;
    }

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage:
          detection.detectedLanguage === 'english'
            ? 'english'
            : detection.detectedLanguage === 'aramaic' || hasAramaicChars
              ? 'aramaic'
              : 'unknown',
        detectedDirection: finalDirection,
        confidence: detection.confidence ?? 0,
        autoDetected: direction === 'auto',
        languageInfo: {
          detected:
            detection.detectedLanguage === 'english' ||
            detection.detectedLanguage === 'aramaic' ||
            hasAramaicChars,
          explanation,
        },
      });
    }

    // 清理文本
    const cleanedText = text.trim();

    // 执行翻译
    const translatedText = await translateWithAI(cleanedText, finalDirection);

    return NextResponse.json({
      original: cleanedText,
      translated: translatedText,
      direction: finalDirection,
      detectedDirection: finalDirection,
      detectedInputLanguage:
        detection.detectedLanguage === 'english'
          ? 'english'
          : detection.detectedLanguage === 'aramaic' || hasAramaicChars
            ? 'aramaic'
            : 'unknown',
      confidence: detection.confidence ?? 0,
      success: true,
      autoDetected: direction === 'auto',
      languageInfo: {
        detected:
          detection.detectedLanguage === 'english' ||
          detection.detectedLanguage === 'aramaic' ||
          hasAramaicChars,
        explanation,
        originalInput: direction,
        finalDirection: finalDirection,
      },
    });
  } catch (error: any) {
    console.error('Error processing Aramaic translation:', error);
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
      message: 'Aramaic Translator API - Use POST method to translate text',
      version: '1.0',
      supported_directions: ['toAramaic', 'toEnglish', 'auto'],
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
