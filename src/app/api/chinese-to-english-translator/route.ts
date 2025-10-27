/**
 * 中英翻译器API - 使用基座架构
 */

import { TranslationService } from '@/lib/ai-base/translation-service';
import { getTranslatorConfig } from '@/lib/ai-base/translator-configs';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 支持的图片 MIME 类型
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Handle GET method for health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Chinese to English Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'OPTIONS'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      imageData?: string;
      imageMimeType?: string;
      audioData?: string;
      audioMimeType?: string;
      mode?: string;
      direction?: 'zh-to-en' | 'en-to-zh';
      inputType: 'text' | 'image' | 'audio';
      detectOnly?: boolean;
    };

    const {
      text,
      imageData,
      imageMimeType,
      audioData,
      audioMimeType,
      mode = 'general',
      direction,
      inputType,
      detectOnly = false,
    } = body;

    // 验证 API 密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 获取翻译器配置
    const config = getTranslatorConfig('chinese-english-translator');
    if (!config) {
      return NextResponse.json(
        { error: 'Translator configuration not found' },
        { status: 500 }
      );
    }

    // 验证输入类型
    if (inputType === 'text' && !text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (inputType === 'image' && (!imageData || !imageMimeType)) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    if (
      inputType === 'image' &&
      !SUPPORTED_IMAGE_TYPES.includes(imageMimeType)
    ) {
      return NextResponse.json(
        {
          error: `Unsupported image type. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (inputType === 'audio' && (!audioData || !audioMimeType)) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // 验证翻译模式
    if (!config.supportedModes[mode]) {
      return NextResponse.json(
        {
          error: `Invalid mode. Available modes: ${Object.keys(config.supportedModes).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 构建翻译请求
    const translationRequest = {
      text,
      imageData,
      imageMimeType,
      audioData,
      audioMimeType,
      translator: config.id,
      mode,
      direction,
      detectOnly,
      inputType,
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
      mode: result.mode,
      modeName:
        config.supportedModes[result.mode].prompt?.split('\n')[0] ||
        result.mode,
      direction: result.metadata?.direction,
      inputType: result.metadata?.inputType || inputType,
      message: 'Translation successful',
    };

    // 添加多模态特定字段
    if (result.metadata?.extractedText) {
      response.extractedText = result.metadata.extractedText;
    }

    if (result.metadata?.transcription) {
      response.transcription = result.metadata.transcription;
    }

    // 添加语言检测信息
    if (result.metadata?.detectedLanguage) {
      response.detectedInputLanguage = result.metadata.detectedLanguage;
      response.confidence = result.metadata.confidence;
      response.autoDetected = result.metadata.autoDetected;

      response.languageInfo = {
        detected: true,
        detectedLanguage:
          result.metadata.detectedLanguage === 'english'
            ? 'English'
            : result.metadata.detectedLanguage === 'chinese'
              ? 'Chinese'
              : 'Unknown',
        direction:
          result.metadata.direction === 'zh-to-en'
            ? 'Chinese → English'
            : 'English → Chinese',
        confidence: Math.round((result.metadata.confidence || 0) * 100),
        explanation:
          result.metadata.direction === 'zh-to-en'
            ? result.metadata.autoDetected
              ? 'Auto-detected Chinese input, translated to English'
              : `Manual translation: Chinese → English`
            : result.metadata.autoDetected
              ? 'Auto-detected English input, translated to Chinese'
              : `Manual translation: English → Chinese`,
      };
    }

    // 处理仅检测语言的情况
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: result.metadata?.detectedLanguage,
        detectedDirection: result.metadata?.direction,
        confidence: result.metadata?.confidence,
        autoDetected: true,
        languageInfo: response.languageInfo,
      });
    }

    return NextResponse.json(response);
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
