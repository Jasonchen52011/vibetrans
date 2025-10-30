import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const targetSize = 90 * 1024; // 90KB in bytes
const tolerance = 5 * 1024; // ±5KB tolerance

const filesToOptimize = [
  {
    path: '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/announcement-and-innovation.webp',
    name: 'announcement-and-innovation.webp',
  },
  {
    path: '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/ai-learning-system.webp',
    name: 'ai-learning-system.webp',
  },
  {
    path: '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/bad-translator-celebration.webp',
    name: 'bad-translator-celebration.webp',
  },
  {
    path: '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/social-media-content-creation.webp',
    name: 'social-media-content-creation.webp',
  },
  {
    path: '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/social-media-selfie.webp',
    name: 'social-media-selfie.webp',
  },
];

async function optimizeWebP(
  inputPath: string
): Promise<{ success: boolean; size: number; error?: string }> {
  try {
    let quality = 75;
    let size = 0;
    let attempts = 0;
    const maxAttempts = 20;
    let lowQuality = 30;
    let highQuality = 80;
    const tempPath = inputPath + '.tmp';
    let bestQuality = 50;
    let bestSize = 0;

    // Binary search for optimal quality
    while (attempts < maxAttempts) {
      quality = Math.floor((lowQuality + highQuality) / 2);
      await sharp(inputPath).webp({ quality }).toFile(tempPath);

      const stats = fs.statSync(tempPath);
      size = stats.size;

      // Track the closest to target
      if (
        bestSize === 0 ||
        Math.abs(size - targetSize) < Math.abs(bestSize - targetSize)
      ) {
        bestSize = size;
        bestQuality = quality;
      }

      if (size >= targetSize - tolerance && size <= targetSize + tolerance) {
        // Perfect match - replace original
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);
        return { success: true, size };
      }

      if (size > targetSize) {
        highQuality = quality - 1;
      } else {
        lowQuality = quality + 1;
      }

      attempts++;

      if (lowQuality > highQuality) {
        break;
      }
    }

    // Use the best quality we found
    await sharp(inputPath).webp({ quality: bestQuality }).toFile(tempPath);
    const finalStats = fs.statSync(tempPath);
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath);

    return { success: true, size: finalStats.size };
  } catch (error) {
    return {
      success: false,
      size: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  if (process.env.NODE_ENV === 'development') {
    console.log('开始优化 WebP 文件大小到 90KB...\n');
  }

  for (const file of filesToOptimize) {
    const { path: filePath, name } = file;

    // Get original size
    const originalStats = fs.statSync(filePath);
    const originalSize = originalStats.size;

    if (process.env.NODE_ENV === 'development') {
      console.log(`处理: ${name}`);
      console.log(`当前大小: ${(originalSize / 1024).toFixed(2)}KB`);
    }

    const result = await optimizeWebP(filePath);

    if (result.success) {
      const reduction = ((originalSize - result.size) / 1024).toFixed(2);
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `✓ 优化成功: ${(originalSize / 1024).toFixed(2)}KB → ${(result.size / 1024).toFixed(2)}KB (减少 ${reduction}KB)`
        );
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✗ 优化失败: ${result.error}`);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('');
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('\n优化完成！');
  }
}

main();
