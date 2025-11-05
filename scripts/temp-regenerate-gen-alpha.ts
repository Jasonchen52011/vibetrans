/**
 * Regenerate Gen Alpha Translator images for specific sections
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import sharp from 'sharp';
import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

config({ path: '.env.local' });

async function generateImageWithVolcano(
  prompt: string
): Promise<{ url: string }> {
  try {
    const result = await generateVolcanoImage({
      prompt: prompt,
      mode: 'text',
      size: '2K',
      watermark: false,
    });

    if (result.data && result.data[0] && result.data[0].url) {
      return { url: result.data[0].url };
    } else {
      throw new Error('No image URL in Volcano response');
    }
  } catch (error) {
    throw new Error(`Failed to generate image with Volcano: ${error}`);
  }
}

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

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(buffer)
    .webp({
      quality: 75,
      effort: 6,
      method: 6,
      smartSubsample: true,
    })
    .resize(1200, 900, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

// 只重新生成这两个特定的图片
const SECTIONS = [
  {
    title: 'Decode Gen Alpha Language Easily',
    content: `With VibeTrans, you don't need to guess what Gen Alpha means. Instantly translate new slang and keep up with the latest inside jokes. Perfect for parents, educators, and anyone who wants to understand the unique language of Generation Alpha.`,
    filename: 'understanding-gen-alpha-language',
  },
  {
    title: 'Stay Ahead of Social Media Trends',
    content: `Social platforms update too quickly? Use VibeTrans to convert posts and comments into the latest slang, keeping your interactions always on trend. Never feel left out of the conversation again with real-time Gen Alpha translation.`,
    filename: 'multilingual-gen-alpha-support',
  },
];

async function regenerateGenAlphaImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating Gen Alpha Images (Fun Facts Section)');
  console.log('='.repeat(70) + '\n');

  const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const section of SECTIONS) {
    console.log(`\n🎯 Processing: ${section.title}`);
    console.log('-'.repeat(50));

    try {
      console.log('📋 Step 1: Generating new prompt with Gemini...');
      const { prompt: newPrompt } = await testGeneratePrompt(
        `Gen Alpha Translator - ${section.title}`,
        section.content
      );
      console.log(`✅ Generated new prompt (${newPrompt.length} chars)`);

      console.log('📋 Step 2: Generating image with Volcano 4.0 API...');
      const imageResult = await generateImageWithVolcano(newPrompt);
      console.log(`✅ Image generated: ${imageResult.url}`);

      console.log('📋 Step 3: Downloading and converting to WebP...');
      const outputPath = path.join(OUTPUT_DIR, `${section.filename}.webp`);
      await downloadAndConvertImage(imageResult.url, outputPath);

      console.log(`✅ Success: ${section.filename}.webp`);
    } catch (error: any) {
      console.error(
        `❌ Failed to generate image for ${section.title}: ${error.message}`
      );
    }

    if (SECTIONS.indexOf(section) < SECTIONS.length - 1) {
      console.log(`⏱️  Waiting 3 seconds before next request...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log('\n🎉 All sections processed!');
}

regenerateGenAlphaImages().catch(console.error);
