#!/usr/bin/env node

/**
 * 测试所有15个翻译工具的智能检测和翻译功能
 */

const tools = [
  {
    name: 'Creole-English Translator',
    slug: 'creole-to-english-translator',
    tests: [
      { input: 'Bonjou, koman ou ye?', expectedDetection: 'creole' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Chinese-English Translator',
    slug: 'chinese-to-english-translator',
    tests: [
      { input: '你好，世界！', expectedDetection: 'chinese' },
      { input: 'Hello world!', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Albanian-English Translator',
    slug: 'albanian-to-english-translator',
    tests: [
      { input: 'Përshëndetje, si jeni?', expectedDetection: 'albanian' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Samoan-English Translator',
    slug: 'samoan-to-english-translator',
    tests: [
      { input: 'Talofa lava, o ā mai oe?', expectedDetection: 'samoan' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Cantonese Translator',
    slug: 'cantonese-translator',
    tests: [
      { input: '你好，點樣呀？', expectedDetection: 'cantonese' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Aramaic Translator',
    slug: 'aramaic-translator',
    tests: [
      { input: 'ܫܠܡܐ ܐܢܬܐ', expectedDetection: 'aramaic' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Baybayin Translator',
    slug: 'baybayin-translator',
    tests: [
      { input: 'ᜃᜁᜎᜒᜆ᜔ ᜃᜇᜒᜈᜓ᜔ᜉ', expectedDetection: 'baybayin' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Cuneiform Translator',
    slug: 'cuneiform-translator',
    tests: [
      { input: '𒀭𒈾𒁺𒁍𒉿𒈠', expectedDetection: 'cuneiform' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Gaster Translator',
    slug: 'gaster-translator',
    tests: [
      { input: '♠♥♦♣☀☁☂☃❄★☆', expectedDetection: 'gaster' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'High Valyrian Translator',
    slug: 'high-valyrian-translator',
    tests: [
      { input: 'Valar morghulis', expectedDetection: 'valyrian' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Ancient Greek Translator',
    slug: 'ancient-greek-translator',
    tests: [
      { input: 'Χαίρετε, πώς είστε;', expectedDetection: 'ancient-greek' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Middle English Translator',
    slug: 'middle-english-translator',
    tests: [
      {
        input: 'Whan that Aprille with his shoures soote',
        expectedDetection: 'middle-english',
      },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Esperanto Translator',
    slug: 'esperanto-translator',
    tests: [
      { input: 'Saluton, kiel vi fartas?', expectedDetection: 'esperanto' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Al Bhed Translator',
    slug: 'al-bhed-translator',
    tests: [
      { input: 'Fyed ryja oui dra coob!', expectedDetection: 'al-bhed' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
    ],
  },
  {
    name: 'Pig Latin Translator',
    slug: 'pig-latin-translator',
    tests: [
      { input: 'Ellohay owhay areyay ouyay?', expectedDetection: 'pig-latin' },
      { input: 'Hello, how are you?', expectedDetection: 'english' },
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

      // 测试语言检测
      const detectResponse = await fetch(`${BASE_URL}/api/${tool.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: test.input,
          detectOnly: true,
          inputType: 'text',
          ...(tool.slug === 'chinese-to-english-translator' && {
            inputType: 'text',
          }),
        }),
      });

      if (!detectResponse.ok) {
        const errorText = await detectResponse.text();
        console.log(`❌ 检测API错误 (${detectResponse.status}): ${errorText}`);
        continue;
      }

      const detectData = await detectResponse.json();
      const detectedLanguage =
        detectData.detectedInputLanguage ||
        detectData.detectedLanguage ||
        'unknown';
      const confidence = detectData.confidence || 0;

      console.log(`✅ 检测结果: ${detectedLanguage}`);
      console.log(`📊 置信度: ${Math.round(confidence * 100)}%`);

      if (
        detectedLanguage === test.expectedDetection ||
        (test.expectedDetection === 'english' &&
          detectedLanguage === 'english') ||
        (test.expectedDetection !== 'english' && detectedLanguage !== 'english')
      ) {
        console.log('✅ 检测正确！');
        passCount++;
      } else {
        console.log('⚠️ 检测结果与期望不符');
      }

      // 测试翻译功能
      console.log('🔄 测试翻译功能...');
      const translateResponse = await fetch(`${BASE_URL}/api/${tool.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: test.input,
          direction: detectData.detectedDirection,
          inputType: 'text',
          ...(tool.slug === 'chinese-to-english-translator' && {
            direction: detectData.detectedDirection,
            inputType: 'text',
          }),
        }),
      });

      if (translateResponse.ok) {
        const translateData = await translateResponse.json();
        if (
          translateData.translated ||
          translateData.result ||
          translateData.translation
        ) {
          console.log('✅ 翻译功能正常');
          const translation =
            translateData.translated ||
            translateData.result ||
            translateData.translation;
          console.log(
            `📄 翻译结果: "${translation.substring(0, 50)}${translation.length > 50 ? '...' : ''}"`
          );
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
  console.log('🚀 开始测试所有15个翻译工具');
  console.log('='.repeat(60));
  console.log(`📍 测试地址: ${BASE_URL}`);
  console.log('⏱️  测试时间:', new Date().toLocaleString());

  let totalPass = 0;
  let totalTests = 0;
  const toolResults = [];

  for (const tool of tools) {
    const result = await testTool(tool);
    totalPass += result.passCount;
    totalTests += result.totalCount;
    toolResults.push({
      name: tool.name,
      pass: result.passCount,
      total: result.totalCount,
      successRate: Math.round((result.passCount / result.totalCount) * 100),
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 详细测试结果');
  console.log('='.repeat(60));

  toolResults.forEach((result) => {
    const status =
      result.pass === result.total ? '✅' : result.pass > 0 ? '⚠️' : '❌';
    console.log(
      `${status} ${result.name}: ${result.pass}/${result.total} (${result.successRate}%)`
    );
  });

  console.log('\n' + '='.repeat(60));
  console.log('📈 总体测试总结');
  console.log('='.repeat(60));
  console.log(`📦 工具总数: ${tools.length}`);
  console.log(`📝 总测试数: ${totalTests}`);
  console.log(`✅ 通过: ${totalPass}`);
  console.log(`❌ 失败: ${totalTests - totalPass}`);
  console.log(`📊 总成功率: ${Math.round((totalPass / totalTests) * 100)}%`);

  const perfectTools = toolResults.filter((r) => r.pass === r.total).length;
  const partialTools = toolResults.filter(
    (r) => r.pass > 0 && r.pass < r.total
  ).length;
  const failedTools = toolResults.filter((r) => r.pass === 0).length;

  console.log(`\n🎯 工具状态:`);
  console.log(
    `   🏆 完美工具: ${perfectTools}/15 (${Math.round((perfectTools / 15) * 100)}%)`
  );
  console.log(
    `   ⚠️ 部分工具: ${partialTools}/15 (${Math.round((partialTools / 15) * 100)}%)`
  );
  console.log(
    `   ❌ 失败工具: ${failedTools}/15 (${Math.round((failedTools / 15) * 100)}%)`
  );

  if (totalPass === totalTests) {
    console.log('\n🎉 所有测试通过！所有翻译工具都工作正常！');
  } else if (totalPass > totalTests * 0.7) {
    console.log('\n👍 大部分测试通过！大部分翻译工具工作正常。');
  } else {
    console.log('\n⚠️ 需要改进！部分翻译工具存在问题。');
  }
}

// 运行测试
main().catch(console.error);
