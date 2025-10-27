/**
 * Screenshot Helper for Article Illustrator
 * Integrates Playwright screenshot functionality into the workflow
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

interface ScreenshotResult {
  filename: string;
  size: number;
  path: string;
}

export async function captureHowToScreenshot(
  config: ScreenshotConfig
): Promise<ScreenshotResult> {
  const {
    pageSlug,
    viewportWidth = 1920,
    viewportHeight = 1080,
    cropLeft = 150,
    cropRight = 150,
    cropBottom = 100,
    targetSizeKB = 90,
    baseUrl = 'http://localhost:3001',
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

  console.log(`\n📸 Capturing How-To screenshot from: ${url}`);
  console.log(
    `✂️  Crop settings: Left ${cropLeft}px, Right ${cropRight}px, Bottom ${cropBottom}px`
  );

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
  });
  const page = await context.newPage();

  try {
    // Navigate and wait for content
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Take screenshot of the top of the page (hero + tool section)
    console.log('📸 Capturing top section of the page...');
    await page.screenshot({
      path: tempPngPath,
      fullPage: false,
    });

    // Get dimensions of the captured screenshot
    const metadata = await sharp(tempPngPath).metadata();
    const actualWidth = metadata.width || viewportWidth;
    const actualHeight = metadata.height || viewportHeight;

    // Calculate crop dimensions
    const finalWidth = Math.max(100, actualWidth - cropLeft - cropRight);
    const finalHeight = Math.max(100, actualHeight - cropBottom);

    // Smart compression loop
    let quality = 85;
    let attempt = 1;
    const maxAttempts = 5;

    while (attempt <= maxAttempts) {
      const cropConfig =
        cropLeft > 0 || cropRight > 0 || cropBottom > 0
          ? {
              left: Math.min(cropLeft, actualWidth - 100),
              top: 0,
              width: finalWidth,
              height: finalHeight,
            }
          : undefined;

      let pipeline = sharp(tempPngPath);
      if (cropConfig) {
        pipeline = pipeline.extract(cropConfig);
      }

      await pipeline.webp({ quality, effort: 6 }).toFile(finalWebpPath);

      const fs = await import('fs/promises');
      const stats = await fs.stat(finalWebpPath);
      const fileSizeKB = stats.size / 1024;

      if (fileSizeKB <= targetSizeKB || attempt === maxAttempts) {
        // Cleanup temp file
        await unlink(tempPngPath);

        return {
          filename: `${pageSlug}-how-to.webp`,
          size: Math.round(fileSizeKB),
          path: finalWebpPath,
        };
      }

      // Reduce quality for next attempt
      quality -= 10;
      attempt++;
      await fs.unlink(finalWebpPath);
    }

    throw new Error('Failed to compress to target size');
  } catch (error: any) {
    throw new Error(`Screenshot failed: ${error.message}`);
  } finally {
    await browser.close();
  }
}
