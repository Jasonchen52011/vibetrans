#!/usr/bin/env tsx

/**
 * 快速API健康检查脚本
 * 快速测试所有API的基本可用性
 */

import fs from 'fs';
import path from 'path';

// 简化版工具列表
const CRITICAL_APIS = [
  { name: 'Baybayin Translator', api: '/api/baybayin-translator' },
  { name: 'Dog Translator', api: '/api/dog-translator' },
  { name: 'Gen Z Translator', api: '/api/gen-z-translator' },
  { name: 'Bad Translator', api: '/api/bad-translator' },
  { name: 'Chinese to English', api: '/api/chinese-to-english-translator' },
  { name: 'Cantonese Translator', api: '/api/cantonese-translator' },
  { name: 'Ancient Greek', api: '/api/ancient-greek-translator' },
  { name: 'Al-Bhed Translator', api: '/api/al-bhed-translator' },
];

interface QuickTestResult {
  api: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  error?: string;
}

async function quickApiHealthCheck(
  baseUrl = 'http://localhost:3000'
): Promise<QuickTestResult[]> {
  const results: QuickTestResult[] = [];

  console.log('🔍 Quick API Health Check...\n');

  for (const tool of CRITICAL_APIS) {
    const startTime = Date.now();

    try {
      const response = await fetch(`${baseUrl}${tool.api}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5秒超时
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        results.push({
          api: tool.name,
          status: 'online',
          responseTime,
        });
        console.log(`✅ ${tool.name}: Online (${responseTime}ms)`);
      } else {
        results.push({
          api: tool.name,
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}`,
        });
        console.log(
          `⚠️  ${tool.name}: HTTP ${response.status} (${responseTime}ms)`
        );
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      results.push({
        api: tool.name,
        status: 'offline',
        responseTime,
        error: error.name === 'AbortError' ? 'Timeout' : error.message,
      });
      console.log(
        `❌ ${tool.name}: Offline - ${error.name === 'AbortError' ? 'Timeout' : error.message} (${responseTime}ms)`
      );
    }
  }

  return results;
}

function generateQuickSummary(results: QuickTestResult[]): void {
  const online = results.filter((r) => r.status === 'online').length;
  const total = results.length;
  const avgResponseTime = Math.round(
    results.reduce((sum, r) => sum + r.responseTime, 0) / total
  );

  console.log(`\n📊 Quick Summary:`);
  console.log(
    `   Online: ${online}/${total} (${Math.round((online / total) * 100)}%)`
  );
  console.log(`   Average Response Time: ${avgResponseTime}ms`);

  if (online < total) {
    console.log(`\n🚨 Offline APIs:`);
    results
      .filter((r) => r.status !== 'online')
      .forEach((r) => {
        console.log(`   ❌ ${r.api}: ${r.error || 'Unknown error'}`);
      });
  }
}

async function main() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  console.log(`Testing against: ${baseUrl}\n`);

  const results = await quickApiHealthCheck(baseUrl);
  generateQuickSummary(results);

  // 保存结果
  const reportPath = path.join(process.cwd(), 'quick-api-health.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        baseUrl,
        results,
      },
      null,
      2
    )
  );

  console.log(`\n📄 Report saved: ${reportPath}`);

  // 如果有API离线，退出码为1
  const offlineCount = results.filter((r) => r.status !== 'online').length;
  if (offlineCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Quick health check failed:', error);
    process.exit(1);
  });
}
