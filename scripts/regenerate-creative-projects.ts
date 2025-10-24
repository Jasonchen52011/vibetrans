/**
 * Regenerate Telugu to English Translator images for specific sections
 * With smart prompt comparison before generation using Volcano 4.0 API
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import sharp from 'sharp';
import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

// Load environment variables
config({ path: '.env.local' });

// 火山4.0 API函数（使用正确的火山引擎库）
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

  // Convert to WebP with optimization for 90kb target
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

// 三个部分的内容配置 - Wingdings Translator
const SECTIONS = [
  {
    title: 'Design Applications',
    content: `Discover creative ways to use Wingdings symbols in graphic design, presentations, and digital art projects. From logos to infographics, Wingdings adds a unique visual element that captures attention and conveys meaning through symbolic representation.`,
    filename: 'wingdings-translator-interest-3',
  },
  {
    title: "Microsoft's Creation",
    content: `Wingdings was created by Microsoft in 1990 as part of the Windows 3.1 operating system. It was designed to include a variety of useful symbols for documents, becoming one of the most recognizable symbolic fonts in digital history.`,
    filename: 'wingdings-translator-fact-1',
  },
  {
    title: 'Hidden Easter Eggs',
    content: `Wingdings contains several Easter eggs. For example, typing NYC displays symbols that some people interpreted as anti-Semitic, leading to controversy in the 1990s. These hidden messages have made Wingdings a subject of cultural fascination.`,
    filename: 'wingdings-translator-fact-2',
  },
];

/**
 * 使用 Gemini 比较两个 prompt 的质量
 */
async function comparePrompts(
  existingPrompt: string,
  newPrompt: string,
  sectionTitle: string
): Promise<{
  shouldUseExisting: boolean;
  reason: string;
  recommendation: string;
}> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  No Gemini API key found, using new prompt by default');
    return {
      shouldUseExisting: false,
      reason: 'No API key available for comparison',
      recommendation: newPrompt,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const comparisonPrompt = `You are an expert at evaluating image generation prompts for geometric flat-style illustrations.

Compare these two prompts for the same image concept "${sectionTitle}":

EXISTING PROMPT:
${existingPrompt}

NEW PROMPT:
${newPrompt}

Evaluate based on:
1. Detail and specificity
2. Color palette accuracy (must use sky blue #87CEEB as primary)
3. Geometric flat style adherence
4. Completeness of scene description
5. Keyword integration for "${sectionTitle}"

Response format:
DECISION: [USE_EXISTING or USE_NEW]
REASON: [One sentence explanation]
RECOMMENDATION: [If USE_EXISTING, return EXISTING PROMPT exactly as is; if USE_NEW, return NEW PROMPT exactly as is]

Now evaluate:`;

  try {
    const result = await model.generateContent(comparisonPrompt);
    const response = result.response.text().trim();

    const decisionMatch = response.match(/DECISION:\s*(USE_EXISTING|USE_NEW)/i);
    const reasonMatch = response.match(
      /REASON:\s*([\s\S]+?)(?=\nRECOMMENDATION:)/i
    );
    const recommendationMatch = response.match(/RECOMMENDATION:\s*([\s\S]+)$/i);

    const decision = decisionMatch?.[1].toUpperCase();
    const reason = reasonMatch?.[1].trim() || 'No reason provided';
    const recommendation = recommendationMatch?.[1].trim() || newPrompt;

    return {
      shouldUseExisting: decision === 'USE_EXISTING',
      reason,
      recommendation,
    };
  } catch (error: any) {
    console.error('❌ Comparison failed:', error.message);
    return {
      shouldUseExisting: false,
      reason: 'Comparison error, defaulting to new prompt',
      recommendation: newPrompt,
    };
  }
}

async function regenerateWingdingsTranslatorImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating Wingdings Translator Section Images');
  console.log('='.repeat(70) + '\n');

  const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

  // 确保输出目录存在
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const section of SECTIONS) {
    console.log(`\n🎯 Processing: ${section.title}`);
    console.log('-'.repeat(50));

    try {
      // Step 1: 使用 Gemini 生成新 prompt
      console.log('📋 Step 1: Generating new prompt with Gemini...');
      const { prompt: newPrompt } = await testGeneratePrompt(
        `Telugu to English Translator - ${section.title}`,
        section.content
      );
      console.log(`✅ Generated new prompt (${newPrompt.length} chars)`);
      console.log(`📝 New: ${newPrompt.substring(0, 100)}...\n`);

      // Step 2: 生成图片（直接使用新prompt，没有现有prompt需要比较）
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
      console.error(
        `\n❌ Failed to generate image for ${section.title}: ${error.message}\n`
      );
      // 继续处理下一个部分，不中断整个流程
    }

    // 添加延迟以避免速率限制
    if (SECTIONS.indexOf(section) < SECTIONS.length - 1) {
      console.log(`⏱️  Waiting 3 seconds before next request...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 All sections processed!');
  console.log('='.repeat(70) + '\n');
}

regenerateWingdingsTranslatorImages().catch(console.error);
