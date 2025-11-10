#!/usr/bin/env node

/**
 * How-To Screenshot Generator Skill
 *
 * This skill generates optimized screenshots for how-to documentation
 * by capturing web pages and processing them with specific requirements.
 */

import path from 'path';
import { unlink } from 'fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

interface ScreenshotConfig {
  pageSlug: string;
  viewportWidth?: number;
  viewportHeight?: number;
  cropLeft?: number;
  cropRight?: number;
  cropBottom?: number;
  targetSizeKB?: number;
  baseUrl?: string;
}

async function captureHowToScreenshot(config: ScreenshotConfig) {
  const {
    pageSlug,
    viewportWidth = 1920,
    viewportHeight = 1080,
    cropLeft = 150,
    cropRight = 150,
    cropBottom = 100,
    targetSizeKB = 90,
    baseUrl = process.env.BASE_URL || 'http://localhost:3001',
  } = config;

  const url = `${baseUrl}/${pageSlug}`;
  const tempPngPath = path.join(
    process.cwd(),
    'public/images/docs',
    `${pageSlug}-how-to-temp.png`
  );
  const finalWebpPath = path.join(
    process.cwd(),
    'public/images/docs',
    `${pageSlug}-how-to.webp`
  );

  console.log('\n' + '='.repeat(80));
  console.log('📸 How-To Screenshot Generator');
  console.log('='.repeat(80));
  console.log(`\n📄 Page: ${pageSlug}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`📐 Viewport: ${viewportWidth}x${viewportHeight}`);
  console.log(
    `✂️  Crop: Left ${cropLeft}px, Right ${cropRight}px, Bottom ${cropBottom}px`
  );
  console.log(`📦 Target Size: < ${targetSizeKB}KB\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to page
    console.log('🌐 Loading page...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Step 2: Wait for content to load
    console.log('⏳ Waiting for content (10s)...');
    await page.waitForTimeout(10000);

    // Step 3: Wait for any dynamic content to load
    console.log('⏳ Waiting for dynamic content...');
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log('   Networkidle timeout, continuing...');
    }

    // Step 4: Take screenshot
    console.log('📸 Capturing screenshot...');
    await page.screenshot({
      path: tempPngPath,
      fullPage: false, // Only first viewport
    });

    console.log('✅ Screenshot captured\n');

    // Step 5: Crop and convert to WebP
    console.log('✂️  Cropping image...');
    const finalWidth = viewportWidth - cropLeft - cropRight;
    const finalHeight = viewportHeight - cropBottom;

    console.log(`   Original: ${viewportWidth}x${viewportHeight}`);
    console.log(`   Cropped: ${finalWidth}x${finalHeight}\n`);

    // Step 6: Smart compression to < targetSizeKB
    console.log('📦 Converting to WebP with smart compression...');
    let quality = 85;
    let attempt = 1;
    const maxAttempts = 5;

    while (attempt <= maxAttempts) {
      await sharp(tempPngPath)
        .extract({
          left: cropLeft,
          top: 0,
          width: finalWidth,
          height: finalHeight,
        })
        .webp({ quality, effort: 6 })
        .toFile(finalWebpPath);

      const fs = await import('fs/promises');
      const stats = await fs.stat(finalWebpPath);
      const fileSizeKB = stats.size / 1024;

      console.log(
        `   Attempt ${attempt}/${maxAttempts}: Quality ${quality}% → ${fileSizeKB.toFixed(2)}KB`
      );

      if (fileSizeKB <= targetSizeKB) {
        console.log(
          `✅ Size target achieved: ${fileSizeKB.toFixed(2)}KB < ${targetSizeKB}KB\n`
        );
        break;
      }

      if (attempt === maxAttempts) {
        console.log(
          `⚠️  Warning: Could not reach ${targetSizeKB}KB target after ${maxAttempts} attempts`
        );
        console.log(
          `   Final size: ${fileSizeKB.toFixed(2)}KB (quality ${quality}%)\n`
        );
        break;
      }

      // Reduce quality for next attempt
      quality -= 10;
      attempt++;

      // Delete previous attempt
      await fs.unlink(finalWebpPath);
    }

    // Step 7: Cleanup temp file
    console.log('🗑️  Cleaning up temp files...');
    await unlink(tempPngPath);

    // Step 8: Final summary
    const fs = await import('fs/promises');
    const finalStats = await fs.stat(finalWebpPath);
    const finalSize = finalStats.size / 1024;

    console.log('\n' + '='.repeat(80));
    console.log('✅ SCREENSHOT COMPLETED');
    console.log('='.repeat(80));
    console.log(`📁 File: ${path.basename(finalWebpPath)}`);
    console.log(`📏 Size: ${finalSize.toFixed(2)}KB`);
    console.log(`📐 Dimensions: ${finalWidth}x${finalHeight}`);
    console.log(`💾 Path: ${finalWebpPath}`);
    console.log('='.repeat(80) + '\n');

    return {
      success: true,
      file: finalWebpPath,
      size: finalSize,
      dimensions: { width: finalWidth, height: finalHeight }
    };

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export the main function for use as a skill
export async function generateHowToScreenshot(pageSlug: string, options?: Partial<ScreenshotConfig>) {
  if (!pageSlug) {
    throw new Error('Page slug is required');
  }

  return await captureHowToScreenshot({ pageSlug, ...options });
}

// CLI interface for standalone usage
async function main() {
  const pageSlug = process.argv[2];

  if (!pageSlug) {
    console.error('❌ Error: Missing page slug argument\n');
    console.log('Usage:');
    console.log('  pnpm tsx skills/howto-screenshot-generator.ts <page-slug>\n');
    console.log('Examples:');
    console.log('  pnpm tsx skills/howto-screenshot-generator.ts albanian-to-english');
    console.log('  pnpm tsx skills/howto-screenshot-generator.ts baby-translator');
    console.log('  pnpm tsx skills/howto-screenshot-generator.ts verbose-generator\n');
    process.exit(1);
  }

  await captureHowToScreenshot({ pageSlug });
}

// Only run CLI if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}