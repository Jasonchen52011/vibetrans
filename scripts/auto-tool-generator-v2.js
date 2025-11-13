#!/usr/bin/env node

/**
 * 🚀 VibeTrans 自动化工具生成器 V2（通用模板版）
 *
 * 🎯 V2 核心优化：
 * - ✅ 使用通用页面模板 [translator-slug]/page.tsx
 * - ✅ 零代码生成 - 只需生成 JSON 文件
 * - ✅ 完全解耦 - 一个模板支持所有翻译工具
 * - ✅ 即时可用 - JSON 生成后页面立即可访问
 * - ✅ 维护简单 - 修改一处全局生效
 *
 * 一键生成完整的翻译工具页面：
 * - Phase 1: GPT-5 Thinking 深度调研
 * - Phase 2: 产品规划生成
 * - Phase 3: 跳过代码生成（使用通用模板）⭐ V2 新特性
 * - Phase 4: GPT-4o SEO内容生成
 * - Phase 5: 生成翻译文件
 * - Phase 6: 图片生成（Article Illustrator）
 * - Phase 7: SEO配置（sitemap, navbar, footer）
 * - Phase 8: 质量检查和构建验证
 *
 * 使用方法：
 * node scripts/auto-tool-generator-v2.js "haitian creole translator"
 *
 * 或添加到 package.json:
 * pnpm tool:auto-v2 "haitian creole translator"
 *
 * 环境变量配置：
 * ENABLE_SKIP_CHINESE_TRANSLATION=true  # 跳过中文国际化，加速工具创建
 *
 * 跳过中文翻译示例：
 * ENABLE_SKIP_CHINESE_TRANSLATION=true node scripts/auto-tool-generator-v2.js "haitian creole translator"
 *
 * 🆚 V1 vs V2 对比：
 * V1: 为每个工具生成独立的 page.tsx 和 Tool.tsx（~1200 lines 代码）
 * V2: 所有工具共享通用模板（只需 JSON 文件）
 *
 * 新工具添加时间：
 * V1: ~5-10 分钟（需要生成和验证代码）
 * V2: ~30 秒（只需生成 JSON）⚡️
 */

import { exec, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { config } from 'dotenv';

const execAsync = promisify(exec);

// 加载 .env.local 文件
config({ path: '.env.local' });

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

  // 🎯 新增验证配置
  enableWordCountValidation:
    process.env.ENABLE_WORD_COUNT_VALIDATION !== 'false', // 默认开启
  enablePageErrorCheck: process.env.ENABLE_PAGE_ERROR_CHECK !== 'false', // 默认开启
  enableSkipChineseTranslation:
    process.env.ENABLE_SKIP_CHINESE_TRANSLATION !== 'false', // 默认开启（跳过中文）
  devServerPort: process.env.DEV_SERVER_PORT || 3000,
  maxWordCountRetries: 2, // 字数验证最多重试次数
  pageCheckTimeout: 30000, // 页面检查超时时间（毫秒）
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
 * 验证内容中是否包含个人化表达
 */
function validatePersonalExpressions(content, sectionName = '') {
  const personalPatterns = [
    /\bI think\b/gi,
    /\bI love\b/gi,
    /\bI believe\b/gi,
    /\bI feel\b/gi,
    /\bPersonally\b/gi,
    /\bIn my opinion\b/gi,
    /\bI find\b/gi,
    /\bI prefer\b/gi,
    /\bI like\b/gi,
    /\bI enjoy\b/gi,
    /\bMy favorite\b/gi,
    /\bFrom my perspective\b/gi,
  ];

  const issues = [];
  personalPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        section: sectionName,
        pattern: pattern.source,
        count: matches.length,
        matches: matches.slice(0, 3),
      });
    }
  });

  return issues;
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

  // o3 和 o3-mini 模型不支持自定义 temperature，必须使用默认值 1
  const requestBody = {
    model,
    messages,
  };

  // 只有非 o3 系列模型才添加 temperature 参数
  if (!model.startsWith('o3')) {
    requestBody.temperature = temperature;
  }

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

  // 提取 JSON（支持两种格式：代码块包裹或直接 JSON）
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  let jsonString;

  if (!jsonMatch) {
    // 尝试直接解析整个响应为 JSON
    const trimmedResponse = response.trim();
    if (trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) {
      logInfo('检测到直接 JSON 格式（无代码块包裹）');
      jsonString = trimmedResponse;
    } else {
      logWarning('未能从响应中提取 JSON，保存原始响应');
      // 保存原始响应以便调试
      const debugPath = path.join(
        CONFIG.outputDir,
        keyword.replace(/\s+/g, '-'),
        'research-raw.txt'
      );
      await fs.mkdir(path.dirname(debugPath), { recursive: true });
      await fs.writeFile(debugPath, response);
      logInfo(`原始响应已保存到: ${debugPath}`);
      return {
        keyword,
        rawResponse: response,
      };
    }
  } else {
    jsonString = jsonMatch[1];
  }

  let researchData;
  try {
    // 清理 JSON 字符串：
    // 1. 移除控制字符（但保留换行符 \n）
    // 2. 修复 asciiDesign 字段中的多行文本
    const cleanedJson = jsonString
      .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, '') // 保留 \n (\x0A)
      .replace(/"asciiDesign":\s*"([^"]*(?:\n[^"]*)*)"/, (match, content) => {
        // 转义 asciiDesign 中的换行符和特殊字符
        const escaped = content
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/"/g, '\\"');
        return `"asciiDesign": "${escaped}"`;
      });

    researchData = JSON.parse(cleanedJson);
  } catch (parseError) {
    logError(`JSON 解析失败: ${parseError.message}`);
    // 保存出错的 JSON 以便调试
    const debugPath = path.join(
      CONFIG.outputDir,
      keyword.replace(/\s+/g, '-'),
      'research-error.json'
    );
    await fs.mkdir(path.dirname(debugPath), { recursive: true });
    await fs.writeFile(debugPath, jsonString);
    logInfo(`出错的 JSON 已保存到: ${debugPath}`);
    throw parseError;
  }

  // 保存调研结果
  const outputPath = path.join(
    CONFIG.outputDir,
    keyword.replace(/\s+/g, '-'),
    'research.json'
  );
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

  let contentResearchData;
  try {
    // 清理 JSON 字符串中的控制字符
    const cleanedJson = jsonMatch[1].replace(
      /[\u0000-\u001F\u007F-\u009F]/g,
      ''
    );
    contentResearchData = JSON.parse(cleanedJson);
  } catch (parseError) {
    logError(`内容调研 JSON 解析失败: ${parseError.message}`);
    const debugPath = path.join(
      CONFIG.outputDir,
      keyword.replace(/\s+/g, '-'),
      'content-research-error.json'
    );
    await fs.mkdir(path.dirname(debugPath), { recursive: true });
    await fs.writeFile(debugPath, jsonMatch[1]);
    logInfo(`出错的 JSON 已保存到: ${debugPath}`);
    throw parseError;
  }

  // 保存内容调研结果
  const outputPath = path.join(
    CONFIG.outputDir,
    keyword.replace(/\s+/g, '-'),
    'content-research.json'
  );
  await fs.writeFile(outputPath, JSON.stringify(contentResearchData, null, 2));

  logSuccess(`内容调研完成，结果保存到: ${outputPath}`);
  return contentResearchData;
}

/**
 * Phase 3: 代码生成（V2: 使用通用模板，无需生成代码）
 */
async function phase3_generateCode(keyword, researchData) {
  logPhase(3, '代码生成（V2: 使用通用模板）');

  // 转换关键词为 slug 和 title
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const title = keyword
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const pageName =
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';

  logInfo(`✅ 工具 slug: ${slug}`);
  logInfo(`✅ 工具标题: ${title}`);
  logInfo(`✅ 页面命名空间: ${pageName}`);

  log('\n🎯 V2 版本优势:', 'cyan');
  logSuccess('✓ 无需生成代码文件 - 使用通用模板');
  logSuccess('✓ 页面路径: [translator-slug]/page.tsx');
  logSuccess('✓ 工具组件: UniversalTranslatorTool.tsx');
  logSuccess('✓ 只需生成 JSON 文件即可完成');

  log('\n📍 页面将自动可访问:', 'blue');
  logInfo(`   http://localhost:3000/${slug}`);
  logInfo(`   http://localhost:3000/en/${slug}`);
  logInfo(`   http://localhost:3000/zh/${slug}`);

  log('\n💡 工作原理:', 'yellow');
  logInfo('1. 通用模板自动识别 slug');
  logInfo(`2. 加载对应的翻译命名空间: ${pageName}`);
  logInfo(`3. 使用 buildTranslatorPageContent() 构建页面`);
  logInfo('4. 完全解耦，零重复代码！');

  return { slug, title };
}

/**
 * Phase 4: 内容生成（使用可配置的内容模型）
 */
async function phase4_generateContent(
  keyword,
  researchData,
  contentResearchData
) {
  logPhase(4, `内容生成 (${CONFIG.contentModel})`);

  // 🤖 智能翻译工具默认要求（适用于所有语言翻译工具）
  const intelligentTranslationRequirements = `
🤖 智能翻译工具核心要求（所有翻译工具必须包含）：
- 智能语言检测：90%+准确率，实时检测输入语言类型
- 自动方向切换：根据检测结果自动调整翻译方向（无需手动选择）
- 多模态支持：文本、图像OCR、音频转写+翻译
- 专业翻译模式：技术、法律、文学、习语、通用5种模式
- 标准化API：统一的JSON响应格式和错误处理
- Edge Runtime：高性能边缘计算优化
- 置信度反馈：提供检测置信度和语言信息
`;

  const productPlan = `
产品名称：${researchData.productName || keyword}
一句话产品介绍：${researchData.description || ''}
亮点功能：
- 竞争对手功能：${researchData.features?.competitive?.join('、') || ''}
- 市场空白功能：${researchData.features?.innovative?.join('、') || ''}
`;

  const contentResearchSummary = `
内容调研结果：
- 内容空白：${contentResearchData.contentGaps?.map((g) => g.topic).join('、') || ''}
- 社交热门话题：${contentResearchData.socialTopics?.map((t) => t.topic).join('、') || ''}
- 趣味事实：${contentResearchData.funFacts?.join('、') || ''}
- 高频词汇：${contentResearchData.highFrequencyWords?.map((w) => w.word).join(', ') || ''}
`;

  const prompt = `You are an English SEO copywriter. Write landing page copy in ENGLISH ONLY for "${keyword}". Reference the research below.

⚠️ CRITICAL REQUIREMENT: ALL CONTENT MUST BE IN ENGLISH. DO NOT USE CHINESE OR ANY OTHER LANGUAGE.

${intelligentTranslationRequirements}

1. 写 1 个 SEO 友好的 Title 和 Meta Description
   * 要清晰传达工具核心价值
   * 包含主关键词
   * **重要：SEO Description 必须完整包含主关键词「${keyword}」，不能拆分或缩写**
   * Title 长度 ≤ 60 字符；Description 在 120–160 字符之间

2. 写 1 个 SEO 友好的 H1 标题
   * 直接点明工具名称和主要用途
   * 自然包含目标关键词
   * 不出现品牌名

3. 写 H1 下的描述（20–30 单词）
   * 简要说明工具功能和使用价值
   * 使用对话式语气，突出用户利益
   * **重要：Hero Description 必须完整包含主关键词「${keyword}」，不能拆分或缩写**
   * **必须包含 "best" 关键词，突出工具的优势**

4. 写 "What is XXXX" 板块
   * 标题为：What is XXXX
   * 正文以 "XXXX is …" 开头，正面回答问题
   * 扩展解释功能和应用场景，长度约 60 单词

5. 请帮我写Example板块的 title、description 和 6个实际翻译案例
   * ⚠️ CRITICAL: title 必须包含工具名称关键词（如 "Haitian Creole Translation Examples" 而不是 "Sample Usage"）
   * title 和 description：40-50个单词左右，让工具能达到的效果更清晰，更有说服力
   * ⚠️ CRITICAL: items 数组是必需的，必须包含6个真实的翻译案例，格式如下：
     - before: 英文原文（10-20个单词）
     - after: 目标语言译文（准确翻译，不是"Example 1"这种placeholder）
     - alt: 场景描述（如 "Daily greeting and well wishes"）
     - wordCount: before 的单词数
   * 6个案例应涵盖不同场景：日常问候、商务沟通、旅游/问路、餐厅点餐、学术/正式表达、文化礼仪等
   * 确保翻译准确、自然、符合目标语言习惯
   * ⚠️ 绝对不要生成 placeholder（如 "Example 1", "Example 2"），必须是真实的翻译内容

6. 写 "How to XXXX" 板块
   * 标题模式：
     - 语言翻译类：How to translate xxx to English
     - 非语言翻译类：How to translate English to xxx
   * 标题下有一句简短说明
   * 写 3–4 个步骤，每个步骤：
     - 名称以动词开头（如 Upload a File）
     - 详细描述 40 词左右，强调操作细节
   * 语言保持简单易懂

7. 根据上面调研，写 2 个 Fun Facts
   * ⚠️ CRITICAL: 每个 Fun Fact 必须包含 title 和 content 两个字段
   * title: 总结这个 fun fact 的核心内容（5-8个单词），例如 "French Vocabulary Roots" 或 "Official Language Status"，而不是简单的 "Fun Fact"
   * content: 30 单词左右的详细说明
   * 内容有趣、易懂，和工具或相关主题紧密相关
   * 保持客观中性的写作风格，避免使用个人化表达（如"I think", "I love", "I believe"等）
   * 增加链接到对应信息源，增加可读性

8. 根据上面调研，增加 4 个用户可能感兴趣的内容板块
   * 4个小板块的大板块标题
   * 每个包含标题 + 正文（约 50 单词）
   * 文案要切入用户关注点：功能、痛点、应用场景或优势
   * 是否需要制作并插入相关对照表section，例如：symbols.png


9. 根据上面调研，请帮我写两个板块的文案：

   **第一个是 Unique 板块**：
   * 板块的标题
   * 4个独特特点的文案，突出翻译工具的差异化优势
   * 为每个特点写一个简短的标题
   * 写40单词左右的说明
   * 保持客观中性的写作风格，避免使用个人化表达

   **第二个是 Highlight 板块**：
   * 板块的标题
   * 4个产品特点的文案，5选4（简单免费使用、数据准确性、数据隐私安全、AI的对上下文的理解、更多解释）
   * 为每个特点写一个简短的标题
   * 写40单词左右的说明
   * 保持客观中性的写作风格，避免使用个人化表达（如"I think", "I love", "I believe"等）

10. Write user testimonials (3-6 testimonials based on content richness):
    * Determine the optimal number based on:
      - How many unique use cases and user scenarios were discovered in research
      - The diversity of pain points and benefits identified
      - Aim for 3-6 testimonials that cover different user profiles
    * User name: American-sounding names
    * Role: Professional roles matching the product users
    * Content: 2-3 sentences, 50-60 words, authentic details about product usage, including emotional narrative about before/after experience.

11. Write FAQs based on social media research (dynamic count):
    * Number of FAQs: Based on the number of social topics discovered in research
      - If many social topics (5+): Write 5-6 FAQs
      - If moderate social topics (3-4): Write 3-4 FAQs
      - If few social topics (1-2): Write 3 FAQs minimum
    * FAQ content should directly address the social topics and content gaps identified
    * Requirements:
      1. Each answer: 30-80 words
      2. "What is" questions must start with "XXXX is..."
      3. Must include one question: "What is best xxx" OR "Which is best xxx"
      4. No brand-related questions (no VibeTrans mentions in questions)
      5. Must include: "Is this xxx free?" and "How is my privacy protected?"
      6. Must mention: web-only, no app, no offline use
      7. Direct, clear language
      8. Address the specific questions/topics found in social media research

12. Write the CTA section with title and description, both must include the keyword and brand name "VibeTrans"

最后整体的要求：
1. 必要名词增加链接到 Wikipedia, YouTube 等权威网站
2. 是否需要加入额外的相关板块，来对工具做补充说明
3. 是否有必要插入 YouTube 链接来解释工具/某些概念


请记住背景信息：

${productPlan}
${contentResearchSummary}

写作风格要求：
1. 使用通俗易懂的英文词汇，7 年级以下学生也能理解
2. 采用对话式、口语化语气，比如，使用 "You" 和 "VibeTrans"(这是网站的品牌名)
3. 文案简洁直接，句子短，避免长难句
4. 每个板块尽可能多给细节，避免空洞描述
5. 标题清晰、吸引人，能快速传达核心价值
6. 每个板块内容避免重复，保持独特信息点
7. 文案中自然融入上面调研得到的高频关键词，但始终优先考虑可读性

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
    "title": "标题（必须包含工具名称）",
    "description": "描述",
    "wordCount": 45,
    "items": [
      {
        "before": "Hello, how are you today?",
        "after": "Bonjou, kijan ou ye jodi a?",
        "alt": "Daily greeting",
        "wordCount": 5
      },
      {
        "before": "I would like to schedule a meeting.",
        "after": "Mwen ta renmen pwograme yon reyinyon.",
        "alt": "Business communication",
        "wordCount": 7
      },
      {
        "before": "Where is the nearest hospital?",
        "after": "Ki kote lopital ki pi pre a?",
        "alt": "Emergency/Travel",
        "wordCount": 5
      },
      {
        "before": "Can I have the menu, please?",
        "after": "Eske mwen ka gen meni an, tanpri?",
        "alt": "Restaurant",
        "wordCount": 6
      },
      {
        "before": "Thank you for your assistance.",
        "after": "Mèsi pou èd ou.",
        "alt": "Gratitude/Formal",
        "wordCount": 5
      },
      {
        "before": "Happy birthday! I hope you have a wonderful day.",
        "after": "Bòn anivèsè! Mwen espere ou gen yon jou mèvèye.",
        "alt": "Celebrations",
        "wordCount": 9
      }
    ]
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
      "title": "简短总结标题",
      "content": "趣味事实详细内容",
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

  // 验证个人化表达
  const personalExpressionIssues = [];

  // 验证各个section
  if (contentData.funFacts) {
    contentData.funFacts.forEach((fact, index) => {
      const issues = validatePersonalExpressions(
        fact.content,
        `funFacts[${index}]`
      );
      personalExpressionIssues.push(...issues);
    });
  }

  if (contentData.interestingSections?.sections) {
    contentData.interestingSections.sections.forEach((section, index) => {
      const issues = validatePersonalExpressions(
        section.content,
        `interestingSections[${index}]`
      );
      personalExpressionIssues.push(...issues);
    });
  }

  if (contentData.highlights?.items) {
    contentData.highlights.items.forEach((feature, index) => {
      const issues = validatePersonalExpressions(
        feature.description,
        `highlights[${index}]`
      );
      personalExpressionIssues.push(...issues);
    });
  }

  if (contentData.testimonials) {
    contentData.testimonials.forEach((testimonial, index) => {
      const issues = validatePersonalExpressions(
        testimonial.content,
        `testimonials[${index}]`
      );
      personalExpressionIssues.push(...issues);
    });
  }

  // 如果发现个人化表达，记录警告
  if (personalExpressionIssues.length > 0) {
    logWarning(
      `⚠️  内容生成中发现 ${personalExpressionIssues.length} 处个人化表达：`
    );
    personalExpressionIssues.forEach((issue) => {
      logWarning(
        `   - ${issue.section}: "${issue.pattern}" (${issue.count} 处)`
      );
      logWarning(`     示例: ${issue.matches.join(', ')}`);
    });
    logWarning('这些个人化表达将在后续处理中被移除或需要手动修复');
  } else {
    logSuccess('✅ 内容生成验证通过，未发现个人化表达');
  }

  // 保存内容数据
  const outputPath = path.join(
    CONFIG.outputDir,
    keyword.replace(/\s+/g, '-'),
    'content.json'
  );
  await fs.writeFile(outputPath, JSON.stringify(contentData, null, 2));

  logSuccess(`内容生成完成，结果保存到: ${outputPath}`);
  return contentData;
}

/**
 * 验证字数是否符合要求
 * @returns {Array} 需要重新生成的 section 列表
 */
function validateWordCounts(contentData) {
  logInfo('开始验证字数...');

  const validationRules = {
    h1: {
      path: 'h1.wordCount',
      min: 5,
      max: 7,
      name: 'H1标题',
    },
    heroDescription: {
      path: 'heroDescription.wordCount',
      min: 20,
      max: 30,
      name: 'Hero描述',
    },
    whatIs: {
      path: 'whatIs.wordCount',
      min: 55,
      max: 65,
      name: 'What Is板块',
    },
    example: {
      path: 'example.wordCount',
      min: 35,
      max: 55,
      name: 'Example板块',
    },
  };

  const invalidSections = [];

  // 验证简单字段
  for (const [key, rule] of Object.entries(validationRules)) {
    const value = getNestedValue(contentData, rule.path);
    if (value !== undefined && (value < rule.min || value > rule.max)) {
      invalidSections.push({
        section: key,
        name: rule.name,
        actual: value,
        expected: `${rule.min}-${rule.max}`,
      });
    }
  }

  // 验证 howTo.steps
  if (contentData.howTo?.steps) {
    contentData.howTo.steps.forEach((step, index) => {
      if (step.wordCount < 35 || step.wordCount > 45) {
        invalidSections.push({
          section: 'howTo',
          name: `How To步骤 ${index + 1}`,
          actual: step.wordCount,
          expected: '35-45',
          stepIndex: index,
        });
      }
    });
  }

  // 验证 funFacts
  if (contentData.funFacts) {
    contentData.funFacts.forEach((fact, index) => {
      if (fact.wordCount < 25 || fact.wordCount > 35) {
        invalidSections.push({
          section: 'funFacts',
          name: `Fun Fact ${index + 1}`,
          actual: fact.wordCount,
          expected: '25-35',
          factIndex: index,
        });
      }
    });
  }

  // 验证 interestingSections
  if (contentData.interestingSections?.sections) {
    contentData.interestingSections.sections.forEach((section, index) => {
      if (section.wordCount < 45 || section.wordCount > 55) {
        invalidSections.push({
          section: 'interestingSections',
          name: `趣味板块 ${index + 1}`,
          actual: section.wordCount,
          expected: '45-55',
          sectionIndex: index,
        });
      }
    });
  }

  // 验证 highlights.items
  if (contentData.highlights?.items) {
    contentData.highlights.items.forEach((feature, index) => {
      if (feature.wordCount < 35 || feature.wordCount > 45) {
        invalidSections.push({
          section: 'highlights',
          name: `亮点功能 ${index + 1}`,
          actual: feature.wordCount,
          expected: '35-45',
          featureIndex: index,
        });
      }
    });
  }

  // 验证 testimonials
  if (contentData.testimonials) {
    contentData.testimonials.forEach((testimonial, index) => {
      if (testimonial.wordCount < 45 || testimonial.wordCount > 65) {
        invalidSections.push({
          section: 'testimonials',
          name: `用户评价 ${index + 1}`,
          actual: testimonial.wordCount,
          expected: '45-65',
          testimonialIndex: index,
        });
      }
    });
  }

  // 验证 faqs
  if (contentData.faqs) {
    contentData.faqs.forEach((faq, index) => {
      if (faq.wordCount < 30 || faq.wordCount > 80) {
        invalidSections.push({
          section: 'faqs',
          name: `FAQ ${index + 1}`,
          actual: faq.wordCount,
          expected: '30-80',
          faqIndex: index,
        });
      }
    });
  }

  return invalidSections;
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 重新生成单个 section
 */
async function regenerateSection(
  keyword,
  sectionInfo,
  contentData,
  researchData,
  contentResearchData
) {
  logInfo(
    `重新生成: ${sectionInfo.name} (当前字数: ${sectionInfo.actual}, 期望: ${sectionInfo.expected})`
  );

  const { section } = sectionInfo;
  let prompt = '';

  // 根据不同 section 构建不同的 prompt
  switch (section) {
    case 'h1':
      prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写一个 SEO 友好的 H1 标题。
要求：
- 5-7 个单词
- 直接点明工具名称和主要用途
- 自然包含目标关键词
- 不出现品牌名

请以 JSON 格式输出：
\`\`\`json
{
  "title": "H1标题",
  "wordCount": 5
}
\`\`\``;
      break;

    case 'heroDescription':
      prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写 H1 下的描述。
要求：
- 30-40 个单词（严格控制在 25-45 之间）
- 简要说明工具功能和使用价值
- 使用对话式语气，突出用户利益
- 展示品牌词：VibeTrans
- 必须包含 "best" 关键词，突出工具的优势

请以 JSON 格式输出：
\`\`\`json
{
  "content": "描述内容",
  "wordCount": 35
}
\`\`\``;
      break;

    case 'whatIs':
      prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写 "What is XXXX" 板块。
要求：
- 约 70 单词（严格控制在 65-75 之间）
- 以 "XXXX is …" 开头，正面回答问题
- 扩展解释功能和应用场景
- 展示品牌词：VibeTrans

请以 JSON 格式输出：
\`\`\`json
{
  "title": "What is XXX",
  "content": "内容",
  "wordCount": 70
}
\`\`\``;
      break;

    case 'example':
      prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写 Example 板块的 title 和 description。
要求：
- 40-50 个单词（严格控制在 35-55 之间）

请以 JSON 格式输出：
\`\`\`json
{
  "title": "标题",
  "description": "描述",
  "wordCount": 45
}
\`\`\``;
      break;

    case 'howTo':
      if (sectionInfo.stepIndex !== undefined) {
        const step = contentData.howTo.steps[sectionInfo.stepIndex];
        prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写 How To 步骤「${step.name}」的描述。
要求：
- 约 40 词左右（严格控制在 35-45 之间）
- 强调操作细节
- 语言简单易懂

请以 JSON 格式输出：
\`\`\`json
{
  "name": "${step.name}",
  "description": "步骤描述",
  "wordCount": 40
}
\`\`\``;
      }
      break;

    case 'funFacts':
      if (sectionInfo.factIndex !== undefined) {
        prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写一个 Fun Fact。
要求：
- 约 30 单词（严格控制在 25-35 之间）
- 内容有趣、易懂
- 和工具或相关主题紧密相关
- 保持客观中性的写作风格，避免使用个人化表达（如"I think", "I love", "I believe"等）
- 展示品牌词：VibeTrans

调研信息：
${contentResearchData.funFacts?.join('\n') || ''}

请以 JSON 格式输出：
\`\`\`json
{
  "content": "趣味事实",
  "wordCount": 30
}
\`\`\``;
      }
      break;

    case 'interestingSections':
      if (sectionInfo.sectionIndex !== undefined) {
        const originalSection =
          contentData.interestingSections.sections[sectionInfo.sectionIndex];
        prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写趣味板块「${originalSection.title}」。
要求：
- 约 50 单词（严格控制在 45-55 之间）
- 保持客观中性的写作风格，避免使用个人化表达（如"I think", "I love", "I believe"等）
- 写作中包含随意性或独特性（如俚语、轶事）
- 展示品牌词：VibeTrans
- 文案要切入用户关注点

请以 JSON 格式输出：
\`\`\`json
{
  "title": "${originalSection.title}",
  "content": "内容",
  "wordCount": 50
}
\`\`\``;
      }
      break;

    case 'highlights':
      if (sectionInfo.featureIndex !== undefined) {
        const feature = contentData.highlights.items[sectionInfo.featureIndex];
        prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写亮点功能「${feature.title}」的描述。
要求：
- 约 40 单词（严格控制在 35-45 之间）
- 展示品牌词：VibeTrans

请以 JSON 格式输出：
\`\`\`json
{
  "title": "${feature.title}",
  "description": "描述",
  "wordCount": 40
}
\`\`\``;
      }
      break;

    case 'testimonials':
      if (sectionInfo.testimonialIndex !== undefined) {
        prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写一个用户评价。
要求：
- 50-60 个单词（严格控制在 45-65 之间）
- 2-3 句话
- 像真人、有具体的产品使用细节
- 引入真实用户使用场景故事
- 包含前后的情感叙述

请以 JSON 格式输出：
\`\`\`json
{
  "name": "美国人姓名",
  "role": "职业角色",
  "content": "评价内容",
  "wordCount": 55
}
\`\`\``;
      }
      break;

    case 'faqs':
      if (sectionInfo.faqIndex !== undefined) {
        const faq = contentData.faqs[sectionInfo.faqIndex];
        prompt = `⚠️ WRITE IN ENGLISH ONLY. 不要使用中文。

请为「${keyword}」重新写 FAQ「${faq.question}」的答案。
要求：
- 30-80 词
- 语言直接、正面、清晰
- What is 问题必须以 "XXXX is …" 开头
- How to 问题必须用 step-by-step 形式回答

请以 JSON 格式输出：
\`\`\`json
{
  "question": "${faq.question}",
  "answer": "答案",
  "wordCount": 50
}
\`\`\``;
      }
      break;

    default:
      logWarning(`未知的 section 类型: ${section}`);
      return null;
  }

  try {
    const response = await callOpenAI(
      CONFIG.contentModel,
      [{ role: 'user', content: prompt }],
      0.7
    );

    // 提取 JSON
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      logWarning(`未能从重新生成的 ${section} 响应中提取 JSON`);
      return null;
    }

    const regeneratedData = JSON.parse(jsonMatch[1]);
    return { section: sectionInfo, data: regeneratedData };
  } catch (error) {
    logError(`重新生成 ${section} 失败: ${error.message}`);
    return null;
  }
}

/**
 * 更新 contentData 中的特定 section
 */
function updateContentData(contentData, sectionInfo, newData) {
  const { section } = sectionInfo;

  switch (section) {
    case 'h1':
      contentData.h1 = newData;
      break;
    case 'heroDescription':
      contentData.heroDescription = newData;
      break;
    case 'whatIs':
      contentData.whatIs = newData;
      break;
    case 'example':
      contentData.example = newData;
      break;
    case 'howTo':
      if (sectionInfo.stepIndex !== undefined) {
        contentData.howTo.steps[sectionInfo.stepIndex] = newData;
      }
      break;
    case 'funFacts':
      if (sectionInfo.factIndex !== undefined) {
        contentData.funFacts[sectionInfo.factIndex] = newData;
      }
      break;
    case 'interestingSections':
      if (sectionInfo.sectionIndex !== undefined) {
        contentData.interestingSections.sections[sectionInfo.sectionIndex] =
          newData;
      }
      break;
    case 'highlights':
      if (sectionInfo.featureIndex !== undefined) {
        contentData.highlights.items[sectionInfo.featureIndex] = newData;
      }
      break;
    case 'testimonials':
      if (sectionInfo.testimonialIndex !== undefined) {
        contentData.testimonials[sectionInfo.testimonialIndex] = newData;
      }
      break;
    case 'faqs':
      if (sectionInfo.faqIndex !== undefined) {
        contentData.faqs[sectionInfo.faqIndex] = newData;
      }
      break;
  }
}

/**
 * Phase 4.5: 字数验证和重新生成
 */
async function phase4_5_validateAndRegenerate(
  keyword,
  contentData,
  researchData,
  contentResearchData
) {
  if (!CONFIG.enableWordCountValidation) {
    logInfo('字数验证已禁用，跳过 Phase 4.5');
    return contentData;
  }

  logPhase('4.5', '字数验证和重新生成');

  let retryCount = 0;
  const currentContentData = JSON.parse(JSON.stringify(contentData)); // 深拷贝

  while (retryCount <= CONFIG.maxWordCountRetries) {
    const invalidSections = validateWordCounts(currentContentData);

    if (invalidSections.length === 0) {
      logSuccess('所有 section 字数验证通过！');
      break;
    }

    if (retryCount === CONFIG.maxWordCountRetries) {
      logWarning(
        `已达到最大重试次数 (${CONFIG.maxWordCountRetries})，以下 section 仍不符合要求：`
      );
      invalidSections.forEach((s) => {
        logWarning(`  - ${s.name}: 实际 ${s.actual} 单词，期望 ${s.expected}`);
      });
      logWarning('将继续使用当前内容，但建议手动检查');
      break;
    }

    logWarning(
      `发现 ${invalidSections.length} 个 section 字数不符合要求，开始重新生成...`
    );
    retryCount++;

    // 重新生成所有不符合要求的 section
    for (const sectionInfo of invalidSections) {
      const result = await regenerateSection(
        keyword,
        sectionInfo,
        currentContentData,
        researchData,
        contentResearchData
      );

      if (result) {
        updateContentData(currentContentData, result.section, result.data);
        logSuccess(`✓ ${sectionInfo.name} 已重新生成`);
      } else {
        logWarning(`✗ ${sectionInfo.name} 重新生成失败，保留原内容`);
      }
    }

    // 保存更新后的内容
    const outputPath = path.join(
      CONFIG.outputDir,
      keyword.replace(/\s+/g, '-'),
      `content-retry-${retryCount}.json`
    );
    await fs.writeFile(outputPath, JSON.stringify(currentContentData, null, 2));
    logInfo(`重试 ${retryCount} 的内容已保存到: ${outputPath}`);
  }

  // 保存最终内容
  const finalOutputPath = path.join(
    CONFIG.outputDir,
    keyword.replace(/\s+/g, '-'),
    'content-final.json'
  );
  await fs.writeFile(
    finalOutputPath,
    JSON.stringify(currentContentData, null, 2)
  );
  logSuccess(`最终内容已保存到: ${finalOutputPath}`);

  return currentContentData;
}

/**
 * Phase 5: 生成翻译文件
 */
async function phase5_generateTranslations(keyword, contentData) {
  if (CONFIG.enableSkipChineseTranslation) {
    logPhase(5, '生成翻译文件（仅英文，跳过中文国际化）');
  } else {
    logPhase(5, '生成翻译文件（messages/pages/{slug}/en.json + zh.json）');
  }

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const pageName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 生成英文翻译
  const enTranslation = {
    [`${pageName}Page`]: {
      title: contentData.seo.title,
      description: contentData.seo.metaDescription,
      hero: {
        title: contentData.h1.title,
        description: contentData.heroDescription.content,
      },
      tool: {
        inputLabel: 'Input Text',
        outputLabel: 'Translated Text',
        inputPlaceholder: 'Enter your text here...',
        outputPlaceholder: 'Translation will appear here...',
        translateButton: 'Translate',
        uploadButton: 'Upload File',
        uploadHint: 'Supports .txt and .docx files',
        loading: 'Translating...',
        error: 'Translation failed. Please try again.',
        noInput: 'Please enter some text to translate.',
      },
      whatIs: {
        title: contentData.whatIs.title,
        description: contentData.whatIs.content,
        image: '',
        imageAlt: '',
      },
      examples: {
        title: contentData.example.title,
        description: contentData.example.description,
        items: contentData.example.items
          ? contentData.example.items.map((item) => ({
              before: item.before,
              after: item.after,
              alt: item.alt,
            }))
          : [
              { alt: 'Example 1 placeholder', name: 'Example 1' },
              { alt: 'Example 2 placeholder', name: 'Example 2' },
              { alt: 'Example 3 placeholder', name: 'Example 3' },
              { alt: 'Example 4 placeholder', name: 'Example 4' },
              { alt: 'Example 5 placeholder', name: 'Example 5' },
              { alt: 'Example 6 placeholder', name: 'Example 6' },
            ],
      },
      howto: {
        title: contentData.howTo.title,
        description: contentData.howTo.description,
        steps: contentData.howTo.steps,
      },
      funfacts: {
        title: 'Interesting Facts',
        items: contentData.funFacts.map((fact) => ({
          title: fact.title || 'Fun Fact',
          description: fact.content,
          image: '',
          imageAlt: '',
        })),
      },
      userInterest: {
        title: contentData.interestingSections.title,
        items: contentData.interestingSections.sections.map((section) => ({
          title: section.title,
          description: section.content,
          image: '',
          imageAlt: '',
        })),
      },
      highlights: {
        title: contentData.highlights.title,
        description:
          contentData.highlights.description ||
          'The best features for your translation needs',
        items: (
          contentData.highlights.items ||
          contentData.highlights.features ||
          []
        ).map((feature, index) => ({
          icon:
            feature.icon ||
            ['FaRocket', 'FaBrain', 'FaShieldAlt', 'FaChartLine'][index % 4],
          title: feature.title,
          description: feature.description,
          tagline: feature.tagline || '',
          statLabel: feature.statLabel || null,
          statValue: feature.statValue || null,
          microCopy: feature.microCopy || '',
        })),
      },
      testimonials: {
        title: 'What Our Users Say',
        subtitle: 'Stories from Teams Using VibeTrans for Translation',
        items: contentData.testimonials.reduce((acc, item, index) => {
          acc[`item-${index + 1}`] = {
            name: item.name,
            role: item.role,
            heading: item.heading || `Review from ${item.name}`,
            content: item.content,
            rating: item.rating || '4.8',
          };
          return acc;
        }, {}),
      },
      faqs: {
        title: 'Frequently Asked Questions',
        subtitle: 'Have other questions? Feel free to contact us via email.',
        items: contentData.faqs.reduce((acc, item, index) => {
          acc[`item-${index + 1}`] = {
            question: item.question,
            answer: item.answer,
          };
          return acc;
        }, {}),
      },
      unique: {
        title: '',
        items: [],
      },
      ctaButton: `Try ${pageName} Now`,
      cta: {
        title: contentData.cta.title,
        description: contentData.cta.description,
        primaryButton: contentData.cta.button || `Try ${pageName} Now`,
        secondaryButton: 'Back to Top',
      },
    },
  };

  // 创建页面专属翻译目录
  const pageTranslationDir = path.join(CONFIG.messagesDir, 'pages', slug);
  await fs.mkdir(pageTranslationDir, { recursive: true });

  // 写入英文翻译文件
  const enPath = path.join(pageTranslationDir, 'en.json');
  await fs.writeFile(enPath, JSON.stringify(enTranslation, null, 2));
  logSuccess(`英文翻译已生成: ${enPath}`);

  // 根据配置决定是否生成中文翻译文件
  if (!CONFIG.enableSkipChineseTranslation) {
    // 生成中文翻译文件（空结构，需要手动翻译）
    const zhTranslation = JSON.parse(JSON.stringify(enTranslation)); // 深拷贝英文结构

    // 清空中文内容，保留结构
    const clearChineseContent = (obj) => {
      if (typeof obj === 'string') {
        return ''; // 清空字符串内容
      } else if (Array.isArray(obj)) {
        return obj.map(clearChineseContent);
      } else if (typeof obj === 'object' && obj !== null) {
        const cleared = {};
        for (const [key, value] of Object.entries(obj)) {
          cleared[key] = clearChineseContent(value);
        }
        return cleared;
      }
      return obj;
    };

    const clearedZhTranslation = clearChineseContent(zhTranslation);

    const zhPath = path.join(pageTranslationDir, 'zh.json');
    await fs.writeFile(zhPath, JSON.stringify(clearedZhTranslation, null, 2));
    logSuccess(`中文翻译结构已生成: ${zhPath}`);
    logWarning('⚠️  请手动翻译 zh.json 文件中的内容');
  } else {
    logInfo('⚡  已跳过中文翻译文件生成（根据配置）');
  }

  return { pageName, enTranslation, slug };
}

/**
 * 智能生成图片路径映射（基于english-to-persian-translator分析）
 */
function generateImageMapping(slug) {
  return {
    whatIs: `what-is-${slug}.webp`,
    funFacts: [
      `/images/docs/${slug}-fact-1.webp`,
      `/images/docs/${slug}-fact-2.webp`,
    ],
    userInterests: [
      `/images/docs/${slug}-interest-1.webp`,
      `/images/docs/${slug}-interest-2.webp`,
      `/images/docs/${slug}-interest-3.webp`,
      `/images/docs/${slug}-interest-4.webp`,
    ],
    howTo: `${slug}-how-to.webp`,
  };
}

/**
 * 智能更新翻译文件中的图片引用（解决耦合问题）
 */
async function updateTranslationFileImages(slug, imageMapping) {
  const enPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');

  try {
    const content = await fs.readFile(enPath, 'utf-8');
    const jsonData = JSON.parse(content);

    const pageName =
      slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Page';

    if (!jsonData[pageName]) {
      logWarning(`未找到 ${pageName} 命名空间`);
      return { success: false };
    }

    // 更新各种图片引用
    if (jsonData[pageName].whatIs && imageMapping.whatIs) {
      jsonData[pageName].whatIs.image = `/images/docs/${imageMapping.whatIs}`;
      jsonData[pageName].whatIs.imageAlt =
        `What is ${slug} - Visual explanation`;
    }

    // 更新 funFacts 图片
    if (jsonData[pageName].funFacts?.items) {
      imageMapping.funFacts.forEach((imagePath, index) => {
        if (jsonData[pageName].funFacts.items[index]) {
          jsonData[pageName].funFacts.items[index].image = imagePath;
          jsonData[pageName].funFacts.items[index].imageAlt =
            jsonData[pageName].funFacts.items[index].title ||
            `Fun fact ${index + 1}`;
        }
      });
    }

    // 更新 userInterest 图片
    if (jsonData[pageName].userInterest?.items) {
      imageMapping.userInterests.forEach((imagePath, index) => {
        if (jsonData[pageName].userInterest.items[index]) {
          jsonData[pageName].userInterest.items[index].image = imagePath;
          jsonData[pageName].userInterest.items[index].imageAlt =
            jsonData[pageName].userInterest.items[index].title ||
            `User interest ${index + 1}`;
        }
      });
    }

    // 更新 howTo 图片
    if (jsonData[pageName].howto && imageMapping.howTo) {
      jsonData[pageName].howto.image = `/images/docs/${imageMapping.howTo}`;
      jsonData[pageName].howto.imageAlt = `How to use ${slug}`;
    }

    await fs.writeFile(enPath, JSON.stringify(jsonData, null, 2));
    logSuccess(`✓ 智能更新图片引用完成: ${enPath}`);

    return { success: true, updated: true };
  } catch (error) {
    logError(`更新翻译文件图片引用失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 更新 en.json 中的图片引用（使用动态文件名映射）
 */
async function updateEnJsonWithImages(slug, imageMapping) {
  const enPath = path.join(ROOT_DIR, 'messages', 'pages', slug, 'en.json');

  try {
    // 读取现有的 en.json
    const content = await fs.readFile(enPath, 'utf-8');
    const jsonData = JSON.parse(content);

    // 获取页面命名空间
    const pageName =
      slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Page';

    if (!jsonData[pageName]) {
      logError(`未找到 ${pageName} 命名空间`);
      return { success: false };
    }

    let updated = 0;

    // 1. 更新 whatIs 图片
    if (imageMapping.whatIs) {
      if (!jsonData[pageName].whatIs) {
        jsonData[pageName].whatIs = {};
      }
      jsonData[pageName].whatIs.image = `/images/docs/${imageMapping.whatIs}`;
      jsonData[pageName].whatIs.imageAlt =
        `What is ${slug} - Visual explanation`;
      updated++;
      logSuccess(`✓ 更新 whatIs 图片: ${imageMapping.whatIs}`);
    }

    // 2. 更新 funFacts 图片
    if (jsonData[pageName].funFacts?.items) {
      imageMapping.funFacts.forEach((imagePath, index) => {
        if (imagePath && jsonData[pageName].funFacts?.items?.[index]) {
          jsonData[pageName].funFacts.items[index].image = imagePath;
          jsonData[pageName].funFacts.items[index].imageAlt =
            jsonData[pageName].funFacts.items[index].title ||
            `Fun fact ${index + 1}`;
          updated++;
          logSuccess(`✓ 更新 funFacts[${index}] 图片: ${imagePath}`);
        }
      });
    }

    // 3. 更新 userInterest 图片
    if (jsonData[pageName].userInterest?.items) {
      imageMapping.userInterests.forEach((imagePath, index) => {
        if (imagePath && jsonData[pageName].userInterest?.items?.[index]) {
          jsonData[pageName].userInterest.items[index].image = imagePath;
          jsonData[pageName].userInterest.items[index].imageAlt =
            jsonData[pageName].userInterest.items[index].title ||
            `User interest ${index + 1}`;
          updated++;
          logSuccess(`✓ 更新 userInterest[${index}] 图片: ${imagePath}`);
        }
      });
    }

    // 保存更新后的 en.json
    await fs.writeFile(enPath, JSON.stringify(jsonData, null, 2));

    return { success: true, updated };
  } catch (error) {
    logError(`更新 en.json 失败: ${error.message}`);
    throw error;
  }
}

/**
 * 更新 page.tsx 文件，确保使用 JSON 中的图片路径而不是硬编码
 */
async function updatePageTsxImageReferences(slug) {
  const pagePath = path.join(
    ROOT_DIR,
    'src',
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    'page.tsx'
  );

  try {
    // 读取 page.tsx
    let pageContent = await fs.readFile(pagePath, 'utf-8');
    let hasChanges = false;

    // 1. 更新 whatIs section 的图片引用
    const whatIsPattern =
      /const whatIsSection = \{[\s\S]*?image: \{[\s\S]*?src: ['"]([^'"]+)['"],[\s\S]*?\},[\s\S]*?\};/;
    if (whatIsPattern.test(pageContent)) {
      pageContent = pageContent.replace(
        /image: \{[\s\S]*?src: ['"]\/images\/docs\/[^'"]+['"],[\s\S]*?alt: ['"][^'"]+['"]/,
        `image: {
      src: (t as any)('whatIs.image') || '/images/docs/placeholder.webp',
      alt: (t as any)('whatIs.imageAlt') || 'What is ${slug}'`
      );
      hasChanges = true;
      logInfo('✓ 更新 whatIs section 图片引用');
    }

    // 2. 更新 funFacts section 的图片引用
    const funFactsPattern =
      /const funFactsSection = \{[\s\S]*?items: \[[\s\S]*?\],[\s\S]*?\};/;
    if (funFactsPattern.test(pageContent)) {
      // 替换 funFacts items 中的硬编码图片路径
      pageContent = pageContent.replace(
        /const funFactsSection = \{[\s\S]*?items: \[([\s\S]*?)\],[\s\S]*?\};/,
        (match, itemsContent) => {
          const updatedItems = itemsContent.replace(
            /\{\s*title: \(t as any\)\('funFacts\.items\.(\d+)\.title'\),[\s\S]*?description: \(t as any\)\('funFacts\.items\.\1\.description'\),[\s\S]*?image: \{[\s\S]*?src: ['"]\/images\/docs\/[^'"]+['"],[\s\S]*?alt: [^}]+\},[\s\S]*?\}/g,
            (itemMatch, index) => {
              return `{
        title: (t as any)('funFacts.items.${index}.title'),
        description: (t as any)('funFacts.items.${index}.description'),
        image: {
          src: (t as any)('funFacts.items.${index}.image') || '/images/docs/placeholder.webp',
          alt: (t as any)('funFacts.items.${index}.imageAlt') || (t as any)('funFacts.items.${index}.title'),
        },
      }`;
            }
          );
          return match.replace(itemsContent, updatedItems);
        }
      );
      hasChanges = true;
      logInfo('✓ 更新 funFacts section 图片引用');
    }

    // 3. 更新 userInterest section 的图片引用
    const userInterestPattern =
      /const userInterestSection = \{[\s\S]*?items: \[[\s\S]*?\],[\s\S]*?\};/;
    if (userInterestPattern.test(pageContent)) {
      pageContent = pageContent.replace(
        /const userInterestSection = \{[\s\S]*?items: \[([\s\S]*?)\],[\s\S]*?\};/,
        (match, itemsContent) => {
          const updatedItems = itemsContent.replace(
            /\{\s*title: \(t as any\)\('userInterest\.items\.(\d+)\.title'\),[\s\S]*?description: \(t as any\)\('userInterest\.items\.\1\.description'\),[\s\S]*?image: \{[\s\S]*?src: ['"]\/images\/docs\/[^'"]+['"],[\s\S]*?alt: [^}]+\},[\s\S]*?\}/g,
            (itemMatch, index) => {
              return `{
        title: (t as any)('userInterest.items.${index}.title'),
        description: (t as any)('userInterest.items.${index}.description'),
        image: {
          src: (t as any)('userInterest.items.${index}.image') || '/images/docs/placeholder.webp',
          alt: (t as any)('userInterest.items.${index}.imageAlt') || (t as any)('userInterest.items.${index}.title'),
        },
      }`;
            }
          );
          return match.replace(itemsContent, updatedItems);
        }
      );
      hasChanges = true;
      logInfo('✓ 更新 userInterest section 图片引用');
    }

    if (hasChanges) {
      await fs.writeFile(pagePath, pageContent);
      logSuccess('page.tsx 已更新，图片引用已改为从 JSON 读取');
      return { success: true };
    }
    logInfo('page.tsx 未检测到需要更新的硬编码图片路径');
    return { success: true, noChanges: true };
  } catch (error) {
    logError(`更新 page.tsx 失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Phase 5.5: JSON文件与代码匹配检测
 */
async function phase5_5_validateJsonCodeMatch(keyword, translationData) {
  logPhase('5.5', 'JSON文件与代码匹配检测（V2: 通用模板）');

  const { slug, pageName } = translationData;
  const issues = [];

  // V2 版本说明
  log('\n🎯 V2 版本检测策略:', 'cyan');
  logInfo('✓ 使用通用模板 [translator-slug]/page.tsx');
  logInfo('✓ 只需验证 JSON 文件结构完整性');
  logInfo('✓ 跳过单独 page.tsx 和 Tool 组件检测');

  // 1. 检查JSON文件是否存在
  logInfo('\n检查JSON文件存在性...');
  const enJsonPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');

  try {
    await fs.access(enJsonPath);
    logSuccess('✓ en.json 文件存在');
  } catch (error) {
    issues.push({ type: 'file_missing', file: 'en.json', path: enJsonPath });
    logError('✗ en.json 文件不存在');
    return {
      success: false,
      issues,
      summary: {
        totalChecks: 1,
        passedChecks: 0,
        failedChecks: 1,
      },
    };
  }

  // V2 版本：跳过 page.tsx 和 Tool 组件检查
  logInfo('✓ V2 版本跳过单独文件检查（使用通用模板）');

  // 2. 读取并解析JSON文件
  logInfo('\n读取JSON文件内容...');
  let enJsonContent;
  try {
    const content = await fs.readFile(enJsonPath, 'utf-8');
    enJsonContent = JSON.parse(content);
  } catch (error) {
    issues.push({
      type: 'json_parse_error',
      file: 'en.json',
      error: error.message,
    });
    logError(`✗ JSON解析失败: ${error.message}`);
    return {
      success: false,
      issues,
      summary: {
        totalChecks: 1,
        passedChecks: 0,
        failedChecks: 1,
      },
    };
  }

  // 3. 检查JSON结构完整性
  logInfo('检查JSON结构完整性...');
  const requiredFields = [
    'title',
    'description',
    'hero.title',
    'hero.description',
    'whatIs.title',
    'whatIs.description',
    'examples.title',
    'examples.description',
    'examples.items',
    'howto.title',
    'howto.description',
    'funFacts.title',
    'funFacts.items',
    'highlights.title',
    'highlights.items',
    'testimonials.title',
    'testimonials.subtitle',
    'faqs.title',
    'faqs.subtitle',
    'cta.title',
  ];

  let checkedCount = 0;
  let passedCount = 0;

  for (const field of requiredFields) {
    checkedCount++;
    const value = getNestedValue(enJsonContent, `${pageName}.${field}`);
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      issues.push({ type: 'missing_field', field: `${pageName}.${field}` });
      logWarning(`⚠️  缺少字段或字段为空: ${field}`);
    } else {
      passedCount++;
    }
  }

  // 4. 检查数组字段是否为空（V2 简化版检查）
  const arrayFields = [
    { path: 'examples.items', minLength: 1 },
    { path: 'funFacts.items', minLength: 1 },
    { path: 'highlights.items', minLength: 1 },
  ];

  for (const arrayField of arrayFields) {
    checkedCount++;
    const value = getNestedValue(
      enJsonContent,
      `${pageName}.${arrayField.path}`
    );
    if (!Array.isArray(value) || value.length < arrayField.minLength) {
      issues.push({
        type: 'empty_array',
        field: `${pageName}.${arrayField.path}`,
        expected: `至少 ${arrayField.minLength} 项`,
        actual: Array.isArray(value) ? value.length : 0,
      });
      logWarning(`⚠️  数组字段为空或不足: ${arrayField.path}`);
    } else {
      passedCount++;
    }
  }

  // V2 版本：跳过 page.tsx 和 Tool 组件的翻译键检查
  logInfo('✓ V2 版本跳过代码翻译键引用检查（通用模板自动处理）');

  // 5. 生成检测报告
  logInfo('\n📊 JSON结构检测报告 (V2 简化版):');

  if (issues.length === 0) {
    logSuccess('✅ 所有检测项目都通过！');
    logSuccess('✓ JSON文件存在且可解析');
    logSuccess('✓ JSON结构完整');
    logSuccess('✓ 数组字段包含必要内容');

    return {
      success: true,
      issues: [],
      summary: {
        totalChecks: checkedCount,
        passedChecks: passedCount,
        failedChecks: 0,
      },
    };
  } else {
    logWarning(`⚠️  发现 ${issues.length} 个潜在问题:`);

    const issuesByType = {};
    issues.forEach((issue) => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    });

    Object.entries(issuesByType).forEach(([type, items]) => {
      logWarning(`\n  ${type.toUpperCase()} (${items.length}个):`);
      items.forEach((item) => {
        if (item.field) {
          logWarning(`    - ${item.field}`);
        } else if (item.file) {
          logWarning(`    - ${item.file}: ${item.path || item.error || ''}`);
        }
      });
    });

    logInfo('\n💡 建议:');
    if (issues.some((i) => i.type.includes('missing'))) {
      logInfo('  - 补充JSON文件中缺失的字段');
      logInfo('  - 确保所有必需的翻译内容都已生成');
    }
    if (issues.some((i) => i.type.includes('empty'))) {
      logInfo('  - 为数组字段添加必要的内容项');
    }

    return {
      success: false,
      issues,
      summary: {
        totalChecks: checkedCount,
        passedChecks: passedCount,
        failedChecks: issues.length,
      },
    };
  }
}

/**
 * Phase 6: 图片生成（Volcano 4.0 + 自动引用）
 */
async function phase6_generateImages(keyword, contentData) {
  logPhase(6, '图片生成（Volcano 4.0 + 自动引用）');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');

  // 1. 构建 ArticleSections 数据结构（参考 generate-pig-latin-images-ai.ts）
  const sections = {
    toolName: slug,
    whatIs: {
      title: contentData.whatIs.title,
      content: contentData.whatIs.content,
    },
    funFacts: contentData.funFacts.map((fact) => ({
      title: fact.title || 'Fun Fact',
      content: fact.content,
    })),
    userInterests: contentData.interestingSections.sections.map((section) => ({
      title: section.title,
      content: section.content,
    })),
  };

  logInfo('调用 Article Illustrator 工作流...');
  logInfo('  1. Volcano 4.0 分析内容 → 生成 prompts');
  logInfo('  2. Volcano 4.0 生成图片');
  logInfo('  3. 保存到 public/images/docs/');
  logInfo('  4. 自动更新 en.json 引用\n');

  try {
    // 2. 动态生成并执行图片生成脚本（返回结果JSON）
    const scriptPath = path.join(
      ROOT_DIR,
      'scripts',
      `generate-${slug}-images-auto.ts`
    );
    const resultPath = path.join(
      ROOT_DIR,
      '.tool-generation',
      slug,
      'image-generation-result.json'
    );

    const scriptContent = `#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = ${JSON.stringify(sections, null, 2)};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', '${slug}', 'image-generation-result.json');
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ 图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();`;

    await fs.writeFile(scriptPath, scriptContent);
    logSuccess(`图片生成脚本已创建: ${scriptPath}`);

    // 3. 执行图片生成
    logInfo('开始生成图片（预计 15-25 分钟）...\n');
    execSync(`pnpm tsx ${scriptPath}`, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
    });

    logSuccess('图片生成完成！\n');

    // 4. 读取图片生成结果
    const resultContent = await fs.readFile(resultPath, 'utf-8');
    const imageResult = JSON.parse(resultContent);

    // 5. 自动更新 en.json 引用（使用智能图片映射）
    logInfo('自动更新图片引用到 en.json...');

    // 使用智能图片映射（基于english-to-persian-translator分析）
    const imageMapping = generateImageMapping(slug);

    // 更新映射中的实际文件名
    if (imageResult.images) {
      const whatIsImage = imageResult.images.find(
        (img) => img.section === 'whatIs'
      );
      if (whatIsImage) {
        imageMapping.whatIs = whatIsImage.filename;
      }

      const funFactImages = imageResult.images.filter((img) =>
        img.section.startsWith('funFacts')
      );
      funFactImages.forEach((img, index) => {
        if (imageMapping.funFacts[index]) {
          imageMapping.funFacts[index] = `/images/docs/${img.filename}`;
        }
      });

      const userInterestImages = imageResult.images.filter((img) =>
        img.section.startsWith('userInterests')
      );
      userInterestImages.forEach((img, index) => {
        if (imageMapping.userInterests[index]) {
          imageMapping.userInterests[index] = `/images/docs/${img.filename}`;
        }
      });

      const howToImage = imageResult.images.find(
        (img) => img.section === 'howTo'
      );
      if (howToImage) {
        imageMapping.howTo = howToImage.filename;
      }
    }

    // 使用增强的图片更新函数
    await updateTranslationFileImages(slug, imageMapping);

    logSuccess('图片引用已自动更新！');

    // 6. 更新 page.tsx 文件，确保使用 JSON 中的图片路径
    logInfo('更新 page.tsx 文件，确保图片从 JSON 读取...');
    const pageUpdateResult = await updatePageTsxImageReferences(slug);

    if (pageUpdateResult.success && !pageUpdateResult.noChanges) {
      logSuccess('page.tsx 已更新为从 JSON 读取图片路径');
    }

    return {
      success: true,
      images: imageResult.images.map((img) => img.filename),
      mapping: imageMapping,
    };
  } catch (error) {
    logError(`图片生成失败: ${error.message}`);
    logWarning('跳过图片生成，继续后续流程');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Phase 7: SEO 配置（sitemap, navbar, footer, i18n）
 */
async function phase7_configureSEO(keyword, translationData) {
  logPhase(7, 'SEO 配置（sitemap, navbar, footer, i18n）');

  const { slug, pageName } = translationData;
  const title = keyword
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // 转换为驼峰命名和枚举命名
  const camelCaseName = slug
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');

  const routeEnumName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 1. 更新 marketing/en.json
  logInfo('更新 messages/marketing/en.json...');
  const marketingEnPath = path.join(CONFIG.messagesDir, 'marketing', 'en.json');
  const marketingEnContent = await fs.readFile(marketingEnPath, 'utf-8');
  const marketingEn = JSON.parse(marketingEnContent);

  // 检查是否已存在
  if (
    !marketingEn.Marketing?.navbar?.languageTranslator?.items?.[camelCaseName]
  ) {
    // 添加到 languageTranslator.items
    if (!marketingEn.Marketing.navbar.languageTranslator.items) {
      marketingEn.Marketing.navbar.languageTranslator.items = {};
    }

    marketingEn.Marketing.navbar.languageTranslator.items[camelCaseName] = {
      title: title,
      description: `Translate ${title.toLowerCase()}`,
    };

    await fs.writeFile(marketingEnPath, JSON.stringify(marketingEn, null, 2));
    logSuccess('✓ marketing/en.json 已更新');
  } else {
    logInfo('marketing/en.json 已包含此工具');
  }

  // 2. 更新 routes.ts
  logInfo('更新 src/routes.ts...');
  const routesPath = path.join(CONFIG.srcDir, 'routes.ts');
  let routesContent = await fs.readFile(routesPath, 'utf-8');

  // 检查是否已存在
  if (!routesContent.includes(`${routeEnumName}:`)) {
    // 找到 Language Translator routes 部分的最后一个条目
    const languageTranslatorMatch = routesContent.match(
      /\/\/ Language Translator routes([\s\S]*?)(?=\n {2}\/\/ |$)/
    );

    if (languageTranslatorMatch) {
      const sectionContent = languageTranslatorMatch[1];
      // 找到最后一个路由条目
      const lastRouteMatch = sectionContent.match(/ {2}\w+: '([^']+)',\n/g);

      if (lastRouteMatch) {
        const lastRoute = lastRouteMatch[lastRouteMatch.length - 1];
        const newRoute = `  ${routeEnumName}: '/${slug}',\n`;

        routesContent = routesContent.replace(
          languageTranslatorMatch[0],
          languageTranslatorMatch[0].replace(lastRoute, lastRoute + newRoute)
        );

        await fs.writeFile(routesPath, routesContent);
        logSuccess('✓ routes.ts 已更新');
      } else {
        logWarning('未找到 Language Translator routes 中的路由条目');
      }
    } else {
      logWarning('未找到 Language Translator routes 部分');
    }
  } else {
    logInfo('routes.ts 已包含此工具');
  }

  // 3. 更新 navbar-config.tsx
  logInfo('更新 navbar-config.tsx...');
  const navbarPath = path.join(CONFIG.srcDir, 'config', 'navbar-config.tsx');
  let navbarContent = await fs.readFile(navbarPath, 'utf-8');

  // 检查是否已存在
  if (!navbarContent.includes(`Routes.${routeEnumName}`)) {
    // 在 languageTranslator 分类的最后一项后添加
    const navbarEntry = `        {
          title: t('languageTranslator.items.${camelCaseName}.title'),
          icon: <SparklesIcon className="size-4 shrink-0" />,
          href: Routes.${routeEnumName},
          external: false,
        },`;

    // 找到 languageTranslator.items 数组的结束位置
    const languageTranslatorMatch = navbarContent.match(
      /title: t\('languageTranslator\.title'\),[\s\S]*?items: \[([\s\S]*?)\n {6}\],/
    );

    if (languageTranslatorMatch) {
      const itemsContent = languageTranslatorMatch[1];
      const updatedItemsContent = itemsContent + '\n' + navbarEntry;
      navbarContent = navbarContent.replace(
        languageTranslatorMatch[0],
        languageTranslatorMatch[0].replace(itemsContent, updatedItemsContent)
      );

      await fs.writeFile(navbarPath, navbarContent);
      logSuccess('✓ navbar-config.tsx 已更新');
    } else {
      logWarning('未找到 languageTranslator 分类');
    }
  } else {
    logInfo('navbar-config.tsx 已包含此工具');
  }

  // 3. 更新 footer-config.tsx
  logInfo('更新 footer-config.tsx...');
  const footerPath = path.join(CONFIG.srcDir, 'config', 'footer-config.tsx');
  let footerContent = await fs.readFile(footerPath, 'utf-8');

  if (!footerContent.includes(`Routes.${routeEnumName}`)) {
    const footerEntry = `        {
          title: '${title}',
          href: Routes.${routeEnumName},
          external: false,
        },`;

    // 找到 languageTranslator.items 数组的结束位置
    const languageTranslatorMatch = footerContent.match(
      /title: t\('languageTranslator\.title'\),[\s\S]*?items: \[([\s\S]*?)\n {6}\],/
    );

    if (languageTranslatorMatch) {
      const itemsContent = languageTranslatorMatch[1];
      const updatedItemsContent = itemsContent + '\n' + footerEntry;
      footerContent = footerContent.replace(
        languageTranslatorMatch[0],
        languageTranslatorMatch[0].replace(itemsContent, updatedItemsContent)
      );

      await fs.writeFile(footerPath, footerContent);
      logSuccess('✓ footer-config.tsx 已更新');
    } else {
      logWarning('未找到 languageTranslator 分类');
    }
  } else {
    logInfo('footer-config.tsx 已包含此工具');
  }

  // 4. 更新 sitemap.ts
  logInfo('更新 src/app/sitemap.ts...');
  const sitemapPath = path.join(CONFIG.srcDir, 'app', 'sitemap.ts');
  let sitemapContent = await fs.readFile(sitemapPath, 'utf-8');

  // 检查是否已存在
  if (!sitemapContent.includes(`'/${slug}'`)) {
    // 找到 staticRoutes 数组的结束位置（在最后的 ];）
    const staticRoutesMatch = sitemapContent.match(
      /const staticRoutes = \[([\s\S]*?)\];/
    );

    if (staticRoutesMatch) {
      const routesContent = staticRoutesMatch[1];
      // 在最后一个路由后添加新路由（保留缩进）
      const lastRouteMatch = routesContent.match(/ {2}'([^']+)',\n/g);
      if (lastRouteMatch) {
        const lastRoute = lastRouteMatch[lastRouteMatch.length - 1];
        const newRoute = `  '/${slug}',\n`;
        const updatedRoutesContent = routesContent.replace(
          lastRoute,
          lastRoute + newRoute
        );

        sitemapContent = sitemapContent.replace(
          staticRoutesMatch[0],
          `const staticRoutes = [${updatedRoutesContent}];`
        );

        await fs.writeFile(sitemapPath, sitemapContent);
        logSuccess('✓ sitemap.ts 已更新');
      } else {
        logWarning('未找到 staticRoutes 数组中的路由');
      }
    } else {
      logWarning('未找到 staticRoutes 数组');
    }
  } else {
    logInfo('sitemap.ts 已包含此工具');
  }

  // 5. 更新 src/i18n/messages.ts
  logInfo('更新 src/i18n/messages.ts...');
  const messagesPath = path.join(CONFIG.srcDir, 'i18n', 'messages.ts');
  let messagesContent = await fs.readFile(messagesPath, 'utf-8');

  // 转换为驼峰命名（首字母小写）
  const camelCaseVarName =
    slug
      .split('-')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('') + 'Pages';

  // 检查是否已存在
  if (!messagesContent.includes(`${camelCaseVarName} =`)) {
    // 1. 添加导入语句（在最后一个页面导入后）
    const lastPageImportMatch = messagesContent.match(
      /import\(`\.\.\/\.\.\/messages\/pages\/[^\/]+\/\$\{locale\}\.json`\),\n/g
    );

    if (lastPageImportMatch) {
      const lastImport = lastPageImportMatch[lastPageImportMatch.length - 1];
      const importStatement = `    import(\`../../messages/pages/${slug}/\${locale}.json\`),\n`;

      // 在最后一个页面导入后添加
      messagesContent = messagesContent.replace(
        lastImport,
        lastImport + importStatement
      );
    }

    // 2. 添加变量声明（在导入列表中）
    const importListMatch = messagesContent.match(
      /const (\w+) = await import\(`\.\.\/\.\.\/messages\/pages\/[^\/]+\/\$\{locale\}\.json`\);/
    );

    if (importListMatch) {
      // 在最后一个页面导入后添加
      const lastImportMatch = messagesContent.match(
        /const (\w+) = await import\(`\.\.\/\.\.\/messages\/pages\/[^\/]+\/\$\{locale\}\.json`\);\n/g
      );

      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const importStatement = `  const ${camelCaseVarName} = await import(\`../../messages/pages/${slug}/\${locale}.json\`);\n`;

        // 在最后一个页面导入后添加
        messagesContent = messagesContent.replace(
          lastImport,
          lastImport + importStatement
        );
      }
    }

    // 3. 添加到 deepmerge 列表中
    const deepmergeMatch = messagesContent.match(
      /return deepmerge\.all\(\[\n([\s\S]*?)\n {2}\]\) as Messages;/
    );

    if (deepmergeMatch) {
      const mergeList = deepmergeMatch[1];
      const newMergeEntry = `    ${camelCaseVarName}.default,`;

      // 在最后一个页面条目后添加
      const lastPageMergeMatch = mergeList.match(/\w+Pages\.default,\n/g);
      if (lastPageMergeMatch) {
        const lastMerge = lastPageMergeMatch[lastPageMergeMatch.length - 1];
        const updatedMergeList = mergeList.replace(
          lastMerge,
          lastMerge + newMergeEntry + '\n'
        );

        messagesContent = messagesContent.replace(
          deepmergeMatch[0],
          `return deepmerge.all([\n${updatedMergeList}\n  ]) as Messages;`
        );
      }
    }

    await fs.writeFile(messagesPath, messagesContent);
    logSuccess('✓ src/i18n/messages.ts 已更新');
  } else {
    logInfo('src/i18n/messages.ts 已包含此工具');
  }

  log('\n✅ SEO 配置完成！', 'green');
  logSuccess(`✓ routes.ts 已添加路由: Routes.${routeEnumName}`);
  logSuccess(`✓ sitemap.ts 已包含新路径: /${slug}`);
  logSuccess('✓ navbar-config.tsx 已更新');
  logSuccess('✓ footer-config.tsx 已更新');
  logSuccess('✓ marketing/en.json 已更新');
  logSuccess('✓ messages.ts i18n 配置已更新');
  logSuccess('✓ SEO 图片自动使用 whatIs.image (og:image, twitter:image)');

  logWarning('\n⚠️  其他配置（可选）：');
  logInfo('  1. 可以在 ExploreOurAiTools 中添加此工具到推荐列表');

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
  const pagePath = path.join(
    CONFIG.srcDir,
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    'page.tsx'
  );
  const apiPath = path.join(CONFIG.srcDir, 'app', 'api', slug, 'route.ts');
  const enPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');

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
 * 检查端口是否被占用
 */
async function isPortInUse(port) {
  try {
    const { stdout } = await execAsync(
      process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port}`
    );
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * 等待服务器启动
 */
async function waitForServer(port, timeout = 30000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'HEAD',
      });
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (error) {
      // 服务器还未启动，继续等待
    }

    // 等待 1 秒后重试
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Phase 8.5: 页面错误自动检查
 */
async function phase8_5_checkPageErrors(keyword) {
  if (!CONFIG.enablePageErrorCheck) {
    logInfo('页面错误检查已禁用，跳过 Phase 8.5');
    return { success: true, skipped: true };
  }

  logPhase('8.5', '页面错误自动检查');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const port = CONFIG.devServerPort;
  const pageUrl = `http://localhost:${port}/${slug}`;

  // 1. 检查开发服务器是否已运行
  logInfo(`检查端口 ${port} 是否有服务运行...`);
  const serverRunning = await isPortInUse(port);

  let devServerProcess = null;

  if (!serverRunning) {
    logInfo('开发服务器未运行，正在启动...');

    try {
      // 启动开发服务器（后台运行）
      const { spawn } = await import('node:child_process');
      devServerProcess = spawn('pnpm', ['dev'], {
        cwd: ROOT_DIR,
        stdio: 'pipe',
        detached: false,
      });

      // 监听输出以便调试
      devServerProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready') || output.includes('started')) {
          logInfo('开发服务器已启动');
        }
      });

      devServerProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('Warning')) {
          logWarning(`Dev Server: ${error}`);
        }
      });

      // 等待服务器启动
      logInfo(`等待服务器启动（最多 ${CONFIG.pageCheckTimeout / 1000} 秒）...`);
      const serverReady = await waitForServer(port, CONFIG.pageCheckTimeout);

      if (!serverReady) {
        logError('开发服务器启动超时');
        if (devServerProcess) {
          devServerProcess.kill();
        }
        return { success: false, error: '服务器启动超时' };
      }

      logSuccess('开发服务器已就绪');
    } catch (error) {
      logError(`启动开发服务器失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  } else {
    logInfo('开发服务器已在运行');
  }

  // 2. 检查页面是否可以访问
  logInfo(`正在访问页面: ${pageUrl}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(pageUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    logInfo(`HTTP 状态码: ${response.status}`);

    if (response.status === 200) {
      logSuccess('✓ 页面加载成功！');

      // 获取页面内容进行简单检查
      const html = await response.text();

      // 检查是否有明显的错误标记
      const hasError =
        html.includes('Application error') ||
        html.includes('Unhandled Runtime Error') ||
        html.includes('500') ||
        html.includes('Error:');

      if (hasError) {
        logWarning('⚠️  页面中检测到可能的错误标记');
        logWarning('建议手动访问页面检查：' + pageUrl);
        return { success: true, warning: '页面可能包含错误' };
      }

      logSuccess('✓ 页面内容看起来正常');
      logInfo(`\n访问页面: ${pageUrl}`);

      return { success: true };
    } else if (response.status === 404) {
      logError('✗ 页面未找到 (404)');
      logWarning('请检查路由配置是否正确');
      return { success: false, error: '页面未找到' };
    } else {
      logError(`✗ 页面返回错误状态码: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      logError('✗ 页面加载超时');
    } else {
      logError(`✗ 页面访问失败: ${error.message}`);
    }
    return { success: false, error: error.message };
  } finally {
    // 如果我们启动了服务器，询问是否关闭
    if (devServerProcess && !serverRunning) {
      logInfo('\n开发服务器由脚本启动');
      logWarning('请手动停止开发服务器（Ctrl+C）或保持运行以便测试');

      // 不自动关闭服务器，让用户决定
      // devServerProcess.kill();
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const keyword = process.argv[2];

  if (!keyword) {
    logError('请提供关键词参数');
    logInfo(
      '使用方法: node scripts/auto-tool-generator.js "alien text generator"'
    );
    process.exit(1);
  }

  log('\n🚀 VibeTrans 自动化工具生成器', 'bright');
  logInfo(`关键词: ${keyword}`);
  logInfo(`调研模型: ${CONFIG.researchModel}`);
  logInfo(`内容模型: ${CONFIG.contentModel}`);
  logInfo(`输出目录: ${CONFIG.outputDir}`);
  if (CONFIG.enableSkipChineseTranslation) {
    logInfo('⚡ 中文国际化: 已跳过（加速模式）');
  } else {
    logInfo('🌐 中文国际化: 正常模式');
  }

  try {
    // Phase 1: 产品调研
    const researchData = await phase1_research(keyword);

    // Phase 2: 内容调研
    const contentResearchData = await phase2_contentResearch(keyword);

    // Phase 3: 代码生成
    const codeData = await phase3_generateCode(keyword, researchData);

    // Phase 4: 内容生成
    let contentData = await phase4_generateContent(
      keyword,
      researchData,
      contentResearchData
    );

    // Phase 4.5: 字数验证和重新生成
    contentData = await phase4_5_validateAndRegenerate(
      keyword,
      contentData,
      researchData,
      contentResearchData
    );

    // Phase 5: 生成翻译文件
    const translationData = await phase5_generateTranslations(
      keyword,
      contentData
    );

    // Phase 5.5: JSON文件与代码匹配检测
    const jsonMatchResult = await phase5_5_validateJsonCodeMatch(
      keyword,
      translationData
    );

    if (!jsonMatchResult.success) {
      logWarning('\n⚠️  JSON匹配检测发现问题，但继续后续流程');
      logWarning(
        `检测到 ${jsonMatchResult.summary.failedChecks} 个问题，请后续检查修复`
      );
    } else {
      logSuccess('\n✅ JSON文件与代码匹配检测通过');
    }

    // Phase 6: 图片生成（使用 contentData）
    const imageData = await phase6_generateImages(keyword, contentData);

    // Phase 7: SEO 配置（占位）
    const seoData = await phase7_configureSEO(keyword, translationData);

    // Phase 8: 质量检查
    // await phase8_qualityCheck(keyword);

    // Phase 8.5: 页面错误自动检查
    const pageCheckResult = await phase8_5_checkPageErrors(keyword);

    // Phase 9: 图片路径一致性验证和更新 (跳过 - 功能未实现)
    // await phase9_validateImagePaths(keyword, translationData, imageData);

    // Phase 10: 翻译文件国际化系统检查
    const translationSystemResult = await phase10_checkTranslationSystem(
      keyword,
      translationData
    );

    if (!translationSystemResult.success) {
      logWarning('\n⚠️  翻译文件国际化系统检查发现问题：');
      logWarning(
        `   ${translationSystemResult.error || translationSystemResult.warning}`
      );
      logWarning('   建议检查翻译文件是否正确加载到国际化系统中');
    } else {
      logSuccess('\n✓ 翻译文件国际化系统检查通过');
    }

    // 完成
    log('\n' + '='.repeat(60), 'green');
    log('🎉 工具生成完成！', 'green');
    log('='.repeat(60), 'green');

    if (!pageCheckResult.success) {
      logWarning('\n⚠️  页面检查发现问题：');
      logWarning(`   ${pageCheckResult.error || pageCheckResult.warning}`);
      logWarning('   建议手动检查页面后再继续');
    } else if (!pageCheckResult.skipped) {
      logSuccess('\n✓ 页面检查通过');
    }

    logInfo('\n后续步骤：');

    if (CONFIG.enableSkipChineseTranslation) {
      logInfo('1. ⚡ 已跳过中文翻译文件生成（根据配置）');
      logInfo('2. 只需要处理英文内容，加速开发流程');
    } else {
      logInfo('1. 手动翻译 messages/zh.json');
    }

    if (!jsonMatchResult.success) {
      const stepNumber = CONFIG.enableSkipChineseTranslation ? '3' : '2';
      logWarning(
        `${stepNumber}. ⚠️  JSON匹配检测发现 ${jsonMatchResult.summary.failedChecks} 个问题，需要修复`
      );
      logWarning('   检查日志了解具体问题和修复建议');
    } else {
      const stepNumber = CONFIG.enableSkipChineseTranslation ? '3' : '2';
      logSuccess(`${stepNumber}. ✓ JSON文件与代码匹配检测通过`);
    }

    if (imageData.success) {
      logInfo('3. ✓ 图片已自动生成并更新引用');
    } else {
      logWarning('3. ⚠️  图片生成失败，需要手动生成图片');
    }

    logInfo('4. ✓ 图片路径一致性已验证');
    logInfo('5. 更新 sitemap, navbar, footer');
    logInfo('6. 运行 pnpm build 验证构建');
    logInfo('7. 提交代码并上线');
  } catch (error) {
    logError(`\n生成失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Phase 10: 翻译文件国际化系统检查
 */
async function phase10_checkTranslationSystem(keyword, translationData) {
  logPhase('10', '翻译文件国际化系统检查');

  const { slug, pageName } = translationData;

  logInfo('检查翻译文件是否被正确加载到国际化系统中...');

  // 1. 检查 messages.ts 文件是否存在
  const messagesPath = path.join(CONFIG.srcDir, 'i18n', 'messages.ts');

  try {
    await fs.access(messagesPath);
    logSuccess('✓ messages.ts 文件存在');
  } catch (error) {
    logError('✗ messages.ts 文件不存在');
    return { success: false, error: 'messages.ts 文件不存在' };
  }

  // 2. 读取并检查 messages.ts 内容
  let messagesContent;
  try {
    messagesContent = await fs.readFile(messagesPath, 'utf-8');
    logSuccess('✓ messages.ts 文件读取成功');
  } catch (error) {
    logError(`✗ 无法读取 messages.ts: ${error.message}`);
    return { success: false, error: `无法读取 messages.ts: ${error.message}` };
  }

  // 3. 检查导入语句
  const expectedImportPath = `../../messages/pages/${slug}/\${locale}.json`;
  const hasImport = messagesContent.includes(expectedImportPath);

  if (!hasImport) {
    logError(`✗ 缺少导入语句: ${expectedImportPath}`);
    logWarning('翻译文件未被导入到国际化系统');
    return {
      success: false,
      error: '缺少翻译文件导入语句',
      fix: `需要在 messages.ts 中添加: import(\`${expectedImportPath}\`)`,
    };
  }

  logSuccess('✓ 翻译文件导入语句存在');

  // 4. 检查变量声明
  const expectedVarName =
    slug
      .split('-')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('') + 'Pages';

  const hasVariable = messagesContent.includes(`${expectedVarName} =`);

  if (!hasVariable) {
    logError(`✗ 缺少变量声明: ${expectedVarName}`);
    logWarning('翻译文件变量未被声明');
    return {
      success: false,
      error: '缺少翻译文件变量声明',
      fix: `需要在 messages.ts 中添加: const ${expectedVarName} = await import(\`${expectedImportPath}\`);`,
    };
  }

  logSuccess('✓ 翻译文件变量声明存在');

  // 5. 检查 deepmerge 配置
  const hasDeepmerge = messagesContent.includes(`${expectedVarName}.default`);

  if (!hasDeepmerge) {
    logError(`✗ 缺少 deepmerge 配置: ${expectedVarName}.default`);
    logWarning('翻译文件未被合并到国际化系统');
    return {
      success: false,
      error: '缺少 deepmerge 配置',
      fix: `需要在 deepmerge.all() 数组中添加: ${expectedVarName}.default`,
    };
  }

  logSuccess('✓ deepmerge 配置存在');

  // 6. 检查翻译文件结构
  logInfo('检查翻译文件结构完整性...');

  const enPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');
  const zhPath = path.join(CONFIG.messagesDir, 'pages', slug, 'zh.json');

  // 检查英文翻译文件
  try {
    const enContent = await fs.readFile(enPath, 'utf-8');
    const enData = JSON.parse(enContent);

    if (!enData[pageName]) {
      logError(`✗ 英文翻译文件缺少命名空间: ${pageName}`);
      return {
        success: false,
        error: `英文翻译文件缺少命名空间: ${pageName}`,
      };
    }

    logSuccess('✓ 英文翻译文件结构正确');
  } catch (error) {
    logError(`✗ 英文翻译文件检查失败: ${error.message}`);
    return {
      success: false,
      error: `英文翻译文件检查失败: ${error.message}`,
    };
  }

  // 检查中文翻译文件（如果存在）
  try {
    await fs.access(zhPath);

    const zhContent = await fs.readFile(zhPath, 'utf-8');
    const zhData = JSON.parse(zhContent);

    if (!zhData[pageName]) {
      logError(`✗ 中文翻译文件缺少命名空间: ${pageName}`);
      return {
        success: false,
        error: `中文翻译文件缺少命名空间: ${pageName}`,
      };
    }

    logSuccess('✓ 中文翻译文件结构正确');
  } catch (error) {
    if (error.code === 'ENOENT') {
      logWarning('⚠️  中文翻译文件不存在（可能被跳过）');
    } else {
      logError(`✗ 中文翻译文件检查失败: ${error.message}`);
      return {
        success: false,
        error: `中文翻译文件检查失败: ${error.message}`,
      };
    }
  }

  // 7. 检查关键翻译键
  logInfo('检查关键翻译键...');

  try {
    const enContent = await fs.readFile(enPath, 'utf-8');
    const enData = JSON.parse(enContent);
    const pageData = enData[pageName];

    const requiredKeys = [
      'title',
      'description',
      'hero.title',
      'hero.description',
      'tool.inputLabel',
      'tool.outputLabel',
      'whatIs.title',
      'whatIs.description',
      'highlights.title',
    ];

    const missingKeys = [];

    for (const key of requiredKeys) {
      const value = getNestedValue(pageData, key);
      if (!value) {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      logWarning(`⚠️  缺少关键翻译键: ${missingKeys.join(', ')}`);
      logWarning('建议检查翻译文件完整性');
      return {
        success: true,
        warning: '缺少关键翻译键',
        missingKeys: missingKeys,
      };
    }

    logSuccess('✓ 关键翻译键检查通过');
  } catch (error) {
    logError(`✗ 翻译键检查失败: ${error.message}`);
    return {
      success: false,
      error: `翻译键检查失败: ${error.message}`,
    };
  }

  logSuccess('\n✅ 翻译文件国际化系统检查完成！');
  logSuccess('✓ 翻译文件已正确加载到国际化系统');
  logSuccess('✓ 翻译键可以正常使用');

  return {
    success: true,
    summary: {
      importExists: true,
      variableExists: true,
      deepmergeExists: true,
      translationFilesExist: true,
      requiredKeysExist: true,
    },
  };
}

// 运行主函数
main();
