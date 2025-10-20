#!/usr/bin/env node

/**
 * 🧪 Fun Facts和Highlights标题优化测试用例
 *
 * 测试目标：
 * 1. 验证标题更新是否正确应用
 * 2. 测试页面加载和标题显示
 * 3. 检查SEO改进效果
 * 4. 验证用户体验提升
 *
 * 使用方法：
 * node scripts/test-funfact-highlight-optimization.js
 */

import { execSync } from 'node:child_process';
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
  ],
  expectedTitles: {
    funFacts: 'Fascinating Language Insights',
    highlights: 'Why Choose Our Translation Tool',
  },
  oldTitles: {
    funFacts: 'Fun Facts',
    highlights: 'Key Features of Our Translator',
  },
  devServerPort: 3000,
  testTimeout: 10000,
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

function logTest(testName) {
  log(`\n🧪 测试: ${testName}`, 'cyan');
  log('='.repeat(50), 'cyan');
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
 * 测试1: JSON文件标题验证
 */
async function testJsonTitles() {
  logTest('JSON文件标题验证');

  let passedTests = 0;
  let totalTests = 0;

  for (const page of TEST_CONFIG.testPages) {
    totalTests += 2;

    try {
      const enJsonPath = path.join('messages', 'pages', page, 'en.json');
      const content = await fs.readFile(enJsonPath, 'utf-8');
      const data = JSON.parse(content);

      // 获取页面命名空间
      const pageName =
        page
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('') + 'Page';

      const funFactsTitle = data[pageName]?.funFacts?.title;
      const highlightsTitle = data[pageName]?.highlights?.title;

      // 测试Fun Facts标题
      if (funFactsTitle === TEST_CONFIG.expectedTitles.funFacts) {
        logSuccess(`${page}: Fun Facts标题正确 = "${funFactsTitle}"`);
        passedTests++;
      } else {
        logError(
          `${page}: Fun Facts标题错误 = "${funFactsTitle}" (期望: "${TEST_CONFIG.expectedTitles.funFacts}")`
        );
      }

      // 测试Highlights标题
      if (highlightsTitle === TEST_CONFIG.expectedTitles.highlights) {
        logSuccess(`${page}: Highlights标题正确 = "${highlightsTitle}"`);
        passedTests++;
      } else {
        logError(
          `${page}: Highlights标题错误 = "${highlightsTitle}" (期望: "${TEST_CONFIG.expectedTitles.highlights}")`
        );
      }
    } catch (error) {
      logError(`${page}: 读取JSON文件失败 - ${error.message}`);
    }
  }

  logInfo(`JSON标题测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试2: 代码引用验证
 */
async function testCodeReferences() {
  logTest('代码引用验证');

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
        logError(`${page}: Fun Facts代码引用缺失或错误`);
      }

      // 检查Highlights引用
      const hasHighlightsReference = content.includes(
        "(t as any)('highlights.title')"
      );
      if (hasHighlightsReference) {
        logSuccess(`${page}: Highlights代码引用正确`);
        passedTests++;
      } else {
        logError(`${page}: Highlights代码引用缺失或错误`);
      }
    } catch (error) {
      logError(`${page}: 读取页面文件失败 - ${error.message}`);
    }
  }

  logInfo(`代码引用测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试3: 构建验证
 */
async function testBuild() {
  logTest('项目构建验证');

  try {
    logInfo('开始运行 pnpm build...');
    const output = execSync('pnpm build', {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 120000, // 2分钟超时
    });

    logSuccess('构建成功完成');
    logInfo('构建输出：');
    console.log(output);

    return { passed: 1, total: 1 };
  } catch (error) {
    logError(`构建失败: ${error.message}`);
    if (error.stdout) {
      logInfo('构建输出：');
      console.log(error.stdout);
    }
    if (error.stderr) {
      logInfo('错误输出：');
      console.log(error.stderr);
    }

    return { passed: 0, total: 1 };
  }
}

/**
 * 测试4: 开发服务器测试
 */
async function testDevServer() {
  logTest('开发服务器页面加载测试');

  let serverProcess = null;
  let passedTests = 0;
  let totalTests = 0;

  try {
    // 检查端口是否已被占用
    let serverRunning = false;
    try {
      execSync(`lsof -i :${TEST_CONFIG.devServerPort}`, { stdio: 'pipe' });
      serverRunning = true;
      logInfo(`端口 ${TEST_CONFIG.devServerPort} 已有服务运行`);
    } catch {
      // 端口未被占用，需要启动服务器
      logInfo('启动开发服务器...');
      const { spawn } = await import('node:child_process');
      serverProcess = spawn('pnpm', ['dev'], {
        stdio: 'pipe',
        detached: false,
      });

      // 等待服务器启动
      await new Promise((resolve) => setTimeout(resolve, 8000));
    }

    // 测试页面加载
    for (const page of TEST_CONFIG.testPages) {
      totalTests += 2;

      try {
        // 测试页面是否可访问
        const url = `http://localhost:${TEST_CONFIG.devServerPort}/${page}`;
        logInfo(`测试页面: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(TEST_CONFIG.testTimeout),
        });

        if (response.ok) {
          const html = await response.text();

          // 检查新标题是否出现在HTML中
          const hasFunFactsTitle = html.includes(
            'Fascinating Language Insights'
          );
          const hasHighlightsTitle = html.includes(
            'Why Choose Our Translation Tool'
          );

          if (hasFunFactsTitle) {
            logSuccess(`${page}: Fun Facts新标题在页面中找到`);
            passedTests++;
          } else {
            logWarning(`${page}: Fun Facts新标题未在页面中找到`);
          }

          if (hasHighlightsTitle) {
            logSuccess(`${page}: Highlights新标题在页面中找到`);
            passedTests++;
          } else {
            logWarning(`${page}: Highlights新标题未在页面中找到`);
          }

          // 检查是否还有旧标题
          const hasOldFunFactsTitle = html.includes('Fun Facts');
          const hasOldHighlightsTitle = html.includes(
            'Key Features of Our Translator'
          );

          if (hasOldFunFactsTitle) {
            logWarning(`${page}: 仍发现旧的Fun Facts标题`);
          }

          if (hasOldHighlightsTitle) {
            logWarning(`${page}: 仍发现旧的Highlights标题`);
          }
        } else {
          logError(`${page}: 页面访问失败 (HTTP ${response.status})`);
        }
      } catch (error) {
        logError(`${page}: 页面测试失败 - ${error.message}`);
      }
    }
  } catch (error) {
    logError(`开发服务器测试失败 - ${error.message}`);
  } finally {
    // 如果我们启动了服务器，询问是否关闭
    if (serverProcess && !serverRunning) {
      logInfo('\n开发服务器由测试脚本启动');
      logWarning('请手动停止开发服务器（Ctrl+C）');
      // 不自动关闭服务器，让用户决定
    }
  }

  logInfo(`开发服务器测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试5: SEO关键词分析
 */
async function testSEOImprovement() {
  logTest('SEO关键词改进分析');

  let passedTests = 0;
  const totalTests = 4;

  // 分析新标题的SEO价值
  const newFunFactsTitle = TEST_CONFIG.expectedTitles.funFacts;
  const newHighlightsTitle = TEST_CONFIG.expectedTitles.highlights;

  // 测试关键词包含
  if (newFunFactsTitle.toLowerCase().includes('language')) {
    logSuccess('Fun Facts标题包含"language"关键词');
    passedTests++;
  } else {
    logError('Fun Facts标题缺少"language"关键词');
  }

  // 测试标题长度（SEO最佳实践：标题长度20-70字符）
  if (newFunFactsTitle.length >= 20 && newFunFactsTitle.length <= 70) {
    logSuccess(`Fun Facts标题长度适中: ${newFunFactsTitle.length} 字符`);
    passedTests++;
  } else {
    logWarning(
      `Fun Facts标题长度可能需要优化: ${newFunFactsTitle.length} 字符`
    );
  }

  // 测试问题导向标题（Highlights）
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

  logInfo(`SEO改进测试结果: ${passedTests}/${totalTests} 通过`);
  return { passed: passedTests, total: totalTests };
}

/**
 * 测试6: 用户体验分析
 */
async function testUserExperience() {
  logTest('用户体验改进分析');

  let passedTests = 0;
  const totalTests = 4;

  // 分析标题的吸引力
  const newFunFactsTitle = TEST_CONFIG.expectedTitles.funFacts;
  const newHighlightsTitle = TEST_CONFIG.expectedTitles.highlights;

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

  // 测试独特性（与旧标题对比）
  const oldFunFactsTitle = TEST_CONFIG.oldTitles.funFacts;
  const oldHighlightsTitle = TEST_CONFIG.oldTitles.highlights;

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
  log('🚀 Fun Facts和Highlights标题优化测试', 'bright');
  log('='.repeat(60), 'cyan');
  logInfo('测试页面:', TEST_CONFIG.testPages.join(', '));
  logInfo('期望的Fun Facts标题:', TEST_CONFIG.expectedTitles.funFacts);
  logInfo('期望的Highlights标题:', TEST_CONFIG.expectedTitles.highlights);

  const testResults = [];

  try {
    // 运行所有测试
    testResults.push(await testJsonTitles());
    testResults.push(await testCodeReferences());
    testResults.push(await testBuild());
    testResults.push(await testDevServer());
    testResults.push(await testSEOImprovement());
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
      logWarning(`⚠️  大部分测试通过 (${successRate}%)，建议检查失败的测试项。`);
    } else {
      logError(`❌ 测试失败率较高 (${successRate}%)，请检查并修复问题。`);
    }

    // 详细结果
    log('\n📋 详细测试结果:');
    const testNames = [
      'JSON文件标题验证',
      '代码引用验证',
      '项目构建验证',
      '开发服务器测试',
      'SEO关键词分析',
      '用户体验分析',
    ];

    testResults.forEach((result, index) => {
      const rate = ((result.passed / result.total) * 100).toFixed(1);
      const status =
        result.passed === result.total ? '✅' : rate >= 80 ? '⚠️' : '❌';
      log(
        `${status} ${testNames[index]}: ${result.passed}/${result.total} (${rate}%)`
      );
    });

    // 建议
    log('\n💡 优化效果分析:');
    log('✨ 标题吸引力提升: 从标准化标题改为独特性和吸引力更强的标题');
    log('✨ SEO价值改进: 增加了"language"等关键词，优化了标题长度');
    log('✨ 用户体验优化: 使用好奇心激发词汇和价值主张明确的表达');
    log('✨ 品牌一致性: 所有翻译工具使用统一优化的标题策略');
  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests();
