const fs = require('fs');
const path = require('path');

// 所有的翻译工具列表
const allTranslatorTools = [
  'al-bhed-translator',
  'albanian-to-english',
  'alien-text-generator',
  'ancient-greek-translator',
  'aramaic-translator',
  'baby-translator',
  'bad-translator',
  'baybayin-translator',
  'cantonese-translator',
  'chinese-to-english-translator',
  'creole-to-english-translator',
  'cuneiform-translator',
  'dog-translator',
  'dumb-it-down',
  'esperanto-translator',
  'gaster-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'gibberish-translator',
  'high-valyrian-translator',
  'ivr-translator',
  'middle-english-translator',
  'minion-translator',
  'pig-latin-translator',
  'samoan-to-english-translator',
  'verbose-generator',
];

// 分析结果
const analysisResults = [];

console.log('开始分析所有翻译工具页面的FAQ内容...\n');

// 检查每个工具页面
allTranslatorTools.forEach((toolName) => {
  const filePath = path.join(
    __dirname,
    '..',
    'messages',
    'pages',
    toolName,
    'en.json'
  );

  try {
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // 获取页面主对象名（可能是工具名的驼峰命名）
      const pageKey = Object.keys(content).find(
        (key) =>
          key
            .toLowerCase()
            .includes(toolName.replace(/-/g, '').toLowerCase()) ||
          key.toLowerCase().includes('page')
      );

      if (pageKey && content[pageKey]?.faqs?.items) {
        const faqs = content[pageKey].faqs.items;
        const questions = Object.values(faqs).map(
          (item) => item.question || ''
        );

        // 检查是否包含"best"类型的问题
        const hasBestQuestion = questions.some(
          (q) =>
            q.toLowerCase().includes('what is best') ||
            q.toLowerCase().includes('which is best') ||
            q.toLowerCase().includes('what is the best') ||
            q.toLowerCase().includes('which is the best')
        );

        // 查找包含"best"的问题
        const bestQuestions = questions.filter((q) =>
          q.toLowerCase().includes('best')
        );

        analysisResults.push({
          toolName,
          displayName: toolName
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          faqCount: questions.length,
          hasBestQuestion,
          bestQuestions,
          allQuestions: questions,
        });

        console.log(
          `✓ ${toolName}: ${questions.length} 个FAQ问题, 包含"best"问题: ${hasBestQuestion}`
        );
        if (bestQuestions.length > 0) {
          console.log(`    "best"问题: ${bestQuestions.join(', ')}`);
        }
      } else {
        console.log(`✗ ${toolName}: 未找到FAQ部分`);
        analysisResults.push({
          toolName,
          displayName: toolName
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          faqCount: 0,
          hasBestQuestion: false,
          bestQuestions: [],
          allQuestions: [],
          error: '未找到FAQ部分',
        });
      }
    } else {
      console.log(`✗ ${toolName}: 文件不存在`);
      analysisResults.push({
        toolName,
        displayName: toolName
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        faqCount: 0,
        hasBestQuestion: false,
        bestQuestions: [],
        allQuestions: [],
        error: '文件不存在',
      });
    }
  } catch (error) {
    console.log(`✗ ${toolName}: 解析错误 - ${error.message}`);
    analysisResults.push({
      toolName,
      displayName: toolName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      faqCount: 0,
      hasBestQuestion: false,
      bestQuestions: [],
      allQuestions: [],
      error: error.message,
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log('分析报告汇总');
console.log('='.repeat(80));

// 统计信息
const totalTools = analysisResults.length;
const toolsWithFaqs = analysisResults.filter((r) => r.faqCount > 0).length;
const toolsWithBestQuestions = analysisResults.filter(
  (r) => r.hasBestQuestion
).length;
const toolsWithoutBestQuestions = analysisResults.filter(
  (r) => r.faqCount > 0 && !r.hasBestQuestion
);

console.log(`总工具数量: ${totalTools}`);
console.log(`有FAQ的工具: ${toolsWithFaqs}`);
console.log(`包含"best"问题的工具: ${toolsWithBestQuestions}`);
console.log(`没有"best"问题的工具: ${toolsWithoutBestQuestions.length}`);
console.log('');

// 详细报告
console.log('详细分析结果:');
console.log('');

// 1. 已有"best"问题的工具
if (toolsWithBestQuestions.length > 0) {
  console.log('A. 已有"best"类型问题的工具:');
  toolsWithBestQuestions.forEach((tool) => {
    console.log(`   ${tool.displayName}:`);
    console.log(`     - FAQ数量: ${tool.faqCount}`);
    console.log(`     - "best"问题: ${tool.bestQuestions.join(', ')}`);
  });
  console.log('');
}

// 2. 没有"best"问题的工具（需要添加的）
if (toolsWithoutBestQuestions.length > 0) {
  console.log('B. 没有"best"类型问题的工具（建议添加）:');
  toolsWithoutBestQuestions.forEach((tool) => {
    console.log(`   ${tool.displayName}:`);
    console.log(`     - FAQ数量: ${tool.faqCount}`);

    // 根据工具类型建议合适的"best"问题
    let suggestedQuestion = '';
    if (tool.toolName.includes('translator')) {
      suggestedQuestion = `What is the best ${tool.displayName.toLowerCase()} for accurate translations?`;
    } else if (tool.toolName.includes('generator')) {
      suggestedQuestion = `Which is the best ${tool.displayName.toLowerCase()} for creative projects?`;
    } else {
      // 对于特殊工具如dumb-it-down，使用不同的表述
      suggestedQuestion = `What is the best ${tool.displayName.toLowerCase()} tool for simplifying complex texts?`;
    }

    console.log(`     - 建议添加: "${suggestedQuestion}"`);
  });
  console.log('');
}

// 3. 没有FAQ的工具
const toolsWithoutFaqs = analysisResults.filter(
  (r) => r.faqCount === 0 && !r.error
);
if (toolsWithoutFaqs.length > 0) {
  console.log('C. 没有FAQ部分的工具:');
  toolsWithoutFaqs.forEach((tool) => {
    console.log(`   ${tool.displayName}: 需要添加FAQ部分`);
  });
  console.log('');
}

// 4. 错误的工具
const toolsWithErrors = analysisResults.filter((r) => r.error);
if (toolsWithErrors.length > 0) {
  console.log('D. 存在错误的工具:');
  toolsWithErrors.forEach((tool) => {
    console.log(`   ${tool.displayName}: ${tool.error}`);
  });
  console.log('');
}

// 生成报告文件
const reportData = {
  analysisDate: new Date().toISOString(),
  summary: {
    totalTools,
    toolsWithFaqs,
    toolsWithBestQuestions,
    toolsWithoutBestQuestions: toolsWithoutBestQuestions.length,
  },
  results: analysisResults,
  recommendations: {
    toolsNeedingBestQuestions: toolsWithoutBestQuestions.map((t) => {
      let suggestedQuestion = '';
      if (t.toolName.includes('translator')) {
        suggestedQuestion = `What is the best ${t.displayName.toLowerCase()} for accurate translations?`;
      } else if (t.toolName.includes('generator')) {
        suggestedQuestion = `Which is the best ${t.displayName.toLowerCase()} for creative projects?`;
      } else {
        suggestedQuestion = `What is the best ${t.displayName.toLowerCase()} tool for simplifying complex texts?`;
      }
      return {
        toolName: t.toolName,
        displayName: t.displayName,
        suggestedQuestion,
      };
    }),
  },
};

// 保存详细报告
fs.writeFileSync(
  path.join(__dirname, 'translator-faq-analysis-report.json'),
  JSON.stringify(reportData, null, 2),
  'utf8'
);

console.log('完整报告已保存到: translator-faq-analysis-report.json');
console.log('\n分析完成!');
