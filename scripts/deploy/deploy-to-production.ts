#!/usr/bin/env tsx

/**
 * 一键部署到Cloudflare Workers脚本
 * 整合备份、检查、测试、部署的完整流程
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface DeployOptions {
  skipBackup?: boolean;
  skipTests?: boolean;
  skipChecks?: boolean;
  dryRun?: boolean;
  force?: boolean;
  environment?: 'production' | 'staging';
}

interface DeployResult {
  success: boolean;
  stage: string;
  message: string;
  details?: any;
}

class ProductionDeployer {
  private projectRoot: string;
  private options: DeployOptions;

  constructor(options: DeployOptions = {}) {
    this.projectRoot = process.cwd();
    this.options = {
      environment: 'production',
      ...options,
    };
  }

  private async executeStage(
    stageName: string,
    stageFunction: () => Promise<void>
  ): Promise<DeployResult> {
    try {
      console.log(`\n🔄 ${stageName}...`);
      await stageFunction();
      return { success: true, stage: stageName, message: '✅ 阶段完成' };
    } catch (error) {
      return {
        success: false,
        stage: stageName,
        message: `❌ 阶段失败: ${error.message}`,
        details: error,
      };
    }
  }

  private async runBackup(): Promise<void> {
    if (this.options.skipBackup) {
      console.log('   ⏭️ 跳过备份');
      return;
    }

    console.log('   📦 创建部署前备份...');
    const backupScript = join(
      this.projectRoot,
      'scripts/backup/create-backup.ts'
    );

    if (!existsSync(backupScript)) {
      throw new Error('备份脚本不存在');
    }

    execSync(`pnpm tsx ${backupScript}`, {
      stdio: 'inherit',
      cwd: this.projectRoot,
    });
  }

  private async runPreDeployChecks(): Promise<void> {
    if (this.options.skipChecks) {
      console.log('   ⏭️ 跳过预检查');
      return;
    }

    console.log('   🔍 执行预部署检查...');
    const checkScript = join(
      this.projectRoot,
      'scripts/deploy/pre-deploy-check.ts'
    );

    if (!existsSync(checkScript)) {
      throw new Error('预检查脚本不存在');
    }

    execSync(`pnpm tsx ${checkScript}`, {
      stdio: 'inherit',
      cwd: this.projectRoot,
    });
  }

  private async runTests(): Promise<void> {
    if (this.options.skipTests) {
      console.log('   ⏭️ 跳过测试');
      return;
    }

    console.log('   🧪 执行测试套件...');
    const testScript = join(
      this.projectRoot,
      'scripts/test/unified-test-runner.ts'
    );

    if (!existsSync(testScript)) {
      throw new Error('测试脚本不存在');
    }

    execSync(`pnpm tsx ${testScript}`, {
      stdio: 'inherit',
      cwd: this.projectRoot,
    });
  }

  private async buildProject(): Promise<void> {
    console.log('   🏗️ 构建项目...');

    // 清理之前的构建
    execSync('rm -rf .next', { stdio: 'pipe' });

    // 执行构建
    execSync('pnpm build', { stdio: 'inherit', timeout: 600000 });

    console.log('   ✅ 构建成功');
  }

  private async optimizeBundle(): Promise<void> {
    console.log('   ⚡ 优化打包大小...');

    // 检查是否有优化脚本
    const optimizeScript = join(
      this.projectRoot,
      'scripts/optimize/aggressive-compress.ts'
    );

    if (existsSync(optimizeScript)) {
      try {
        execSync(`pnpm tsx ${optimizeScript}`, {
          stdio: 'pipe',
          cwd: this.projectRoot,
        });
        console.log('   ✅ 打包优化完成');
      } catch (error) {
        console.log('   ⚠️ 打包优化失败，继续部署');
      }
    } else {
      console.log('   ⏭️ 未找到优化脚本，跳过');
    }
  }

  private async deployToCloudflare(): Promise<void> {
    if (this.options.dryRun) {
      console.log('   🔍 干运行模式 - 跳过实际部署');
      return;
    }

    console.log('   ☁️ 部署到Cloudflare Workers...');

    // 检查wrangler配置
    if (!existsSync(join(this.projectRoot, 'wrangler.toml'))) {
      throw new Error('wrangler.toml配置文件不存在');
    }

    try {
      // 使用Wrangler CLI部署
      const command =
        this.options.environment === 'production'
          ? 'wrangler deploy --env production'
          : 'wrangler deploy';

      execSync(command, { stdio: 'inherit', cwd: this.projectRoot });
      console.log('   ✅ Cloudflare部署成功');
    } catch (error) {
      throw new Error(`Cloudflare部署失败: ${error.message}`);
    }
  }

  private async verifyDeployment(): Promise<void> {
    if (this.options.dryRun) {
      console.log('   🔍 干运行模式 - 跳过部署验证');
      return;
    }

    console.log('   🔍 验证部署状态...');

    // 这里可以添加健康检查、Smoke测试等
    // 示例：检查关键API端点
    const domains = {
      production: 'https://your-app-domain.com',
      staging: 'https://staging-your-app-domain.com',
    };

    const domain = domains[this.options.environment || 'production'];

    try {
      // 简单的健康检查
      const response = await fetch(`${domain}/api/health`, {
        method: 'GET',
        timeout: 10000,
      });

      if (response.ok) {
        console.log('   ✅ 部署验证成功');
      } else {
        console.log('   ⚠️ 部署验证返回异常状态码:', response.status);
      }
    } catch (error) {
      console.log('   ⚠️ 部署验证失败:', error.message);
      // 不抛出错误，因为网络问题可能导致验证失败
    }
  }

  private async notifyDeployment(result: DeployResult[]): Promise<void> {
    console.log('\n📢 生成部署通知...');

    const successCount = result.filter((r) => r.success).length;
    const failureCount = result.length - successCount;

    let message = `🚀 部署${failureCount === 0 ? '成功' : '完成'}\n\n`;
    message += `📊 执行摘要:\n`;
    message += `- 成功阶段: ${successCount}/${result.length}\n`;
    message += `- 环境: ${this.options.environment}\n`;
    message += `- 时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    message += `🔄 部署阶段:\n`;
    for (const stageResult of result) {
      const status = stageResult.success ? '✅' : '❌';
      message += `${status} ${stageResult.stage}: ${stageResult.message}\n`;
    }

    if (failureCount > 0) {
      message += `\n⚠️ 失败阶段详情:\n`;
      for (const stageResult of result.filter((r) => !r.success)) {
        message += `- ${stageResult.stage}: ${stageResult.message}\n`;
        if (stageResult.details) {
          message += `  错误: ${stageResult.details.message}\n`;
        }
      }
    }

    console.log('\n' + message);

    // 这里可以添加Slack、Discord、邮件等通知
  }

  public async execute(): Promise<DeployResult[]> {
    console.log('🚀 开始部署到Cloudflare Workers...');
    console.log(`📋 部署配置:`);
    console.log(`   - 环境: ${this.options.environment}`);
    console.log(`   - 跳过备份: ${this.options.skipBackup ? '是' : '否'}`);
    console.log(`   - 跳过测试: ${this.options.skipTests ? '是' : '否'}`);
    console.log(`   - 跳过检查: ${this.options.skipChecks ? '是' : '否'}`);
    console.log(`   - 干运行: ${this.options.dryRun ? '是' : '否'}`);

    const results: DeployResult[] = [];

    // 执行部署流程
    const stages = [
      {
        name: '备份创建',
        func: () => this.runBackup(),
      },
      {
        name: '预部署检查',
        func: () => this.runPreDeployChecks(),
      },
      {
        name: '测试执行',
        func: () => this.runTests(),
      },
      {
        name: '项目构建',
        func: () => this.buildProject(),
      },
      {
        name: '打包优化',
        func: () => this.optimizeBundle(),
      },
      {
        name: 'Cloudflare部署',
        func: () => this.deployToCloudflare(),
      },
      {
        name: '部署验证',
        func: () => this.verifyDeployment(),
      },
    ];

    for (const stage of stages) {
      const result = await this.executeStage(stage.name, stage.func);
      results.push(result);

      // 如果关键阶段失败且未强制执行，则停止
      if (!result.success && !this.options.force) {
        const criticalStages = [
          '预部署检查',
          '测试执行',
          '项目构建',
          'Cloudflare部署',
        ];
        if (criticalStages.includes(stage.name)) {
          console.log(`\n❌ 关键阶段"${stage.name}"失败，停止部署流程`);
          console.log('💡 使用 --force 参数可强制继续部署');
          break;
        }
      }
    }

    // 生成通知
    await this.notifyDeployment(results);

    // 返回结果
    return results;
  }
}

// 主执行函数
async function main() {
  const args = process.argv.slice(2);

  const options: DeployOptions = {
    skipBackup: args.includes('--skip-backup'),
    skipTests: args.includes('--skip-tests'),
    skipChecks: args.includes('--skip-checks'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
  };

  const envIndex = args.findIndex((arg) => arg === '--env');
  if (envIndex !== -1 && args[envIndex + 1]) {
    options.environment = args[envIndex + 1] as 'production' | 'staging';
  }

  try {
    const deployer = new ProductionDeployer(options);
    const results = await deployer.execute();

    // 检查是否有失败的关键阶段
    const criticalFailures = results.filter(
      (r) =>
        !r.success &&
        ['预部署检查', '测试执行', '项目构建', 'Cloudflare部署'].includes(
          r.stage
        )
    );

    if (criticalFailures.length > 0) {
      console.log('\n❌ 部署失败，存在关键阶段错误');
      process.exit(1);
    }

    console.log('\n✅ 部署流程完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 部署过程中发生未处理的错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProductionDeployer, type DeployOptions, type DeployResult };
