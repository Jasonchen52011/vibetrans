import { existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { dirname, join, parse } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const avatarsDir = join(__dirname, 'public', 'images', 'avatars');
const TARGET_SIZE_KB = 60;
const TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024;

async function findOptimalParams(inputFile, outputFile, targetSize) {
  const metadata = await sharp(inputFile).metadata();
  const originalWidth = metadata.width;

  // 尝试不同的尺寸和质量组合
  const sizesToTry = [
    { width: originalWidth, label: '原始' },
    { width: Math.floor(originalWidth * 0.7), label: '70%' },
    { width: Math.floor(originalWidth * 0.5), label: '50%' },
    { width: Math.floor(originalWidth * 0.4), label: '40%' },
    { width: Math.floor(originalWidth * 0.3), label: '30%' },
  ];

  const tempFile = outputFile + '.tmp';
  let bestParams = {
    width: originalWidth,
    quality: 75,
    size: 0,
    label: '原始',
  };
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const sizeConfig of sizesToTry) {
    let minQuality = 50;
    let maxQuality = 95;
    let attempts = 0;
    const maxAttempts = 6;

    while (attempts < maxAttempts && maxQuality - minQuality > 3) {
      const quality = Math.floor((minQuality + maxQuality) / 2);

      let processor = sharp(inputFile);

      if (sizeConfig.width < originalWidth) {
        processor = processor.resize(sizeConfig.width, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      await processor.webp({ quality, effort: 4 }).toFile(tempFile);

      const size = statSync(tempFile).size;
      const diff = Math.abs(size - targetSize);

      if (diff < bestDiff) {
        bestParams = {
          width: sizeConfig.width,
          quality,
          size,
          label: sizeConfig.label,
        };
        bestDiff = diff;
      }

      // 如果已经接近目标，就不用继续尝试更小的尺寸
      if (diff < targetSize * 0.15) {
        unlinkSync(tempFile);
        return bestParams;
      }

      if (size > targetSize) {
        maxQuality = quality - 1;
      } else {
        minQuality = quality + 1;
      }

      attempts++;

      if (existsSync(tempFile)) {
        unlinkSync(tempFile);
      }
    }

    // 如果这个尺寸已经很接近目标了，就不用继续尝试更小的尺寸
    if (bestDiff < targetSize * 0.2) {
      break;
    }
  }

  if (existsSync(tempFile)) {
    unlinkSync(tempFile);
  }

  return bestParams;
}

async function compressImage(inputFile, outputFile) {
  const originalSize = statSync(inputFile).size;
  const fileName = parse(inputFile).base;
  const metadata = await sharp(inputFile).metadata();

  console.log(`\n处理: ${fileName}`);
  console.log(
    `原始: ${(originalSize / 1024).toFixed(2)} KB, ${metadata.width}x${metadata.height}`
  );

  // 查找最佳参数（尺寸 + 质量）
  const params = await findOptimalParams(
    inputFile,
    outputFile,
    TARGET_SIZE_BYTES
  );

  // 生成最终文件
  let processor = sharp(inputFile);

  if (params.width < metadata.width) {
    processor = processor.resize(params.width, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const info = await processor
    .webp({ quality: params.quality, effort: 6 })
    .toFile(outputFile);

  const finalSize = info.size;
  const compression = ((1 - finalSize / originalSize) * 100).toFixed(2);
  const finalMeta = await sharp(outputFile).metadata();

  console.log(`缩放: ${params.label}, 质量: ${params.quality}`);
  console.log(
    `输出: ${(finalSize / 1024).toFixed(2)} KB, ${finalMeta.width}x${finalMeta.height}`
  );
  console.log(`压缩率: ${compression}%`);

  return {
    input: fileName,
    output: parse(outputFile).base,
    originalSize,
    finalSize,
    width: finalMeta.width,
    quality: params.quality,
    scale: params.label,
    compression,
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('开始压缩头像图片');
  console.log(`目录: ${avatarsDir}`);
  console.log(`目标大小: ${TARGET_SIZE_KB} KB`);
  console.log('='.repeat(60));

  const files = readdirSync(avatarsDir).filter((file) =>
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  console.log(`\n找到 ${files.length} 个图片文件`);

  const results = [];

  for (const file of files) {
    const inputPath = join(avatarsDir, file);
    const outputPath = join(avatarsDir, parse(file).name + '.webp');

    try {
      const result = await compressImage(inputPath, outputPath);
      results.push(result);
    } catch (error) {
      console.error(`\n✗ 处理 ${file} 失败:`, error.message);
    }
  }

  // 打印汇总
  console.log('\n' + '='.repeat(75));
  console.log('处理汇总');
  console.log('='.repeat(75));
  console.log(
    '\n' +
      '文件名'.padEnd(20) +
      '原始'.padEnd(12) +
      '压缩后'.padEnd(12) +
      '尺寸'.padEnd(12) +
      '缩放'.padEnd(8) +
      'Q'.padEnd(5) +
      '压缩率'
  );
  console.log('-'.repeat(75));

  let totalOriginal = 0;
  let totalFinal = 0;

  for (const result of results) {
    totalOriginal += result.originalSize;
    totalFinal += result.finalSize;

    console.log(
      result.output.padEnd(20) +
        `${(result.originalSize / 1024).toFixed(0)} KB`.padEnd(12) +
        `${(result.finalSize / 1024).toFixed(0)} KB`.padEnd(12) +
        `${result.width || '-'}`.padEnd(12) +
        `${result.scale || '-'}`.padEnd(8) +
        `${result.quality}`.padEnd(5) +
        `${result.compression}%`
    );
  }

  console.log('-'.repeat(75));
  console.log(
    '总计'.padEnd(20) +
      `${(totalOriginal / 1024).toFixed(0)} KB`.padEnd(12) +
      `${(totalFinal / 1024).toFixed(0)} KB`.padEnd(36) +
      `${((1 - totalFinal / totalOriginal) * 100).toFixed(2)}%`
  );

  console.log('\n生成的 webp 文件:');
  results.forEach((r) => console.log(`  ✓ ${r.output}`));

  console.log('\n✅ 所有文件处理完成！');
}

main().catch(console.error);
