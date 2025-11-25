/**
 * Albanian to English Translator API (Advanced) - 极简版本
 * 专门用于Edge Function大小优化
 */

import { queuedGeminiFetch } from '@/lib/queue/gemini-fetch-queue';

export const runtime = 'edge';

// 简单的阿尔巴尼亚语字符检测
function isAlbanian(text: string): boolean {
  // 检查阿尔巴尼亚语特有字符
  return (
    /[ëç]/.test(text) ||
    // 常见阿尔巴尼亚语词汇
    /\b(përshëndetje|mirë|faleminderit|tungjatjeta|po|jo|ju lutem|shqip|tirana|durrës|unë|ti|ai|ajo)\b/i.test(
      text
    )
  );
}

// 简单的语言检测
function detectLanguage(text: string): 'albanian' | 'english' | 'unknown' {
  const cleanText = text.toLowerCase().trim();

  // 优先检查英语特征 - 增强检测
  if (
    /\b(the|and|is|are|you|i|we|they|he|she|it|a|an|to|of|in|on|at|by|for|with|from|hello|hi|goodbye|thank|please|yes|no|this|that|these|those|what|where|when|why|how|who|which|whose|there|here|where|now|then|today|tomorrow|yesterday)\b/i.test(
      cleanText
    )
  ) {
    return 'english';
  }

  // 检查阿尔巴尼亚语特征
  if (isAlbanian(cleanText)) {
    return 'albanian';
  }

  // 如果包含非ASCII字符，很可能是阿尔巴尼亚语
  if (/[^\x00-\x7F]/.test(cleanText)) {
    return 'albanian';
  }

  return 'unknown';
}

// 翻译模式定义 - 简化版
const TRANSLATION_MODES = {
  general: {
    name: 'General Translation',
    sqToEnPrompt: `Translate the following Albanian text to English:`,
    enToSqPrompt: `Translate the following English text to Albanian:`,
  },
  technical: {
    name: 'Technical Translation',
    sqToEnPrompt: `Translate the following Albanian text to English with technical precision:`,
    enToSqPrompt: `Translate the following English text to Albanian with technical precision:`,
  },
  legal: {
    name: 'Legal Translation',
    sqToEnPrompt: `Translate the following Albanian text to English with legal accuracy:`,
    enToSqPrompt: `Translate the following English text to Albanian with legal accuracy:`,
  },
};

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 构建翻译提示
function buildPrompt(
  text: string,
  mode: TranslationMode,
  direction: string
): string {
  const modeConfig = TRANSLATION_MODES[mode];

  if (direction === 'sq-to-en') {
    return `${modeConfig.sqToEnPrompt}\n\n"${text}"`;
  } else {
    return `${modeConfig.enToSqPrompt}\n\n"${text}"`;
  }
}

// Handle GET method for health checks
export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'Albanian to English Translator API (Advanced Minimal) is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
    modes: Object.keys(TRANSLATION_MODES),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, mode = 'general', direction, detectOnly = false } = body;

    if (!text) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    // 验证翻译模式
    if (!TRANSLATION_MODES[mode]) {
      return Response.json(
        {
          error: `Invalid mode. Available modes: ${Object.keys(TRANSLATION_MODES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 智能检测输入语言
    const detection = detectLanguage(text);
    const { detectedLanguage } = detection;

    // 确定翻译方向
    let finalDirection = direction;
    if (!finalDirection) {
      if (detectedLanguage === 'english') {
        finalDirection = 'en-to-sq';
      } else if (detectedLanguage === 'albanian') {
        finalDirection = 'sq-to-en';
      } else {
        finalDirection = 'sq-to-en'; // 默认方向
      }
    }

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return Response.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: finalDirection,
        confidence: 0.8,
        autoDetected: true,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'english'
              ? 'English'
              : detectedLanguage === 'albanian'
                ? 'Albanian'
                : 'Unknown',
          direction:
            finalDirection === 'sq-to-en'
              ? 'Albanian → English'
              : 'English → Albanian',
          confidence: 80,
          explanation:
            detectedLanguage === 'english'
              ? 'Detected English input'
              : detectedLanguage === 'albanian'
                ? 'Detected Albanian input'
                : 'Language detection uncertain',
        },
      });
    }

    // 构建翻译提示
    const prompt = buildPrompt(text, mode, finalDirection);

    // 调用 Gemini API (通过队列)
    const response = await queuedGeminiFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature:
              mode === 'legal' ? 0.2 : mode === 'technical' ? 0.1 : 0.3,
            maxOutputTokens: 2048,
          },
        }),
      },
      'albanian-to-english-advanced'
    );

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translated) {
      throw new Error('No translation received');
    }

    // 构建响应
    const result = {
      translated,
      original: text,
      mode,
      modeName: TRANSLATION_MODES[mode].name,
      direction: finalDirection,
      detectedInputLanguage: detectedLanguage,
      confidence: 0.8,
      autoDetected: !direction,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'english'
            ? 'English'
            : detectedLanguage === 'albanian'
              ? 'Albanian'
              : 'Unknown',
        direction:
          finalDirection === 'sq-to-en'
            ? 'Albanian → English'
            : 'English → Albanian',
        confidence: 80,
        explanation: direction
          ? `Manual translation: ${finalDirection === 'sq-to-en' ? 'Albanian → English' : 'English → Albanian'}`
          : detectedLanguage === 'english'
            ? 'Auto-detected English input, translated to Albanian'
            : detectedLanguage === 'albanian'
              ? 'Auto-detected Albanian input, translated to English'
              : 'Translation completed',
      },
    };

    return Response.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);

    // 处理特定的 Gemini 错误
    if (error?.message?.includes('API key')) {
      return Response.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (error?.message?.includes('quota')) {
      return Response.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return Response.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
