import { TranslationService } from '@/lib/ai-base/translation-service';
import { japaneseTranslatorConfig } from '@/lib/ai-base/translator-configs';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Handle GET method for health checks and config info
export async function GET() {
  try {
    const healthStatus = await TranslationService.healthCheck(
      'japanese-to-english-translator'
    );
    return NextResponse.json({
      ...healthStatus,
      api: 'Japanese-English Translator',
      config: {
        id: japaneseTranslatorConfig.id,
        name: japaneseTranslatorConfig.name,
        type: japaneseTranslatorConfig.type,
        supportedDirections: japaneseTranslatorConfig.supportedDirections,
        supportedModes: Object.keys(japaneseTranslatorConfig.supportedModes),
        defaultMode: japaneseTranslatorConfig.defaultMode,
        creditCost: japaneseTranslatorConfig.creditCost,
      },
      examples: {
        jaToEn: {
          input: 'こんにちは、元気ですか？',
          output: 'Hello, how are you?',
        },
        enToJa: {
          input: 'Good morning!',
          output: 'おはようございます！',
        },
      },
      modeDescriptions: {
        general: 'General translation for everyday use',
        business:
          'Professional business communication with appropriate honorifics',
        literary: 'Literary and poetic translation preserving artistic style',
        technical:
          'Technical and academic translation with precise terminology',
        casual: 'Natural, conversational translation like native speakers',
      },
      timestamp: new Date().toISOString(),
      methods: ['GET', 'POST', 'OPTIONS'],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Japanese-English Translator API error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
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
    const body = (await request.json()) as {
      text: string;
      direction?: 'ja-to-en' | 'en-to-ja';
      mode?: string;
      detectOnly?: boolean;
    };

    const {
      text,
      direction,
      mode = japaneseTranslatorConfig.defaultMode,
      detectOnly = false,
    } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 验证模式是否支持
    if (!japaneseTranslatorConfig.supportedModes[mode]) {
      return NextResponse.json(
        {
          error: `Unsupported mode: ${mode}`,
          supportedModes: Object.keys(japaneseTranslatorConfig.supportedModes),
        },
        { status: 400 }
      );
    }

    // 验证方向是否支持
    if (
      direction &&
      !japaneseTranslatorConfig.supportedDirections?.includes(direction)
    ) {
      return NextResponse.json(
        {
          error: `Unsupported direction: ${direction}`,
          supportedDirections: japaneseTranslatorConfig.supportedDirections,
        },
        { status: 400 }
      );
    }

    // 构建翻译请求
    const translationRequest = {
      text,
      translator: 'japanese-to-english-translator',
      mode,
      direction,
      detectOnly,
    };

    // 调用翻译服务
    const result = await TranslationService.translate(translationRequest);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: result.metadata?.detectedLanguage,
        detectedDirection: result.metadata?.direction,
        confidence: result.metadata?.confidence || 0,
        autoDetected: result.metadata?.autoDetected || false,
        languageInfo: {
          detected: true,
          detectedLanguage: getLanguageDisplayName(
            result.metadata?.detectedLanguage
          ),
          direction: getDirectionDisplayName(result.metadata?.direction),
          confidence: Math.round((result.metadata?.confidence || 0) * 100),
          explanation: getDetectionExplanation(
            result.metadata?.detectedLanguage,
            result.metadata?.direction,
            !!direction
          ),
        },
      });
    }

    // 返回翻译结果
    return NextResponse.json({
      translated: result.translated,
      original: result.original,
      direction: result.metadata?.direction,
      mode: result.mode,
      detectedInputLanguage: result.metadata?.detectedLanguage,
      confidence: result.metadata?.confidence,
      autoDetected: result.metadata?.autoDetected,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage: getLanguageDisplayName(
          result.metadata?.detectedLanguage
        ),
        direction: getDirectionDisplayName(result.metadata?.direction),
        confidence: Math.round((result.metadata?.confidence || 0) * 100),
        explanation: getDetectionExplanation(
          result.metadata?.detectedLanguage,
          result.metadata?.direction,
          !!direction
        ),
      },
      metadata: {
        model: result.metadata?.model,
        tokensUsed: result.metadata?.tokensUsed,
        processingTime: result.metadata?.processingTime,
        mode: result.mode,
        creditCost: japaneseTranslatorConfig.creditCost,
      },
      translator: {
        name: japaneseTranslatorConfig.name,
        type: japaneseTranslatorConfig.type,
        bidirectional: japaneseTranslatorConfig.bidirectional,
        supportedModes: Object.keys(japaneseTranslatorConfig.supportedModes),
      },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}

// 辅助函数
function getLanguageDisplayName(language?: string): string {
  const languageMap: Record<string, string> = {
    english: 'English',
    cantonese: 'Cantonese',
    chinese: 'Chinese',
    japanese: 'Japanese',
  };
  return languageMap[language || ''] || 'Unknown';
}

function getDirectionDisplayName(direction?: string): string {
  const directionMap: Record<string, string> = {
    'yue-to-en': 'Cantonese → English',
    'en-to-yue': 'English → Cantonese',
    'ja-to-en': 'Japanese → English',
    'en-to-ja': 'English → Japanese',
    'zh-to-en': 'Chinese → English',
    'en-to-zh': 'English → Chinese',
  };
  return directionMap[direction || ''] || direction || 'Unknown';
}

function getDetectionExplanation(
  detectedLanguage?: string,
  direction?: string,
  manualOverride?: boolean
): string {
  if (manualOverride) {
    return `Manual translation: ${getDirectionDisplayName(direction)}`;
  }

  if (detectedLanguage === 'english') {
    return `Auto-detected English input, translated to ${getLanguageNameFromDirection(direction)}`;
  } else if (detectedLanguage) {
    return `Auto-detected ${getLanguageDisplayName(detectedLanguage)} input, translated to English`;
  }

  return 'Translation completed';
}

function getLanguageNameFromDirection(direction?: string): string {
  if (direction?.includes('to-cantonese') || direction?.includes('to-yue'))
    return 'Cantonese';
  if (direction?.includes('to-japanese') || direction?.includes('to-ja'))
    return 'Japanese';
  if (direction?.includes('to-chinese') || direction?.includes('to-zh'))
    return 'Chinese';
  return 'English';
}
