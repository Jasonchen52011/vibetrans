import { createClient } from '@/lib/supabase/server';
import { consumeCredits, hasEnoughCredits } from '@/credits/credits';
import { getDb } from '@/db';
import { generationHistory } from '@/db/schema';
import { getUser } from '@/lib/server';
import { DEFAULT_VIDEO_COST, generateVideo } from '@/lib/veo';
import { type NextRequest, NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = (await req.json()) as {
      prompt?: string;
      imageUrl?: string;
      imageMimeType?: string;
      resolution?: '720p' | '1080p';
      aspectRatio?: '16:9' | '9:16';
      model?: 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001';
    };
    const {
      prompt,
      imageUrl,
      imageMimeType,
      resolution = '720p',
      aspectRatio = '16:9',
      model,
    } = body;

    // Validate input
    if (!prompt && !imageUrl) {
      return NextResponse.json(
        { error: 'Either prompt or imageUrl is required' },
        { status: 400 }
      );
    }

    // Check if user has enough credits (skip in development)
    const creditsNeeded = DEFAULT_VIDEO_COST; // 600 credits

    if (!isDevelopment) {
      const hasCredits = await hasEnoughCredits({
        userId,
        requiredCredits: creditsNeeded,
      });

      if (!hasCredits) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            creditsNeeded,
          },
          { status: 402 }
        );
      }
    }

    // Generate unique ID for this generation
    const historyId = `vid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create generation history entry and consume credits (skip in development)
    if (!isDevelopment) {
      const db = await getDb();
      await db.insert(generationHistory).values({
        id: historyId,
        userId,
        type: 'video',
        prompt: prompt || 'Image to video generation',
        imageUrl,
        status: 'pending',
        creditsUsed: creditsNeeded,
        metadata: JSON.stringify({
          resolution,
          aspectRatio,
          model,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Consume credits
      try {
        await consumeCredits({
          userId,
          amount: creditsNeeded,
          description: `Video generation: ${historyId}`,
        });
      } catch (error) {
        // If credit deduction fails, mark generation as failed
        await db
          .update(generationHistory)
          .set({
            status: 'failed',
            error: 'Failed to deduct credits',
            updatedAt: new Date(),
          })
          .where(eq(generationHistory.id, historyId));

        return NextResponse.json(
          {
            error: 'Failed to deduct credits',
          },
          { status: 500 }
        );
      }
    }

    // Start video generation
    try {
      const result = await generateVideo({
        prompt: prompt || '',
        imageUrl,
        imageMimeType,
        resolution,
        aspectRatio,
        model,
      });

      // Update history with task ID (skip in development)
      if (!isDevelopment) {
        const db = await getDb();
        await db
          .update(generationHistory)
          .set({
            status: 'processing',
            taskId: result.taskId,
            updatedAt: new Date(),
          })
          .where(eq(generationHistory.id, historyId));
      }

      // Get updated credits balance (return 999999 in development)
      let remainingCredits = 999999;
      if (!isDevelopment) {
        const { getUserCredits } = await import('@/credits/credits');
        remainingCredits = await getUserCredits(userId);
      }

      return NextResponse.json({
        id: historyId,
        taskId: result.taskId,
        status: result.status,
        message: result.message,
        remainingCredits,
      });
    } catch (genError: any) {
      // If generation fails, mark as failed (skip in development)
      if (!isDevelopment) {
        const db = await getDb();
        await db
          .update(generationHistory)
          .set({
            status: 'failed',
            error: genError.message || 'Video generation failed',
            updatedAt: new Date(),
          })
          .where(eq(generationHistory.id, historyId));
      }

      throw genError;
    }
  } catch (error: any) {
    console.error('Video generation API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate video',
      },
      { status: 500 }
    );
  }
}

// Import eq for database queries
import { eq } from 'drizzle-orm';

// Note: This route uses Node.js runtime because it imports @/lib/auth
// which uses better-auth with compatibility issues in Edge Runtime
export const runtime = "nodejs";
