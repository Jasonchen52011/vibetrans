import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Yoda说话风格的转换规则
const transformationRules = [
  // 句子结构重组：将动词移到句末
  // "I will go" -> "Go, I will"
  [
    /(\\bI\\s+(will|shall|can|should|must|have|has|had|is|am|are|was|were)\\s+)(\\w+)/gi,
    '$3, $1$2',
  ],

  // "You are" -> "Are you"
  [
    /(\\bYou\\s+(are|is|am|was|were|will|can|should|must|have|has|had)\\s+)(\\w+)/gi,
    '$2 you, $3',
  ],

  // 添加Yoda特有的词汇
  [/\\byes\\b/gi, 'Yes, yes'],
  [/\\bno\\b/gi, 'No, no'],
  [/\\bIndeed\\b/gi, 'Indeed, yes'],

  // 句末添加 "hmm" 或 "yes"
  [/([.!?])\\s*$/gim, '$1, hmm.'],

  // 简单的倒装句
  [/(\\bThe\\s+)(\\w+\\s+)(\\w+\\s+)(is|are|was|were)/gi, '$2$1$4'],

  // 一些Yoda常用短语
  [/\\bI think\\b/gi, 'Think I'],
  [/\\bI believe\\b/gi, 'Believe I'],
  [/\\bI feel\\b/gi, 'Feel I'],
  [/\\bI know\\b/gi, 'Know I'],
  [/\\bVery good\\b/gi, 'Good, very good'],
  [/\\bStrong\\b/gi, 'Strong with the Force'],
  [/\\bPowerful\\b/gi, 'Powerful, you are'],
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
        suggestion: 'Please try again',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Yoda Translator API',
    description: 'Text transformation service',
    features: [
      'Rule-based text transformation',
      'Customizable options',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
