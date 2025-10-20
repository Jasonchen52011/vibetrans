import { seoAutomationManager } from '@/lib/seo/seo-automation';
import {
  getSEOMetrics,
  getSEOStatus,
  performSEOHealthCheck,
} from '@/lib/seo/seo-monitor';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/seo/status - Get comprehensive SEO status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // 'basic', 'health', 'metrics', 'automation'

    let data;

    switch (section) {
      case 'health':
        data = await performSEOHealthCheck();
        break;

      case 'metrics':
        data = await getSEOMetrics();
        break;

      case 'automation':
        data = {
          triggers: seoAutomationManager.getTriggers(),
          logs: seoAutomationManager.getLogs(50),
          stats: seoAutomationManager.getStats(),
        };
        break;

      case 'basic':
      default:
        const [status, health, metrics] = await Promise.all([
          getSEOStatus(),
          performSEOHealthCheck(),
          getSEOMetrics(),
        ]);

        data = {
          status,
          health,
          metrics,
          automation: {
            triggers: seoAutomationManager.getTriggers(),
            stats: seoAutomationManager.getStats(),
          },
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data,
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
