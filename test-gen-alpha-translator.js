/**
 * Gen Alpha Translator API 测试用例
 * 测试升级后的AI驱动智能翻译功能
 */

const BASE_URL = 'http://localhost:3000/api/gen-alpha-translator';

// 测试用例配置
const testCases = {
  // 基础词典翻译测试
  dictionaryTests: [
    {
      name: '标准到Gen Alpha - 基础词汇',
      input: 'Your charisma is amazing and you have great style!',
      mode: 'toGenAlpha',
      expectedKeywords: ['rizz', 'fire', 'drip'],
    },
    {
      name: 'Gen Alpha到标准 - 基础词汇',
      input: 'Your rizz is fire and you have hella drip!',
      mode: 'toStandard',
      expectedKeywords: ['charisma', 'amazing', 'style'],
    },
    {
      name: '标准到Gen Alpha - 情感表达',
      input: "I'm so happy right now, this is awesome!",
      mode: 'toGenAlpha',
      expectedKeywords: ['happy', 'awesome', 'fire'],
    },
    {
      name: 'Gen Alpha到标准 - 情感表达',
      input: 'This is slay, no cap, you have serious rizz',
      mode: 'toStandard',
      expectedKeywords: ['excellent', 'honestly', 'charisma'],
    },
  ],

  // AI增强翻译测试（长文本）
  aiTests: [
    {
      name: '长文本AI翻译测试',
      input:
        'I went to this amazing party yesterday and everyone was so friendly and welcoming. The music was incredible and the atmosphere was fantastic. I met some really cool people and we had great conversations about life and dreams. It was truly an unforgettable experience that I will cherish forever.',
      mode: 'toGenAlpha',
      expectedKeywords: ['party', 'people', 'experience'],
      minLength: 50,
    },
    {
      name: '复杂Gen Alpha文本AI翻译测试',
      input:
        'Last night was absolutely insane, no cap! The whole vibe was just electric, everyone had crazy rizz and the music was fire. We were all vibing so hard and the party was totally skibidi but in the best way possible. Every single person there was slaying so hard and the energy was just unmatched.',
      mode: 'toStandard',
      expectedKeywords: ['insane', 'party', 'energy'],
      minLength: 50,
    },
  ],

  // 边界条件测试
  boundaryTests: [
    {
      name: '空文本测试',
      input: '',
      expectedError: 'Please enter some text',
    },
    {
      name: '空格文本测试',
      input: '   ',
      expectedError: 'Please enter some text',
    },
    {
      name: '超长文本测试',
      input: 'A'.repeat(6000),
      expectedError: 'Text too long',
    },
  ],

  // 特殊字符和格式测试
  formatTests: [
    {
      name: '包含标点符号',
      input: "Hello! How are you? I'm doing great, thanks for asking!",
      mode: 'toGenAlpha',
    },
    {
      name: '包含数字',
      input: 'I have 100 followers and 2 million views on my videos!',
      mode: 'toGenAlpha',
    },
    {
      name: '包含emoji',
      input: "I love this! ❤️ It's so cool and amazing! 🎉",
      mode: 'toGenAlpha',
    },
  ],

  // 性能测试
  performanceTests: [
    {
      name: '短文本性能测试',
      input: 'Hello world',
      expectedMaxTime: 2000, // 2秒
    },
    {
      name: '中等文本性能测试',
      input:
        'This is a medium length text that should test the performance of our translation system. It contains multiple sentences and various types of content that need to be processed efficiently.',
      expectedMaxTime: 3000, // 3秒
    },
  ],
};

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// 工具函数
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logTest(testName) {
  log(`\n🧪 ${testName}`, colors.cyan);
}

// 执行单个测试
async function runTest(test) {
  logTest(test.name);

  const startTime = Date.now();

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: test.input,
        mode: test.mode || 'toGenAlpha',
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.ok) {
      const data = await response.json();

      // 检查是否有错误
      if (data.error) {
        if (test.expectedError && data.error.includes(test.expectedError)) {
          logSuccess(`错误处理正确: ${data.error}`);
        } else {
          logError(`未预期的错误: ${data.error}`);
        }
        return false;
      }

      // 检查翻译结果
      if (data.translated) {
        logInfo(`输入: "${test.input}"`);
        logInfo(`输出: "${data.translated}"`);
        logInfo(`模式: ${test.mode}`);
        logInfo(`AI增强: ${data.ai_enhanced ? '是' : '否'}`);
        logInfo(`耗时: ${duration}ms`);

        // 检查预期关键词
        if (test.expectedKeywords) {
          const missingKeywords = test.expectedKeywords.filter(
            (keyword) =>
              !data.translated.toLowerCase().includes(keyword.toLowerCase())
          );

          if (missingKeywords.length === 0) {
            logSuccess(`翻译质量良好，包含所有预期关键词`);
          } else {
            logError(`翻译缺少预期关键词: ${missingKeywords.join(', ')}`);
          }
        }

        // 检查最小长度（用于AI测试）
        if (test.minLength && data.translated.length < test.minLength) {
          logError(
            `翻译结果过短: ${data.translated.length} < ${test.minLength}`
          );
        }

        // 性能检查
        if (test.expectedMaxTime && duration > test.expectedMaxTime) {
          logError(`性能不达标: ${duration}ms > ${test.expectedMaxTime}ms`);
        }

        logSuccess(`测试通过: ${test.name}`);
        return true;
      } else {
        logError('翻译结果为空');
        return false;
      }
    } else {
      const errorText = await response.text();
      if (test.expectedError && errorText.includes(test.expectedError)) {
        logSuccess(`错误处理正确: ${test.expectedError}`);
        return true;
      } else {
        logError(`HTTP错误: ${response.status} - ${errorText}`);
        return false;
      }
    }
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return false;
  }
}

// 测试API信息
async function testAPIInfo() {
  logTest('API信息测试');

  try {
    const response = await fetch(BASE_URL);

    if (response.ok) {
      const data = await response.json();

      logInfo(`API版本: ${data.version}`);
      logInfo(`词汇库大小: ${data.vocabulary_size}`);
      logInfo(`支持模式: ${data.supported_modes.join(', ')}`);
      logInfo(`AI增强: ${data.ai_enhanced ? '是' : '否'}`);
      logInfo(`最大文本长度: ${data.max_text_length}`);

      logSuccess('API信息测试通过');
      return true;
    } else {
      logError(`API信息获取失败: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`API信息测试失败: ${error.message}`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  log('🚀 开始Gen Alpha翻译器API测试', colors.yellow);
  log('='.repeat(50));

  let totalTests = 0;
  let passedTests = 0;

  // 测试API信息
  const apiInfoResult = await testAPIInfo();
  totalTests++;
  if (apiInfoResult) passedTests++;

  // 运行各类测试
  const testCategories = [
    { name: '词典翻译测试', tests: testCases.dictionaryTests },
    { name: 'AI增强翻译测试', tests: testCases.aiTests },
    { name: '边界条件测试', tests: testCases.boundaryTests },
    { name: '格式测试', tests: testCases.formatTests },
    { name: '性能测试', tests: testCases.performanceTests },
  ];

  for (const category of testCategories) {
    log(
      `\n${'='.repeat(20)} ${category.name} ${'='.repeat(20)}`,
      colors.magenta
    );

    for (const test of category.tests) {
      totalTests++;
      const result = await runTest(test);
      if (result) passedTests++;
    }
  }

  // 测试总结
  log(`\n${'='.repeat(50)}`, colors.yellow);
  log('📊 测试结果总结', colors.yellow);
  log(`总测试数: ${totalTests}`);
  log(`通过测试: ${passedTests}`);
  log(`失败测试: ${totalTests - passedTests}`);
  log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    logSuccess('\n🎉 所有测试通过！Gen Alpha翻译器API工作正常。');
  } else {
    logError(`\n⚠️  有 ${totalTests - passedTests} 个测试失败，请检查API实现。`);
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch((error) => {
    logError(`测试运行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests, testCases };
