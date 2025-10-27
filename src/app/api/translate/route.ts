import {
  getAvailableTools,
  getTranslator,
  initializeTranslators,
} from '@/lib/translator/factory';
import type {
  TranslationRequest,
  TranslationResult,
  TranslationTool,
} from '@/lib/translator/types';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 初始化翻译器（仅在模块加载时执行一次）
initializeTranslators();

// 健康检查和工具列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'tools') {
      // 返回所有可用工具
      const tools = await getAvailableTools();
      return NextResponse.json({
        status: 'healthy',
        message: 'Unified Translation API - Tools List',
        timestamp: new Date().toISOString(),
        tools,
        categories: {
          language: tools.filter((t) => t.type === 'language'),
          fictional: tools.filter((t) => t.type === 'fictional'),
          stylistic: tools.filter((t) => t.type === 'stylistic'),
        },
        totalTools: tools.length,
      });
    }

    // 默认健康检查
    return NextResponse.json({
      status: 'healthy',
      message: 'Unified Translation API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        translate: 'POST /api/translate',
        listTools: 'GET /api/translate?action=tools',
      },
      supportedInputTypes: ['text', 'image', 'audio'],
      maxTextLength: 5000,
    });
  } catch (error) {
    console.error('GET request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证API密钥
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 解析请求
    const body: TranslationRequest = await request.json();
    const {
      text,
      tool,
      mode = 'general',
      direction,
      autoDetect = true,
      detectOnly = false,
      inputType = 'text',
    } = body;

    // 验证必需参数
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      );
    }

    if (!tool) {
      return NextResponse.json(
        {
          error:
            'Tool is required. Use GET /api/translate?action=tools to see available tools',
        },
        { status: 400 }
      );
    }

    // 获取翻译器实例
    let translator;
    try {
      translator = await getTranslator(tool);
    } catch (error) {
      return NextResponse.json(
        {
          error: `Tool "${tool}" not found`,
          availableTools: (await getAvailableTools()).map((t) => t.id),
          suggestion:
            'Use GET /api/translate?action=tools to see available tools',
        },
        { status: 404 }
      );
    }

    // 执行翻译
    const result: TranslationResult = await translator.translate({
      text,
      tool,
      mode,
      direction,
      autoDetect,
      detectOnly,
      inputType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);

    // 处理特定错误类型
    if (error.message.includes('Text is required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes('Tool')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (
      error.message.includes('Invalid mode') ||
      error.message.includes('Invalid direction')
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes('too long')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 处理AI API错误
    if (
      error.message.includes('API key') ||
      error.message.includes('configuration')
    ) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (
      error.message.includes('quota') ||
      error.message.includes('rate limit')
    ) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // 通用错误处理
    return NextResponse.json(
      {
        error: 'Translation failed. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// 支持OPTIONS方法用于CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
