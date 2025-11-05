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

// 四个部分的内容配置 - Bad Translator Fun Translation Facts (userInterest section)
const SECTIONS = [
  {
    title: 'How Accurate is Bad Translator?',
    content: `While the translations are intentionally humorous and sometimes absurd, you can expect some fun 'mistakes'! This tool isn't about accuracy—it's all about having a laugh! These translations serve as a great way to spark creativity for memes or social posts.`,
    filename: 'bad-translator-accuracy-concept',
  },
  {
    title: 'Perfect for Social Media Content',
    content: `Bad Translator can be a goldmine for funny posts. Use it to generate quirky translations and share them on social media for instant reactions. This tool creates attention-grabbing, shareable content that drives engagement!`,
    filename: 'bad-translator-social-media',
  },
  {
    title: 'Great for Advertisers',
    content: `If you're in advertising, you can use Bad Translator to create playful, out-of-the-box content that will entertain your audience. It's an ideal tool for brainstorming catchy slogans or taglines. Testing different combinations always yields entertaining results!`,
    filename: 'bad-translator-advertising',
  },
  {
    title: 'For Meme Creators and Influencers',
    content: `Bad Translator can help meme creators generate funny phrases that go viral. The bizarre translations are perfect for creating trending content. The ease of turning any sentence into something absurd makes this tool indispensable for content creators.`,
    filename: 'bad-translator-meme-creators',
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

async function regenerateBadTranslatorImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating Bad Translator Fun Translation Facts Images');
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
        `Bad Translator - ${section.title}`,
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

regenerateBadTranslatorImages().catch(console.error);
