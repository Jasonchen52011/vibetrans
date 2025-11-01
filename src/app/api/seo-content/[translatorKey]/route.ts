import { NextRequest, NextResponse } from 'next/server';
import { loadExtendedTranslation } from '@/lib/translation-split';

export const runtime = 'edge';

/**
 * SEO内容API - 动态提供翻译页面的SEO内容
 * 避免将大量SEO内容打包到服务器bundle中
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ translatorKey: string }> }
) {
  try {
    const { translatorKey } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // 验证translatorKey，防止路径遍历攻击
    const validTranslatorKeys = [
      'minion-translator',
      'drow-translator',
      'mandalorian-translator',
      'gen-z-translator',
      'gen-alpha-translator',
      'bad-translator',
      'gibberish-translator',
      'yoda-translator',
      'pig-latin-translator',
      'ancient-greek-translator',
      'chinese-to-english-translator',
      'english-to-chinese-translator',
      'cantonese-translator',
      'esperanto-translator',
      'greek-translator',
      'dog-translator',
      'baby-translator',
      'dumb-it-down-ai',
      'verbose-generator',
      'alien-text-generator',
      'rune-translator',
      'runic-translator',
      'wingdings-translator',
      'gaster-translator',
      'high-valyrian-translator',
      'al-bhed-translator',
      'aramaic-translator',
      'baybayin-translator',
      'cuneiform-translator',
      'creole-to-english-translator',
      'english-to-amharic-translator',
      'english-to-persian-translator',
      'english-to-polish-translator',
      'english-to-swahili-translator',
      'ivr-translator',
      'japanese-to-english-translator',
      'manga-translator',
      'middle-english-translator',
      'nahuatl-translator',
      'ogham-translator',
      'samoan-to-english-translator',
      'swahili-to-english-translator',
      'telugu-to-english-translator',
    ];

    if (!validTranslatorKeys.includes(translatorKey)) {
      return NextResponse.json(
        { error: 'Invalid translator key' },
        { status: 400 }
      );
    }

    // 验证locale
    const validLocales = ['en', 'zh'];
    if (!validLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    // 加载扩展翻译内容
    const extendedContent = await loadExtendedTranslation(translatorKey, locale);

    // 设置缓存头
    const response = NextResponse.json(extendedContent);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.headers.set('CDN-Cache-Control', 'public, max-age=3600');

    return response;
  } catch (error) {
    console.error('SEO content API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to load SEO content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}