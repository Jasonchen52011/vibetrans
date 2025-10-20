import {
  submitSitemapAction,
  submitToSearchEngineAction,
} from '@/actions/seo/submit-sitemap';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * API endpoint for SEO sitemap submission
 * POST /api/seo/submit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, searchEngine, force, url } = body;

    let result;

    switch (action) {
      case 'all':
        result = await submitSitemapAction({ force });
        break;

      case 'single':
        result = await submitToSearchEngineAction({ searchEngine, url });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Use "all" or "single".',
          },
          { status: 400 }
        );
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('SEO submission API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seo/submit - Get submission status and configuration
 */
export async function GET() {
  try {
    const seoConfig = {
      enabled: process.env.SEO_AUTO_SUBMIT_ENABLED === 'true',
      intervalHours: process.env.SEO_SUBMISSION_INTERVAL_HOURS || '24',
      monitoringEnabled: process.env.SEO_MONITORING_ENABLED === 'true',
      hasBingApiKey: !!process.env.BING_API_KEY,
      hasBingVerificationKey: !!process.env.BING_SITE_VERIFICATION_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      sitemapUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/sitemap.xml`,
    };

    return NextResponse.json({
      success: true,
      config: seoConfig,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('SEO status API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
