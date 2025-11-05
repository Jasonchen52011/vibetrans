#!/usr/bin/env node

/**
 * Regenerate IVR Translator images to 4:3 aspect ratio (excluding how-to)
 * Focus on geometric flat design with tech purple and blue theme
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

// Load environment variables
config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

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

  // Convert to WebP with optimization for under 100KB target, 4:3 aspect ratio
  await sharp(buffer)
    .webp({
      quality: 70,
      effort: 6,
      method: 6,
      smartSubsample: true,
    })
    .resize(1600, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);

  // Check file size
  const stats = await fs.stat(outputPath);
  const fileSizeKB = Math.round(stats.size / 1024);

  console.log(
    `✅ Image saved and converted to WebP: ${outputPath} (${fileSizeKB}KB, 4:3 ratio)`
  );

  if (fileSizeKB > 100) {
    console.warn(`⚠️  Warning: File size ${fileSizeKB}KB exceeds 100KB target`);
  }
}

// IVR Translator images to regenerate (excluding how-to)
const imageTasks = [
  {
    filename: 'what-is-ivr-translator.webp',
    description:
      'What is IVR Translator - Voice-to-text conversion tool visualization',
    prompt:
      'Modern geometric flat design with tech purple and blue gradient theme, telephone and headset icons represented by geometric shapes, sound waves connecting to text elements, clean vector art style showing IVR technology, microphone and speech bubbles with geometric patterns, modern tech illustration with futuristic aesthetic, clean educational infographic suitable for telecom and customer service technology, professional design with clear visual hierarchy, 4:3 aspect ratio.',
  },
  {
    filename: 'ivr-translator-interest-2.webp',
    description:
      'Increased Accessibility - Accessibility and inclusivity visualization',
    prompt:
      'Geometric flat design with tech purple and blue theme, accessibility icons and inclusive symbols represented by geometric shapes, diverse communication patterns using geometric elements, clean educational infographic showing accessibility features, modern tech illustration with inclusive design principles, professional visualization suitable for accessibility technology, clean vector art with warm and welcoming aesthetic, 4:3 aspect ratio.',
  },
  {
    filename: 'ivr-translator-interest-3.webp',
    description:
      'Efficiency Gains - Customer service optimization visualization',
    prompt:
      'Modern geometric flat design with tech purple and blue colors, efficiency and speed icons represented by geometric shapes, time-saving elements using circular patterns, clean business visualization with performance metrics, modern tech illustration showing operational efficiency, professional design suitable for customer service optimization, clean vector art with dynamic motion elements, streamlined workflow patterns using geometric connections, 4:3 aspect ratio.',
  },
  {
    filename: 'ivr-translator-interest-4.webp',
    description:
      'Seamless Integration - System integration compatibility visualization',
    prompt:
      'Geometric flat design with tech purple and blue theme, system integration icons and API connections represented by geometric shapes, clean tech visualization showing software compatibility, modern integration patterns using geometric connections, professional illustration suitable for enterprise systems, clean vector art with modular design elements, seamless workflow visualization using interconnected geometric components, 4:3 aspect ratio.',
  },
  {
    filename: 'ivr-translator-fact-1.webp',
    description:
      'The Number Mix-Up - Number pronunciation challenge visualization',
    prompt:
      'Geometric flat design with tech purple and blue theme, number confusion visualization with Arabic and English numerals, speech bubbles showing number interpretation challenges, clean educational infographic about voice recognition quirks, modern tech illustration with language learning elements, geometric patterns representing cross-cultural communication challenges, professional design suitable for language technology education, 4:3 aspect ratio.',
  },
  {
    filename: 'ivr-translator-fact-2.webp',
    description:
      'French Length Challenge - Language length comparison visualization',
    prompt:
      'Modern geometric flat design with tech purple and blue colors, language length comparison using bar graphs and geometric shapes, French and English text length differences illustrated visually, clean educational infographic showing translation optimization, modern tech visualization with language metrics, professional design suitable for translation technology, geometric patterns representing linguistic efficiency, 4:3 aspect ratio.',
  },
];

async function regenerateAllImages() {
  console.log(
    '\n🎨 Starting IVR Translator image regeneration to 4:3 aspect ratio...\n'
  );
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
  console.log(
    `🔧 Style: Geometric flat design, tech purple and blue theme, 4:3 aspect ratio\n`
  );
  console.log(`📋 Excluding: how-to image (already processed)\n`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageTasks.length; i++) {
    const task = imageTasks[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🖼️  Image ${i + 1}/${imageTasks.length}: ${task.filename}`);
    console.log(`📝 Description: ${task.description}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      console.log(`🌋 [Volcano 4.0] Generating image: ${task.filename}...`);
      console.log(`📝 Prompt: ${task.prompt.substring(0, 100)}...`);

      const result = await generateVolcanoImage({
        prompt: task.prompt,
        mode: 'text',
        size: '2K',
        watermark: false,
      });

      const imageUrl = result.data[0].url;
      console.log(`\n🔗 Generated URL: ${imageUrl}`);
      if (result.data[0].revised_prompt) {
        console.log(
          `📄 Revised prompt: ${result.data[0].revised_prompt.substring(0, 100)}...`
        );
      }
      console.log(`🤖 Model used: Volcano 4.0`);

      // Download and convert to WebP
      const outputPath = path.join(OUTPUT_DIR, task.filename);
      await downloadAndConvertImage(imageUrl, outputPath);

      successCount++;
      console.log(`\n✅ Successfully regenerated: ${task.filename}`);
    } catch (error: any) {
      failCount++;
      console.error(
        `\n❌ Failed to regenerate ${task.filename}:`,
        error.message
      );

      // Continue with next image instead of stopping
      console.log(`🔄 Continuing with next image...`);
    }

    // Add delay between requests to avoid rate limiting
    if (i < imageTasks.length - 1) {
      console.log(`⏱️  Waiting 3 seconds before next request...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 REGENERATION SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Success: ${successCount}/${imageTasks.length}`);
  console.log(`❌ Failed: ${failCount}/${imageTasks.length}`);
  console.log(`📂 Output directory: ${OUTPUT_DIR}`);
  console.log(`📏 Aspect ratio: 4:3 for all images`);
  console.log(`${'='.repeat(80)}\n`);

  if (failCount > 0) {
    console.warn(`⚠️  Some images failed to regenerate. Please retry manually.`);
    process.exit(1);
  } else {
    console.log(
      `🎉 All images regenerated successfully with 4:3 aspect ratio!`
    );
    console.log(
      `🌐 Visit http://localhost:3001/ivr-translator to see the updated images!`
    );
  }
}

// Run the generator
regenerateAllImages().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
