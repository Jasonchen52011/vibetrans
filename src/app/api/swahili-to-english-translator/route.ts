import { detectLanguage } from '@/lib/language-detection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 初始化 Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

// 翻译模式定义
const TRANSLATION_MODES = {
  formal: {
    name: 'Formal Translation',
    swahiliToEnPrompt: `You are a professional Swahili to English translator specializing in formal documents.

Focus on:
- Accurate translation of formal Swahili
- Proper English grammar and syntax
- Maintaining formal tone and register
- Technical and business terminology
- Cultural nuances in formal contexts

Translate the following Swahili text to formal English:`,
  },
  casual: {
    name: 'Casual Translation',
    swahiliToEnPrompt: `You are a Swahili to English translator specializing in everyday conversation and casual language.

Focus on:
- Natural, conversational English
- Common expressions and slang equivalents
- Cultural context in daily life
- Modern usage and colloquialisms
- Maintaining friendly, approachable tone

Translate the following Swahili text to casual English:`,
  },
  literary: {
    name: 'Literary Translation',
    swahiliToEnPrompt: `You are a literary translator specializing in Swahili to English literary works.

Focus on:
- Preserving literary style and artistic expression
- Cultural nuances and literary devices
- Poetic elements and narrative flow
- Traditional storytelling elements
- Maintaining emotional and aesthetic impact

Translate the following Swahili literary text to English while preserving its artistic essence:`,
  },
  general: {
    name: 'General Translation',
    swahiliToEnPrompt: `You are a professional Swahili to English translator. Translate the text directly without any explanations or instructions.

Translate the following Swahili text to English:`,
  },
};

type TranslationMode = keyof typeof TRANSLATION_MODES;

// 处理文本翻译
async function translateText(
  text: string,
  mode: TranslationMode = 'general'
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const modeConfig = TRANSLATION_MODES[mode];
  const systemPrompt = modeConfig.swahiliToEnPrompt;
  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text().trim();
}

// Handle GET method for health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Swahili to English Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: TranslationMode;
      detectOnly?: boolean;
    };

    const { text, mode = 'general', detectOnly = false } = body;

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 验证翻译模式
    if (!TRANSLATION_MODES[mode]) {
      return NextResponse.json(
        {
          error: `Invalid mode. Available modes: ${Object.keys(TRANSLATION_MODES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 智能检测输入语言
    const detection = detectLanguage(text, 'swahili');
    const { detectedLanguage, confidence } = detection;

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        confidence,
        autoDetected: true,
        languageInfo: {
          detected: true,
          detectedLanguage:
            detectedLanguage === 'swahili'
              ? 'Swahili'
              : detectedLanguage === 'english'
                ? 'English'
                : 'Unknown',
          direction:
            detectedLanguage === 'swahili' ? 'Swahili → English' : 'Unknown',
          confidence: Math.round(confidence * 100),
          explanation:
            detectedLanguage === 'swahili'
              ? 'Detected Swahili input, will translate to English'
              : detectedLanguage === 'english'
                ? 'Detected English input'
                : 'Language detection uncertain, please input Swahili text',
        },
      });
    }

    // 执行翻译
    const translation = await translateText(text, mode);

    const result = {
      translated: translation,
      original: text,
      mode: mode,
      modeName: TRANSLATION_MODES[mode].name,
      detectedInputLanguage: detectedLanguage,
      confidence,
      autoDetected: true,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          detectedLanguage === 'swahili'
            ? 'Swahili'
            : detectedLanguage === 'english'
              ? 'English'
              : 'Unknown',
        direction: 'Swahili → English',
        confidence: Math.round(confidence * 100),
        explanation:
          detectedLanguage === 'swahili'
            ? 'Auto-detected Swahili input, translated to English'
            : detectedLanguage === 'english'
              ? 'Detected English input'
              : 'Translation completed',
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);

    // 处理特定的 Gemini 错误
    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
