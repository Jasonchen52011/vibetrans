#!/usr/bin/env ts-node

/**
 * 下载并转换 Pig Latin ESL Learners 图片为 WebP
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';

async function main() {
  console.log('🎨 开始下载并转换图片为 WebP...\n');

  const imageUrl = 'https://tempfile.aiquickdraw.com/f/7219d1038ea29c0dd0527cda98a30f87_1760328548_1ll98yrt.png';
  const filename = 'pig-latin-esl-learners.webp';

  try {
    const result = await convertURLToWebP(imageUrl, {
      filename,
      targetSize: 90, // 目标 90KB
    });

    if (result.success) {
      console.log('✅ 图片转换成功！');
      console.log('📁 保存位置:', result.path);
      console.log('📊 文件大小:', `${result.size}KB`);
      console.log('📊 尺寸:', result.dimensions);
    } else {
      console.error('❌ 转换失败:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 转换失败:', error);
    process.exit(1);
  }
}

main();
