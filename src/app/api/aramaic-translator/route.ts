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
    const { text, direction = 'auto' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    // 智能检测输入语言和翻译方向
    let finalDirection: 'toAramaic' | 'toEnglish';
    let autoDetected = false;
    let explanation = '';

    if (direction === 'auto') {
      // 使用语言检测库
      const detection = detectLanguage(text, 'aramaic');

      // 使用检测结果直接映射到API所需的方向
      if (detection.suggestedDirection === 'toAramaic') {
        finalDirection = 'toAramaic';
        explanation = '检测到英语，设置为英语到阿拉姆语翻译';
      } else if (detection.suggestedDirection === 'toEnglish') {
        finalDirection = 'toEnglish';
        explanation = '检测到阿拉姆语，设置为阿拉姆语到英语翻译';
      } else {
        // 回退到字符检测
        const hasAramaicChars = /[\u0700-\u074F\u0840-\u085F]/.test(text);
        if (hasAramaicChars) {
          finalDirection = 'toEnglish';
          explanation = '检测到阿拉姆语字符，设置为阿拉姆语到英语翻译';
        } else {
          finalDirection = 'toAramaic';
          explanation = '检测到拉丁字符，默认设置为英语到阿拉姆语翻译';
        }
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
