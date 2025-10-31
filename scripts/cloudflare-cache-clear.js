#!/usr/bin/env node

/**
 * Cloudflare缓存和部署清理脚本
 * 处理缓存相关的3MB限制问题
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 开始Cloudflare缓存和部署清理...\n');

// 1. 清理本地构建缓存
console.log('1️⃣ 清理本地构建缓存...');
const cleanSteps = [
  {
    name: '清理Next.js缓存',
    command: 'rm -rf .next',
    description: '删除.next构建目录'
  },
  {
    name: '清理Node.js缓存',
    command: 'npm cache clean --force || pnpm store prune || yarn cache clean',
    description: '清理包管理器缓存'
  },
  {
    name: '清理Turbo缓存',
    command: 'rm -rf .turbo || true',
    description: '删除Turbo构建缓存'
  },
  {
    name: '清理临时文件',
    command: 'find . -name "*.tmp" -delete 2>/dev/null || true',
    description: '删除临时文件'
  }
];

for (const step of cleanSteps) {
  try {
    console.log(`   ${step.description}...`);
    execSync(step.command, { stdio: 'inherit' });
    console.log(`   ✅ ${step.name}完成`);
  } catch (error) {
    console.log(`   ⚠️  ${step.name}失败（可能不存在）`);
  }
}

// 2. 检查和优化环境变量
console.log('\n2️⃣ 检查环境变量配置...');
const envFiles = ['.env.local', '.env', '.env.production'];
let envIssues = [];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    console.log(`   📁 ${envFile}: ${lines.length} 个配置项`);

    // 检查是否有大型配置
    lines.forEach((line, index) => {
      if (line.length > 1000) {
        envIssues.push(`${envFile} 第${index + 1}行配置过大 (${line.length} 字符)`);
      }
    });
  }
}

if (envIssues.length > 0) {
  console.log('   ⚠️  发现环境变量问题:');
  envIssues.forEach(issue => console.log(`     - ${issue}`));
} else {
  console.log('   ✅ 环境变量配置正常');
}

// 3. 创建Cloudflare清理命令
console.log('\n3️⃣ 生成Cloudflare清理命令...');
const cfCommands = `
# Cloudflare缓存清理命令（手动执行）

# 1. 清除整个域名缓存
wrangler cache purge --url=https://your-domain.com/*

# 2. 清除特定路径缓存
wrangler cache purge --url=https://your-domain.com/api/*
wrangler cache purge --url=https://your-domain.com/_next/static/*

# 3. 清除Pages部署缓存
wrangler pages deployment list
wrangler pages deployment delete DEPLOYMENT_ID

# 4. 使用Cloudflare Dashboard清理
# 访问: https://dash.cloudflare.com/
# 进入你的域名 > Caching > Configuration > Purge Cache
# 选择 "Custom purge" > "Purge everything"
`;

console.log('📋 Cloudflare缓存清理命令已生成:');
console.log(cfCommands);

// 4. 优化部署脚本
console.log('\n4️⃣ 创建优化的部署脚本...');
const optimizedDeployScript = `#!/bin/bash

# 优化的Cloudflare Pages部署脚本
# 处理3MB限制问题的完整部署流程

echo "🚀 开始优化的Cloudflare Pages部署..."

# 步骤1: 彻底清理
echo "🧹 步骤1: 清理缓存和构建文件..."
rm -rf .next .vercel dist .turbo
pnpm store prune || npm cache clean --force

# 步骤2: 安装依赖（确保最新）
echo "📦 步骤2: 重新安装依赖..."
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 步骤3: 优化构建
echo "🔨 步骤3: 执行优化构建..."
pnpm optimize
pnpm build

# 步骤4: 检查构建大小
echo "📊 步骤4: 检查构建大小..."
node scripts/fix-cloudflare-limit.js

# 步骤5: Cloudflare构建和部署
echo "☁️  步骤5: Cloudflare Pages构建..."
pnpm build:cf

# 步骤6: 部署（带缓存清理）
echo "🚀 步骤6: 部署到Cloudflare Pages..."
pnpm exec wrangler pages deploy .vercel/output/static --compatibility-date=2023-10-30

# 步骤7: 清理Cloudflare缓存
echo "🧹 步骤7: 清理Cloudflare缓存..."
echo "请手动执行: wrangler cache purge --url=https://your-domain.com/*"

echo "✅ 部署完成！"
`;

fs.writeFileSync(path.join(__dirname, 'deploy-optimized.sh'), optimizedDeployScript);
fs.chmodSync(path.join(__dirname, 'deploy-optimized.sh'), '755');

console.log('   ✅ 创建了优化的部署脚本: scripts/deploy-optimized.sh');

// 5. 生成故障排除指南
console.log('\n5️⃣ 生成故障排除指南...');
const troubleshootingGuide = `
# Cloudflare Pages 3MB限制故障排除指南

## 🚨 如果部署时仍然遇到3MB错误：

### 立即解决方案：
1. 使用优化部署脚本：
   \`\`\`bash
   chmod +x scripts/deploy-optimized.sh
   ./scripts/deploy-optimized.sh
   \`\`\`

2. 手动清理Cloudflare缓存：
   \`\`\`bash
   wrangler cache purge --url=https://your-domain.com/*
   \`\`\`

### 深度问题排查：

#### 1. 检查实际部署的文件大小：
\`\`\`bash
# 查看部署输出中最大的文件
find .vercel/output/static/_next/static/chunks -name "*.js" -exec ls -lh {} \; | sort -k5 -hr | head -5
\`\`\`

#### 2. 检查是否有隐藏的大文件：
\`\`\`bash
# 查找所有大于1MB的文件
find .vercel -type f -size +1M -exec ls -lh {} \;
\`\`\`

#### 3. 使用wrangler详细日志：
\`\`\`bash
WRANGLER_LOG=debug pnpm deploy:cf
\`\`\`

### 长期解决方案：
1. 考虑将翻译器配置移到Cloudflare KV
2. 使用动态导入分割大型配置
3. 启用Cloudflare的Brotli压缩
4. 考虑升级到更高配置的Cloudflare计划

### 紧急备用方案：
如果问题持续，可以：
1. 暂时禁用部分翻译器功能
2. 使用更轻量级的配置
3. 分阶段部署功能
`;

fs.writeFileSync(path.join(__dirname, 'TROUBLESHOOTING.md'), troubleshootingGuide);

console.log('   ✅ 创建故障排除指南: scripts/TROUBLESHOOTING.md');

console.log('\n🎉 Cloudflare缓存清理完成！');
console.log('\n📋 下一步操作：');
console.log('1. 运行优化部署: ./scripts/deploy-optimized.sh');
console.log('2. 手动清理缓存: wrangler cache purge --url=https://your-domain.com/*');
console.log('3. 查看故障排除: cat scripts/TROUBLESHOOTING.md');