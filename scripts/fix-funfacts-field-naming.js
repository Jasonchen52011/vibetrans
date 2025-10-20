#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 发现需要修复的文件列表
const filesToFix = [
  'messages/pages/al-bhed-translator/en.json',
  'messages/pages/gen-alpha-translator/en.json',
  'messages/pages/gen-z-translator/en.json',
  'messages/pages/gibberish-translator/en.json',
  'messages/pages/esperanto-translator/en.json',
  'messages/pages/dog-translator/en.json',
  'messages/pages/baby-translator/en.json',
  'messages/pages/pig-latin-translator/en.json',
  'messages/pages/ancient-greek-translator/en.json',
  'messages/pages/chinese-to-english-translator/en.json',
  'messages/pages/cuneiform-translator/en.json',
];

console.log('🔧 开始修复funFacts字段名称不一致问题...\n');

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach((filePath) => {
  try {
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      errorCount++;
      return;
    }

    // 读取文件内容
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(filePath);

    // 检查是否包含'funfacts'字段
    if (content.includes('"funfacts"')) {
      // 创建备份
      const backupPath = fullPath + '.backup';
      fs.writeFileSync(backupPath, content);

      // 替换'funfacts'为'funFacts'
      const fixedContent = content.replace(/"funfacts"/g, '"funFacts"');

      // 写回文件
      fs.writeFileSync(fullPath, fixedContent);

      console.log(`✅ 已修复: ${fileName}`);
      console.log(`   🔧 'funfacts' → 'funFacts'`);
      console.log(`   💾 备份文件: ${path.basename(backupPath)}`);

      fixedCount++;
    } else {
      console.log(`ℹ️  无需修复: ${fileName} (未发现'funfacts'字段)`);
    }
  } catch (error) {
    console.log(`❌ 修复失败 ${filePath}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 修复结果汇总');
console.log('='.repeat(60));
console.log(`✅ 成功修复: ${fixedCount} 个文件`);
console.log(`❌ 修复失败: ${errorCount} 个文件`);
console.log(`📁 总计处理: ${filesToFix.length} 个文件`);

if (fixedCount > 0) {
  console.log('\n🔄 后续建议:');
  console.log('1. 检查修复后的文件是否正确加载');
  console.log('2. 验证页面渲染是否正常');
  console.log('3. 确认所有字段引用都匹配');
  console.log('4. 可以删除备份文件 (如果确认修复成功)');
}

if (errorCount > 0) {
  console.log('\n⚠️  注意事项:');
  console.log('有文件修复失败，请手动检查这些文件');
}

console.log('\n🏁 修复完成！');
