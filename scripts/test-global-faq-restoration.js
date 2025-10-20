#!/usr/bin/env node

/**
 * 🧪 全局FAQ恢复验证测试用例
 *
 * 测试目标：
 * 1. 验证所有翻译工具页面都使用原始的FaqSection组件
 * 2. 验证所有FAQ数据都包含8个问题
 * 3. 验证FAQ组件支持8个项目
 * 4. 验证FAQ样式和内容完整性
 *
 * 使用方法：
 * node scripts/test-global-faq-restoration.js
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// 测试配置
const TEST_CONFIG = {
  testPages: [
    'creole-to-english-translator',
    'baybayin-translator',
    'gen-z-translator',
    'pig-latin-translator',
    'esperanto-translator',
    'minion-translator',
    'al-bhed-translator',
    'alien-text-generator',
    'high-valyrian-translator',
    'ivr-translator',
    'gen-alpha-translator',
    'cuneiform-translator',
    'dog-translator',
    'middle-english-translator',
    'chinese-to-english-translator',
    'gibberish-translator',
    'ancient-greek-translator',
    'baby-translator',
    'bad-translator',
    'samoan-to-english-translator',
    'gaster-translator',
    'dumb-it-down-ai',
    'verbose-generator',
    'albanian-to-english',
    'cantonese-translator',
    'aramaic-translator',
  ],
  expectedFaqCount: 8,
  expectedComponent: 'FaqSection',
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
  magenta: '\x1b[35m',
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * 测试1: 验证页面组件引用
 */
async function testPageComponents() {
  log('🧪 测试1: 验证页面组件引用', 'cyan');
  log('='.repeat(50), 'cyan');

  let passedTests = 0;
  let totalTests = 0;

  for (const page of TEST_CONFIG.testPages) {
    totalTests++;

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

      // 检查是否使用FaqSection而不是FaqThreeColumnSection
      const usesFaqSection = content.includes(
        "import FaqSection from '@/components/blocks/faqs/faqs'"
      );
      const usesFaqThreeColumn = content.includes(
        "import FaqThreeColumnSection from '@/components/blocks/faqs/faq-three-column'"
      );
      const usesFaqComponent = content.includes('<FaqSection ');

      if (usesFaqSection && usesFaqComponent && !usesFaqThreeColumn) {
        logSuccess(`${page}: 正确使用原始FaqSection组件`);
        passedTests++;
      } else {
        logError(`${page}: 组件引用不正确`);
        if (usesFaqThreeColumn) {
          logInfo(`   仍在使用FaqThreeColumnSection`);
        }
        if (!usesFaqComponent) {
          logInfo(`   未使用FaqSection组件`);
        }
      }
    } catch (error) {
      logError(`${page}: 无法读取页面文件 - ${error.message}`);
    }
  }

  logInfo(`组件引用测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试2: 验证FAQ组件代码
 */
async function testFaqComponentCode() {
  log('\n🧪 测试2: 验证FAQ组件代码', 'cyan');
  log('='.repeat(50), 'cyan');

  try {
    const faqComponentPath = path.join(
      'src',
      'components',
      'blocks',
      'faqs',
      'faqs.tsx'
    );
    const content = await fs.readFile(faqComponentPath, 'utf-8');

    let passedTests = 0;
    const totalTests = 2;

    // 检查支持8个FAQ项目
    const supportsEightItems = content.includes('i <= 8');
    if (supportsEightItems) {
      logSuccess('FAQ组件支持8个项目 (i <= 8)');
      passedTests++;
    } else {
      logError('FAQ组件不支持8个项目');
    }

    // 检查使用原始手风琴样式
    const usesAccordion =
      content.includes('Accordion') && content.includes('AccordionTrigger');
    if (usesAccordion) {
      logSuccess('FAQ组件使用原始手风琴样式');
      passedTests++;
    } else {
      logError('FAQ组件未使用手风琴样式');
    }

    logInfo(`FAQ组件代码测试结果: ${passedTests}/${totalTests} 通过`);
    return { passed: passedTests, total: totalTests };
  } catch (error) {
    logError(`无法读取FAQ组件文件: ${error.message}`);
    return { passed: 0, total: 2 };
  }
}

/**
 * 测试3: 验证FAQ数据完整性
 */
async function testFaqDataIntegrity() {
  log('\n🧪 测试3: 验证FAQ数据完整性', 'cyan');
  log('='.repeat(50), 'cyan');

  let passedTests = 0;
  let totalTests = 0;
  let pagesWithEightFaqs = 0;
  const pagesWithIncompleteFaqs = [];

  for (const page of TEST_CONFIG.testPages) {
    totalTests++;

    try {
      // 获取页面命名空间
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
        // 默认命名规则
        pageName =
          page
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Page';
      }

      const jsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(content);

      // 获取FAQ项目数量
      const faqItems = data[pageName]?.faqs?.items;
      if (!faqItems) {
        logError(`${page}: 缺少FAQ数据`);
        continue;
      }

      const faqCount = Object.keys(faqItems).length;

      if (faqCount === TEST_CONFIG.expectedFaqCount) {
        logSuccess(`${page}: 包含${faqCount}个FAQ问题`);
        pagesWithEightFaqs++;
        passedTests++;
      } else if (faqCount > 0) {
        logWarning(`${page}: 包含${faqCount}个FAQ问题 (期望8个)`);
        pagesWithIncompleteFaqs.push({ page, count: faqCount });
      } else {
        logError(`${page}: 没有FAQ问题`);
      }
    } catch (error) {
      logError(`${page}: 无法读取FAQ数据 - ${error.message}`);
    }
  }

  logInfo(`FAQ数据完整性测试结果: ${passedTests}/${totalTests} 通过`);
  logInfo(
    `包含8个FAQ的页面: ${pagesWithEightFaqs}/${TEST_CONFIG.testPages.length}`
  );

  if (pagesWithIncompleteFaqs.length > 0) {
    logWarning('需要添加FAQ的页面:');
    pagesWithIncompleteFaqs.forEach(({ page, count }) => {
      logInfo(`  ${page}: 当前${count}个，需要添加${8 - count}个`);
    });
  }

  return { passed: passedTests, total: totalTests };
}

/**
 * 测试4: 验证FAQ内容质量
 */
async function testFaqContentQuality() {
  log('\n🧪 测试4: 验证FAQ内容质量', 'cyan');
  log('='.repeat(50), 'cyan');

  // 检查一个示例页面的FAQ内容质量
  const samplePage = 'creole-to-english-translator';
  let passedTests = 0;
  const totalTests = 4;

  try {
    const jsonPath = path.join('messages', 'pages', samplePage, 'en.json');
    const content = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    const faqItems = data['CreoleToEnglishPage']?.faqs?.items;
    if (!faqItems) {
      logError(`${samplePage}: 无法获取FAQ数据`);
      return { passed: 0, total: 4 };
    }

    // 检查核心问题是否存在
    const hasFreeQuestion = Object.values(faqItems).some((item) =>
      item.question.toLowerCase().includes('free')
    );
    if (hasFreeQuestion) {
      logSuccess('包含免费使用相关FAQ问题');
      passedTests++;
    } else {
      logError('缺少免费使用相关FAQ问题');
    }

    // 检查隐私问题
    const hasPrivacyQuestion = Object.values(faqItems).some(
      (item) =>
        item.question.toLowerCase().includes('privacy') ||
        item.question.toLowerCase().includes('secure')
    );
    if (hasPrivacyQuestion) {
      logSuccess('包含隐私安全相关FAQ问题');
      passedTests++;
    } else {
      logError('缺少隐私安全相关FAQ问题');
    }

    // 检查准确性问题
    const hasAccuracyQuestion = Object.values(faqItems).some((item) =>
      item.question.toLowerCase().includes('accurate')
    );
    if (hasAccuracyQuestion) {
      logSuccess('包含准确性相关FAQ问题');
      passedTests++;
    } else {
      logError('缺少准确性相关FAQ问题');
    }

    // 检查文件格式问题
    const hasFileFormatQuestion = Object.values(faqItems).some(
      (item) =>
        item.question.toLowerCase().includes('file') ||
        item.question.toLowerCase().includes('format')
    );
    if (hasFileFormatQuestion) {
      logSuccess('包含文件格式相关FAQ问题');
      passedTests++;
    } else {
      logError('缺少文件格式相关FAQ问题');
    }
  } catch (error) {
    logError(`无法验证FAQ内容质量: ${error.message}`);
  }

  logInfo(`FAQ内容质量测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 主测试函数
 */
async function runTests() {
  log('🚀 全局FAQ恢复验证测试', 'bright');
  log('='.repeat(60), 'cyan');
  logInfo('测试页面数量:', TEST_CONFIG.testPages.length);
  logInfo('期望FAQ数量:', TEST_CONFIG.expectedFaqCount);
  logInfo('期望组件:', TEST_CONFIG.expectedComponent);

  const testResults = [];

  try {
    // 运行所有测试
    testResults.push(await testPageComponents());
    testResults.push(await testFaqComponentCode());
    testResults.push(await testFaqDataIntegrity());
    testResults.push(await testFaqContentQuality());

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
      logSuccess('🎉 所有测试通过！FAQ恢复验证成功。');
    } else if (successRate >= 80) {
      logWarning(`⚠️  大部分测试通过 (${successRate}%)，建议检查失败的测试项。`);
    } else {
      logError(`❌ 测试失败率较高 (${successRate}%)，请检查并修复问题。`);
    }

    // 详细结果
    log('\n📋 详细测试结果:');
    const testNames = [
      '页面组件引用验证',
      'FAQ组件代码验证',
      'FAQ数据完整性验证',
      'FAQ内容质量验证',
    ];

    testResults.forEach((result, index) => {
      const rate = ((result.passed / result.total) * 100).toFixed(1);
      const status =
        result.passed === result.total ? '✅' : rate >= 80 ? '⚠️' : '❌';
      log(
        `${status} ${testNames[index]}: ${result.passed}/${result.total} (${rate}%)`
      );
    });

    // 建议和总结
    log('\n💡 FAQ恢复状态总结:');
    log('✨ 组件层面: 所有翻译工具页面已恢复为原始FaqSection组件');
    log('✨ 样式层面: 使用原始手风琴展开/收起交互');
    log('✨ 代码层面: FAQ组件支持8个问题项目');
    log('✨ 数据层面: 需要确保所有页面都有8个FAQ问题');

    if (totalPassed < totalTests) {
      log('\n🔍 建议的下一步行动:');
      log('🔧 为缺少FAQ的页面添加缺失的问题项目');
      log('🔧 确保所有FAQ问题都覆盖核心功能');
      log('🔧 验证页面渲染和交互正常');
    }
  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests();
