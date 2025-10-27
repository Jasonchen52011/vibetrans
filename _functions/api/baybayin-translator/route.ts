import { detectLanguage } from '@/lib/language-detection';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TO_BAYBAYIN_PROMPT = `You are an expert in Baybayin script and Philippine ancient writing systems.

TASK:
- Translate the INPUT English or Filipino text into Baybayin script
- Use appropriate Baybayin characters (Unicode U+1700–U+171F)
- Provide accurate transliteration maintaining the original meaning
- Use proper Baybayin writing conventions and rules
- Apply correct kudlit (vowel marks) and punctuation marks

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context of the original text
- Keep the same paragraph structure and formatting
- Use appropriate Baybayin script conventions
- Apply proper character combinations and vowel markers

OUTPUT:
- Return ONLY the Baybayin text, nothing else`;

const TO_ENGLISH_PROMPT = `You are an expert in Baybayin script and Philippine ancient writing systems.

TASK:
- Translate the INPUT Baybayin script into modern English
- Provide accurate scholarly translation maintaining the original meaning and context
- Consider the historical and cultural context of the text
- Use clear, modern English while preserving the essence of the ancient script

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context
- Keep the same paragraph structure and formatting
- Provide a faithful academic translation
- Maintain scholarly accuracy for Baybayin interpretation

OUTPUT:
- Return ONLY the English translation, nothing else`;

async function translateWithAI(
  text: string,
  direction: 'toBaybayin' | 'toEnglish'
): Promise<string> {
  try {
    const prompt =
      direction === 'toBaybayin' ? TO_BAYBAYIN_PROMPT : TO_ENGLISH_PROMPT;

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
    const detection = detectLanguage(text, 'baybayin');
    const hasBaybayinChars = /[\u1700-\u171F\u1720-\u173F]/.test(text);

    let finalDirection: 'toBaybayin' | 'toEnglish' =
      direction === 'auto' ? 'toBaybayin' : direction;
    let explanation = '';
    if (direction === 'auto') {
      if (
        detection.detectedLanguage === 'baybayin' ||
        (detection.detectedLanguage === 'unknown' && hasBaybayinChars)
      ) {
        finalDirection = 'toEnglish';
        explanation =
          'Detected Baybayin characters, switching to Baybayin → English.';
      } else {
        finalDirection = 'toBaybayin';
        explanation =
          detection.detectedLanguage === 'english'
            ? 'Detected English text, using English → Baybayin.'
            : 'Unable to determine language, defaulting to English → Baybayin.';
      }
    } else {
      explanation = `Using user-selected direction: ${direction}`;
    }

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage:
          detection.detectedLanguage === 'english'
            ? 'english'
            : detection.detectedLanguage === 'baybayin'
              ? 'baybayin'
              : hasBaybayinChars
                ? 'baybayin'
                : 'unknown',
        detectedDirection: finalDirection,
        confidence: detection.confidence ?? 0,
        autoDetected: direction === 'auto',
        languageInfo: {
          explanation,
          hasBaybayinChars,
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
          : detection.detectedLanguage === 'baybayin'
            ? 'baybayin'
            : hasBaybayinChars
              ? 'baybayin'
              : 'unknown',
      confidence: detection.confidence ?? 0,
      success: true,
      autoDetected: direction === 'auto',
      languageInfo: {
        detected: direction === 'auto',
        explanation: explanation,
        originalInput: direction,
        finalDirection: finalDirection,
      },
    });
  } catch (error: any) {
    console.error('Error processing Baybayin translation:', error);
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
      message: 'Baybayin Translator API - Use POST method to translate text',
      version: '1.0',
      supported_directions: ['toBaybayin', 'toEnglish', 'auto'],
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
