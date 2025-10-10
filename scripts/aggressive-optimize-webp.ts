import fs from 'fs';
import sharp from 'sharp';

const targetSize = 90 * 1024; // 90KB in bytes

const filesToOptimize = [
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

async function aggressiveOptimize(
  inputPath: string
): Promise<{ success: boolean; size: number; error?: string }> {
  try {
    const tempPath = inputPath + '.tmp';
    let currentSize = 0;
    let quality = 55;

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    let width = metadata.width || 1024;

    // Start with quality 55 and reduce if needed
    while (quality >= 30) {
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toFile(tempPath);

      const stats = fs.statSync(tempPath);
      currentSize = stats.size;

      if (currentSize <= targetSize) {
        // Success! Replace original
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);
        return { success: true, size: currentSize };
      }

      // If still too large, try reducing quality
      quality -= 5;

      // If quality is getting too low, try reducing dimensions
      if (quality < 35 && width > 800) {
        width = Math.floor(width * 0.9);
        quality = 55; // Reset quality when resizing
      }
    }

    // Use the last attempt even if not perfect
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
  console.log('开始激进优化 WebP 文件到 90KB 以下...\n');

  for (const file of filesToOptimize) {
    const { path: filePath, name } = file;

    // Get original size
    const originalStats = fs.statSync(filePath);
    const originalSize = originalStats.size;

    console.log(`处理: ${name}`);
    console.log(`当前大小: ${(originalSize / 1024).toFixed(2)}KB`);

    const result = await aggressiveOptimize(filePath);

    if (result.success) {
      const reduction = ((originalSize - result.size) / 1024).toFixed(2);
      const targetMet = result.size <= targetSize ? '✓' : '⚠';
      console.log(
        `${targetMet} 优化成功: ${(originalSize / 1024).toFixed(2)}KB → ${(result.size / 1024).toFixed(2)}KB (减少 ${reduction}KB)`
      );
    } else {
      console.log(`✗ 优化失败: ${result.error}`);
    }

    console.log('');
  }

  console.log('\n优化完成！');
}

main();
