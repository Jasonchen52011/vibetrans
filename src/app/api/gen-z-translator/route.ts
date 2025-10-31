import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function transformText(text: string): string {
  let result = text;

  // 常用俚语替换
  result = result.replace(/\bgood\b/gi, 'bet');
  result = result.replace(/\byes\b/gi, 'bet');
  result = result.replace(/\bno\b/gi, 'nah');
  result = result.replace(/\bcrazy\b/gi, 'wild');
  result = result.replace(/\bcool\b/gi, 'dope');
  result = result.replace(/\bawesome\b/gi, 'fire');
  result = result.replace(/\bgreat\b/gi, 'slay');
  result = result.replace(/\bbad\b/gi, 'sus');
  result = result.replace(/\bweird\b/gi, 'sus');
  result = result.replace(/\bcringe\b/gi, 'cringe');
  result = result.replace(/\bvery good\b/gi, 'its giving');
  result = result.replace(/\bamazing\b/gi, 'its giving');
  result = result.replace(/\bperfect\b/gi, 'ate');
  result = result.replace(/\bdid well\b/gi, 'ate');
  result = result.replace(/\bdon't care\b/gi, 'iykyk');
  result = result.replace(/\bwhatever\b/gi, 'iykyk');

  // 句子结构变化
  result = result.replace(/\bI think\b/gi, 'lowkey');
  result = result.replace(/\bI feel like\b/gi, 'lowkey');
  result = result.replace(/\bhonestly\b/gi, 'no cap');
  result = result.replace(/\bfor real\b/gi, 'no cap');
  result = result.replace(/\bliterally\b/gi, 'fr');
  result = result.replace(/\bactually\b/gi, 'deadass');
  result = result.replace(/\bseriously\b/gi, 'deadass');

  // 缩写和网络用语
  result = result.replace(/\bto be honest\b/gi, 'tbh');
  result = result.replace(/\bI don't know\b/gi, 'idk');
  result = result.replace(/\bI don't care\b/gi, 'idc');
  result = result.replace(/\byou know what I mean\b/gi, 'iykyk');
  result = result.replace(/\bas hell\b/gi, 'af');
  result = result.replace(/\bto be fair\b/gi, 'tbf');

  // 形容词强化
  result = result.replace(/\bvery\b/gi, 'hella');
  result = result.replace(/\breally\b/gi, 'hella');

  // Gen Z 特有表达
  result = result.replace(/\bgiving\b/gi, 'its giving');
  result = result.replace(/\bmake sense\b/gi, 'it makes sense');
  result = result.replace(/\bthe vibe\b/gi, 'the vibe');
  result = result.replace(/\bvibes\b/gi, 'vibes');
  result = result.replace(/\bslay\b/gi, 'slay');
  result = result.replace(/\bperiod\b/gi, 'periodt');

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
    service: 'Gen Z Translator API',
    description: 'Text transformation service',
    features: [
      'Rule-based text transformation',
      'Customizable options',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}