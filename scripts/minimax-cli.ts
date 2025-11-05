#!/usr/bin/env tsx

/**
 * MiniMax-M2 CLI 工具
 * 在命令行中直接使用 MiniMax-M2 API
 */

import { config } from 'dotenv';
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

// 加载环境变量
config({ path: '.env.local' });

interface CLIOptions {
  text?: string;
  prompt?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  verbose?: boolean;
  json?: boolean;
}

/**
 * 检查环境变量配置
 */
function checkConfig(): boolean {
  const apiKey = process.env.MINIMAX_ANTHROPIC_API_KEY;
  const baseUrl = process.env.MINIMAX_ANTHROPIC_BASE_URL;
  const model = process.env.MINIMAX_ANTHROPIC_MODEL;

  if (!apiKey) {
    console.error(chalk.red('❌ 错误: MINIMAX_ANTHROPIC_API_KEY 环境变量未设置'));
    console.log(chalk.yellow('💡 请在 .env.local 文件中设置 MINIMAX_ANTHROPIC_API_KEY'));
    return false;
  }

  return true;
}

/**
 * 调用 MiniMax API
 */
async function callMiniMaxAPI(options: CLIOptions): Promise<any> {
  const {
    text,
    prompt,
    system,
    temperature = 0.7,
    maxTokens = 2048,
    model = process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2',
    verbose = false
  } = options;

  if (!text && !prompt) {
    throw new Error('必须提供 --text 或 --prompt 参数');
  }

  // 构建消息内容
  let fullPrompt = '';
  if (system) {
    fullPrompt += `${system}\n\n`;
  }
  if (prompt) {
    fullPrompt += `${prompt}\n\n`;
  }
  fullPrompt += `输入：${text || prompt}\n\n请直接处理上述内容并返回结果：`;

  if (verbose) {
    console.log(chalk.blue('🔧 请求参数:'));
    console.log(`   - 模型: ${model}`);
    console.log(`   - 温度: ${temperature}`);
    console.log(`   - 最大令牌: ${maxTokens}`);
    console.log(`   - 系统指令: ${system || '无'}`);
    console.log(`   - 提示词: ${prompt || '无'}`);
    console.log(`   - 输入文本: ${text || prompt}`);
    console.log(`   - 完整消息: ${fullPrompt}`);
    console.log('');
  }

  const response = await fetch(`${process.env.MINIMAX_ANTHROPIC_BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MINIMAX_ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API 错误 (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * 格式化输出
 */
function formatOutput(data: any, options: CLIOptions): void {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const textContent = data.content?.find((item: any) => item.type === 'text');
  const thinkingContent = data.content?.find((item: any) => item.type === 'thinking');

  console.log(chalk.green('✅ 请求成功!'));
  console.log('');

  if (textContent) {
    console.log(chalk.cyan('📤 输出结果:'));
    console.log(textContent.text);
    console.log('');
  }

  if (thinkingContent && options.verbose) {
    console.log(chalk.yellow('🤔 思考过程:'));
    console.log(thinkingContent.thinking);
    console.log('');
  }

  if (data.usage) {
    console.log(chalk.blue('📊 使用统计:'));
    console.log(`   - 输入令牌: ${data.usage.input_tokens}`);
    console.log(`   - 输出令牌: ${data.usage.output_tokens}`);
    console.log(`   - 总计令牌: ${data.usage.input_tokens + data.usage.output_tokens}`);
    console.log('');
  }

  console.log(chalk.gray(`🕒 时间戳: ${new Date().toISOString()}`));
  console.log(chalk.gray(`🔗 模型: ${data.model}`));
}

/**
 * 主命令处理
 */
async function handleCommand(options: CLIOptions): Promise<void> {
  if (!checkConfig()) {
    process.exit(1);
  }

  const spinner = ora('🚀 正在调用 MiniMax-M2 API...').start();

  try {
    const result = await callMiniMaxAPI(options);
    spinner.stop();
    formatOutput(result, options);
  } catch (error: any) {
    spinner.stop();
    console.error(chalk.red(`❌ 错误: ${error.message}`));
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

/**
 * 配置 CLI 命令
 */
program
  .name('minimax-cli')
  .description('MiniMax-M2 CLI 工具 - 在命令行中使用 MiniMax-M2 API')
  .version('1.0.0');

program
  .command('chat')
  .description('与 MiniMax-M2 进行对话')
  .option('-t, --text <text>', '输入文本')
  .option('-p, --prompt <prompt>', '提示词')
  .option('-s, --system <system>', '系统指令')
  .option('--temperature <temp>', '温度参数 (0.0-1.0)', parseFloat)
  .option('--max-tokens <tokens>', '最大令牌数', parseInt)
  .option('--model <model>', '模型名称', 'MiniMax-M2')
  .option('-v, --verbose', '详细输出')
  .option('--json', 'JSON 格式输出')
  .action(handleCommand);

program
  .command('translate')
  .description('翻译文本')
  .option('-t, --text <text>', '要翻译的文本')
  .option('-p, --prompt <prompt>', '翻译提示，例如：请将英文翻译成中文')
  .option('-s, --system <system>', '系统指令，默认为专业翻译助手', '你是一个专业的翻译助手，请提供准确流畅的翻译')
  .option('--temperature <temp>', '温度参数', '0.3')
  .option('--max-tokens <tokens>', '最大令牌数', '1024')
  .option('-v, --verbose', '详细输出')
  .option('--json', 'JSON 格式输出')
  .action(handleCommand);

program
  .command('summarize')
  .description('文本摘要')
  .option('-t, --text <text>', '要摘要的文本')
  .option('-p, --prompt <prompt>', '摘要提示，例如：请总结成一句话')
  .option('-s, --system <system>', '系统指令，默认为专业摘要助手', '你是一个专业的摘要助手，请提炼核心信息')
  .option('--temperature <temp>', '温度参数', '0.5')
  .option('--max-tokens <tokens>', '最大令牌数', '512')
  .option('-v, --verbose', '详细输出')
  .option('--json', 'JSON 格式输出')
  .action(handleCommand);

program
  .command('config')
  .description('显示当前配置')
  .action(() => {
    console.log(chalk.blue('📋 当前配置:'));
    console.log(`   - API Key: ${process.env.MINIMAX_ANTHROPIC_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);
    console.log(`   - Base URL: ${process.env.MINIMAX_ANTHROPIC_BASE_URL || 'https://api.minimax.io/anthropic'}`);
    console.log(`   - Model: ${process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2'}`);
    console.log(`   - Max Tokens: ${process.env.MINIMAX_ANTHROPIC_MAX_TOKENS || '2048'}`);
    console.log(`   - Temperature: ${process.env.MINIMAX_ANTHROPIC_TEMPERATURE || '0.7'}`);
    console.log('');
    console.log(chalk.yellow('💡 配置文件位置: .env.local'));
  });

// 处理未知命令
program.on('command:*', () => {
  console.error(chalk.red('❌ 未知命令'));
  console.log(chalk.yellow('💡 使用 --help 查看可用命令'));
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}