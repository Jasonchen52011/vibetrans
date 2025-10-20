/**
 * 测试用例：检测所有翻译工具页面的hero description是否自然融入"best"关键词
 *
 * 测试目标：
 * 1. 验证所有翻译工具页面的hero description包含"best"关键词
 * 2. 确保"best"关键词的融入自然流畅
 * 3. 检查描述长度保持在合理范围内
 * 4. 确保没有语法错误或表达问题
 */

const fs = require('fs');
const path = require('path');

// 翻译工具页面列表
const translatorPages = [
  'al-bhed-translator',
  'ancient-greek-translator',
  'baby-translator',
  'bad-translator',
  'baybayin-translator',
  'cantonese-translator',
  'chinese-to-english-translator',
  'creole-to-english-translator',
  'cuneiform-translator',
  'dog-translator',
  'gaster-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'gibberish-translator',
  'high-valyrian-translator',
  'middle-english-translator',
  'minion-translator',
  'pig-latin-translator',
  'samoan-to-english-translator',
  'albanian-to-english',
  'alien-text-generator',
  'creole-to-english',
  'esperanto-translator',
  'ivr-translator',
  'verbose-generator',
];

class HeroDescriptionTestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: [],
    };
  }

  // 读取JSON文件
  readJsonFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return null;
    }
  }

  // 获取hero description
  getHeroDescription(pageData, pageName) {
    try {
      // 尝试不同的可能路径
      const namespaceKey = `${pageName.replace(/-([a-z])/g, (g) => g[1].toUpperCase() + g.slice(2))}Page`;

      if (pageData[namespaceKey]?.hero?.description) {
        return pageData[namespaceKey].hero.description;
      }

      // 尝试其他可能的路径
      const keys = Object.keys(pageData);
      for (const key of keys) {
        if (pageData[key]?.hero?.description) {
          return pageData[key].hero.description;
        }
      }

      return null;
    } catch (error) {
      console.error(
        `Error extracting hero description for ${pageName}:`,
        error.message
      );
      return null;
    }
  }

  // 测试hero description是否包含"best"关键词
  testContainsBest(description, pageName) {
    if (!description) {
      return {
        passed: false,
        reason: 'Hero description not found',
      };
    }

    const containsBest = /\bbest\b/i.test(description);
    return {
      passed: containsBest,
      reason: containsBest
        ? 'Contains "best" keyword'
        : 'Missing "best" keyword',
    };
  }

  // 测试描述长度是否合理
  testDescriptionLength(description) {
    if (!description) {
      return { passed: false, reason: 'No description to test' };
    }

    const wordCount = description.split(/\s+/).length;
    const charCount = description.length;

    let lengthReason = '';
    let passed = true;

    if (wordCount < 15) {
      passed = false;
      lengthReason = `Too short: ${wordCount} words (minimum 15 recommended)`;
    } else if (wordCount > 50) {
      passed = false;
      lengthReason = `Too long: ${wordCount} words (maximum 50 recommended)`;
    } else {
      lengthReason = `Good length: ${wordCount} words, ${charCount} characters`;
    }

    return {
      passed,
      reason: lengthReason,
    };
  }

  // 测试"best"关键词融入是否自然
  testNaturalIntegration(description) {
    if (!description) {
      return { passed: false, reason: 'No description to test' };
    }

    const lowerDesc = description.toLowerCase();

    // 检查不自然的模式
    const unnaturalPatterns = [
      /best\s+best/i, // 重复的best
      /best\s*$|^best\s+/i, // best在开头或结尾
      /\s+best\s+best/i, // 多个best
      /best\s+of\s+the\s+best/i, // best of the best (陈词滥调)
    ];

    for (const pattern of unnaturalPatterns) {
      if (pattern.test(description)) {
        return {
          passed: false,
          reason: `Unnatural "best" usage detected: ${pattern}`,
        };
      }
    }

    // 检查自然的best用法模式
    const naturalPatterns = [
      /best\s+\w+/i, // best + 形容词 (best real-time, best AI-powered)
      /\w+\s+best/i, // 名词 + best (Vibetrans' best)
      /the\s+best\s+\w+/i, // the best + 名词 (the best tool)
    ];

    let hasNaturalPattern = false;
    for (const pattern of naturalPatterns) {
      if (pattern.test(description)) {
        hasNaturalPattern = true;
        break;
      }
    }

    return {
      passed: hasNaturalPattern,
      reason: hasNaturalPattern
        ? 'Natural "best" keyword integration'
        : 'Could not detect natural "best" usage pattern',
    };
  }

  // 运行单个页面的测试
  async testPage(pageName) {
    const filePath = path.join(
      __dirname,
      '..',
      'messages',
      'pages',
      pageName,
      'en.json'
    );
    const pageData = this.readJsonFile(filePath);

    if (!pageData) {
      return {
        pageName,
        passed: false,
        reason: 'Could not read page data',
        description: null,
      };
    }

    const description = this.getHeroDescription(pageData, pageName);
    const bestTest = this.testContainsBest(description, pageName);
    const lengthTest = this.testDescriptionLength(description);
    const naturalTest = this.testNaturalIntegration(description);

    const overallPassed =
      bestTest.passed && lengthTest.passed && naturalTest.passed;

    return {
      pageName,
      passed: overallPassed,
      description,
      tests: {
        containsBest: bestTest,
        length: lengthTest,
        naturalIntegration: naturalTest,
      },
    };
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🧪 开始运行Hero Description测试套件...\n');

    for (const pageName of translatorPages) {
      this.results.total++;
      console.log(`📄 测试页面: ${pageName}`);

      const result = await this.testPage(pageName);
      this.results.details.push(result);

      if (result.passed) {
        this.results.passed++;
        console.log('✅ 通过');
      } else {
        this.results.failed++;
        console.log('❌ 失败');
      }

      // 显示详细测试结果
      if (result.tests) {
        Object.entries(result.tests).forEach(([testName, testResult]) => {
          const status = testResult.passed ? '✅' : '❌';
          console.log(`   ${status} ${testName}: ${testResult.reason}`);
        });
      }

      if (result.description) {
        console.log(
          `   📝 Description: "${result.description.substring(0, 100)}${result.description.length > 100 ? '...' : ''}"`
        );
      }

      console.log('');
    }

    this.printSummary();
  }

  // 打印测试总结
  printSummary() {
    console.log('\n📊 测试总结');
    console.log('='.repeat(50));
    console.log(`总页面数: ${this.results.total}`);
    console.log(`通过: ${this.results.passed} ✅`);
    console.log(`失败: ${this.results.failed} ❌`);
    console.log(
      `成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`
    );

    if (this.results.failed > 0) {
      console.log('\n❌ 失败的页面:');
      this.results.details
        .filter((detail) => !detail.passed)
        .forEach((detail) => {
          console.log(`   - ${detail.pageName}`);
        });
    }

    console.log('\n🎯 优化建议:');
    if (this.results.failed === 0) {
      console.log(
        '🎉 所有页面都已成功优化！hero description都包含了"best"关键词。'
      );
    } else {
      console.log('需要检查并修复失败的页面，确保：');
      console.log('1. hero description包含"best"关键词');
      console.log('2. 描述长度在15-50词之间');
      console.log('3. "best"关键词融入自然流畅');
    }
  }

  // 生成测试报告文件
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(
          1
        ),
      },
      details: this.results.details,
    };

    const reportPath = path.join(
      __dirname,
      'hero-description-test-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细测试报告已生成: ${reportPath}`);
  }
}

// 运行测试
async function runHeroDescriptionTests() {
  const testSuite = new HeroDescriptionTestSuite();
  await testSuite.runAllTests();
  testSuite.generateReport();
}

// 如果直接运行此脚本
if (require.main === module) {
  runHeroDescriptionTests().catch(console.error);
}

module.exports = { HeroDescriptionTestSuite, runHeroDescriptionTests };
