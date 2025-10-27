import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // TODO: 实现你的翻译逻辑
    // 这里只是一个示例，返回原文
    const translated = text; // 替换为实际的翻译逻辑

    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'Japanese to English translation successful!'
        : 'No translation needed',
      translator: {
        name: 'Japanese to English Translator',
        type: 'bilingual',
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
