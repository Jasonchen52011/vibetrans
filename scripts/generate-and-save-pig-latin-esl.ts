#!/usr/bin/env ts-node

/**
 * 使用 Volcano 4.0 生成并保存 Pig Latin ESL Learners 图片
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';

async function main() {
  console.log('🎨 使用 Volcano 4.0 生成 Pig Latin ESL Learners 图片...\n');

  const prompt = `Geometric Flat Style cartoon illustration, clean lines, bright warm colors, dominant sunshine yellow and sky blue,
    stylized ESL classroom scene with diverse students learning English phonics through Pig Latin transformation,
    center shows large textbook displaying "hello" transforming into "ellohay" with animated letter movement arrows in sky blue,
    cheerful teacher character (geometric circular head, rectangular body with simple features) pointing at transformation with smile,
    three diverse student characters (different geometric shapes representing different ethnicities) sitting at rounded rectangular desks,
    floating geometric speech bubbles showing consonant clusters breaking apart and recombining playfully,
    abstract phonetic sound waves as curved geometric lines in soft pastel colors radiating from words,
    decorative elements include geometric stars representing achievement, simple alphabet blocks in corners,
    educational chart symbols as minimalist icons, all rendered in clean flat design with soft gradient background,
    warm supportive learning atmosphere, energetic motion showing language transformation, no text, no logo`;

  try {
    // Step 1: 生成图片
    const result = await generateIllustration({
      prompt,
      filename: 'pig-latin-esl-learners.webp',
    });

    console.log('\n✅ 图片生成成功！');
    console.log('📝 使用模型:', result.modelUsed);
    console.log('🔗 图片 URL:', result.url);

    // Step 2: 下载并转换为 WebP
    console.log('\n📥 正在下载并转换为 WebP...');
    const webpResult = await convertURLToWebP(result.url, {
      filename: 'pig-latin-esl-learners.webp',
      targetSize: 90, // 目标 90KB
    });

    console.log('\n✅ 图片保存成功！');
    console.log('📁 保存位置:', webpResult.path);
    console.log('📊 文件大小:', `${webpResult.size}KB`);
    console.log('📊 尺寸:', webpResult.dimensions);
  } catch (error) {
    console.error('\n❌ 生成失败:', error);
    process.exit(1);
  }
}

main();
