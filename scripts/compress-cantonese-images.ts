/**
 * 压缩已生成的 Cantonese 图片到 90KB 以内
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { convertToWebP } from '../src/lib/article-illustrator/webp-converter';

const images = [
  'cantonese-translation-technology-ai.webp',
  'cantonese-tones-musical-system.webp',
  'english-cantonese-loanwords.webp',
  'hongkong-street-slang-culture.webp',
  'app-integration-whatsapp-wechat.webp',
];

async function main() {
  console.log('\n🔧 开始压缩 Cantonese 图片到 90KB...\n');

  const docsDir = path.join(process.cwd(), 'public', 'images', 'docs');

  for (const imageName of images) {
    const imagePath = path.join(docsDir, imageName);

    try {
      // 检查文件是否存在
      await fs.access(imagePath);

      // 获取当前大小
      const beforeStats = await fs.stat(imagePath);
      const beforeSizeKB = Math.round(beforeStats.size / 1024);

      console.log(`📸 处理: ${imageName} (${beforeSizeKB}KB)`);

      if (beforeSizeKB <= 90) {
        console.log(`   ✅ 已符合要求，跳过\n`);
        continue;
      }

      // 读取原文件为 Buffer
      const imageBuffer = await fs.readFile(imagePath);

      // 重新压缩到 90KB
      await convertToWebP(imageBuffer, {
        filename: imageName.replace('.webp', ''),
        targetSize: 90,
        tolerance: 5,
      });

      // 检查压缩后大小
      const afterStats = await fs.stat(imagePath);
      const afterSizeKB = Math.round(afterStats.size / 1024);

      console.log(`   ✅ 压缩完成: ${beforeSizeKB}KB → ${afterSizeKB}KB\n`);
    } catch (error: any) {
      console.error(`   ❌ 处理失败: ${error.message}\n`);
    }
  }

  console.log('🎉 所有图片压缩完成！\n');
}

main().catch(console.error);
