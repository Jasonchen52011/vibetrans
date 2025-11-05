#!/usr/bin/env node

/**
 * Generate images for Gen Alpha Translator using Volcano 4.0
 * Generates 4 new images for Youth Culture Communication & Social Media Applications section:
 * 1. understanding-gen-alpha-language.webp - "Decode Gen Alpha Language Easily"
 * 2. multilingual-gen-alpha-support.webp - "Stay Ahead of Social Media Trends"
 * 3. gen-alpha-translator-how-to.webp - "A Fun Way to Communicate"
 * 4. what-is-gen-alpha-translator.webp - "Perfect for Parents and Educators"
 * API: Volcano 4.0 with geometric flat design, sky blue background, 4:3 aspect ratio
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

// Load environment variables
config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks for Gen Alpha Translator
const imageTasks = [
  {
    filename: 'understanding-gen-alpha-language.webp',
    description:
      'Decode Gen Alpha Language Easily - Concept diagram about understanding Gen Alpha language',
    prompt:
      'Modern geometric flat design with sky blue background, colorful speech bubbles and communication icons representing Gen Alpha language patterns, simplified geometric shapes showing internet slang and emojis, clean educational illustration with playful elements, speech bubbles containing modern slang terms simplified for understanding, arrows connecting traditional words to Gen Alpha expressions, minimal vector art style with soft pastel colors, professional infographic aesthetic suitable for educational content, 4:3 aspect ratio.',
  },
  {
    filename: 'multilingual-gen-alpha-support.webp',
    description:
      'Stay Ahead of Social Media Trends - Social media trends visualization',
    prompt:
      'Geometric flat design with sky blue background, modern social media platform icons arranged in circular pattern, trending hashtags and memes represented by simplified geometric shapes, upward trending graphs and arrows showing social media growth, colorful digital elements representing online communication, clean vector illustrations of smartphones and devices with social media interfaces, modern tech aesthetic with youthful energy, professional marketing visualization style, 4:3 aspect ratio.',
  },
  {
    filename: 'gen-alpha-translator-how-to.webp',
    description:
      'A Fun Way to Communicate - How-to style guide for Gen Alpha communication',
    prompt:
      'Step-by-step geometric flat design with sky blue background, numbered steps showing how to use Gen Alpha translator, simple icons representing translation process, colorful geometric shapes guiding the eye through each step, modern instructional design with playful elements, clean layout with arrows and visual flow, simplified user interface mockups, friendly and approachable visual style suitable for all ages, infographic how-to guide with clear visual hierarchy, 4:3 aspect ratio.',
  },
  {
    filename: 'what-is-gen-alpha-translator.webp',
    description:
      'Perfect for Parents and Educators - Educational tool for adults',
    prompt:
      'Geometric flat design with sky blue background, diverse group of adult figures (parents and teachers) represented by simplified geometric shapes, educational symbols like books and graduation caps, communication bridges connecting generations, supportive and encouraging visual elements, clean professional illustration style, warm and welcoming color palette with emphasis on sky blue, modern educational technology interface elements, inclusive representation of family and educational settings, 4:3 aspect ratio.',
  },
];

async function downloadAndConvertImage(
  url: string,
  outputPath: string
): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📥 Downloading image from: ${url}`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert to WebP with optimization for under 100KB target
  await sharp(buffer)
    .webp({
      quality: 70,
      effort: 6,
      method: 6,
      smartSubsample: true,
    })
    .resize(1200, 900, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);

  // Check file size
  const stats = await fs.stat(outputPath);
  const fileSizeKB = Math.round(stats.size / 1024);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `✅ Image saved and converted to WebP: ${outputPath} (${fileSizeKB}KB)`
    );
  }

  if (fileSizeKB > 100) {
    console.warn(`⚠️  Warning: File size ${fileSizeKB}KB exceeds 100KB target`);
  }
}

async function generateAllImages() {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '\n🎨 Starting image generation for Gen Alpha Translator (Volcano 4.0)...\n'
    );
    console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
    console.log(
      `🔧 Style: Geometric flat design, sky blue background, 4:3 aspect ratio\n`
    );
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageTasks.length; i++) {
    const task = imageTasks[i];
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🖼️  Image ${i + 1}/${imageTasks.length}: ${task.filename}`);
      console.log(`📝 Description: ${task.description}`);
      console.log(`${'='.repeat(80)}\n`);
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🌋 [Volcano 4.0] Generating image: ${task.filename}...`);
        console.log(`📝 Prompt: ${task.prompt.substring(0, 100)}...`);
      }

      const result = await generateVolcanoImage({
        prompt: task.prompt,
        mode: 'text',
        size: '2K',
        watermark: false,
      });

      const imageUrl = result.data[0].url;
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔗 Generated URL: ${imageUrl}`);
        if (result.data[0].revised_prompt) {
          console.log(
            `📄 Revised prompt: ${result.data[0].revised_prompt.substring(0, 100)}...`
          );
        }
        console.log(`🤖 Model used: Volcano 4.0`);
      }

      // Download and convert to WebP
      const outputPath = path.join(OUTPUT_DIR, task.filename);
      await downloadAndConvertImage(imageUrl, outputPath);

      successCount++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n✅ Successfully generated: ${task.filename}`);
      }
    } catch (error: any) {
      failCount++;
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `\n❌ Failed to generate ${task.filename}:`,
          error.message
        );

        // Continue with next image instead of stopping
        console.log(`🔄 Continuing with next image...`);
      }
    }

    // Add delay between requests to avoid rate limiting
    if (i < imageTasks.length - 1) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️  Waiting 3 seconds before next request...`);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 GENERATION SUMMARY');
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ Success: ${successCount}/${imageTasks.length}`);
    console.log(`❌ Failed: ${failCount}/${imageTasks.length}`);
    console.log(`📂 Output directory: ${OUTPUT_DIR}`);
    console.log(`${'='.repeat(80)}\n`);
  }

  if (failCount > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  Some images failed to generate. Please retry manually.`);
    }
    process.exit(1);
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎉 All images generated successfully!`);
      console.log(
        `🌐 Visit http://localhost:3000/gen-alpha-translator to see the updated images!`
      );
    }
  }
}

// Run the generator
generateAllImages().catch((error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('\n💥 Fatal error:', error);
  }
  process.exit(1);
});
