/**
 * 重新生成单个Bad Translator图片 - How Accurate is Bad Translator?
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

  // Convert to WebP with optimization
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

async function regenerateSingleImage() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating "How Accurate is Bad Translator?" Image');
  console.log('='.repeat(70) + '\n');

  const section = {
    title: 'How Accurate is Bad Translator?',
    content: `While the translations are intentionally humorous and sometimes absurd, you can expect some fun 'mistakes'! This tool isn't about accuracy—it's all about having a laugh! These translations serve as a great way to spark creativity for memes or social posts.`,
    filename: 'bad-translator-accuracy-concept',
  };

  const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

  try {
    // Step 1: 使用 Gemini 生成新 prompt
    console.log('📋 Step 1: Generating new prompt with Gemini...');
    const { prompt: newPrompt } = await testGeneratePrompt(
      `Bad Translator - ${section.title}`,
      section.content
    );
    console.log(`✅ Generated new prompt (${newPrompt.length} chars)`);
    console.log(`📝 New: ${newPrompt.substring(0, 100)}...\n`);

    // Step 2: 生成图片
    console.log('📋 Step 2: Generating image with Volcano 4.0 API...');
    const imageResult = await generateImageWithVolcano(newPrompt);
    console.log(`✅ Image generated: ${imageResult.url}\n`);

    // Step 3: 下载并转换为 WebP
    console.log('📋 Step 3: Downloading and converting to WebP...');
    const outputPath = path.join(OUTPUT_DIR, `${section.filename}.webp`);
    await downloadAndConvertImage(imageResult.url, outputPath);

    console.log('\n' + '-'.repeat(50));
    console.log(`✅ Success: ${section.filename}.webp`);
    console.log(`📁 Location: public/images/docs/${section.filename}.webp`);
    console.log('-'.repeat(50) + '\n');
  } catch (error: any) {
    console.error(`\n❌ Failed to generate image: ${error.message}\n`);
  }
}

regenerateSingleImage().catch(console.error);
