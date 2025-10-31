#!/usr/bin/env npx tsx

/**
 * 优化Rune Translator图片大小到90kb左右
 * 使用Sharp重新压缩现有的WebP图片
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT_DIR, 'public', 'images', 'docs');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'images', 'docs');

// 需要优化的图片文件
const imagesToOptimize = [
  'rune-ancient-carving-mystical.webp',
  'rune-warrior-campfire-reading.webp',
  'rune-cosplay-convention-modern.webp',
  'rune-tabletop-gaming-friends.webp',
  'rune-artists-collaboration-studio.webp',
  'rune-streamer-professional-setup.webp',
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

/**
 * 优化单张图片
 */
async function optimizeImage(
  filename: string
): Promise<{ before: number; after: number; success: boolean }> {
  const inputPath = path.join(INPUT_DIR, filename);
  const outputPath = path.join(OUTPUT_DIR, filename);

  try {
    // 获取原始文件大小
    const originalStats = await fs.stat(inputPath);
    const beforeSize = Math.round(originalStats.size / 1024); // KB

    logInfo(`优化 ${filename}: ${beforeSize}KB -> ...`);

    // 读取原始图片
    const originalBuffer = await fs.readFile(inputPath);

    // 优化压缩 - 目标90KB左右
    const optimizedBuffer = await sharp(originalBuffer)
      .resize(1400, 1050, {
        // 保持较高分辨率
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 80, // 提高质量
        effort: 6, // 最大压缩努力
        method: 6, // 最慢但最好的压缩方法
        smartSubsample: true,
        alphaQuality: 85,
        nearLossless: false,
      })
      .toBuffer();

    // 写入优化后的文件
    await fs.writeFile(outputPath, optimizedBuffer);

    const afterSize = Math.round(optimizedBuffer.length / 1024); // KB
    const success = Math.abs(afterSize - 90) <= 20; // 允许70-110KB范围

    if (success) {
      logSuccess(`${filename}: ${beforeSize}KB -> ${afterSize}KB`);
    } else if (afterSize > 110) {
      logInfo(`${filename}: ${beforeSize}KB -> ${afterSize}KB (仍需压缩)`);
      // 如果还是太大，再次压缩
      const secondBuffer = await sharp(optimizedBuffer)
        .webp({
          quality: 60,
          effort: 6,
          method: 6,
          smartSubsample: true,
          alphaQuality: 70,
        })
        .toBuffer();

      await fs.writeFile(outputPath, secondBuffer);
      const secondSize = Math.round(secondBuffer.length / 1024);
      log(
        `${filename}: ${beforeSize}KB -> ${secondSize}KB (二次压缩)`,
        'yellow'
      );
      return {
        before: beforeSize,
        after: secondSize,
        success: Math.abs(secondSize - 90) <= 30,
      };
    } else {
      logInfo(`${filename}: ${beforeSize}KB -> ${afterSize}KB`);
    }

    return { before: beforeSize, after: afterSize, success };
  } catch (error) {
    logError(
      `优化 ${filename} 失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
    return { before: 0, after: 0, success: false };
  }
}

/**
 * 主函数
 */
async function main() {
  log('🖼️  优化Rune Translator图片大小', 'bright');
  log('='.repeat(60), 'cyan');

  try {
    let totalBefore = 0;
    let totalAfter = 0;
    let successCount = 0;

    for (const filename of imagesToOptimize) {
      const result = await optimizeImage(filename);
      totalBefore += result.before;
      totalAfter += result.after;
      if (result.success) successCount++;

      // 添加小延迟避免过度占用资源
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 总结
    log('\n' + '='.repeat(60), 'green');
    log('📊 优化完成总结', 'green');
    log('='.repeat(60), 'green');

    logSuccess(`成功优化: ${successCount}/${imagesToOptimize.length} 张图片`);
    logInfo(`总大小变化: ${totalBefore}KB -> ${totalAfter}KB`);
    logInfo(
      `节省空间: ${totalBefore - totalAfter}KB (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`
    );

    log('\n📁 所有图片已优化并保存到: public/images/docs/');
    logInfo('🌐 可以在 http://localhost:3001/rune-translator 查看效果');
  } catch (error) {
    logError(
      `\n❌ 优化失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    process.exit(1);
  }
}

// 运行
main();
