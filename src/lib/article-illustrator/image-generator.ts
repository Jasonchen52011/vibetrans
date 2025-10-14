/**
 * Image Generator - Multi-provider wrapper for article illustrations
 * Priority order: 1. Volcano 4.0, 2. Seedream 4.0, 3. Google Nano Banana, 4. Ideogram v3
 */

import {
  generateImageWithIdeogram,
  generateImageWithKie,
  generateImageWithSeedream,
} from '../kie-text-to-image';
import { generateImage as generateVolcanoImage } from '../volcano-image';

// Load environment variables for script execution
if (typeof process !== 'undefined' && !process.env.NEXT_RUNTIME) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    const fs = require('fs');

    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.parsed) {
        console.log('✅ Loaded .env.local for image generation');
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to load .env.local:', error);
  }
}

export interface ImageGenerationOptions {
  prompt: string;
  filename: string;
  preferredModel?: 'volcano' | 'seedream' | 'ideogram' | 'nanobanana'; // Optional: force specific model
}

export interface GeneratedImageData {
  url: string; // HTTP URL
  revisedPrompt?: string;
  modelUsed?: string; // Track which model was used
  suggestedFilename?: string; // AI-suggested filename based on content understanding (max 5 words)
}

/**
 * Generate image with automatic fallback chain:
 * 1. Volcano 4.0 (DEFAULT) - 🌋 Priority #1
 * 2. Seedream 4.0 (FALLBACK 1) - 🌊 Priority #2
 * 3. Google Nano Banana (FALLBACK 2) - 🍌 Priority #3
 * 4. Ideogram v3 (FALLBACK 3) - 📐 Priority #4 (Last Resort)
 *
 * After generation, suggests a simplified filename (max 5 words) based on content understanding
 */
export async function generateIllustration(
  options: ImageGenerationOptions
): Promise<GeneratedImageData> {
  const models = [
    { name: 'Volcano 4.0', fn: generateWithVolcano },
    { name: 'Seedream 4.0', fn: generateWithSeedream },
    { name: 'Google Nano Banana', fn: generateWithNanobanana },
    { name: 'Ideogram v3', fn: generateWithIdeogram },
  ];

  // If user specifies a preferred model, try that first
  if (options.preferredModel) {
    const modelMap: Record<string, (typeof models)[0]> = {
      volcano: models[0],
      seedream: models[1],
      nanobanana: models[2],
      ideogram: models[3],
    };
    const preferred = modelMap[options.preferredModel];
    if (preferred) {
      models.unshift(preferred);
    }
  }

  let lastError: Error | null = null;

  for (const model of models) {
    console.log(
      `\n🎨 [${model.name}] Generating image for: ${options.filename}...`
    );
    console.log(
      `📝 [${model.name}] Prompt: ${options.prompt.substring(0, 100)}...`
    );

    try {
      const result = await model.fn(options.prompt);
      console.log(`✅ [${model.name}] Image generated successfully`);

      // Generate simplified filename based on prompt understanding (max 5 words)
      const suggestedFilename = generateSimplifiedFilename(options.prompt);
      console.log(`🏷️  Suggested filename: ${suggestedFilename}`);

      return {
        url: result.url,
        revisedPrompt: result.revisedPrompt,
        modelUsed: model.name,
        suggestedFilename,
      };
    } catch (error: any) {
      console.error(`❌ [${model.name}] Generation failed:`, error.message);
      lastError = error;

      // Continue to next model in the chain
      if (models.indexOf(model) < models.length - 1) {
        console.log(`🔄 Attempting fallback to next model...`);
      }
    }
  }

  // All models failed
  throw new Error(
    `All image generation models failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Generate simplified filename based on content understanding
 * Max 5 words, kebab-case format
 */
function generateSimplifiedFilename(prompt: string): string {
  // Extract key concepts from prompt (first sentence or main subject)
  const mainConcept = prompt.split('.')[0].toLowerCase();

  // Extract meaningful words (remove common articles, prepositions)
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'about', 'as', 'into', 'through', 'during',
    'including', 'visualize', 'illustration', 'showing', 'include', 'visual',
    'elements', 'color', 'scheme', 'aspect', 'ratio', 'design'
  ]);

  const words = mainConcept
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 5); // Max 5 words

  return words.join('-') + '.webp';
}

/**
 * Generate with Volcano 4.0 (Priority #1)
 */
async function generateWithVolcano(
  prompt: string
): Promise<{ url: string; revisedPrompt?: string }> {
  const result = await generateVolcanoImage({
    prompt,
    mode: 'text', // Text-to-image mode
    size: '2K', // 2K resolution
    watermark: false,
  });

  return {
    url: result.data[0].url,
    revisedPrompt: result.data[0].revised_prompt || prompt,
  };
}

/**
 * Generate with Seedream 4.0
 */
async function generateWithSeedream(
  prompt: string
): Promise<{ url: string; revisedPrompt?: string }> {
  return await generateImageWithSeedream(prompt, {
    imageSize: 'landscape_4_3', // 4:3 aspect ratio
    imageResolution: '2K',
    maxImages: 1,
  });
}

/**
 * Generate with Ideogram v3
 */
async function generateWithIdeogram(
  prompt: string
): Promise<{ url: string; revisedPrompt?: string }> {
  return await generateImageWithIdeogram(prompt, {
    imageSize: 'landscape_4_3', // 4:3 aspect ratio
    renderingSpeed: 'BALANCED',
    style: 'AUTO',
    expandPrompt: true,
    numImages: '1',
  });
}

/**
 * Generate with Google Nano Banana
 */
async function generateWithNanobanana(
  prompt: string
): Promise<{ url: string; revisedPrompt?: string }> {
  return await generateImageWithKie(prompt, {
    imageSize: '4:3', // Required 4:3 aspect ratio
    outputFormat: 'png',
  });
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
