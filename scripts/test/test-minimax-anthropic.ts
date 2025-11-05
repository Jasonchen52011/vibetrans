#!/usr/bin/env tsx

/**
 * Minimax Anthropic API 测试脚本
 * 用于验证 Minimax Anthropic 翻译服务的功能
 */

import { config } from 'dotenv';
import { minimaxAnthropicClient } from '../../src/lib/ai/minimax-anthropic';

// 加载环境变量
config({ path: '.env.local' });

interface TestCase {
  name: string;
  input: string;
  prompt?: string;
  systemInstruction?: string;
  expectedPattern?: string;
}

const testCases: TestCase[] = [
  {
    name: '基础翻译测试',
    input: 'Hello world',
    prompt: '请将以下英文翻译成中文',
    systemInstruction: '你是一个专业的翻译助手，请提供准确的翻译',
    expectedPattern: '[\u4e00-\u9fff]', // 期望包含中文字符
  },
  {
    name: '简单问答测试',
    input: 'What is 2+2?',
    systemInstruction: '你是一个AI助手，请简洁准确地回答问题',
    expectedPattern: '\b4\b', // 期望包含数字4
  },
  {
    name: '长文本处理测试',
    input: 'The quick brown fox jumps over the lazy dog. This is a pangram that contains all letters of the English alphabet.',
    prompt: '请将以下英文翻译成中文，并保持原意',
    systemInstruction: '你是一个专业的翻译专家，请确保翻译的准确性和流畅性',
  },
  {
    name: '特殊字符测试',
    input: 'Hello! @#$%^&*()_+ 世界',
    prompt: '请处理以下文本中的特殊字符',
  },
];

/**
 * 执行单个测试用例
 */
async function runTest(testCase: TestCase): Promise<{ success: boolean; result: any; error?: string }> {
  try {
    console.log(`\n🧪 测试用例: ${testCase.name}`);
    console.log(`📝 输入: ${testCase.input}`);

    const startTime = Date.now();

    if (!minimaxAnthropicClient) {
      return {
        success: false,
        result: null,
        error: 'Minimax Anthropic 客户端未配置，请检查环境变量 MINIMAX_ANTHROPIC_API_KEY',
      };
    }

    const response = await minimaxAnthropicClient.translate({
      text: testCase.input,
      prompt: testCase.prompt,
      systemInstruction: testCase.systemInstruction,
    });

    const duration = Date.now() - startTime;

    if (!response.success) {
      console.log(`❌ 测试失败: ${response.error}`);
      return {
        success: false,
        result: response,
        error: response.error,
      };
    }

    console.log(`✅ 测试成功`);
    console.log(`📤 输出: ${response.output}`);
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log(`📊 Token使用: ${response.usage?.totalTokens || 'N/A'}`);

    // 验证输出是否符合预期模式
    if (testCase.expectedPattern && !new RegExp(testCase.expectedPattern).test(response.output)) {
      console.log(`⚠️  警告: 输出不符合预期模式 '${testCase.expectedPattern}'`);
    }

    return {
      success: true,
      result: response,
    };
  } catch (error: any) {
    console.log(`❌ 测试异常: ${error.message}`);
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }
}

/**
 * 执行健康检查
 */
async function runHealthCheck(): Promise<boolean> {
  try {
    console.log('\n🏥 执行健康检查...');

    if (!minimaxAnthropicClient) {
      console.log('❌ Minimax Anthropic 客户端未配置');
      return false;
    }

    const healthResult = await minimaxAnthropicClient.healthCheck();
    const config = minimaxAnthropicClient.getConfig();

    console.log(`📊 配置信息:`);
    console.log(`   - Base URL: ${config.baseUrl}`);
    console.log(`   - Model: ${config.model}`);
    console.log(`   - Max Tokens: ${config.maxTokens}`);
    console.log(`   - Temperature: ${config.temperature}`);

    if (healthResult.status === 'healthy') {
      console.log(`✅ 服务健康: ${healthResult.message}`);
      console.log(`🔗 可用模型: ${healthResult.model}`);
      return true;
    } else {
      console.log(`❌ 服务异常: ${healthResult.message}`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ 健康检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 开始 Minimax Anthropic API 测试');
  console.log('=' * 60);

  // 1. 环境检查
  console.log('\n🔍 环境检查:');
  const hasApiKey = !!process.env.MINIMAX_ANTHROPIC_API_KEY;
  console.log(`   - API Key: ${hasApiKey ? '✅ 已配置' : '❌ 未配置'}`);

  if (!hasApiKey) {
    console.log('\n❌ 错误: 缺少 MINIMAX_ANTHROPIC_API_KEY 环境变量');
    console.log('请在 .env 文件中设置 MINIMAX_ANTHROPIC_API_KEY');
    process.exit(1);
  }

  // 2. 健康检查
  const isHealthy = await runHealthCheck();
  if (!isHealthy) {
    console.log('\n❌ 服务健康检查失败，跳过功能测试');
    process.exit(1);
  }

  // 3. 功能测试
  console.log('\n🧪 开始功能测试:');
  console.log('-' * 60);

  let successCount = 0;
  let totalCount = testCases.length;

  for (const testCase of testCases) {
    const testResult = await runTest(testCase);
    if (testResult.success) {
      successCount++;
    }

    // 测试间隔，避免频率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. 测试结果汇总
  console.log('\n📊 测试结果汇总:');
  console.log('=' * 60);
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);
  console.log(`📈 成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);

  if (successCount === totalCount) {
    console.log('\n🎉 所有测试通过！Minimax Anthropic API 集成成功！');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置和网络连接');
    process.exit(1);
  }
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\n💥 测试脚本执行失败:', error);
    process.exit(1);
  });
}