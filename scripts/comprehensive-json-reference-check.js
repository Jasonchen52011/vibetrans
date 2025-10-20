#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 翻译工具页面路径
const translatorPages = [
  'al-bhed-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'samoan-to-english-translator',
  'gibberish-translator',
  'gaster-translator',
  'esperanto-translator',
  'dog-translator',
  'cantonese-translator',
  'baybayin-translator',
  'baby-translator',
  'aramaic-translator',
  'pig-latin-translator',
  'creole-to-english-translator',
  'ancient-greek-translator',
  'high-valyrian-translator',
  'minion-translator',
  'ivr-translator',
  'middle-english-translator',
  'chinese-to-english-translator',
  'cuneiform-translator',
  'bad-translator',
];

console.log('🔍 全面检查翻译工具页面的JSON字段引用...\n');

const allIssues = [];
const allValidReferences = [];

translatorPages.forEach((pagePath) => {
  const pageFile = `src/app/[locale]/(marketing)/(pages)/${pagePath}/page.tsx`;
  const toolFile = `src/app/[locale]/(marketing)/(pages)/${pagePath}/${getToolFileName(pagePath)}.tsx`;

  console.log(`\n📄 检查页面: ${pagePath}`);
  console.log(`  - page.tsx: ${pageFile}`);
  console.log(`  - tool.tsx: ${toolFile}`);

  // 检查page.tsx文件
  checkPageFile(pageFile, pagePath);

  // 检查tool.tsx文件
  checkToolFile(toolFile, pagePath);
});

function getToolFileName(pagePath) {
  // 将page-path转换为ToolFileName格式
  const parts = pagePath.split('-');
  return (
    parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('') +
    'Tool'
  );
}

function checkPageFile(filePath, pagePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`    ❌ 页面文件不存在: ${filePath}`);
      allIssues.push({
        file: path.basename(filePath),
        page: pagePath,
        type: '文件不存在',
        issue: `页面文件不存在: ${filePath}`,
      });
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(filePath);

    // 检查funFacts引用
    const funFactsMatches = content.match(/\(t[^)]*\([\"']funfacts?/gi);
    if (funFactsMatches) {
      funFactsMatches.forEach((match) => {
        allValidReferences.push({
          file: fileName,
          page: pagePath,
          field: 'funFacts',
          reference: match,
          type: '页面funFacts引用',
        });
      });
    }

    // 检查highlights引用
    const highlightsMatches = content.match(/\(t[^)]*\([\"']highlights/gi);
    if (highlightsMatches) {
      highlightsMatches.forEach((match) => {
        allValidReferences.push({
          file: fileName,
          page: pagePath,
          field: 'highlights',
          reference: match,
          type: '页面highlights引用',
        });
      });
    }

    // 检查import语句
    const importMatches = content.match(
      /import.*from ['"]@\/components\/blocks\/(funfacts|highlights)['"]/gi
    );
    if (importMatches) {
      importMatches.forEach((match) => {
        allValidReferences.push({
          file: fileName,
          page: pagePath,
          field: match.includes('funfacts') ? 'funfacts组件' : 'highlights组件',
          reference: match,
          type: '组件导入',
        });
      });
    }

    // 检查可能的字段名称不一致
    const inconsistentFunFacts = content.match(/\(t[^)]*\([\"']funfact[^s]/gi);
    if (inconsistentFunFacts) {
      inconsistentFunFacts.forEach((match) => {
        allIssues.push({
          file: fileName,
          page: pagePath,
          type: '字段名称不一致',
          issue: `发现不一致的funfacts引用: ${match}`,
          line: getLineNumber(content, match),
        });
      });
    }

    const inconsistentHighlights = content.match(
      /\(t[^)]*\([\"']highlight[^s]/gi
    );
    if (inconsistentHighlights) {
      inconsistentHighlights.forEach((match) => {
        allIssues.push({
          file: fileName,
          page: pagePath,
          type: '字段名称不一致',
          issue: `发现不一致的highlights引用: ${match}`,
          line: getLineNumber(content, match),
        });
      });
    }
  } catch (error) {
    console.log(`    ❌ 读取页面文件失败 ${filePath}: ${error.message}`);
    allIssues.push({
      file: path.basename(filePath),
      page: pagePath,
      type: '文件读取错误',
      issue: error.message,
    });
  }
}

function checkToolFile(filePath, pagePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`    ❌ 工具文件不存在: ${filePath}`);
      allIssues.push({
        file: path.basename(filePath),
        page: pagePath,
        type: '文件不存在',
        issue: `工具文件不存在: ${filePath}`,
      });
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(filePath);

    // 工具文件通常不应该直接引用funFacts或highlights
    // 但我们检查是否有这样的引用
    const funFactsInTool = content.match(/funfacts?/gi);
    if (funFactsInTool) {
      console.log(`    ⚠️  工具文件中发现了funFacts引用（通常不应该存在）`);
      allIssues.push({
        file: fileName,
        page: pagePath,
        type: '不当引用',
        issue: `工具文件中不应该直接引用funFacts字段`,
      });
    }

    const highlightsInTool = content.match(/highlights/gi);
    if (highlightsInTool) {
      console.log(`    ⚠️  工具文件中发现了highlights引用（通常不应该存在）`);
      allIssues.push({
        file: fileName,
        page: pagePath,
        type: '不当引用',
        issue: `工具文件中不应该直接引用highlights字段`,
      });
    }

    // 检查pageData.tool引用（这是正常的）
    const pageDataToolMatches = content.match(/pageData\.tool\.\w+/gi);
    if (pageDataToolMatches) {
      pageDataToolMatches.forEach((match) => {
        allValidReferences.push({
          file: fileName,
          page: pagePath,
          field: 'pageData.tool',
          reference: match,
          type: '工具pageData引用',
        });
      });
    }
  } catch (error) {
    console.log(`    ❌ 读取工具文件失败 ${filePath}: ${error.message}`);
    allIssues.push({
      file: path.basename(filePath),
      page: pagePath,
      type: '文件读取错误',
      issue: error.message,
    });
  }
}

function getLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return '未知';
}

// 检查对应的JSON文件
console.log('\n' + '='.repeat(80));
console.log('📋 检查对应的JSON消息文件结构...');
console.log('='.repeat(80));

translatorPages.forEach((pagePath) => {
  const jsonFile = `messages/pages/${pagePath}/en.json`;
  try {
    const fullPath = path.resolve(jsonFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(content);

      // 检查JSON结构
      const mainKey = Object.keys(data)[0];
      if (data[mainKey]) {
        const hasFunFacts = 'funFacts' in data[mainKey];
        const hasHighlights = 'highlights' in data[mainKey];

        if (hasFunFacts) {
          console.log(`✅ ${pagePath}: JSON包含funFacts字段`);
          allValidReferences.push({
            file: 'en.json',
            page: pagePath,
            field: 'funFacts',
            type: 'JSON字段存在',
          });
        }

        if (hasHighlights) {
          console.log(`✅ ${pagePath}: JSON包含highlights字段`);
          allValidReferences.push({
            file: 'en.json',
            page: pagePath,
            field: 'highlights',
            type: 'JSON字段存在',
          });
        }

        // 检查字段名称一致性
        if ('funfacts' in data[mainKey]) {
          allIssues.push({
            file: 'en.json',
            page: pagePath,
            type: '字段名称不一致',
            issue: `JSON中使用了小写'funfacts'，应该使用'funFacts'`,
          });
        }
      }
    } else {
      console.log(`❌ ${pagePath}: JSON文件不存在 ${jsonFile}`);
    }
  } catch (error) {
    console.log(`❌ ${pagePath}: 读取JSON文件失败 ${error.message}`);
  }
});

// 输出最终报告
console.log('\n' + '='.repeat(80));
console.log('📊 检查结果汇总');
console.log('='.repeat(80));

if (allIssues.length > 0) {
  console.log(`\n❌ 发现 ${allIssues.length} 个问题:`);
  console.log('-'.repeat(60));

  const issueGroups = {};
  allIssues.forEach((issue) => {
    if (!issueGroups[issue.type]) {
      issueGroups[issue.type] = [];
    }
    issueGroups[issue.type].push(issue);
  });

  Object.keys(issueGroups).forEach((type) => {
    console.log(`\n🔍 ${type} (${issueGroups[type].length}个):`);
    issueGroups[type].forEach((issue, index) => {
      console.log(`  ${index + 1}. 📁 ${issue.page}/${issue.file}`);
      console.log(`     📝 ${issue.issue}`);
      if (issue.line && issue.line !== '未知') {
        console.log(`     📍 行号: ${issue.line}`);
      }
    });
  });
} else {
  console.log('\n✅ 未发现字段引用问题！');
}

console.log(`\n✅ 有效的引用 (${allValidReferences.length} 个):`);
console.log('-'.repeat(60));

const validGroups = {};
allValidReferences.forEach((ref) => {
  if (!validGroups[ref.page]) {
    validGroups[ref.page] = [];
  }
  validGroups[ref.page].push(ref);
});

Object.keys(validGroups).forEach((page) => {
  console.log(`\n📄 ${page}:`);
  validGroups[page].forEach((ref) => {
    console.log(`   ✓ ${ref.type}: ${ref.field}`);
  });
});

// 生成修复建议
console.log('\n' + '='.repeat(80));
console.log('🔧 修复建议');
console.log('='.repeat(80));

if (allIssues.length > 0) {
  console.log('\n1. 字段名称标准化:');
  console.log('   - 所有funFacts字段应使用统一的命名: "funFacts"');
  console.log('   - 所有highlights字段应使用统一的命名: "highlights"');
  console.log('   - 确保JSON文件和页面代码中的字段名称完全一致');

  console.log('\n2. 组件引用检查:');
  console.log(
    '   - 确保正确导入对应的组件: @/components/blocks/funfacts 和 @/components/blocks/highlights'
  );
  console.log('   - 检查页面中是否正确传递了section数据');

  console.log('\n3. JSON结构验证:');
  console.log('   - 确保每个翻译工具的JSON文件包含必要的字段');
  console.log('   - 验证字段结构是否匹配组件期望的格式');
} else {
  console.log('\n✅ 所有引用都是正确的，无需修复！');
}

console.log('\n🏁 检查完成！');
