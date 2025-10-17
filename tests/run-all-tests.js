#!/usr/bin/env node

/**
 * 智能翻译工具完整测试套件运行器
 * 自动执行所有类型的测试并生成综合报告
 *
 * @author Claude AI Testing Suite
 * @version 1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  outputDir: './test-results',
  reportsDir: './test-results/reports',
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 60000, // 60秒总超时
  parallel: process.env.PARALLEL_TESTS !== 'false',
};

// 测试类型
const TEST_TYPES = {
  API_CURL: 'api-curl',
  API_TYPESCRIPT: 'api-typescript',
  FRONTEND: 'frontend',
  PERFORMANCE: 'performance',
  INTEGRATION: 'integration',
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试结果类
class TestSession {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      [TEST_TYPES.API_CURL]: {
        status: 'pending',
        duration: 0,
        output: '',
        error: null,
      },
      [TEST_TYPES.API_TYPESCRIPT]: {
        status: 'pending',
        duration: 0,
        output: '',
        error: null,
      },
      [TEST_TYPES.FRONTEND]: {
        status: 'pending',
        duration: 0,
        output: '',
        error: null,
      },
      [TEST_TYPES.PERFORMANCE]: {
        status: 'pending',
        duration: 0,
        output: '',
        error: null,
      },
      [TEST_TYPES.INTEGRATION]: {
        status: 'pending',
        duration: 0,
        output: '',
        error: null,
      },
    };
    this.overallStatus = 'running';
  }

  markTestStart(testType) {
    this.results[testType].startTime = Date.now();
    this.results[testType].status = 'running';
  }

  markTestComplete(testType, success, output = '', error = null) {
    const result = this.results[testType];
    result.status = success ? 'passed' : 'failed';
    result.duration = Date.now() - result.startTime;
    result.output = output;
    result.error = error;
  }

  getSummary() {
    const totalDuration = Date.now() - this.startTime;
    const completedTests = Object.values(this.results).filter(
      (r) => r.status !== 'pending'
    );
    const passedTests = Object.values(this.results).filter(
      (r) => r.status === 'passed'
    );
    const failedTests = Object.values(this.results).filter(
      (r) => r.status === 'failed'
    );

    return {
      totalDuration,
      totalTests: completedTests.length,
      passedTests: passedTests.length,
      failedTests: failedTests.length,
      successRate:
        completedTests.length > 0
          ? Math.round((passedTests.length / completedTests.length) * 100)
          : 0,
      overallStatus:
        failedTests.length > 0
          ? 'failed'
          : completedTests.length === Object.keys(TEST_TYPES).length
            ? 'passed'
            : 'incomplete',
    };
  }
}

// 主测试运行器类
class TestRunner {
  constructor() {
    this.session = new TestSession();
    this.ensureDirectories();
  }

  ensureDirectories() {
    [CONFIG.outputDir, CONFIG.reportsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runAllTests() {
    colorLog('cyan', '🚀 启动智能翻译工具完整测试套件');
    colorLog('blue', `📊 测试目标: ${CONFIG.baseUrl}`);
    colorLog('blue', `⏰ 开始时间: ${new Date().toLocaleString()}`);
    console.log('');

    try {
      // 检查服务器是否运行
      await this.checkServerStatus();

      // 运行各类测试
      await this.runApiCurlTests();
      await this.runApiTypeScriptTests();
      await this.runFrontendTests();
      await this.runPerformanceTests();
      await this.runIntegrationTests();

      // 生成综合报告
      await this.generateComprehensiveReport();
    } catch (error) {
      colorLog('red', `❌ 测试套件执行失败: ${error.message}`);
      this.session.overallStatus = 'error';
    }

    this.printFinalSummary();
  }

  async checkServerStatus() {
    colorLog('yellow', '🔍 检查服务器状态...');

    try {
      const startTime = Date.now();
      execSync(
        `curl -f -s --connect-timeout 10 "${CONFIG.baseUrl}" > /dev/null`,
        { stdio: 'pipe' }
      );
      const responseTime = Date.now() - startTime;
      colorLog('green', `✅ 服务器运行正常 (响应时间: ${responseTime}ms)`);
    } catch (error) {
      colorLog('red', '❌ 服务器无响应或不可访问');
      colorLog('yellow', '💡 请确保开发服务器正在运行: pnpm dev');
      throw new Error('服务器不可访问');
    }
  }

  async runApiCurlTests() {
    colorLog('yellow', '🌐 运行API curl测试...');
    this.session.markTestStart(TEST_TYPES.API_CURL);

    try {
      const startTime = Date.now();
      const result = execSync('./tests/api-test-commands.sh', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: CONFIG.timeout,
      });

      this.session.markTestComplete(TEST_TYPES.API_CURL, true, result);
      colorLog('green', '✅ API curl测试完成');
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      this.session.markTestComplete(
        TEST_TYPES.API_CURL,
        false,
        errorOutput,
        error.message
      );
      colorLog('red', '❌ API curl测试失败');
    }
  }

  async runApiTypeScriptTests() {
    colorLog('yellow', '💻 运行API TypeScript测试...');
    this.session.markTestStart(TEST_TYPES.API_TYPESCRIPT);

    try {
      const startTime = Date.now();

      // 检查TypeScript编译
      try {
        execSync(
          'npx tsc tests/translator-tools-test-suite.ts --outDir ./test-dist --module commonjs --target es2020 --moduleResolution node --esModuleInterop true --allowSyntheticDefaultImports true --skipLibCheck true',
          { stdio: 'pipe' }
        );
      } catch (compileError) {
        // 编译失败，但仍然尝试运行
        colorLog('yellow', '⚠️ TypeScript编译警告，继续运行测试...');
      }

      // 运行测试
      const result = execSync('node tests/translator-tools-test-suite.js', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: CONFIG.timeout,
        env: {
          ...process.env,
          TEST_BASE_URL: CONFIG.baseUrl,
        },
      });

      this.session.markTestComplete(TEST_TYPES.API_TYPESCRIPT, true, result);
      colorLog('green', '✅ API TypeScript测试完成');
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      this.session.markTestComplete(
        TEST_TYPES.API_TYPESCRIPT,
        false,
        errorOutput,
        error.message
      );
      colorLog('red', '❌ API TypeScript测试失败');
    }
  }

  async runFrontendTests() {
    colorLog('yellow', '🖥️ 运行前端交互测试...');
    this.session.markTestStart(TEST_TYPES.FRONTEND);

    try {
      // 检查Puppeteer是否可用
      try {
        execSync('npm list puppeteer', { stdio: 'pipe' });
      } catch (error) {
        colorLog('yellow', '⚠️ Puppeteer未安装，跳过前端测试');
        colorLog('blue', '💡 安装命令: npm install puppeteer');
        this.session.markTestComplete(
          TEST_TYPES.FRONTEND,
          false,
          'Puppeteer not available',
          'Puppeteer not installed'
        );
        return;
      }

      const startTime = Date.now();
      const result = execSync('node tests/frontend-interaction-tests.js', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: CONFIG.timeout * 2, // 前端测试需要更长时间
        env: {
          ...process.env,
          TEST_BASE_URL: CONFIG.baseUrl,
          HEADLESS: process.env.HEADLESS || 'true',
        },
      });

      this.session.markTestComplete(TEST_TYPES.FRONTEND, true, result);
      colorLog('green', '✅ 前端交互测试完成');
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      this.session.markTestComplete(
        TEST_TYPES.FRONTEND,
        false,
        errorOutput,
        error.message
      );
      colorLog('red', '❌ 前端交互测试失败');
    }
  }

  async runPerformanceTests() {
    colorLog('yellow', '⚡ 运行性能测试...');
    this.session.markTestStart(TEST_TYPES.PERFORMANCE);

    try {
      const startTime = Date.now();

      // 运行专门的性能测试
      const result = execSync('./tests/api-test-commands.sh performance', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: CONFIG.timeout,
      });

      this.session.markTestComplete(TEST_TYPES.PERFORMANCE, true, result);
      colorLog('green', '✅ 性能测试完成');
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      this.session.markTestComplete(
        TEST_TYPES.PERFORMANCE,
        false,
        errorOutput,
        error.message
      );
      colorLog('red', '❌ 性能测试失败');
    }
  }

  async runIntegrationTests() {
    colorLog('yellow', '🔗 运行集成测试...');
    this.session.markTestStart(TEST_TYPES.INTEGRATION);

    try {
      // 简单的集成测试：检查几个关键API端点是否可以正常通信
      const endpoints = [
        '/api/creole-to-english-translator',
        '/api/chinese-to-english-translator',
        '/api/albanian-to-english',
        '/api/aramaic-translator',
        '/api/esperanto-translator',
      ];

      let allPassed = true;
      const results = [];

      for (const endpoint of endpoints) {
        try {
          const response = execSync(
            `curl -f -s -X POST -H "Content-Type: application/json" -d '{"text":"Hello"}' --connect-timeout 10 "${CONFIG.baseUrl}${endpoint}"`,
            {
              stdio: 'pipe',
              encoding: 'utf8',
            }
          );

          if (response.trim()) {
            results.push({
              endpoint,
              status: 'passed',
              response: response.substring(0, 100),
            });
          } else {
            results.push({
              endpoint,
              status: 'failed',
              error: 'Empty response',
            });
            allPassed = false;
          }
        } catch (error) {
          results.push({ endpoint, status: 'failed', error: error.message });
          allPassed = false;
        }
      }

      const output = JSON.stringify(results, null, 2);
      this.session.markTestComplete(TEST_TYPES.INTEGRATION, allPassed, output);

      if (allPassed) {
        colorLog('green', '✅ 集成测试完成');
      } else {
        colorLog('yellow', '⚠️ 集成测试部分失败');
      }
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      this.session.markTestComplete(
        TEST_TYPES.INTEGRATION,
        false,
        errorOutput,
        error.message
      );
      colorLog('red', '❌ 集成测试失败');
    }
  }

  async generateComprehensiveReport() {
    colorLog('cyan', '📊 生成综合测试报告...');

    const summary = this.session.getSummary();
    const report = {
      timestamp: new Date().toISOString(),
      config: {
        baseUrl: CONFIG.baseUrl,
        timeout: CONFIG.timeout,
        parallel: CONFIG.parallel,
      },
      summary: {
        totalDuration: summary.totalDuration,
        totalTests: summary.totalTests,
        passedTests: summary.passedTests,
        failedTests: summary.failedTests,
        successRate: summary.successRate,
        overallStatus: summary.overallStatus,
      },
      testResults: this.session.results,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(),
    };

    // 保存JSON报告
    const jsonReportPath = path.join(
      CONFIG.reportsDir,
      `comprehensive-test-report-${CONFIG.timestamp}.json`
    );
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    const htmlReportPath = path.join(
      CONFIG.reportsDir,
      `comprehensive-test-report-${CONFIG.timestamp}.html`
    );
    const htmlReport = this.generateHtmlReport(report);
    fs.writeFileSync(htmlReportPath, htmlReport);

    // 生成Markdown报告
    const mdReportPath = path.join(
      CONFIG.reportsDir,
      `comprehensive-test-report-${CONFIG.timestamp}.md`
    );
    const mdReport = this.generateMarkdownReport(report);
    fs.writeFileSync(mdReportPath, mdReport);

    colorLog('green', '✅ 综合报告生成完成:');
    colorLog('blue', `   📄 JSON: ${jsonReportPath}`);
    colorLog('blue', `   🌐 HTML: ${htmlReportPath}`);
    colorLog('blue', `   📝 Markdown: ${mdReportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    const results = this.session.results;

    // 基于测试结果生成建议
    if (results[TEST_TYPES.API_CURL].status === 'failed') {
      recommendations.push({
        type: 'error',
        category: 'API',
        message: 'API curl测试失败，请检查API端点是否正确实现',
        priority: 'high',
      });
    }

    if (results[TEST_TYPES.FRONTEND].status === 'failed') {
      recommendations.push({
        type: 'warning',
        category: 'Frontend',
        message: '前端测试失败，请检查UI组件和交互功能',
        priority: 'medium',
      });
    }

    if (results[TEST_TYPES.PERFORMANCE].status === 'failed') {
      recommendations.push({
        type: 'warning',
        category: 'Performance',
        message: '性能测试发现问题，请优化API响应时间',
        priority: 'medium',
      });
    }

    const failedCount = Object.values(results).filter(
      (r) => r.status === 'failed'
    ).length;
    if (failedCount === 0) {
      recommendations.push({
        type: 'success',
        category: 'Overall',
        message: '所有测试通过！系统运行良好',
        priority: 'low',
      });
    }

    return recommendations;
  }

  generateNextSteps() {
    const nextSteps = [];
    const results = this.session.results;

    if (results[TEST_TYPES.API_CURL].status === 'failed') {
      nextSteps.push('检查API路由实现');
      nextSteps.push('验证错误处理机制');
    }

    if (results[TEST_TYPES.FRONTEND].status === 'failed') {
      nextSteps.push('修复前端组件问题');
      nextSteps.push('优化用户交互体验');
    }

    if (results[TEST_TYPES.PERFORMANCE].status === 'failed') {
      nextSteps.push('优化数据库查询');
      nextSteps.push('实现API缓存');
    }

    if (nextSteps.length === 0) {
      nextSteps.push('系统准备就绪，可以部署到生产环境');
      nextSteps.push('考虑设置CI/CD自动化测试');
    }

    return nextSteps;
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能翻译工具测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .metric h3 { margin: 0; color: #495057; }
        .metric .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .test-result { margin-bottom: 20px; padding: 15px; border-radius: 6px; }
        .test-result.passed { background: #d4edda; border-left: 4px solid #28a745; }
        .test-result.failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .test-result.pending { background: #fff3cd; border-left: 4px solid #ffc107; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 6px; margin-top: 20px; }
        .next-steps { background: #f0f8f0; padding: 20px; border-radius: 6px; margin-top: 20px; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .status-passed { background: #28a745; color: white; }
        .status-failed { background: #dc3545; color: white; }
        .status-pending { background: #ffc107; color: black; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 智能翻译工具测试报告</h1>
            <p>生成时间: ${new Date(report.timestamp).toLocaleString()}</p>
            <p>测试目标: ${report.config.baseUrl}</p>
        </div>
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <h3>总测试数</h3>
                    <div class="value">${report.summary.totalTests}</div>
                </div>
                <div class="metric">
                    <h3>通过测试</h3>
                    <div class="value" style="color: #28a745;">${report.summary.passedTests}</div>
                </div>
                <div class="metric">
                    <h3>失败测试</h3>
                    <div class="value" style="color: #dc3545;">${report.summary.failedTests}</div>
                </div>
                <div class="metric">
                    <h3>成功率</h3>
                    <div class="value">${report.summary.successRate}%</div>
                </div>
                <div class="metric">
                    <h3>总耗时</h3>
                    <div class="value">${Math.round(report.summary.totalDuration / 1000)}s</div>
                </div>
            </div>

            <h2>📋 测试结果详情</h2>
            ${Object.entries(report.testResults)
              .map(
                ([type, result]) => `
                <div class="test-result ${result.status}">
                    <h3>${this.getTestTypeName(type)} <span class="status-badge status-${result.status}">${result.status}</span></h3>
                    <p>耗时: ${Math.round(result.duration / 1000)}秒</p>
                    ${result.error ? `<p style="color: #dc3545;">错误: ${result.error}</p>` : ''}
                </div>
            `
              )
              .join('')}

            ${
              report.recommendations.length > 0
                ? `
                <div class="recommendations">
                    <h2>💡 建议</h2>
                    ${report.recommendations
                      .map(
                        (rec) => `
                        <p><strong>${rec.category}:</strong> ${rec.message}</p>
                    `
                      )
                      .join('')}
                </div>
            `
                : ''
            }

            <div class="next-steps">
                <h2>🎯 后续行动</h2>
                <ul>
                    ${report.nextSteps.map((step) => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  generateMarkdownReport(report) {
    return `# 智能翻译工具测试报告

**生成时间**: ${new Date(report.timestamp).toLocaleString()}
**测试目标**: ${report.config.baseUrl}

## 📊 测试概览

| 指标 | 数值 |
|------|------|
| 总测试数 | ${report.summary.totalTests} |
| 通过测试 | ${report.summary.passedTests} |
| 失败测试 | ${report.summary.failedTests} |
| 成功率 | ${report.summary.successRate}% |
| 总耗时 | ${Math.round(report.summary.totalDuration / 1000)}秒 |
| 整体状态 | ${report.summary.overallStatus} |

## 📋 测试结果详情

${Object.entries(report.testResults)
  .map(
    ([type, result]) => `
### ${this.getTestTypeName(type)}

- **状态**: ${result.status}
- **耗时**: ${Math.round(result.duration / 1000)}秒
${result.error ? `- **错误**: ${result.error}` : ''}
`
  )
  .join('')}

## 💡 建议

${report.recommendations.map((rec) => `- **${rec.category}**: ${rec.message}`).join('\n')}

## 🎯 后续行动

${report.nextSteps.map((step) => `- ${step}`).join('\n')}

---
*报告生成于 ${new Date(report.timestamp).toISOString()}*`;
  }

  getTestTypeName(type) {
    const names = {
      [TEST_TYPES.API_CURL]: 'API Curl测试',
      [TEST_TYPES.API_TYPESCRIPT]: 'API TypeScript测试',
      [TEST_TYPES.FRONTEND]: '前端交互测试',
      [TEST_TYPES.PERFORMANCE]: '性能测试',
      [TEST_TYPES.INTEGRATION]: '集成测试',
    };
    return names[type] || type;
  }

  printFinalSummary() {
    const summary = this.session.getSummary();

    console.log('\n' + '='.repeat(60));
    colorLog('cyan', '🎉 测试套件执行完成！');
    console.log('');

    // 打印汇总统计
    colorLog('blue', '📊 测试汇总:');
    console.log(`   总测试数: ${summary.totalTests}`);
    console.log(
      `   通过测试: ${colorLog('green', summary.passedTests.toString())}`
    );
    console.log(
      `   失败测试: ${colorLog('red', summary.failedTests.toString())}`
    );
    console.log(
      `   成功率: ${summary.successRate >= 80 ? colorLog('green', `${summary.successRate}%`) : colorLog('yellow', `${summary.successRate}%`)}`
    );
    console.log(`   总耗时: ${Math.round(summary.totalDuration / 1000)}秒`);
    console.log(
      `   整体状态: ${summary.overallStatus === 'passed' ? colorLog('green', '✅ 通过') : summary.overallStatus === 'failed' ? colorLog('red', '❌ 失败') : colorLog('yellow', '⚠️ 未完成')}`
    );

    console.log('');

    // 打印失败的测试类型
    const failedTests = Object.entries(this.session.results).filter(
      ([_, result]) => result.status === 'failed'
    );
    if (failedTests.length > 0) {
      colorLog('yellow', '⚠️ 需要关注的测试:');
      failedTests.forEach(([type, result]) => {
        console.log(`   - ${this.getTestTypeName(type)}: ${result.error}`);
      });
      console.log('');
    }

    // 打印下一步行动
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      colorLog('blue', '💡 建议和下一步行动:');
      recommendations.forEach((rec) => {
        const icon =
          rec.type === 'error' ? '🚨' : rec.type === 'warning' ? '⚠️' : '✅';
        console.log(`   ${icon} ${rec.message}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }
}

// 主函数
async function main() {
  const runner = new TestRunner();

  // 处理命令行参数
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('智能翻译工具完整测试套件');
    console.log('');
    console.log('使用方法:');
    console.log('  node run-all-tests.js [选项]');
    console.log('');
    console.log('环境变量:');
    console.log('  TEST_BASE_URL - 测试基础URL (默认: http://localhost:3000)');
    console.log('  HEADLESS - 前端测试是否无头模式 (默认: true)');
    console.log('  PARALLEL_TESTS - 是否并行运行测试 (默认: true)');
    console.log('');
    console.log('示例:');
    console.log('  node run-all-tests.js');
    console.log(
      '  TEST_BASE_URL=https://staging.example.com node run-all-tests.js'
    );
    console.log('  HEADLESS=false node run-all-tests.js  # 显示浏览器界面');
    process.exit(0);
  }

  try {
    await runner.runAllTests();

    // 根据测试结果设置退出码
    const summary = runner.session.getSummary();
    process.exit(summary.overallStatus === 'passed' ? 0 : 1);
  } catch (error) {
    colorLog('red', `💥 测试运行器发生致命错误: ${error.message}`);
    process.exit(2);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { TestRunner, CONFIG, TEST_TYPES };
