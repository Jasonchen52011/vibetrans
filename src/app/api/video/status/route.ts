import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/db';
import { generationHistory } from '@/db/schema';
import { getUser } from '@/lib/server';
import { checkVideoStatus } from '@/lib/veo';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// Note: This route uses Node.js runtime because it imports @/lib/auth
// which uses better-auth with compatibility issues in Edge Runtime
export const runtime = "nodejs";


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Authenticate user (skip in development)
    const user = await getUser();

		// In development, allow without auth
		const userId: string = isDevelopment ? user?.id || 'dev-user' : user?.id || '';

		if (!isDevelopment && !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const historyId = searchParams.get('historyId');
    const taskId = searchParams.get('taskId');

    if (!historyId || !taskId) {
      return NextResponse.json(
        { error: 'historyId and taskId are required' },
        { status: 400 }
      );
    }

    // In development, skip database verification
    if (isDevelopment) {
      // Directly check status from Veo API without database
      try {
        const statusResult = await checkVideoStatus(taskId);

        // Convert Google video URL to proxied URL if needed
        let videoUrl = statusResult.videoUrl;
        if (
          videoUrl &&
          videoUrl.includes('generativelanguage.googleapis.com')
        ) {
          videoUrl = `/api/video/proxy?uri=${encodeURIComponent(videoUrl)}`;
        }

        return NextResponse.json({
          id: historyId,
          taskId,
          status: statusResult.status,
          videoUrl,
          error: statusResult.error,
        });
      } catch (error: any) {
        console.error('Error checking video status:', error);
        return NextResponse.json({
          id: historyId,
          taskId,
          status: 'processing',
          message: 'Status check temporarily unavailable',
        });
      }
    }

    // Production: Verify the history entry belongs to the user
    const db = await getDb();
    const history = await db
      .select()
      .from(generationHistory)
      .where(
        and(
          eq(generationHistory.id, historyId),
          eq(generationHistory.userId, userId),
          eq(generationHistory.type, 'video')
        )
      )
      .limit(1);

    if (!history || history.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const record = history[0];

    // If already completed or failed, return cached status
    if (record.status === 'completed' || record.status === 'failed') {
      return NextResponse.json({
        id: historyId,
        taskId: record.taskId,
        status: record.status,
        videoUrl: record.resultUrl,
        error: record.error,
      });
    }

    // Query video generation status from Veo API
    try {
      const statusResult = await checkVideoStatus(taskId);

      // Update database based on status
      if (statusResult.status === 'completed' && statusResult.videoUrl) {
        // Convert Google video URL to proxied URL if needed
        let videoUrl = statusResult.videoUrl;
        if (
          videoUrl &&
          videoUrl.includes('generativelanguage.googleapis.com')
        ) {
          videoUrl = `/api/video/proxy?uri=${encodeURIComponent(videoUrl)}`;
        }

        await db
          .update(generationHistory)
          .set({
            status: 'completed',
            resultUrl: videoUrl,
            updatedAt: new Date(),
          })
          .where(eq(generationHistory.id, historyId));

        return NextResponse.json({
          id: historyId,
          taskId,
          status: 'completed',
          videoUrl,
        });
      } else if (statusResult.status === 'failed') {
        await db
          .update(generationHistory)
          .set({
            status: 'failed',
            error: statusResult.error || 'Video generation failed',
            updatedAt: new Date(),
          })
          .where(eq(generationHistory.id, historyId));

        return NextResponse.json({
          id: historyId,
          taskId,
          status: 'failed',
          error: statusResult.error || 'Video generation failed',
        });
      }

      // Still processing
      return NextResponse.json({
        id: historyId,
        taskId,
        status: 'processing',
      });
    } catch (error: any) {
      console.error('Error checking video status:', error);

      // Don't mark as failed in database, just return processing status
      // so polling can continue
      return NextResponse.json({
        id: historyId,
        taskId,
        status: 'processing',
        message: 'Status check temporarily unavailable',
      });
    }
  } catch (error: any) {
    console.error('Video status API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get video status',
      },
      { status: 500 }
    );
  }
}
