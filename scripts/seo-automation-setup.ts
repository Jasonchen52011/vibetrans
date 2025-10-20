#!/usr/bin/env tsx

import { submitSitemapAction } from '../src/actions/seo/submit-sitemap';
import { seoAutomationManager } from '../src/lib/seo/seo-automation';

/**
 * SEO 自动化设置脚本
 * 用于初始化和测试 SEO 自动化系统
 */

async function setupSEOAutomation() {
  console.log('🚀 Setting up SEO Automation System...');

  try {
    // 1. 测试 sitemap 生成
    console.log('\n📋 Testing sitemap generation...');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const sitemapUrl = `${baseUrl}/api/sitemap.xml`;

    try {
      const response = await fetch(sitemapUrl);
      if (response.ok) {
        console.log('✅ Sitemap generation: SUCCESS');
        const sitemapContent = await response.text();
        const urlCount = (sitemapContent.match(/<url>/g) || []).length;
        console.log(`📊 Generated ${urlCount} URLs in sitemap`);
      } else {
        console.error('❌ Sitemap generation: FAILED');
        console.error(`Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Sitemap generation: ERROR');
      console.error(error);
    }

    // 2. 测试搜索提交
    console.log('\n📤 Testing search engine submission...');
    const submissionResult = await submitSitemapAction({ force: true });

    if (submissionResult.success) {
      console.log('✅ Search engine submission: SUCCESS');
      console.log(
        `📊 Success rate: ${submissionResult.stats?.successRate || 0}%`
      );
      console.log(`⏱️ Duration: ${submissionResult.duration}ms`);

      // 显示每个搜索引擎的结果
      submissionResult.results?.forEach((result: any) => {
        const status = result.success ? '✅' : '❌';
        console.log(
          `   ${status} ${result.searchEngine}: ${result.success ? 'Success' : result.error}`
        );
      });
    } else {
      console.error('❌ Search engine submission: FAILED');
      console.error(`Error: ${submissionResult.error}`);
    }

    // 3. 启动自动化管理器
    console.log('\n🤖 Starting automation manager...');
    seoAutomationManager.start();

    // 显示触发器状态
    const triggers = seoAutomationManager.getTriggers();
    console.log('📋 Automation triggers:');
    triggers.forEach((trigger) => {
      const status = trigger.enabled ? '✅' : '❌';
      console.log(
        `   ${status} ${trigger.name} (${trigger.interval}h interval)`
      );
    });

    // 显示统计信息
    const stats = seoAutomationManager.getStats();
    console.log('\n📊 Automation stats:');
    console.log(`   Total triggers: ${stats.totalTriggers}`);
    console.log(`   Active triggers: ${stats.activeTriggers}`);
    console.log(`   Total logs: ${stats.totalLogs}`);

    // 4. 创建定时任务示例（如果需要）
    console.log('\n⏰ Setup complete! The system will:');
    console.log('   • Auto-submit sitemap daily');
    console.log('   • Monitor SEO health');
    console.log('   • Track submission results');
    console.log('   • Provide detailed analytics');

    console.log('\n🎯 Next steps:');
    console.log('   1. Configure environment variables');
    console.log('   2. Set up Bing Webmaster Tools');
    console.log('   3. Verify Google Search Console');
    console.log('   4. Monitor dashboard at /admin/seo');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('\n🔧 Checking environment variables...');

  const required = ['NEXT_PUBLIC_BASE_URL', 'SEO_AUTO_SUBMIT_ENABLED'];

  const optional = [
    'BING_API_KEY',
    'BING_SITE_VERIFICATION_KEY',
    'SEO_MONITORING_ENABLED',
    'SEO_SUBMISSION_INTERVAL_HOURS',
  ];

  let allGood = true;

  required.forEach((envVar) => {
    if (process.env[envVar]) {
      console.log(
        `✅ ${envVar}: ${envVar.includes('KEY') ? '***configured***' : process.env[envVar]}`
      );
    } else {
      console.error(`❌ ${envVar}: NOT SET`);
      allGood = false;
    }
  });

  optional.forEach((envVar) => {
    if (process.env[envVar]) {
      console.log(
        `✅ ${envVar}: ${envVar.includes('KEY') ? '***configured***' : process.env[envVar]}`
      );
    } else {
      console.log(`⚠️ ${envVar}: not set (optional)`);
    }
  });

  if (!allGood) {
    console.error(
      '\n❌ Please set required environment variables before continuing'
    );
    process.exit(1);
  }
}

// 运行设置
async function main() {
  console.log('🌐 VibeTrans SEO Automation Setup');
  console.log('=====================================');

  checkEnvironmentVariables();
  await setupSEOAutomation();

  console.log('\n🎉 SEO automation setup completed successfully!');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

export { setupSEOAutomation };
