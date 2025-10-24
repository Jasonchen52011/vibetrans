import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Yoda翻译规则 - 优化版
function translateToYoda(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // 清理文本
  const cleanText = text.trim();
  const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];

  return sentences
    .map((sentence) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return '';

      const words = trimmedSentence.split(/\s+/);
      if (words.length < 2) return trimmedSentence;

      // 获取标点符号
      const punctuation = trimmedSentence.match(/[.!?]$/)?.[0] || null;

      // Yoda标志性词汇
      const yodaPrefixes = ['Hmm', 'Yes', 'Strong', 'Good', 'Patience', 'Master', 'I understand'];
      const randomPrefix = yodaPrefixes[Math.floor(Math.random() * yodaPrefixes.length)];

      return `${randomPrefix}. ${words.join(' ')}${punctuation || '.'}`;
    })
    .join(' ')
    .trim();
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Yoda Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
  });
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 实现Yoda翻译
    const translated = translateToYoda(text);
    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'Yoda speak translation successful!'
        : 'No translation needed',
      translator: {
        name: 'Yoda Translator',
        type: 'stylistic'
      },
      style: 'yoda-speak'
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}