#!/usr/bin/env tsx

import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

interface TranslationRequest {
  text: string;
  prompt?: string;
  systemInstruction?: string;
}

async function testTranslation(request: TranslationRequest) {
  console.log(`\n🧪 测试翻译:`);
  console.log(`📝 输入: ${request.text}`);
  if (request.prompt) console.log(`💭 提示: ${request.prompt}`);
  if (request.systemInstruction)
    console.log(`🔧 系统指令: ${request.systemInstruction}`);

  try {
    // 构建消息内容
    let fullPrompt = '';
    if (request.systemInstruction) {
      fullPrompt += `${request.systemInstruction}\n\n`;
    }
    if (request.prompt) {
      fullPrompt += `${request.prompt}\n\n`;
    }
    fullPrompt += `输入：${request.text}\n\n请直接处理上述内容并返回结果：`;

    const response = await fetch(
      `${process.env.MINIMAX_ANTHROPIC_BASE_URL}/v1/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.MINIMAX_ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2',
          max_tokens: 2048,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: fullPrompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.content) {
      const textContent = data.content.find(
        (item: any) => item.type === 'text'
      );
      const thinkingContent = data.content.find(
        (item: any) => item.type === 'thinking'
      );

      console.log(`✅ 翻译成功！`);
      console.log(`📤 输出: ${textContent?.text}`);
      console.log(
        `📊 Token使用: ${data.usage?.input_tokens} input, ${data.usage?.output_tokens} output`
      );

      if (thinkingContent && thinkingContent.thinking.length < 200) {
        console.log(`🤔 思考过程: ${thinkingContent.thinking}`);
      }

      return textContent?.text;
    } else {
      console.log(`❌ 翻译失败: ${JSON.stringify(data)}`);
      return null;
    }
  } catch (error: any) {
    console.log(`❌ 翻译异常: ${error.message}`);
    return null;
  }
}

async function runTranslationTests() {
  console.log('🚀 开始 Minimax Anthropic 翻译测试');
  console.log('=' * 60);

  const testCases = [
    {
      name: '基础英译中',
      text: 'Hello world, how are you today?',
      prompt: '请将以下英文翻译成中文',
      systemInstruction: '你是一个专业的翻译助手，请提供准确流畅的翻译',
    },
    {
      name: '中译英',
      text: '今天天气很好，适合出去散步',
      prompt: '请将以下中文翻译成英文',
      systemInstruction: '你是一个专业的翻译助手，请提供准确流畅的翻译',
    },
    {
      name: '创意写作',
      text: 'artificial intelligence',
      prompt: '请为以下词汇提供一个诗意的解释',
      systemInstruction: '你是一个富有想象力的作家，请用优美的语言描述',
    },
    {
      name: '文本摘要',
      text: '人工智能是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。该领域的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。',
      prompt: '请将以下内容总结成一句话',
      systemInstruction: '你是一个专业的摘要助手，请提炼核心信息',
    },
  ];

  let successCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('-' * 40);

    const result = await testTranslation(testCase);
    if (result) {
      successCount++;
    }

    // 间隔1秒，避免频率限制
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n📊 测试结果汇总:');
  console.log('=' * 60);
  console.log(`✅ 成功: ${successCount}/${testCases.length}`);
  console.log(
    `📈 成功率: ${((successCount / testCases.length) * 100).toFixed(1)}%`
  );

  if (successCount === testCases.length) {
    console.log('\n🎉 所有翻译测试通过！Minimax Anthropic API 翻译功能正常！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置和网络连接');
  }
}

runTranslationTests();
