#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 测试工具列表
const tools = [
  'samoan-to-english-translator',
  'aramaic-translator',
  'baybayin-translator',
  'cuneiform-translator',
  'gaster-translator',
  'high-valyrian-translator',
];

// 测试单个工具的组件代码
function analyzeComponent(toolName) {
  console.log(`\n📖 测试工具: ${toolName}`);
  console.log('='.repeat(50));

  // 构建可能的组件文件路径
  const possibleComponentNames = [
    `${toolName.charAt(0).toUpperCase() + toolName.slice(1).replace('-to-', 'To').replace('-translator', 'Translator')}Tool.tsx`,
    `${toolName.split('-')[0].charAt(0).toUpperCase() + toolName.split('-')[0].slice(1)}TranslatorTool.tsx`,
    'AramaicTranslatorTool.tsx',
    'BaybayinTranslatorTool.tsx',
    'CuneiformTranslatorTool.tsx',
    'GasterTranslatorTool.tsx',
    'HighValyrianTranslatorTool.tsx',
    'SamoanToEnglishTranslatorTool.tsx',
  ];

  let componentPath = null;
  let componentFound = false;

  for (const componentName of possibleComponentNames) {
    const fullPath = path.join(
      process.cwd(),
      `src/app/[locale]/(marketing)/(pages)/${toolName}/${componentName}`
    );
    if (fs.existsSync(fullPath)) {
      componentPath = fullPath;
      componentFound = true;
      break;
    }
  }

  if (!componentFound) {
    console.log('❌ 组件文件未找到');
    return { exists: false };
  }

  console.log(`✅ 组件文件: ${componentPath}`);

  const content = fs.readFileSync(componentPath, 'utf8');

  const analysis = {
    exists: true,
    path: componentPath,
    hasDirectionState:
      content.includes('direction') && content.includes('useState'),
    hasClickHandlers:
      content.includes('onClick') && content.includes('setDirection'),
    hasTitleSwitching:
      content.includes('direction ===') && content.includes('?'),
    hasPlaceholderUpdate:
      content.includes('placeholder') && content.includes('direction'),
    hasMultipleTitles:
      content.includes('Samoan Text') ||
      content.includes('English Text') ||
      content.includes('Aramaic Text') ||
      content.includes('Baybayin Text') ||
      content.includes('Cuneiform Text') ||
      content.includes('Gaster Text') ||
      content.includes('Valyrian Text') ||
      content.includes('High Valyrian'),
    hasSwapButton:
      content.includes('swap') ||
      content.includes('toggle') ||
      content.includes('Switch'),
    hasClearUI:
      !content.includes('Click to switch') &&
      !content.includes('Toggle direction'), // 检查是否有多余的切换提示文字
    issues: [],
  };

  console.log(`🔍 组件功能分析:`);
  console.log(`  双向状态管理: ${analysis.hasDirectionState ? '✅' : '❌'}`);
  console.log(`  点击切换处理: ${analysis.hasClickHandlers ? '✅' : '❌'}`);
  console.log(`  标题切换逻辑: ${analysis.hasTitleSwitching ? '✅' : '❌'}`);
  console.log(
    `  占位符动态更新: ${analysis.hasPlaceholderUpdate ? '✅' : '❌'}`
  );
  console.log(`  多语言标题: ${analysis.hasMultipleTitles ? '✅' : '❌'}`);
  console.log(`  切换按钮: ${analysis.hasSwapButton ? '✅' : '❌'}`);
  console.log(`  干净UI设计: ${analysis.hasClearUI ? '✅' : '❌'}`);

  if (!analysis.hasDirectionState) analysis.issues.push('缺少双向状态管理');
  if (!analysis.hasClickHandlers) analysis.issues.push('缺少点击切换处理');
  if (!analysis.hasTitleSwitching) analysis.issues.push('缺少标题切换逻辑');
  if (!analysis.hasPlaceholderUpdate)
    analysis.issues.push('缺少占位符动态更新');
  if (!analysis.hasMultipleTitles) analysis.issues.push('缺少多语言标题');
  if (!analysis.hasSwapButton) analysis.issues.push('缺少切换按钮');
  if (!analysis.hasClearUI) analysis.issues.push('UI中有多余的切换提示文字');

  if (analysis.issues.length > 0) {
    console.log(`⚠️  发现问题:`);
    analysis.issues.forEach((issue) => console.log(`    - ${issue}`));
  } else {
    console.log(`✅ 所有功能检查通过`);
  }

  return analysis;
}

// 检查API是否存在
function checkAPI(toolName) {
  const apiPath = path.join(process.cwd(), `src/app/api/${toolName}/route.ts`);
  const exists = fs.existsSync(apiPath);
  console.log(`  API路由: ${exists ? '✅' : '❌'} (${toolName})`);
  return exists;
}

// 检查页面文件
function checkPage(toolName) {
  const pagePath = path.join(
    process.cwd(),
    `src/app/[locale]/(marketing)/(pages)/${toolName}/page.tsx`
  );
  const exists = fs.existsSync(pagePath);
  console.log(`  页面文件: ${exists ? '✅' : '❌'} (${toolName}/page.tsx)`);
  return exists;
}

// 主测试函数
function runTests() {
  console.log('🚀 开始测试6个翻译工具的双向翻译功能...\n');

  const results = [];

  for (const tool of tools) {
    const result = {
      name: tool,
      component: analyzeComponent(tool),
      api: checkAPI(tool),
      page: checkPage(tool),
    };

    results.push(result);
  }

  // 生成总结报告
  console.log('\n📋 测试总结报告');
  console.log('='.repeat(80));

  let totalScore = 0;
  let totalMaxScore = 0;

  results.forEach((result) => {
    console.log(`\n${result.name}:`);

    if (result.component.exists) {
      let score = 0;
      const maxScore = 9;

      if (result.component.hasDirectionState) score += 1;
      if (result.component.hasClickHandlers) score += 1;
      if (result.component.hasTitleSwitching) score += 1;
      if (result.component.hasPlaceholderUpdate) score += 1;
      if (result.component.hasMultipleTitles) score += 1;
      if (result.component.hasSwapButton) score += 1;
      if (result.component.hasClearUI) score += 1;
      if (result.api) score += 1;
      if (result.page) score += 1;

      const percentage = Math.round((score / maxScore) * 100);
      console.log(`  评分: ${score}/${maxScore} (${percentage}%)`);

      if (result.component.issues.length > 0) {
        console.log(`  问题: ${result.component.issues.join(', ')}`);
      }

      totalScore += score;
      totalMaxScore += maxScore;
    } else {
      console.log(`  评分: 0/9 (0%) - 组件文件不存在`);
      totalMaxScore += 9;
    }
  });

  const overallRating = Math.round((totalScore / totalMaxScore) * 100);
  console.log(
    `\n🎯 总体评分: ${totalScore}/${totalMaxScore} (${overallRating}%)\n`
  );

  // 保存报告
  const reportData = {
    timestamp: new Date().toISOString(),
    overallRating: overallRating,
    totalScore: totalScore,
    totalMaxScore: totalMaxScore,
    tools: results,
  };

  fs.writeFileSync(
    'simple-translation-test-report.json',
    JSON.stringify(reportData, null, 2)
  );
  console.log('📄 详细报告已保存到: simple-translation-test-report.json');

  return reportData;
}

// 运行测试
runTests().catch(console.error);
