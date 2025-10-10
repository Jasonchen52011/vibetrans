import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface ImageMapping {
  originalPath: string;
  newName: string;
  description: string;
}

const imageMappings: ImageMapping[] = [
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-5948-Translate Anytime Anywhere Geometric Fla....png',
    newName: 'translate-anytime-anywhere.webp',
    description: '随时随地翻译（手机和连接图标）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-9475-Real-Time Translation with Speech Geomet....png',
    newName: 'learn-al-bhed-fast.webp',
    description: '快速学习 Al Bhed（麦克风和对话框）',
  },
];

const targetSize = 90 * 1024; // 90KB in bytes
const tolerance = 5 * 1024; // ±5KB tolerance
const targetWidth = 1600; // 4:3 ratio width
const targetHeight = 1200; // 4:3 ratio height

async function convertToWebP(
  inputPath: string,
  outputPath: string
): Promise<{ success: boolean; size: number; error?: string }> {
  try {
    let quality = 75;
    let size = 0;
    let attempts = 0;
    const maxAttempts = 15;
    let lowQuality = 40;
    let highQuality = 90;

    // Binary search for optimal quality
    while (attempts < maxAttempts) {
      quality = Math.floor((lowQuality + highQuality) / 2);

      // Resize to 4:3 ratio (1600x1200) and convert to webp
      await sharp(inputPath)
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      size = stats.size;

      if (size >= targetSize - tolerance && size <= targetSize + tolerance) {
        break;
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

    return { success: true, size };
  } catch (error) {
    return {
      success: false,
      size: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log('开始转换 Al Bhed 页面图片为 WebP 格式（4:3 比例）...\n');

  const results: {
    original: string;
    new: string;
    originalSize: number;
    newSize: number;
    status: string;
    description: string;
  }[] = [];

  for (const mapping of imageMappings) {
    const { originalPath, newName, description } = mapping;
    const outputPath = path.join(
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs',
      newName
    );

    console.log(`处理: ${path.basename(originalPath)}`);
    console.log(`描述: ${description}`);
    console.log(`新文件名: ${newName}`);
    console.log(`目标尺寸: ${targetWidth}x${targetHeight} (4:3)`);

    // Check if file exists
    if (!fs.existsSync(originalPath)) {
      console.log(`✗ 文件不存在: ${originalPath}\n`);
      continue;
    }

    // Get original file size
    const originalStats = fs.statSync(originalPath);
    const originalSize = originalStats.size;

    // Convert to WebP
    const result = await convertToWebP(originalPath, outputPath);

    if (result.success) {
      const compressionRatio = (
        ((originalSize - result.size) / originalSize) *
        100
      ).toFixed(2);
      console.log(
        `✓ 转换成功: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(result.size / 1024).toFixed(2)}KB (压缩率: ${compressionRatio}%)`
      );

      results.push({
        original: path.basename(originalPath),
        new: newName,
        originalSize,
        newSize: result.size,
        status: '成功',
        description,
      });
    } else {
      console.log(`✗ 转换失败: ${result.error}`);
      results.push({
        original: path.basename(originalPath),
        new: newName,
        originalSize,
        newSize: 0,
        status: `失败: ${result.error}`,
        description,
      });
    }

    console.log('');
  }

  // Print summary
  console.log('\n\n=== 转换报告 ===\n');
  console.log(
    '描述'.padEnd(40) + '原大小'.padEnd(15) + '新大小'.padEnd(15) + '状态'
  );
  console.log('='.repeat(90));

  for (const result of results) {
    const originalSizeStr = `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`;
    const newSizeStr = `${(result.newSize / 1024).toFixed(2)}KB`;

    console.log(
      result.description.padEnd(40) +
        originalSizeStr.padEnd(15) +
        newSizeStr.padEnd(15) +
        result.status
    );
  }

  console.log('\n转换完成！原始 PNG 文件保留。');
  console.log('\n下一步：更新页面代码中的图片引用');
}

main();
