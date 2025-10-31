
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 转换规则
const transformationRules = [
  // 这里添加具体的转换规则
];

function transformText(text: string): string {
  let result = text;

  transformationRules.forEach(([pattern, replacement]) => {
    result = result.replace(new RegExp(pattern, 'gi'), replacement);
  });

  return result;
}

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

    const transformed = transformText(text);

    return NextResponse.json({
      success: true,
      translated: transformed,
      original: text,
      options,
      translationMethod: 'text-transformation',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: '< 100ms',
        textLength: text.length,
        transformedLength: transformed.length,
      },
    });
  } catch (error) {
    console.error('Transformation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Transformation failed',
        suggestion: 'Please try again'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Pig Latin Translator API',
    description: 'Text transformation service',
    features: [
      'Rule-based text transformation',
      'Customizable options',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
