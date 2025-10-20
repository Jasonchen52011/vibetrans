#!/usr/bin/env tsx

/**
 * 全面API测试脚本
 * 测试所有工具页面的API是否正常工作
 *
 * 功能：
 * 1. 测试所有API的连接性
 * 2. 测试GET请求（API信息查询）
 * 3. 测试POST请求（主要功能）
 * 4. 性能监控
 * 5. 错误处理测试
 * 6. 生成详细报告
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

// API测试结果接口
interface TestResult {
  toolName: string;
  pagePath: string;
  apiPath: string;
  status: 'success' | 'failed' | 'error';
  tests: {
    connectivity: boolean;
    getInfo: boolean;
    postFunction: boolean;
    errorHandling: boolean;
  };
  responseTime: {
    connectivity: number;
    getInfo: number;
    postFunction: number;
    errorHandling: number;
  };
  errors: string[];
  warnings: string[];
  lastTested: string;
}

// 测试配置
interface TestConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  outputFormat: 'json' | 'markdown' | 'both';
  enablePerformanceMonitoring: boolean;
}

// 工具API配置
const TOOLS_APIS = [
  {
    name: 'Baybayin Translator',
    page: '/baybayin-translator',
    api: '/api/baybayin-translator',
  },
  {
    name: 'Bad Translator',
    page: '/bad-translator',
    api: '/api/bad-translator',
  },
  {
    name: 'Dog Translator',
    page: '/dog-translator',
    api: '/api/dog-translator',
  },
  {
    name: 'Gen Z Translator',
    page: '/gen-z-translator',
    api: '/api/gen-z-translator',
  },
  {
    name: 'Gen Alpha Translator',
    page: '/gen-alpha-translator',
    api: '/api/gen-alpha-translator',
  },
  {
    name: 'Dumb It Down AI',
    page: '/dumb-it-down-ai',
    api: '/api/dumb-it-down-ai',
  },
  {
    name: 'Baby Translator',
    page: '/baby-translator',
    api: '/api/baby-translator',
  },
  { name: 'Gibberish Translator', page: '/gibberish-translator', api: null }, // 无API
  {
    name: 'Ancient Greek Translator',
    page: '/ancient-greek-translator',
    api: '/api/ancient-greek-translator',
  },
  {
    name: 'Al-Bhed Translator',
    page: '/al-bhed-translator',
    api: '/api/al-bhed-translator',
  },
  { name: 'Alien Text Generator', page: '/alien-text-generator', api: null }, // 无API
  {
    name: 'Esperanto Translator',
    page: '/esperanto-translator',
    api: '/api/esperanto-translator',
  },
  {
    name: 'Cuneiform Translator',
    page: '/cuneiform-translator',
    api: '/api/cuneiform-translator',
  },
  {
    name: 'Verbose Generator',
    page: '/verbose-generator',
    api: '/api/verbose-generator',
  },
  {
    name: 'IVR Translator',
    page: '/ivr-translator',
    api: '/api/ivr-translator',
  },
  {
    name: 'Albanian to English',
    page: '/albanian-to-english',
    api: '/api/albanian-to-english',
  },
  {
    name: 'Creole to English Translator',
    page: '/creole-to-english-translator',
    api: '/api/creole-to-english-translator',
  },
  {
    name: 'Pig Latin Translator',
    page: '/pig-latin-translator',
    api: '/api/pig-latin-translator',
  },
  {
    name: 'Cantonese Translator',
    page: '/cantonese-translator',
    api: '/api/cantonese-translator',
  },
  {
    name: 'Chinese to English Translator',
    page: '/chinese-to-english-translator',
    api: '/api/chinese-to-english-translator',
  },
  {
    name: 'Middle English Translator',
    page: '/middle-english-translator',
    api: '/api/middle-english-translator',
  },
  {
    name: 'Minion Translator',
    page: '/minion-translator',
    api: '/api/minion-translator',
  },
  {
    name: 'Samoan to English Translator',
    page: '/samoan-to-english-translator',
    api: '/api/samoan-to-english-translator',
  },
  {
    name: 'Gaster Translator',
    page: '/gaster-translator',
    api: '/api/gaster-translator',
  },
  {
    name: 'High Valyrian Translator',
    page: '/high-valyrian-translator',
    api: '/api/high-valyrian-translator',
  },
  {
    name: 'Aramaic Translator',
    page: '/aramaic-translator',
    api: '/api/aramaic-translator',
  },
];

// 默认测试配置
const DEFAULT_CONFIG: TestConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30秒超时
  retryAttempts: 3,
  outputFormat: 'both',
  enablePerformanceMonitoring: true,
};

/**
 * 发送HTTP请求的辅助函数
 */
async function makeRequest(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<{ response: Response; data: any; responseTime: number }> {
  const startTime = performance.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { response, data, responseTime };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 测试API连接性
 */
async function testConnectivity(
  apiPath: string,
  config: TestConfig
): Promise<{ success: boolean; responseTime: number; error?: string }> {
  try {
    const { response, responseTime } = await makeRequest(
      `${config.baseUrl}${apiPath}`,
      { method: 'GET' },
      config.timeout
    );

    return {
      success: response.ok,
      responseTime,
      error: response.ok
        ? undefined
        : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error: any) {
    return {
      success: false,
      responseTime: config.timeout,
      error: error.name === 'AbortError' ? 'Request timeout' : error.message,
    };
  }
}

/**
 * 测试GET请求（API信息）
 */
async function testGetInfo(
  apiPath: string,
  config: TestConfig
): Promise<{ success: boolean; responseTime: number; error?: string }> {
  try {
    const { response, data, responseTime } = await makeRequest(
      `${config.baseUrl}${apiPath}`,
      { method: 'GET' },
      config.timeout
    );

    const success =
      response.ok &&
      typeof data === 'object' &&
      (data.message ||
        data.version ||
        data.supported_directions ||
        data.powered_by);

    return {
      success,
      responseTime,
      error: !success ? 'Invalid API info response format' : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      responseTime: config.timeout,
      error: error.message,
    };
  }
}

/**
 * 测试POST请求（主要功能）
 */
async function testPostFunction(
  apiPath: string,
  config: TestConfig
): Promise<{ success: boolean; responseTime: number; error?: string }> {
  // 根据不同的API准备测试数据
  const testData = getTestData(apiPath);

  try {
    const { response, data, responseTime } = await makeRequest(
      `${config.baseUrl}${apiPath}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      },
      config.timeout
    );

    const success =
      response.ok &&
      typeof data === 'object' &&
      (data.success || data.translated || data.result || data.output);

    return {
      success,
      responseTime,
      error: !success ? `POST request failed: ${response.status}` : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      responseTime: config.timeout,
      error: error.message,
    };
  }
}

/**
 * 测试错误处理
 */
async function testErrorHandling(
  apiPath: string,
  config: TestConfig
): Promise<{ success: boolean; responseTime: number; error?: string }> {
  try {
    const { response, data, responseTime } = await makeRequest(
      `${config.baseUrl}${apiPath}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }), // 故意发送无效数据
      },
      config.timeout
    );

    const success =
      response.status >= 400 &&
      response.status < 500 &&
      typeof data === 'object' &&
      data.error;

    return {
      success,
      responseTime,
      error: !success ? 'Error handling not working properly' : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      responseTime: config.timeout,
      error: error.message,
    };
  }
}

/**
 * 根据API路径获取测试数据
 */
function getTestData(apiPath: string): any {
  if (apiPath.includes('baybayin')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('dog')) {
    return { text: 'Hello, I am a human', dogBreed: 'Golden Retriever' };
  } else if (apiPath.includes('gen-z')) {
    return { text: 'This is a test message', targetGeneration: 'gen_z' };
  } else if (apiPath.includes('bad')) {
    return {
      text: 'Hello world',
      numTranslations: 5,
      sourceLanguage: 'en',
      targetLanguage: 'zh',
    };
  } else if (apiPath.includes('verbose')) {
    return { text: 'Simple text', verbosityLevel: 'high' };
  } else if (apiPath.includes('ancient-greek')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('al-bhed')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('esperanto')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('cuneiform')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('gaster')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('high-valyrian')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('aramaic')) {
    return { text: 'Hello world', direction: 'auto' };
  } else if (apiPath.includes('chinese-to-english')) {
    return { text: '你好世界' };
  } else if (apiPath.includes('albanian-to-english')) {
    return { text: 'Përshëndetje botë' };
  } else if (apiPath.includes('samoan-to-english')) {
    return { text: 'Mālō le lalolago' };
  } else if (apiPath.includes('creole-to-english')) {
    return { text: 'Bonjou souple' };
  } else if (apiPath.includes('pig-latin')) {
    return { text: 'Hello world' };
  } else if (apiPath.includes('cantonese')) {
    return { text: '你好世界' };
  } else if (apiPath.includes('middle-english')) {
    return { text: 'Hello world' };
  } else if (apiPath.includes('minion')) {
    return { text: 'Hello world' };
  } else if (apiPath.includes('gen-alpha')) {
    return { text: 'This is a test message' };
  } else if (apiPath.includes('dumb-it-down')) {
    return {
      text: 'The photosynthesis process enables plants to convert light energy into chemical energy.',
    };
  } else if (apiPath.includes('ivr')) {
    return { text: 'Hello world' };
  } else if (apiPath.includes('baby')) {
    return { text: 'Hello world' };
  } else {
    return { text: 'Hello world' };
  }
}

/**
 * 测试单个工具API
 */
async function testToolApi(
  tool: (typeof TOOLS_APIS)[0],
  config: TestConfig
): Promise<TestResult> {
  const result: TestResult = {
    toolName: tool.name,
    pagePath: tool.page,
    apiPath: tool.api || '',
    status: 'success',
    tests: {
      connectivity: false,
      getInfo: false,
      postFunction: false,
      errorHandling: false,
    },
    responseTime: {
      connectivity: 0,
      getInfo: 0,
      postFunction: 0,
      errorHandling: 0,
    },
    errors: [],
    warnings: [],
    lastTested: new Date().toISOString(),
  };

  if (!tool.api) {
    result.status = 'failed';
    result.warnings.push('No API endpoint found for this tool');
    return result;
  }

  console.log(`\n🧪 Testing ${tool.name}...`);
  console.log(`   API: ${tool.api}`);

  // 测试连接性
  const connectivityTest = await testConnectivity(tool.api, config);
  result.tests.connectivity = connectivityTest.success;
  result.responseTime.connectivity = connectivityTest.responseTime;
  if (connectivityTest.error) {
    result.errors.push(`Connectivity: ${connectivityTest.error}`);
  }

  if (!connectivityTest.success) {
    result.status = 'failed';
    result.errors.push('API connectivity failed - skipping other tests');
    return result;
  }

  // 测试GET请求
  const getInfoTest = await testGetInfo(tool.api, config);
  result.tests.getInfo = getInfoTest.success;
  result.responseTime.getInfo = getInfoTest.responseTime;
  if (getInfoTest.error) {
    result.errors.push(`GET Info: ${getInfoTest.error}`);
  }

  // 测试POST请求
  const postFunctionTest = await testPostFunction(tool.api, config);
  result.tests.postFunction = postFunctionTest.success;
  result.responseTime.postFunction = postFunctionTest.responseTime;
  if (postFunctionTest.error) {
    result.errors.push(`POST Function: ${postFunctionTest.error}`);
  }

  // 测试错误处理
  const errorHandlingTest = await testErrorHandling(tool.api, config);
  result.tests.errorHandling = errorHandlingTest.success;
  result.responseTime.errorHandling = errorHandlingTest.responseTime;
  if (errorHandlingTest.error) {
    result.errors.push(`Error Handling: ${errorHandlingTest.error}`);
  }

  // 确定最终状态
  const failedTests = Object.values(result.tests).filter(
    (success) => !success
  ).length;
  if (failedTests >= 3) {
    result.status = 'failed';
  } else if (failedTests > 0) {
    result.status = 'error';
  }

  // 性能警告
  if (config.enablePerformanceMonitoring) {
    Object.entries(result.responseTime).forEach(([test, time]) => {
      if (time > 10000) {
        // 10秒
        result.warnings.push(`Slow response time for ${test}: ${time}ms`);
      }
    });
  }

  // 输出测试结果
  const statusEmoji =
    result.status === 'success' ? '✅' : result.status === 'error' ? '⚠️' : '❌';
  console.log(
    `   ${statusEmoji} ${result.tests.connectivity ? '✓' : '✗'} Connectivity | ${result.tests.getInfo ? '✓' : '✗'} GET | ${result.tests.postFunction ? '✓' : '✗'} POST | ${result.tests.errorHandling ? '✓' : '✗'} Error Handling`
  );

  return result;
}

/**
 * 生成JSON格式报告
 */
function generateJsonReport(results: TestResult[], config: TestConfig): any {
  const summary = {
    totalTools: results.length,
    successful: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
    errors: results.filter((r) => r.status === 'error').length,
    averageResponseTime: {
      connectivity: Math.round(
        results.reduce((sum, r) => sum + r.responseTime.connectivity, 0) /
          results.length
      ),
      getInfo: Math.round(
        results.reduce((sum, r) => sum + r.responseTime.getInfo, 0) /
          results.filter((r) => r.responseTime.getInfo > 0).length
      ),
      postFunction: Math.round(
        results.reduce((sum, r) => sum + r.responseTime.postFunction, 0) /
          results.filter((r) => r.responseTime.postFunction > 0).length
      ),
      errorHandling: Math.round(
        results.reduce((sum, r) => sum + r.responseTime.errorHandling, 0) /
          results.filter((r) => r.responseTime.errorHandling > 0).length
      ),
    },
    testDate: new Date().toISOString(),
    config: config,
  };

  return {
    summary,
    results,
  };
}

/**
 * 生成Markdown格式报告
 */
function generateMarkdownReport(
  results: TestResult[],
  config: TestConfig
): string {
  const summary = {
    total: results.length,
    successful: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
    errors: results.filter((r) => r.status === 'error').length,
  };

  let markdown = `# API Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
  markdown += `**Base URL:** ${config.baseUrl}\n\n`;

  // Summary
  markdown += `## 📊 Summary\n\n`;
  markdown += `- **Total Tools:** ${summary.total}\n`;
  markdown += `- **✅ Successful:** ${summary.successful}\n`;
  markdown += `- **⚠️ Partial:** ${summary.errors}\n`;
  markdown += `- **❌ Failed:** ${summary.failed}\n`;
  markdown += `- **Success Rate:** ${Math.round((summary.successful / summary.total) * 100)}%\n\n`;

  // Results table
  markdown += `## 📋 Detailed Results\n\n`;
  markdown += `| Tool | Page | Status | Connectivity | GET | POST | Error Handling | Avg Response Time |\n`;
  markdown += `|------|------|--------|--------------|-----|------|----------------|------------------|\n`;

  results.forEach((result) => {
    const statusEmoji =
      result.status === 'success'
        ? '✅'
        : result.status === 'error'
          ? '⚠️'
          : '❌';
    const avgResponseTime = Math.round(
      [
        result.responseTime.connectivity,
        result.responseTime.getInfo,
        result.responseTime.postFunction,
        result.responseTime.errorHandling,
      ]
        .filter((t) => t > 0)
        .reduce((a, b) => a + b, 0) /
        Object.values(result.responseTime).filter((t) => t > 0).length
    );

    markdown += `| ${result.toolName} | [${result.pagePath}](${config.baseUrl}${result.pagePath}) | ${statusEmoji} ${result.status} | ${result.tests.connectivity ? '✅' : '❌'} | ${result.tests.getInfo ? '✅' : '❌'} | ${result.tests.postFunction ? '✅' : '❌'} | ${result.tests.errorHandling ? '✅' : '❌'} | ${avgResponseTime}ms |\n`;
  });

  // Failed tools details
  const failedResults = results.filter((r) => r.status !== 'success');
  if (failedResults.length > 0) {
    markdown += `\n## 🚨 Issues Found\n\n`;
    failedResults.forEach((result) => {
      markdown += `### ${result.toolName}\n`;
      if (result.errors.length > 0) {
        markdown += `**Errors:**\n`;
        result.errors.forEach((error) => {
          markdown += `- ${error}\n`;
        });
      }
      if (result.warnings.length > 0) {
        markdown += `**Warnings:**\n`;
        result.warnings.forEach((warning) => {
          markdown += `- ${warning}\n`;
        });
      }
      markdown += `\n`;
    });
  }

  return markdown;
}

/**
 * 保存报告到文件
 */
function saveReport(
  reportData: any,
  markdown: string,
  config: TestConfig
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (config.outputFormat === 'json' || config.outputFormat === 'both') {
    const jsonPath = path.join(
      process.cwd(),
      `api-test-report-${timestamp}.json`
    );
    fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 JSON report saved: ${jsonPath}`);
  }

  if (config.outputFormat === 'markdown' || config.outputFormat === 'both') {
    const mdPath = path.join(process.cwd(), `api-test-report-${timestamp}.md`);
    fs.writeFileSync(mdPath, markdown);
    console.log(`📄 Markdown report saved: ${mdPath}`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting comprehensive API testing...\n');

  const config = DEFAULT_CONFIG;
  const results: TestResult[] = [];

  console.log(`📋 Configuration:`);
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   Timeout: ${config.timeout}ms`);
  console.log(`   Testing ${TOOLS_APIS.length} tools\n`);

  // 测试所有工具API
  for (const tool of TOOLS_APIS) {
    try {
      const result = await testToolApi(tool, config);
      results.push(result);
    } catch (error: any) {
      console.error(`Unexpected error testing ${tool.name}:`, error.message);
      results.push({
        toolName: tool.name,
        pagePath: tool.page,
        apiPath: tool.api || '',
        status: 'error',
        tests: {
          connectivity: false,
          getInfo: false,
          postFunction: false,
          errorHandling: false,
        },
        responseTime: {
          connectivity: 0,
          getInfo: 0,
          postFunction: 0,
          errorHandling: 0,
        },
        errors: [`Unexpected error: ${error.message}`],
        warnings: [],
        lastTested: new Date().toISOString(),
      });
    }
  }

  // 生成报告
  const reportData = generateJsonReport(results, config);
  const markdown = generateMarkdownReport(results, config);

  // 输出摘要
  console.log(`\n📊 Test Summary:`);
  console.log(`   Total Tools: ${results.length}`);
  console.log(
    `   ✅ Successful: ${results.filter((r) => r.status === 'success').length}`
  );
  console.log(
    `   ⚠️ Partial: ${results.filter((r) => r.status === 'error').length}`
  );
  console.log(
    `   ❌ Failed: ${results.filter((r) => r.status === 'failed').length}`
  );
  console.log(
    `   Success Rate: ${Math.round((results.filter((r) => r.status === 'success').length / results.length) * 100)}%`
  );

  // 保存报告
  saveReport(reportData, markdown, config);

  console.log('\n🎉 API testing completed!');
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
