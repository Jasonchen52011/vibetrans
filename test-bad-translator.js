// 测试 Bad Translator API 的脚本
const { text } = require('stream/consumers');

async function testBadTranslator() {
  const baseUrl = 'http://localhost:3002';
  const testCases = [
    {
      text: 'Hello world, how are you today?',
      style: 'humor',
      iterations: 5,
      description: 'Humor style test',
    },
    {
      text: 'The quick brown fox jumps over the lazy dog.',
      style: 'chaos',
      iterations: 8,
      description: 'Chaos style maximum diversity test',
    },
    {
      text: 'I love programming and building amazing things.',
      style: 'absurd',
      iterations: 6,
      description: 'Absurd style with similar language avoidance',
    },
    {
      text: 'This is a simple test sentence.',
      style: 'funny',
      iterations: 4,
      description: 'Funny style medium diversity test',
    },
  ];

  console.log('🧪 开始测试 Bad Translator API v2.0\n');

  // 测试 GET 请求
  console.log('📡 测试 API 信息端点...');
  try {
    const getInfo = await fetch(`${baseUrl}/api/bad-translator`);
    const info = await getInfo.json();
    console.log('✅ API 信息:', {
      version: info.version,
      语言池数量: Object.keys(info.language_pools).length,
      支持的风格: info.supported_styles,
      新功能: info.features,
    });
  } catch (error) {
    console.error('❌ API 信息端点测试失败:', error.message);
  }

  console.log('\n🔄 开始翻译测试...\n');

  // 测试每种风格
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 测试 ${i + 1}: ${testCase.description}`);
    console.log(`原文: "${testCase.text}"`);
    console.log(`风格: ${testCase.style}, 迭代: ${testCase.iterations}`);

    try {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/bad-translator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testCase.text,
          style: testCase.style,
          iterations: testCase.iterations,
        }),
      });

      const result = await response.json();
      const endTime = Date.now();

      if (response.ok && result.success) {
        console.log(`✅ 翻译成功! 耗时: ${endTime - startTime}ms`);
        console.log(`译文: "${result.translated}"`);
        console.log(`语言链: [${result.chain.join(' → ')}]`);
        console.log(`实际步骤: ${result.actualSteps}`);

        if (result.translationSteps) {
          console.log('翻译步骤:');
          result.translationSteps.forEach((step, index) => {
            console.log(
              `  ${index + 1}. ${step.from} → ${step.to} ${step.success ? '✅' : '❌'}`
            );
            if (
              step.intermediateResult &&
              index < result.translationSteps.length - 1
            ) {
              console.log(
                `     中间结果: "${step.intermediateResult.substring(0, 50)}..."`
              );
            }
          });
        }

        // 计算混乱度 (简单的词汇变化率)
        const originalWords = testCase.text.split(' ');
        const translatedWords = result.translated.split(' ');
        const wordChangeRate =
          Math.abs(originalWords.length - translatedWords.length) /
          originalWords.length;
        console.log(`混乱度指标: ${(wordChangeRate * 100).toFixed(1)}%`);
      } else {
        console.error(
          `❌ 翻译失败: ${result.error || result.details || '未知错误'}`
        );
      }
    } catch (error) {
      console.error(`❌ 请求失败:`, error.message);
    }

    console.log('---\n');
  }

  // 测试错误处理
  console.log('🛡️ 测试错误处理...');

  const errorCases = [
    {
      name: '空文本',
      payload: { text: '' },
    },
    {
      name: '过长文本',
      payload: { text: 'a'.repeat(501) },
    },
    {
      name: '缺少文本参数',
      payload: { style: 'humor' },
    },
  ];

  for (const errorCase of errorCases) {
    console.log(`测试错误: ${errorCase.name}`);
    try {
      const response = await fetch(`${baseUrl}/api/bad-translator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorCase.payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.log(`✅ 正确返回错误: ${result.error}`);
      } else {
        console.log(`❌ 应该返回错误但返回了成功:`, result);
      }
    } catch (error) {
      console.log(`❌ 请求失败:`, error.message);
    }
  }

  console.log('\n🎉 测试完成!');
}

// 运行测试
testBadTranslator().catch(console.error);
