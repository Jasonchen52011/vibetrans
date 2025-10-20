#!/usr/bin/env node

/**
 * 全面测试所有翻译工具页面的JSON与代码耦合性
 * 检查字段引用、类型定义、选项配置等一致性
 */

const fs = require('fs');
const path = require('path');

// 工具页面配置
const toolPages = [
  {
    name: 'al-bhed-translator',
    jsonPath: 'messages/pages/al-bhed-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/al-bhed-translator/AlBhedTranslatorTool.tsx',
    pagePath:
      'src/app/[locale]/(marketing)/(pages)/al-bhed-translator/page.tsx',
  },
  {
    name: 'high-valyrian-translator',
    jsonPath: 'messages/pages/high-valyrian-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/HighValyrianTranslatorTool.tsx',
    pagePath:
      'src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/page.tsx',
  },
  {
    name: 'cuneiform-translator',
    jsonPath: 'messages/pages/cuneiform-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/cuneiform-translator/CuneiformTranslatorTool.tsx',
    pagePath:
      'src/app/[locale]/(marketing)/(pages)/cuneiform-translator/page.tsx',
    typePath: 'src/lib/cuneiform.ts',
  },
  {
    name: 'gaster-translator',
    jsonPath: 'messages/pages/gaster-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/gaster-translator/GasterTranslatorTool.tsx',
    pagePath: 'src/app/[locale]/(marketing)/(pages)/gaster-translator/page.tsx',
  },
  {
    name: 'dog-translator',
    jsonPath: 'messages/pages/dog-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/dog-translator/DogTranslatorTool.tsx',
    pagePath: 'src/app/[locale]/(marketing)/(pages)/dog-translator/page.tsx',
  },
  {
    name: 'baby-translator',
    jsonPath: 'messages/pages/baby-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/baby-translator/BabyTranslatorTool.tsx',
    pagePath: 'src/app/[locale]/(marketing)/(pages)/baby-translator/page.tsx',
  },
  {
    name: 'aramaic-translator',
    jsonPath: 'messages/pages/aramaic-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/aramaic-translator/AramaicTranslatorTool.tsx',
    pagePath:
      'src/app/[locale]/(marketing)/(pages)/aramaic-translator/page.tsx',
  },
  {
    name: 'baybayin-translator',
    jsonPath: 'messages/pages/baybayin-translator/en.json',
    componentPath:
      'src/app/[locale]/(marketing)/(pages)/baybayin-translator/BaybayinTranslatorTool.tsx',
    pagePath:
      'src/app/[locale]/(marketing)/(pages)/baybayin-translator/page.tsx',
  },
];

console.log('🔍 开始全面测试翻译工具页面的JSON与代码耦合性...\n');

const results = {
  total: toolPages.length,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  details: [],
};

// 检查文件是否存在
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// 检查JSON语法和字段
function checkJsonFile(tool) {
  const issues = [];

  if (!fileExists(tool.jsonPath)) {
    issues.push(`❌ JSON文件不存在: ${tool.jsonPath}`);
    return issues;
  }

  try {
    const content = fs.readFileSync(tool.jsonPath, 'utf8');
    const json = JSON.parse(content);

    // 获取主要数据结构 - 正确的驼峰命名格式
    const pageKey =
      tool.name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Page';
    const pageData = json[pageKey];

    if (!pageData) {
      issues.push(`❌ JSON中缺少主键: ${pageKey}`);
      return issues;
    }

    // 检查必需的顶级字段
    const requiredTopLevel = ['funFacts', 'highlights', 'tool'];
    for (const field of requiredTopLevel) {
      if (!pageData[field]) {
        issues.push(`❌ JSON缺少${field}字段`);
      } else {
        // 检查funFacts和highlights是否有标题
        if (field === 'funFacts' || field === 'highlights') {
          if (!pageData[field].title) {
            issues.push(`❌ ${field}缺少title字段`);
          } else if (/[\u4e00-\u9fa5]/.test(pageData[field].title)) {
            issues.push(
              `❌ ${field}.title包含中文字符: "${pageData[field].title}"`
            );
          }
        }
      }
    }

    // 检查tool字段的必需属性
    if (pageData.tool) {
      const requiredToolFields = [
        'translateButton',
        'uploadButton',
        'loading',
        'error',
      ];
      for (const field of requiredToolFields) {
        if (!pageData.tool[field]) {
          issues.push(`⚠️  tool缺少${field}字段`);
        }
      }
    }

    // 特殊检查：cuneiform-translator的脚本选项
    if (tool.name === 'cuneiform-translator') {
      if (pageData.tool?.scripts) {
        const jsonScripts = Object.keys(pageData.tool.scripts);
        const expectedScripts = ['sumerian', 'akkadian', 'babylonian'];

        for (const script of expectedScripts) {
          if (!jsonScripts.includes(script)) {
            issues.push(`❌ tool.scripts缺少${script}选项`);
          }
        }
      }
    }
  } catch (e) {
    issues.push(`❌ JSON语法错误: ${e.message}`);
  }

  return issues;
}

// 检查组件文件中的字段引用
function checkComponentFile(tool) {
  const issues = [];

  if (!fileExists(tool.componentPath)) {
    issues.push(`❌ 组件文件不存在: ${tool.componentPath}`);
    return issues;
  }

  try {
    const content = fs.readFileSync(tool.componentPath, 'utf8');

    // 检查关键字段引用
    const requiredReferences = [
      'pageData.tool',
      'pageData.funFacts',
      'pageData.highlights',
    ];

    for (const ref of requiredReferences) {
      if (!content.includes(ref)) {
        issues.push(`⚠️  组件中未找到${ref}引用`);
      }
    }

    // 特殊检查：cuneiform-translator的脚本选项
    if (tool.name === 'cuneiform-translator') {
      const scriptOptions = [
        'sumerian',
        'akkadian',
        'babylonian',
        'hittite',
        'elamite',
        'old-persian',
        'ugaritic',
      ];

      for (const script of scriptOptions) {
        if (content.includes(`"${script}"`)) {
          // 这是正常的，组件应该包含这些脚本选项
        }
      }
    }
  } catch (e) {
    issues.push(`❌ 组件文件读取错误: ${e.message}`);
  }

  return issues;
}

// 检查类型定义文件
function checkTypeFile(tool) {
  const issues = [];

  if (!tool.typePath) {
    return issues; // 不是所有工具都有类型文件
  }

  if (!fileExists(tool.typePath)) {
    issues.push(`❌ 类型文件不存在: ${tool.typePath}`);
    return issues;
  }

  try {
    const content = fs.readFileSync(tool.typePath, 'utf8');

    // 检查cuneiform类型定义
    if (tool.name === 'cuneiform-translator') {
      const typeMatch = content.match(/export type CuneiformScript = (.+?);/);
      if (typeMatch) {
        const typeDef = typeMatch[1];
        const allowedTypes = typeDef.replace(/[\'\`\"]/g, '').split(/\s*\|\s*/);

        const expectedTypes = ['sumerian', 'akkadian', 'babylonian'];
        for (const type of expectedTypes) {
          if (!allowedTypes.includes(type)) {
            issues.push(`❌ CuneiformScript类型缺少${type}`);
          }
        }
      }
    }
  } catch (e) {
    issues.push(`❌ 类型文件读取错误: ${e.message}`);
  }

  return issues;
}

// 运行测试
toolPages.forEach((tool) => {
  console.log(`📋 测试工具: ${tool.name}`);

  const toolResult = {
    name: tool.name,
    jsonIssues: [],
    componentIssues: [],
    typeIssues: [],
  };

  toolResult.jsonIssues = checkJsonFile(tool);
  toolResult.componentIssues = checkComponentFile(tool);
  toolResult.typeIssues = checkTypeFile(tool);

  const allIssues = [
    ...toolResult.jsonIssues,
    ...toolResult.componentIssues,
    ...toolResult.typeIssues,
  ];

  if (allIssues.length === 0) {
    console.log('  ✅ 通过所有检查');
    results.passed++;
  } else {
    console.log(`  ❌ 发现 ${allIssues.length} 个问题:`);
    allIssues.forEach((issue) => {
      console.log(`    ${issue}`);
    });
    results.failed++;
    results.errors.push(...allIssues.filter((e) => e.includes('❌')));
    results.warnings.push(...allIssues.filter((e) => e.includes('⚠️')));
  }

  results.details.push(toolResult);
  console.log('');
});

// 生成总结报告
console.log('📊 测试总结:');
console.log(`  总计: ${results.total} 个工具`);
console.log(`  ✅ 通过: ${results.passed} 个`);
console.log(`  ❌ 失败: ${results.failed} 个`);
console.log(`  🔴 错误: ${results.errors.length} 个`);
console.log(`  ⚠️  警告: ${results.warnings.length} 个`);

if (results.errors.length > 0) {
  console.log('\n🔴 需要修复的错误:');
  results.errors.forEach((error) => console.log(`  ${error}`));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  建议修复的警告:');
  results.warnings.forEach((warning) => console.log(`  ${warning}`));
}

// 生成修复建议
console.log('\n🔧 修复建议:');
if (results.errors.length > 0) {
  console.log('1. 修复JSON文件中的中文字符标题');
  console.log('2. 补充缺失的必需字段');
  console.log('3. 修复cuneiform-translator的脚本选项不匹配问题');
  console.log('4. 确保所有字段引用的一致性');
}

// 保存详细报告
const reportPath = 'tool-page-coupling-test-report.json';
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 详细报告已保存到: ${reportPath}`);

process.exit(results.failed > 0 ? 1 : 0);
