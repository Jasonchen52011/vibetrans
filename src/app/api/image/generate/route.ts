import { getSupabaseDb } from '@/lib/supabase/database';
import { consumeCredits, hasEnoughCredits, getUserCredits } from '@/credits/credits-edge';
import { getUser } from '@/lib/server';
import { DEFAULT_IMAGE_COST, generateImage } from '@/lib/volcano-image';
import { type NextRequest, NextResponse } from 'next/server';

// Uses Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';


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
      const supabase = await getSupabaseDb();
      const { error: insertError } = await supabase
        .from('generationHistory')
        .insert({
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
        });

      if (insertError) {
        console.error('Failed to create generation history:', insertError);
        return NextResponse.json(
          { error: 'Failed to create generation history' },
          { status: 500 }
        );
      }

      // Consume credits
      try {
        await consumeCredits({
          userId,
          amount: creditsNeeded,
          description: `Image generation: ${historyId}`,
        });
      } catch (error) {
        // If credit deduction fails, mark generation as failed
        await supabase
          .from('generationHistory')
          .update({
            status: 'failed',
            error: 'Failed to deduct credits',
          })
          .eq('id', historyId);

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
        const supabase = await getSupabaseDb();
        await supabase
          .from('generationHistory')
          .update({
            status: 'completed',
            resultUrl: imageData.url,
          })
          .eq('id', historyId);
      }

      // Get updated credits balance (return 999999 in development)
      let remainingCredits = 999999;
      if (!isDevelopment) {
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
        const supabase = await getSupabaseDb();
        await supabase
          .from('generationHistory')
          .update({
            status: 'failed',
            error: genError.message || 'Image generation failed',
          })
          .eq('id', historyId);
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
