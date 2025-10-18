#!/usr/bin/env tsx

/**
 * API测试演示脚本
 * 演示API测试工具的功能，无需运行开发服务器
 */

import fs from 'fs';
import path from 'path';

interface DemoResult {
  toolName: string;
  apiPath: string;
  status: 'success' | 'warning' | 'error';
  responseTime: number;
  tests: {
    connectivity: boolean;
    getInfo: boolean;
    postFunction: boolean;
    errorHandling: boolean;
  };
  notes: string;
}

const DEMO_TOOLS = [
  { name: 'Baybayin Translator', api: '/api/baybayin-translator' },
  { name: 'Dog Translator', api: '/api/dog-translator' },
  { name: 'Gen Z Translator', api: '/api/gen-z-translator' },
  { name: 'Bad Translator', api: '/api/bad-translator' },
  { name: 'Chinese to English', api: '/api/chinese-to-english-translator' },
  { name: 'Cantonese Translator', api: '/api/cantonese-translator' },
  { name: 'Ancient Greek', api: '/api/ancient-greek-translator' },
  { name: 'Al-Bhed Translator', api: '/api/al-bhed-translator' },
  { name: 'Esperanto Translator', api: '/api/esperanto-translator' },
  { name: 'High Valyrian', api: '/api/high-valyrian-translator' },
];

function simulateApiCheck(api: string): DemoResult {
  // 模拟不同的API状态和响应时间
  const random = Math.random();
  let status: 'success' | 'warning' | 'error';
  let notes = '';
  let responseTime = Math.floor(Math.random() * 2000) + 100;

  if (random > 0.9) {
    status = 'error';
    responseTime = 5000;
    notes = 'Simulated: API timeout or connection error';
  } else if (random > 0.7) {
    status = 'warning';
    responseTime = Math.floor(Math.random() * 3000) + 2000;
    notes = 'Simulated: Slow response time';
  } else {
    status = 'success';
    notes = 'Simulated: Normal operation';
  }

  return {
    toolName: api.replace('/api/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    apiPath: api,
    status,
    responseTime,
    tests: {
      connectivity: status !== 'error',
      getInfo: Math.random() > 0.1,
      postFunction: status === 'success',
      errorHandling: Math.random() > 0.2,
    },
    notes,
  };
}

function generateDemoReport(results: DemoResult[]): void {
  console.log('🎭 API Testing Demo - 模拟测试结果\n');
  console.log('这个演示展示了API测试工具的功能，无需运行实际的服务器。\n');

  // 显示测试结果
  console.log('📋 测试结果详情:');
  console.log('=' .repeat(80));
  console.log(`{'Tool Name'.padEnd(25)} {'Status'.padEnd(10)} {'Response'.padEnd(10)} {'Tests'.padEnd(15)} Notes`);
  console.log('-'.repeat(80));

  results.forEach(result => {
    const statusEmoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const testPassed = Object.values(result.tests).filter(t => t).length;
    const testTotal = Object.keys(result.tests).length;

    console.log(
      `${result.toolName.padEnd(25)} ${statusEmoji} ${result.status.padEnd(8)} ${result.responseTime.toString().padEnd(10)} ${testPassed}/${testTotal} ${result.notes.substring(0, 20).padEnd(15)}`
    );
  });

  // 生成摘要
  const successful = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;
  const avgResponseTime = Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length);

  console.log('\n📊 测试摘要:');
  console.log(`   总工具数: ${results.length}`);
  console.log(`   ✅ 成功: ${successful}`);
  console.log(`   ⚠️  警告: ${warnings}`);
  console.log(`   ❌ 错误: ${errors}`);
  console.log(`   📈 健康率: ${Math.round((successful / results.length) * 100)}%`);
  console.log(`   ⏱️  平均响应时间: ${avgResponseTime}ms`);

  // 显示详细的测试通过率
  const testResults = {
    connectivity: results.filter(r => r.tests.connectivity).length,
    getInfo: results.filter(r => r.tests.getInfo).length,
    postFunction: results.filter(r => r.tests.postFunction).length,
    errorHandling: results.filter(r => r.tests.errorHandling).length,
  };

  console.log('\n🔍 详细测试通过率:');
  Object.entries(testResults).forEach(([test, passed]) => {
    const percentage = Math.round((passed / results.length) * 100);
    console.log(`   ${test}: ${passed}/${results.length} (${percentage}%)`);
  });

  // 演示报告生成
  console.log('\n📄 报告生成演示:');
  console.log('   实际使用时，脚本会生成以下文件:');
  console.log('   - api-test-report-2024-01-15T10-30-00-000Z.json (详细JSON报告)');
  console.log('   - api-test-report-2024-01-15T10-30-00-000Z.md (Markdown报告)');

  // 保存演示结果
  const demoData = {
    timestamp: new Date().toISOString(),
    demo: true,
    summary: {
      total: results.length,
      successful,
      warnings,
      errors,
      avgResponseTime,
    },
    results,
  };

  const demoPath = path.join(process.cwd(), 'demo-api-test-results.json');
  fs.writeFileSync(demoPath, JSON.stringify(demoData, null, 2));
  console.log(`\n💾 演示结果已保存: ${demoPath}`);
}

function showUsageExamples(): void {
  console.log('\n🚀 实际使用方法:');
  console.log('=' .repeat(50));
  console.log('# 1. 确保开发服务器运行');
  console.log('pnpm dev');
  console.log('');
  console.log('# 2. 运行完整API测试');
  console.log('pnpm api:test');
  console.log('');
  console.log('# 3. 快速健康检查');
  console.log('pnpm api:test:quick');
  console.log('');
  console.log('# 4. 启动持续监控');
  console.log('pnpm api:monitor');
  console.log('');
  console.log('# 5. 查看监控报告');
  console.log('pnpm api:monitor:report');

  console.log('\n⚙️  环境变量配置:');
  console.log('export TEST_BASE_URL="http://localhost:3000"');
  console.log('export API_TIMEOUT="30000"');

  console.log('\n📋 CI/CD 集成:');
  console.log('# 在GitHub Actions中使用');
  console.log('- name: Run API Tests');
  console.log('  run: pnpm api:test:quick');

  console.log('\n🔧 自定义配置:');
  console.log('# 修改脚本中的TOOL_APIS列表来添加新的API');
  console.log('# 调整超时时间和重试次数');
  console.log('# 自定义测试数据和期望结果');
}

function main() {
  console.log('🎭 API Testing Tool Demo\n');

  console.log('这个演示脚本展示了API测试工具的功能，包括：');
  console.log('- 模拟API连接性测试');
  console.log('- 模拟不同响应时间');
  console.log('- 生成测试报告');
  console.log('- 展示使用方法\n');

  // 模拟测试
  const results = DEMO_TOOLS.map(tool => simulateApiCheck(tool.api));

  // 生成报告
  generateDemoReport(results);

  // 显示使用方法
  showUsageExamples();

  console.log('\n✅ 演示完成！');
  console.log('\n💡 提示: 要进行真实的API测试，请启动开发服务器 (pnpm dev) 然后运行 pnpm api:test');
}

if (require.main === module) {
  main().catch((error: any) => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}