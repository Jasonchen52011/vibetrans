#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚫 开始临时排除指定页面不进行构建...');

// 需要排除的页面列表
const excludedPages = [
  'english-to-persian-translator',
  'english-to-chinese-translator',
  'japanese-to-english-translator',
];

function createTempPage(filePath) {
  const tempContent = `'use client';

export const runtime = 'edge';

// 临时占位页面 - 此页面暂时不部署
export default function TempPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Page Temporarily Unavailable</h1>
        <p className="text-gray-600">This page is under maintenance, please try again later.</p>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(filePath, tempContent, 'utf8');
  console.log(`✅ 创建临时占位页面: ${filePath}`);
}

function findAndReplacePages(dir) {
  const items = fs.readdirSync(dir);
  let processedCount = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 检查是否是需要排除的页面目录
      if (excludedPages.includes(item)) {
        const pageFile = path.join(fullPath, 'page.tsx');

        // 备份原文件
        if (fs.existsSync(pageFile)) {
          const backupFile = path.join(fullPath, 'page.tsx.backup');
          fs.copyFileSync(pageFile, backupFile);
          console.log(`📋 备份原文件: ${backupFile}`);

          // 创建临时占位页面
          createTempPage(pageFile);
          processedCount++;
        }
      } else {
        // 递归处理子目录
        processedCount += findAndReplacePages(fullPath);
      }
    }
  }

  return processedCount;
}

// 查找并处理页面文件
const appDir = path.join(
  process.cwd(),
  'src',
  'app',
  '[locale]',
  '(marketing)',
  '(pages)'
);
const processedCount = findAndReplacePages(appDir);

console.log(`\n🎉 完成！已临时处理 ${processedCount} 个页面`);
console.log(`📋 排除的页面: ${excludedPages.join(', ')}`);
console.log(`\n💡 提示: 备份文件名为 page.tsx.backup，构建完成后可恢复`);
