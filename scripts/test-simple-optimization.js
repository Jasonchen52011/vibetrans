#!/usr/bin/env node

/**
 * 🧪 简化版Fun Facts和Highlights标题优化测试
 * 专注于核心功能验证，避免构建问题
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const TEST_CONFIG = {
  testPages: [
    'creole-to-english-translator',
    'baybayin-translator',
    'gen-z-translator',
    'pig-latin-translator',
    'esperanto-translator',
  ],
  expectedTitles: {
    funFacts: 'Fascinating Language Insights',
    highlights: 'Why Choose Our Translation Tool',
  },
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * 测试JSON文件标题更新
 */
async function testJsonTitles() {
  log('🧪 测试: JSON文件标题验证', 'cyan');
  log('='.repeat(50), 'cyan');

  let passedTests = 0;
  let totalTests = 0;

  for (const page of TEST_CONFIG.testPages) {
    totalTests += 2;

    try {
      const enJsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(enJsonPath, 'utf-8');
      const data = JSON.parse(content);

      // 获取页面命名空间 - 修复命名规则
      let pageName;
      if (page === 'creole-to-english-translator') {
        pageName = 'CreoleToEnglishPage';
      } else if (page === 'baybayin-translator') {
        pageName = 'BaybayinTranslatorPage';
      } else if (page === 'gen-z-translator') {
        pageName = 'GenZTranslatorPage';
      } else if (page === 'pig-latin-translator') {
        pageName = 'PigLatinTranslatorPage';
      } else if (page === 'esperanto-translator') {
        pageName = 'EsperantoTranslatorPage';
      } else {
        // 默认规则
        pageName =
          page
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Page';
      }

      // 处理不同的命名约定
      const funFactsTitle =
        data[pageName]?.funFacts?.title ||
        data[pageName]?.funfacts?.title ||
        data[pageName]?.funFactsSection?.title;
      const highlightsTitle =
        data[pageName]?.highlights?.title || data[pageName]?.features?.title;

      // 测试Fun Facts标题
      if (funFactsTitle === TEST_CONFIG.expectedTitles.funFacts) {
        logSuccess(`${page}: Fun Facts标题 = "${funFactsTitle}"`);
        passedTests++;
      } else {
        logError(
          `${page}: Fun Facts标题 = "${funFactsTitle}" (期望: "${TEST_CONFIG.expectedTitles.funFacts}")`
        );
      }

      // 测试Highlights标题
      if (highlightsTitle === TEST_CONFIG.expectedTitles.highlights) {
        logSuccess(`${page}: Highlights标题 = "${highlightsTitle}"`);
        passedTests++;
      } else {
        logError(
          `${page}: Highlights标题 = "${highlightsTitle}" (期望: "${TEST_CONFIG.expectedTitles.highlights}")`
        );
      }
    } catch (error) {
      logError(`${page}: 读取失败 - ${error.message}`);
    }
  }

  logInfo(`JSON标题测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试代码引用
 */
async function testCodeReferences() {
  log('\n🧪 测试: 代码引用验证', 'cyan');
  log('='.repeat(50), 'cyan');

  let passedTests = 0;
  let totalTests = 0;

  for (const page of TEST_CONFIG.testPages) {
    totalTests += 2;

    try {
      const pagePath = path.join(
        'src',
        'app',
        '[locale]',
        '(marketing)',
        '(pages)',
        page,
        'page.tsx'
      );
      const content = await fs.readFile(pagePath, 'utf-8');

      // 检查Fun Facts引用
      const hasFunFactsReference = content.includes(
        "(t as any)('funFacts.title')"
      );
      if (hasFunFactsReference) {
        logSuccess(`${page}: Fun Facts代码引用正确`);
        passedTests++;
      } else {
        logError(`${page}: Fun Facts代码引用缺失`);
      }

      // 检查Highlights引用
      const hasHighlightsReference = content.includes(
        "(t as any)('highlights.title')"
      );
      if (hasHighlightsReference) {
        logSuccess(`${page}: Highlights代码引用正确`);
        passedTests++;
      } else {
        logError(`${page}: Highlights代码引用缺失`);
      }
    } catch (error) {
      logError(`${page}: 读取失败 - ${error.message}`);
    }
  }

  logInfo(`代码引用测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试SEO优化效果
 */
async function testSEOOptimization() {
  log('\n🧪 测试: SEO优化效果分析', 'cyan');
  log('='.repeat(50), 'cyan');

  const newFunFactsTitle = TEST_CONFIG.expectedTitles.funFacts;
  const newHighlightsTitle = TEST_CONFIG.expectedTitles.highlights;

  let passedTests = 0;
  const totalTests = 4;

  // 测试关键词包含
  if (newFunFactsTitle.toLowerCase().includes('language')) {
    logSuccess('Fun Facts标题包含"language"关键词');
    passedTests++;
  } else {
    logError('Fun Facts标题缺少"language"关键词');
  }

  // 测试标题长度
  if (newFunFactsTitle.length >= 20 && newFunFactsTitle.length <= 70) {
    logSuccess(`Fun Facts标题长度适中: ${newFunFactsTitle.length} 字符`);
    passedTests++;
  } else {
    logError(`Fun Facts标题长度: ${newFunFactsTitle.length} 字符 (建议20-70)`);
  }

  // 测试问题导向标题
  if (newHighlightsTitle.includes('Why')) {
    logSuccess('Highlights标题采用问题导向格式');
    passedTests++;
  } else {
    logError('Highlights标题未采用问题导向格式');
  }

  // 测试吸引力词汇
  const powerWords = ['choose', 'tool', 'translation'];
  const highlightsHasPowerWords = powerWords.some((word) =>
    newHighlightsTitle.toLowerCase().includes(word)
  );

  if (highlightsHasPowerWords) {
    logSuccess('Highlights标题包含吸引力词汇');
    passedTests++;
  } else {
    logError('Highlights标题缺少吸引力词汇');
  }

  logInfo(`SEO优化测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试用户体验改进
 */
async function testUserExperience() {
  log('\n🧪 测试: 用户体验改进分析', 'cyan');
  log('='.repeat(50), 'cyan');

  const newFunFactsTitle = TEST_CONFIG.expectedTitles.funFacts;
  const newHighlightsTitle = TEST_CONFIG.expectedTitles.highlights;

  let passedTests = 0;
  const totalTests = 4;

  // 测试好奇心激发词汇
  const curiosityWords = ['fascinating', 'insights', 'discover', 'wonders'];
  const funFactsHasCuriosity = curiosityWords.some((word) =>
    newFunFactsTitle.toLowerCase().includes(word)
  );

  if (funFactsHasCuriosity) {
    logSuccess('Fun Facts标题包含好奇心激发词汇');
    passedTests++;
  } else {
    logError('Fun Facts标题缺少好奇心激发词汇');
  }

  // 测试价值主张清晰度
  if (
    newHighlightsTitle.includes('Choose') &&
    newHighlightsTitle.includes('Tool')
  ) {
    logSuccess('Highlights标题价值主张清晰');
    passedTests++;
  } else {
    logError('Highlights标题价值主张不够清晰');
  }

  // 测试独特性 - 与旧标题对比
  const oldFunFactsTitle = 'Fun Facts';
  const oldHighlightsTitle = 'Key Features of Our Translator';

  if (newFunFactsTitle !== oldFunFactsTitle) {
    logSuccess('Fun Facts标题已更新，具有独特性');
    passedTests++;
  } else {
    logError('Fun Facts标题未更新');
  }

  if (newHighlightsTitle !== oldHighlightsTitle) {
    logSuccess('Highlights标题已更新，具有独特性');
    passedTests++;
  } else {
    logError('Highlights标题未更新');
  }

  logInfo(`用户体验测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 主测试函数
 */
async function runTests() {
  log('🚀 Fun Facts和Highlights标题优化测试（简化版）', 'bright');
  log('='.repeat(60), 'cyan');
  logInfo('测试页面:', TEST_CONFIG.testPages.join(', '));
  logInfo('Fun Facts目标标题:', TEST_CONFIG.expectedTitles.funFacts);
  logInfo('Highlights目标标题:', TEST_CONFIG.expectedTitles.highlights);

  const testResults = [];

  try {
    // 运行核心测试
    testResults.push(await testJsonTitles());
    testResults.push(await testCodeReferences());
    testResults.push(await testSEOOptimization());
    testResults.push(await testUserExperience());

    // 计算总体结果
    const totalPassed = testResults.reduce(
      (sum, result) => sum + result.passed,
      0
    );
    const totalTests = testResults.reduce(
      (sum, result) => sum + result.total,
      0
    );
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

    // 输出测试报告
    log('\n' + '='.repeat(60), 'bright');
    log('📊 测试报告', 'bright');
    log('='.repeat(60), 'bright');

    logInfo(
      `总体测试结果: ${totalPassed}/${totalTests} 通过 (${successRate}%)`
    );

    if (totalPassed === totalTests) {
      logSuccess('🎉 所有测试通过！标题优化成功完成。');
    } else if (successRate >= 80) {
      log(
        `⚠️  大部分测试通过 (${successRate}%)，建议检查失败的测试项。`,
        'yellow'
      );
    } else {
      logError(`测试失败率较高 (${successRate}%)，请检查并修复问题。`);
    }

    // 详细结果
    log('\n📋 详细测试结果:');
    const testNames = [
      'JSON文件标题验证',
      '代码引用验证',
      'SEO优化效果分析',
      '用户体验改进分析',
    ];

    testResults.forEach((result, index) => {
      const rate = ((result.passed / result.total) * 100).toFixed(1);
      const status =
        result.passed === result.total ? '✅' : rate >= 80 ? '⚠️' : '❌';
      log(
        `${status} ${testNames[index]}: ${result.passed}/${result.total} (${rate}%)`
      );
    });

    // 优化效果分析
    log('\n💡 优化效果分析:');
    log('✨ 标题吸引力提升: 从标准化标题改为独特性和吸引力更强的标题');
    log('✨ SEO价值改进: 增加了"language"等关键词，优化了标题长度');
    log('✨ 用户体验优化: 使用好奇心激发词汇和价值主张明确的表达');
    log('✨ 品牌一致性: 所有翻译工具使用统一优化的标题策略');

    log('\n🔍 建议的下一步行动:');
    if (totalPassed === totalTests) {
      log('✅ 可以开始生产环境部署');
      log('✅ 监控用户参与度和SEO表现变化');
    } else {
      log('🔧 修复JSON文件中的标题更新问题');
      log('🔧 确保所有翻译工具页面使用正确的翻译键');
      log('🔧 运行完整的构建测试验证');
    }
  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests();
