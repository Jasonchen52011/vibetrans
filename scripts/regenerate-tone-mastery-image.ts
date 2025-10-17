#!/usr/bin/env node

/**
 * Regenerate Mastering Cantonese Tones image
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

const task = {
  filename: 'cantonese-translator-interest-1.webp',
  description: 'Mastering Cantonese Tones - VibeTrans as personal mentor',
  prompt:
    'An inspiring educational illustration of tone mastery. Visualize friendly AI mentor character (robot or wise teacher) pointing at interactive tone chart with 6-9 levels, student character practicing pronunciation with headphones, tone visualization showing accurate vs. inaccurate attempts. Include visual elements: pronunciation guide with mouth/tongue position diagrams, tone practice ladder from beginner to expert, audio waveform showing correct pitch patterns, achievement badges (bronze/silver/gold) for tone mastery, practice microphone, real-time feedback display, Hong Kong street signs in background showing real-world application. Color scheme: educational blues, achievement golds, mentor-friendly greens, confidence-inspiring purples. 4:3 aspect ratio.',
};

async function downloadAndConvertImage(
  url: string,
  outputPath: string
): Promise<void> {
  console.log(`📥 Downloading image from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await sharp(buffer).webp({ quality: 85, effort: 6 }).toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

async function regenerateImage() {
  console.log('\n🎨 Regenerating: Mastering Cantonese Tones\n');
  console.log(`📝 Description: ${task.description}\n`);

  try {
    const result = await generateIllustration({
      prompt: task.prompt,
      filename: task.filename,
    });

    console.log(`\n🔗 Generated URL: ${result.url}`);
    console.log(`🤖 Model used: ${result.modelUsed}`);

    if (result.suggestedFilename) {
      console.log(`🏷️  Suggested filename: ${result.suggestedFilename}`);
    }

    const finalFilename = result.suggestedFilename || task.filename;
    const outputPath = path.join(OUTPUT_DIR, finalFilename);

    await downloadAndConvertImage(result.url, outputPath);

    console.log(`\n✅ Successfully regenerated: ${finalFilename}`);
  } catch (error: any) {
    console.error(`\n❌ Failed to regenerate:`, error.message);
    process.exit(1);
  }
}

regenerateImage().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
