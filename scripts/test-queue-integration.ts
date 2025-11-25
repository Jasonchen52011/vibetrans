/**
 * 队列集成测试脚本
 * 测试所有已集成队列的 API 端点
 */

const BASE_URL = 'http://localhost:3000';

// 测试用例配置
const TEST_CASES = [
  {
    name: 'English to Chinese',
    endpoint: '/api/english-to-chinese-translator',
    body: { text: 'Hello, how are you?' },
    expectedField: 'translatedText',
  },
  {
    name: 'Haitian Creole',
    endpoint: '/api/haitian-creole-translator',
    body: { text: 'Good morning' },
    expectedField: 'translatedText',
  },
  {
    name: 'English to Turkish',
    endpoint: '/api/english-to-turkish-translator',
    body: { text: 'Thank you' },
    expectedField: 'translatedText',
  },
  {
    name: 'Japanese to English',
    endpoint: '/api/japanese-to-english-translator',
    body: { text: 'こんにちは' },
    expectedField: 'translatedText',
  },
  {
    name: 'Telugu to English',
    endpoint: '/api/telugu-to-english-translator',
    body: { text: 'Hello' },
    expectedField: 'translated',
  },
  {
    name: 'Cantonese',
    endpoint: '/api/cantonese-translator',
    body: { text: 'Hello world' },
    expectedField: 'translated',
  },
  {
    name: 'Nahuatl',
    endpoint: '/api/nahuatl-translator',
    body: { text: 'Hello friend' },
    expectedField: 'translated',
  },
  {
    name: 'Albanian to English',
    endpoint: '/api/albanian-to-english',
    body: { text: 'Përshëndetje' },
    expectedField: 'translated',
  },
  {
    name: 'English to Amharic',
    endpoint: '/api/english-to-amharic-translator',
    body: { text: 'Hello' },
    expectedField: 'translated',
  },
  {
    name: 'English to Persian',
    endpoint: '/api/english-to-persian-translator',
    body: { text: 'Good evening' },
    expectedField: 'translated',
  },
  {
    name: 'Dog Translator',
    endpoint: '/api/dog-translator',
    body: { text: 'I love you' },
    expectedField: 'emotion',
  },
  {
    name: 'Gemini General',
    endpoint: '/api/gemini',
    body: { text: 'Hello', context: 'Translate to Spanish' },
    expectedField: 'result',
  },
];

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  response?: any;
}

async function testEndpoint(testCase: (typeof TEST_CASES)[0]): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${testCase.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.body),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      return {
        name: testCase.name,
        success: false,
        duration,
        error: `HTTP ${response.status}: ${JSON.stringify(data)}`,
      };
    }

    // 检查预期字段是否存在
    if (!(testCase.expectedField in data)) {
      return {
        name: testCase.name,
        success: false,
        duration,
        error: `Missing expected field: ${testCase.expectedField}`,
        response: data,
      };
    }

    return {
      name: testCase.name,
      success: true,
      duration,
      response: data,
    };
  } catch (error) {
    return {
      name: testCase.name,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runSequentialTests() {
  console.log('='.repeat(60));
  console.log('Sequential Test - 逐个测试所有 API');
  console.log('='.repeat(60));

  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    process.stdout.write(`Testing ${testCase.name}... `);
    const result = await testEndpoint(testCase);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${result.duration}ms`);
    } else {
      console.log(`❌ ${result.error}`);
    }
  }

  return results;
}

async function runConcurrentTests(concurrency: number) {
  console.log('\n' + '='.repeat(60));
  console.log(`Concurrent Test - ${concurrency} 个并发请求`);
  console.log('='.repeat(60));

  // 生成多个请求
  const requests = [];
  for (let i = 0; i < concurrency; i++) {
    const testCase = TEST_CASES[i % TEST_CASES.length];
    requests.push({
      ...testCase,
      name: `${testCase.name} #${i + 1}`,
    });
  }

  const startTime = Date.now();
  const results = await Promise.all(requests.map(testEndpoint));
  const totalDuration = Date.now() - startTime;

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`\nResults:`);
  console.log(`  Total requests: ${concurrency}`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total time: ${totalDuration}ms`);
  console.log(`  Average response time: ${Math.round(avgDuration)}ms`);
  console.log(`  Throughput: ${((concurrency / totalDuration) * 1000).toFixed(2)} req/s`);

  // 显示失败的请求
  const failures = results.filter((r) => !r.success);
  if (failures.length > 0) {
    console.log(`\nFailed requests:`);
    failures.forEach((f) => {
      console.log(`  - ${f.name}: ${f.error}`);
    });
  }

  return results;
}

async function checkQueueStats() {
  console.log('\n' + '='.repeat(60));
  console.log('Queue Stats - 队列统计');
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/queue-stats`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('Failed to fetch queue stats:', error);
  }
}

async function main() {
  console.log('🚀 Gemini API Queue Integration Test\n');

  // 1. 先检查服务是否可用
  try {
    await fetch(`${BASE_URL}/api/ping`);
  } catch {
    console.error('❌ Server is not running at', BASE_URL);
    console.error('Please start the server with: pnpm dev');
    process.exit(1);
  }

  // 2. 顺序测试
  await runSequentialTests();

  // 3. 检查队列状态
  await checkQueueStats();

  // 4. 并发测试 - 10 个请求
  await runConcurrentTests(10);

  // 5. 再次检查队列状态
  await checkQueueStats();

  // 6. 高负载测试 - 20 个请求
  await runConcurrentTests(20);

  // 7. 最终队列状态
  await checkQueueStats();

  console.log('\n✅ All tests completed!');
}

main().catch(console.error);
