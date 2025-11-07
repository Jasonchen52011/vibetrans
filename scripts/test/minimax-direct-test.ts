#!/usr/bin/env tsx

import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

async function testMinimaxAPI() {
  console.log('🔍 检查环境变量:');
  console.log(
    'MINIMAX_ANTHROPIC_API_KEY:',
    process.env.MINIMAX_ANTHROPIC_API_KEY ? '✅ 已设置' : '❌ 未设置'
  );
  console.log(
    'MINIMAX_ANTHROPIC_BASE_URL:',
    process.env.MINIMAX_ANTHROPIC_BASE_URL
  );
  console.log('MINIMAX_ANTHROPIC_MODEL:', process.env.MINIMAX_ANTHROPIC_MODEL);

  if (!process.env.MINIMAX_ANTHROPIC_API_KEY) {
    console.log('❌ API Key 未设置');
    return;
  }

  console.log('\n🧪 测试 API 调用...');

  try {
    const response = await fetch(
      `${process.env.MINIMAX_ANTHROPIC_BASE_URL}/v1/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.MINIMAX_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.MINIMAX_ANTHROPIC_MODEL || 'MiniMax-M2',
          max_tokens: 100,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: 'Hello, please respond with "API working correctly"',
            },
          ],
        }),
      }
    );

    console.log('📊 Response status:', response.status);
    console.log(
      '📊 Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.content) {
      console.log('✅ API 调用成功！');
      const textContent = data.content.find(
        (item: any) => item.type === 'text'
      );
      const thinkingContent = data.content.find(
        (item: any) => item.type === 'thinking'
      );

      if (thinkingContent) {
        console.log('🤔 思考过程:', thinkingContent.thinking);
      }
      if (textContent) {
        console.log('📤 响应内容:', textContent.text);
      }
    } else {
      console.log('❌ API 调用失败');
    }
  } catch (error: any) {
    console.log('❌ API 调用异常:', error.message);
    console.log('Error details:', error);
  }
}

testMinimaxAPI();
