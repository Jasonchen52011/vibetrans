/**
 * 重新生成 Samoan to English Translator 的 What Is 图片
 *
 * 使用场景：原图生成失败，需要单独重新生成
 */

import { writeFileSync } from 'fs';
import path from 'path';
import { generateIllustration } from '@/lib/article-illustrator/image-generator';
import { convertToWebP } from '@/lib/article-illustrator/webp-converter';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public/images/docs');
const TARGET_SIZE_KB = 90;
const TOLERANCE_KB = 5;

async function main() {
  console.log('\n🎨 重新生成 Samoan to English Translator - What Is 图片\n');

  const prompt =
    'Geometric flat illustration, centered composition, dominant sky blue background, a Samoan flag icon connecting via dotted lines to an English flag icon. A speech bubble splits, with Samoan symbol transforming into English symbol. Add pastel yellow and mint green abstract shapes symbolizing communication. A smiling globe icon subtly in the background, spacious negative space, 4:3 aspect ratio.';

  const filename = 'translate-samoa-english';

  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
  console.log(
    `🎯 Target: ${filename}.webp (${TARGET_SIZE_KB}KB ±${TOLERANCE_KB}KB)\n`
  );

  try {
    // 生成图片
    console.log('🎨 [Multi-Model] 开始生成图片...');
    const result = await generateIllustration({
      prompt,
      filename,
    });

    if (!result.url) {
      throw new Error('图片生成失败：未返回图片 URL');
    }

    console.log(`✅ 图片生成成功 (使用 ${result.modelUsed})`);
    console.log(`📷 URL: ${result.url.substring(0, 60)}...`);

    // 转换为 WebP
    console.log('\n📦 转换为 WebP 格式...');
    const webpPath = await convertToWebP(
      result.url,
      filename,
      OUTPUT_DIR,
      TARGET_SIZE_KB,
      TOLERANCE_KB
    );

    console.log(`✅ 图片已保存: ${webpPath}`);

    // 更新 en.json 中的图片引用
    console.log('\n📝 更新 en.json 中的图片引用...');
    const enJsonPath = path.join(
      process.cwd(),
      'messages/pages/samoan-to-english-translator/en.json'
    );

    const fs = await import('fs');
    const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));

    if (enJson.SamoanToEnglishTranslatorPage?.whatIs) {
      enJson.SamoanToEnglishTranslatorPage.whatIs.image = `/images/docs/${filename}.webp`;
      fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2));
      console.log('✅ en.json 已更新');
    }

    console.log('\n🎉 完成！图片已重新生成并更新引用\n');
  } catch (error) {
    console.error('\n❌ 生成失败:', error);
    console.error('\n可能的原因:');
    console.error('  1. Volcano Engine API 配额不足');
    console.error('  2. 网络连接问题');
    console.error('  3. API 密钥配置错误');
    console.error('\n建议:');
    console.error(
      '  - 检查 .env.local 中的 VOLC_ACCESS_KEY 和 VOLC_SECRET_KEY'
    );
    console.error('  - 稍后重试');
    console.error(
      '  - 或手动上传图片到 public/images/docs/translate-samoa-english.webp'
    );
    process.exit(1);
  }
}

main();
