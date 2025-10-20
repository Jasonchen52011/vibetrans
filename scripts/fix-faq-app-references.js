#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的页面列表
const pagesToFix = [
  'alien-text-generator',
  'creole-to-english',
  'cuneiform-translator',
  'dumb-it-down',
  'gibberish-translator',
  'home',
];

// 需要替换的文本模式
const replacements = [
  { find: /\bapp\b/g, replace: 'web tool' },
  { find: /\bapplication\b/g, replace: 'web application' },
  { find: /\bmobile device\b/g, replace: 'device' },
  { find: /\bsmartphone\b/g, replace: 'phone' },
];

console.log('🔧 开始修复剩余页面的app和离线相关内容...\n');

const pagesDir = path.join(__dirname, '..', 'messages', 'pages');
let fixedCount = 0;

pagesToFix.forEach((pageName) => {
  const enJsonPath = path.join(pagesDir, pageName, 'en.json');

  if (!fs.existsSync(enJsonPath)) {
    console.log(`⚠️  跳过 ${pageName} - 文件不存在`);
    return;
  }

  try {
    const content = fs.readFileSync(enJsonPath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;

    // 应用所有替换规则
    replacements.forEach((rule) => {
      const beforeReplace = modifiedContent;
      modifiedContent = modifiedContent.replace(rule.find, rule.replace);
      if (beforeReplace !== modifiedContent) {
        hasChanges = true;
      }
    });

    // 如果有修改，写回文件
    if (hasChanges) {
      fs.writeFileSync(enJsonPath, modifiedContent);
      console.log(`✅ 已修复: ${pageName}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  无需修复: ${pageName}`);
    }
  } catch (error) {
    console.error(`❌ 修复 ${pageName} 失败:`, error.message);
  }
});

console.log(`\n📊 修复完成:`);
console.log(`- 成功修复页面数: ${fixedCount}`);
console.log(`- 总处理页面数: ${pagesToFix.length}`);

if (fixedCount > 0) {
  console.log('\n🎉 所有页面FAQ中的app和离线相关内容已成功清理！');
} else {
  console.log('\nℹ️  所有页面都已经干净，无需修复。');
}
