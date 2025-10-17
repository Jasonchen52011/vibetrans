#!/usr/bin/env node

/**
 * 快速测试所有翻译工具的核心功能
 */

const tools = [
  {
    name: 'Creole-English',
    slug: 'creole-to-english-translator',
    test: 'Hello world!',
  },
  {
    name: 'Chinese-English',
    slug: 'chinese-to-english-translator',
    test: 'Hello world!',
  },
  {
    name: 'Albanian-English',
    slug: 'albanian-to-english-translator',
    test: 'Hello world!',
  },
  {
    name: 'Samoan-English',
    slug: 'samoan-to-english-translator',
    test: 'Hello world!',
  },
  { name: 'Cantonese', slug: 'cantonese-translator', test: 'Hello world!' },
  { name: 'Aramaic', slug: 'aramaic-translator', test: 'Hello world!' },
  { name: 'Baybayin', slug: 'baybayin-translator', test: 'Hello world!' },
  { name: 'Cuneiform', slug: 'cuneiform-translator', test: 'Hello world!' },
  { name: 'Gaster', slug: 'gaster-translator', test: 'Hello world!' },
  {
    name: 'High Valyrian',
    slug: 'high-valyrian-translator',
    test: 'Hello world!',
  },
  {
    name: 'Ancient Greek',
    slug: 'ancient-greek-translator',
    test: 'Hello world!',
  },
  {
    name: 'Middle English',
    slug: 'middle-english-translator',
    test: 'Hello world!',
  },
  { name: 'Esperanto', slug: 'esperanto-translator', test: 'Hello world!' },
  { name: 'Al Bhed', slug: 'al-bhed-translator', test: 'Hello world!' },
  { name: 'Pig Latin', slug: 'pig-latin-translator', test: 'Hello world!' },
];

const BASE_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('🚀 快速测试所有翻译工具');
  console.log('='.repeat(50));

  let working = 0;
  let failed = 0;
  let notFound = 0;

  for (const tool of tools) {
    try {
      console.log(`\n🔍 测试 ${tool.name}...`);

      const response = await fetch(`${BASE_URL}/api/${tool.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tool.test,
          inputType: 'text',
        }),
      });

      if (response.status === 404) {
        console.log(`❌ 404 - 工具不存在`);
        notFound++;
      } else if (response.ok) {
        const data = await response.json();
        const result = data.translated || data.result || data.translation;
        console.log(`✅ 正常工作 - "${result?.substring(0, 30)}..."`);
        working++;
      } else {
        const error = await response.text();
        console.log(
          `❌ 错误 (${response.status}): ${error.substring(0, 50)}...`
        );
        failed++;
      }
    } catch (error) {
      console.log(`❌ 连接错误: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 测试总结');
  console.log('='.repeat(50));
  console.log(`✅ 正常工作: ${working}/15`);
  console.log(`❌ 失败: ${failed}/15`);
  console.log(`🔍 不存在: ${notFound}/15`);
  console.log(`📈 成功率: ${Math.round((working / 15) * 100)}%`);

  const details = {
    perfect: working === 15,
    good: working >= 10,
    partial: working >= 5,
    poor: working < 5,
  };

  if (details.perfect) {
    console.log('\n🎉 完美！所有工具都正常工作！');
  } else if (details.good) {
    console.log('\n👍 很好！大部分工具都正常工作。');
  } else if (details.partial) {
    console.log('\n⚠️ 一般，部分工具需要修复。');
  } else {
    console.log('\n❌ 需要改进！很多工具存在问题。');
  }

  return { working, failed, notFound };
}

quickTest().catch(console.error);
