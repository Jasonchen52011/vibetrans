#!/usr/bin/env node

// 测试特殊语言工具的智能检测功能
const API_BASE = 'http://localhost:3000/api';

async function testAPI(apiName, testData) {
  console.log(`\n🧪 测试 ${apiName}...`);

  try {
    const response = await fetch(`${API_BASE}/${apiName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ ${apiName} 测试成功`);
      console.log(`   输入: ${data.original}`);
      console.log(`   输出: ${data.translated}`);
      console.log(`   检测: ${data.languageInfo?.explanation || '无'}`);
      console.log(`   自动检测: ${data.autoDetected ? '是' : '否'}`);
      console.log(`   翻译方向: ${data.direction}`);
    } else {
      console.log(`❌ ${apiName} 测试失败: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ ${apiName} 测试出错: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 开始测试特殊语言工具的智能检测功能...\n');

  // 测试数据：各种语言的典型文本
  const testCases = [
    {
      api: 'aramaic-translator',
      tests: [
        { text: 'Hello world', direction: 'auto' }, // 英语
        { text: 'ܫܠܡܐ', direction: 'auto' }, // 阿拉姆语
      ],
    },
    {
      api: 'baybayin-translator',
      tests: [
        { text: 'Thank you very much', direction: 'auto' }, // 英语
        { text: 'ᜉᜒᜐ᜔ ᜐᜓᜉ᜔', direction: 'auto' }, // 巴贝因文字
      ],
    },
    {
      api: 'cuneiform-translator',
      tests: [
        { text: 'The king is great', direction: 'auto' }, // 英语
        { text: '𒈗𒁁', direction: 'auto' }, // 楔形文字
      ],
    },
    {
      api: 'gaster-translator',
      tests: [
        { text: 'Hello mysterious language', direction: 'auto' }, // 英语
        { text: '☟✌☜☼☹ ❄⌨👍🕆☟☼☜', direction: 'auto' }, // Gaster语言
      ],
    },
    {
      api: 'high-valyrian-translator',
      tests: [
        { text: 'All men must die', direction: 'auto' }, // 英语
        { text: 'Valar Morghulis', direction: 'auto' }, // 瓦雷利亚语
      ],
    },
  ];

  for (const { api, tests } of testCases) {
    for (const test of tests) {
      await testAPI(api, test);
      // 等待一秒避免频率限制
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\n🎉 所有测试完成！');
}

// 检查是否可以直接运行
if (typeof fetch === 'undefined') {
  // Node.js 环境，需要导入 node-fetch
  console.log('⚠️  在 Node.js 环境中运行，请先启动开发服务器');
  console.log('   运行: pnpm dev');
  console.log('   然后在另一个终端运行: node test-special-languages.js');
} else {
  // 浏览器环境或已配置 fetch
  runTests().catch(console.error);
}
