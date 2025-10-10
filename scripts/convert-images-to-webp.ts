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
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/what-is.jpeg',
    newName: 'announcement-and-innovation.webp',
    description: '宣传和创新（扩音器和灯泡）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/未命名项目-图层 1 (1).jpeg',
    newName: 'social-media-content-creation.webp',
    description: '社交媒体内容创作（彩虹背景、笔记本、社交图标）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/未命名项目-图层 1 (2).jpeg',
    newName: 'mobile-app-interaction.webp',
    description: '移动应用互动（手机、点赞、相机图标）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/未命名项目-图层 1 (5).jpeg',
    newName: 'ai-learning-system.webp',
    description: 'AI学习系统（机器人、显示器、符号）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/未命名项目-图层 1 (7).jpeg',
    newName: 'bad-translator-celebration.webp',
    description: 'Bad Translator庆祝（手机上显示"Horrt mbe"）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/未命名项目-图层 1.jpeg',
    newName: 'social-media-selfie.webp',
    description: '社交媒体自拍（表情符号、自拍杆、点赞）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/未命名项目.jpeg',
    newName: 'creative-tablet-fun.webp',
    description: '创意平板娱乐（孩子使用平板、几何图形）',
  },
];

const targetSize = 90 * 1024; // 90KB in bytes
const tolerance = 5 * 1024; // ±5KB tolerance

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
    let highQuality = 85;

    // Binary search for optimal quality
    while (attempts < maxAttempts) {
      quality = Math.floor((lowQuality + highQuality) / 2);
      await sharp(inputPath).webp({ quality }).toFile(outputPath);

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
  console.log('开始批量转换图片为 WebP 格式...\n');

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

  // Delete original files
  console.log('\n删除原始 JPEG 文件...\n');
  for (const mapping of imageMappings) {
    const result = results.find(
      (r) => r.original === path.basename(mapping.originalPath)
    );
    if (result && result.status === '成功') {
      fs.unlinkSync(mapping.originalPath);
      console.log(`✓ 已删除: ${path.basename(mapping.originalPath)}`);
    }
  }

  // Print summary
  console.log('\n\n=== 转换报告 ===\n');
  console.log(
    '文件名映射'.padEnd(70) + '原大小'.padEnd(15) + '新大小'.padEnd(15) + '状态'
  );
  console.log('='.repeat(120));

  for (const result of results) {
    const mapping = `${result.original} → ${result.new}`;
    const originalSizeStr = `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`;
    const newSizeStr = `${(result.newSize / 1024).toFixed(2)}KB`;

    console.log(
      mapping.padEnd(70) +
        originalSizeStr.padEnd(15) +
        newSizeStr.padEnd(15) +
        result.status
    );
  }

  console.log('\n转换完成！所有原始 JPEG 文件已删除。');
}

main();
