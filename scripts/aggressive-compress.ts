/**
 * 进一步压缩剩余的2张图片
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const images = [
  'english-cantonese-loanwords.webp',
  'hongkong-street-slang-culture.webp',
];

async function aggressiveCompress(imagePath: string): Promise<void> {
  const imageName = path.basename(imagePath);

  // 读取原始文件大小
  const beforeStats = await fs.stat(imagePath);
  const beforeSizeKB = Math.round(beforeStats.size / 1024);

  console.log(`📸 处理: ${imageName} (${beforeSizeKB}KB → 目标90KB以内)`);

  // 策略1: 降低分辨率 + 降低质量
  let width = 800;
  let quality = 65;
  let attempt = 0;

  while (attempt < 20) {
    attempt++;

    const tempPath = imagePath + '.temp';

    await sharp(imagePath)
      .resize({ width, height: Math.round(width * 0.75), fit: 'inside' })
      .webp({ quality, effort: 6 })
      .toFile(tempPath);

    const stats = await fs.stat(tempPath);
    const sizeKB = Math.round(stats.size / 1024);

    console.log(
      `   尝试 ${attempt}: width=${width}px, quality=${quality}, size=${sizeKB}KB`
    );

    if (sizeKB <= 90) {
      await fs.rename(tempPath, imagePath);
      console.log(`   ✅ 压缩成功: ${beforeSizeKB}KB → ${sizeKB}KB\n`);
      return;
    }

    // 调整参数
    if (sizeKB > 90) {
      if (quality > 50) {
        quality -= 3;
      } else if (width > 600) {
        width -= 50;
        quality = 65; // 重置质量
      } else {
        quality -= 2;
        if (quality < 40) {
          await fs.rename(tempPath, imagePath);
          console.log(`   ⚠️  达到最低限制: ${sizeKB}KB\n`);
          return;
        }
      }
    }

    await fs.unlink(tempPath);
  }

  console.log(`   ❌ 达到最大尝试次数\n`);
}

async function main() {
  console.log('\n🔧 激进压缩剩余2张图片...\n');

  const docsDir = path.join(process.cwd(), 'public', 'images', 'docs');

  for (const imageName of images) {
    const imagePath = path.join(docsDir, imageName);

    try {
      await fs.access(imagePath);
      await aggressiveCompress(imagePath);
    } catch (error: any) {
      console.error(`❌ 处理失败 ${imageName}: ${error.message}\n`);
    }
  }

  console.log('🎉 压缩完成！\n');

  // 显示最终结果
  console.log('📋 最终所有5张图片大小：');
  const allImages = [
    'cantonese-translation-technology-ai.webp',
    'cantonese-tones-musical-system.webp',
    'english-cantonese-loanwords.webp',
    'hongkong-street-slang-culture.webp',
    'app-integration-whatsapp-wechat.webp',
  ];

  for (const imageName of allImages) {
    const imagePath = path.join(docsDir, imageName);
    try {
      const stats = await fs.stat(imagePath);
      const sizeKB = Math.round(stats.size / 1024);
      const status = sizeKB <= 90 ? '✅' : '⚠️ ';
      console.log(`   ${status} ${imageName}: ${sizeKB}KB`);
    } catch (e) {
      console.log(`   ❌ ${imageName}: 文件不存在`);
    }
  }
  console.log('');
}

main().catch(console.error);
