#!/usr/bin/env node

/**
 * 优化翻译器配置文件大小
 * 通过压缩重复的prompt模板和配置数据
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/lib/ai-base/translator-configs.ts');

// 备份原文件
const backupPath = configPath + '.backup';
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(configPath, backupPath);
  console.log('✅ 已创建备份文件');
}

// 读取配置文件
let content = fs.readFileSync(configPath, 'utf8');

// 简单的优化：移除多余的空行和注释
const optimizations = [
  // 移除多余空行
  { pattern: /\n\s*\n\s*\n/g, replacement: '\n\n' },
  // 移除行尾空格
  { pattern: /[ \t]+$/gm, replacement: '' },
  // 压缩import语句之间的空行
  { pattern: /\n\nimport/g, replacement: '\nimport' },
];

let originalSize = Buffer.byteLength(content, 'utf8');
let optimizedContent = content;

optimizations.forEach(({ pattern, replacement }) => {
  optimizedContent = optimizedContent.replace(pattern, replacement);
});

// 添加更激进的优化：压缩长prompt字符串
optimizedContent = optimizedContent.replace(
  /(`[^`]{50,}`)/g,
  (match) => {
    // 简单压缩：将多个空格变为单个空格
    return match.replace(/\s+/g, ' ').trim();
  }
);

let optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');
let savings = originalSize - optimizedSize;

// 写入优化后的文件
fs.writeFileSync(configPath, optimizedContent);

console.log(`📊 配置文件优化结果:`);
console.log(`   原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`   优化后: ${(optimizedSize / 1024).toFixed(2)} KB`);
console.log(`   节省: ${(savings / 1024).toFixed(2)} KB (${((savings / originalSize) * 100).toFixed(1)}%)`);

if (savings > 0) {
  console.log('✅ 优化完成！');
} else {
  console.log('ℹ️  文件已经足够优化');
}