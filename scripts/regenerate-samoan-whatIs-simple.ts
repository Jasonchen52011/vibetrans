/**
 * 简化版：直接下载并转换 What Is 图片
 */

import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { generateImage as generateVolcanoImage } from '@/lib/volcano-image';
import { config } from 'dotenv';
import sharp from 'sharp';

// 加载环境变量
config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public/images/docs');
const FILENAME = 'translate-samoa-english.webp';

async function downloadAndConvert(url: string, outputPath: string) {
  console.log('📥 下载图片...');
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());

  console.log('🔄 转换为 WebP 格式...');

  // 尝试不同的质量等级以达到目标大小 (90KB ±5KB)
  let quality = 85;
  let webpBuffer = await sharp(buffer)
    .resize(800, 600, { fit: 'cover' })
    .webp({ quality })
    .toBuffer();

  let sizeKB = webpBuffer.length / 1024;
  console.log(`   质量 ${quality}: ${sizeKB.toFixed(2)} KB`);

  // 调整质量以接近 90KB
  if (sizeKB < 85) {
    quality = 95;
    webpBuffer = await sharp(buffer)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality })
      .toBuffer();
    sizeKB = webpBuffer.length / 1024;
    console.log(`   质量 ${quality}: ${sizeKB.toFixed(2)} KB`);
  }

  if (sizeKB < 85) {
    quality = 98;
    webpBuffer = await sharp(buffer)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality })
      .toBuffer();
    sizeKB = webpBuffer.length / 1024;
    console.log(`   质量 ${quality}: ${sizeKB.toFixed(2)} KB`);
  }

  writeFileSync(outputPath, webpBuffer);
  console.log(
    `✅ 图片已保存: ${outputPath} (${sizeKB.toFixed(2)} KB, 800x600)`
  );
  return sizeKB;
}

async function main() {
  console.log('\n🎨 重新生成 Samoan to English Translator - What Is 图片\n');

  const prompt =
    'Geometric flat illustration, centered composition, dominant sky blue background, a Samoan flag icon connecting via dotted lines to an English flag icon. A speech bubble splits, with Samoan symbol transforming into English symbol. Add pastel yellow and mint green abstract shapes symbolizing communication. A smiling globe icon subtly in the background, spacious negative space, 4:3 aspect ratio.';

  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
  console.log(`🎯 Target: ${FILENAME} (90KB ±5KB)\n`);

  try {
    // 生成图片
    console.log('🎨 [Volcano 4.0] 开始生成图片...\n');
    const result = await generateVolcanoImage({
      prompt,
      mode: 'text',
      size: '2K',
      watermark: false,
    });

    if (!result.data || result.data.length === 0) {
      throw new Error('图片生成失败：未返回图片数据');
    }

    const imageUrl = result.data[0].url;
    console.log(`✅ 图片生成成功`);
    console.log(`📷 URL: ${imageUrl.substring(0, 80)}...\n`);

    // 确保输出目录存在
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // 下载并转换
    const outputPath = path.join(OUTPUT_DIR, FILENAME);
    const sizeKB = await downloadAndConvert(imageUrl, outputPath);

    // 更新 en.json
    console.log('\n📝 更新 en.json 中的图片引用...');
    const enJsonPath = path.join(
      process.cwd(),
      'messages/pages/samoan-to-english-translator/en.json'
    );

    const fs = await import('fs');
    const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));

    if (enJson.SamoanToEnglishTranslatorPage?.whatIs) {
      enJson.SamoanToEnglishTranslatorPage.whatIs.image = `/images/docs/${FILENAME}`;
      fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2));
      console.log('✅ en.json 已更新');
    }

    console.log('\n🎉 完成！图片已重新生成并更新引用');
    console.log(`📁 文件位置: public/images/docs/${FILENAME}`);
    console.log(`📊 文件大小: ${sizeKB.toFixed(2)} KB\n`);
  } catch (error) {
    console.error('\n❌ 生成失败:', error);
    console.error('\n建议:');
    console.error('  - 检查网络连接');
    console.error('  - 检查 Volcano API 配额');
    console.error('  - 或稍后重试');
    process.exit(1);
  }
}

main();
