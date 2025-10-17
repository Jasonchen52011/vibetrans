#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 测试用例
const testCases = [
  {
    name: 'samoan-to-english-translator',
    url: 'http://localhost:3002/samoan-to-english-translator',
    api: '/api/samoan-to-english-translator',
    tests: [
      { input: 'Talofa lava', expectedDirection: 'sm-to-en', description: '萨摩亚语到英语' },
      { input: 'Hello my friend', expectedDirection: 'en-to-sm', description: '英语到萨摩亚语' }
    ]
  },
  {
    name: 'aramaic-translator',
    url: 'http://localhost:3002/aramaic-translator',
    api: '/api/aramaic-translator',
    tests: [
      { input: 'Shlama', expectedDirection: 'aramaic-to-en', description: '阿拉姆语到英语' },
      { input: 'Peace be upon you', expectedDirection: 'en-to-aramaic', description: '英语到阿拉姆语' }
    ]
  },
  {
    name: 'baybayin-translator',
    url: 'http://localhost:3002/baybayin-translator',
    api: '/api/baybayin-translator',
    tests: [
      { input: 'ᜀᜃᜌ᜔', expectedDirection: 'baybayin-to-en', description: '巴贝因文字到英语' },
      { input: 'Hello world', expectedDirection: 'en-to-baybayin', description: '英语到巴贝因文字' }
    ]
  },
  {
    name: 'cuneiform-translator',
    url: 'http://localhost:3002/cuneiform-translator',
    api: '/api/cuneiform-translator',
    tests: [
      { input: '𒀭', expectedDirection: 'cuneiform-to-en', description: '楔形文字到英语' },
      { input: 'God', expectedDirection: 'en-to-cuneiform', description: '英语到楔形文字' }
    ]
  },
  {
    name: 'gaster-translator',
    url: 'http://localhost:3002/gaster-translator',
    api: '/api/gaster-translator',
    tests: [
      { input: 'W.D. Gaster', expectedDirection: 'gaster-to-en', description: 'Gaster语言到英语' },
      { input: 'Mystery', expectedDirection: 'en-to-gaster', description: '英语到Gaster语言' }
    ]
  },
  {
    name: 'high-valyrian-translator',
    url: 'http://localhost:3002/high-valyrian-translator',
    api: '/api/high-valyrian-translator',
    tests: [
      { input: 'Kirimvose', expectedDirection: 'valyrian-to-en', description: '高等瓦雷利亚语到英语' },
      { input: 'Thank you', expectedDirection: 'en-to-valyrian', description: '英语到高等瓦雷利亚语' }
    ]
  }
];

// 测试结果
const results = [];

// 测试页面可访问性
async function testPageAccessibility(tool) {
  try {
    const response = await fetch(tool.url);
    return {
      status: 'success',
      httpStatus: response.status,
      accessible: response.ok
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      accessible: false
    };
  }
}

// 测试API功能
async function testAPI(tool, test) {
  try {
    const response = await fetch(`http://localhost:3002${tool.api}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: test.input,
        direction: test.expectedDirection
      })
    });

    const data = await response.json();

    return {
      status: 'success',
      httpStatus: response.status,
      hasTranslation: !!data.translated,
      translation: data.translated || null,
      hasError: !!data.error,
      error: data.error || null,
      responseStructure: Object.keys(data)
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      hasTranslation: false,
      translation: null
    };
  }
}

// 检查页面组件是否包含双向切换功能
function analyzeComponentCode(toolName) {
  const componentPaths = [
    `src/app/[locale]/(marketing)/(pages)/${toolName}/${toolName.charAt(0).toUpperCase() + toolName.slice(1).replace('-to-', 'To').replace('-translator', 'Translator')}Tool.tsx`
  ];

  for (const componentPath of componentPaths) {
    const fullPath = path.join(process.cwd(), componentPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      return {
        hasDirectionState: content.includes('direction') && content.includes('useState'),
        hasClickHandlers: content.includes('onClick') && content.includes('setDirection'),
        hasTitleSwitching: content.includes('direction ===') && content.includes('?'),
        hasPlaceholderUpdate: content.includes('placeholder') && content.includes('direction'),
        hasMultipleTitles: content.includes('Samoan Text') || content.includes('English Text') ||
                        content.includes('Aramaic Text') || content.includes('Baybayin Text') ||
                        content.includes('Cuneiform Text') || content.includes('Gaster Text') ||
                        content.includes('Valyrian Text'),
        codeExists: true
      };
    }
  }

  return { codeExists: false };
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始测试6个翻译工具的双向翻译功能...\n');

  for (const tool of testCases) {
    console.log(`📖 测试工具: ${tool.name}`);
    console.log('='.repeat(50));

    const toolResult = {
      name: tool.name,
      pageTest: null,
      apiTests: [],
      componentAnalysis: null,
      issues: [],
      rating: null
    };

    // 1. 测试页面可访问性
    console.log('  🌐 测试页面可访问性...');
    toolResult.pageTest = await testPageAccessibility(tool);
    console.log(`    状态: ${toolResult.pageTest.accessible ? '✅ 可访问' : '❌ 不可访问'}`);

    if (!toolResult.pageTest.accessible) {
      toolResult.issues.push('页面无法访问');
    }

    // 2. 分析组件代码
    console.log('  🔍 分析组件代码...');
    toolResult.componentAnalysis = analyzeComponentCode(tool.name);
    console.log(`    代码存在: ${toolResult.componentAnalysis.codeExists ? '✅' : '❌'}`);

    if (toolResult.componentAnalysis.codeExists) {
      console.log(`    双向状态管理: ${toolResult.componentAnalysis.hasDirectionState ? '✅' : '❌'}`);
      console.log(`    点击切换处理: ${toolResult.componentAnalysis.hasClickHandlers ? '✅' : '❌'}`);
      console.log(`    标题切换逻辑: ${toolResult.componentAnalysis.hasTitleSwitching ? '✅' : '❌'}`);
      console.log(`    占位符更新: ${toolResult.componentAnalysis.hasPlaceholderUpdate ? '✅' : '❌'}`);
      console.log(`    多语言标题: ${toolResult.componentAnalysis.hasMultipleTitles ? '✅' : '❌'}`);

      if (!toolResult.componentAnalysis.hasDirectionState) {
        toolResult.issues.push('缺少双向状态管理');
      }
      if (!toolResult.componentAnalysis.hasClickHandlers) {
        toolResult.issues.push('缺少点击切换处理');
      }
      if (!toolResult.componentAnalysis.hasTitleSwitching) {
        toolResult.issues.push('缺少标题切换逻辑');
      }
      if (!toolResult.componentAnalysis.hasPlaceholderUpdate) {
        toolResult.issues.push('缺少占位符动态更新');
      }
    } else {
      toolResult.issues.push('组件代码文件不存在');
    }

    // 3. 测试API功能
    console.log('  🔧 测试API功能...');
    for (const test of tool.tests) {
      console.log(`    测试: ${test.description} (${test.input})`);
      const apiResult = await testAPI(tool, test);
      toolResult.apiTests.push({
        ...apiResult,
        testDescription: test.description,
        input: test.input
      });

      console.log(`      API状态: ${apiResult.status === 'success' ? '✅' : '❌'}`);
      console.log(`      有翻译结果: ${apiResult.hasTranslation ? '✅' : '❌'}`);
      if (apiResult.translation) {
        console.log(`      翻译结果: "${apiResult.translation}"`);
      }
      if (apiResult.hasError) {
        console.log(`      API错误: ${apiResult.error}`);
        toolResult.issues.push(`API错误: ${apiResult.error}`);
      }
    }

    // 4. 计算评分
    let score = 0;
    let maxScore = 0;

    if (toolResult.pageTest.accessible) score += 1;
    maxScore += 1;

    if (toolResult.componentAnalysis.codeExists) {
      if (toolResult.componentAnalysis.hasDirectionState) score += 1;
      if (toolResult.componentAnalysis.hasClickHandlers) score += 1;
      if (toolResult.componentAnalysis.hasTitleSwitching) score += 1;
      if (toolResult.componentAnalysis.hasPlaceholderUpdate) score += 1;
      if (toolResult.componentAnalysis.hasMultipleTitles) score += 1;
      maxScore += 6;
    } else {
      maxScore += 6;
    }

    const successfulAPITests = toolResult.apiTests.filter(t => t.hasTranslation && !t.hasError).length;
    score += successfulAPITests;
    maxScore += toolResult.apiTests.length;

    toolResult.rating = {
      score: score,
      maxScore: maxScore,
      percentage: Math.round((score / maxScore) * 100)
    };

    console.log(`\n  📊 评分: ${toolResult.rating.score}/${toolResult.rating.maxScore} (${toolResult.rating.percentage}%)`);

    if (toolResult.issues.length > 0) {
      console.log(`  ⚠️  发现问题:`);
      toolResult.issues.forEach(issue => console.log(`    - ${issue}`));
    }

    results.push(toolResult);
    console.log('\n');
  }

  // 生成总结报告
  console.log('📋 测试总结报告');
  console.log('='.repeat(80));

  let totalScore = 0;
  let totalMaxScore = 0;

  results.forEach(result => {
    totalScore += result.rating.score;
    totalMaxScore += result.rating.maxScore;

    console.log(`\n${result.name}:`);
    console.log(`  评分: ${result.rating.score}/${result.rating.maxScore} (${result.rating.percentage}%)`);
    if (result.issues.length > 0) {
      console.log(`  问题: ${result.issues.join(', ')}`);
    }
  });

  const overallRating = Math.round((totalScore / totalMaxScore) * 100);
  console.log(`\n🎯 总体评分: ${totalScore}/${totalMaxScore} (${overallRating}%)\n`);

  // 保存详细报告
  const reportData = {
    timestamp: new Date().toISOString(),
    overallRating: overallRating,
    totalScore: totalScore,
    totalMaxScore: totalMaxScore,
    tools: results
  };

  fs.writeFileSync('translation-tools-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('📄 详细报告已保存到: translation-tools-test-report.json');

  return reportData;
}

// 运行测试
runAllTests().catch(console.error);