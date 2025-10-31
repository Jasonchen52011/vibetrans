#!/bin/bash

# 智能部署脚本 - 解决Cloudflare Pages 3MB限制问题

set -e

echo "🚀 开始智能部署..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 步骤1: 清理
log_info "步骤1: 清理缓存和临时文件"
node scripts/quick-clean.js

# 步骤2: 优化配置
log_info "步骤2: 优化项目配置"
node scripts/optimize-configs.js

# 步骤3: 检查依赖
log_info "步骤3: 检查依赖"
if [ ! -d "node_modules" ]; then
    log_info "安装依赖..."
    pnpm install
fi

# 步骤4: 优化构建
log_info "步骤4: 执行优化构建"
pnpm build:optimized

# 步骤5: Cloudflare构建
log_info "步骤5: Cloudflare Pages构建"
pnpm build:cf

# 步骤6: 部署
log_info "步骤6: 部署到Cloudflare Pages"
pnpm deploy:cf

# 步骤7: 缓存清理建议
log_info "步骤7: 清理Cloudflare缓存"
echo "建议手动执行: wrangler cache purge --url=https://your-domain.com/*"

log_info "🎉 智能部署完成！"