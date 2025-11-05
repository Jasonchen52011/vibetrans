import { minimaxAnthropicClient } from '@/lib/ai/minimax-anthropic';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Minimax Anthropic 翻译 API
 * 基于 Minimax 的 Anthropic 兼容 API 提供翻译服务
 */
export async function POST(request: NextRequest) {
  try {
    // 检查客户端是否可用
    if (!minimaxAnthropicClient) {
      return NextResponse.json(
        { error: 'Minimax Anthropic client not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, prompt, systemInstruction, temperature, maxTokens } = body;

    if (!text && !prompt) {
      return NextResponse.json(
        { error: 'Text or prompt is required' },
        { status: 400 }
      );
    }

    // 调用 Minimax Anthropic API
    const response = await minimaxAnthropicClient.translate({
      text,
      prompt,
      systemInstruction,
      temperature,
      maxTokens,
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Minimax Anthropic translation error:', error);

    // 处理各种错误情况
    let errorMessage = 'Translation service unavailable';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key configuration';
      statusCode = 500;
    } else if (
      error.message?.includes('quota') ||
      error.message?.includes('rate limit')
    ) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message?.includes('content')) {
      errorMessage = 'Content policy violation. Please modify your input.';
      statusCode = 400;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

/**
 * 健康检查端点
 */
export async function GET() {
  try {
    if (!minimaxAnthropicClient) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Minimax Anthropic client not configured',
          config: {
            baseUrl: process.env.MINIMAX_ANTHROPIC_BASE_URL || 'https://api.minimax.io/anthropic',
            model: process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2',
            hasApiKey: !!process.env.MINIMAX_ANTHROPIC_API_KEY,
          },
        },
        { status: 500 }
      );
    }

    // 执行健康检查
    const healthResult = await minimaxAnthropicClient.healthCheck();
    const config = minimaxAnthropicClient.getConfig();

    if (healthResult.status === 'error') {
      return NextResponse.json(
        {
          status: 'error',
          message: healthResult.message,
          config: {
            ...config,
            hasApiKey: !!process.env.MINIMAX_ANTHROPIC_API_KEY,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: healthResult.message,
      service: 'Minimax Anthropic API',
      model: healthResult.model,
      config: {
        ...config,
        hasApiKey: !!process.env.MINIMAX_ANTHROPIC_API_KEY,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Minimax Anthropic health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Minimax Anthropic API health check failed',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        config: {
          baseUrl: process.env.MINIMAX_ANTHROPIC_BASE_URL || 'https://api.minimax.io/anthropic',
          model: process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2',
          hasApiKey: !!process.env.MINIMAX_ANTHROPIC_API_KEY,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS 请求处理 (CORS)
 */
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