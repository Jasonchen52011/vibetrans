#!/usr/bin/env tsx

/**
 * SEO 系统测试脚本
 * 测试 sitemap 生成和搜索引擎提交功能
 */

import {
  getSubmissionStats,
  submitToAllSearchEngines,
  submitToBing,
  submitToBingLegacy,
  submitToDuckDuckGo,
  submitToGoogle,
  submitToYandex,
} from '../src/lib/seo/search-engine-submitter';
import {
  generateSitemapXML,
  getSitemapConfig,
} from '../src/lib/seo/sitemap-generator';

async function testSitemapGeneration() {
  console.log('📋 Testing sitemap generation...');

  try {
    const config = getSitemapConfig();
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Locales: ${config.locales.join(', ')}`);

    const sitemapXML = generateSitemapXML(config);

    const urlCount = (sitemapXML.match(/<url>/g) || []).length;
    const xmlSize = Buffer.byteLength(sitemapXML, 'utf8');

    console.log('✅ Sitemap generation: SUCCESS');
    console.log(`📊 Generated ${urlCount} URLs`);
    console.log(`📦 XML size: ${(xmlSize / 1024).toFixed(2)} KB`);

    // 显示前几个 URL 进行验证
    const urlMatches = sitemapXML.match(/<loc>(.*?)<\/loc>/g) || [];
    console.log('\n🔍 Sample URLs:');
    urlMatches.slice(0, 5).forEach((match, index) => {
      const url = match.replace(/<\/?loc>/g, '');
      console.log(`   ${index + 1}. ${url}`);
    });

    return { success: true, urlCount, xmlSize };
  } catch (error) {
    console.error('❌ Sitemap generation: FAILED');
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testSearchEngineSubmission() {
  console.log('\n📤 Testing search engine submission...');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const sitemapUrl = `${baseUrl}/api/sitemap.xml`;

  console.log(`Sitemap URL: ${sitemapUrl}`);

  const config = {
    sitemapUrl,
    siteUrl: baseUrl,
    bingApiKey: process.env.BING_API_KEY,
  };

  const tests = [
    { name: 'Google', fn: () => submitToGoogle(config) },
    { name: 'Bing', fn: () => submitToBing(config) },
    { name: 'Bing Legacy', fn: () => submitToBingLegacy(config) },
    { name: 'DuckDuckGo', fn: () => submitToDuckDuckGo(config) },
    { name: 'Yandex', fn: () => submitToYandex(config) },
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`\n   Testing ${test.name}...`);
      const result = await test.fn();

      if (result.success) {
        console.log(`   ✅ ${test.name}: SUCCESS`);
      } else {
        console.log(`   ❌ ${test.name}: FAILED - ${result.error}`);
      }

      results.push(result);
    } catch (error) {
      console.log(`   ❌ ${test.name}: ERROR - ${error}`);
      results.push({
        success: false,
        searchEngine: test.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 计算统计信息
  const stats = getSubmissionStats(results);
  console.log('\n📊 Submission Summary:');
  console.log(`   Total: ${stats.total}`);
  console.log(`   Successful: ${stats.successful}`);
  console.log(`   Failed: ${stats.failed}`);
  console.log(`   Success Rate: ${stats.successRate.toFixed(1)}%`);

  return { success: stats.successful > 0, results, stats };
}

async function testBatchSubmission() {
  console.log('\n🚀 Testing batch submission...');

  try {
    const results = await submitToAllSearchEngines();
    const stats = getSubmissionStats(results);

    console.log(`✅ Batch submission completed`);
    console.log(`📊 Success rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`⏱️ Total time: ${results.length > 0 ? 'Completed' : 'N/A'}`);

    return { success: stats.successful > 0, results, stats };
  } catch (error) {
    console.error('❌ Batch submission: FAILED');
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Testing environment variables...');

  const required = ['NEXT_PUBLIC_BASE_URL', 'SEO_AUTO_SUBMIT_ENABLED'];

  const optional = [
    'BING_API_KEY',
    'BING_SITE_VERIFICATION_KEY',
    'SEO_MONITORING_ENABLED',
    'SEO_SUBMISSION_INTERVAL_HOURS',
  ];

  const issues = [];

  required.forEach((envVar) => {
    if (process.env[envVar]) {
      const value = envVar.includes('KEY')
        ? '***configured***'
        : process.env[envVar];
      console.log(`✅ ${envVar}: ${value}`);
    } else {
      console.error(`❌ ${envVar}: NOT SET`);
      issues.push(envVar);
    }
  });

  optional.forEach((envVar) => {
    if (process.env[envVar]) {
      const value = envVar.includes('KEY')
        ? '***configured***'
        : process.env[envVar];
      console.log(`✅ ${envVar}: ${value}`);
    } else {
      console.log(`⚠️ ${envVar}: not set (optional)`);
    }
  });

  if (issues.length > 0) {
    console.error(
      '\n❌ Missing required environment variables:',
      issues.join(', ')
    );
    return { success: false, issues };
  }

  return { success: true };
}

async function main() {
  console.log('🌐 VibeTrans SEO System Test');
  console.log('============================\n');

  // 测试环境变量
  const envTest = await testEnvironmentVariables();
  if (!envTest.success) {
    console.error('\n❌ Please fix environment variables before continuing');
    process.exit(1);
  }

  // 测试 sitemap 生成
  const sitemapTest = await testSitemapGeneration();
  if (!sitemapTest.success) {
    console.error('\n❌ Sitemap generation failed');
    process.exit(1);
  }

  // 测试搜索引擎提交
  const submissionTest = await testSearchEngineSubmission();

  // 测试批量提交
  const batchTest = await testBatchSubmission();

  // 总结
  console.log('\n🎉 Test Summary');
  console.log('===============');
  console.log(
    `Sitemap Generation: ${sitemapTest.success ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log(
    `Search Engine Submission: ${submissionTest.success ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log(`Batch Submission: ${batchTest.success ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed =
    sitemapTest.success && submissionTest.success && batchTest.success;

  if (allPassed) {
    console.log('\n🎉 All tests passed! SEO system is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Add environment variables to .env.local');
    console.log('   2. Configure Bing Webmaster Tools');
    console.log('   3. Verify Google Search Console');
    console.log('   4. Start development server: pnpm dev');
    console.log('   5. Visit /api/sitemap.xml to verify sitemap');
    console.log('   6. Use /admin/seo for dashboard (when implemented)');
  } else {
    console.error('\n❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export {
  testSitemapGeneration,
  testSearchEngineSubmission,
  testBatchSubmission,
};
