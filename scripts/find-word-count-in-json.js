#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 字数统计相关的关键词模式 - 专门针对页面显示的字数统计
const WORD_COUNT_PATTERNS = [
  /\(\d+\s+words?\)$/i, // (45 words) 在句末
  /\(\d+\s+words?\)\./i, // (45 words). 后面有句号
  /\(\d+\s+words?\)\s*[.!?]?$/i, // (45 words) 在句末，可能有标点
  /字数[:：]\s*\d+/, // 中文格式：字数：50
  /字符数[:：]\s*\d+/, // 中文格式：字符数：50
];

function findJsonFiles(dir) {
  const result = [];

  function walkDirectory(
    currentDir,
    ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next']
  ) {
    try {
      const files = fs.readdirSync(currentDir);

      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          if (!ignoreDirs.includes(file)) {
            walkDirectory(filePath);
          }
        } else if (file.endsWith('.json')) {
          result.push(filePath);
        }
      }
    } catch (error) {
      // 忽略无法读取的目录
    }
  }

  walkDirectory(dir);
  return result;
}

function searchWordCountInJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(content);

    const matches = [];

    function searchInObject(obj, path = '') {
      if (typeof obj === 'string') {
        WORD_COUNT_PATTERNS.forEach((pattern, index) => {
          if (pattern.test(obj)) {
            matches.push({
              path: path,
              value: obj,
              pattern: pattern.toString(),
              patternIndex: index,
            });
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          searchInObject(value, path ? `${path}.${key}` : key);
        }
      }
    }

    searchInObject(jsonData);

    if (matches.length > 0) {
      console.log(`\n🔍 Found word count in ${filePath}:`);
      matches.forEach((match) => {
        console.log(`  📍 Path: ${match.path}`);
        console.log(`  📝 Value: "${match.value}"`);
        console.log(`  🔧 Pattern: ${match.pattern}`);
        console.log(`  ──────────────────────`);
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log(
    '🚀 Starting search for word count references in JSON files...\n'
  );

  const jsonFiles = findJsonFiles(process.cwd());
  console.log(`📁 Found ${jsonFiles.length} JSON files to check\n`);

  let filesWithMatches = 0;
  const totalMatches = 0;

  jsonFiles.forEach((filePath) => {
    const hasMatches = searchWordCountInJson(filePath);
    if (hasMatches) {
      filesWithMatches++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`  📁 Files checked: ${jsonFiles.length}`);
  console.log(`  🔍 Files with matches: ${filesWithMatches}`);
  console.log(`  📝 Total matches found: ${totalMatches}`);

  if (filesWithMatches === 0) {
    console.log(`\n✅ No word count references found in any JSON files!`);
  } else {
    console.log(
      `\n⚠️  Found word count references in ${filesWithMatches} files. Review and remove them.`
    );
  }
}

if (require.main === module) {
  main();
}

module.exports = { findJsonFiles, searchWordCountInJson, WORD_COUNT_PATTERNS };
