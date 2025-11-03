#!/usr/bin/env node

/**
 * Universal How-To Screenshot Generator
 *
 * Usage:
 *   pnpm tsx scripts/capture-howto-screenshot.ts albanian-to-english
 *   pnpm tsx scripts/capture-howto-screenshot.ts baby-translator
 *   pnpm tsx scripts/capture-howto-screenshot.ts verbose-generator
 *
 * Features:
 * - Dynamic page URL detection
 * - Auto filename generation
 * - Crop left/right 150px each
 * - Convert to WebP < 90KB
 * - Smart quality adjustment
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
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Step 2: Wait for content to load
    console.log('⏳ Waiting for content (5s)...');
    await page.waitForTimeout(5000);

    // Step 3: Take screenshot
    console.log('📸 Capturing screenshot...');
    await page.screenshot({
      path: tempPngPath,
      fullPage: false, // Only first viewport
    });

    console.log('✅ Screenshot captured\n');

    // Step 4: Crop and convert to WebP
    console.log('✂️  Cropping image...');
    const finalWidth = viewportWidth - cropLeft - cropRight;
    const finalHeight = viewportHeight - cropBottom;

    console.log(`   Original: ${viewportWidth}x${viewportHeight}`);
    console.log(`   Cropped: ${finalWidth}x${finalHeight}\n`);

    // Step 5: Smart compression to < targetSizeKB
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

    // Step 6: Cleanup temp file
    console.log('🗑️  Cleaning up temp files...');
    await unlink(tempPngPath);

    // Step 7: Final summary
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
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// CLI interface
async function main() {
  const pageSlug = process.argv[2];

  if (!pageSlug) {
    console.error('❌ Error: Missing page slug argument\n');
    console.log('Usage:');
    console.log('  pnpm tsx scripts/capture-howto-screenshot.ts <page-slug>\n');
    console.log('Examples:');
    console.log(
      '  pnpm tsx scripts/capture-howto-screenshot.ts albanian-to-english'
    );
    console.log(
      '  pnpm tsx scripts/capture-howto-screenshot.ts baby-translator'
    );
    console.log(
      '  pnpm tsx scripts/capture-howto-screenshot.ts verbose-generator\n'
    );
    process.exit(1);
  }

  await captureHowToScreenshot({ pageSlug });
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});