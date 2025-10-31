
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    // 简单的响应逻辑 - 这里可以根据具体页面定制
    const translated = `[Gen Alpha Translator Result] ${text}`;

    return NextResponse.json({
      success: true,
      translated,
      original: text,
      options,
      translationMethod: 'simple-response',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: '< 10ms',
        textLength: text.length,
        translatedLength: translated.length,
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Translation failed',
        suggestion: 'Please try again'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Gen Alpha Translator API',
    description: 'Simple translation response service',
    features: [
      'Basic text processing',
      'Real-time response',
      'Error handling',
    ],
    timestamp: new Date().toISOString(),
  });
}
