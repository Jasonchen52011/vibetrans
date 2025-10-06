import { consumeCredits, hasEnoughCredits } from '@/credits/credits';
import { getDb } from '@/db';
import { generationHistory } from '@/db/schema';
import { auth } from '@/lib/auth';
import { DEFAULT_IMAGE_COST, generateImage } from '@/lib/volcano-image';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Authenticate user (skip in development)
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // In development, allow without auth
    const userId: string = isDevelopment
      ? session?.user?.id || 'dev-user'
      : session?.user?.id || '';

    if (!isDevelopment && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = (await req.json()) as {
      prompt: string;
      imageUrl: string;
      size?: '1K' | '2K' | '4K' | 'adaptive';
      watermark?: boolean;
    };
    const { prompt, imageUrl, size = 'adaptive', watermark = true } = body;

    // Validate input
    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { error: 'Prompt and reference image are required' },
        { status: 400 }
      );
    }

    // Check if user has enough credits (skip in development)
    const creditsNeeded = DEFAULT_IMAGE_COST; // 20 credits

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
    const historyId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create generation history entry and consume credits (skip in development)
    if (!isDevelopment) {
      const db = await getDb();
      await db.insert(generationHistory).values({
        id: historyId,
        userId,
        type: 'image',
        prompt,
        imageUrl,
        status: 'pending',
        creditsUsed: creditsNeeded,
        metadata: JSON.stringify({
          size,
          watermark,
          sourceImageUrl: imageUrl,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Consume credits
      try {
        await consumeCredits({
          userId,
          amount: creditsNeeded,
          description: `Image generation: ${historyId}`,
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

    // Start image generation
    try {
      const result = await generateImage({
        prompt,
        imageUrl,
        size,
        watermark,
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('No image generated');
      }

      const imageData = result.data[0];

      // Update history with result (skip in development)
      if (!isDevelopment) {
        const db = await getDb();
        await db
          .update(generationHistory)
          .set({
            status: 'completed',
            resultUrl: imageData.url,
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
        url: imageData.url,
        revisedPrompt: imageData.revised_prompt,
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
            error: genError.message || 'Image generation failed',
            updatedAt: new Date(),
          })
          .where(eq(generationHistory.id, historyId));
      }

      throw genError;
    }
  } catch (error: any) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
