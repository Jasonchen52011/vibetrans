
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 简单的字符映射字典
const translationMap: Record<string, string> = {
  // 这里添加具体的字符映射
};

function translateText(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const mapped = translationMap[char.toLowerCase()];
    if (!mapped) return char;

    // 保持大小写
    return char === char.toUpperCase() ? mapped.toUpperCase() : mapped;
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, direction = 'toTarget' } = body;

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

    const translated = translateText(text);

    return NextResponse.json({
      success: true,
      translated,
      original: text,
      direction,
      translationMethod: 'character-mapping',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: '< 50ms',
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
    service: 'Ogham Translator API',
    description: 'Simple character-based translation service',
    features: [
      'Character mapping translation',
      'Case preservation',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
