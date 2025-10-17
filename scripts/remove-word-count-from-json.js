#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  findJsonFiles,
  WORD_COUNT_PATTERNS,
} = require('./find-word-count-in-json.js');

// 字数统计移除模式
const REMOVE_PATTERNS = [
  /\s*\(\d+\s+words?\)\s*[.!?]?$/gi, // (45 words) 在句末，可能带标点
  /\s*\(\d+\s+words?\)\./gi, // (45 words). 后面有句号
];

function removeWordCountFromText(text) {
  if (typeof text !== 'string') {
    return text;
  }

  let cleaned = text;
  REMOVE_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 清理末尾多余的空格
  cleaned = cleaned.trim();

  return cleaned;
}

function processJsonObject(obj) {
  if (typeof obj === 'string') {
    return removeWordCountFromText(obj);
  } else if (Array.isArray(obj)) {
    return obj.map((item) => processJsonObject(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = processJsonObject(value);
    }
    return cleaned;
  }
  return obj;
}

function removeWordCountFromFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(originalContent);

    const cleanedData = processJsonObject(jsonData);
    const cleanedContent = JSON.stringify(cleanedData, null, 2);

    // 检查是否有变化
    if (originalContent !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function backupFile(filePath) {
  try {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.error(`❌ Error backing up ${filePath}:`, error.message);
    return null;
  }
}

function main() {
  console.log('🧹 Starting word count removal from JSON files...\n');

  const jsonFiles = findJsonFiles(process.cwd());

  // 处理 .tool-generation 和 messages 目录下的文件
  const targetFiles = jsonFiles.filter(
    (file) => file.includes('.tool-generation/') || file.includes('messages/')
  );

  console.log(
    `📁 Found ${targetFiles.length} .tool-generation JSON files to process\n`
  );

  let processedFiles = 0;
  let modifiedFiles = 0;
  let errors = 0;

  // 创建备份目录
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  targetFiles.forEach((filePath) => {
    console.log(`🔧 Processing: ${filePath}`);

    try {
      // 备份文件
      const backupPath = backupFile(filePath);
      if (backupPath) {
        console.log(`  💾 Backup created: ${backupPath}`);
      }

      // 处理文件
      const wasModified = removeWordCountFromFile(filePath);

      processedFiles++;

      if (wasModified) {
        console.log(`  ✅ Word counts removed from ${filePath}`);
        modifiedFiles++;
      } else {
        console.log(`  ℹ️  No word counts found in ${filePath}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      errors++;
    }
    console.log();
  });

  console.log(`📊 SUMMARY:`);
  console.log(`  📁 Files processed: ${processedFiles}`);
  console.log(`  🔧 Files modified: ${modifiedFiles}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  💾 Backups created in ./backups/ directory`);

  if (modifiedFiles > 0) {
    console.log(
      `\n✅ Successfully removed word counts from ${modifiedFiles} files!`
    );
    console.log(
      `💡 Tip: Run 'node scripts/find-word-count-in-json.js' to verify removal.`
    );
  } else {
    console.log(`\nℹ️  No word counts were found that needed removal.`);
  }
}

function showDryRun() {
  console.log(
    '🔍 DRY RUN: Showing what would be removed without making changes...\n'
  );

  const jsonFiles = findJsonFiles(process.cwd());
  const targetFiles = jsonFiles.filter((file) =>
    file.includes('.tool-generation/')
  );

  let totalRemovals = 0;

  targetFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);

      let fileRemovals = 0;

      function countRemovals(obj, path = '') {
        if (typeof obj === 'string') {
          const original = obj;
          const cleaned = removeWordCountFromText(obj);
          if (original !== cleaned) {
            console.log(`  📍 ${filePath}:${path}`);
            console.log(`    - Before: "${original}"`);
            console.log(`    + After:  "${cleaned}"`);
            console.log(`    ──────────────────────`);
            fileRemovals++;
          }
        } else if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            countRemovals(value, path ? `${path}.${key}` : key);
          }
        }
      }

      countRemovals(jsonData);
      totalRemovals += fileRemovals;
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  });

  console.log(
    `\n📊 DRY RUN SUMMARY: ${totalRemovals} word counts would be removed`
  );
  console.log(`\n💡 Run without --dry-run to actually remove them.`);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--dry-run')) {
  showDryRun();
} else {
  main();
}

module.exports = {
  removeWordCountFromText,
  processJsonObject,
  removeWordCountFromFile,
};
