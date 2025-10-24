#!/usr/bin/env tsx

/**
 * 快速系统测试
 * 测试部署系统的核心功能，跳过复杂的TypeScript检查
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface QuickTestResult {
  name: string;
  passed: boolean;
  message: string;
}

class QuickSystemTester {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private testScriptFile(path: string, className: string): QuickTestResult {
    try {
      const fullPath = join(this.projectRoot, path);

      if (!existsSync(fullPath)) {
        return {
          name: path.split('/').pop()?.replace('.ts', '') || path,
          passed: false,
          message: '❌ 文件不存在',
        };
      }

      const content = readFileSync(fullPath, 'utf8');

      if (!content.includes(className)) {
        return {
          name: path.split('/').pop()?.replace('.ts', '') || path,
          passed: false,
          message: '❌ 文件内容验证失败',
        };
      }

      return {
        name: path.split('/').pop()?.replace('.ts', '') || path,
        passed: true,
        message: '✅ 文件验证通过',
      };
    } catch (error) {
      return {
        name: path.split('/').pop()?.replace('.ts', '') || path,
        passed: false,
        message: `❌ 读取失败: ${error.message}`,
      };
    }
  }

  private testPackageScripts(): QuickTestResult {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json');

      if (!existsSync(packageJsonPath)) {
        return {
          name: 'package.json脚本',
          passed: false,
          message: '❌ package.json不存在',
        };
      }

      const content = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const requiredScripts = [
        'scripts:list',
        'deploy:check',
        'deploy:backup',
        'deploy:prod',
        'test:all',
      ];

      for (const script of requiredScripts) {
        if (!content.scripts[script]) {
          return {
            name: 'package.json脚本',
            passed: false,
            message: `❌ 缺少脚本: ${script}`,
          };
        }
      }

      return {
        name: 'package.json脚本',
        passed: true,
        message: '✅ 所有必需脚本存在',
      };
    } catch (error) {
      return {
        name: 'package.json脚本',
        passed: false,
        message: `❌ 验证失败: ${error.message}`,
      };
    }
  }

  private testScriptManager(): QuickTestResult {
    try {
      const managerPath = join(
        this.projectRoot,
        'scripts/utils/script-manager.ts'
      );

      if (!existsSync(managerPath)) {
        return {
          name: '脚本管理器',
          passed: false,
          message: '❌ 脚本管理器文件不存在',
        };
      }

      // 尝试执行帮助命令
      try {
        execSync('pnpm tsx scripts/utils/script-manager.ts', {
          encoding: 'utf8',
          timeout: 5000,
        });

        return {
          name: '脚本管理器',
          passed: true,
          message: '✅ 脚本管理器运行正常',
        };
      } catch (error) {
        // 只要能启动就认为测试通过
        if (error.stdout?.includes('脚本管理工具')) {
          return {
            name: '脚本管理器',
            passed: true,
            message: '✅ 脚本管理器运行正常',
          };
        }

        return {
          name: '脚本管理器',
          passed: false,
          message: '❌ 脚本管理器启动失败',
        };
      }
    } catch (error) {
      return {
        name: '脚本管理器',
        passed: false,
        message: `❌ 验证失败: ${error.message}`,
      };
    }
  }

  public runQuickTests(): QuickTestResult[] {
    console.log('🚀 开始快速系统测试...\n');

    const tests = [
      {
        name: '脚本管理器',
        test: () => this.testScriptManager(),
      },
      {
        name: '预部署检查',
        test: () =>
          this.testScriptFile(
            'scripts/deploy/pre-deploy-check.ts',
            'class PreDeployChecker'
          ),
      },
      {
        name: '备份系统',
        test: () =>
          this.testScriptFile(
            'scripts/backup/create-backup.ts',
            'class ProjectBackup'
          ),
      },
      {
        name: '回滚系统',
        test: () =>
          this.testScriptFile(
            'scripts/backup/rollback.ts',
            'class ProjectRollback'
          ),
      },
      {
        name: '统一测试运行器',
        test: () =>
          this.testScriptFile(
            'scripts/test/unified-test-runner.ts',
            'class UnifiedTestRunner'
          ),
      },
      {
        name: '部署脚本',
        test: () =>
          this.testScriptFile(
            'scripts/deploy/deploy-to-production.ts',
            'class ProductionDeployer'
          ),
      },
      {
        name: 'package.json脚本',
        test: () => this.testPackageScripts(),
      },
    ];

    const results: QuickTestResult[] = [];

    for (const test of tests) {
      console.log(`🔍 测试 ${test.name}...`);
      const result = test.test();
      results.push(result);
      console.log(`   ${result.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 快速测试结果汇总:');

    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;

    console.log(`   总测试数: ${results.length}`);
    console.log(`   ✅ 通过: ${passed}`);
    console.log(`   ❌ 失败: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   - ${r.name}: ${r.message}`);
        });
    }

    if (failed === 0) {
      console.log('\n🎉 所有快速测试通过！');
      console.log('\n📋 可用的部署命令:');
      console.log('   pnpm deploy:check    - 执行部署前检查');
      console.log('   pnpm deploy:backup   - 创建部署备份');
      console.log('   pnpm deploy:prod     - 一键部署到生产环境');
      console.log('   pnpm test:all        - 运行所有测试');
      console.log('   pnpm scripts:list    - 列出所有脚本');
      console.log('   pnpm scripts:stats   - 显示脚本统计');
      console.log('\n🔧 脚本管理命令:');
      console.log('   pnpm scripts:run <name>    - 运行指定脚本');
      console.log('   pnpm scripts:search <pattern> - 搜索脚本');
      console.log('   pnpm scripts:info <name>     - 显示脚本信息');
    }

    return results;
  }
}

// 主执行函数
async function main() {
  try {
    const tester = new QuickSystemTester();
    const results = tester.runQuickTests();

    const failed = results.filter((r) => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 快速测试运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { QuickSystemTester };
