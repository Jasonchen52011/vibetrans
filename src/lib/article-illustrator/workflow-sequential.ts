/**
 * Article Illustrator - Sequential Workflow (避免并发限制)
 * 按照用户要求：火山4.0和Seedream循环使用，每张图片之间有延迟
 */

import path from 'path';
import fs from 'fs/promises';
import { generateImageWithSeedream } from '../kie-text-to-image';
import { generateImage as generateVolcanoImage } from '../volcano-image';
import { analyzeArticleSections } from './gemini-analyzer';
import type { ArticleSections } from './types';
import { convertDataURLToWebP, convertURLToWebP } from './webp-converter';

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

export interface IllustrationWorkflowResult {
  success: boolean;
  totalImages: number;
  successfulImages: number;
  failedImages: number;
  images: Array<{
    section: string;
    title: string;
    filename: string;
    size: number;
    status: 'success' | 'failed';
    error?: string;
    modelUsed?: string;
  }>;
  totalTimeMs: number;
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 使用火山4.0生成图片
 */
async function generateWithVolcano(
  prompt: string
): Promise<{ url: string; revisedPrompt?: string }> {
  const result = await generateVolcanoImage({
    prompt,
    mode: 'text',
    size: '2K',
    watermark: false,
  });

  return {
    url: result.data[0].url,
    revisedPrompt: result.data[0].revised_prompt || prompt,
  };
}

/**
 * 使用Seedream生成图片
 */
async function generateWithSeedream(
  prompt: string
): Promise<{ url: string; revisedPrompt?: string }> {
  return await generateImageWithSeedream(prompt, {
    imageSize: 'landscape_4_3',
    imageResolution: '2K',
    maxImages: 1,
  });
}

/**
 * 顺序生成单张图片（循环使用火山4.0和Seedream）
 */
async function generateSingleImage(
  promptData: any,
  index: number
): Promise<{
  url: string;
  modelUsed: string;
}> {
  // 奇数索引优先使用火山4.0，偶数索引优先使用Seedream
  const useVolcanoFirst = index % 2 === 0; // 0,2,4,6 用火山

  const primaryModel = useVolcanoFirst
    ? { name: 'Volcano 4.0', fn: generateWithVolcano }
    : { name: 'Seedream 4.0', fn: generateWithSeedream };

  const fallbackModel = useVolcanoFirst
    ? { name: 'Seedream 4.0', fn: generateWithSeedream }
    : { name: 'Volcano 4.0', fn: generateWithVolcano };

  console.log(`\n🎨 [${primaryModel.name}] Generating image...`);
  console.log(`📝 Prompt: ${promptData.prompt.substring(0, 100)}...`);

  try {
    const result = await primaryModel.fn(promptData.prompt);
    console.log(`✅ [${primaryModel.name}] Image generated successfully`);
    return {
      url: result.url,
      modelUsed: primaryModel.name,
    };
  } catch (error: any) {
    console.error(`❌ [${primaryModel.name}] Failed:`, error.message);
    console.log(`🔄 Falling back to ${fallbackModel.name}...`);

    try {
      const result = await fallbackModel.fn(promptData.prompt);
      console.log(
        `✅ [${fallbackModel.name}] Image generated successfully (fallback)`
      );
      return {
        url: result.url,
        modelUsed: `${fallbackModel.name} (fallback)`,
      };
    } catch (fallbackError: any) {
      console.error(
        `❌ [${fallbackModel.name}] Fallback failed:`,
        fallbackError.message
      );
      throw new Error(
        `Both ${primaryModel.name} and ${fallbackModel.name} failed`
      );
    }
  }
}

/**
 * Complete workflow: Analyze → Generate Sequentially → Convert to WebP
 */
export async function generateArticleIllustrationsSequential(
  sections: ArticleSections
): Promise<IllustrationWorkflowResult> {
  const startTime = Date.now();
  const results: IllustrationWorkflowResult = {
    success: false,
    totalImages: 7, // 1 What is + 2 Fun Facts + 4 User Interests
    successfulImages: 0,
    failedImages: 0,
    images: [],
    totalTimeMs: 0,
  };

  console.log('\n' + '='.repeat(70));
  console.log('🎨 Article Illustrator - Sequential Workflow');
  console.log('🔄 循环使用: 火山4.0 ↔️ Seedream 4.0');
  console.log('='.repeat(70));
  console.log(`\n📚 Tool: ${sections.toolName}`);
  console.log(
    `🎯 Target: 7 illustrations (1 What is + 2 Fun Facts + 4 User Interests)\n`
  );

  try {
    // Step 1: Analyze with Gemini → Generate Prompts
    console.log('\n' + '-'.repeat(70));
    console.log('📝 STEP 1: Analyzing sections with Gemini...');
    console.log('-'.repeat(70));

    const prompts = await analyzeArticleSections(sections);
    console.log(`✅ Generated ${prompts.length} prompts`);

    // Step 2: Generate images SEQUENTIALLY (not parallel)
    console.log('\n' + '-'.repeat(70));
    console.log('🎨 STEP 2: Generating images SEQUENTIALLY...');
    console.log('⏱️  每张图片之间等待 5 秒避免 API 限流');
    console.log('-'.repeat(70));

    for (let i = 0; i < prompts.length; i++) {
      const promptData = prompts[i];
      const sectionLabel =
        promptData.index !== undefined
          ? `${promptData.section} #${promptData.index + 1}`
          : promptData.section;

      console.log(`\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
      console.log(`┃ [${i + 1}/${prompts.length}] ${sectionLabel.padEnd(38)}┃`);
      console.log(`┃ ${promptData.title.padEnd(40)}┃`);
      console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);

      try {
        // Generate image with alternating APIs
        const imageData = await generateSingleImage(promptData, i);

        // Convert to WebP
        console.log(`📦 Converting to WebP...`);
        const webpResult = await (imageData.url.startsWith('data:')
          ? convertDataURLToWebP(imageData.url, {
              filename: promptData.suggestedFilename,
            })
          : convertURLToWebP(imageData.url, {
              filename: promptData.suggestedFilename,
            }));

        if (webpResult.success) {
          results.successfulImages++;
          console.log(
            `✅ [${i + 1}/${prompts.length}] Success: ${webpResult.filename} (${webpResult.size}KB) - Model: ${imageData.modelUsed}`
          );
          results.images.push({
            section: sectionLabel,
            title: promptData.title,
            filename: webpResult.filename,
            size: webpResult.size,
            status: 'success',
            modelUsed: imageData.modelUsed,
          });
        } else {
          throw new Error(webpResult.error || 'WebP conversion failed');
        }
      } catch (error: any) {
        results.failedImages++;
        console.error(
          `❌ [${i + 1}/${prompts.length}] Failed: ${error.message}`
        );
        results.images.push({
          section: sectionLabel,
          title: promptData.title,
          filename: `${promptData.suggestedFilename}.webp`,
          size: 0,
          status: 'failed',
          error: error.message,
        });
      }

      // 添加延迟（除了最后一张）
      if (i < prompts.length - 1) {
        console.log('\n⏳ 等待 5 秒后继续...');
        await sleep(5000);
      }
    }

    // Final summary
    results.totalTimeMs = Date.now() - startTime;
    results.success = results.successfulImages > 0;

    console.log('\n' + '='.repeat(70));
    console.log('📊 WORKFLOW SUMMARY');
    console.log('='.repeat(70));
    console.log(
      `✅ Successful: ${results.successfulImages}/${results.totalImages}`
    );
    console.log(`❌ Failed: ${results.failedImages}/${results.totalImages}`);
    console.log(`⏱️  Total Time: ${(results.totalTimeMs / 1000).toFixed(2)}s`);

    console.log('\n📁 Generated Files:');
    results.images
      .filter((img) => img.status === 'success')
      .forEach((img, idx) => {
        console.log(
          `   ${idx + 1}. ${img.filename} (${img.size}KB) - ${img.title} [${img.modelUsed}]`
        );
      });

    if (results.failedImages > 0) {
      console.log('\n⚠️  Failed Images:');
      results.images
        .filter((img) => img.status === 'failed')
        .forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img.title}: ${img.error}`);
        });
    }

    console.log('\n' + '='.repeat(70));

    return results;
  } catch (error: any) {
    console.error('\n❌ WORKFLOW FAILED:', error.message);
    results.totalTimeMs = Date.now() - startTime;
    return results;
  }
}
