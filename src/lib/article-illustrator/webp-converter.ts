/**
 * WebP Converter - Convert and optimize images to WebP format
 */

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

export interface WebPConversionOptions {
  filename: string; // 不含扩展名
  targetSize?: number; // KB, 默认 90KB
  tolerance?: number; // KB, 默认 5KB
}

export interface WebPConversionResult {
  success: boolean;
  filename: string; // 带 .webp 扩展名
  path: string; // 完整路径
  size: number; // KB
  dimensions: string; // "800x600"
  error?: string;
}

/**
 * Convert image buffer to WebP (800x600, ~90KB, 4:3 ratio)
 */
export async function convertToWebP(
  inputBuffer: Buffer,
  options: WebPConversionOptions
): Promise<WebPConversionResult> {
  const { filename, targetSize = 90, tolerance = 5 } = options;

  const outputFilename = `${filename}.webp`;
  const outputPath = path.join(
    process.cwd(),
    'public/images/docs',
    outputFilename
  );

  console.log(
    `\n🔄 [WebP] Converting: ${filename} (target: ${targetSize}KB ±${tolerance}KB)`
  );

  try {
    // 确保 docs 目录存在
    const docsDir = path.join(process.cwd(), 'public/images/docs');
    await fs.mkdir(docsDir, { recursive: true });

    // 二分法查找最佳质量参数
    let quality = 85;
    let fileSize = 0;
    const targetBytes = targetSize * 1024;
    const toleranceBytes = tolerance * 1024;

    let minQuality = 75;
    let maxQuality = 100;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await sharp(inputBuffer)
        .resize(800, 600, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      fileSize = stats.size;

      console.log(
        `   尝试 ${attempts + 1}/${maxAttempts}: quality=${quality}, size=${(fileSize / 1024).toFixed(2)}KB`
      );

      // 检查是否在目标范围内
      if (
        fileSize >= targetBytes - toleranceBytes &&
        fileSize <= targetBytes + toleranceBytes
      ) {
        console.log(`✅ [WebP] 文件大小符合要求！`);
        break;
      }

      // 调整质量参数
      if (fileSize > targetBytes + toleranceBytes) {
        maxQuality = quality;
        quality = Math.floor((minQuality + quality) / 2);
      } else {
        minQuality = quality;
        quality = Math.floor((quality + maxQuality) / 2);
      }

      attempts++;

      // 避免陷入死循环
      if (minQuality >= maxQuality - 1) {
        console.log(`   达到质量调整极限，使用当前参数`);
        break;
      }
    }

    const finalSizeKB = Math.round(fileSize / 1024);

    console.log(
      `✅ [WebP] 转换完成: ${outputFilename} (${finalSizeKB}KB, 800x600)`
    );

    return {
      success: true,
      filename: outputFilename,
      path: outputPath,
      size: finalSizeKB,
      dimensions: '800x600',
    };
  } catch (error: any) {
    console.error(`❌ [WebP] 转换失败:`, error.message);
    return {
      success: false,
      filename: outputFilename,
      path: outputPath,
      size: 0,
      dimensions: '800x600',
      error: error.message,
    };
  }
}

/**
 * Convert data URL to WebP
 */
export async function convertDataURLToWebP(
  dataUrl: string,
  options: WebPConversionOptions
): Promise<WebPConversionResult> {
  // 提取 base64 数据
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid data URL format');
  }

  const buffer = Buffer.from(base64Data, 'base64');
  return convertToWebP(buffer, options);
}

/**
 * Convert HTTP URL to WebP
 */
export async function convertURLToWebP(
  url: string,
  options: WebPConversionOptions
): Promise<WebPConversionResult> {
  console.log(`📥 [WebP] Downloading image from: ${url.substring(0, 100)}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return convertToWebP(buffer, options);
}

/**
 * Test helper - convert existing image file
 */
export async function testConvertFile(
  inputPath: string,
  outputFilename: string
): Promise<WebPConversionResult> {
  const buffer = await fs.readFile(inputPath);
  return convertToWebP(buffer, { filename: outputFilename });
}
