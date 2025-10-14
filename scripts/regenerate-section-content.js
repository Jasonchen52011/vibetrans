#!/usr/bin/env node

/**
 * 🔄 VibeTrans Section 内容重新生成器
 *
 * 基于完整调研数据重新生成指定section的内容，并自动更新到 en.json
 *
 * 使用方法:
 * node scripts/regenerate-section-content.js "pig latin translator" "unique,funFacts"
 * node scripts/regenerate-section-content.js "pig latin translator" "all"
 *
 * 或添加到 package.json:
 * pnpm regenerate:section "pig latin translator" "unique,funFacts"
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置
const CONFIG = {
  gptApiKey: process.env.OPENAI_API_KEY || '',
  contentModel: process.env.CONTENT_MODEL || 'gpt-4o',
  researchModel: process.env.RESEARCH_MODEL || 'o3-mini',
  outputDir: path.join(ROOT_DIR, '.tool-generation'),
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

  const requestBody = {
    model,
    messages,
  };

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
 * 从调研数据中提取产品规划部分（第五点）
 */
function extractProductPlan(researchData) {
  if (!researchData) return '';

  // 查找"五、产品规划"或类似的标题
  const productPlanMatch = researchData.match(/五、产品规划[\s\S]*?(?=(?:六、|七、|八、|$))/);

  if (productPlanMatch) {
    return productPlanMatch[0].trim();
  }

  // 如果找不到，尝试查找其他可能的标记
  const altMatch = researchData.match(/产品规划[\s\S]*?(?=(?:六、|七、|八、|工具类型判断|排除项|$))/);

  if (altMatch) {
    return altMatch[0].trim();
  }

  logWarning('未能从调研数据中提取产品规划部分，将使用完整调研数据');
  return researchData;
}

/**
 * 读取调研数据
 */
async function loadResearchData(slug) {
  // 先尝试读取 .txt 文件（旧格式），如果不存在则读取 .json 文件（新格式）
  const researchTxtPath = path.join(CONFIG.outputDir, slug, 'research-raw.txt');
  const researchJsonPath = path.join(CONFIG.outputDir, slug, 'research.json');
  const contentResearchTxtPath = path.join(CONFIG.outputDir, slug, 'content-research.txt');
  const contentResearchJsonPath = path.join(CONFIG.outputDir, slug, 'content-research.json');

  let researchData = null;
  let contentResearchData = null;

  // 读取产品调研数据
  try {
    researchData = await fs.readFile(researchTxtPath, 'utf-8');
    logSuccess(`读取产品调研数据 (TXT): ${researchTxtPath}`);
  } catch (error) {
    // TXT不存在，尝试读取JSON
    try {
      const jsonData = await fs.readFile(researchJsonPath, 'utf-8');
      const parsed = JSON.parse(jsonData);
      // 将JSON数据转换为文本格式
      researchData = JSON.stringify(parsed, null, 2);
      logSuccess(`读取产品调研数据 (JSON): ${researchJsonPath}`);
    } catch (jsonError) {
      logWarning(`未找到产品调研数据: ${researchTxtPath} 或 ${researchJsonPath}`);
    }
  }

  // 读取内容调研数据
  try {
    contentResearchData = await fs.readFile(contentResearchTxtPath, 'utf-8');
    logSuccess(`读取内容调研数据 (TXT): ${contentResearchTxtPath}`);
  } catch (error) {
    // TXT不存在，尝试读取JSON
    try {
      const jsonData = await fs.readFile(contentResearchJsonPath, 'utf-8');
      const parsed = JSON.parse(jsonData);
      // 将JSON数据转换为文本格式
      contentResearchData = JSON.stringify(parsed, null, 2);
      logSuccess(`读取内容调研数据 (JSON): ${contentResearchJsonPath}`);
    } catch (jsonError) {
      logWarning(`未找到内容调研数据: ${contentResearchTxtPath} 或 ${contentResearchJsonPath}`);
    }
  }

  return { researchData, contentResearchData };
}

/**
 * 读取现有的 en.json
 */
async function loadExistingContent(slug) {
  const enPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');
  try {
    const content = await fs.readFile(enPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logWarning(`未找到现有内容: ${enPath}`);
    return null;
  }
}

/**
 * 构建 section 要求的 prompt
 */
function buildSectionRequirements(sections, keyword) {
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  let requirements = '';

  if (sections.includes('seo')) {
    requirements += `
1. 写 1 个 SEO 友好的 Title 和 Meta Description
   * 要清晰传达工具核心价值
   * 包含主关键词
   * **重要：SEO Description 必须完整包含主关键词「${keyword}」，不能拆分或缩写**
   * **Title 必须包含 "Free" 关键词**
   * **Meta Description 必须包含 "free" 关键词，强调免费使用**
   * Title 长度 ≤ 60 字符；Description 在 120–160 字符之间
   * 注意：Title 中不要包含品牌名 VibeTrans（系统会自动添加）
   * 完成后计算这个section每个版本写了多少字符。
`;
  }

  if (sections.includes('h1')) {
    requirements += `
2. 写 1 个 SEO 友好的 H1 标题
   * 直接点明工具名称和主要用途
   * 自然包含目标关键词
   * 不出现品牌名
   * 完成后计算这个section每个版本写了多少单词。
`;
  }

  if (sections.includes('heroDescription')) {
    requirements += `
3. 写 H1 下的描述（30–40 单词）
   * 简要说明工具功能和使用价值
   * 使用对话式语气，突出用户利益
   * **重要：Hero Description 必须完整包含主关键词「${keyword}」，不能拆分或缩写**
   * 展示品牌词：VibeTrans
   * 完成后计算这个section每个版本写了多少单词。
`;
  }

  if (sections.includes('whatIs')) {
    requirements += `
4. 写 "What is ${keyword}" 板块
   * 标题为：What is ${keyword}
   * 正文以 "${keyword} is …" 开头，正面回答问题
   * 扩展解释功能和应用场景，长度约 70 单词
   * 展示品牌词：VibeTrans
   * 完成后计算这个section写了多少单词。
`;
  }

  if (sections.includes('examples')) {
    requirements += `
5. 写 6 个案例
   * 案例必须与「${keyword}」主题强相关
   * 每个案例的 alt 约30个单词
   * 案例description: 40-50个单词介绍案例表的作用
   * 完成后计算这个section的 description 和每个 alt 写了多少单词
`;
  }

  if (sections.includes('howTo')) {
    requirements += `
6. 写 "How to use ${keyword}" 板块
   * 标题：How to use ${keyword}
   * 标题下有一句简短说明
   * 写 3–4 个步骤，每个步骤：
     - 名称以动词开头（如 Upload a File）
     - 详细描述 40 词左右，强调操作细节
   * 语言保持简单易懂
   * 展示品牌词：VibeTrans
   * 完成后计算这个section写了多少单词。
`;
  }

  if (sections.includes('funFacts')) {
    requirements += `
7. 写 2 个 Fun Facts
   * 每个 40 单词左右 (严格要求 38-42 词之间)
   * **返回格式：{ "title": "标题", "description": "内容" }**
   * **重要：使用 description 字段存储内容，不要使用 content 字段**
   * **重要：不要在正文内容中包含"(40 words)"这样的字数标注，这些标注不算在字数内**
   * 内容有趣、易懂，和工具或相关主题紧密相关
   * 写作中增加个人情感或主观评论（如"我喜欢或我认为"）
   * 写作中包含随意性或独特性（如俚语、轶事）
   * 展示品牌词：VibeTrans
   * 基于上面的调研数据，融入用户关心的话题和高频关键词
   * 必须确保每个正文内容本身就有40个完整的词（不包括任何标注）
`;
  }

  if (sections.includes('unique') || sections.includes('interestingSections')) {
    requirements += `
8. 写 4 个用户可能感兴趣的内容板块 (User Interest / Unique Section)
   * 4个小板块的大板块标题: "Discover More with VibeTrans"
   * 每个包含标题 + 正文（严格要求 68-72 词，最好是正好 70 词）
   * **重要：不要在正文内容中包含"(70 words)"这样的字数标注，这些标注不算在字数内**
   * 写作中增加个人情感或主观评论（如"我喜欢或我认为"）
   * 写作中包含随意性或独特性（如俚语、轶事）
   * 展示品牌词：VibeTrans
   * 文案要切入用户关注点：功能、痛点、应用场景或优势
   * 基于上面的调研数据，解决用户真正关心的问题
   * 自然融入调研中发现的高频关键词
   * 必须确保每个正文内容本身就有70个完整的词（不包括任何标注）
`;
  }

  if (sections.includes('highlights')) {
    requirements += `
9. 写Highlight板块的文案
   * 板块的标题
   * 4个产品特点的文案，5选4（简单免费使用、数据准确性、数据隐私安全、AI的对上下文的理解、更多解释）
   * 为每个特点写一个简短的标题
   * 写40单词左右的说明
   * 展示品牌词：VibeTrans
`;
  }

  if (sections.includes('testimonials')) {
    requirements += `
10. 写6个用户评价，每个评价需要有:
    * 用户姓名：听起来像美国人的姓名
    * 角色：和使用产品的人群匹配的职业角色
    * 评价标题（heading）：4-8个单词，提炼评价内容的核心主旨或亮点（例如 "A Game Changer for My Classroom"）
    * 评价内容：2-3句话。要求：60-70个单词之间，像真人、有具体的产品使用细节！引入真实用户使用场景故事，包含前后的情感叙述。
    * 完成后计算每个评价写了多少单词
`;
  }

  if (sections.includes('faqs')) {
    requirements += `
11. 写 6 个 FAQ（问题 + 答案）
    * 要求：
      1. 每个答案 40–90 词
      2. What is 问题必须以 "${keyword} is …" 开头
      3. 不出现 What is [关键词] 问题
      4. **How to 问题必须用明确的 step-by-step 格式回答，每个步骤必须使用 "Step 1", "Step 2", "Step 3", "Step 4" 这样的标记，并且每个 Step 之间要换行或者用句号分隔清晰**
      5. 例如："To translate a document with VibeTrans, follow these steps: Step 1, upload your text file. Step 2, choose your settings. Step 3, click Translate. Step 4, download your results."
      6. 语言直接、正面、清晰
      7. 完成后计算这个section写了多少单词
      8. 默认有的问题：这个软件免费吗？我们的隐私如何？
`;
  }

  if (sections.includes('cta')) {
    requirements += `
12. 写页面底部的CTA，包含标题和一句话描述，要求标题和内容都包含关键词和品牌词
`;
  }

  if (sections.includes('imagePrompts')) {
    requirements += `
13. **图片生成 Prompts** - 为以下7张图片生成详细的AI生成Prompt（每个Prompt 150-200词）:

   📸 需要生成的图片列表:
   1️⃣ What Is 图片: what-is-${slug}.webp
   2️⃣ Fun Fact #1 图片: ${slug}-fact-1.webp
   3️⃣ Fun Fact #2 图片: ${slug}-fact-2.webp
   4️⃣ User Interest #1 图片: ${slug}-interest-1.webp
   5️⃣ User Interest #2 图片: ${slug}-interest-2.webp
   6️⃣ User Interest #3 图片: ${slug}-interest-3.webp
   7️⃣ User Interest #4 图片: ${slug}-interest-4.webp

   每个 Prompt 必须:
   * 150-200个英文单词
   * 使用 "Geometric Flat Style cartoon illustration" 开头
   * 必须包含 "clean lines" 和颜色描述
   * 必须以 "no text, no logo" 结尾
   * 描述具体的几何形状和视觉元素
   * 与对应板块的内容强相关
`;
  }

  return requirements;
}

/**
 * 构建 JSON 输出格式
 */
function buildJSONFormat(sections, keyword) {
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  let format = '```json\n{\n';

  if (sections.includes('seo')) {
    format += `  "seo": {
    "title": "SEO标题",
    "metaDescription": "Meta描述"
  },\n`;
  }

  if (sections.includes('h1')) {
    format += `  "h1": {
    "title": "H1标题"
  },\n`;
  }

  if (sections.includes('heroDescription')) {
    format += `  "heroDescription": {
    "content": "Hero描述"
  },\n`;
  }

  if (sections.includes('whatIs')) {
    format += `  "whatIs": {
    "title": "What is XXX",
    "content": "内容"
  },\n`;
  }

  if (sections.includes('examples')) {
    format += `  "examples": {
    "title": "标题",
    "description": "描述",
    "items": [
      {
        "alt": "案例描述",
        "name": "案例名称"
      }
    ]
  },\n`;
  }

  if (sections.includes('howTo')) {
    format += `  "howTo": {
    "title": "How to XXX",
    "description": "简短说明",
    "steps": [
      {
        "title": "步骤标题",
        "description": "步骤描述"
      }
    ]
  },\n`;
  }

  if (sections.includes('funFacts')) {
    format += `  "funFacts": [
    {
      "title": "趣味事实标题1",
      "description": "趣味事实内容1"
    },
    {
      "title": "趣味事实标题2",
      "description": "趣味事实内容2"
    }
  ],\n`;
  }

  if (sections.includes('unique') || sections.includes('interestingSections')) {
    format += `  "unique": {
    "title": "Discover More with VibeTrans",
    "items": [
      {
        "title": "小板块标题1",
        "content": "内容1"
      },
      {
        "title": "小板块标题2",
        "content": "内容2"
      },
      {
        "title": "小板块标题3",
        "content": "内容3"
      },
      {
        "title": "小板块标题4",
        "content": "内容4"
      }
    ]
  },\n`;
  }

  if (sections.includes('highlights')) {
    format += `  "highlights": {
    "title": "Highlight标题",
    "features": [
      {
        "title": "特点标题",
        "description": "描述"
      }
    ]
  },\n`;
  }

  if (sections.includes('testimonials')) {
    format += `  "testimonials": [
    {
      "name": "用户姓名",
      "role": "职业角色",
      "heading": "评价标题",
      "content": "评价内容"
    }
  ],\n`;
  }

  if (sections.includes('faqs')) {
    format += `  "faqs": [
    {
      "question": "问题",
      "answer": "答案"
    }
  ],\n`;
  }

  if (sections.includes('cta')) {
    format += `  "cta": {
    "title": "CTA标题",
    "description": "CTA描述"
  },\n`;
  }

  if (sections.includes('imagePrompts')) {
    format += `  "imagePrompts": [
    {
      "filename": "what-is-${slug}.webp",
      "section": "What Is",
      "title": "What Is板块标题",
      "prompt": "完整的150-200词Prompt"
    }
  ],\n`;
  }

  format = format.replace(/,\n$/, '\n'); // 移除最后的逗号
  format += '}\n```';

  return format;
}

/**
 * 验证字数
 */
function validateWordCounts(data, sections) {
  const issues = [];

  if (sections.includes('heroDescription') && data.heroDescription) {
    const words = data.heroDescription.content.split(/\s+/).length;
    if (words < 30 || words > 40) {
      issues.push(`Hero Description: ${words} 词 (要求: 30-40 词)`);
    }
  }

  if (sections.includes('whatIs') && data.whatIs) {
    const words = data.whatIs.content.split(/\s+/).length;
    if (words < 68 || words > 72) {
      issues.push(`What Is: ${words} 词 (要求: 70 词)`);
    }
  }

  if (sections.includes('funFacts') && data.funFacts) {
    data.funFacts.forEach((fact, index) => {
      const words = fact.description.split(/\s+/).length;
      // 允许 ±5 词的误差范围
      if (words < 33 || words > 47) {
        issues.push(`Fun Fact ${index + 1}: ${words} 词 (要求: 38-42 词，±5可接受)`);
      }
    });
  }

  if ((sections.includes('unique') || sections.includes('interestingSections')) && data.unique) {
    data.unique.items.forEach((item, index) => {
      const words = item.content.split(/\s+/).length;
      // 允许 ±5 词的误差范围
      if (words < 63 || words > 77) {
        issues.push(`User Interest ${index + 1}: ${words} 词 (要求: 68-72 词，±5可接受)`);
      }
    });
  }

  if (sections.includes('howTo') && data.howTo) {
    data.howTo.steps.forEach((step, index) => {
      const words = step.description.split(/\s+/).length;
      if (words < 38 || words > 42) {
        issues.push(`How-to Step ${index + 1}: ${words} 词 (要求: 40 词)`);
      }
    });
  }

  if (sections.includes('highlights') && data.highlights) {
    data.highlights.features.forEach((feature, index) => {
      const words = feature.description.split(/\s+/).length;
      if (words < 38 || words > 42) {
        issues.push(`Highlight ${index + 1}: ${words} 词 (要求: 40 词)`);
      }
    });
  }

  if (sections.includes('testimonials') && data.testimonials) {
    data.testimonials.forEach((testimonial, index) => {
      const words = testimonial.content.split(/\s+/).length;
      if (words < 60 || words > 70) {
        issues.push(`Testimonial ${index + 1}: ${words} 词 (要求: 60-70 词)`);
      }
    });
  }

  if (sections.includes('faqs') && data.faqs) {
    data.faqs.forEach((faq, index) => {
      const words = faq.answer.split(/\s+/).length;
      if (words < 40 || words > 90) {
        issues.push(`FAQ ${index + 1}: ${words} 词 (要求: 40-90 词)`);
      }
    });
  }

  return issues;
}

/**
 * 更新 en.json 中的指定 sections
 */
async function updateEnJson(slug, generatedData, sections) {
  const enPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');

  // 读取现有的 en.json
  let existingContent;
  try {
    const content = await fs.readFile(enPath, 'utf-8');
    existingContent = JSON.parse(content);
  } catch (error) {
    logError(`无法读取 ${enPath}: ${error.message}`);
    throw error;
  }

  // 获取页面命名空间
  const pageName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Page';

  if (!existingContent[pageName]) {
    logError(`en.json 中未找到 ${pageName} 命名空间`);
    throw new Error(`Missing ${pageName} in en.json`);
  }

  // 更新指定的 sections
  if (sections.includes('seo') && generatedData.seo) {
    existingContent[pageName].title = generatedData.seo.title;
    existingContent[pageName].description = generatedData.seo.metaDescription;
    logSuccess('✓ 已更新 SEO (title, description)');
  }

  if (sections.includes('h1') && generatedData.h1) {
    existingContent[pageName].hero.title = generatedData.h1.title;
    logSuccess('✓ 已更新 H1 (hero.title)');
  }

  if (sections.includes('heroDescription') && generatedData.heroDescription) {
    existingContent[pageName].hero.description = generatedData.heroDescription.content;
    logSuccess('✓ 已更新 Hero Description (hero.description)');
  }

  if (sections.includes('whatIs') && generatedData.whatIs) {
    existingContent[pageName].whatIs = {
      title: generatedData.whatIs.title,
      description: generatedData.whatIs.content,
    };
    logSuccess('✓ 已更新 What Is');
  }

  if (sections.includes('examples') && generatedData.examples) {
    existingContent[pageName].examples = generatedData.examples;
    logSuccess('✓ 已更新 Examples');
  }

  if (sections.includes('howTo') && generatedData.howTo) {
    existingContent[pageName].howto = generatedData.howTo;
    logSuccess('✓ 已更新 How To');
  }

  if (sections.includes('funFacts') && generatedData.funFacts) {
    // 同时更新 funFacts 和 userScenarios 两个字段（不同页面可能使用不同的字段名）

    // 1. 更新 funFacts 字段（主字段，页面代码读取）
    if (existingContent[pageName].funFacts) {
      const existingFunFacts = existingContent[pageName].funFacts;
      existingContent[pageName].funFacts = {
        title: existingFunFacts.title || 'Fun Facts',
        items: generatedData.funFacts.map((fact, index) => {
          const existingItem = existingFunFacts?.items?.[index];
          return {
            title: fact.title,
            description: fact.description,  // ← 使用 description
            // 保留现有的图片字段
            ...(existingItem?.image && { image: existingItem.image }),
            ...(existingItem?.imageAlt && { imageAlt: existingItem.imageAlt }),
          };
        }),
      };
      logSuccess('✓ 已更新 funFacts 字段，保留了现有图片字段');
    }

    // 2. 更新 userScenarios 字段（如果存在，用于兼容旧页面）
    if (existingContent[pageName].userScenarios) {
      const existingUserScenarios = existingContent[pageName].userScenarios;
      existingContent[pageName].userScenarios = {
        title: existingUserScenarios.title || 'Fun Facts',
        items: generatedData.funFacts.map((fact, index) => {
          const existingItem = existingUserScenarios?.items?.[index];
          return {
            title: fact.title,
            description: fact.description,  // ← 使用 description
            // 保留现有的图片字段
            ...(existingItem?.image && { image: existingItem.image }),
            ...(existingItem?.imageAlt && { imageAlt: existingItem.imageAlt }),
          };
        }),
      };
      logSuccess('✓ 已更新 userScenarios 字段，保留了现有图片字段');
    }
  }

  if ((sections.includes('unique') || sections.includes('interestingSections')) && generatedData.unique) {
    // 同时更新 unique 和 userInterest 两个字段（不同页面可能使用不同的字段名）

    // 1. 更新 userInterest 字段（主字段，页面代码读取）
    if (existingContent[pageName].userInterest) {
      const existingUserInterest = existingContent[pageName].userInterest;
      existingContent[pageName].userInterest = {
        title: existingUserInterest.title || 'Discover More with VibeTrans',  // 保留原 title
        subtitle: existingUserInterest.subtitle || 'Tailored Solutions for Users',
        description: existingUserInterest.description || 'Exploring unique features and capabilities',
        items: generatedData.unique.items.map((item, index) => {
          const existingItem = existingUserInterest?.items?.[index];
          return {
            title: item.title,
            description: item.content,  // ← unique 的 content 映射到 userInterest 的 description
            // 保留现有的图片字段
            ...(existingItem?.image && { image: existingItem.image }),
            ...(existingItem?.imageAlt && { imageAlt: existingItem.imageAlt }),
          };
        }),
      };
      logSuccess('✓ 已更新 userInterest 字段，保留了现有图片字段');
    }

    // 2. 更新 unique 字段（如果存在，用于兼容）
    if (existingContent[pageName].unique) {
      const existingUnique = existingContent[pageName].unique;
      existingContent[pageName].unique = {
        title: existingUnique.title || 'Discover More with VibeTrans',  // 保留原 title
        subtitle: existingUnique.subtitle || 'Tailored Solutions for Users',
        description: existingUnique.description || 'Exploring unique features and capabilities',
        items: generatedData.unique.items.map((item, index) => {
          const existingItem = existingUnique?.items?.[index];
          return {
            title: item.title,
            content: item.content,  // ← unique 字段保持使用 content
            // 保留现有的图片字段
            ...(existingItem?.image && { image: existingItem.image }),
            ...(existingItem?.imageAlt && { imageAlt: existingItem.imageAlt }),
          };
        }),
      };
      logSuccess('✓ 已更新 unique 字段，保留了现有图片字段');
    }
  }

  if (sections.includes('highlights') && generatedData.highlights) {
    existingContent[pageName].highlights = {
      title: generatedData.highlights.title,
      description: 'Discover what makes our tool unique',
      items: generatedData.highlights.features.map((feature) => ({
        title: feature.title,
        description: feature.description,
      })),
    };
    // 同时更新 features (用于其他组件)
    existingContent[pageName].features = {
      title: 'Core Features',
      subtitle: 'An intelligent tool crafted for users.',
      items: generatedData.highlights.features
        .slice(0, 4)
        .reduce((acc, feature, index) => {
          acc[`item-${index + 1}`] = {
            title: feature.title,
            description: feature.description,
          };
          return acc;
        }, {}),
    };
    logSuccess('✓ 已更新 Highlights & Features');
  }

  if (sections.includes('testimonials') && generatedData.testimonials) {
    existingContent[pageName].testimonials = {
      title: 'What Our Users Are Saying',
      subtitle: 'Real feedback from real users',
      items: generatedData.testimonials.reduce((acc, testimonial, index) => {
        acc[`item-${index + 1}`] = {
          name: testimonial.name,
          role: testimonial.role,
          heading: testimonial.heading,
          content: testimonial.content,
        };
        return acc;
      }, {}),
    };
    logSuccess('✓ 已更新 Testimonials');
  }

  if (sections.includes('faqs') && generatedData.faqs) {
    existingContent[pageName].faqs = {
      title: 'Frequently Asked Questions',
      subtitle: 'Have other questions? Feel free to contact us via email.',
      items: generatedData.faqs.reduce((acc, faq, index) => {
        acc[`item-${index + 1}`] = {
          question: faq.question,
          answer: faq.answer,
        };
        return acc;
      }, {}),
    };
    logSuccess('✓ 已更新 FAQs');
  }

  if (sections.includes('cta') && generatedData.cta) {
    existingContent[pageName].cta = {
      title: generatedData.cta.title,
      description: generatedData.cta.description,
      primaryButton: existingContent[pageName].cta?.primaryButton || 'Try Now',
      secondaryButton: existingContent[pageName].cta?.secondaryButton || 'Back to Top',
    };
    logSuccess('✓ 已更新 CTA');
  }

  // 保存更新后的内容
  await fs.writeFile(enPath, JSON.stringify(existingContent, null, 2));
  logSuccess(`✅ en.json 已自动更新: ${enPath}`);

  return existingContent;
}

/**
 * 重新生成指定sections的内容
 */
async function regenerateSections(keyword, sections) {
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');

  // 支持 "all" 快捷方式
  const allSections = [
    'seo',
    'h1',
    'heroDescription',
    'whatIs',
    'examples',
    'howTo',
    'funFacts',
    'unique',
    'highlights',
    'testimonials',
    'faqs',
    'cta',
  ];

  let sectionsToGenerate = sections;
  if (sections.includes('all')) {
    sectionsToGenerate = allSections;
    logInfo('使用 "all" 快捷方式，将生成所有 sections');
  }

  // 处理别名
  if (sectionsToGenerate.includes('interestingSections')) {
    sectionsToGenerate = sectionsToGenerate.map(s => s === 'interestingSections' ? 'unique' : s);
  }

  log('\n🔄 VibeTrans Section 内容重新生成器', 'bright');
  logInfo(`关键词: ${keyword}`);
  logInfo(`要重新生成的sections: ${sectionsToGenerate.join(', ')}`);
  logInfo(`内容模型: ${CONFIG.contentModel}`);

  // 1. 读取调研数据
  log('\n' + '='.repeat(60), 'cyan');
  log('📖 Step 1: 读取调研数据', 'bright');
  log('='.repeat(60), 'cyan');

  const { researchData, contentResearchData } = await loadResearchData(slug);

  if (!researchData || !contentResearchData) {
    logError('缺少调研数据！需要先运行完整的 auto-tool-generator');
    logInfo(`运行: pnpm tool:auto "${keyword}"`);
    process.exit(1);
  }

  // 2. 构建prompt
  log('\n' + '='.repeat(60), 'cyan');
  log('✍️  Step 2: 生成内容', 'bright');
  log('='.repeat(60), 'cyan');

  // 只提取产品规划部分（第五点）
  const productPlanOnly = extractProductPlan(researchData);

  const productPlan = `
【产品规划】
${productPlanOnly}
`;

  const contentResearchSummary = `
【内容调研摘要】
${contentResearchData}
`;

  const sectionsRequirement = buildSectionRequirements(sectionsToGenerate, keyword);
  const jsonFormat = buildJSONFormat(sectionsToGenerate, keyword);

  const prompt = `你现在是一个英文 SEO 文案写手，参考以下调研数据。帮我为「${keyword}」重新生成指定section的内容，要求如下：

${sectionsRequirement}

请记住背景信息：

${productPlan}

${contentResearchSummary}

写作风格要求：
1. 使用通俗易懂的英文词汇，7 年级以下学生也能理解
2. 采用对话式、口语化语气，比如，使用 "You" 和 "VibeTrans"
3. 文案简洁直接，句子短，避免长难句
4. 每个板块尽可能多给细节，避免空洞描述
5. 每个板块内容避免重复，保持独特信息点
6. 文案中自然融入上面调研得到的高频关键词，但始终优先考虑可读性
7. 写作中增加个人情感或主观评论（如"我喜欢，我认为"）
8. 写作中包含随意性或独特性（如俚语、轶事）
9. 写作中包含更多个人经验或权威建议
10. 不要使用emoji或icon
11. **严格遵守字数要求，不要在内容中加入"(30 words)"或"(50 words)"这样的标注**
12. 最后检查：去掉所有标注后，每个content字段的实际单词数必须符合要求
13. **特别注意：unique section的每个item需要写足60词左右，可以通过增加更多细节、例子、个人体验来达到字数**

**重要：请严格按照下面的JSON格式输出，字段名必须完全一致！**

${jsonFormat}`;

  const response = await callOpenAI(
    CONFIG.contentModel,
    [{ role: 'user', content: prompt }],
    0.7
  );

  // 保存原始响应
  const rawOutputPath = path.join(
    CONFIG.outputDir,
    slug,
    `section-regenerate-${Date.now()}.txt`
  );
  await fs.writeFile(rawOutputPath, response);
  logInfo(`原始响应已保存到: ${rawOutputPath}`);

  // 提取 JSON
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    logWarning('未能从响应中提取 JSON，请查看原始文件');
    logInfo(`查看: ${rawOutputPath}`);
    process.exit(1);
  }

  let contentData;
  try {
    contentData = JSON.parse(jsonMatch[1]);
  } catch (error) {
    logError(`JSON解析失败: ${error.message}`);
    logInfo(`请查看原始响应: ${rawOutputPath}`);
    throw error;
  }

  // 3. 验证字数
  log('\n' + '='.repeat(60), 'cyan');
  log('✔️  Step 3: 验证字数', 'bright');
  log('='.repeat(60), 'cyan');

  const issues = validateWordCounts(contentData, sectionsToGenerate);

  if (issues.length > 0) {
    logWarning(`发现 ${issues.length} 个字数问题:`);
    issues.forEach((issue) => logWarning(`  - ${issue}`));
    logWarning('\n建议: 手动调整或重新运行脚本');
  } else {
    logSuccess('✅ 所有字数都符合要求！');
  }

  // 4. 自动更新 en.json
  log('\n' + '='.repeat(60), 'cyan');
  log('📤 Step 4: 自动更新 en.json', 'bright');
  log('='.repeat(60), 'cyan');

  await updateEnJson(slug, contentData, sectionsToGenerate);

  // 5. 输出备份结果
  const outputPath = path.join(
    CONFIG.outputDir,
    slug,
    `section-content-${Date.now()}.json`
  );
  await fs.writeFile(outputPath, JSON.stringify(contentData, null, 2));
  logSuccess(`备份已保存到: ${outputPath}`);

  // 显示内容预览
  log('\n📋 内容预览:', 'bright');
  console.log(JSON.stringify(contentData, null, 2));

  log('\n' + '='.repeat(60), 'green');
  log('🎉 内容生成并自动更新完成！', 'green');
  log('='.repeat(60), 'green');

  logInfo('\n📋 完成的操作:');
  logInfo(`1. ✅ 已生成 ${sectionsToGenerate.length} 个 section 的内容`);
  logInfo(`2. ✅ 已自动更新到 messages/pages/${slug}/en.json`);
  logInfo(`3. ✅ 备份已保存到 ${outputPath}`);
  logInfo('4. 💡 建议运行 pnpm dev 查看效果');

  return contentData;
}

/**
 * 主函数
 */
async function main() {
  const keyword = process.argv[2];
  const sectionsArg = process.argv[3];

  if (!keyword || !sectionsArg) {
    logError('请提供关键词和sections参数');
    logInfo('使用方法: node scripts/regenerate-section-content.js "pig latin translator" "unique,funFacts"');
    logInfo('或使用: node scripts/regenerate-section-content.js "pig latin translator" "all"');
    logInfo('');
    logInfo('可用的sections:');
    logInfo('  - seo (SEO标题和描述)');
    logInfo('  - h1 (H1标题)');
    logInfo('  - heroDescription (Hero描述)');
    logInfo('  - whatIs (What Is板块)');
    logInfo('  - examples (案例)');
    logInfo('  - howTo (How To板块)');
    logInfo('  - funFacts (趣味事实)');
    logInfo('  - unique (用户感兴趣内容)');
    logInfo('  - highlights (产品亮点)');
    logInfo('  - testimonials (用户评价)');
    logInfo('  - faqs (常见问题)');
    logInfo('  - cta (CTA)');
    logInfo('  - all (所有sections)');
    process.exit(1);
  }

  const sections = sectionsArg.split(',').map(s => s.trim());

  try {
    await regenerateSections(keyword, sections);
  } catch (error) {
    logError(`\n生成失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行主函数
main();
