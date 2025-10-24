#!/usr/bin/env node

/**
 * Generate missing Wingdings Translator images
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import sharp from 'sharp';
import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

// Load environment variables
config({ path: '.env.local' });

// 需要生成的缺失图片
const MISSING_IMAGES = [
  {
    title: 'What is Wingdings Translator',
    content: `A Wingdings translator is a tool that converts regular text into Wingdings symbols and vice versa. Wingdings is a symbolic font created by Microsoft that uses various symbols instead of letters, numbers, and punctuation marks. Our translator makes it easy to encode and decode messages using this iconic font.`,
    filename: 'what-is-wingdings-translator',
  },
  {
    title: 'How to Use Wingdings Translator',
    content: `Learn how to convert text to Wingdings symbols in just a few simple steps: Enter your text, click translate, copy the result, and you can also reverse translate Wingdings back to regular text.`,
    filename: 'wingdings-translator-how-to',
  },
  {
    title: 'Wingdings Symbol Gallery',
    content: `Explore our complete Wingdings symbol gallery to see every available character and its corresponding symbol. Perfect for finding the right symbol for your message.`,
    filename: 'wingdings-translator-interest-1',
  },
  {
    title: 'Wingdings Font Compatibility',
    content: `Learn about font compatibility issues with Wingdings and how to ensure your symbols display correctly across different devices and platforms.`,
    filename: 'wingdings-translator-interest-2',
  },
  {
    title: 'Unicode Alternatives',
    content: `Find modern Unicode alternatives to Wingdings symbols for better web compatibility and accessibility.`,
    filename: 'wingdings-translator-interest-4',
  },
];

// 火山4.0 API函数
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

// 下载并转换图片为WebP
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

  // 确保输出目录存在
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Convert to WebP with optimization for 90kb target and 4:3 aspect ratio
  await sharp(buffer)
    .resize(1200, 900, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 75,
      effort: 6,
      method: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

async function generateMissingWingdingsImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Generating Missing Wingdings Translator Images');
  console.log('='.repeat(70) + '\n');

  const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

  // 确保输出目录存在
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const image of MISSING_IMAGES) {
    console.log(`\n🎯 Processing: ${image.title}`);
    console.log('-'.repeat(50));

    try {
      // Step 1: 使用 Gemini 生成新 prompt
      console.log('📋 Step 1: Generating new prompt with Gemini...');
      const { prompt: newPrompt } = await testGeneratePrompt(
        `Wingdings Translator - ${image.title}`,
        image.content
      );
      console.log(`✅ Generated new prompt (${newPrompt.length} chars)`);
      console.log(`📝 New: ${newPrompt.substring(0, 100)}...\n`);

      // Step 2: 生成图片
      console.log('📋 Step 2: Generating image with Volcano 4.0 API...');
      const imageResult = await generateImageWithVolcano(newPrompt);
      console.log(`✅ Image generated: ${imageResult.url}\n`);

      // Step 3: 下载并转换为 WebP
      console.log('📋 Step 3: Downloading and converting to WebP...');
      const outputPath = path.join(OUTPUT_DIR, `${image.filename}.webp`);
      await downloadAndConvertImage(imageResult.url, outputPath);

      console.log('\n' + '-'.repeat(50));
      console.log(`✅ Success: ${image.filename}.webp`);
      console.log(`📁 Location: public/images/docs/${image.filename}.webp`);
      console.log('-'.repeat(50) + '\n');
    } catch (error: any) {
      console.error(
        `\n❌ Failed to generate image for ${image.title}: ${error.message}\n`
      );
      // 继续处理下一个部分，不中断整个流程
    }

    // 添加延迟以避免速率限制
    if (MISSING_IMAGES.indexOf(image) < MISSING_IMAGES.length - 1) {
      console.log(`⏱️  Waiting 3 seconds before next request...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 All missing images processed!');
  console.log('='.repeat(70) + '\n');
}

generateMissingWingdingsImages().catch(console.error);
