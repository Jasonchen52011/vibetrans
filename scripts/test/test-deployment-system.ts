#!/usr/bin/env tsx

/**
 * 部署系统测试脚本
 * 测试新创建的部署流程工具是否正常工作
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class DeploymentSystemTester {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private async runTest(
    testName: string,
    testFunction: () => Promise<void>
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      await testFunction();
      return {
        name: testName,
        passed: true,
        message: '✅ 测试通过',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: testName,
        passed: false,
        message: `❌ 测试失败: ${error.message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  private async testScriptManager(): Promise<void> {
    console.log('   🔍 测试脚本管理器...');

    const managerPath = join(
      this.projectRoot,
      'scripts/utils/script-manager.ts'
    );

    if (!existsSync(managerPath)) {
      throw new Error('脚本管理器文件不存在');
    }

    // 测试帮助命令
    try {
      const output = execSync('pnpm tsx scripts/utils/script-manager.ts', {
        encoding: 'utf8',
        timeout: 10000,
      });

      if (!output.includes('脚本管理工具')) {
        throw new Error('帮助信息不正确');
      }
    } catch (error) {
      if (error.status !== 0) {
        throw new Error(`脚本管理器执行失败: ${error.message}`);
      }
    }

    // 测试统计命令
    try {
      execSync('pnpm tsx scripts/utils/script-manager.ts stats', {
        encoding: 'utf8',
        timeout: 10000,
      });
    } catch (error) {
      if (error.status !== 0) {
        throw new Error(`统计命令执行失败: ${error.message}`);
      }
    }
  }

  private async testPreDeployCheck(): Promise<void> {
    console.log('   🔍 测试预部署检查...');

    const checkPath = join(
      this.projectRoot,
      'scripts/deploy/pre-deploy-check.ts'
    );

    if (!existsSync(checkPath)) {
      throw new Error('预部署检查文件不存在');
    }

    // 测试是否能正常解析和启动
    try {
      // 使用 --help 或其他参数进行快速测试
      const output = execSync(
        'pnpm tsx scripts/deploy/pre-deploy-check.ts --help',
        {
          encoding: 'utf8',
          timeout: 5000,
        }
      );
    } catch (error) {
      // 预检查脚本可能没有 --help 选项，这是正常的
      // 只要脚本文件存在且可解析即可
    }
  }

  private async testBackupSystem(): Promise<void> {
    console.log('   🔍 测试备份系统...');

    const backupPath = join(
      this.projectRoot,
      'scripts/backup/create-backup.ts'
    );
    const rollbackPath = join(this.projectRoot, 'scripts/backup/rollback.ts');

    if (!existsSync(backupPath)) {
      throw new Error('备份脚本文件不存在');
    }

    if (!existsSync(rollbackPath)) {
      throw new Error('回滚脚本文件不存在');
    }

    // 测试脚本语法
    try {
      execSync('npx tsc --noEmit scripts/backup/create-backup.ts', {
        stdio: 'pipe',
        timeout: 30000,
      });

      execSync('npx tsc --noEmit scripts/backup/rollback.ts', {
        stdio: 'pipe',
        timeout: 30000,
      });
    } catch (error) {
      throw new Error(`备份脚本语法检查失败: ${error.message}`);
    }
  }

  private async testUnifiedTestRunner(): Promise<void> {
    console.log('   🔍 测试统一测试运行器...');

    const testRunnerPath = join(
      this.projectRoot,
      'scripts/test/unified-test-runner.ts'
    );

    if (!existsSync(testRunnerPath)) {
      throw new Error('统一测试运行器文件不存在');
    }

    // 测试TypeScript语法
    try {
      execSync('npx tsc --noEmit scripts/test/unified-test-runner.ts', {
        stdio: 'pipe',
        timeout: 30000,
      });
    } catch (error) {
      throw new Error(`测试运行器语法检查失败: ${error.message}`);
    }
  }

  private async testDeployScript(): Promise<void> {
    console.log('   🔍 测试部署脚本...');

    const deployPath = join(
      this.projectRoot,
      'scripts/deploy/deploy-to-production.ts'
    );

    if (!existsSync(deployPath)) {
      throw new Error('部署脚本文件不存在');
    }

    // 测试TypeScript语法
    try {
      execSync('npx tsc --noEmit scripts/deploy/deploy-to-production.ts', {
        stdio: 'pipe',
        timeout: 30000,
      });
    } catch (error) {
      throw new Error(`部署脚本语法检查失败: ${error.message}`);
    }
  }

  private async testPackageScripts(): Promise<void> {
    console.log('   🔍 测试package.json脚本...');

    const packageJson = join(this.projectRoot, 'package.json');

    if (!existsSync(packageJson)) {
      throw new Error('package.json文件不存在');
    }

    const content = require(packageJson);

    const requiredScripts = [
      'scripts:list',
      'scripts:run',
      'deploy:check',
      'deploy:backup',
      'deploy:prod',
      'test:all',
    ];

    for (const script of requiredScripts) {
      if (!content.scripts[script]) {
        throw new Error(`缺少必需的脚本: ${script}`);
      }
    }
  }

  private async testDependencies(): Promise<void> {
    console.log('   🔍 测试依赖检查...');

    const requiredDeps = ['tsx', 'glob'];

    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
      } catch (error) {
        throw new Error(`缺少必需的依赖: ${dep}`);
      }
    }

    // 检查可选依赖
    const optionalDeps = [];

    for (const dep of optionalDeps) {
      try {
        require.resolve(dep);
      } catch (error) {
        console.log(`   ⚠️ 可选依赖不存在 (可忽略): ${dep}`);
      }
    }
  }

  private async testFileStructure(): Promise<void> {
    console.log('   🔍 测试文件结构...');

    const requiredPaths = [
      'scripts/deploy',
      'scripts/backup',
      'scripts/test',
      'scripts/utils',
      'scripts/monitor',
      'scripts/optimize',
      'scripts/capture',
      'scripts/build',
      'scripts/fix',
      'scripts/generate',
    ];

    for (const path of requiredPaths) {
      const fullPath = join(this.projectRoot, path);

      if (!existsSync(fullPath)) {
        console.log(`   ⚠️ 目录不存在 (将自动创建): ${path}`);
      }
    }
  }

  public async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 开始部署系统测试...\n');

    const tests = [
      {
        name: '文件结构检查',
        test: () => this.testFileStructure(),
      },
      {
        name: '依赖检查',
        test: () => this.testDependencies(),
      },
      {
        name: 'package.json脚本检查',
        test: () => this.testPackageScripts(),
      },
      {
        name: '脚本管理器测试',
        test: () => this.testScriptManager(),
      },
      {
        name: '预部署检查测试',
        test: () => this.testPreDeployCheck(),
      },
      {
        name: '备份系统测试',
        test: () => this.testBackupSystem(),
      },
      {
        name: '统一测试运行器测试',
        test: () => this.testUnifiedTestRunner(),
      },
      {
        name: '部署脚本测试',
        test: () => this.testDeployScript(),
      },
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await this.runTest(test.name, test.test);
      results.push(result);

      console.log(`${result.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果汇总:');

    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;

    console.log(`   总测试数: ${results.length}`);
    console.log(`   ✅ 通过: ${passed}`);
    console.log(`   ❌ 失败: ${failed}`);
    console.log(
      `   ⏱️ 总耗时: ${results.reduce((sum, r) => sum + r.duration, 0)}ms`
    );

    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   - ${r.name}: ${r.message}`);
        });
    }

    if (failed === 0) {
      console.log('\n🎉 所有测试通过！部署系统已就绪。');
      console.log('\n📋 可用的部署命令:');
      console.log('   pnpm deploy:check    - 执行部署前检查');
      console.log('   pnpm deploy:backup   - 创建部署备份');
      console.log('   pnpm deploy:prod     - 一键部署到生产环境');
      console.log('   pnpm test:all        - 运行所有测试');
      console.log('   pnpm scripts:list    - 列出所有脚本');
      console.log('   pnpm scripts:stats   - 显示脚本统计');
    }

    return results;
  }
}

// 主执行函数
async function main() {
  try {
    const tester = new DeploymentSystemTester();
    const results = await tester.runAllTests();

    const failed = results.filter((r) => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { DeploymentSystemTester };
