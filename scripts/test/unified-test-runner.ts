#!/usr/bin/env tsx

/**
 * 统一测试运行器
 * 运行各种类型的测试并生成综合报告
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

interface TestResult {
  name: string;
  type:
    | 'unit'
    | 'integration'
    | 'e2e'
    | 'performance'
    | 'security'
    | 'lint'
    | 'build'
    | 'custom';
  status: 'passed' | 'failed' | 'skipped' | 'warning';
  duration: number;
  message?: string;
  details?: any;
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    warnings: number;
    duration: number;
  };
}

interface TestReport {
  timestamp: string;
  projectVersion: string;
  gitInfo: {
    branch: string;
    commit: string;
    commitMessage: string;
  };
  environment: {
    nodeVersion: string;
    pnpmVersion: string;
    platform: string;
  };
  suites: TestSuite[];
  overall: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
    totalWarnings: number;
    totalDuration: number;
    passRate: number;
  };
  recommendations: string[];
}

class UnifiedTestRunner {
  private projectRoot: string;
  private reportDir: string;
  private report: TestReport;

  constructor() {
    this.projectRoot = process.cwd();
    this.reportDir = join(this.projectRoot, 'test-reports');
    this.report = this.initializeReport();
  }

  private initializeReport(): TestReport {
    return {
      timestamp: new Date().toISOString(),
      projectVersion: this.getProjectVersion(),
      gitInfo: this.getGitInfo(),
      environment: this.getEnvironmentInfo(),
      suites: [],
      overall: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalWarnings: 0,
        totalDuration: 0,
        passRate: 0,
      },
      recommendations: [],
    };
  }

  private getProjectVersion(): string {
    try {
      const packageJson = readFileSync(
        join(this.projectRoot, 'package.json'),
        'utf8'
      );
      return JSON.parse(packageJson).version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getGitInfo() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim();
      const commit = execSync('git rev-parse HEAD', {
        encoding: 'utf8',
      }).trim();
      const commitMessage = execSync('git log -1 --pretty=%B', {
        encoding: 'utf8',
      }).trim();

      return { branch, commit, commitMessage };
    } catch {
      return { branch: 'unknown', commit: 'unknown', commitMessage: 'unknown' };
    }
  }

  private getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      pnpmVersion: this.getPnpmVersion(),
      platform: process.platform,
    };
  }

  private getPnpmVersion(): string {
    try {
      return execSync('pnpm --version', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  private async runUnitTests(): Promise<TestSuite> {
    console.log('🧪 运行单元测试...');
    const startTime = Date.now();

    const suite: TestSuite = {
      name: '单元测试',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0,
        duration: 0,
      },
    };

    try {
      // 查找测试文件
      const testFiles = globSync('**/*.test.{ts,tsx,js,jsx}', {
        cwd: this.projectRoot,
        ignore: ['node_modules/**', '.next/**', 'dist/**'],
      });

      if (testFiles.length === 0) {
        suite.tests.push({
          name: '单元测试发现',
          type: 'unit',
          status: 'skipped',
          duration: 0,
          message: '未找到单元测试文件',
        });
        suite.summary.total = 1;
        suite.summary.skipped = 1;
        return suite;
      }

      // 运行测试
      const output = execSync('pnpm test -- --coverage --reporter=json', {
        encoding: 'utf8',
        timeout: 300000,
      });

      try {
        const testResults = JSON.parse(output);

        if (testResults.testResults) {
          for (const testFile of testResults.testResults) {
            for (const assertion of testFile.assertionResults) {
              suite.tests.push({
                name: assertion.fullName || assertion.title,
                type: 'unit',
                status: assertion.status === 'passed' ? 'passed' : 'failed',
                duration: assertion.duration || 0,
                message: assertion.failureMessages?.join('; ') || undefined,
              });
            }
          }
        }
      } catch {
        // JSON解析失败，使用简单结果
        suite.tests.push({
          name: '单元测试执行',
          type: 'unit',
          status: 'passed',
          duration: Date.now() - startTime,
          message: '测试执行完成（详细解析失败）',
        });
      }

      // 尝试读取覆盖率报告
      const coverageReport = this.readCoverageReport();
      if (coverageReport && suite.tests.length > 0) {
        suite.tests[0].coverage = coverageReport;
      }
    } catch (error) {
      suite.tests.push({
        name: '单元测试执行',
        type: 'unit',
        status: 'failed',
        duration: Date.now() - startTime,
        message: error.message.includes('Command failed')
          ? '测试执行失败'
          : error.message,
      });
    }

    // 计算汇总
    suite.summary.total = suite.tests.length;
    suite.summary.passed = suite.tests.filter(
      (t) => t.status === 'passed'
    ).length;
    suite.summary.failed = suite.tests.filter(
      (t) => t.status === 'failed'
    ).length;
    suite.summary.skipped = suite.tests.filter(
      (t) => t.status === 'skipped'
    ).length;
    suite.summary.duration = Date.now() - startTime;

    return suite;
  }

  private readCoverageReport() {
    try {
      const coveragePath = join(
        this.projectRoot,
        'coverage',
        'coverage-summary.json'
      );
      if (!existsSync(coveragePath)) return null;

      const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
      return {
        lines: coverage.total?.lines?.pct || 0,
        functions: coverage.total?.functions?.pct || 0,
        branches: coverage.total?.branches?.pct || 0,
        statements: coverage.total?.statements?.pct || 0,
      };
    } catch {
      return null;
    }
  }

  private async runLintTests(): Promise<TestSuite> {
    console.log('🔍 运行代码检查...');
    const startTime = Date.now();

    const suite: TestSuite = {
      name: '代码检查',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0,
        duration: 0,
      },
    };

    try {
      const output = execSync('pnpm lint', {
        encoding: 'utf8',
        timeout: 120000,
      });

      suite.tests.push({
        name: 'Biome代码检查',
        type: 'lint',
        status: 'passed',
        duration: Date.now() - startTime,
        message: '代码格式和风格检查通过',
      });
    } catch (error) {
      const errorMessage = error.message || '';

      suite.tests.push({
        name: 'Biome代码检查',
        type: 'lint',
        status: 'failed',
        duration: Date.now() - startTime,
        message: '代码检查发现问题',
        details: {
          errorOutput: errorMessage,
        },
      });
    }

    // TypeScript类型检查
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe', timeout: 180000 });

      suite.tests.push({
        name: 'TypeScript类型检查',
        type: 'lint',
        status: 'passed',
        duration: 0,
        message: 'TypeScript类型检查通过',
      });
    } catch (error) {
      suite.tests.push({
        name: 'TypeScript类型检查',
        type: 'lint',
        status: 'failed',
        duration: 0,
        message: 'TypeScript类型检查失败',
        details: {
          typeErrors: error.message,
        },
      });
    }

    // 计算汇总
    suite.summary.total = suite.tests.length;
    suite.summary.passed = suite.tests.filter(
      (t) => t.status === 'passed'
    ).length;
    suite.summary.failed = suite.tests.filter(
      (t) => t.status === 'failed'
    ).length;
    suite.summary.duration = Date.now() - startTime;

    return suite;
  }

  private async runBuildTests(): Promise<TestSuite> {
    console.log('🏗️ 运行构建测试...');
    const startTime = Date.now();

    const suite: TestSuite = {
      name: '构建测试',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0,
        duration: 0,
      },
    };

    try {
      // 清理之前的构建
      execSync('rm -rf .next', { stdio: 'pipe' });

      // 执行构建
      const buildOutput = execSync('pnpm build', {
        encoding: 'utf8',
        timeout: 600000, // 10分钟超时
      });

      suite.tests.push({
        name: 'Next.js构建',
        type: 'build',
        status: 'passed',
        duration: Date.now() - startTime,
        message: '项目构建成功',
      });

      // 检查构建产物大小
      const bundleSizeTest = await this.checkBundleSize();
      suite.tests.push(bundleSizeTest);

      // 检查关键文件是否存在
      const criticalFilesTest = await this.checkCriticalFiles();
      suite.tests.push(criticalFilesTest);
    } catch (error) {
      suite.tests.push({
        name: 'Next.js构建',
        type: 'build',
        status: 'failed',
        duration: Date.now() - startTime,
        message: '构建失败',
        details: {
          buildErrors: error.message,
        },
      });
    }

    // 计算汇总
    suite.summary.total = suite.tests.length;
    suite.summary.passed = suite.tests.filter(
      (t) => t.status === 'passed'
    ).length;
    suite.summary.failed = suite.tests.filter(
      (t) => t.status === 'failed'
    ).length;
    suite.summary.duration = Date.now() - startTime;

    return suite;
  }

  private async checkBundleSize(): Promise<TestResult> {
    try {
      const nextDir = join(this.projectRoot, '.next');
      if (!existsSync(nextDir)) {
        return {
          name: '构建产物大小检查',
          type: 'build',
          status: 'failed',
          duration: 0,
          message: '构建产物不存在',
        };
      }

      // 检查.total.js文件大小
      const staticFiles = globSync('.next/static/**/*.js', {
        cwd: this.projectRoot,
      });
      let totalSize = 0;

      for (const file of staticFiles) {
        const stats = require('fs').statSync(join(this.projectRoot, file));
        totalSize += stats.size;
      }

      const currentSizeMB = totalSize / (1024 * 1024);
      const maxSizeMB = 25; // Cloudflare Worker限制

      const status = currentSizeMB > maxSizeMB ? 'failed' : 'passed';
      const message =
        status === 'passed'
          ? `打包大小正常: ${currentSizeMB.toFixed(2)}MB`
          : `打包大小超限: ${currentSizeMB.toFixed(2)}MB (限制: ${maxSizeMB}MB)`;

      return {
        name: '构建产物大小检查',
        type: 'build',
        status,
        duration: 0,
        message,
        details: {
          currentSizeMB: currentSizeMB.toFixed(2),
          maxSizeMB,
          staticFilesCount: staticFiles.length,
        },
      };
    } catch (error) {
      return {
        name: '构建产物大小检查',
        type: 'build',
        status: 'failed',
        duration: 0,
        message: '无法检查打包大小',
        details: { error: error.message },
      };
    }
  }

  private async checkCriticalFiles(): Promise<TestResult> {
    const criticalFiles = [
      '.next/server/pages/_document.js',
      '.next/server/pages/_app.js',
    ];

    const missingFiles: string[] = [];

    for (const file of criticalFiles) {
      if (!existsSync(join(this.projectRoot, file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      return {
        name: '关键构建文件检查',
        type: 'build',
        status: 'warning',
        duration: 0,
        message: '部分关键构建文件缺失',
        details: { missingFiles },
      };
    }

    return {
      name: '关键构建文件检查',
      type: 'build',
      status: 'passed',
      duration: 0,
      message: '关键构建文件完整',
    };
  }

  private async runAPITests(): Promise<TestSuite> {
    console.log('🌐 运行API测试...');
    const startTime = Date.now();

    const suite: TestSuite = {
      name: 'API测试',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0,
        duration: 0,
      },
    };

    try {
      // 查找API测试脚本
      const apiTestScripts = globSync('scripts/test/*api*.ts', {
        cwd: this.projectRoot,
      });

      if (apiTestScripts.length === 0) {
        suite.tests.push({
          name: 'API测试发现',
          type: 'integration',
          status: 'skipped',
          duration: 0,
          message: '未找到API测试脚本',
        });
      } else {
        for (const script of apiTestScripts) {
          try {
            execSync(`pnpm tsx ${script}`, { stdio: 'pipe', timeout: 30000 });
            suite.tests.push({
              name: `API测试: ${script.split('/').pop()}`,
              type: 'integration',
              status: 'passed',
              duration: 0,
              message: 'API测试通过',
            });
          } catch (error) {
            suite.tests.push({
              name: `API测试: ${script.split('/').pop()}`,
              type: 'integration',
              status: 'failed',
              duration: 0,
              message: 'API测试失败',
              details: { error: error.message },
            });
          }
        }
      }
    } catch (error) {
      suite.tests.push({
        name: 'API测试执行',
        type: 'integration',
        status: 'failed',
        duration: Date.now() - startTime,
        message: 'API测试执行失败',
        details: { error: error.message },
      });
    }

    // 计算汇总
    suite.summary.total = suite.tests.length;
    suite.summary.passed = suite.tests.filter(
      (t) => t.status === 'passed'
    ).length;
    suite.summary.failed = suite.tests.filter(
      (t) => t.status === 'failed'
    ).length;
    suite.summary.skipped = suite.tests.filter(
      (t) => t.status === 'skipped'
    ).length;
    suite.summary.duration = Date.now() - startTime;

    return suite;
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];

    // 基于测试结果生成建议
    for (const suite of this.report.suites) {
      if (suite.summary.failed > 0) {
        switch (suite.name) {
          case '单元测试':
            recommendations.push('检查失败的单元测试用例，修复代码逻辑错误');
            break;
          case '代码检查':
            recommendations.push('修复代码格式和TypeScript类型错误');
            break;
          case '构建测试':
            recommendations.push('解决构建错误，检查依赖和配置');
            break;
          case 'API测试':
            recommendations.push('检查API端点和服务连接');
            break;
        }
      }
    }

    if (this.report.overall.passRate < 80) {
      recommendations.push('整体测试通过率较低，建议进行全面的代码审查');
    }

    // 检查覆盖率
    const unitTestSuite = this.report.suites.find((s) => s.name === '单元测试');
    if (unitTestSuite && unitTestSuite.tests[0]?.coverage) {
      const coverage = unitTestSuite.tests[0].coverage;
      if (coverage.lines < 70) {
        recommendations.push('代码覆盖率偏低，建议增加更多测试用例');
      }
    }

    this.report.recommendations = recommendations;
  }

  private calculateOverallStats(): void {
    const total = this.report.suites.reduce(
      (sum, suite) => sum + suite.summary.total,
      0
    );
    const passed = this.report.suites.reduce(
      (sum, suite) => sum + suite.summary.passed,
      0
    );
    const failed = this.report.suites.reduce(
      (sum, suite) => sum + suite.summary.failed,
      0
    );
    const skipped = this.report.suites.reduce(
      (sum, suite) => sum + suite.summary.skipped,
      0
    );
    const warnings = this.report.suites.reduce(
      (sum, suite) => sum + suite.summary.warnings,
      0
    );
    const duration = this.report.suites.reduce(
      (sum, suite) => sum + suite.summary.duration,
      0
    );

    this.report.overall = {
      totalTests: total,
      totalPassed: passed,
      totalFailed: failed,
      totalSkipped: skipped,
      totalWarnings: warnings,
      totalDuration: duration,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    };
  }

  private async saveReport(): Promise<void> {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 保存JSON报告
    const jsonReportPath = join(
      this.reportDir,
      `test-report-${timestamp}.json`
    );
    writeFileSync(jsonReportPath, JSON.stringify(this.report, null, 2));

    // 保存最新报告
    const latestReportPath = join(this.reportDir, 'latest-test-report.json');
    writeFileSync(latestReportPath, JSON.stringify(this.report, null, 2));

    // 生成Markdown报告
    await this.generateMarkdownReport(timestamp);

    console.log(`\n📊 测试报告已保存:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${this.reportDir}/test-report-${timestamp}.md`);
  }

  private async generateMarkdownReport(timestamp: string): Promise<void> {
    const markdownPath = join(this.reportDir, `test-report-${timestamp}.md`);

    let markdown = `# 测试报告\n\n`;
    markdown += `**生成时间**: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}\n`;
    markdown += `**项目版本**: ${this.report.projectVersion}\n`;
    markdown += `**Git分支**: ${this.report.gitInfo.branch}\n`;
    markdown += `**Git提交**: ${this.report.gitInfo.commit.substring(0, 7)}\n\n`;

    markdown += `## 环境信息\n\n`;
    markdown += `- Node.js: ${this.report.environment.nodeVersion}\n`;
    markdown += `- PNPM: ${this.report.environment.pnpmVersion}\n`;
    markdown += `- 平台: ${this.report.environment.platform}\n\n`;

    markdown += `## 测试概览\n\n`;
    markdown += `- 总测试数: ${this.report.overall.totalTests}\n`;
    markdown += `- ✅ 通过: ${this.report.overall.totalPassed}\n`;
    markdown += `- ❌ 失败: ${this.report.overall.totalFailed}\n`;
    markdown += `- ⏭️ 跳过: ${this.report.overall.totalSkipped}\n`;
    markdown += `- ⚠️ 警告: ${this.report.overall.totalWarnings}\n`;
    markdown += `- 通过率: ${this.report.overall.passRate}%\n`;
    markdown += `- 总耗时: ${this.report.overall.totalDuration}ms\n\n`;

    markdown += `## 测试套件详情\n\n`;

    for (const suite of this.report.suites) {
      markdown += `### ${suite.name}\n\n`;
      markdown += `- 总数: ${suite.summary.total}\n`;
      markdown += `- 通过: ${suite.summary.passed}\n`;
      markdown += `- 失败: ${suite.summary.failed}\n`;
      markdown += `- 跳过: ${suite.summary.skipped}\n`;
      markdown += `- 警告: ${suite.summary.warnings}\n`;
      markdown += `- 耗时: ${suite.summary.duration}ms\n\n`;

      if (suite.tests.length > 0) {
        markdown += `#### 测试结果\n\n`;

        for (const test of suite.tests) {
          const status =
            test.status === 'passed'
              ? '✅'
              : test.status === 'failed'
                ? '❌'
                : test.status === 'skipped'
                  ? '⏭️'
                  : '⚠️';

          markdown += `${status} **${test.name}** (${test.duration}ms)\n`;
          if (test.message) {
            markdown += `- ${test.message}\n`;
          }
          markdown += '\n';
        }
      }
    }

    if (this.report.recommendations.length > 0) {
      markdown += `## 建议\n\n`;
      for (const recommendation of this.report.recommendations) {
        markdown += `- ${recommendation}\n`;
      }
      markdown += '\n';
    }

    writeFileSync(markdownPath, markdown);
  }

  public async runAllTests(): Promise<TestReport> {
    console.log('🚀 开始统一测试运行...\n');

    // 运行各类测试
    const unitTests = await this.runUnitTests();
    this.report.suites.push(unitTests);

    const lintTests = await this.runLintTests();
    this.report.suites.push(lintTests);

    const buildTests = await this.runBuildTests();
    this.report.suites.push(buildTests);

    const apiTests = await this.runAPITests();
    this.report.suites.push(apiTests);

    // 计算总体统计
    this.calculateOverallStats();

    // 生成建议
    this.generateRecommendations();

    // 保存报告
    await this.saveReport();

    // 输出结果摘要
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试完成摘要:');
    console.log(`   总测试数: ${this.report.overall.totalTests}`);
    console.log(`   ✅ 通过: ${this.report.overall.totalPassed}`);
    console.log(`   ❌ 失败: ${this.report.overall.totalFailed}`);
    console.log(`   ⏭️ 跳过: ${this.report.overall.totalSkipped}`);
    console.log(`   ⚠️ 警告: ${this.report.overall.totalWarnings}`);
    console.log(`   通过率: ${this.report.overall.passRate}%`);
    console.log(
      `   总耗时: ${(this.report.overall.totalDuration / 1000).toFixed(2)}s`
    );

    if (this.report.recommendations.length > 0) {
      console.log('\n💡 建议:');
      this.report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    return this.report;
  }
}

// 主执行函数
async function main() {
  try {
    const runner = new UnifiedTestRunner();
    const report = await runner.runAllTests();

    // 如果有失败的测试，返回非零退出码
    if (report.overall.totalFailed > 0) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { UnifiedTestRunner, type TestReport, type TestSuite };
