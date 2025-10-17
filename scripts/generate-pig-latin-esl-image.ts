#!/usr/bin/env ts-node

/**
 * 生成 Pig Latin ESL Learners 图片
 * 基于 "Perfect for ESL Learners and Teachers" section
 */

import path from 'path';
import dotenv from 'dotenv';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

async function main() {
  console.log('🎨 开始生成 Pig Latin ESL Learners 图片...\n');

  const task = {
    prompt: `Geometric Flat Style cartoon illustration, clean lines, bright warm colors, dominant sunshine yellow and sky blue,
    stylized ESL classroom scene with diverse students learning English phonics through Pig Latin transformation,
    center shows large textbook displaying "hello" transforming into "ellohay" with animated letter movement arrows in sky blue,
    cheerful teacher character (geometric circular head, rectangular body with simple features) pointing at transformation with smile,
    three diverse student characters (different geometric shapes representing different ethnicities) sitting at rounded rectangular desks,
    floating geometric speech bubbles showing consonant clusters breaking apart and recombining playfully,
    abstract phonetic sound waves as curved geometric lines in soft pastel colors radiating from words,
    decorative elements include geometric stars representing achievement, simple alphabet blocks in corners,
    educational chart symbols as minimalist icons, all rendered in clean flat design with soft gradient background,
    warm supportive learning atmosphere, energetic motion showing language transformation, no text, no logo`,
    filename: 'pig-latin-esl-learners.webp',
  };

  try {
    const result = await generateIllustration(task);
    console.log('✅ 图片生成成功！');
    console.log('📝 使用模型:', result.modelUsed);
    console.log('🔗 图片 URL:', result.url);
    console.log('');
    console.log('💡 接下来请手动下载并转换图片：');
    console.log(`   npx tsx scripts/convert-pig-latin-esl-image.ts`);
  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

main();
