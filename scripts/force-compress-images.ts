/**
 * 使用 Sharp 强制压缩图片到指定大小
 */

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';

const TARGET_SIZE_KB = 85; // 目标 85KB，留点余量

const images = [
  'cantonese-translation-technology-ai.webp',
  'cantonese-tones-musical-system.webp',
  'english-cantonese-loanwords.webp',
  'hongkong-street-slang-culture.webp',
  'app-integration-whatsapp-wechat.webp'
];

async function compressImage(imagePath: string, targetSizeKB: number): Promise<void> {
  const imageName = path.basename(imagePath);

  // 读取原始文件大小
  const beforeStats = await fs.stat(imagePath);
  const beforeSizeKB = Math.round(beforeStats.size / 1024);

  console.log(`📸 压缩: ${imageName} (${beforeSizeKB}KB → 目标${targetSizeKB}KB)`);

  let quality = 75; // 起始质量
  let attempt = 0;
  const maxAttempts = 15;

  while (attempt < maxAttempts) {
    attempt++;

    // 压缩图片
    const tempPath = imagePath + '.temp';
    await sharp(imagePath)
      .webp({ quality, effort: 6 })
      .toFile(tempPath);

    // 检查文件大小
    const stats = await fs.stat(tempPath);
    const sizeKB = Math.round(stats.size / 1024);

    console.log(`   尝试 ${attempt}: quality=${quality}, size=${sizeKB}KB`);

    if (sizeKB <= targetSizeKB) {
      // 成功！替换原文件
      await fs.rename(tempPath, imagePath);
      console.log(`   ✅ 压缩成功: ${beforeSizeKB}KB → ${sizeKB}KB\n`);
      return;
    }

    // 调整质量
    if (sizeKB > targetSizeKB) {
      quality -= 5;
      if (quality < 50) {
        // 质量太低了，接受当前结果
        await fs.rename(tempPath, imagePath);
        console.log(`   ⚠️  达到最低质量限制: ${sizeKB}KB\n`);
        return;
      }
    }

    // 删除临时文件
    await fs.unlink(tempPath);
  }

  console.log(`   ❌ 达到最大尝试次数\n`);
}

async function main() {
  console.log('\n🔧 强制压缩 Cantonese 图片...\n');

  const docsDir = path.join(process.cwd(), 'public', 'images', 'docs');

  for (const imageName of images) {
    const imagePath = path.join(docsDir, imageName);

    try {
      await fs.access(imagePath);
      await compressImage(imagePath, TARGET_SIZE_KB);
    } catch (error: any) {
      console.error(`❌ 处理失败 ${imageName}: ${error.message}\n`);
    }
  }

  console.log('🎉 所有图片压缩完成！\n');

  // 显示最终结果
  console.log('📋 最终大小：');
  for (const imageName of images) {
    const imagePath = path.join(docsDir, imageName);
    try {
      const stats = await fs.stat(imagePath);
      const sizeKB = Math.round(stats.size / 1024);
      const status = sizeKB <= 90 ? '✅' : '⚠️ ';
      console.log(`   ${status} ${imageName}: ${sizeKB}KB`);
    } catch (e) {
      // ignore
    }
  }
  console.log('');
}

main().catch(console.error);
