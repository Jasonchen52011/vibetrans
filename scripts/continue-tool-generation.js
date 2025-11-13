#!/usr/bin/env node

/**
 * 继续工具生成 - 跳过 Phase 3 代码生成
 * 用于当代码已存在，只需要生成内容和图片的场景
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 读取现有的 auto-tool-generator.js 中的函数
// 由于我们需要重用所有的 phase 函数，我们直接导入整个模块
const autoToolGenerator = await import('./auto-tool-generator.js');

async function main() {
  const keyword = process.argv[2] || 'english to turkish translator';
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const title = keyword
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  console.log('\n🚀 继续工具生成（跳过 Phase 3）');
  console.log(`关键词: ${keyword}`);
  console.log(`Slug: ${slug}`);
  console.log(`Title: ${title}\n`);

  try {
    // 读取已有的调研数据
    const researchPath = path.join(
      ROOT_DIR,
      '.tool-generation',
      slug,
      'research.json'
    );
    const contentResearchPath = path.join(
      ROOT_DIR,
      '.tool-generation',
      slug,
      'content-research.json'
    );

    const researchData = JSON.parse(await fs.readFile(researchPath, 'utf-8'));
    const contentResearchData = JSON.parse(
      await fs.readFile(contentResearchPath, 'utf-8')
    );

    console.log('✅ 已读取调研数据');

    // 模拟 Phase 3 的返回值
    const codeData = { slug, title };

    // 继续执行后续 phases（这里需要手动调用，因为无法直接导入私有函数）
    console.log('\n⚠️  请手动运行剩余的 phases');
    console.log('由于脚本架构限制，请使用以下方式：');
    console.log(
      '\n1. 直接修改 auto-tool-generator.js，在 Phase 3 添加跳过逻辑'
    );
    console.log('2. 或者分别运行 Phase 4-10 的独立脚本');

    console.log('\n📋 调研数据位置：');
    console.log(`   ${researchPath}`);
    console.log(`   ${contentResearchPath}`);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
