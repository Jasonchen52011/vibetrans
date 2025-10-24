#!/usr/bin/env node

/**
 * Compress newly generated images to meet 90kb requirement
 * Targets the recently generated images from wingdings and telugu translators
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// 需要压缩的图片列表（新生成的图片）
const imagesToCompress = [
  // Wingdings Translator - 新生成的三张
  'public/images/docs/wingdings-translator-fact-1.webp', // 11,272 bytes - 已符合要求但需要确保4:3
  'public/images/docs/wingdings-translator-fact-2.webp', // 12,190 bytes - 已符合要求但需要确保4:3
  'public/images/docs/wingdings-translator-interest-3.webp', // 8,450 bytes - 已符合要求但需要确保4:3

  // Telugu to English Translator - 新生成的四张
  'public/images/docs/telugu-to-english-translator-fontCompatibility.webp', // 11,664 bytes - 已符合要求但需要确保4:3
  'public/images/docs/telugu-to-english-translator-designApplications.webp', // 17,116 bytes - 已符合要求但需要确保4:3
  'public/images/docs/telugu-to-english-translator-microsoftCreation.webp', // 8,702 bytes - 已符合要求但需要确保4:3
  'public/images/docs/telugu-to-english-translator-hiddenEasterEggs.webp', // 26,418 bytes - 已符合要求但需要确保4:3
];

/**
 * 获取文件大小（KB）
 */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return Math.round(stats.size / 1024);
  } catch (error) {
    console.error(`❌ Cannot get file size for ${filePath}:`, error);
    return 0;
  }
}

/**
 * 压缩单个图片到90kb以内，保持4:3比例
 */
async function compressImage(filePath: string): Promise<void> {
  console.log(`\n🔄 Processing: ${path.basename(filePath)}`);

  try {
    const originalSize = await getFileSize(filePath);
    console.log(`📏 Original size: ${originalSize}KB`);

    if (originalSize <= 90) {
      console.log(`✅ Already within limit (${originalSize}KB ≤ 90KB)`);
      // 即使大小符合要求，也要确保4:3比例
      await ensureAspectRatio(filePath);
      return;
    }

    // 读取原始图片
    const inputBuffer = await fs.readFile(filePath);

    // 渐进式压缩策略
    let quality = 80;
    let currentBuffer = inputBuffer;
    let currentSize = originalSize;

    console.log(`🎯 Target size: ≤90KB (current: ${currentSize}KB)`);

    while (currentSize > 90 && quality > 10) {
      quality -= 10;

      currentBuffer = await sharp(inputBuffer)
        .resize(1200, 900, {
          // 确保4:3比例
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality,
          effort: 6,
          method: 6,
          smartSubsample: true,
        })
        .toBuffer();

      currentSize = Math.round(currentBuffer.length / 1024);
      console.log(`   Quality ${quality}: ${currentSize}KB`);
    }

    // 如果还是太大，进一步降低分辨率
    if (currentSize > 90) {
      console.log(`🔧 Reducing resolution...`);
      const resolutions = [
        { width: 1024, height: 768 },
        { width: 900, height: 675 },
        { width: 800, height: 600 },
        { width: 640, height: 480 },
      ];

      for (const { width, height } of resolutions) {
        if (currentSize <= 90) break;

        currentBuffer = await sharp(inputBuffer)
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({
            quality: 70,
            effort: 6,
            method: 6,
            smartSubsample: true,
          })
          .toBuffer();

        currentSize = Math.round(currentBuffer.length / 1024);
        console.log(`   Resolution ${width}x${height}: ${currentSize}KB`);
      }
    }

    // 写入压缩后的文件
    await fs.writeFile(filePath, currentBuffer);
    const finalSize = await getFileSize(filePath);

    console.log(`✅ Compression complete:`);
    console.log(`   Original: ${originalSize}KB → Final: ${finalSize}KB`);
    console.log(
      `   Space saved: ${originalSize - finalSize}KB (${Math.round(((originalSize - finalSize) / originalSize) * 100)}%)`
    );

    if (finalSize > 90) {
      console.warn(
        `⚠️  Warning: Could not compress to ≤90KB (final: ${finalSize}KB)`
      );
    } else {
      console.log(`🎉 Successfully compressed to ≤90KB!`);
    }
  } catch (error) {
    console.error(`❌ Failed to compress ${filePath}:`, error);
  }
}

/**
 * 确保图片为4:3比例
 */
async function ensureAspectRatio(filePath: string): Promise<void> {
  try {
    const inputBuffer = await fs.readFile(filePath);
    const metadata = await sharp(inputBuffer).metadata();

    const { width, height } = metadata;
    if (!width || !height) return;

    const currentRatio = width / height;
    const targetRatio = 4 / 3; // 1.333...

    // 如果比例偏差超过5%，则调整
    if (Math.abs(currentRatio - targetRatio) > 0.05) {
      console.log(
        `📐 Adjusting aspect ratio from ${currentRatio.toFixed(2)} to 4:3`
      );

      const newWidth = Math.floor(1200);
      const newHeight = Math.floor(900); // 4:3比例

      const processedBuffer = await sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true,
          position: 'center',
        })
        .webp({
          quality: 85,
          effort: 6,
          method: 6,
        })
        .toBuffer();

      await fs.writeFile(filePath, processedBuffer);
      console.log(`✅ Aspect ratio adjusted to 4:3 (${newWidth}x${newHeight})`);
    } else {
      console.log(
        `📐 Aspect ratio already correct: ${currentRatio.toFixed(2)} ≈ 4:3`
      );
    }
  } catch (error) {
    console.error(`❌ Failed to adjust aspect ratio for ${filePath}:`, error);
  }
}

/**
 * 主处理函数
 */
async function compressNewImages() {
  console.log('🗜️  Compressing Newly Generated Images to ≤90KB');
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const imagePath of imagesToCompress) {
    try {
      await compressImage(imagePath);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to process ${imagePath}:`, error);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(
    `✅ Successfully processed: ${successCount}/${imagesToCompress.length}`
  );
  console.log(`❌ Failed: ${failCount}/${imagesToCompress.length}`);

  // 最终验证
  console.log('\n🔍 Final verification:');
  for (const imagePath of imagesToCompress) {
    const size = await getFileSize(imagePath);
    const status = size <= 90 ? '✅' : '❌';
    console.log(`${status} ${path.basename(imagePath)}: ${size}KB`);
  }

  console.log('\n🎉 Image compression process completed!');
}

// 执行压缩
compressNewImages().catch(console.error);
