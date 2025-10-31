#!/bin/bash

# 部署前检查脚本
# 确保不会触发3MB限制

echo "🔍 执行部署前检查..."

# 1. 检查项目大小
echo "检查项目大小..."
PROJECT_SIZE=$(du -sh . | cut -f1)
echo "项目总大小: $PROJECT_SIZE"

# 2. 检查是否有大型文件
echo "检查大型文件..."
find . -type f -size +5M -not -path "./node_modules/*" -not -path "./.git/*" | head -10

# 3. 检查node_modules大小
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
    echo "node_modules大小: $NODE_MODULES_SIZE"
fi

# 4. 检查构建缓存
echo "检查构建缓存..."
[ -d ".next" ] && echo ".next存在: $(du -sh .next | cut -f1)"
[ -d ".vercel" ] && echo ".vercel存在: $(du -sh .vercel | cut -f1)"

# 5. 环境检查
echo "检查环境变量..."
if [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
    echo "⚠️  缺少 GOOGLE_GENERATIVE_AI_API_KEY"
else
    echo "✅ API密钥已设置"
fi

# 6. 内存使用检查
echo "检查系统资源..."
MEMORY_USAGE=$(free -m | grep "Mem:" | awk '{print $3"/"$2"MB"}')
echo "内存使用: $MEMORY_USAGE"

DISK_USAGE=$(df -h . | tail -1 | awk '{print $3"/"$2" ("$5")"}')
echo "磁盘使用: $DISK_USAGE"

echo "✅ 部署前检查完成"
