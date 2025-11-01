/**
 * 阿尔巴尼亚语翻译器API - 使用基座架构
 */

import { TranslationService } from '@/lib/ai-base/translation-service';
import { getTranslatorConfig } from '@/lib/ai-base/translator-configs';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Handle GET method for health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Albanian to English Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      direction?: 'sq-to-en' | 'en-to-sq';
      detectOnly?: boolean;
    };

    const { text, direction, detectOnly = false } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 获取翻译器配置
    const config = getTranslatorConfig('albanian-to-english-translator');
    if (!config) {
      return NextResponse.json(
        { error: 'Translator configuration not found' },
        { status: 500 }
      );
    }

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      }
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 构建翻译请求
    const translationRequest = {
      text,
      translator: config.id,
      mode: config.defaultMode,
      direction,
      detectOnly,
      inputType: 'text' as const,
    };

    // 调用翻译服务
    const result = await TranslationService.translate(translationRequest);

    // 格式化响应以匹配原有API格式
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 构建响应对象
    const response: any = {
      translated: result.translated,
      original: result.original,
      direction: result.metadata?.direction,
      detectedInputLanguage: result.metadata?.detectedLanguage,
      confidence: result.metadata?.confidence,
      autoDetected: result.metadata?.autoDetected,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage:
          result.metadata?.detectedLanguage === 'english'
            ? 'English'
            : result.metadata?.detectedLanguage === 'albanian'
              ? 'Albanian'
              : 'Unknown',
        direction:
          result.metadata?.direction === 'sq-to-en'
            ? 'Albanian → English'
            : 'English → Albanian',
        confidence: Math.round((result.metadata?.confidence || 0) * 100),
        explanation:
          result.metadata?.direction === 'sq-to-en'
            ? result.metadata?.autoDetected
              ? 'Auto-detected Albanian input, translated to English'
              : 'Manual translation: Albanian → English'
            : result.metadata?.autoDetected
              ? 'Auto-detected English input, translated to Albanian'
              : 'Manual translation: English → Albanian',
      },
    };

    // 处理仅检测语言的情况
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: result.metadata?.detectedLanguage,
        detectedDirection: result.metadata?.direction,
        confidence: result.metadata?.confidence,
        autoDetected: result.metadata?.autoDetected,
        languageInfo: response.languageInfo,
      });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }

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
