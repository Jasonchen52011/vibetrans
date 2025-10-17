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
    const { text, direction = 'auto' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    // 智能检测输入语言和翻译方向
    let finalDirection: 'toBaybayin' | 'toEnglish';
    let autoDetected = false;
    let explanation = '';

    if (direction === 'auto') {
      // 使用语言检测库
      const detection = detectLanguage(text, 'baybayin');

      if (
        detection.detectedLanguage === 'baybayin' ||
        detection.detectedLanguage === 'unknown'
      ) {
        // 检查是否包含巴贝因文字字符
        const hasBaybayinChars = /[\u1700-\u171F\u1720-\u173F]/.test(text);
        if (hasBaybayinChars) {
          finalDirection = 'toEnglish';
          explanation = '检测到巴贝因文字字符，设置为巴贝因文字到英语翻译';
        } else {
          finalDirection = 'toBaybayin';
          explanation = '检测到拉丁字符，设置为英语到巴贝因文字翻译';
        }
      } else if (detection.detectedLanguage === 'english') {
        finalDirection = 'toBaybayin';
        explanation = '检测到英语，设置为英语到巴贝因文字翻译';
      } else {
        finalDirection = 'toBaybayin';
        explanation = '无法确定语言，默认设置为英语到巴贝因文字翻译';
      }
      autoDetected = true;
    } else {
      finalDirection = direction;
      explanation = `使用用户指定的翻译方向: ${direction}`;
    }

    // 清理文本
    const cleanedText = text.trim();

    // 执行翻译
    const translatedText = await translateWithAI(cleanedText, finalDirection);

    return NextResponse.json({
      original: cleanedText,
      translated: translatedText,
      direction: finalDirection,
      success: true,
      autoDetected: autoDetected,
      languageInfo: {
        detected: autoDetected,
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
