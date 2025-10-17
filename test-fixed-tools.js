#!/usr/bin/env node

/**
 * 测试修复后的4个翻译工具
 * 测试 Chinese-English Translator, Gaster Translator, High Valyrian Translator, Middle English Translator
 */

const tools = [
  {
    name: 'Chinese-English Translator',
    slug: 'chinese-to-english-translator',
    tests: [
      { input: '你好，世界！', expectedDetection: 'chinese' },
      { input: 'Hello world!', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Gaster Translator',
    slug: 'gaster-translator',
    tests: [
      { input: 'Hello world!', expectedDetection: 'english' },
      { input: '♠♥♦♣☀☁☂☃❄★☆', expectedDetection: 'gaster' },
    ],
  },
  {
    name: 'High Valyrian Translator',
    slug: 'high-valyrian-translator',
    tests: [
      { input: 'Hello world!', expectedDetection: 'english' },
      { input: 'Valar morghulis', expectedDetection: 'valyrian' },
    ],
  },
  {
    name: 'Middle English Translator',
    slug: 'middle-english-translator',
    tests: [
      { input: 'Hello world!', expectedDetection: 'english' },
      {
        input: 'Whan that Aprille with his shoures soote',
        expectedDetection: 'middle-english',
      },
    ],
  },
];

const BASE_URL = 'http://localhost:3000';

async function testTool(tool) {
  console.log(`\n🧪 测试 ${tool.name}...`);
  console.log('='.repeat(50));

  let passCount = 0;
  const totalCount = tool.tests.length;

  for (const test of tool.tests) {
    try {
      console.log(`\n📝 测试输入: "${test.input}"`);
      console.log(`🎯 期望检测: ${test.expectedDetection}`);

      const response = await fetch(`${BASE_URL}/api/${tool.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: test.input,
          detectOnly: true,
          ...(tool.slug === 'chinese-to-english-translator' && {
            inputType: 'text',
          }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ API错误 (${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      console.log(`✅ 检测结果: ${data.detectedInputLanguage}`);
      console.log(`📊 置信度: ${Math.round((data.confidence || 0) * 100)}%`);

      if (data.detectedInputLanguage === test.expectedDetection) {
        console.log('✅ 检测正确！');
        passCount++;
      } else {
        console.log('⚠️ 检测结果与期望不符');
      }

      // 测试翻译功能
      console.log('🔄 测试翻译功能...');
      const translateResponse = await fetch(`${BASE_URL}/api/${tool.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: test.input,
          ...(tool.slug === 'chinese-to-english-translator' && {
            inputType: 'text',
          }),
        }),
      });

      if (translateResponse.ok) {
        const translateData = await translateResponse.json();
        if (translateData.translated || translateData.result) {
          console.log('✅ 翻译功能正常');
        } else {
          console.log('⚠️ 翻译结果为空');
        }
      } else {
        const errorText = await translateResponse.text();
        console.log(
          `❌ 翻译API错误 (${translateResponse.status}): ${errorText}`
        );
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
    }
  }

  return { passCount, totalCount };
}

async function main() {
  console.log('🚀 开始测试修复后的翻译工具');
  console.log('='.repeat(60));
  console.log(`📍 测试地址: ${BASE_URL}`);

  let totalPass = 0;
  let totalTests = 0;

  for (const tool of tools) {
    const result = await testTool(tool);
    totalPass += result.passCount;
    totalTests += result.totalCount;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${totalPass}`);
  console.log(`失败: ${totalTests - totalPass}`);
  console.log(`成功率: ${Math.round((totalPass / totalTests) * 100)}%`);

  if (totalPass === totalTests) {
    console.log('\n🎉 所有测试通过！翻译工具修复成功！');
  } else {
    console.log('\n⚠️ 部分测试未通过，需要进一步检查');
  }
}

// 运行测试
main().catch(console.error);
