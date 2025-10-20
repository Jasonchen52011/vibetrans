#!/usr/bin/env node

/**
 * 自动修复"How to"标题的脚本
 * 由 test-howto-titles.js 生成
 */

import path from 'path';
import fs from 'fs/promises';

const ROOT_DIR = path.resolve(process.cwd(), '.');
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages/pages');

async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('读取文件失败:', filePath, error.message);
    return null;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log('✅ 已更新:', filePath);
  } catch (error) {
    console.error('写入文件失败:', filePath, error.message);
  }
}

async function fixHowtoTitle(toolSlug, expectedTitle) {
  const enJsonPath = path.join(MESSAGES_DIR, toolSlug, 'en.json');
  const data = await readJsonFile(enJsonPath);

  if (!data) {
    console.error('❌ 无法读取文件:', enJsonPath);
    return false;
  }

  // 找到页面数据
  const pageKey = Object.keys(data)[0];
  const pageData = data[pageKey];

  if (!pageData || !pageData.howto) {
    console.error('❌ 未找到howto部分:', toolSlug);
    return false;
  }

  // 更新标题
  const oldTitle = pageData.howto.title;
  pageData.howto.title = expectedTitle;

  await writeJsonFile(enJsonPath, data);
  console.log(`📝 ${toolSlug}: "${oldTitle}" → "${expectedTitle}"`);

  return true;
}

async function main() {
  console.log('🔧 开始修复"How to"标题...\n');

  await fixHowtoTitle(
    'al-bhed-translator',
    'How to Translate English to Al Bhed'
  );
  await fixHowtoTitle(
    'alien-text-generator',
    'How to Translate English to Alien Text'
  );
  await fixHowtoTitle(
    'ancient-greek-translator',
    'How to Translate English to Ancient Greek'
  );
  await fixHowtoTitle(
    'aramaic-translator',
    'How to Translate English to Aramaic'
  );
  await fixHowtoTitle('baby-translator', 'How to Translate English to Baby');
  await fixHowtoTitle('bad-translator', 'How to Translate English to Bad');
  await fixHowtoTitle(
    'baybayin-translator',
    'How to Translate English to Baybayin'
  );
  await fixHowtoTitle(
    'cantonese-translator',
    'How to Translate English to Cantonese'
  );
  await fixHowtoTitle(
    'creole-to-english',
    'How to Translate Creole to English'
  );
  await fixHowtoTitle(
    'cuneiform-translator',
    'How to Translate English to Cuneiform'
  );
  await fixHowtoTitle('dog-translator', 'How to Translate English to Dog');
  await fixHowtoTitle(
    'esperanto-translator',
    'How to Translate English to Esperanto'
  );
  await fixHowtoTitle(
    'gaster-translator',
    'How to Translate English to Gaster'
  );
  await fixHowtoTitle(
    'gen-alpha-translator',
    'How to Translate English to Gen Alpha'
  );
  await fixHowtoTitle('gen-z-translator', 'How to Translate English to Gen Z');
  await fixHowtoTitle(
    'gibberish-translator',
    'How to Translate English to Gibberish'
  );
  await fixHowtoTitle(
    'high-valyrian-translator',
    'How to Translate English to High Valyrian'
  );
  await fixHowtoTitle('ivr-translator', 'How to Translate English to IVR');
  await fixHowtoTitle(
    'minion-translator',
    'How to Translate English to Minion'
  );
  await fixHowtoTitle(
    'pig-latin-translator',
    'How to Translate English to Pig Latin'
  );
  await fixHowtoTitle(
    'verbose-generator',
    'How to Translate English to Verbose'
  );

  console.log('\n✅ 修复完成！');
}

main().catch(console.error);
