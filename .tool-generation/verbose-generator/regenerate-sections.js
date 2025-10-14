#!/usr/bin/env node

import fs from 'node:fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const contentResearch = {
  funFacts: [
    "部分用户反映：在使用 verbose generator 时，有时会生成一些意外幽默或'废话连篇'的句子，形成了一种网络玩梗",
    "有讨论指出：该工具在不同语境下可能会生成带有'彩蛋'性质的信息，增加了使用中的趣味性",
    "Reddit 上有人分享：尝试调高冗长度设置后，生成的文章竟然包含了重复的成语和修辞，惹得网友调侃'写书模式激活'",
    '部分 Quora 回答里提到：verbose generator 的生成模式偶尔会无意中创造出独到的表达方式，让人找到了另一种写作灵感',
    '社区中还流传着这样的说法：verbose generator 不仅仅是增加字数，更像是一种挑战——如何在复杂文本中找出真正核心的信息',
  ],
  contentGaps: [
    '如何自定义 verbosity（冗长程度）的参数或模板配置',
    'verbose generator 工作的底层算法和技术原理解析',
    '生成内容的校对、编辑以及如何避免无效冗余的问题',
    '实际场景下（如文章写作、开发文档、学术材料）的使用案例和示例',
    '与其它文案/内容生成工具（如简洁风格生成器）的详细对比',
    '集成到现有工作流或第三方工具（如 API、CMS、IDE）的具体方法',
    '生成内容对 SEO 的影响（如何在保证丰富表达的同时不影响可读性）',
    '使用 verbose generator 时如何平衡自动生成与人工编辑的关系',
  ],
};

async function callOpenAI(model, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const requestBody = { model, messages };
  if (!model.startsWith('o3')) requestBody.temperature = 0.7;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

const prompt = `你是一个英文 SEO 文案写手。基于以下调研数据，为「verbose generator」工具写两个板块的英文文案：

调研数据：
- Fun Facts: ${JSON.stringify(contentResearch.funFacts, null, 2)}
- 用户关心的话题: ${JSON.stringify(contentResearch.contentGaps, null, 2)}

请写：

1. **Fun Facts 板块** - 写 2 个有趣的事实
   * 每个 30-35 单词
   * 基于调研中的 fun facts，用英文改写
   * 内容有趣、易懂，和工具紧密相关
   * 写作中增加个人情感或主观评论（如"我喜欢"或"我认为"）
   * 写作中包含随意性或独特性（如俚语、轶事）
   * 可以提到 VibeTrans 品牌

2. **Explore More (用户兴趣) 板块** - 写 4 个用户可能感兴趣的小板块
   * 大板块标题：Explore More with Verbose Generator
   * 每个小板块包含：
     - 标题（5-8个单词）
     - 正文（40-50 单词）
   * 基于调研中的用户关心话题
   * 写作中增加个人情感或主观评论（如"我喜欢"或"我建议"）
   * 写作中包含随意性或独特性（如俚语、轶事）
   * 展示品牌词：VibeTrans
   * 文案要切入用户关注点：功能、痛点、应用场景或优势

写作风格要求：
- 使用通俗易懂的英文，7年级以下学生也能理解
- 采用对话式、口语化语气
- 文案简洁直接，句子短
- 避免空洞描述，多给细节
- 自然融入关键词但优先考虑可读性

请以 JSON 格式输出：
\`\`\`json
{
  "funFacts": [
    {
      "title": "事实标题（50字符以内，会被截断）",
      "description": "完整的事实内容（30-35单词）",
      "wordCount": 32
    }
  ],
  "userInterest": {
    "title": "Explore More with Verbose Generator",
    "items": [
      {
        "title": "小板块标题",
        "description": "正文内容",
        "wordCount": 45
      }
    ]
  }
}
\`\`\``;

const result = await callOpenAI('gpt-4o', [{ role: 'user', content: prompt }]);
console.log(result);

// 提取并保存 JSON
const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
if (jsonMatch) {
  const data = JSON.parse(jsonMatch[1]);
  await fs.writeFile(
    '/Users/jason-chen/Downloads/project/vibetrans/.tool-generation/verbose-generator/new-sections.json',
    JSON.stringify(data, null, 2)
  );
  console.log('\n✅ 内容已保存到 new-sections.json');
}
