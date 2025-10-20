import {
  generateSitemapXML,
  getSitemapConfig,
} from '@/lib/seo/sitemap-generator';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * 动态生成 sitemap.xml
 * GET /api/sitemap.xml
 */
export async function GET(request: NextRequest) {
  try {
    const config = getSitemapConfig();
    const sitemap = generateSitemapXML(config);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1小时缓存，CDN 24小时缓存
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);

    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
