/**
 * English to Amharic Translator API - Gemini Flash 2.0版本
 */

import { queuedGeminiFetch } from '@/lib/queue/gemini-fetch-queue';

export const runtime = 'edge';

// Handle GET method for health checks
export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'English to Amharic Translator API (Gemini Flash 2.0) is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

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

    // 构建简单的翻译提示
    const prompt = `Translate this English text to Amharic, return only the translation without explanation: "${text}"`;

    // 调用 Gemini 2.0 Flash API (通过队列)
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
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      },
      'english-to-amharic'
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Translation API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translated) {
      throw new Error('No translation received');
    }

    // 简化响应，只返回翻译结果
    return Response.json({
      translated,
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    // 提供更详细的错误信息用于调试
    const errorMessage = error?.message || 'Unknown error occurred';
    const errorDetails =
      process.env.NODE_ENV === 'development'
        ? { fullError: error.toString(), stack: error.stack }
        : {};

    return Response.json(
      {
        error: 'Translation failed. Please try again.',
        details: errorMessage,
        debug: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
