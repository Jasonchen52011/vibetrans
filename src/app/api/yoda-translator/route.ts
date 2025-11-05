import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Yoda说话风格的转换规则
const transformationRules = [
  // 基础倒装：主语动词倒置 (更加精确的匹配)
  // "I will go" -> "Go, I will"
  [/^(\w+)\s+(will|shall|can|should|must)\s+(\w+)(.*)$/gim, '$3, $1 $2$4'],

  // "I am going" -> "Going, I am"
  [/^(\w+)\s+(am|is|are)\s+(\w+ing)(.*)$/gim, '$3, $1 $2$4'],

  // "You are [形容词]" -> "[形容词], you are"
  [/(\bYou\s+are\s+)(\w+)(.*)$/gim, '$2, you are$3'],

  // Yoda特有的词汇替换
  [/\byes\b/gi, 'Yes, yes'],
  [/\bno\b/gi, 'No, no'],
  [/\bhello\b/gi, 'Hello, young padawan'],
  [/\bgoodbye\b/gi, 'Goodbye, may the Force be with you'],
  [/\bthank you\b/gi, 'Thank you, I do'],
  [/\bplease\b/gi, 'Please, you must'],

  // 思考动词倒装
  [/\bI (think|believe|feel|know|want|need|hope|wish)\b/gi, '$1 I'],
  [/\bWe (think|believe|feel|know|want|need|hope|wish)\b/gi, '$1 we'],

  // Yoda经典短语
  [/\bVery good\b/gi, 'Good, very good'],
  [/\bVery strong\b/gi, 'Strong, very strong'],
  [/\bVery powerful\b/gi, 'Powerful, very powerful'],
  [/\bThe force is strong with you\b/gi, 'Strong with the Force, you are'],
  [/\bStrong\b/gi, 'Strong with the Force'],
  [/\bPowerful\b/gi, 'Powerful, you are'],
  [/\bWise\b/gi, 'Wise, you have become'],

  // 学习相关短语
  [/\bLearn you must\b/gi, 'Learn, you must'],
  [/\bPractice you should\b/gi, 'Practice, you should'],
  [/\bPatience you must have\b/gi, 'Patience, you must have'],

  // 句末语气词 (添加的概率较低，避免过度使用)
  [
    /([.!?])\s*$/gim,
    (match) => {
      if (Math.random() < 0.3) {
        // 30%概率添加语气词
        const randomEndings = [', hmm.', ', yes.', ', you see.', ', mmm.'];
        const randomEnding =
          randomEndings[Math.floor(Math.random() * randomEndings.length)];
        return randomEnding;
      }
      return match;
    },
  ],

  // 特殊句式转换 - 简单倒装
  [/\bThis is (\w+)\b/gi, '$1, this is'],
  [/\bThat is (\w+)\b/gi, '$1, that is'],

  // 否定句处理
  [/\bI (do not|don't|cannot|can't)\s+(\w+)\b/gi, '$2 I cannot'],
  [/\bYou (do not|don't|cannot|can't)\s+(\w+)\b/gi, '$2 you cannot'],

  // 添加Yoda风格的开头词
  [/^(Hmmm|Yes|No|Indeed)/gim, '$1, yes'],
];

function transformText(text: string): string {
  let result = text;

  transformationRules.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
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
