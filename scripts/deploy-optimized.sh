#!/bin/bash

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
