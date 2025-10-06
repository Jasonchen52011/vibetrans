/**
 * Google Veo 3 API Wrapper
 * Documentation: https://ai.google.dev/gemini-api/docs/video
 */

import { google } from '@ai-sdk/google';

// Veo 3 Models
export const VEO_MODELS = {
  STANDARD: 'veo-3.0-generate-001',
  FAST: 'veo-3.0-fast-generate-001',
} as const;

export type VeoModel = (typeof VEO_MODELS)[keyof typeof VEO_MODELS];

export interface VeoGenerateOptions {
  prompt: string;
  model?: VeoModel;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16';
  imageUrl?: string; // base64 encoded image for image-to-video
  imageMimeType?: string; // MIME type of the image (e.g., 'image/jpeg')
  negativePrompt?: string;
}

export interface VeoGenerateResult {
  taskId: string;
  status: 'pending' | 'processing';
  message: string;
}

export interface VeoStatusResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

/**
 * Generate video with Veo 3
 */
export async function generateVideo(
  options: VeoGenerateOptions
): Promise<VeoGenerateResult> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
    }

    const model = options.model || VEO_MODELS.STANDARD;

    console.log('Veo generate video request:', {
      model,
      prompt: options.prompt,
      resolution: options.resolution,
      aspectRatio: options.aspectRatio,
      hasImage: !!options.imageUrl,
    });

    // Real API call to Google Veo 3
    const requestBody: any = {
      instances: [
        {
          prompt: options.prompt,
        },
      ],
      parameters: {
        aspectRatio: options.aspectRatio || '16:9',
      },
    };

    // Add negative prompt if provided
    if (options.negativePrompt) {
      requestBody.parameters.negativePrompt = options.negativePrompt;
    }

    // Add image for image-to-video generation
    if (options.imageUrl && options.imageMimeType) {
      requestBody.instances[0].image = {
        bytesBase64Encoded: options.imageUrl,
        mimeType: options.imageMimeType,
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as {
        error?: { message?: string };
      };
      console.error('Veo API error:', errorData);
      throw new Error(
        errorData.error?.message || `API request failed: ${response.status}`
      );
    }

    const data = (await response.json()) as { name?: string };
    console.log('Veo API response:', data);

    // Extract operation name (task ID) from response
    const taskId =
      data.name ||
      `veo_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      taskId,
      status: 'processing',
      message: 'Video generation started',
    };
  } catch (error) {
    console.error('Veo generate video error:', error);
    throw error;
  }
}

/**
 * Check video generation status with retry logic
 */
export async function checkVideoStatus(
  taskId: string,
  retries = 3
): Promise<VeoStatusResult> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
  }

  console.log('Checking video status for task:', taskId);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Real API call to check operation status
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${taskId}`,
        {
          headers: {
            'x-goog-api-key': apiKey,
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        const errorData = (await response.json()) as {
          error?: { message?: string };
        };
        console.error('Veo status check error:', errorData);
        throw new Error(
          errorData.error?.message || `Status check failed: ${response.status}`
        );
      }

      const data = (await response.json()) as {
        done?: boolean;
        error?: { message?: string };
        response?: {
          generateVideoResponse?: {
            raiMediaFilteredCount?: number;
            raiMediaFilteredReasons?: Array<string | { message?: string }>;
            generatedSamples?: Array<{
              video?: {
                uri?: string;
              };
            }>;
          };
        };
      };
      console.log('Veo status response:', data);

      // Check if operation is done
      if (data.done) {
        if (data.error) {
          return {
            taskId,
            status: 'failed',
            error: data.error.message || 'Video generation failed',
          };
        }

        // Check for RAI filtering (content blocked by safety filters)
        const generateVideoResponse = data.response?.generateVideoResponse;
        if (
          generateVideoResponse &&
          generateVideoResponse.raiMediaFilteredCount &&
          generateVideoResponse.raiMediaFilteredCount > 0
        ) {
          const reasons = generateVideoResponse.raiMediaFilteredReasons || [];
          console.error('Video blocked by safety filters:', reasons);

          // Extract more specific error message if available
          let errorMessage = 'Content blocked by safety filters.';
          if (reasons.length > 0) {
            const reason = reasons[0];
            if (typeof reason === 'string') {
              errorMessage = reason;
            } else if (reason?.message) {
              errorMessage = reason.message;
            }
          }

          return {
            taskId,
            status: 'failed',
            error: errorMessage,
          };
        }

        // Extract video URL from response
        // Path: response.generateVideoResponse.generatedSamples[0].video.uri
        const videoUrl =
          generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

        if (!videoUrl) {
          console.error('No video URL in response:', data.response);
          return {
            taskId,
            status: 'failed',
            error: 'Video generation completed but no video URL returned',
          };
        }

        console.log('Extracted video URL:', videoUrl);

        return {
          taskId,
          status: 'completed',
          videoUrl,
        };
      }

      // Still processing
      return {
        taskId,
        status: 'processing',
      };
    } catch (error) {
      console.error(
        `Veo check status error (attempt ${attempt}/${retries}):`,
        error
      );

      // If this is the last attempt or a non-network error, return processing status
      if (
        attempt === retries ||
        !(error instanceof Error && error.message.includes('fetch'))
      ) {
        return {
          taskId,
          status: 'processing',
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  // Fallback: return processing status
  return {
    taskId,
    status: 'processing',
  };
}

/**
 * Get video generation cost in credits
 * Based on $0.75/second for standard, $0.40/second for fast
 * Assuming 8-second videos and 1 credit = $0.01
 */
export function getVideoCost(model: VeoModel = VEO_MODELS.STANDARD): number {
  const durationSeconds = 8;
  const costPerSecond = model === VEO_MODELS.FAST ? 0.4 : 0.75;
  const totalCost = durationSeconds * costPerSecond;
  // Convert to credits (assuming 1 credit = $0.01)
  return Math.ceil(totalCost * 100); // 600 credits for standard, 320 for fast
}

// Export default cost for standard model
export const DEFAULT_VIDEO_COST = getVideoCost();
