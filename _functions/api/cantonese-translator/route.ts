import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

// Handle GET method for health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Cantonese Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

// Handle OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    // 验证API密钥配置
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error(
        'Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable'
      );
      return NextResponse.json(
        { error: 'API configuration error - missing API key' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      text: string;
      direction?: 'yue-to-en' | 'en-to-yue';
      detectOnly?: boolean; // 仅检测语言，不翻译
    };
    const { text, direction, detectOnly = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能检测输入语言（用于信息反馈）
    const detection = detectLanguage(text, 'cantonese');
    const { detectedLanguage, suggestedDirection, confidence } = detection;

    // 确定翻译方向：优先使用自动检测，用户可以手动覆盖
    const finalDirection: 'yue-to-en' | 'en-to-yue' = direction
      ? direction
      : suggestedDirection === 'to-english'
        ? 'yue-to-en'
        : 'en-to-yue';

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection: finalDirection,
        confidence,
        autoDetected: !direction,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'english'
              ? 'English'
              : detectedLanguage === 'cantonese'
                ? 'Cantonese'
                : 'Unknown',
          direction:
            finalDirection === 'yue-to-en'
              ? 'Cantonese → English'
              : 'English → Cantonese',
          confidence: Math.round(confidence * 100),
          explanation: direction
            ? `Manually set to ${finalDirection === 'yue-to-en' ? 'Cantonese → English' : 'English → Cantonese'}`
            : detectedLanguage === 'english'
              ? 'Detected English input, will translate to Cantonese'
              : detectedLanguage === 'cantonese'
                ? 'Detected Cantonese input, will translate to English'
                : 'Language detection uncertain, please input Cantonese or English',
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create direction-specific prompts
    const yueToEnPrompt = `Translate the following Cantonese text to English. Only output the English translation, no explanations:

${text}`;

    const enToYuePrompt = `Translate the following English text to Cantonese (Traditional Chinese with Cantonese characters). Only output the Cantonese translation, no explanations:

${text}`;

    const prompt =
      finalDirection === 'yue-to-en' ? yueToEnPrompt : enToYuePrompt;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({
      translated: translatedText,
      original: text,
      direction: finalDirection,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: !direction,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'english'
            ? 'English'
            : detectedLanguage === 'cantonese'
              ? 'Cantonese'
              : 'Unknown',
        direction:
          finalDirection === 'yue-to-en'
            ? 'Cantonese → English'
            : 'English → Cantonese',
        confidence: Math.round(confidence * 100),
        explanation: direction
          ? `Manual translation: ${finalDirection === 'yue-to-en' ? 'Cantonese → English' : 'English → Cantonese'}`
          : detectedLanguage === 'english'
            ? 'Auto-detected English input, translated to Cantonese'
            : detectedLanguage === 'cantonese'
              ? 'Auto-detected Cantonese input, translated to English'
              : 'Translation completed',
      },
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
