import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // 直接返回原文，让用户能看到输出区域有内容
    return NextResponse.json({
      translated: text,
      original: text,
      language: 'Polish',
      direction: 'English to Polish',
      provider: 'Direct',
      note: 'Translation feature is currently disabled. Showing original text.',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
