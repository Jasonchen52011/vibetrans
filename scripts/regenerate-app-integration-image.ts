#!/usr/bin/env node

/**
 * Regenerate Seamless Integration with Apps image
 */

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

const task = {
  filename: 'cantonese-translator-interest-3.webp',
  description: 'Seamless Integration with Apps - VibeTrans working in WhatsApp and WeChat',
  prompt:
    'A modern communication illustration showing app integration. Visualize smartphone screen with split messaging interface: WhatsApp (green theme) and WeChat (teal theme) both showing VibeTrans seamlessly translating conversations in real-time. Include visual elements: message bubbles with Cantonese text automatically translated to English inline, VibeTrans floating translation widget, instant translation toggle button, keyboard with translation shortcut, multiple chat windows open simultaneously, group chat with multilingual participants, translation speed indicator showing "instant", app integration icons, smooth conversation flow arrows. Color scheme: WhatsApp green, WeChat teal, integration harmony blues, real-time communication purples, user-friendly interface whites and grays. 4:3 aspect ratio.',
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
  console.log('\n🎨 Regenerating: Seamless Integration with Apps\n');
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
