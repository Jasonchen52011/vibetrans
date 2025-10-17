/**
 * 前端交互自动化测试脚本
 * 使用Puppeteer测试翻译工具的前端交互功能
 *
 * 功能测试包括：
 * - 实时语言检测
 * - UI标签动态更新
 * - 手动切换按钮功能
 * - 文件上传功能
 * - 复制/下载功能
 *
 * @author Claude AI Testing Suite
 * @version 1.0
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  headless: process.env.HEADLESS !== 'false',
  timeout: 30000,
  outputDir: './test-results/screenshots',
  viewport: { width: 1366, height: 768 },
};

// 翻译工具页面映射
const TOOL_PAGES = {
  // 优先级1：双语翻译工具
  'creole-to-english-translator': '/creole-to-english-translator',
  'chinese-to-english-translator': '/chinese-to-english-translator',
  'albanian-to-english': '/albanian-to-english',
  'samoan-to-english-translator': '/samoan-to-english-translator',
  'cantonese-translator': '/cantonese-translator',

  // 优先级2：特殊语言工具
  'aramaic-translator': '/aramaic-translator',
  'baybayin-translator': '/baybayin-translator',
  'cuneiform-translator': '/cuneiform-translator',
  'gaster-translator': '/gaster-translator',
  'high-valyrian-translator': '/high-valyrian-translator',

  // 优先级4：古典/虚构语言工具
  'ancient-greek-translator': '/ancient-greek-translator',
  'middle-english-translator': '/middle-english-translator',
  'esperanto-translator': '/esperanto-translator',
  'al-bhed-translator': '/al-bhed-translator',
  'pig-latin-translator': '/pig-latin-translator',
};

// 测试数据
const TEST_DATA = {
  languageDetection: {
    'creole-to-english-translator': {
      source: 'Bonjou, koman ou ye?',
      expected: 'Creole',
      target: 'English',
    },
    'chinese-to-english-translator': {
      source: '你好，很高兴认识你！',
      expected: 'Chinese',
      target: 'English',
    },
    'albanian-to-english': {
      source: 'Përshëndetje! Si jeni ju?',
      expected: 'Albanian',
      target: 'English',
    },
    'samoan-to-english-translator': {
      source: 'Talofa! Manuia faiva?',
      expected: 'Samoan',
      target: 'English',
    },
    'cantonese-translator': {
      source: '你好！食咗飯未呀？',
      expected: 'Cantonese',
      target: 'English',
    },
  },
  translationSamples: {
    'creole-to-english-translator': [
      { input: 'Bonjou', output: 'Hello' },
      { input: 'Mèsi', output: 'Thank you' },
    ],
    'chinese-to-english-translator': [
      { input: '你好', output: 'Hello' },
      { input: '谢谢', output: 'Thank you' },
    ],
    'albanian-to-english': [
      { input: 'Përshëndetje', output: 'Hello' },
      { input: 'Faleminderit', output: 'Thank you' },
    ],
    'samoan-to-english-translator': [
      { input: 'Talofa', output: 'Hello' },
      { input: 'Faʻafetai', output: 'Thank you' },
    ],
    'cantonese-translator': [
      { input: '你好', output: 'Hello' },
      { input: '多謝', output: 'Thank you' },
    ],
  },
};

// 测试结果类
class TestResult {
  constructor(toolName) {
    this.toolName = toolName;
    this.timestamp = new Date().toISOString();
    this.tests = {
      pageLoad: { passed: 0, failed: 0, details: [] },
      languageDetection: { passed: 0, failed: 0, details: [] },
      translation: { passed: 0, failed: 0, details: [] },
      uiInteraction: { passed: 0, failed: 0, details: [] },
      fileUpload: { passed: 0, failed: 0, details: [] },
      copyDownload: { passed: 0, failed: 0, details: [] },
    };
  }

  addResult(category, testName, passed, details = '') {
    this.tests[category].details.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });

    if (passed) {
      this.tests[category].passed++;
    } else {
      this.tests[category].failed++;
    }
  }

  getSummary() {
    const totalTests = Object.values(this.tests).reduce(
      (sum, category) => sum + category.passed + category.failed,
      0
    );
    const passedTests = Object.values(this.tests).reduce(
      (sum, category) => sum + category.passed,
      0
    );

    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate:
        totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
    };
  }
}

// 主测试类
class FrontendTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(TEST_CONFIG.outputDir)) {
      fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
    }
  }

  async init() {
    console.log('🚀 启动浏览器...');
    this.browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(TEST_CONFIG.viewport);

    // 设置超时
    this.page.setDefaultTimeout(TEST_CONFIG.timeout);

    console.log('✅ 浏览器启动成功');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ 浏览器已关闭');
    }
  }

  /**
   * 测试单个工具
   */
  async testTool(toolName) {
    console.log(`\n📋 测试工具: ${toolName}`);

    const result = new TestResult(toolName);
    const pageUrl = `${TEST_CONFIG.baseUrl}${TOOL_PAGES[toolName]}`;

    try {
      // 测试页面加载
      await this.testPageLoad(pageUrl, result);

      // 测试语言检测
      if (TEST_DATA.languageDetection[toolName]) {
        await this.testLanguageDetection(toolName, result);
      }

      // 测试翻译功能
      if (TEST_DATA.translationSamples[toolName]) {
        await this.testTranslation(toolName, result);
      }

      // 测试UI交互
      await this.testUIInteraction(toolName, result);

      // 测试文件上传（如果支持）
      await this.testFileUpload(toolName, result);

      // 测试复制/下载功能
      await this.testCopyDownload(result);
    } catch (error) {
      console.error(`❌ 测试 ${toolName} 时出错:`, error.message);
      result.addResult('pageLoad', '页面访问', false, error.message);
    }

    this.results.push(result);
    const summary = result.getSummary();
    console.log(
      `✅ 完成 ${toolName} - 成功率: ${summary.successRate}% (${summary.passedTests}/${summary.totalTests})`
    );

    return result;
  }

  /**
   * 测试页面加载
   */
  async testPageLoad(pageUrl, result) {
    try {
      console.log('   📄 测试页面加载...');

      const startTime = Date.now();
      await this.page.goto(pageUrl, { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;

      // 检查页面标题
      const title = await this.page.title();
      const hasTitle = title && title.length > 0;

      // 检查主要内容区域
      const hasMainContent =
        (await this.page.$('main, .main, #main, .container')) !== null;

      // 检查输入框
      const hasInput =
        (await this.page.$('textarea, input[type="text"]')) !== null;

      // 检查翻译按钮
      const hasTranslateButton =
        (await this.page.$(
          'button[type="submit"], .translate-btn, #translate'
        )) !== null;

      // 截图
      await this.takeScreenshot(`${result.toolName}_page_load`);

      const allChecksPass =
        hasTitle && hasMainContent && hasInput && hasTranslateButton;

      result.addResult(
        'pageLoad',
        '页面加载',
        allChecksPass,
        `加载时间: ${loadTime}ms, 标题: ${title}, 主要元素: ${hasMainContent}, 输入框: ${hasInput}, 按钮: ${hasTranslateButton}`
      );

      if (!allChecksPass) {
        console.warn('   ⚠️ 页面加载有问题');
      }
    } catch (error) {
      result.addResult('pageLoad', '页面加载', false, error.message);
      console.error('   ❌ 页面加载失败:', error.message);
    }
  }

  /**
   * 测试语言检测功能
   */
  async testLanguageDetection(toolName, result) {
    try {
      console.log('   🔍 测试语言检测...');

      const testData = TEST_DATA.languageDetection[toolName];

      // 输入测试文本
      const inputSelector = 'textarea, input[type="text"]';
      await this.page.type(inputSelector, testData.source);

      // 等待语言检测（通常有延迟）
      await this.page.waitForTimeout(2000);

      // 检查语言检测提示
      const languageIndicators = [
        '.language-indicator',
        '.detected-language',
        '.language-info',
        '[data-testid="language-detection"]',
      ];

      let detectionFound = false;
      let detectionText = '';

      for (const selector of languageIndicators) {
        const element = await this.page.$(selector);
        if (element) {
          detectionText = await this.page.$eval(
            selector,
            (el) => el.textContent
          );
          detectionFound = true;
          break;
        }
      }

      // 检查UI更新（标签、方向等）
      const directionIndicator = await this.page.$(
        '.direction-indicator, .translation-direction'
      );
      let directionText = '';
      if (directionIndicator) {
        directionText = await this.page.$eval(
          '.direction-indicator, .translation-direction',
          (el) => el.textContent
        );
      }

      await this.takeScreenshot(`${result.toolName}_language_detection`);

      const testPassed =
        detectionFound &&
        detectionText.toLowerCase().includes(testData.expected.toLowerCase());

      result.addResult(
        'languageDetection',
        '语言检测显示',
        testPassed,
        `检测文本: ${testData.source}, 检测结果: ${detectionText}, 方向: ${directionText}`
      );

      // 清空输入框
      await this.page.$eval(inputSelector, (el) => (el.value = ''));
    } catch (error) {
      result.addResult('languageDetection', '语言检测', false, error.message);
      console.error('   ❌ 语言检测测试失败:', error.message);
    }
  }

  /**
   * 测试翻译功能
   */
  async testTranslation(toolName, result) {
    try {
      console.log('   🔄 测试翻译功能...');

      const samples = TEST_DATA.translationSamples[toolName];

      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];

        // 输入文本
        const inputSelector = 'textarea, input[type="text"]';
        await this.page.$eval(inputSelector, (el) => (el.value = ''));
        await this.page.type(inputSelector, sample.input);

        // 点击翻译按钮
        const translateButton = await this.page.$(
          'button[type="submit"], .translate-btn, #translate'
        );
        if (translateButton) {
          await translateButton.click();

          // 等待翻译完成
          await this.page.waitForTimeout(5000);

          // 检查翻译结果
          const outputSelectors = [
            '.translation-result',
            '.translated-text',
            '#translation-output',
            '.output-text',
          ];

          let translationFound = false;
          let translationText = '';

          for (const selector of outputSelectors) {
            const element = await this.page.$(selector);
            if (element) {
              translationText = await this.page.$eval(
                selector,
                (el) => el.textContent
              );
              translationFound = true;
              break;
            }
          }

          await this.takeScreenshot(`${result.toolName}_translation_${i + 1}`);

          const testPassed = translationFound && translationText.length > 0;

          result.addResult(
            'translation',
            `翻译测试 ${i + 1}`,
            testPassed,
            `输入: ${sample.input}, 输出: ${translationText}`
          );
        } else {
          result.addResult(
            'translation',
            `翻译测试 ${i + 1}`,
            false,
            '未找到翻译按钮'
          );
        }
      }
    } catch (error) {
      result.addResult('translation', '翻译功能', false, error.message);
      console.error('   ❌ 翻译功能测试失败:', error.message);
    }
  }

  /**
   * 测试UI交互
   */
  async testUIInteraction(toolName, result) {
    try {
      console.log('   🖱️ 测试UI交互...');

      // 测试手动切换按钮
      const switchButtons = await this.page.$$(
        '.switch-direction, .swap-btn, .direction-switch'
      );

      if (switchButtons.length > 0) {
        await switchButtons[0].click();
        await this.page.waitForTimeout(1000);

        result.addResult(
          'uiInteraction',
          '方向切换按钮',
          true,
          '成功点击方向切换按钮'
        );

        await this.takeScreenshot(`${result.toolName}_direction_switch`);
      } else {
        result.addResult(
          'uiInteraction',
          '方向切换按钮',
          false,
          '未找到方向切换按钮'
        );
      }

      // 测试清空按钮
      const clearButtons = await this.page.$$(
        '.clear-btn, .reset-btn, [data-testid="clear"]'
      );

      if (clearButtons.length > 0) {
        await clearButtons[0].click();
        await this.page.waitForTimeout(1000);

        // 检查输入框是否已清空
        const inputSelector = 'textarea, input[type="text"]';
        const inputValue = await this.page.$eval(
          inputSelector,
          (el) => el.value
        );
        const isCleared = !inputValue || inputValue.trim() === '';

        result.addResult(
          'uiInteraction',
          '清空按钮',
          isCleared,
          isCleared ? '成功清空输入框' : '清空按钮无效'
        );

        await this.takeScreenshot(`${result.toolName}_clear_button`);
      } else {
        result.addResult('uiInteraction', '清空按钮', false, '未找到清空按钮');
      }

      // 测试字数统计（如果存在）
      const charCount = await this.page.$(
        '.char-count, .word-count, [data-testid="char-count"]'
      );
      if (charCount) {
        const countText = await this.page.$eval(
          '.char-count, .word-count, [data-testid="char-count"]',
          (el) => el.textContent
        );
        result.addResult(
          'uiInteraction',
          '字数统计',
          true,
          `字数统计: ${countText}`
        );
      }
    } catch (error) {
      result.addResult('uiInteraction', 'UI交互', false, error.message);
      console.error('   ❌ UI交互测试失败:', error.message);
    }
  }

  /**
   * 测试文件上传功能
   */
  async testFileUpload(toolName, result) {
    try {
      console.log('   📁 测试文件上传...');

      const fileInput = await this.page.$('input[type="file"]');

      if (fileInput) {
        // 创建测试文件
        const testFilePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(
          testFilePath,
          'Hello world, this is a test file for upload.'
        );

        // 上传文件
        await fileInput.uploadFile(testFilePath);
        await this.page.waitForTimeout(2000);

        // 检查是否有上传反馈
        const uploadFeedback = await this.page.$(
          '.upload-feedback, .file-info, .upload-status'
        );
        const hasFeedback = uploadFeedback !== null;

        result.addResult(
          'fileUpload',
          '文件上传',
          hasFeedback,
          hasFeedback ? '文件上传成功，有反馈信息' : '文件上传完成但无反馈信息'
        );

        await this.takeScreenshot(`${result.toolName}_file_upload`);

        // 清理测试文件
        fs.unlinkSync(testFilePath);
      } else {
        result.addResult(
          'fileUpload',
          '文件上传支持',
          false,
          '该工具不支持文件上传'
        );
      }
    } catch (error) {
      result.addResult('fileUpload', '文件上传', false, error.message);
      console.error('   ❌ 文件上传测试失败:', error.message);
    }
  }

  /**
   * 测试复制/下载功能
   */
  async testCopyDownload(result) {
    try {
      console.log('   📋 测试复制/下载功能...');

      // 测试复制按钮
      const copyButtons = await this.page.$$(
        '.copy-btn, .copy-text, [data-testid="copy"]'
      );

      if (copyButtons.length > 0) {
        // 先执行一次翻译以获得结果
        const inputSelector = 'textarea, input[type="text"]';
        await this.page.type(inputSelector, 'Hello world');

        const translateButton = await this.page.$(
          'button[type="submit"], .translate-btn, #translate'
        );
        if (translateButton) {
          await translateButton.click();
          await this.page.waitForTimeout(3000);
        }

        // 尝试复制
        await copyButtons[0].click();
        await this.page.waitForTimeout(1000);

        result.addResult('copyDownload', '复制功能', true, '成功点击复制按钮');

        await this.takeScreenshot(`${result.toolName}_copy_function`);
      } else {
        result.addResult('copyDownload', '复制功能', false, '未找到复制按钮');
      }

      // 测试下载按钮
      const downloadButtons = await this.page.$$(
        '.download-btn, .download-text, [data-testid="download"]'
      );

      if (downloadButtons.length > 0) {
        // 注意：实际下载需要特殊处理，这里只测试按钮点击
        result.addResult('copyDownload', '下载功能', true, '找到下载按钮');
      } else {
        result.addResult('copyDownload', '下载功能', false, '未找到下载按钮');
      }
    } catch (error) {
      result.addResult('copyDownload', '复制/下载功能', false, error.message);
      console.error('   ❌ 复制/下载测试失败:', error.message);
    }
  }

  /**
   * 截图功能
   */
  async takeScreenshot(name) {
    try {
      const screenshotPath = path.join(
        TEST_CONFIG.outputDir,
        `${name}_${Date.now()}.png`
      );
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      return screenshotPath;
    } catch (error) {
      console.warn('   ⚠️ 截图失败:', error.message);
      return null;
    }
  }

  /**
   * 运行所有工具测试
   */
  async runAllTests() {
    console.log('🚀 开始前端交互测试套件...\n');

    try {
      await this.init();

      for (const toolName of Object.keys(TOOL_PAGES)) {
        await this.testTool(toolName);
      }

      await this.generateReport();
    } catch (error) {
      console.error('❌ 测试套件执行失败:', error);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    console.log('\n📊 生成测试报告...');

    const totalTools = this.results.length;
    const totalTests = this.results.reduce((sum, result) => {
      const summary = result.getSummary();
      return sum + summary.totalTests;
    }, 0);

    const totalPassed = this.results.reduce((sum, result) => {
      const summary = result.getSummary();
      return sum + summary.passedTests;
    }, 0);

    const overallSuccessRate =
      totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTools,
        totalTests,
        totalPassed,
        totalFailed: totalTests - totalPassed,
        overallSuccessRate,
      },
      toolResults: this.results.map((result) => ({
        toolName: result.toolName,
        timestamp: result.timestamp,
        summary: result.getSummary(),
        tests: result.tests,
      })),
    };

    // 保存JSON报告
    const reportPath = path.join(
      TEST_CONFIG.outputDir,
      `frontend-test-report-${Date.now()}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 打印汇总
    console.log('\n📈 前端测试汇总:');
    console.log(`   工具总数: ${totalTools}`);
    console.log(`   测试总数: ${totalTests}`);
    console.log(`   通过测试: ${totalPassed}`);
    console.log(`   失败测试: ${totalTests - totalPassed}`);
    console.log(`   成功率: ${overallSuccessRate}%`);

    // 显示失败的工具
    const failedTools = this.results.filter((result) => {
      const summary = result.getSummary();
      return summary.failedTests > 0;
    });

    if (failedTools.length > 0) {
      console.log('\n❌ 需要关注的工具:');
      failedTools.forEach((result) => {
        const summary = result.getSummary();
        console.log(
          `   ${result.toolName}: ${summary.successRate}% (${summary.failedTests}个失败)`
        );
      });
    }

    console.log(`\n📄 详细报告: ${reportPath}`);
    console.log(`📸 截图目录: ${TEST_CONFIG.outputDir}`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const testSuite = new FrontendTestSuite();

  // 处理命令行参数
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('前端交互测试脚本');
    console.log('');
    console.log('使用方法:');
    console.log('  node frontend-interaction-tests.js [选项]');
    console.log('');
    console.log('环境变量:');
    console.log('  TEST_BASE_URL - 测试基础URL (默认: http://localhost:3000)');
    console.log(
      '  HEADLESS - 是否无头模式 (默认: true, 设置为false显示浏览器)'
    );
    console.log('');
    console.log('示例:');
    console.log('  node frontend-interaction-tests.js');
    console.log(
      '  TEST_BASE_URL=https://staging.example.com HEADLESS=false node frontend-interaction-tests.js'
    );
    process.exit(0);
  }

  testSuite.runAllTests().catch((error) => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { FrontendTestSuite, TEST_CONFIG, TOOL_PAGES, TEST_DATA };
