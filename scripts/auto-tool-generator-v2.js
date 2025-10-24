#!/usr/bin/env node

/**
 * 🚀 VibeTrans 自动化工具生成器 V2.0
 *
 * 优化版本：
 * - 智能工具类型检测
 * - 合并调研Phase
 * - 类型化内容生成
 * - 即时验证机制
 * - 智能图片风格选择
 *
 * 使用方法：
 * node scripts/auto-tool-generator-v2.js "rune translator"
 */

const { exec, execSync, spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { config } = require('dotenv');

const execAsync = promisify(exec);

// 加载 .env.local 文件
config({ path: '.env.local' });

// 获取当前文件路径（CommonJS环境）
const currentFilename = require.main.filename;
// 获取当前文件目录
const currentDirname = path.dirname(currentFilename);
// 项目根目录
const ROOT_DIR = path.resolve(currentDirname, '..');

// 配置
const CONFIG = {
  gptApiKey: process.env.OPENAI_API_KEY || '',

  // 🎯 调研模型配置
  researchModel: process.env.RESEARCH_MODEL || 'o3-mini',

  // 🎯 内容生成模型配置
  contentModel: process.env.CONTENT_MODEL || 'gpt-4o',

  outputDir: path.join(ROOT_DIR, '.tool-generation'),
  srcDir: path.join(ROOT_DIR, 'src'),
  publicDir: path.join(ROOT_DIR, 'public'),
  messagesDir: path.join(ROOT_DIR, 'messages'),

  // 🎯 新增验证配置
  enableWordCountValidation:
    process.env.ENABLE_WORD_COUNT_VALIDATION !== 'false',
  enablePageErrorCheck: process.env.ENABLE_PAGE_ERROR_CHECK !== 'false',
  devServerPort: process.env.DEV_SERVER_PORT || 3000,
  maxWordCountRetries: 2,
  pageCheckTimeout: 30000,
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
 * Phase 0.5: 智能工具类型检测
 */
async function phase0_5_detectToolType(keyword) {
  logPhase('0.5', '智能工具类型检测');

  const funTranslatorPatterns = [
    /alien|demon|angel|dragon|rune|elvish|dwarven/i,
    /game.*language|fictional|fantasy|mythology/i,
    /meme|slang|emoji|cipher|code/i,
    /tongue|script.*ancient|lost.*language/i,
  ];

  const languageTranslatorPatterns = [
    /chinese|english|spanish|french|german|italian/i,
    /translate.*to.*\w+|language.*converter/i,
    /professional|business|academic|technical/i,
  ];

  const isFunTool = funTranslatorPatterns.some((pattern) =>
    pattern.test(keyword)
  );
  const isLanguageTool = languageTranslatorPatterns.some((pattern) =>
    pattern.test(keyword)
  );

  const toolType = {
    isFunTool,
    isLanguageTool,
    category: isFunTool ? 'fun' : isLanguageTool ? 'language' : 'general',
    keywords: {
      primary: keyword.toLowerCase().replace(/\s+/g, '-'),
      style: isFunTool ? 'entertainment' : 'professional',
    },
  };

  logInfo(`检测到工具类型: ${toolType.category.toUpperCase()}`);
  logInfo(`关键词: ${toolType.keywords.primary}`);

  return toolType;
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
 * Phase 1: 合并的深度调研 (原Phase 1 + 2)
 */
async function phase1_comprehensiveResearch(keyword, toolType) {
  logPhase(1, `综合调研 (${CONFIG.researchModel})`);

  const prompt = `请为「${keyword}」做深度竞品分析和市场调研，使用英文搜索，中文回答我：

**VibeTrans 产品背景：**
- 我们提供免费的专业翻译工具
- 支持文本、文件上传、语音输入输出
- 强调准确性和用户体验
- 所有工具都支持web端，不提供app，不支持离线使用

**调研要求：**

1. **竞品功能分析 (Google搜索前15名)**
   - 每个竞品的核心功能列表
   - UI设计风格和用户体验
   - 定价策略（免费/付费）
   - 目标用户群体
   - 市场定位和差异化优势

2. **Reddit和Quora社区洞察**
   - 高频讨论话题和投票数
   - 用户真实痛点和需求
   - 常见的使用场景和反馈
   - 社区文化特点

3. **市场空白识别**
   - 竞品都缺少的关键功能
   - 用户最想要但得不到的功能
   - 创新机会和市场切入点
   - 差异化竞争优势

4. **基于工具类型的专项分析**
   ${
     toolType.isFunTool
       ? `
   **Fun Translator 专项：**
   - 游戏文化IP结合点
   - 娱乐性和互动性功能
   - 社区分享和病毒传播特性
   - 视觉和音效设计要点
   `
       : ''
   }
   ${
     toolType.isLanguageTool
       ? `
   **Professional Translator 专项：**
   - 专业术语和行业支持
   - 准确性和可靠性要求
   - 商务和企业应用场景
   - 数据安全和隐私保护
   `
       : ''
   }

5. **创新功能建议**
   - 基于市场空白的3个创新功能
   - 每个功能的具体实现方案
   - 预期用户价值和商业潜力

请以 JSON 格式输出：
\`\`\`json
{
  "keyword": "${keyword}",
  "productName": "产品名称",
  "description": "一句话产品介绍",
  "competitors": [
    {
      "name": "竞品名称",
      "url": "网址",
      "features": ["特点1", "特点2"],
      "pricing": "free/paid",
      "targetUsers": "目标用户",
      "uiStyle": "设计风格"
    }
  ],
  "socialInsights": {
    "redditTopics": [
      {
        "topic": "话题标题",
        "votes": 1000,
        "sentiment": "positive/negative/mixed",
        "keyInsights": "核心洞察"
      }
    ],
    "quoraTopics": [
      {
        "topic": "话题标题",
        "followers": 500,
        "engagement": "high/medium/low",
        "expertAnswers": "专家回答总结"
      }
    ]
  },
  "marketGaps": [
    {
      "gap": "市场空白描述",
      "opportunity": "机会分析",
      "competitorsMissing": ["竞品1", "竞品2"]
    }
  ],
  "innovativeFeatures": [
    {
      "feature": "创新功能1",
      "description": "详细描述",
      "implementation": "实现方案",
      "userValue": "用户价值"
    }
  ],
  "toolSpecific": {
    "type": "${toolType.category}",
    "style": "${toolType.keywords.style}",
    "specialFocus": "专项重点"
  }
}
\`\`\``;

  const response = await callOpenAI(
    CONFIG.researchModel,
    [{ role: 'user', content: prompt }],
    0.8
  );

  // 提取 JSON
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  let jsonString;

  if (!jsonMatch) {
    const trimmedResponse = response.trim();
    if (trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) {
      logInfo('检测到直接 JSON 格式（无代码块包裹）');
      jsonString = trimmedResponse;
    } else {
      logWarning('未能从响应中提取 JSON，保存原始响应');
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
    const cleanedJson = jsonString
      .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, '')
      .replace(/"asciiDesign":\s*"([^"]*(?:\n[^"]*)*)"/, (match, content) => {
        const escaped = content
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/"/g, '\\"');
        return `"asciiDesign": "${escaped}"`;
      });

    researchData = JSON.parse(cleanedJson);
  } catch (parseError) {
    logError(`JSON 解析失败: ${parseError.message}`);
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

  logSuccess(`综合调研完成，结果保存到: ${outputPath}`);
  return researchData;
}

/**
 * Phase 2: 代码生成（使用现有 CLI 工具）
 */
async function phase2_generateCode(keyword, researchData) {
  logPhase(2, '代码生成');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const title = keyword
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  logInfo(`生成工具: ${slug} (${title})`);

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
 * 生成类型特定的内容生成prompt
 */
function generateTypeSpecificPrompt(keyword, toolType, researchData) {
  let typeSpecificRequirements = '';

  if (toolType.isFunTool) {
    typeSpecificRequirements = `
🎮 Fun Translator 特殊要求：
- 突出娱乐性和趣味性
- 强调社区互动功能
- 加入游戏文化IP元素
- 使用活泼、年轻化的语言风格
- 增加视觉和音效描述
- 适合粉丝文化cosplay、游戏玩家群体
`;
  } else {
    typeSpecificRequirements = `
🏢 Professional Translator 特殊要求：
- 强调准确性和专业性
- 突出商务应用场景
- 加入技术细节说明
- 使用正式、专业的语言风格
- 强调数据安全和隐私保护
- 适合商务人士、学生、翻译工作者
`;
  }

  return typeSpecificRequirements;
}

/**
 * Phase 3: 类型化内容生成
 */
async function phase3_generateContent(keyword, researchData, toolType) {
  logPhase(3, `类型化内容生成 (${CONFIG.contentModel})`);

  const typeSpecificRequirements = generateTypeSpecificPrompt(
    keyword,
    toolType,
    researchData
  );

  const productPlan = `
产品名称：${researchData.productName || keyword}
一句话产品介绍：${researchData.description || ''}
工具类型：${toolType.category.toUpperCase()}
风格导向：${toolType.keywords.style}
创新功能：${researchData.innovativeFeatures?.map((f) => f.feature).join('、') || ''}
`;

  const competitorAnalysis = `
竞品分析结果：
- 竞品功能：${researchData.competitors?.map((c) => c.features?.join('、')).join('; ') || ''}
- 市场空白：${researchData.marketGaps?.map((g) => g.gap).join('; ') || ''}
- 社区洞察：${researchData.socialInsights?.redditTopics?.map((t) => t.topic).join('; ') || ''}
`;

  const prompt = `你现在是一个英文 SEO 文案写手，为「${keyword}」创作落地页文案。

${typeSpecificRequirements}

**核心要求：**
1. VibeTrans是免费工具，所有翻译功能完全免费
2. 仅支持web端使用，不支持移动app，不支持离线使用
3. 所有翻译工具都包含：文本输入、文件上传(.txt, .docx)、语音输入、结果下载、复制功能

**竞品和调研背景：**
${competitorAnalysis}

**SEO和内容要求：**

1. **SEO 标题和描述**
   - Title: ≤ 60字符，必须包含主关键词
   - Meta Description: 120-160字符，必须完整包含关键词
   - H1: 直接点明工具名称和用途

2. **Hero 区域描述 (20-30单词)**
   - 必须包含 "best" 关键词
   - 必须完整包含主关键词
   - 突出免费和易用性

3. **What is 板块 (约60单词)**
   - 以 "XXXX is …" 开头
   - 突出核心价值和独特性

4. **Example 板块 (40-50单词)**
   - 展示翻译效果和使用案例
   - 体现工具的实际价值

5. **How to 板块**
   - 3-4个清晰步骤
   - 每步40词左右，强调操作细节

6. **2个 Fun Facts (每个30词)**
   - 内容有趣、易懂，与主题紧密相关
   - 保持客观中性，避免个人化表达

7. **4个用户兴趣板块 (每个50词)**
   - 切入用户关注点和痛点
   - 展示实际应用场景

8. **4个核心特点 (每个40词)**
   - 5选4：简单免费、数据准确、隐私安全、AI理解、更多选择
   - 保持客观中性写作风格

9. **6个用户评价 (每个50-60词)**
   - 真实使用场景故事
   - 包含前后情感变化
   - 像真人一样的语言风格

10. **3个FAQ (每个30-80词)**
    - 必须包含 "What is best XXX" 问题
    - 必须说明：免费、仅支持web端、不支持离线
    - 基于调研发现的用户关心问题

**写作风格：**
- 通俗易懂，7年级学生也能理解
- 对话式语气，突出用户利益
- 简洁直接，避免长难句
- 自然融入调研发现的关键词

${productPlan}

请以 JSON 格式输出：
\`\`\`json
{
  "seo": {
    "title": "SEO标题",
    "metaDescription": "Meta描述"
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
    ]
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

  // 验证个人化表达
  const personalExpressionIssues = [];
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

  if (contentData.highlights?.features) {
    contentData.highlights.features.forEach((feature, index) => {
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

  if (personalExpressionIssues.length > 0) {
    logWarning(
      `⚠️  内容生成中发现 ${personalExpressionIssues.length} 处个人化表达`
    );
    personalExpressionIssues.forEach((issue) => {
      logWarning(
        `   - ${issue.section}: "${issue.pattern}" (${issue.count} 处)`
      );
    });
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
 * 快速验证基础结构
 */
async function quickValidation(contentData, keyword) {
  const quickChecks = [
    { name: 'SEO标题', path: 'seo.title', required: true },
    { name: 'H1标题', path: 'h1.title', required: true },
    { name: 'Hero描述', path: 'heroDescription.content', required: true },
    { name: 'What is', path: 'whatIs.content', required: true },
    {
      name: 'Fun Facts数量',
      path: 'funFacts.length',
      required: true,
      minCount: 2,
    },
    {
      name: '用户兴趣板块数量',
      path: 'interestingSections.sections.length',
      required: true,
      minCount: 4,
    },
    {
      name: 'Highlight特点数量',
      path: 'highlights.features.length',
      required: true,
      minCount: 4,
    },
    {
      name: '用户评价数量',
      path: 'testimonials.length',
      required: true,
      minCount: 6,
    },
    { name: 'FAQ数量', path: 'faqs.length', required: true, minCount: 3 },
  ];

  const issues = [];

  for (const check of quickChecks) {
    const value = getNestedValue(contentData, check.path);

    if (check.required && !value) {
      issues.push({
        type: 'missing_required',
        field: check.name,
        message: `缺少必需字段: ${check.name}`,
      });
    }

    if (
      check.minCount &&
      Array.isArray(value) &&
      value.length < check.minCount
    ) {
      issues.push({
        type: 'insufficient_count',
        field: check.name,
        current: value.length,
        required: check.minCount,
        message: `${check.name}数量不足，当前${value.length}个，需要至少${check.minCount}个`,
      });
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    needsRegeneration: issues.length > 0,
  };
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 字数验证和重新生成
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

  // 验证 highlights.features
  if (contentData.highlights?.features) {
    contentData.highlights.features.forEach((feature, index) => {
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
 * 重新生成单个 section
 */
async function regenerateSection(
  keyword,
  sectionInfo,
  contentData,
  researchData,
  toolType
) {
  logInfo(
    `重新生成: ${sectionInfo.name} (当前字数: ${sectionInfo.actual}, 期望: ${sectionInfo.expected})`
  );

  const { section } = sectionInfo;
  let prompt = '';

  const typeSpecificRequirements = generateTypeSpecificPrompt(
    keyword,
    toolType,
    researchData
  );

  switch (section) {
    case 'h1':
      prompt = `请为「${keyword}」重新写一个 SEO 友好的 H1 标题。
${typeSpecificRequirements}
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
      prompt = `请为「${keyword}」重新写 H1 下的描述。
${typeSpecificRequirements}
要求：
- 25-30 个单词
- 简要说明工具功能和使用价值
- 使用对话式语气，突出用户利益
- 必须包含 "best" 关键词，突出工具优势
- 强调免费使用特性

请以 JSON 格式输出：
\`\`\`json
{
  "content": "描述内容",
  "wordCount": 25
}
\`\`\``;
      break;

    case 'whatIs':
      prompt = `请为「${keyword}」重新写 "What is XXXX" 板块。
${typeSpecificRequirements}
要求：
- 约 60 单词
- 以 "XXXX is …" 开头，正面回答问题
- 扩展解释功能和应用场景
- 突出免费和易用性

请以 JSON 格式输出：
\`\`\`json
{
  "title": "What is XXX",
  "content": "内容",
  "wordCount": 60
}
\`\`\``;
      break;

    case 'example':
      prompt = `请为「${keyword}」重新写 Example 板块的 title 和 description。
${typeSpecificRequirements}
要求：
- 40-50 个单词
- 展示翻译效果和使用案例
- 体现工具的实际价值和免费特性

请以 JSON 格式输出：
\`\`\`json
{
  "title": "标题",
  "description": "描述",
  "wordCount": 45
}
\`\`\``;
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
    default:
      logWarning(`未知的更新 section 类型: ${section}`);
  }
}

/**
 * Phase 3.5: 验证和重新生成
 */
async function phase3_5_validateAndRegenerate(
  keyword,
  contentData,
  researchData,
  toolType
) {
  if (!CONFIG.enableWordCountValidation) {
    logInfo('字数验证已禁用，跳过 Phase 3.5');
    return contentData;
  }

  logPhase('3.5', '验证和重新生成');

  // 首先进行快速验证
  const quickValidationResult = await quickValidation(contentData, keyword);
  if (!quickValidationResult.passed) {
    logWarning('快速验证发现问题，开始修复...');
    logWarning('发现问题:');
    quickValidationResult.issues.forEach((issue) => {
      logWarning(`  - ${issue.message}`);
    });
    logWarning('由于是基础结构问题，将跳过后续流程');
    return contentData;
  }

  let retryCount = 0;
  const currentContentData = JSON.parse(JSON.stringify(contentData));

  while (retryCount <= CONFIG.maxWordCountRetries) {
    const invalidSections = validateWordCounts(currentContentData);

    if (invalidSections.length === 0) {
      logSuccess('所有 section 字数验证通过！');
      break;
    }

    if (retryCount === CONFIG.maxWordCountRetries) {
      logWarning(`已达到最大重试次数 (${CONFIG.maxWordCountRetries})`);
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

    for (const sectionInfo of invalidSections) {
      const result = await regenerateSection(
        keyword,
        sectionInfo,
        currentContentData,
        researchData,
        toolType
      );

      if (result) {
        updateContentData(currentContentData, result.section, result.data);
        logSuccess(`✓ ${sectionInfo.name} 已重新生成`);
      } else {
        logWarning(`✗ ${sectionInfo.name} 重新生成失败，保留原内容`);
      }
    }

    const outputPath = path.join(
      CONFIG.outputDir,
      keyword.replace(/\s+/g, '-'),
      `content-retry-${retryCount}.json`
    );
    await fs.writeFile(outputPath, JSON.stringify(currentContentData, null, 2));
    logInfo(`重试 ${retryCount} 的内容已保存到: ${outputPath}`);
  }

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
 * Phase 4: 生成翻译文件
 */
async function phase4_generateTranslations(keyword, contentData) {
  logPhase(4, '生成翻译文件（messages/pages/{slug}/en.json）');

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
        items: [
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
      funFacts: {
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
      highlights: contentData.highlights,
      testimonials: {
        title: 'What Users Say',
        subtitle: 'Real feedback from real users',
        items: contentData.testimonials.reduce((acc, item, index) => {
          acc[`item-${index + 1}`] = {
            name: item.name,
            role: item.role,
            heading: `Review from ${item.name}`,
            content: item.content,
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

  logWarning('⚠️  请手动翻译中文版本');
  logInfo(`创建文件: ${path.join(pageTranslationDir, 'zh.json')}`);
  logInfo('使用与 en.json 相同的结构，将内容翻译为中文');

  return { pageName, enTranslation, slug };
}

/**
 * Phase 5.5: JSON文件与代码匹配检测
 */
async function phase5_5_validateJsonCodeMatch(keyword, translationData) {
  logPhase('5.5', 'JSON文件与代码匹配检测');

  const { slug, pageName } = translationData;
  const issues = [];

  const enJsonPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');
  const pageTsxPath = path.join(
    CONFIG.srcDir,
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    'page.tsx'
  );
  const toolTsxPath = path.join(
    CONFIG.srcDir,
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    `${pageName}Tool.tsx`
  );

  try {
    await fs.access(enJsonPath);
    logSuccess('✓ en.json 文件存在');
  } catch (error) {
    issues.push({ type: 'file_missing', file: 'en.json', path: enJsonPath });
    logError('✗ en.json 文件不存在');
  }

  try {
    await fs.access(pageTsxPath);
    logSuccess('✓ page.tsx 文件存在');
  } catch (error) {
    issues.push({ type: 'file_missing', file: 'page.tsx', path: pageTsxPath });
    logError('✗ page.tsx 文件不存在');
  }

  try {
    await fs.access(toolTsxPath);
    logSuccess('✓ Tool组件文件存在');
  } catch (error) {
    issues.push({
      type: 'file_missing',
      file: `${pageName}Tool.tsx`,
      path: toolTsxPath,
    });
    logError('✗ Tool组件文件不存在');
  }

  if (issues.length > 0) {
    logError('关键文件缺失，无法继续匹配检测');
    return { success: false, issues };
  }

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
    return { success: false, issues };
  }

  const requiredFields = [
    'hero.title',
    'hero.description',
    'whatIs.title',
    'whatIs.description',
    'examples.title',
    'examples.description',
    'howto.title',
    'howto.description',
    'funFacts.title',
    'highlights.title',
    'testimonials.title',
    'faqs.title',
    'cta.title',
  ];

  for (const field of requiredFields) {
    const value = getNestedValue(enJsonContent, `${pageName}.${field}`);
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      issues.push({ type: 'missing_field', field: `${pageName}.${field}` });
      logWarning(`⚠️  缺少字段或字段为空: ${field}`);
    }
  }

  let pageTsxContent;
  try {
    pageTsxContent = await fs.readFile(pageTsxPath, 'utf-8');
  } catch (error) {
    issues.push({
      type: 'file_read_error',
      file: 'page.tsx',
      error: error.message,
    });
    logError(`✗ 无法读取page.tsx: ${error.message}`);
    return { success: false, issues };
  }

  const criticalKeys = [
    'hero.title',
    'hero.description',
    'whatIs.title',
    'whatIs.description',
    'examples.title',
    'howto.title',
    'funFacts.title',
    'highlights.title',
    'testimonials.title',
    'faqs.title',
    'cta.title',
  ];

  for (const key of criticalKeys) {
    const fullKey = `${pageName}.${key}`;
    const tKeyPattern = new RegExp(
      `t\\(['"\`]${key.replace('.', '\\.')}['"\`]\\)`,
      'g'
    );

    if (!tKeyPattern.test(pageTsxContent)) {
      const alternativePattern = new RegExp(
        `t\\(['"\`](\\w+\\.)?${key.split('.').pop()}['"\`]\\)`,
        'g'
      );
      if (!alternativePattern.test(pageTsxContent)) {
        issues.push({ type: 'unused_translation_key', key: fullKey });
        logWarning(`⚠️  翻译键可能未被引用: ${key}`);
      }
    }
  }

  let toolTsxContent;
  try {
    toolTsxContent = await fs.readFile(toolTsxPath, 'utf-8');
  } catch (error) {
    issues.push({
      type: 'file_read_error',
      file: `${pageName}Tool.tsx`,
      error: error.message,
    });
    logError(`✗ 无法读取Tool组件: ${error.message}`);
    return { success: false, issues };
  }

  const toolKeys = [
    'tool.inputLabel',
    'tool.outputLabel',
    'tool.inputPlaceholder',
    'tool.outputPlaceholder',
    'tool.translateButton',
    'tool.uploadButton',
    'tool.loading',
    'tool.error',
  ];

  for (const key of toolKeys) {
    const fullKey = `${pageName}.${key}`;
    const tKeyPattern = new RegExp(
      `t\\(['"\`]${key.replace('.', '\\.')}['"\`]\\)`,
      'g'
    );

    if (!tKeyPattern.test(toolTsxContent)) {
      issues.push({ type: 'unused_tool_translation_key', key: fullKey });
      logWarning(`⚠️  工具翻译键可能未被引用: ${key}`);
    }
  }

  const arrayFields = [
    'examples.items',
    'funFacts.items',
    'userInterest.items',
    'testimonials.items',
    'faqs.items',
  ];

  for (const field of arrayFields) {
    const value = getNestedValue(enJsonContent, `${pageName}.${field}`);
    if (value && Array.isArray(value)) {
      if (value.length === 0) {
        issues.push({ type: 'empty_array', field: `${pageName}.${field}` });
        logWarning(`⚠️  数组字段为空: ${field}`);
      }
    } else {
      issues.push({
        type: 'missing_array_field',
        field: `${pageName}.${field}`,
      });
      logWarning(`⚠️  缺少数组字段: ${field}`);
    }
  }

  logInfo('\n📊 JSON匹配检测报告:');

  if (issues.length === 0) {
    logSuccess('✅ 所有检测项目都通过！');
    logSuccess('✓ JSON文件结构完整');
    logSuccess('✓ 翻译键在代码中被正确引用');
    logSuccess('✓ 数组字段包含必要内容');

    return {
      success: true,
      issues: [],
      summary: {
        totalChecks:
          requiredFields.length +
          criticalKeys.length +
          toolKeys.length +
          arrayFields.length,
        passedChecks:
          requiredFields.length +
          criticalKeys.length +
          toolKeys.length +
          arrayFields.length,
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
        } else if (item.key) {
          logWarning(`    - ${item.key}`);
        } else if (item.file) {
          logWarning(`    - ${item.file}: ${item.path || item.error || ''}`);
        }
      });
    });

    logInfo('\n💡 建议:');
    if (issues.some((i) => i.type.includes('unused'))) {
      logInfo('  - 检查页面代码是否正确引用了JSON中的翻译字段');
      logInfo('  - 确认翻译键名称与代码中的引用完全匹配');
    }
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
        totalChecks:
          requiredFields.length +
          criticalKeys.length +
          toolKeys.length +
          arrayFields.length,
        passedChecks:
          requiredFields.length +
          criticalKeys.length +
          toolKeys.length +
          arrayFields.length -
          issues.length,
        failedChecks: issues.length,
      },
    };
  }
}

/**
 * Phase 5.6: 图片路径一致性验证测试
 */
async function phase5_6_validateImageConsistency(keyword, translationData) {
  logPhase('5.6', '图片路径一致性验证测试');

  const { slug, pageName } = translationData;
  const issues = [];

  // 验证文件路径
  const enJsonPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');
  const pageTsxPath = path.join(
    CONFIG.srcDir,
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    'page.tsx'
  );

  try {
    // 读取JSON和页面文件
    const enJsonContent = await fs.readFile(enJsonPath, 'utf-8');
    const jsonData = JSON.parse(enJsonContent);
    const pageTsxContent = await fs.readFile(pageTsxPath, 'utf-8');

    logInfo('开始验证图片路径一致性...');

    // 1. 检查JSON中的图片路径是否在public目录中实际存在
    const imagePaths = extractImagePathsFromJson(jsonData, pageName);
    logInfo(`发现 ${imagePaths.length} 个图片引用在JSON中`);

    for (const imagePath of imagePaths) {
      const fullImagePath = path.join(
        CONFIG.publicDir,
        imagePath.replace('/images/', 'images/')
      );

      try {
        await fs.access(fullImagePath);
        logSuccess(`✓ 图片文件存在: ${imagePath}`);
      } catch (error) {
        issues.push({
          type: 'missing_image_file',
          imagePath,
          fullPath: fullImagePath,
          error: 'Image file referenced in JSON does not exist',
        });
        logError(`✗ 图片文件缺失: ${imagePath}`);
      }
    }

    // 2. 检查页面代码中是否存在硬编码的图片路径
    const hardcodedImagePaths = extractHardcodedImagePaths(pageTsxContent);
    logInfo(`发现 ${hardcodedImagePaths.length} 个硬编码图片路径在页面代码中`);

    for (const hardcodedPath of hardcodedImagePaths) {
      // 检查是否应该使用JSON引用而是硬编码
      const isUsingCorrectPattern =
        /t\(['"]\w+\.\w+\.\w+\['"]['"]\.image['"]\)\)/.test(pageTsxContent);

      if (!isUsingCorrectPattern && hardcodedPath.includes('/images/')) {
        issues.push({
          type: 'hardcoded_image_path',
          path: hardcodedPath,
          error:
            'Page code contains hardcoded image path instead of using JSON reference',
        });
        logError(`✗ 硬编码图片路径: ${hardcodedPath}`);
      }
    }

    // 3. 检查翻译键引用一致性
    const imageKeysInJson = extractImageKeysFromJson(jsonData, pageName);
    const imageKeyReferences = extractImageKeyReferences(pageTsxContent);

    logInfo(`JSON中有 ${imageKeysInJson.length} 个图片键`);
    logInfo(`页面代码中有 ${imageKeyReferences.length} 个图片键引用`);

    // 检查JSON中的图片键是否在页面中被引用
    for (const imageKey of imageKeysInJson) {
      const isReferenced = imageKeyReferences.some((ref) =>
        ref.includes(imageKey)
      );
      if (!isReferenced) {
        issues.push({
          type: 'unreferenced_image_key',
          key: imageKey,
          error: 'Image key in JSON is not referenced in page code',
        });
        logWarning(`⚠️  未被引用的图片键: ${imageKey}`);
      }
    }

    // 4. 检查代码耦合问题 - 确保使用动态JSON引用而非硬编码
    const couplingIssues = checkCodeCoupling(
      pageTsxContent,
      jsonData,
      pageName
    );
    issues.push(...couplingIssues);

    // 生成测试报告
    logInfo('\n📊 图片路径一致性测试报告:');

    if (issues.length === 0) {
      logSuccess('✅ 所有图片路径一致性测试通过！');
      logSuccess('✓ 图片文件都在正确位置');
      logSuccess('✓ 页面代码使用JSON引用而非硬编码');
      logSuccess('✓ 翻译键引用一致性良好');
      logSuccess('✓ 无代码耦合问题');

      return {
        success: true,
        issues: [],
        summary: {
          totalChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length,
          passedChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length,
          failedChecks: 0,
        },
      };
    } else {
      logWarning(`⚠️  发现 ${issues.length} 个图片路径一致性问题:`);

      // 按类型分组显示问题
      const issuesByType = {};
      issues.forEach((issue) => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);
      });

      Object.entries(issuesByType).forEach(([type, items]) => {
        const typeNames = {
          missing_image_file: '缺失图片文件',
          hardcoded_image_path: '硬编码图片路径',
          unreferenced_image_key: '未引用图片键',
          code_coupling: '代码耦合问题',
        };
        logWarning(`\n  ${typeNames[type] || type} (${items.length}个):`);
        items.forEach((item) => {
          if (item.imagePath) {
            logWarning(`    - ${item.imagePath}`);
          } else if (item.path) {
            logWarning(`    - ${item.path}`);
          } else if (item.key) {
            logWarning(`    - ${item.key}`);
          }
        });
      });

      // 提供修复建议
      logInfo('\n💡 修复建议:');
      if (issues.some((i) => i.type === 'missing_image_file')) {
        logInfo('  - 运行图片生成脚本生成缺失的图片文件');
        logInfo('  - 或者更新JSON中的图片路径为现有文件');
      }
      if (issues.some((i) => i.type === 'hardcoded_image_path')) {
        logInfo('  - 将硬编码图片路径替换为JSON翻译键引用');
        logInfo('  - 使用 t("namespace.section.items.index.image") 模式');
      }
      if (issues.some((i) => i.type === 'unreferenced_image_key')) {
        logInfo('  - 在页面代码中添加对JSON图片键的引用');
        logInfo('  - 或者从JSON中移除未使用的图片键');
      }
      if (issues.some((i) => i.type === 'code_coupling')) {
        logInfo('  - 修复代码与JSON配置的耦合问题');
        logInfo('  - 确保所有动态内容通过翻译键获取');
      }

      return {
        success: false,
        issues,
        summary: {
          totalChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length,
          passedChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length -
            issues.length,
          failedChecks: issues.length,
        },
      };
    }
  } catch (error) {
    logError(`图片路径一致性验证失败: ${error.message}`);
    return {
      success: false,
      error: error.message,
      issues: [],
    };
  }
}

/**
 * 从JSON中提取所有图片路径
 */
function extractImagePathsFromJson(jsonData, pageName) {
  const imagePaths = [];
  const pageData = jsonData[pageName];

  if (!pageData) return imagePaths;

  // 递归提取所有image字段
  function extractImages(obj, basePath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;

      if (
        key === 'image' &&
        typeof value === 'string' &&
        value.startsWith('/images/')
      ) {
        imagePaths.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractImages(value, currentPath);
      }
    }
  }

  extractImages(pageData);
  return imagePaths;
}

/**
 * 从页面代码中提取硬编码图片路径
 */
function extractHardcodedImagePaths(content) {
  const hardcodedPaths = [];

  // 匹配各种硬编码图片路径模式
  const patterns = [
    /src=['"]\/images\/[^'"]+['"]/g,
    /image:\s*['"]\/images\/[^'"]+['"]/g,
    /backgroundImage:\s*url\(['"]\/images\/[^'"]+['"]\)/g,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // 提取路径部分
        const pathMatch = match.match(/\/images\/[^'")\s]+/);
        if (pathMatch) {
          hardcodedPaths.push('/' + pathMatch[0]);
        }
      });
    }
  });

  return hardcodedPaths;
}

/**
 * 从JSON中提取图片键
 */
function extractImageKeysFromJson(jsonData, pageName) {
  const imageKeys = [];
  const pageData = jsonData[pageName];

  if (!pageData) return imageKeys;

  function extractKeys(obj, basePath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;

      if (key === 'image' && typeof value === 'string') {
        // 记录到图片字段的完整路径
        if (basePath) {
          imageKeys.push(basePath);
        }
      } else if (typeof value === 'object' && value !== null) {
        extractKeys(value, currentPath);
      }
    }
  }

  extractKeys(pageData);
  return imageKeys;
}

/**
 * 从页面代码中提取图片键引用
 */
function extractImageKeyReferences(content) {
  const references = [];

  // 匹配 t() 函数中对图片的引用
  const patterns = [
    /t\(['"]([^'"]+)\.image['"]\)/g,
    /t\(['"]([^'"]+)\.imageAlt['"]\)/g,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const keyMatch = match.match(/t\(['"]([^'"]+)['"]/);
        if (keyMatch) {
          references.push(keyMatch[1]);
        }
      });
    }
  });

  return references;
}

/**
 * 检查代码耦合问题
 */
function checkCodeCoupling(pageContent, jsonData, pageName) {
  const couplingIssues = [];

  // 检查是否应该使用JSON但使用了硬编码
  const hardcodedPatterns = [
    {
      pattern: /src=['"][^'"]*rune[^'"]*\.webp['"]/gi,
      description: '硬编码rune相关图片路径',
    },
    {
      pattern: /src=['"][^'"]*magic[^'"]*\.webp['"]/gi,
      description: '硬编码magic相关图片路径',
    },
    {
      pattern: /src=['"][^'"]*fact[^'"]*\.webp['"]/gi,
      description: '硬编码fact相关图片路径',
    },
  ];

  hardcodedPatterns.forEach(({ pattern, description }) => {
    const matches = pageContent.match(pattern);
    if (matches) {
      couplingIssues.push({
        type: 'code_coupling',
        description,
        matches: matches.slice(0, 3), // 只显示前3个
        error: 'Should use JSON translation key instead of hardcoded path',
      });
    }
  });

  // 检查数据结构耦合问题
  const pageData = jsonData[pageName];
  if (pageData) {
    // 检查 howto 结构耦合
    if (pageData.howto) {
      const hasSteps = Array.isArray(pageData.howto.steps);
      const hasItems = Array.isArray(pageData.howto.items);

      // 检查页面代码是否使用了错误的引用
      const wrongHowtoRefs = pageContent.match(/howto\.\w+\.\d+\.\w+/g);
      if (wrongHowtoRefs) {
        wrongHowtoRefs.forEach((ref) => {
          if (ref.includes('steps') && !hasSteps) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有steps数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          } else if (ref.includes('items') && !hasItems) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有items数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          }
        });
      }
    }

    // 检查 highlights 结构耦合
    if (pageData.highlights) {
      const hasFeatures = Array.isArray(pageData.highlights.features);
      const hasItems = Array.isArray(pageData.highlights.items);

      // 检查页面代码是否使用了错误的引用
      const wrongHighlightRefs = pageContent.match(
        /highlights\.\w+\.\d+\.\w+/g
      );
      if (wrongHighlightRefs) {
        wrongHighlightRefs.forEach((ref) => {
          if (ref.includes('features') && !hasFeatures) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有features数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          } else if (ref.includes('items') && !hasItems) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有items数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          }
        });
      }
    }
  }

  return couplingIssues;
}

/**
 * Phase 6: 智能图片生成
 */
async function phase6_generateImages(keyword, contentData, toolType) {
  logPhase(6, '智能图片生成');

  const slug = keyword.toLowerCase().replace(/\s+/g, '-');

  const imageStyle = toolType.isFunTool
    ? {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      }
    : {
        style: 'professional, clean, business-oriented',
        keywords: ['professional', 'accurate', 'efficient', 'secure'],
        layout: 'structured, informative',
      };

  const sections = {
    toolName: slug,
    whatIs: {
      title: contentData.whatIs.title,
      content: contentData.whatIs.content,
      style: imageStyle,
    },
    funFacts: contentData.funFacts.map((fact) => ({
      title: fact.title || 'Fun Fact',
      content: fact.content,
      style: imageStyle,
    })),
    userInterests: contentData.interestingSections.sections.map((section) => ({
      title: section.title,
      content: section.content,
      style: imageStyle,
    })),
  };

  logInfo('Starting smart image generation workflow...');
  logInfo(`Image style: ${imageStyle.style}`);
  logInfo('  1. Gemini analyzes content -> generates prompts');
  logInfo('  2. Volcano 4.0 generates images');
  logInfo('   3. Save to public/images/docs/');
  logInfo('  4. Auto update en.json references\n');

  try {
    const scriptPath = path.join(
      ROOT_DIR,
      'scripts',
      `generate-${slug}-images-smart.ts`
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
    style: '${imageStyle.style}',
    keywords: ${JSON.stringify(imageStyle.keywords)}
  });

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
    logSuccess(`智能图片生成脚本已创建: ${scriptPath}`);

    logInfo('开始生成图片（预计 15-25 分钟）...\n');
    execSync(`pnpm tsx ${scriptPath}`, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
    });

    logSuccess('图片生成完成！\n');

    const resultContent = await fs.readFile(resultPath, 'utf-8');
    const imageResult = JSON.parse(resultContent);

    logInfo('自动更新图片引用到 en.json...');

    const imageMapping = {
      whatIs:
        imageResult.images.find((img) => img.section === 'whatIs')?.filename ||
        null,
      funFacts: imageResult.images
        .filter((img) => img.section.startsWith('funFacts'))
        .map((img) => `/images/docs/${img.filename}`),
      userInterests: imageResult.images
        .filter((img) => img.section.startsWith('userInterests'))
        .map((img) => `/images/docs/${img.filename}`),
    };

    await updateEnJsonWithImages(slug, imageMapping);

    logSuccess('图片引用已自动更新！');

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
 * 更新 en.json 中的图片引用
 */
async function updateEnJsonWithImages(slug, imageMapping) {
  const enPath = path.join(ROOT_DIR, 'messages', 'pages', slug, 'en.json');

  try {
    const content = await fs.readFile(enPath, 'utf-8');
    const jsonData = JSON.parse(content);

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

    await fs.writeFile(enPath, JSON.stringify(jsonData, null, 2));

    return { success: true, updated };
  } catch (error) {
    logError(`更新 en.json 失败: ${error.message}`);
    throw error;
  }
}

/**
 * Phase 7: SEO 配置
 */
async function phase7_configureSEO(keyword, translationData) {
  logPhase(7, 'SEO 配置（sitemap, navbar, footer, i18n）');

  const { slug, pageName } = translationData;
  const title = keyword
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

  if (
    !marketingEn.Marketing?.navbar?.languageTranslator?.items?.[camelCaseName]
  ) {
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

  // 2. 更新 navbar-config.tsx
  logInfo('更新 navbar-config.tsx...');
  const navbarPath = path.join(CONFIG.srcDir, 'config', 'navbar-config.tsx');
  let navbarContent = await fs.readFile(navbarPath, 'utf-8');

  if (!navbarContent.includes(`Routes.${routeEnumName}`)) {
    const navbarEntry = `        {
          title: t('languageTranslator.items.${camelCaseName}.title'),
          icon: <SparklesIcon className="size-4 shrink-0" />,
          href: Routes.${routeEnumName},
          external: false,
        },`;

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
      logInfo('footer-config.tsx 已包含此工具');
    }
  }

  // 4. 更新 src/i18n/messages.ts
  logInfo('更新 src/i18n/messages.ts...');
  const messagesPath = path.join(CONFIG.srcDir, 'i18n', 'messages.ts');
  let messagesContent = await fs.readFile(messagesPath, 'utf-8');

  const camelCaseVarName =
    slug
      .split('-')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('') + 'Pages';

  if (!messagesContent.includes(`${camelCaseVarName} =`)) {
    const lastPageImportMatch = messagesContent.match(
      /import\(`\.\.\/\.\.\/messages\/pages\/[^\/]+\/\$\{locale\}\.json`\),\n/g
    );

    if (lastPageImportMatch) {
      const lastImport = lastPageImportMatch[lastPageImportMatch.length - 1];
      const importStatement = `    import(\`../../messages/pages/${slug}/\${locale}.json\`),\n`;

      messagesContent = messagesContent.replace(
        lastImport,
        lastImport + importStatement
      );
    }

    const importListMatch = messagesContent.match(
      /const (\w+) = await import\(`\.\.\/\.\.\/messages\/pages\/[^\/]+\/\$\{locale\}\.json`\);/
    );

    if (importListMatch) {
      const lastImportMatch = messagesContent.match(
        /const (\w+) = await import\(`\.\.\/\.\.\/messages\/pages\/[^\/]+\/\$\{locale\}\.json`\);\n/g
      );

      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const importStatement = `  const ${camelCaseVarName} = await import(\`../../messages/pages/${slug}/\${locale}.json\`);\n`;

        messagesContent = messagesContent.replace(
          lastImport,
          lastImport + importStatement
        );
      }
    }

    const deepmergeMatch = messagesContent.match(
      /return deepmerge\.all\(\[\n([\s\S]*?)\n {2}\]\) as Messages;/
    );

    if (deepmergeMatch) {
      const mergeList = deepmergeMatch[1];
      const newMergeEntry = `    ${camelCaseVarName}.default,`;

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

  logWarning('\n⚠️  其他 SEO 配置需要手动添加：');
  logInfo(`  1. 更新 sitemap.xml，添加路径: /${slug}`);
  logInfo(' 2. 更新 explore other tools 配置');
  logInfo('  3. 生成 SEO 图片（og:image）');

  return { slug, title };
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

  logInfo(`检查端口 ${port} 是否有服务运行...`);
  const serverRunning = await isPortInUse(port);

  let devServerProcess = null;

  if (!serverRunning) {
    logInfo('开发服务器未运行，正在启动...');

    try {
      devServerProcess = spawn('pnpm', ['dev'], {
        cwd: ROOT_DIR,
        stdio: 'pipe',
        detached: false,
      });

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

      const html = await response.text();

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
    if (devServerProcess && !serverRunning) {
      logInfo('\n开发服务器由脚本启动');
      logWarning('请手动停止开发服务器（Ctrl+C）或保持运行以便测试');
    }
  }
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

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * 主函数
 */
async function main() {
  const keyword = process.argv[2];

  if (!keyword) {
    logError('请提供关键词参数');
    logInfo(
      '使用方法: node scripts/auto-tool-generator-v2.js "rune translator"'
    );
    process.exit(1);
  }

  log('\n🚀 VibeTrans 自动化工具生成器 V2.0', 'bright');
  logInfo(`关键词: ${keyword}`);
  logInfo(`调研模型: ${CONFIG.researchModel}`);
  logInfo(`内容模型: ${CONFIG.contentModel}`);
  logInfo(`输出目录: ${CONFIG.outputDir}`);

  try {
    // Phase 0.5: 智能工具类型检测
    const toolType = await phase0_5_detectToolType(keyword);

    // Phase 1: 合并的深度调研
    const researchData = await phase1_comprehensiveResearch(keyword, toolType);

    // Phase 2: 代码生成
    const codeData = await phase2_generateCode(keyword, researchData);

    // Phase 3: 类型化内容生成
    let contentData = await phase3_generateContent(
      keyword,
      researchData,
      toolType
    );

    // Phase 3.5: 验证和重新生成
    contentData = await phase3_5_validateAndRegenerate(
      keyword,
      contentData,
      researchData,
      toolType
    );

    // Phase 4: 生成翻译文件
    const translationData = await phase4_generateTranslations(
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

    // Phase 5.6: 图片路径一致性验证测试 (新增)
    const imageConsistencyResult = await phase5_6_validateImageConsistency(
      keyword,
      translationData
    );

    if (!imageConsistencyResult.success) {
      logWarning('\n⚠️  图片路径一致性验证发现问题，但继续后续流程');
      logWarning(
        `检测到 ${imageConsistencyResult.summary.failedChecks} 个图片路径问题，请后续检查修复`
      );
      logInfo('   这将确保图片文件存在且代码使用正确的JSON引用');
    } else {
      logSuccess('\n✅ 图片路径一致性验证通过');
    }

    // Phase 6: 智能图片生成
    const imageData = await phase6_generateImages(
      keyword,
      contentData,
      toolType
    );

    // Phase 7: SEO 配置
    const seoData = await phase7_configureSEO(keyword, translationData);

    // Phase 8.5: 页面错误自动检查
    const pageCheckResult = await phase8_5_checkPageErrors(keyword);

    // 完成
    log('\n' + '='.repeat(60), 'green');
    log('🎉 V2.0 工具生成完成！', 'green');
    log('='.repeat(60), 'green');

    if (!pageCheckResult.success) {
      logWarning('\n⚠️  页面检查发现问题：');
      logWarning(`   ${pageCheckResult.error || pageCheckResult.warning}`);
      logWarning('   建议手动检查页面后再继续');
    } else if (!pageCheckResult.skipped) {
      logSuccess('\n✓ 页面检查通过');
    }

    logInfo('\n后续步骤：');
    logInfo('1. 手动翻译 messages/zh.json');

    if (!jsonMatchResult.success) {
      logWarning(
        `2. ⚠️  JSON匹配检测发现 ${jsonMatchResult.summary.failedChecks} 个问题，需要修复`
      );
      logWarning('   检查日志了解具体问题和修复建议');
    } else {
      logSuccess('2. ✓ JSON文件与代码匹配检测通过');
    }

    if (!imageConsistencyResult.success) {
      logWarning(
        `3. ⚠️  图片路径一致性验证发现 ${imageConsistencyResult.summary.failedChecks} 个问题，需要修复`
      );
      logWarning('   检查日志了解具体图片路径和代码耦合问题');
    } else {
      logSuccess('3. ✓ 图片路径一致性验证通过');
    }

    if (imageData.success) {
      logInfo('4. ✓ 图片已自动生成并更新引用');
    } else {
      logWarning('4. ⚠️  图片生成失败，需要手动生成图片');
    }

    logInfo('5. 更新 sitemap, navbar, footer');
    logInfo('6. 运行 pnpm build 验证构建');
    logInfo('7. 提交代码并上线');
  } catch (error) {
    logError(`\n生成失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行主函数
main();
