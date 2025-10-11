#!/usr/bin/env node

/**
 * 🚀 VibeTrans 自动化工具生成器
 *
 * 一键生成完整的翻译工具页面：
 * - Phase 1: GPT-5 Thinking 深度调研
 * - Phase 2: 产品规划生成
 * - Phase 3: 代码生成（Claude Agent）
 * - Phase 4: GPT-4o SEO内容生成
 * - Phase 5: 图片生成（Article Illustrator）
 * - Phase 6: SEO配置（sitemap, navbar, footer）
 * - Phase 7: 质量检查和构建验证
 *
 * 使用方法：
 * node scripts/auto-tool-generator.js "alien text generator"
 *
 * 或添加到 package.json:
 * pnpm tool:auto "alien text generator"
 */

import { exec, execSync } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置
const CONFIG = {
  gptApiKey: process.env.OPENAI_API_KEY || '',

  // 🎯 调研模型配置（可选：o3-mini, o3, gpt-4o, gpt-4o-mini）
  // 推荐：o3-mini（推理强、成本低）
  // 如需最强推理：o3（贵4倍）
  // 如需均衡：gpt-4o
  researchModel: process.env.RESEARCH_MODEL || 'o3-mini',

  // 🎯 内容生成模型配置（可选：gpt-4o, gpt-4o-mini, o3-mini）
  // 推荐：gpt-4o（质量最高）
  // 如需省钱：gpt-4o-mini
  contentModel: process.env.CONTENT_MODEL || 'gpt-4o',

  outputDir: path.join(ROOT_DIR, '.tool-generation'),
  srcDir: path.join(ROOT_DIR, 'src'),
  publicDir: path.join(ROOT_DIR, 'public'),
  messagesDir: path.join(ROOT_DIR, 'messages'),
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logPhase(phase, message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`📍 Phase ${phase}: ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * 调用 OpenAI API
 */
async function callOpenAI(model, messages, temperature = 0.7) {
  const apiKey = CONFIG.gptApiKey;
  if (!apiKey) {
    throw new Error('请设置 OPENAI_API_KEY 环境变量');
  }

  logInfo(`调用 ${model} API...`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 错误: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Phase 1: 产品调研（使用可配置的调研模型）
 */
async function phase1_research(keyword) {
  logPhase(1, `产品调研 (${CONFIG.researchModel})`);

  const prompt = `请帮我做产品调研，使用英文搜索，中文回答我：

1. 在 Google 搜索主关键词：「${keyword}」
   分析排名前 15 的网站，对应给我工具介绍，独特亮点，通过表格展现给我。

2. 在 Quora.com 和 Reddit.com 上查询「${keyword}」相关的话题，找到高频提及和高投票的话题，帮我列出这些话题

3. 在 Quora.com、Reddit.com 和 Google 上查询「${keyword}」相关的话题，找出一些 fun facts 并帮我列出这些话题

4. 帮我总结刚收集的话题，分析市场空白的功能，给出可以加到这个工具里的建议，并给出原因和话题案例。

5. 根据收集的信息分析总结这个工具的产品规划，使用场景，产品名称（直接用关键词转为标题格式）。包含：
   - 一句话产品介绍
   - 亮点功能（分为两部分）：
     * 竞争对手的功能（我都要有）
     * 市场空白功能（创新点）

6. 使用ASCII画出完整方案，核心保持左边输入，右边输出。支持在输入框里粘贴或输入数据，上传 .txt 和 word 文件输入数据。右边支持复制数据，和下载数据。

7. 帮我排除的项目：不支持对外api对接，web端以外的形态，社交分享，历史记录。

8. 基本支持功能：上传文件txt,docx，上传清空。对结果txt下载，对结果复制，语音输入，语音输出。

请以 JSON 格式输出调研结果，格式如下：
\`\`\`json
{
  "keyword": "${keyword}",
  "productName": "产品名称",
  "description": "一句话产品介绍",
  "competitors": [
    {
      "name": "竞品名称",
      "url": "网址",
      "features": ["特点1", "特点2"]
    }
  ],
  "socialTopics": [
    {
      "platform": "Reddit/Quora",
      "topic": "话题标题",
      "votes": 100,
      "summary": "话题摘要"
    }
  ],
  "funFacts": [
    "趣味事实1",
    "趣味事实2"
  ],
  "features": {
    "basic": ["基本功能1", "基本功能2"],
    "competitive": ["竞品功能1", "竞品功能2"],
    "innovative": ["创新功能1", "创新功能2"]
  },
  "useCases": ["使用场景1", "使用场景2"],
  "asciiDesign": "ASCII 设计图"
}
\`\`\``;

  const response = await callOpenAI(
    CONFIG.researchModel,
    [{ role: 'user', content: prompt }],
    0.8
  );

  // 提取 JSON
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    logWarning('未能从响应中提取 JSON，保存原始响应');
    return {
      keyword,
      rawResponse: response,
    };
  }

  const researchData = JSON.parse(jsonMatch[1]);

  // 保存调研结果
  const outputPath = path.join(CONFIG.outputDir, keyword.replace(/\s+/g, '-'), 'research.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(researchData, null, 2));

  logSuccess(`调研完成，结果保存到: ${outputPath}`);
  return researchData;
}

/**
 * Phase 2: 内容调研（使用可配置的调研模型）
 */
async function phase2_contentResearch(keyword) {
  logPhase(2, `内容调研 (${CONFIG.researchModel})`);

  const prompt = `我现在在为网站 VibeTrans (https://vibetrans.com/) 规划关键词「${keyword}」工具落地页文案。

请帮我做以下调研：

1. 在 Google 搜索主关键词「${keyword}」并分析排名前 15 的网站，它们有哪些话题没有写到，但是是搜索这个关键词的用户特别关心的问题，帮我列出这些话题

2. 在 Quora.com 和 Reddit.com 上查询「${keyword}」相关的话题，找到高频提及和高投票的话题，帮我列出这些话题

3. 在 Quora.com、Reddit.com 和 Google 上查询「${keyword}」相关的话题，找出一些 fun facts 并帮我列出这些话题

4. 在 Google 搜索主关键词「${keyword}」并分析排名前 15 的网站，在页面文案上，哪些英文单词和短语出现的频率比较高，给我列出来前30个英文词汇（注意忽略掉介词、冠词等无意义的词汇）

请以 JSON 格式输出，格式如下：
\`\`\`json
{
  "contentGaps": [
    {
      "topic": "话题标题",
      "reason": "为什么用户关心",
      "competitors": ["缺少此内容的竞品"]
    }
  ],
  "socialTopics": [
    {
      "platform": "Reddit/Quora",
      "topic": "话题",
      "engagement": "高/中",
      "summary": "摘要"
    }
  ],
  "funFacts": ["事实1", "事实2"],
  "highFrequencyWords": [
    {
      "word": "单词",
      "frequency": "高/中",
      "context": "使用场景"
    }
  ]
}
\`\`\``;

  const response = await callOpenAI(
    CONFIG.researchModel,
    [{ role: 'user', content: prompt }],
    0.8
  );

  // 提取 JSON
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    logWarning('未能从内容调研响应中提取 JSON');
    return { rawResponse: response };
  }

  const contentResearchData = JSON.parse(jsonMatch[1]);

  // 保存内容调研结果
  const outputPath = path.join(CONFIG.outputDir, keyword.replace(/\s+/g, '-'), 'content-research.json');
  await fs.writeFile(outputPath, JSON.stringify(contentResearchData, null, 2));

  logSuccess(`内容调研完成，结果保存到: ${outputPath}`);
  return contentResearchData;
}

/**
 * Phase 3: 代码生成（使用现有 CLI 工具）
 */
async function phase3_generateCode(keyword, researchData) {
  logPhase(3, '代码生成');

  // 转换关键词为 slug 和 title
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const title = keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  logInfo(`生成工具: ${slug} (${title})`);

  // 调用现有的 CLI 工具
  try {
    execSync(`node scripts/create-translator-tool.js ${slug} "${title}"`, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
    });
    logSuccess('代码生成完成');
  } catch (error) {
    logError(`代码生成失败: ${error.message}`);
    throw error;
  }

  return { slug, title };
}

/**
 * Phase 4: 内容生成（使用可配置的内容模型）
 */
async function phase4_generateContent(keyword, researchData, contentResearchData) {
  logPhase(4, `内容生成 (${CONFIG.contentModel})`);

  const productPlan = `
产品名称：${researchData.productName || keyword}
一句话产品介绍：${researchData.description || ''}
亮点功能：
- 竞争对手功能：${researchData.features?.competitive?.join('、') || ''}
- 市场空白功能：${researchData.features?.innovative?.join('、') || ''}
`;

  const contentResearchSummary = `
内容调研结果：
- 内容空白：${contentResearchData.contentGaps?.map(g => g.topic).join('、') || ''}
- 社交热门话题：${contentResearchData.socialTopics?.map(t => t.topic).join('、') || ''}
- 趣味事实：${contentResearchData.funFacts?.join('、') || ''}
- 高频词汇：${contentResearchData.highFrequencyWords?.map(w => w.word).join(', ') || ''}
`;

  const prompt = `你现在是一个英文 SEO 文案写手，参考这个调研。帮我为「${keyword}」写英文落地页文案，不要给我emoji或者icon，要求如下：

1. 写 1 个 SEO 友好的 Title 和 Meta Description
   * 要清晰传达工具核心价值
   * 包含主关键词
   * Title 长度 ≤ 60 字符；Description 在 120–160 字符之间
   * 完成后计算这个section每个版本写了多少字符。

2. 写 1 个 SEO 友好的 H1 标题
   * 直接点明工具名称和主要用途
   * 自然包含目标关键词
   * 不出现品牌名
   * 完成后计算这个section每个版本写了多少单词。

3. 写 H1 下的描述（20–30 单词）
   * 简要说明工具功能和使用价值
   * 使用对话式语气，突出用户利益
   * 展示品牌词：VibeTrans
   * 完成后计算这个section每个版本写了多少单词。

4. 写 "What is XXXX" 板块
   * 标题为：What is XXXX
   * 正文以 "XXXX is …" 开头，正面回答问题
   * 扩展解释功能和应用场景，长度约 60 单词
   * 展示品牌词：VibeTrans
   * 完成后计算这个section写了多少单词。

5. 请帮我写Example板块的 title 和 description，40-50个单词左右

6. 写 "How to XXXX" 板块
   * 标题：How to XXXX
   * 标题下有一句简短说明
   * 写 3–4 个步骤，每个步骤：
     - 名称以动词开头（如 Upload a File）
     - 详细描述 40 词左右，强调操作细节
   * 语言保持简单易懂
   * 展示品牌词：VibeTrans
   * 完成后计算这个section写了多少单词。

7. 根据上面调研，写 2 个 Fun Facts
   * 每个 30 单词左右
   * 内容有趣、易懂，和工具或相关主题紧密相关
   * 写作中增加个人情感或主观评论（如"我喜欢或我认为"）
   * 写作中包含随意性或独特性（如俚语、轶事）
   * 展示品牌词：VibeTrans
   * 完成后计算这个section写了多少单词。

8. 根据上面调研，增加 4 个用户可能感兴趣的内容板块
   * 4个小板块的大板块标题
   * 每个包含标题 + 正文（约 50 单词）
   * 写作中增加个人情感或主观评论（如"我喜欢或我认为"）
   * 写作中包含随意性或独特性（如俚语、轶事）
   * 展示品牌词：VibeTrans
   * 文案要切入用户关注点：功能、痛点、应用场景或优势
   * 完成后计算这个section写了多少单词。

9. 请帮我写Highlight板块的文案，包含:
   * 板块的标题
   * 4个产品特点的文案，5选4（简单免费使用、数据准确性、数据隐私安全、AI的对上下文的理解、更多解释）
   * 为每个特点写一个简短的标题
   * 写40单词左右的说明
   * 展示品牌词：VibeTrans

10. 请帮我写6个用户评价，每个评价需要有:
    * 用户姓名：听起来像美国人的姓名
    * 角色：和使用产品的人群匹配的职业角色
    * 评价内容：2-3句话。要求：50-60个单词之间，像真人、有具体的产品使用细节！引入真实用户使用场景故事，包含前后的情感叙述。

11. 根据上面调研，请帮我写 6 个 FAQ（问题 + 答案）
    * 要求：
      1. 每个答案 30–80 词
      2. What is 问题必须以 "XXXX is …" 开头
      3. 不出现 What is [关键词] 问题
      4. How to 问题必须用 step-by-step 形式回答
      5. 语言直接、正面、清晰
      6. 完成后计算这个section写了多少单词
      7. 默认有的问题：这个软件免费吗？我们的隐私如何？

12. 请帮我写页面底部的CTA，包含标题和一句话描述，要求标题和内容都包含关键词和品牌词

请记住背景信息：

${productPlan}

${contentResearchSummary}

写作风格要求：
1. 使用通俗易懂的英文词汇，7 年级以下学生也能理解
2. 采用对话式、口语化语气，比如，使用 "You" 和 "VibeTrans"
3. 文案简洁直接，句子短，避免长难句
4. 每个板块尽可能多给细节，避免空洞描述
5. 标题清晰、吸引人，能快速传达核心价值
6. 每个板块内容避免重复，保持独特信息点
7. 文案中自然融入上面调研得到的高频关键词，但始终优先考虑可读性
8. 写作中增加个人情感或主观评论（如"我喜欢，我认为"）
9. 写作中包含随意性或独特性（如俚语、轶事）
10. 写作中包含更多个人经验或权威建议
11. 完成后告诉我你的在这个section写了多少单词

请以 JSON 格式输出，格式如下：
\`\`\`json
{
  "seo": {
    "title": "SEO标题",
    "titleLength": 50,
    "metaDescription": "Meta描述",
    "metaDescriptionLength": 150
  },
  "h1": {
    "title": "H1标题",
    "wordCount": 5
  },
  "heroDescription": {
    "content": "Hero描述",
    "wordCount": 25
  },
  "whatIs": {
    "title": "What is XXX",
    "content": "内容",
    "wordCount": 60
  },
  "example": {
    "title": "标题",
    "description": "描述",
    "wordCount": 45
  },
  "howTo": {
    "title": "How to XXX",
    "description": "简短说明",
    "steps": [
      {
        "name": "步骤名称",
        "description": "步骤描述",
        "wordCount": 40
      }
    ],
    "totalWordCount": 160
  },
  "funFacts": [
    {
      "content": "趣味事实",
      "wordCount": 30
    }
  ],
  "interestingSections": {
    "title": "大板块标题",
    "sections": [
      {
        "title": "小板块标题",
        "content": "内容",
        "wordCount": 50
      }
    ]
  },
  "highlights": {
    "title": "Highlight标题",
    "features": [
      {
        "title": "特点标题",
        "description": "描述",
        "wordCount": 40
      }
    ]
  },
  "testimonials": [
    {
      "name": "用户姓名",
      "role": "职业角色",
      "content": "评价内容",
      "wordCount": 55
    }
  ],
  "faqs": [
    {
      "question": "问题",
      "answer": "答案",
      "wordCount": 50
    }
  ],
  "cta": {
    "title": "CTA标题",
    "description": "CTA描述"
  }
}
\`\`\``;

  const response = await callOpenAI(
    CONFIG.contentModel,
    [{ role: 'user', content: prompt }],
    0.7
  );

  // 提取 JSON
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    logWarning('未能从内容生成响应中提取 JSON');
    return { rawResponse: response };
  }

  const contentData = JSON.parse(jsonMatch[1]);

  // 保存内容数据
  const outputPath = path.join(CONFIG.outputDir, keyword.replace(/\s+/g, '-'), 'content.json');
  await fs.writeFile(outputPath, JSON.stringify(contentData, null, 2));

  logSuccess(`内容生成完成，结果保存到: ${outputPath}`);
  return contentData;
}

/**
 * Phase 5: 生成翻译文件
 */
async function phase5_generateTranslations(keyword, contentData) {
  logPhase(5, '生成翻译文件（en.json 和 zh.json）');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const pageName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 生成英文翻译
  const enTranslation = {
    [`${pageName}Page`]: {
      title: contentData.seo.title,
      description: contentData.seo.metaDescription,
      h1: contentData.h1.title,
      heroDescription: contentData.heroDescription.content,
      whatIs: {
        title: contentData.whatIs.title,
        content: contentData.whatIs.content,
      },
      example: {
        title: contentData.example.title,
        description: contentData.example.description,
      },
      howTo: {
        title: contentData.howTo.title,
        description: contentData.howTo.description,
        steps: contentData.howTo.steps,
      },
      funFacts: contentData.funFacts,
      interestingSections: contentData.interestingSections,
      highlights: contentData.highlights,
      testimonials: contentData.testimonials,
      faqs: contentData.faqs,
      cta: contentData.cta,
    },
  };

  // 读取现有的英文翻译文件
  const enPath = path.join(CONFIG.messagesDir, 'en.json');
  let existingEn = {};
  try {
    const content = await fs.readFile(enPath, 'utf-8');
    existingEn = JSON.parse(content);
  } catch (error) {
    logWarning('未找到现有的 en.json 文件，将创建新文件');
  }

  // 合并翻译
  const mergedEn = { ...existingEn, ...enTranslation };
  await fs.writeFile(enPath, JSON.stringify(mergedEn, null, 2));
  logSuccess(`英文翻译已更新: ${enPath}`);

  // 生成中文翻译提示（需要手动翻译）
  logWarning('⚠️  请手动翻译 messages/zh.json 文件');
  logInfo(`添加以下键到 zh.json: ${pageName}Page`);

  return { pageName, enTranslation };
}

/**
 * Phase 6: 图片生成占位（需要手动操作或集成 Article Illustrator）
 */
async function phase6_generateImages(keyword) {
  logPhase(6, '图片生成（占位）');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');

  logWarning('⚠️  图片生成需要手动执行 Article Illustrator 流程');
  logInfo(`需要生成的图片：`);
  logInfo(`  - what-is-${slug}.webp`);
  logInfo(`  - ${slug}-how-to.webp`);
  logInfo(`  - ${slug}-fact-1.webp`);
  logInfo(`  - ${slug}-fact-2.webp`);
  logInfo(`保存路径: public/images/docs/`);
  logInfo(`默认使用 Deem4.0，失败则使用 NanoBanana`);

  return {
    images: [
      `what-is-${slug}.webp`,
      `${slug}-how-to.webp`,
      `${slug}-fact-1.webp`,
      `${slug}-fact-2.webp`,
    ],
  };
}

/**
 * Phase 7: SEO 配置（sitemap, navbar, footer）
 */
async function phase7_configureSEO(keyword, codeData) {
  logPhase(7, 'SEO 配置');

  const { slug, title } = codeData;

  logWarning('⚠️  SEO 配置需要手动添加：');
  logInfo(`  1. 更新 sitemap.xml，添加路径: /${slug}`);
  logInfo(`  2. 在 navbar 和 footer 的 "Fun Translator" 分类中添加: ${title}`);
  logInfo(`  3. 更新 explore other tools 配置`);
  logInfo(`  4. 生成 SEO 图片（og:image）`);

  return { slug, title };
}

/**
 * Phase 8: 质量检查和构建验证
 */
async function phase8_qualityCheck(keyword) {
  logPhase(8, '质量检查和构建验证');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');

  // 检查文件是否存在
  logInfo('检查生成的文件...');
  const pagePath = path.join(CONFIG.srcDir, 'app', '[locale]', '(marketing)', '(pages)', slug, 'page.tsx');
  const apiPath = path.join(CONFIG.srcDir, 'app', 'api', slug, 'route.ts');
  const enPath = path.join(CONFIG.messagesDir, 'en.json');

  const checks = [
    { path: pagePath, name: '页面文件' },
    { path: apiPath, name: 'API路由' },
    { path: enPath, name: '英文翻译' },
  ];

  for (const check of checks) {
    try {
      await fs.access(check.path);
      logSuccess(`✓ ${check.name} 存在`);
    } catch (error) {
      logError(`✗ ${check.name} 不存在: ${check.path}`);
    }
  }

  // 运行构建检查
  logInfo('运行 pnpm build 检查...');
  try {
    execSync('pnpm build', {
      stdio: 'inherit',
      cwd: ROOT_DIR,
    });
    logSuccess('构建成功！');
  } catch (error) {
    logError(`构建失败: ${error.message}`);
    logWarning('请修复构建错误后再继续');
    throw error;
  }

  return { success: true };
}

/**
 * 主函数
 */
async function main() {
  const keyword = process.argv[2];

  if (!keyword) {
    logError('请提供关键词参数');
    logInfo('使用方法: node scripts/auto-tool-generator.js "alien text generator"');
    process.exit(1);
  }

  log('\n🚀 VibeTrans 自动化工具生成器', 'bright');
  logInfo(`关键词: ${keyword}`);
  logInfo(`调研模型: ${CONFIG.researchModel}`);
  logInfo(`内容模型: ${CONFIG.contentModel}`);
  logInfo(`输出目录: ${CONFIG.outputDir}`);

  try {
    // Phase 1: 产品调研
    const researchData = await phase1_research(keyword);

    // Phase 2: 内容调研
    const contentResearchData = await phase2_contentResearch(keyword);

    // Phase 3: 代码生成
    const codeData = await phase3_generateCode(keyword, researchData);

    // Phase 4: 内容生成
    const contentData = await phase4_generateContent(keyword, researchData, contentResearchData);

    // Phase 5: 生成翻译文件
    const translationData = await phase5_generateTranslations(keyword, contentData);

    // Phase 6: 图片生成（占位）
    const imageData = await phase6_generateImages(keyword);

    // Phase 7: SEO 配置（占位）
    const seoData = await phase7_configureSEO(keyword, codeData);

    // Phase 8: 质量检查
    // await phase8_qualityCheck(keyword);

    // 完成
    log('\n' + '='.repeat(60), 'green');
    log('🎉 工具生成完成！', 'green');
    log('='.repeat(60), 'green');

    logInfo('\n后续步骤：');
    logInfo('1. 手动翻译 messages/zh.json');
    logInfo('2. 运行 Article Illustrator 生成图片');
    logInfo('3. 更新 sitemap, navbar, footer');
    logInfo('4. 运行 pnpm build 验证构建');
    logInfo('5. 提交代码并上线');

  } catch (error) {
    logError(`\n生成失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行主函数
main();
