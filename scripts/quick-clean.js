#!/usr/bin/env node

/**
 * 快速清理脚本 - 专门解决3MB限制问题
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 快速清理 - 解决Cloudflare Pages 3MB限制\n');

// 1. 清理构建缓存
console.log('1️⃣ 清理构建缓存...');
const buildDirs = ['.next', '.vercel', 'dist', '.turbo', '.cache'];

let cleanedSize = 0;
for (const dir of buildDirs) {
  if (fs.existsSync(dir)) {
    try {
      const stats = fs.statSync(dir);
      if (stats.isDirectory()) {
        // 简单计算大小
        const size = execSync(`du -s "${dir}" 2>/dev/null | cut -f1`, { encoding: 'utf8' }).trim();
        const sizeMB = parseFloat(size) / 1024;

        fs.rmSync(dir, { recursive: true, force: true });
        cleanedSize += sizeMB * 1024 * 1024;
        console.log(`   🗑️  删除 ${dir}: ${sizeMB.toFixed(2)}MB`);
      }
    } catch (error) {
      console.log(`   ⚠️  无法删除 ${dir}`);
    }
  }
}

// 2. 清理临时文件
console.log('\n2️⃣ 清理临时文件...');
const tempFiles = ['*.tmp', '*.temp', '*.log', '.DS_Store', 'Thumbs.db'];

for (const pattern of tempFiles) {
  try {
    const result = execSync(`find . -name "${pattern}" -type f 2>/dev/null`, { encoding: 'utf8' });
    const files = result.trim().split('\n').filter(f => f);

    for (const file of files) {
      if (file && fs.existsSync(file)) {
        const stats = fs.statSync(file);
        fs.unlinkSync(file);
        cleanedSize += stats.size;
        console.log(`   🗑️  删除 ${file}`);
      }
    }
  } catch (error) {
    // 忽略错误
  }
}

// 3. 清理TypeScript构建缓存
console.log('\n3️⃣ 清理TypeScript缓存...');
if (fs.existsSync('tsconfig.tsbuildinfo')) {
  const stats = fs.statSync('tsconfig.tsbuildinfo');
  fs.unlinkSync('tsconfig.tsbuildinfo');
  cleanedSize += stats.size;
  console.log(`   🗑️  删除 tsconfig.tsbuildinfo: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`);
}

console.log(`\n✅ 清理完成！释放 ${(cleanedSize / (1024 * 1024)).toFixed(2)}MB 空间`);

// 4. 检查当前项目状态
console.log('\n📊 当前项目状态:');

// 检查node_modules
if (fs.existsSync('node_modules')) {
  try {
    const result = execSync('du -sh node_modules 2>/dev/null | cut -f1', { encoding: 'utf8' });
    console.log(`   node_modules: ${result.trim()}`);
  } catch (error) {
    console.log('   node_modules: 无法计算大小');
  }
}

// 检查项目总大小
try {
  const result = execSync('du -sh . 2>/dev/null | cut -f1', { encoding: 'utf8' });
  console.log(`   项目总大小: ${result.trim()}`);
} catch (error) {
  console.log('   项目总大小: 无法计算');
}

// 5. 生成Cloudflare缓存清理命令
console.log('\n📋 Cloudflare缓存清理命令:');
console.log('   wrangler cache purge --url=https://your-domain.com/*');
console.log('   或在Cloudflare Dashboard手动清除缓存');

console.log('\n🎯 现在可以安全部署:');
console.log('   pnpm build:optimized');
console.log('   pnpm deploy:cf-safe');