/**
 * Albanian to English Translator API - 极简版本
 * 专门用于Edge Function大小优化
 */

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

// 构建简单的翻译提示
function buildPrompt(text: string, direction: string): string {
  if (direction === 'al-to-en') {
    return `Translate the following Albanian text to English. Only output the translation, no explanations:\n\n"${text}"`;
  } else {
    return `Translate the following English text to Albanian. Only output the translation, no explanations:\n\n"${text}"`;
  }
}

// Handle GET method for health checks
export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'Albanian to English Translator API (Minimal) is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, direction } = body;

    if (!text) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 自动检测语言方向（如果未指定）
    let finalDirection = direction;
    if (!finalDirection) {
      const detectedLang = detectLanguage(text);
      if (detectedLang === 'albanian') {
        finalDirection = 'al-to-en';
      } else if (detectedLang === 'english') {
        finalDirection = 'en-to-al';
      } else {
        finalDirection = 'al-to-en'; // 默认方向
      }
    }

    // 构建翻译提示
    const prompt = buildPrompt(text, finalDirection);

    // 调用 Gemini API
    const response = await fetch(
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
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
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
      direction: finalDirection,
      detectedInputLanguage:
        finalDirection === 'al-to-en' ? 'albanian' : 'english',
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          finalDirection === 'al-to-en' ? 'Albanian' : 'English',
        direction:
          finalDirection === 'al-to-en'
            ? 'Albanian → English'
            : 'English → Albanian',
        confidence: 0.8,
        explanation:
          finalDirection === 'al-to-en'
            ? 'Auto-detected Albanian input, translated to English'
            : 'Auto-detected English input, translated to Albanian',
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
