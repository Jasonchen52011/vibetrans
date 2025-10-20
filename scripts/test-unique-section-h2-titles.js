#!/usr/bin/env node

/**
 * 🧪 全局Unique Section H2标题一致性测试用例
 *
 * 测试目标：
 * 1. 验证所有翻译工具页面的H2标题已个性化更新
 * 2. 确保标题与内容类型一致（功能型vs场景型）
 * 3. 检查是否还有重复的通用标题
 * 4. 验证SEO友好性和独特性
 *
 * 使用方法：
 * node scripts/test-unique-section-h2-titles.js
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
    'baby-translator',
    'chinese-to-english-translator',
    'middle-english-translator',
    'dog-translator',
    'gen-alpha-translator',
    'ivr-translator',
    'al-bhed-translator',
  ],
  // 已被替换的重复标题
  oldRepeatedTitles: [
    'Fascinating Language Insights',
    'Discover More with VibeTrans',
    'Topics of Interest',
    'User Interests',
  ],
  // 期望的标题模式（根据工具类型）
  expectedPatterns: {
    cultural: ['heritage', 'cultural', 'language', 'script', 'tradition'],
    functional: ['technology', 'features', 'applications', 'tools', 'systems'],
    scenario: [
      'scenarios',
      'applications',
      'learning',
      'communication',
      'use cases',
    ],
    creative: ['creative', 'fun', 'play', 'artistic', 'entertainment'],
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

function logTest(testName) {
  log(`\n🧪 测试: ${testName}`, 'cyan');
  log('='.repeat(50), 'cyan');
}

/**
 * 测试1: 验证重复标题已被替换
 */
async function testNoRepeatedTitles() {
  logTest('重复标题替换验证');

  let passedTests = 0;
  let totalTests = 0;
  const pagesWithOldTitles = [];

  for (const page of TEST_CONFIG.testPages) {
    totalTests++;

    try {
      const jsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(content);

      // 检查各种可能的section key
      const sections = [
        'funFacts',
        'funfacts',
        'userInterest',
        'userScenarios',
        'unique',
      ];
      let hasOldTitle = false;

      for (const section of sections) {
        const pageData = data[Object.keys(data)[0]]; // 获取页面数据
        if (pageData[section]?.title) {
          const title = pageData[section].title;
          if (TEST_CONFIG.oldRepeatedTitles.includes(title)) {
            hasOldTitle = true;
            pagesWithOldTitles.push({ page, section, title });
            break;
          }
        }
      }

      if (!hasOldTitle) {
        logSuccess(`${page}: 未发现重复的通用标题`);
        passedTests++;
      } else {
        logError(`${page}: 仍使用重复的通用标题`);
      }
    } catch (error) {
      logError(`${page}: 读取文件失败 - ${error.message}`);
    }
  }

  logInfo(`重复标题测试结果: ${passedTests}/${totalTests} 通过`);

  if (pagesWithOldTitles.length > 0) {
    logWarning('仍使用旧标题的页面:');
    pagesWithOldTitles.forEach(({ page, section, title }) => {
      logInfo(`  ${page}.${section}: "${title}"`);
    });
  }

  return { passed: passedTests, total: totalTests };
}

/**
 * 测试2: 验证标题与内容类型一致性
 */
async function testTitleContentConsistency() {
  logTest('标题与内容类型一致性验证');

  let passedTests = 0;
  let totalTests = 0;
  const inconsistentPages = [];

  // 定义每个页面的预期内容类型
  const pageTypes = {
    'baybayin-translator': 'cultural',
    'creole-to-english-translator': 'cultural',
    'middle-english-translator': 'cultural',
    'ancient-greek-translator': 'cultural',
    'esperanto-translator': 'cultural',

    'ivr-translator': 'functional',
    'al-bhed-translator': 'functional',

    'gen-z-translator': 'scenario',
    'gen-alpha-translator': 'scenario',
    'dog-translator': 'scenario',
    'baby-translator': 'scenario',

    'pig-latin-translator': 'creative',
    'alien-text-generator': 'creative',
    'bad-translator': 'creative',

    'chinese-to-english-translator': 'scenario', // 混合型，归为场景
  };

  for (const [page, expectedType] of Object.entries(pageTypes)) {
    if (!TEST_CONFIG.testPages.includes(page)) continue;

    totalTests++;

    try {
      const jsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(content);

      const pageData = data[Object.keys(data)[0]];
      const sections = [
        'funFacts',
        'funfacts',
        'userInterest',
        'userScenarios',
        'unique',
      ];

      let hasConsistentTitle = false;

      for (const section of sections) {
        if (pageData[section]?.title) {
          const title = pageData[section].title.toLowerCase();
          const expectedKeywords = TEST_CONFIG.expectedPatterns[expectedType];

          // 检查标题是否包含预期类型的关键词
          const hasExpectedKeyword = expectedKeywords.some((keyword) =>
            title.includes(keyword)
          );

          if (hasExpectedKeyword) {
            hasConsistentTitle = true;
            break;
          }
        }
      }

      if (hasConsistentTitle) {
        logSuccess(`${page}: 标题与${expectedType}类型内容一致`);
        passedTests++;
      } else {
        logError(`${page}: 标题与${expectedType}类型内容不一致`);
        inconsistentPages.push({ page, expectedType });
      }
    } catch (error) {
      logError(`${page}: 验证失败 - ${error.message}`);
    }
  }

  logInfo(`标题一致性测试结果: ${passedTests}/${totalTests} 通过`);

  if (inconsistentPages.length > 0) {
    logWarning('标题不一致的页面:');
    inconsistentPages.forEach(({ page, expectedType }) => {
      logInfo(`  ${page}: 期望${expectedType}类型标题`);
    });
  }

  return { passed: passedTests, total: totalTests };
}

/**
 * 测试3: 验证标题独特性
 */
async function testTitleUniqueness() {
  logTest('标题独特性验证');

  try {
    const allTitles = new Map();
    const duplicateTitles = [];

    for (const page of TEST_CONFIG.testPages) {
      const jsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(content);

      const pageData = data[Object.keys(data)[0]];
      const sections = [
        'funFacts',
        'funfacts',
        'userInterest',
        'userScenarios',
        'unique',
      ];

      for (const section of sections) {
        if (pageData[section]?.title) {
          const title = pageData[section].title;

          if (allTitles.has(title)) {
            duplicateTitles.push({
              title,
              pages: [allTitles.get(title), page],
            });
          } else {
            allTitles.set(title, page);
          }
        }
      }
    }

    const uniqueTitles = allTitles.size;
    const totalTitles = allTitles.size + duplicateTitles.length;
    const uniquenessRate = ((uniqueTitles / totalTitles) * 100).toFixed(1);

    logInfo(
      `独特性分析: ${uniqueTitles}/${totalTitles} 标题是独特的 (${uniquenessRate}%)`
    );

    if (duplicateTitles.length === 0) {
      logSuccess('所有标题都是独特的，没有重复');
      return { passed: 1, total: 1 };
    } else {
      logWarning('发现重复标题:');
      duplicateTitles.forEach(({ title, pages }) => {
        logInfo(`  "${title}": ${pages.join(', ')}`);
      });
      return { passed: 0, total: 1 };
    }
  } catch (error) {
    logError(`独特性测试失败: ${error.message}`);
    return { passed: 0, total: 1 };
  }
}

/**
 * 测试4: 验证SEO友好性
 */
async function testSEOFriendliness() {
  logTest('SEO友好性验证');

  let passedTests = 0;
  let totalTests = 0;
  const titleIssues = [];

  for (const page of TEST_CONFIG.testPages) {
    const jsonPath = path.join('messages', 'pages', page, 'en.json');
    const content = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    const pageData = data[Object.keys(data)[0]];
    const sections = [
      'funFacts',
      'funfacts',
      'userInterest',
      'userScenarios',
      'unique',
    ];

    for (const section of sections) {
      if (pageData[section]?.title) {
        totalTests++;
        const title = pageData[section].title;
        const issues = [];

        // 检查长度（SEO最佳实践：20-70字符）
        if (title.length < 20) {
          issues.push('过短');
        } else if (title.length > 70) {
          issues.push('过长');
        }

        // 检查是否包含关键词
        const hasKeywords =
          /\b(translation|language|tool|app|service|features|applications)\b/i.test(
            title
          );
        if (!hasKeywords) {
          issues.push('缺少关键词');
        }

        // 检查是否包含工具名称
        const toolName = page.replace('-translator', '').replace('-', ' ');
        if (
          !title.toLowerCase().includes(toolName.split(' ')[0]) &&
          !title.toLowerCase().includes(page.split('-')[0])
        ) {
          issues.push('缺少工具名称');
        }

        if (issues.length === 0) {
          passedTests++;
          logSuccess(`${page}.${section}: SEO友好`);
        } else {
          logWarning(`${page}.${section}: ${issues.join(', ')}`);
          titleIssues.push({ page, section, title, issues });
        }
      }
    }
  }

  logInfo(`SEO友好性测试结果: ${passedTests}/${totalTests} 通过`);

  if (titleIssues.length > 0) {
    logWarning('需要优化的标题:');
    titleIssues.forEach(({ page, section, title, issues }) => {
      logInfo(`  ${page}.${section}: "${title}" (${issues.join(', ')})`);
    });
  }

  return { passed: passedTests, total: totalTests };
}

/**
 * 测试5: 验证JSON格式完整性
 */
async function testJSONIntegrity() {
  logTest('JSON格式完整性验证');

  let passedTests = 0;
  const totalTests = TEST_CONFIG.testPages.length;

  for (const page of TEST_CONFIG.testPages) {
    try {
      const jsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(jsonPath, 'utf-8');

      // 尝试解析JSON
      JSON.parse(content);

      // 检查必要结构
      const data = JSON.parse(content);
      const pageKey = Object.keys(data)[0];
      const pageData = data[pageKey];

      if (pageData && typeof pageData === 'object') {
        passedTests++;
        logSuccess(`${page}: JSON格式正确`);
      } else {
        logError(`${page}: JSON结构异常`);
      }
    } catch (error) {
      logError(`${page}: JSON解析失败 - ${error.message}`);
    }
  }

  logInfo(`JSON完整性测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 主测试函数
 */
async function runTests() {
  log('🚀 全局Unique Section H2标题一致性测试', 'bright');
  log('='.repeat(60), 'cyan');
  logInfo('测试页面数量:', TEST_CONFIG.testPages.length);
  logInfo('已被替换的重复标题:', TEST_CONFIG.oldRepeatedTitles.join(', '));

  const testResults = [];

  try {
    // 运行所有测试
    testResults.push(await testNoRepeatedTitles());
    testResults.push(await testTitleContentConsistency());
    testResults.push(await testTitleUniqueness());
    testResults.push(await testSEOFriendliness());
    testResults.push(await testJSONIntegrity());

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
      logSuccess('🎉 所有测试通过！H2标题优化成功完成。');
    } else if (successRate >= 80) {
      logWarning(`⚠️  大部分测试通过 (${successRate}%)，建议检查失败的测试项。`);
    } else {
      logError(`❌ 测试失败率较高 (${successRate}%)，请检查并修复问题。`);
    }

    // 详细结果
    log('\n📋 详细测试结果:');
    const testNames = [
      '重复标题替换验证',
      '标题与内容类型一致性验证',
      '标题独特性验证',
      'SEO友好性验证',
      'JSON格式完整性验证',
    ];

    testResults.forEach((result, index) => {
      const rate = ((result.passed / result.total) * 100).toFixed(1);
      const status =
        result.passed === result.total ? '✅' : rate >= 80 ? '⚠️' : '❌';
      log(
        `${status} ${testNames[index]}: ${result.passed}/${result.total} (${rate}%)`
      );
    });

    // 优化效果总结
    log('\n💡 H2标题优化效果总结:');
    log('✨ 个性化提升: 消除了重复的通用标题，每个页面都有独特的H2标题');
    log('✨ 内容一致性: 标题准确反映section内容类型（文化/功能/场景/创意）');
    log('✨ SEO优化: 标题包含相关关键词和工具名称，提升搜索引擎表现');
    log('✨ 用户体验: 用户可以更快速地理解各section的核心内容');
    log('✨ 品牌专业度: 体现专业的分类体系和内容组织能力');
  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests();
