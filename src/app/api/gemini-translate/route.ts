import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 简单的Gemini翻译API
 * 直接将用户输入发送给Gemini Flash 2.0处理
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key configuration' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, prompt, systemInstruction } = body;

    if (!text && !prompt) {
      return NextResponse.json(
        { error: 'Text or prompt is required' },
        { status: 400 }
      );
    }

    // 初始化Gemini Flash 2.0
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40,
      },
    });

    // 构建完整的提示词
    let fullPrompt = '';
    if (systemInstruction) {
      fullPrompt += `${systemInstruction}\n\n`;
    }
    if (prompt) {
      fullPrompt += `${prompt}\n\n`;
    }
    fullPrompt += `输入：${text || prompt}\n\n请直接处理上述内容并返回结果：`;

    // 调用Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text().trim();

    return NextResponse.json({
      success: true,
      input: text || prompt,
      output: response,
      model: 'gemini-2.0-flash',
      timestamp: new Date().toISOString(),
      usage: {
        totalTokens: result.response.usageMetadata?.totalTokenCount,
        promptTokens: result.response.usageMetadata?.promptTokenCount,
        candidatesTokens: result.response.usageMetadata?.candidatesTokenCount,
      },
    });
  } catch (error: any) {
    console.error('Gemini translation error:', error);

    // 处理API错误
    if (error.message.includes('API key')) {
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

    if (error.message.includes('content')) {
      return NextResponse.json(
        { error: 'Content policy violation. Please modify your input.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Translation failed',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * 健康检查
 */
export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing API key configuration',
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 简单测试
    const result = await model.generateContent('Hello');

    return NextResponse.json({
      status: 'healthy',
      message: 'Gemini Flash 2.0 API is accessible',
      model: 'gemini-2.0-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Gemini API is not accessible',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

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
