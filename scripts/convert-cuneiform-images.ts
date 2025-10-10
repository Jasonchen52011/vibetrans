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
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-2553-What is Cuneiform Translator_ Geometric ....png',
    newName: 'what-is-cuneiform-translator.webp',
    description: '什么是楔形文字翻译器（机器人和楔形文字）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-3896-Cuneiform Texts in Modern Research Geome....png',
    newName: 'cuneiform-texts-research.webp',
    description: '现代研究中的楔形文字（放大镜研究泥板）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-7159-Cultural Heritage and Preservation, geom....png',
    newName: 'cultural-heritage-preservation.webp',
    description: '文化遗产保护（手捧泥板）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-6013-Cuneiform and AI Technology, geometric f....png',
    newName: 'cuneiform-ai-technology.webp',
    description: '楔形文字与AI技术（芯片和泥板）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-7463-Why Learn Cuneiform_ Geometric Flat Styl....png',
    newName: 'why-learn-cuneiform.webp',
    description: '为什么学习楔形文字（钥匙开门）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-2519-Fun Facts (Version 1) Geometric Flat Sty....png',
    newName: 'ancient-written-law.webp',
    description: '古代成文法（方尖碑）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-5917-Fun Fact 1 Geometric Flat Style cartoon ....png',
    newName: 'multi-purpose-script.webp',
    description: '多用途文字（药水瓶和行星）',
  },
  {
    originalPath:
      '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/jimeng-2025-10-10-2553-What is Cuneiform Translator_ Geometric ....png',
    newName: 'cuneiform-translator.webp',
    description: 'SEO元数据图（同what-is）',
  },
];

const targetSize = 90 * 1024; // 90KB in bytes
const tolerance = 5 * 1024; // ±5KB tolerance
const cropTop = 350; // Remove top 350px watermark

async function convertToWebP(
  inputPath: string,
  outputPath: string
): Promise<{
  success: boolean;
  size: number;
  width: number;
  height: number;
  error?: string;
}> {
  try {
    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Calculate dimensions after cropping top 350px
    const croppedHeight = originalHeight - cropTop;

    // Target dimensions for 4:3 ratio - use standard size for web
    const targetWidth = 1600;
    const targetHeight = 1200;

    let quality = 75;
    let size = 0;
    let attempts = 0;
    const maxAttempts = 15;
    let lowQuality = 40;
    let highQuality = 90;

    // Binary search for optimal quality
    while (attempts < maxAttempts) {
      quality = Math.floor((lowQuality + highQuality) / 2);

      // Crop top 350px, then resize to 4:3 ratio and convert to webp
      await sharp(inputPath)
        .extract({
          left: 0,
          top: cropTop,
          width: originalWidth,
          height: croppedHeight,
        })
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

    return { success: true, size, width: targetWidth, height: targetHeight };
  } catch (error) {
    return {
      success: false,
      size: 0,
      width: 0,
      height: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log('开始转换 Cuneiform 页面图片...');
  console.log(
    '处理步骤：1. 裁剪顶部350px水印 2. 调整为4:3比例 3. 转换为WebP（~90KB）\n'
  );

  const results: {
    original: string;
    new: string;
    originalSize: number;
    newSize: number;
    dimensions: string;
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
        `✓ 转换成功: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(result.size / 1024).toFixed(2)}KB (${result.width}x${result.height}, 压缩率: ${compressionRatio}%)`
      );

      results.push({
        original: path.basename(originalPath),
        new: newName,
        originalSize,
        newSize: result.size,
        dimensions: `${result.width}x${result.height}`,
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
        dimensions: '0x0',
        status: `失败: ${result.error}`,
        description,
      });
    }

    console.log('');
  }

  // Print summary
  console.log('\n\n=== 转换报告 ===\n');
  console.log(
    '描述'.padEnd(50) +
      '原大小'.padEnd(15) +
      '新大小'.padEnd(15) +
      '尺寸'.padEnd(15) +
      '状态'
  );
  console.log('='.repeat(120));

  for (const result of results) {
    const originalSizeStr = `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`;
    const newSizeStr = `${(result.newSize / 1024).toFixed(2)}KB`;

    console.log(
      result.description.padEnd(50) +
        originalSizeStr.padEnd(15) +
        newSizeStr.padEnd(15) +
        result.dimensions.padEnd(15) +
        result.status
    );
  }

  console.log('\n转换完成！原始 PNG 文件保留，待验证后删除。');
  console.log('\n下一步：');
  console.log('1. 截取页面第一屏幕作为 how-to 配图');
  console.log('2. 验证所有图片');
  console.log('3. 删除原始 PNG 文件');
}

main();
