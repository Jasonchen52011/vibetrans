/**
 * Queue Statistics API
 * Returns current queue statistics for monitoring
 */

import { getGeminiQueueManager } from '@/lib/queue/gemini-queue-manager';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const queueManager = getGeminiQueueManager();
    const stats = queueManager.getStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queue: {
        activeCount: stats.activeCount,
        pendingCount: stats.pendingCount,
        totalProcessed: stats.totalProcessed,
        totalFailed: stats.totalFailed,
        averageProcessingTime: stats.averageProcessingTime,
      },
      health: {
        status: stats.totalFailed === 0 ? 'healthy' : 'degraded',
        successRate:
          stats.totalProcessed > 0
            ? ((stats.totalProcessed - stats.totalFailed) /
                stats.totalProcessed) *
              100
            : 100,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch queue stats',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
