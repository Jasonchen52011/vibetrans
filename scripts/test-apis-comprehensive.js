#!/usr/bin/env node

/**
 * API测试脚本 - 全面测试翻译器API功能
 * 测试4个翻译器：wingdings, greek, telugu-to-english, manga
 */

import { performance } from 'perf_hooks';

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:3006',
  timeout: 10000, // 10秒超时
  maxRetries: 2,
};

// 测试数据
const TEST_DATA = {
  wingdings: {
    validInputs: [
      { text: 'Hello World', direction: 'to-wingdings' },
      { text: 'ABC123', style: 'traditional' },
      { text: 'Testing', mixed: true },
      { text: '✌☝✋', direction: 'from-wingdings' },
      { text: 'Emergency Help!', direction: 'to-wingdings' },
    ],
    edgeCases: [
      { text: '' },
      { text: '   ' },
      { text: '123!@#' },
      { text: 'Mixed Content 異常' },
      { text: 'A'.repeat(1000) }, // 长文本
    ],
  },
  greek: {
    validInputs: [
      { text: 'Καλημέρα', mode: 'modern' },
      { text: 'Ἀνθρωπος', mode: 'ancient' },
      { text: 'Καλημέρα φίλε', mode: 'literary' },
      { text: 'Αγάπη', mode: 'general' },
      { text: 'Hello', detectOnly: true },
    ],
    edgeCases: [
      { text: '' },
      { text: 'InvalidText123@#$' },
      { text: 'Mixed Καλημέρα Text' },
      { mode: 'invalid' },
      { text: 'A'.repeat(1000) },
    ],
  },
  telugu: {
    validInputs: [
      { text: 'హలో', sourceLanguage: 'telugu', targetLanguage: 'english' },
      { text: 'నమస్కారం', mode: 'literary' },
      { text: 'Hello', sourceLanguage: 'english', targetLanguage: 'telugu' },
      { text: 'సాఫ్ట్వేర్', mode: 'technical' },
      { text: 'Hello', detectOnly: true },
    ],
    edgeCases: [
      { text: '' },
      { text: 'Invalid@#$%' },
      { text: 'Mixed హలో Text' },
      { mode: 'invalid' },
      { text: 'A'.repeat(1000) },
    ],
  },
  manga: {
    validInputs: [
      { text: 'Hello my friend', style: 'shonen' },
      { text: 'I love you', style: 'shojo' },
      { text: 'The reality is harsh', style: 'seinen' },
      { text: 'This is amazing', style: 'general' },
      { text: 'Hello World' },
    ],
    edgeCases: [
      { text: '' },
      { text: '   ' },
      { style: 'invalid' },
      { text: 'A'.repeat(1000) },
      { text: '!@#$%^&*()' },
    ],
  },
};

// 测试结果存储
const testResults = {
  wingdings: { success: 0, failed: 0, errors: [] },
  greek: { success: 0, failed: 0, errors: [] },
  telugu: { success: 0, failed: 0, errors: [] },
  manga: { success: 0, failed: 0, errors: [] },
};

/**
 * 执行API请求
 */
async function makeAPIRequest(endpoint, data) {
  const startTime = performance.now();

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
    }

    const responseData = await response.json();

    return {
      success: true,
      data: responseData,
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return {
      success: false,
      error: error.message,
      responseTime,
    };
  }
}

/**
 * 执行GET请求（健康检查）
 */
async function healthCheck(endpoint) {
  const startTime = performance.now();

  try {
    const response = await fetch(`${TEST_CONFIG.baseURL}/api/${endpoint}`);

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return {
      success: false,
      error: error.message,
      responseTime,
    };
  }
}

/**
 * 测试数据验证
 */
function validateResponse(apiType, response, testData) {
  const issues = [];

  // 基本响应结构检查
  if (!response.success) {
    issues.push(`请求失败: ${response.error}`);
    return issues;
  }

  const data = response.data;

  // 检查基本字段
  if (!data.translated && data.translated !== '') {
    issues.push('缺少translated字段');
  }

  if (!data.original && data.original !== '') {
    issues.push('缺少original字段');
  }

  // API特定验证
  switch (apiType) {
    case 'wingdings':
      if (typeof data.isTranslated !== 'boolean') {
        issues.push('isTranslated应为布尔值');
      }
      if (!data.translator || data.translator.type !== 'symbolic') {
        issues.push('translator信息不正确');
      }
      break;

    case 'greek':
      if (!data.modeName || !data.greekType) {
        issues.push('缺少modeName或greekType字段');
      }
      if (!data.languageInfo || typeof data.languageInfo.confidence !== 'number') {
        issues.push('languageInfo信息不完整');
      }
      break;

    case 'telugu':
      if (!data.modeName || !data.sourceLanguage || !data.targetLanguage) {
        issues.push('缺少modeName、sourceLanguage或targetLanguage字段');
      }
      break;

    case 'manga':
      if (!data.style || !data.mangaStyle) {
        issues.push('缺少style或mangaStyle字段');
      }
      if (data.mangaStyle && (!data.mangaStyle.name || !data.mangaStyle.description)) {
        issues.push('mangaStyle信息不完整');
      }
      break;
  }

  // 响应时间检查
  if (response.responseTime > 5000) {
    issues.push(`响应时间过长: ${response.responseTime}ms`);
  }

  return issues;
}

/**
 * 执行单个API测试
 */
async function testAPI(apiType) {
  console.log(`\n🧪 测试 ${apiType.toUpperCase()} Translator API`);
  console.log('='.repeat(50));

  // 健康检查
  console.log('📋 执行健康检查...');
  const healthResult = await healthCheck(apiType === 'telugu' ? 'telugu-to-english-translator' : `${apiType}-translator`);

  if (healthResult.success) {
    console.log(`✅ 健康检查通过 (${healthResult.responseTime}ms)`);
    testResults[apiType].success++;
  } else {
    console.log(`❌ 健康检查失败: ${healthResult.error}`);
    testResults[apiType].failed++;
    testResults[apiType].errors.push(`健康检查失败: ${healthResult.error}`);
    return;
  }

  // 测试有效输入
  console.log('\n📝 测试有效输入...');
  for (let i = 0; i < TEST_DATA[apiType].validInputs.length; i++) {
    const testData = TEST_DATA[apiType].validInputs[i];
    console.log(`  测试 ${i + 1}: ${JSON.stringify(testData).substring(0, 80)}...`);

    const result = await makeAPIRequest(
      apiType === 'telugu' ? 'telugu-to-english-translator' : `${apiType}-translator`,
      testData
    );

    const issues = validateResponse(apiType, result, testData);

    if (result.success && issues.length === 0) {
      console.log(`    ✅ 成功 (${result.responseTime}ms) - 输出: "${(result.data.translated || '').substring(0, 50)}..."`);
      testResults[apiType].success++;
    } else {
      console.log(`    ❌ 失败: ${result.error || issues.join(', ')}`);
      testResults[apiType].failed++;
      testResults[apiType].errors.push(...issues);
    }
  }

  // 测试边界情况
  console.log('\n🔍 测试边界情况...');
  for (let i = 0; i < TEST_DATA[apiType].edgeCases.length; i++) {
    const testData = TEST_DATA[apiType].edgeCases[i];
    console.log(`  边界测试 ${i + 1}: ${JSON.stringify(testData).substring(0, 50)}...`);

    const result = await makeAPIRequest(
      apiType === 'telugu' ? 'telugu-to-english-translator' : `${apiType}-translator`,
      testData
    );

    // 边界情况通常预期会失败，但不应该导致服务器错误
    if (result.data?.statusCode >= 400 && result.data?.statusCode < 500) {
      console.log(`    ✅ 正确处理错误 (${result.responseTime}ms) - ${result.data.error}`);
      testResults[apiType].success++;
    } else if (result.success) {
      console.log(`    ✅ 意外成功 (${result.responseTime}ms) - 输出: "${(result.data.translated || '').substring(0, 50)}..."`);
      testResults[apiType].success++;
    } else {
      console.log(`    ❌ 服务器错误: ${result.error}`);
      testResults[apiType].failed++;
      testResults[apiType].errors.push(`边界测试失败: ${result.error}`);
    }
  }
}

/**
 * 安全性测试
 */
async function securityTest(apiType) {
  console.log('\n🔒 执行安全性测试...');

  const securityTests = [
    { name: 'SQL注入测试', data: { text: "'; DROP TABLE users; --" } },
    { name: 'XSS测试', data: { text: '<script>alert("xss")</script>' } },
    { name: '大文本测试', data: { text: 'A'.repeat(10000) } },
    { name: '特殊字符测试', data: { text: '\x00\x01\x02' } },
    { name: 'JSON注入测试', data: { text: '{"injected": true}' } },
  ];

  for (const test of securityTests) {
    console.log(`  ${test.name}...`);
    const result = await makeAPIRequest(
      apiType === 'telugu' ? 'telugu-to-english-translator' : `${apiType}-translator`,
      test.data
    );

    // 安全测试应该要么优雅处理，要么返回错误，但不应该崩溃
    if (result.success || (result.data && result.data.statusCode < 500)) {
      console.log(`    ✅ 通过 (${result.responseTime}ms)`);
    } else {
      console.log(`    ⚠️  潜在安全问题: ${result.error}`);
      testResults[apiType].errors.push(`安全测试失败 - ${test.name}: ${result.error}`);
    }
  }
}

/**
 * 性能测试
 */
async function performanceTest(apiType) {
  console.log('\n⚡ 执行性能测试...');

  const performanceData = {
    text: 'Hello world, this is a performance test to check response time and consistency.',
  };

  const times = [];
  const concurrentRequests = 5;

  for (let i = 0; i < concurrentRequests; i++) {
    const result = await makeAPIRequest(
      apiType === 'telugu' ? 'telugu-to-english-translator' : `${apiType}-translator`,
      performanceData
    );

    if (result.success) {
      times.push(result.responseTime);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    console.log(`    📊 平均响应时间: ${avgTime}ms`);
    console.log(`    📊 最大响应时间: ${maxTime}ms`);
    console.log(`    📊 最小响应时间: ${minTime}ms`);

    if (avgTime > 3000) {
      console.log(`    ⚠️  平均响应时间较长`);
      testResults[apiType].errors.push(`性能警告: 平均响应时间 ${avgTime}ms`);
    }
  } else {
    console.log(`    ❌ 所有性能测试请求都失败了`);
    testResults[apiType].failed++;
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 API测试总结报告');
  console.log('='.repeat(80));

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const [apiType, results] of Object.entries(testResults)) {
    console.log(`\n${apiType.toUpperCase()} Translator:`);
    console.log(`  ✅ 成功: ${results.success}`);
    console.log(`  ❌ 失败: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log(`  ⚠️  问题:`);
      results.errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error}`);
      });
    }

    totalSuccess += results.success;
    totalFailed += results.failed;
  }

  console.log('\n' + '='.repeat(80));
  console.log('总体统计:');
  console.log(`  ✅ 总成功: ${totalSuccess}`);
  console.log(`  ❌ 总失败: ${totalFailed}`);
  console.log(`  📈 成功率: ${((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1)}%`);

  // 保存报告到文件
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSuccess,
      totalFailed,
      successRate: ((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1),
    },
    details: testResults,
  };

  // Node.js环境下写入文件
  try {
    const fs = await import('fs');
    fs.writeFileSync(
      `${process.cwd()}/api-test-report.json`,
      JSON.stringify(reportData, null, 2)
    );
    console.log('\n📄 详细报告已保存到: api-test-report.json');
  } catch (error) {
    console.log('\n❌ 保存报告失败:', error.message);
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 开始API测试');
  console.log(`📍 测试目标: ${TEST_CONFIG.baseURL}`);
  console.log(`⏰ 开始时间: ${new Date().toISOString()}`);

  const apis = ['wingdings', 'greek', 'telugu', 'manga'];

  for (const api of apis) {
    try {
      await testAPI(api);
      await securityTest(api);
      await performanceTest(api);
    } catch (error) {
      console.error(`❌ 测试 ${api} 时发生严重错误:`, error.message);
      testResults[api].failed++;
      testResults[api].errors.push(`严重错误: ${error.message}`);
    }
  }

  generateReport();
}

// 检查是否直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  testAPI,
  securityTest,
  performanceTest,
  TEST_DATA,
  TEST_CONFIG,
};