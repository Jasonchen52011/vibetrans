#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 所有翻译工具页面文件路径
const translatorFiles = [
  'src/app/[locale]/(marketing)/(pages)/bad-translator/BadTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gen-alpha-translator/GenAlphaTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gen-z-translator/GenZTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/samoan-to-english-translator/SamoanToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gibberish-translator/GibberishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gaster-translator/GasterTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/esperanto-translator/EsperantoTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/dog-translator/DogTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/cantonese-translator/CantoneseTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/baybayin-translator/BaybayinTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/baby-translator/BabyTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/aramaic-translator/AramaicTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/al-bhed-translator/AlBhedTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/pig-latin-translator/PigLatinTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/creole-to-english-translator/CreoleToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/ancient-greek-translator/AncientGreekTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/HighValyrianTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/minion-translator/MinionTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/ivr-translator/IvrTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/middle-english-translator/MiddleEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/chinese-to-english-translator/ChineseToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/cuneiform-translator/CuneiformTranslatorTool.tsx',
];

// 需要检查的字段模式
const fieldPatterns = {
  funFacts: /funfacts?./gi,
  highlights: /highlights/gi,
  jsonUsage: /t\(["'"]([^"']+)["'"]\)/g,
};

console.log('🔍 开始检查翻译工具页面的JSON字段引用...\n');

const issues = [];
const validReferences = [];

translatorFiles.forEach((filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(filePath);

    console.log(`📄 检查文件: ${fileName}`);

    // 检查 funFacts/funfacts 字段引用
    const funFactsMatches = content.match(/funfacts?./gi);
    if (funFactsMatches) {
      const uniqueMatches = [...new Set(funFactsMatches)];
      uniqueMatches.forEach((match) => {
        if (match !== 'funFacts' && match !== 'funfacts') {
          issues.push({
            file: fileName,
            type: '字段名称不一致',
            issue: `发现变体字段名: "${match}"，应该是 "funFacts" 或 "funfacts"`,
            line: getLineNumber(content, match),
          });
        } else {
          validReferences.push({
            file: fileName,
            field: match,
            type: 'funFacts字段',
          });
        }
      });
    }

    // 检查 highlights 字段引用
    const highlightsMatches = content.match(/highlights/gi);
    if (highlightsMatches) {
      highlightsMatches.forEach((match) => {
        if (match !== 'highlights') {
          issues.push({
            file: fileName,
            type: '字段名称不一致',
            issue: `发现变体字段名: "${match}"，应该是 "highlights"`,
            line: getLineNumber(content, match),
          });
        } else {
          validReferences.push({
            file: fileName,
            field: match,
            type: 'highlights字段',
          });
        }
      });
    }

    // 检查 JSON 路径引用
    let jsonMatch;
    const jsonRegex = /t\(["'"]([^"']+)["'"]\)/g;
    while ((jsonMatch = jsonRegex.exec(content)) !== null) {
      const jsonPath = jsonMatch[1];

      // 检查是否包含我们关心的字段
      if (jsonPath.includes('funFact') || jsonPath.includes('highlight')) {
        validReferences.push({
          file: fileName,
          field: jsonPath,
          type: 'JSON路径引用',
        });
      }
    }

    // 检查直接的JSON对象访问模式
    const directAccess = content.match(/\w+\.(funfacts?|highlights)/gi);
    if (directAccess) {
      directAccess.forEach((match) => {
        const parts = match.split('.');
        const fieldName = parts[parts.length - 1];

        if (
          fieldName.includes('funfact') &&
          !['funFacts', 'funfacts'].includes(fieldName)
        ) {
          issues.push({
            file: fileName,
            type: '字段名称不一致',
            issue: `直接访问字段名错误: "${fieldName}"`,
            line: getLineNumber(content, match),
          });
        }
      });
    }
  } catch (error) {
    console.log(`❌ 读取文件失败 ${filePath}: ${error.message}`);
    issues.push({
      file: path.basename(filePath),
      type: '文件读取错误',
      issue: error.message,
    });
  }
});

function getLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return '未知';
}

// 输出结果
console.log('\n' + '='.repeat(80));
console.log('📊 检查结果汇总');
console.log('='.repeat(80));

if (issues.length > 0) {
  console.log(`\n❌ 发现 ${issues.length} 个问题:`);
  console.log('-'.repeat(60));

  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. 📁 文件: ${issue.file}`);
    console.log(`   🔍 问题类型: ${issue.type}`);
    console.log(`   📝 详细描述: ${issue.issue}`);
    if (issue.line && issue.line !== '未知') {
      console.log(`   📍 行号: ${issue.line}`);
    }
  });
} else {
  console.log('\n✅ 未发现字段引用问题！');
}

console.log(`\n✅ 有效的引用 (${validReferences.length} 个):`);
console.log('-'.repeat(60));
const fileGroups = {};
validReferences.forEach((ref) => {
  if (!fileGroups[ref.file]) {
    fileGroups[ref.file] = [];
  }
  fileGroups[ref.file].push(ref);
});

Object.keys(fileGroups).forEach((file) => {
  console.log(`\n📄 ${file}:`);
  fileGroups[file].forEach((ref) => {
    console.log(`   ✓ ${ref.type}: ${ref.field}`);
  });
});

// 生成修复建议
if (issues.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 修复建议');
  console.log('='.repeat(80));

  const fieldIssues = issues.filter((i) => i.type === '字段名称不一致');
  if (fieldIssues.length > 0) {
    console.log('\n1. 字段名称统一:');
    console.log(
      '   - 所有funFacts相关字段应使用 "funFacts" (推荐) 或 "funfacts"'
    );
    console.log('   - 所有highlights相关字段应使用 "highlights"');
    console.log('   - 确保JSON文件和组件代码中的字段名称完全匹配');
  }

  console.log('\n2. 修复步骤:');
  console.log('   - 检查对应的JSON消息文件');
  console.log('   - 确认字段名称在JSON和代码中一致');
  console.log('   - 更新组件代码中的字段引用');
}

console.log('\n🏁 检查完成！');
