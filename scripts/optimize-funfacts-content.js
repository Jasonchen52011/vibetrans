const fs = require('fs');
const path = require('path');

// 计算英文单词数
function countWords(text) {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

// 计算中文字符数
function countChineseChars(text) {
  if (!text) return 0;
  return (text.match(/[\u4e00-\u9fff]/g) || []).length;
}

// 检查并优化FunFacts内容
function checkAndOptimizeFunFacts(filePath, toolName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);

    const pageKey = Object.keys(json)[0];
    const pageData = json[pageKey];

    let hasChanges = false;

    // 检查funfacts字段
    const funFactsSection = pageData.funFacts || pageData.funfacts;
    if (funFactsSection && funFactsSection.items) {
      console.log(`\n🔍 检查 ${toolName} 的 FunFacts 内容:`);

      funFactsSection.items.forEach((item, index) => {
        const description = item.description || item.content;
        if (description) {
          const wordCount = countWords(description);
          const chineseCharCount = countChineseChars(description);

          console.log(
            `  项目 ${index + 1}: ${wordCount} 词, ${chineseCharCount} 中文字符`
          );
          console.log(`    内容: ${description.substring(0, 100)}...`);

          // 如果超过30个词，需要优化
          if (wordCount > 30) {
            console.log(`    ⚠️  超过30词，需要优化`);

            // 优化内容 - 保留前30词
            const words = description.trim().split(/\s+/);
            const optimizedDescription = words.slice(0, 30).join(' ');

            if (item.description) {
              item.description = optimizedDescription;
            } else if (item.content) {
              item.content = optimizedDescription;
            }

            console.log(
              `    ✅ 优化后: ${optimizedDescription.substring(0, 100)}...`
            );
            hasChanges = true;
          } else {
            console.log(`    ✅ 符合要求`);
          }
        }
      });
    }

    // 如果有修改，写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`💾 已保存优化后的内容到 ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
  }
}

// 处理所有文件
const messagesDir =
  '/Users/jason-chen/Downloads/project/vibetrans/messages/pages';
const processedFiles = [];

// 遍历所有工具目录
fs.readdirSync(messagesDir, { withFileTypes: true }).forEach((dirent) => {
  if (dirent.isDirectory()) {
    const toolDir = dirent.name;
    const enJsonPath = path.join(messagesDir, toolDir, 'en.json');

    if (fs.existsSync(enJsonPath)) {
      checkAndOptimizeFunFacts(enJsonPath, toolDir);
      processedFiles.push(toolDir);
    }
  }
});

console.log(
  `\n🎉 FunFacts内容优化完成! 共处理了 ${processedFiles.length} 个文件`
);
