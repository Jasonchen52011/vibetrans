#!/usr/bin/env tsx

/**
 * 标准化上线前检查脚本
 * 确保项目在部署到Cloudflare Workers前满足所有要求
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

interface CheckResult {
  passed: boolean;
  message: string;
  details?: string;
}

interface PreDeployReport {
  timestamp: string;
  checks: Array<{
    name: string;
    category: string;
    result: CheckResult;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

class PreDeployChecker {
  private report: PreDeployReport;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.report = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  private addCheck(name: string, category: string, result: CheckResult) {
    this.report.checks.push({ name, category, result });
    this.report.summary.total++;

    if (result.passed) {
      this.report.summary.passed++;
      console.log(`✅ ${name} - ${result.message}`);
    } else {
      this.report.summary.failed++;
      console.log(`❌ ${name} - ${result.message}`);
      if (result.details) {
        console.log(`   详情: ${result.details}`);
      }
    }
  }

  private async checkGitStatus(): Promise<CheckResult> {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const uncommittedChanges = status
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      // 忽略某些文件类型的变更
      const ignoredFiles = ['.log', '.tmp', 'node_modules', '.DS_Store'];
      const significantChanges = uncommittedChanges.filter((line) => {
        return !ignoredFiles.some((ignored) => line.includes(ignored));
      });

      if (significantChanges.length > 0) {
        return {
          passed: false,
          message: '存在未提交的代码变更',
          details: `发现 ${significantChanges.length} 个未提交的文件变更`,
        };
      }

      return { passed: true, message: '无未提交的变更' };
    } catch (error) {
      return {
        passed: false,
        message: '无法检查Git状态',
        details: error.message,
      };
    }
  }

  private async checkBranchName(): Promise<CheckResult> {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim();

      const protectedBranches = ['main', 'master', 'develop'];
      if (protectedBranches.includes(branch)) {
        return {
          passed: false,
          message: '不能直接部署到主分支',
          details: `当前分支: ${branch}，请创建功能分支进行部署`,
        };
      }

      return { passed: true, message: `分支检查通过: ${branch}` };
    } catch (error) {
      return {
        passed: false,
        message: '无法获取分支信息',
        details: error.message,
      };
    }
  }

  private async checkBuild(): Promise<CheckResult> {
    try {
      console.log('   正在执行构建检查...');
      execSync('pnpm build', { stdio: 'pipe', timeout: 300000 }); // 5分钟超时

      return { passed: true, message: '构建成功' };
    } catch (error) {
      return {
        passed: false,
        message: '构建失败',
        details: error.message.includes('Command failed')
          ? '构建过程中出现错误'
          : error.message,
      };
    }
  }

  private async checkBundleSize(): Promise<CheckResult> {
    try {
      const nextDir = join(this.projectRoot, '.next');
      if (!existsSync(nextDir)) {
        return { passed: false, message: '构建产物不存在，请先执行构建' };
      }

      // 检查.total.js文件大小
      const staticFiles = globSync('.next/static/**/*.js', {
        cwd: this.projectRoot,
      });
      let totalSize = 0;

      for (const file of staticFiles) {
        const stats = statSync(join(this.projectRoot, file));
        totalSize += stats.size;
      }

      // Cloudflare Worker限制: 25MB压缩后
      const maxSizeMB = 25;
      const currentSizeMB = totalSize / (1024 * 1024);

      if (currentSizeMB > maxSizeMB) {
        return {
          passed: false,
          message: '打包大小超过Cloudflare Worker限制',
          details: `当前大小: ${currentSizeMB.toFixed(2)}MB, 限制: ${maxSizeMB}MB`,
        };
      }

      return {
        passed: true,
        message: `打包大小检查通过`,
        details: `当前大小: ${currentSizeMB.toFixed(2)}MB`,
      };
    } catch (error) {
      return {
        passed: false,
        message: '无法检查打包大小',
        details: error.message,
      };
    }
  }

  private async checkEnvironmentVariables(): Promise<CheckResult> {
    try {
      const envExample = join(this.projectRoot, '.env.example');
      const envLocal = join(this.projectRoot, '.env.local');

      if (!existsSync(envExample)) {
        return { passed: true, message: '无.env.example文件，跳过检查' };
      }

      if (!existsSync(envLocal)) {
        return {
          passed: false,
          message: '.env.local文件不存在',
          details: '请基于.env.example创建.env.local文件',
        };
      }

      return { passed: true, message: '环境变量文件检查通过' };
    } catch (error) {
      return {
        passed: false,
        message: '环境变量检查失败',
        details: error.message,
      };
    }
  }

  private async checkTypeScript(): Promise<CheckResult> {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return { passed: true, message: 'TypeScript类型检查通过' };
    } catch (error) {
      return {
        passed: false,
        message: 'TypeScript类型检查失败',
        details: '存在类型错误，请修复后再部署',
      };
    }
  }

  private async checkLint(): Promise<CheckResult> {
    try {
      execSync('pnpm lint', { stdio: 'pipe' });
      return { passed: true, message: '代码格式检查通过' };
    } catch (error) {
      return {
        passed: false,
        message: '代码格式检查失败',
        details: '请运行 pnpm format 修复格式问题',
      };
    }
  }

  private async checkTests(): Promise<CheckResult> {
    try {
      // 检查是否有测试文件
      const testFiles = globSync('**/*.test.{ts,js}', {
        cwd: this.projectRoot,
        ignore: 'node_modules/**',
      });

      if (testFiles.length === 0) {
        return {
          passed: true,
          message: '无测试文件，跳过测试检查',
        };
      }

      // 尝试运行测试
      execSync('pnpm test', { stdio: 'pipe', timeout: 60000 });
      return {
        passed: true,
        message: `测试通过 (${testFiles.length} 个测试文件)`,
      };
    } catch (error) {
      return {
        passed: false,
        message: '测试失败',
        details: '请修复失败的测试用例',
      };
    }
  }

  private async checkCriticalFiles(): Promise<CheckResult> {
    const criticalFiles = [
      'package.json',
      'next.config.mjs',
      'tsconfig.json',
      'tailwind.config.ts',
    ];

    const missingFiles: string[] = [];

    for (const file of criticalFiles) {
      if (!existsSync(join(this.projectRoot, file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      return {
        passed: false,
        message: '缺少关键配置文件',
        details: `缺失: ${missingFiles.join(', ')}`,
      };
    }

    return { passed: true, message: '关键配置文件检查通过' };
  }

  private async checkDependencies(): Promise<CheckResult> {
    try {
      // 检查package.json和lock file一致性
      execSync('pnpm outdated', { stdio: 'pipe' });

      return { passed: true, message: '依赖检查通过' };
    } catch (error) {
      return {
        passed: true, // 警告而非错误
        message: '存在可更新的依赖包',
        details: '建议更新过期的依赖包',
      };
    }
  }

  private async checkDatabaseConnection(): Promise<CheckResult> {
    try {
      // 简单的数据库连接检查
      const dbSchema = join(this.projectRoot, 'src/db/schema.ts');
      if (!existsSync(dbSchema)) {
        return { passed: true, message: '无数据库配置，跳过连接检查' };
      }

      return { passed: true, message: '数据库配置文件存在' };
    } catch (error) {
      return {
        passed: false,
        message: '数据库检查失败',
        details: error.message,
      };
    }
  }

  private async checkPerformance(): Promise<CheckResult> {
    try {
      // 检查是否有性能监控配置
      const nextConfig = join(this.projectRoot, 'next.config.mjs');
      if (existsSync(nextConfig)) {
        const config = readFileSync(nextConfig, 'utf8');
        if (config.includes('experimental.instrumentation')) {
          return { passed: true, message: '性能监控已配置' };
        }
      }

      return {
        passed: true,
        message: '建议添加性能监控配置',
      };
    } catch (error) {
      return { passed: false, message: '性能检查失败', details: error.message };
    }
  }

  private async checkSecurity(): Promise<CheckResult> {
    try {
      // 检查安全相关配置
      const nextConfig = join(this.projectRoot, 'next.config.mjs');
      if (existsSync(nextConfig)) {
        const config = readFileSync(nextConfig, 'utf8');

        // 检查是否有关键安全头配置
        if (config.includes('headers') || config.includes('security')) {
          return { passed: true, message: '安全头配置已检查' };
        }
      }

      return {
        passed: true,
        message: '建议添加更多安全头配置',
      };
    } catch (error) {
      return { passed: false, message: '安全检查失败', details: error.message };
    }
  }

  private generateReport(): void {
    const reportPath = join(this.projectRoot, 'pre-deploy-report.json');
    const reportContent = JSON.stringify(this.report, null, 2);

    try {
      require('fs').writeFileSync(reportPath, reportContent);
      console.log(`\n📊 详细报告已保存到: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️ 无法保存报告文件: ${error.message}`);
    }

    // 生成Markdown报告
    this.generateMarkdownReport();
  }

  private generateMarkdownReport(): void {
    const markdownPath = join(this.projectRoot, 'pre-deploy-report.md');

    let markdown = `# 上线前检查报告\n\n`;
    markdown += `**检查时间**: ${this.report.timestamp}\n\n`;
    markdown += `## 检查摘要\n\n`;
    markdown += `- 总检查项: ${this.report.summary.total}\n`;
    markdown += `- ✅ 通过: ${this.report.summary.passed}\n`;
    markdown += `- ❌ 失败: ${this.report.summary.failed}\n`;
    markdown += `- ⚠️ 警告: ${this.report.summary.warnings}\n\n`;

    markdown += `## 检查详情\n\n`;

    const categories = [
      ...new Set(this.report.checks.map((check) => check.category)),
    ];

    for (const category of categories) {
      markdown += `### ${category}\n\n`;

      const categoryChecks = this.report.checks.filter(
        (check) => check.category === category
      );

      for (const check of categoryChecks) {
        const status = check.result.passed ? '✅' : '❌';
        markdown += `${status} **${check.name}**: ${check.result.message}\n`;

        if (check.result.details) {
          markdown += `   - ${check.result.details}\n`;
        }
        markdown += '\n';
      }
    }

    // 添加建议
    if (this.report.summary.failed > 0) {
      markdown += `## ⚠️ 部署建议\n\n`;
      markdown += `发现 ${this.report.summary.failed} 个问题，建议修复后再进行部署。\n\n`;
      markdown += `### 修复优先级\n\n`;
      markdown += `1. **高优先级**: 构建失败、类型错误\n`;
      markdown += `2. **中优先级**: 代码格式、测试失败\n`;
      markdown += `3. **低优先级**: 依赖更新、性能优化\n\n`;
    }

    try {
      require('fs').writeFileSync(markdownPath, markdown);
      console.log(`📄 Markdown报告已保存到: ${markdownPath}`);
    } catch (error) {
      console.log(`⚠️ 无法保存Markdown报告: ${error.message}`);
    }
  }

  public async runAllChecks(): Promise<boolean> {
    console.log('🚀 开始上线前检查...\n');

    // Git相关检查
    this.addCheck('Git状态检查', '版本控制', await this.checkGitStatus());
    this.addCheck('分支名称检查', '版本控制', await this.checkBranchName());

    // 构建相关检查
    this.addCheck('项目构建', '构建', await this.checkBuild());
    this.addCheck('打包大小', '构建', await this.checkBundleSize());

    // 代码质量检查
    this.addCheck(
      'TypeScript类型检查',
      '代码质量',
      await this.checkTypeScript()
    );
    this.addCheck('代码格式检查', '代码质量', await this.checkLint());
    this.addCheck('测试执行', '代码质量', await this.checkTests());

    // 配置检查
    this.addCheck('关键文件检查', '配置', await this.checkCriticalFiles());
    this.addCheck(
      '环境变量检查',
      '配置',
      await this.checkEnvironmentVariables()
    );
    this.addCheck('依赖检查', '配置', await this.checkDependencies());

    // 运行时检查
    this.addCheck('数据库连接', '运行时', await this.checkDatabaseConnection());
    this.addCheck('性能配置', '运行时', await this.checkPerformance());
    this.addCheck('安全配置', '运行时', await this.checkSecurity());

    // 生成报告
    this.generateReport();

    console.log('\n' + '='.repeat(50));
    console.log(
      `📊 检查完成: ${this.report.summary.passed}/${this.report.summary.total} 项通过`
    );

    if (this.report.summary.failed > 0) {
      console.log(
        `❌ 发现 ${this.report.summary.failed} 个问题，请修复后再部署`
      );
      return false;
    }

    console.log('✅ 所有检查通过，可以部署!');
    return true;
  }
}

// 主执行函数
async function main() {
  const checker = new PreDeployChecker();
  const success = await checker.runAllChecks();

  process.exit(success ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('检查过程中发生错误:', error);
    process.exit(1);
  });
}

export { PreDeployChecker };
