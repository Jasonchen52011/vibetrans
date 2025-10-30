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

    return NextResponse.json({ translated });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
