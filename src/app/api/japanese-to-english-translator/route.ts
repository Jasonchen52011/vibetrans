/**
 * Japanese to English Translator API - 简化版本
 */

export const runtime = 'edge';

// 翻译请求类型
type TranslationRequest = {
  text: string;
};

// 翻译结果类型
type TranslationResult = {
  translatedText: string;
};

// Handle GET method for health checks
export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'Japanese to English Translator API is running',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text }: TranslationRequest = body;

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required for translation' },
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

    // 直接翻译提示 - 只要翻译结果
    const prompt = `"${text}" - Translate to English, no explanation.`;

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
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Translation API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      throw new Error('No translation received');
    }

    // 构建简单响应
    const result: TranslationResult = {
      translatedText: translatedText,
    };

    return Response.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);

    // 简单的降级方案
    const fallbackTranslation = `${text} (Translation to English - Demo Mode)`;

    return Response.json({
      translatedText: fallbackTranslation,
      warning: 'Translation service unavailable, using fallback.',
    });
  }
}
