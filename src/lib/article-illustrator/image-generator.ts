/**
 * Image Generator - KIE.ai wrapper for article illustrations
 * Default: Seedream 4.0 (bytedance/seedream-v4-text-to-image)
 * Fallback: Google Nano Banana
 */

import {
  generateImageWithSeedream,
  generateImageWithKie,
} from '../kie-text-to-image';

export interface ImageGenerationOptions {
  prompt: string;
  filename: string;
  useFallback?: boolean; // Set to true to use Google Nano Banana instead
}

export interface GeneratedImageData {
  url: string; // HTTP URL
  revisedPrompt?: string;
}

/**
 * Generate image using Seedream 4.0 (DEFAULT) or Google Nano Banana (FALLBACK)
 */
export async function generateIllustration(
  options: ImageGenerationOptions
): Promise<GeneratedImageData> {
  const modelName = options.useFallback ? 'Google Nano Banana' : 'Seedream 4.0';

  console.log(
    `\n🎨 [${modelName}] Generating image for: ${options.filename}...`
  );
  console.log(
    `📝 [${modelName}] Prompt: ${options.prompt.substring(0, 100)}...`
  );

  try {
    let result: { url: string; revisedPrompt?: string };

    if (options.useFallback) {
      // Use Google Nano Banana as fallback
      result = await generateImageWithKie(options.prompt, {
        imageSize: '4:3', // Required 4:3 aspect ratio
        outputFormat: 'png',
      });
    } else {
      // Use Seedream 4.0 as default
      result = await generateImageWithSeedream(options.prompt, {
        imageSize: 'landscape_4_3', // 4:3 aspect ratio
        imageResolution: '2K',
        maxImages: 1,
      });
    }

    console.log(`✅ [${modelName}] Image generated successfully`);

    return {
      url: result.url,
      revisedPrompt: result.revisedPrompt,
    };
  } catch (error: any) {
    console.error(`❌ [${modelName}] Generation failed:`, error.message);

    // Auto-fallback to Google Nano Banana if Seedream fails
    if (!options.useFallback) {
      console.log('🔄 Attempting fallback to Google Nano Banana...');
      try {
        const fallbackResult = await generateImageWithKie(options.prompt, {
          imageSize: '4:3',
          outputFormat: 'png',
        });

        console.log('✅ [Google Nano Banana] Fallback successful');
        return {
          url: fallbackResult.url,
          revisedPrompt: fallbackResult.revisedPrompt,
        };
      } catch (fallbackError: any) {
        console.error(
          `❌ [Google Nano Banana] Fallback also failed:`,
          fallbackError.message
        );
        throw new Error(
          `Both Seedream 4.0 and Google Nano Banana failed: ${error.message}`
        );
      }
    }

    throw new Error(`${modelName} error: ${error.message}`);
  }
}

/**
 * Test helper - generate single image
 */
export async function testGenerateImage(prompt: string): Promise<string> {
  const result = await generateIllustration({
    prompt,
    filename: 'test-image',
  });
  return result.url;
}
