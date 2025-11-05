import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationRequest = {
  text: string;
  inputType?: string;
  direction?: 'sw-en' | 'auto';
  mode?: 'general' | 'formal' | 'colloquial';
};

// 使用Gemini直接翻译
async function callGeminiDirectly(
  text: string,
  mode = 'general'
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  // 构建简单的翻译提示
  const prompt = `Translate the following text between Swahili and English. Detect the source language automatically and provide an accurate translation:

${text}

Provide only the direct translation without explanations or additional text.`;

  try {
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
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini translation error:', errorText);
      }
      return null;
    }

    const data = await response.json();
    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return translatedText || null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation API failure:', error);
    }
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      inputType = 'text',
      direction = 'auto',
      mode = 'general',
    }: TranslationRequest = body;

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return Response.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // 直接调用Gemini翻译
    const translatedText = await callGeminiDirectly(text, mode);

    if (translatedText) {
      return Response.json({
        translated: translatedText,
        original: text,
        inputType,
        direction: 'swahili-to-english',
        mode,
        message: 'Translation successful',
        timestamp: new Date().toISOString(),
      });
    }

    // 如果Gemini失败，返回简单错误
    return Response.json(
      { error: 'Translation service unavailable' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Swahili to english translation error:', error);

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
      {
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    status: 'healthy',
    message: 'Swahili to english translator API (Direct Gemini) is running',
    description: 'Direct translation between Swahili and english using Gemini',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
    usage: {
      endpoint: '/api/swahili-to-english-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction: 'auto (optional, default: auto)',
        mode: 'general (optional)',
      },
    },
    features: [
      'Direct Gemini translation',
      'Automatic language detection',
      'Simple and fast',
      'Up to 5000 characters per request',
    ],
    supportedLanguages: ['Swahili', 'english'],
    maxTextLength: 5000,
  });
}
