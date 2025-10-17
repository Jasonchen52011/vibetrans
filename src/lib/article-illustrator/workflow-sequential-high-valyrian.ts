/**
 * Article Illustrator - Sequential Workflow for High-Valyrian Translator
 * Modified to prevent API rate limiting by processing images one by one
 */

import path from 'path';
import fs from 'fs/promises';
import { analyzeArticleSections } from './gemini-analyzer';
import { generateIllustration } from './image-generator';
import type { ArticleSections } from './types';
import { convertDataURLToWebP, convertURLToWebP } from './webp-converter';

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
  }>;
  howToScreenshot?: {
    filename: string;
    size: number;
    status: 'success' | 'failed';
    error?: string;
  };
  totalTimeMs: number;
}

/**
 * Sequential workflow: Analyze → Generate → Convert to WebP → Screenshot How-To
 * Processes images one by one to avoid API rate limiting
 */
export async function generateArticleIllustrationsSequential(
  sections: ArticleSections,
  options?: {
    captureHowTo?: boolean;
    baseUrl?: string;
  }
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

  const captureHowTo = options?.captureHowTo ?? true; // 默认开启
  const baseUrl = options?.baseUrl ?? 'http://localhost:3001';

  console.log('\n' + '='.repeat(70));
  console.log('🎨 Article Illustrator - Sequential Workflow');
  console.log('='.repeat(70));
  console.log(`\n📚 Tool: ${sections.toolName}`);
  console.log(
    `🎯 Target: 7 illustrations (1 What is + 2 Fun Facts + 4 User Interests)${captureHowTo ? ' + 1 How-To screenshot' : ''}`
  );
  console.log('⚠️  Running in SEQUENTIAL mode to avoid API rate limiting\n');

  try {
    // Step 1: Analyze with Gemini → Generate Prompts
    console.log('\n' + '-'.repeat(70));
    console.log('📝 STEP 1: Analyzing sections with Gemini...');
    console.log('-'.repeat(70));

    const prompts = await analyzeArticleSections(sections);
    console.log(`✅ Generated ${prompts.length} prompts`);

    // Step 2: Generate images with Volcano Engine (Sequential)
    console.log('\n' + '-'.repeat(70));
    console.log(
      '🎨 STEP 2: Generating images with Volcano Engine (Sequential)...'
    );
    console.log('-'.repeat(70));

    const imageResults = [];

    // 串行生成所有图片
    for (let i = 0; i < prompts.length; i++) {
      const promptData = prompts[i];
      const sectionLabel =
        promptData.index !== undefined
          ? `${promptData.section} #${promptData.index + 1}`
          : promptData.section;

      console.log(
        `\n[${i + 1}/${prompts.length}] Processing: ${sectionLabel} - "${promptData.title}"`
      );

      try {
        // Generate image
        console.log('🎨 Generating image...');
        const imageData = await generateIllustration({
          prompt: promptData.prompt,
          filename: promptData.suggestedFilename,
        });

        // Convert to WebP
        console.log('📦 Converting to WebP...');
        const webpResult = await (imageData.url.startsWith('data:')
          ? convertDataURLToWebP(imageData.url, {
              filename: promptData.suggestedFilename,
            })
          : convertURLToWebP(imageData.url, {
              filename: promptData.suggestedFilename,
            }));

        if (webpResult.success) {
          console.log(
            `✅ [${i + 1}/${prompts.length}] Success: ${webpResult.filename} (${webpResult.size}KB)`
          );
          imageResults.push({
            section: sectionLabel,
            title: promptData.title,
            filename: webpResult.filename,
            size: webpResult.size,
            status: 'success' as const,
          });
          results.successfulImages++;
        } else {
          throw new Error(webpResult.error || 'WebP conversion failed');
        }
      } catch (error: any) {
        console.error(
          `❌ [${i + 1}/${prompts.length}] Failed: ${error.message}`
        );
        imageResults.push({
          section: sectionLabel,
          title: promptData.title,
          filename: `${promptData.suggestedFilename}.webp`,
          size: 0,
          status: 'failed' as const,
          error: error.message,
        });
        results.failedImages++;
      }

      // 添加延迟以避免API限制
      if (i < prompts.length - 1) {
        console.log('⏳ Waiting 2 seconds before next image...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    results.images = imageResults;

    // Step 3: Capture How-To screenshot (optional)
    if (captureHowTo) {
      console.log('\n' + '-'.repeat(70));
      console.log('📸 STEP 3: Capturing How-To screenshot...');
      console.log('-'.repeat(70));

      try {
        const { captureHowToScreenshot } = await import('./screenshot-helper');
        const screenshotResult = await captureHowToScreenshot({
          pageSlug: sections.toolName,
          baseUrl,
        });

        results.howToScreenshot = {
          filename: screenshotResult.filename,
          size: screenshotResult.size,
          status: 'success',
        };

        console.log(
          `✅ How-To screenshot captured: ${screenshotResult.filename} (${screenshotResult.size}KB)`
        );
      } catch (error: any) {
        results.howToScreenshot = {
          filename: `${sections.toolName}-how-to.webp`,
          size: 0,
          status: 'failed',
          error: error.message,
        };
        console.error(`❌ How-To screenshot failed: ${error.message}`);
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

    if (captureHowTo && results.howToScreenshot) {
      const screenshotStatus =
        results.howToScreenshot.status === 'success' ? '✅' : '❌';
      console.log(
        `${screenshotStatus} How-To Screenshot: ${results.howToScreenshot.status}`
      );
    }

    console.log(`⏱️  Total Time: ${(results.totalTimeMs / 1000).toFixed(2)}s`);
    console.log('\n📁 Generated Files:');
    results.images
      .filter((img) => img.status === 'success')
      .forEach((img, idx) => {
        console.log(
          `   ${idx + 1}. ${img.filename} (${img.size}KB) - ${img.title}`
        );
      });

    if (results.howToScreenshot?.status === 'success') {
      console.log(
        `   ${results.images.filter((img) => img.status === 'success').length + 1}. ${results.howToScreenshot.filename} (${results.howToScreenshot.size}KB) - How-To Screenshot`
      );
    }

    if (results.failedImages > 0) {
      console.log('\n⚠️  Failed Images:');
      results.images
        .filter((img) => img.status === 'failed')
        .forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img.title}: ${img.error}`);
        });
    }

    if (results.howToScreenshot?.status === 'failed') {
      console.log(
        `\n⚠️  How-To Screenshot Failed: ${results.howToScreenshot.error}`
      );
    }

    console.log('\n' + '='.repeat(70));

    return results;
  } catch (error: any) {
    console.error('\n❌ WORKFLOW FAILED:', error.message);
    results.totalTimeMs = Date.now() - startTime;
    return results;
  }
}

/**
 * Clean up test/temporary images
 */
export async function cleanupTestImages(): Promise<void> {
  const docsDir = path.join(process.cwd(), 'public/images/docs');
  const files = await fs.readdir(docsDir);

  const testFiles = files.filter(
    (f) => f.startsWith('test-') && f.endsWith('.webp')
  );

  for (const file of testFiles) {
    await fs.unlink(path.join(docsDir, file));
    console.log(`🗑️  Deleted: ${file}`);
  }
}