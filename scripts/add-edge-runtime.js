#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始为所有页面添加 Edge Runtime...');

function addEdgeRuntimeToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否已经有 runtime 配置
    if (content.includes('export const runtime')) {
      console.log(`⏭️  跳过 ${filePath} - 已有 runtime 配置`);
      return false;
    }

    // 查找第一个 'use client' 或 import 语句
    const lines = content.split('\n');
    let insertIndex = 0;

    // 跳过开头的注释和空行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line &&
        !line.startsWith('//') &&
        !line.startsWith('/*') &&
        !line.startsWith('*')
      ) {
        // 如果找到 'use client'，在它之后插入
        if (line === "'use client';") {
          insertIndex = i + 1;
          // 跳过空行
          while (insertIndex < lines.length && !lines[insertIndex].trim()) {
            insertIndex++;
          }
        } else {
          // 否则在当前位置插入
          insertIndex = i;
        }
        break;
      }
    }

    // 插入 Edge Runtime 配置
    lines.splice(insertIndex, 0, '', "export const runtime = 'edge';");

    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');

    console.log(`✅ 已添加 Edge Runtime: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return false;
  }
}

function findPageFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'page.tsx' || item === 'layout.tsx') {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// 查找所有页面文件
const appDir = path.join(process.cwd(), 'src', 'app');
const pageFiles = findPageFiles(appDir);

console.log(`📄 找到 ${pageFiles.length} 个页面文件`);

let updatedCount = 0;
for (const file of pageFiles) {
  if (addEdgeRuntimeToFile(file)) {
    updatedCount++;
  }
}

console.log(`\n🎉 完成！已为 ${updatedCount} 个文件添加 Edge Runtime 配置`);
console.log(`📊 总共处理了 ${pageFiles.length} 个页面文件`);
