#!/bin/bash

# 脚本分类整理器
# 将scripts目录下的224个脚本按功能分类整理

set -e

SCRIPTS_DIR="scripts"
BACKUP_DIR="scripts-backup-$(date +%Y%m%d-%H%M%S)"
CATEGORIES=("deploy" "test" "generate" "backup" "monitor" "fix" "optimize" "capture" "build" "utils")

echo "🚀 开始脚本分类整理..."

# 创建备份
echo "📦 创建备份: $BACKUP_DIR"
cp -r $SCRIPTS_DIR $BACKUP_DIR

# 创建新的分类目录结构
echo "📁 创建分类目录结构..."
for category in "${CATEGORIES[@]}"; do
    mkdir -p "$SCRIPTS_DIR/$category"
done

# 移动README文件到根目录
if [ -f "$SCRIPTS_DIR/README.md" ]; then
    mv "$SCRIPTS_DIR/README.md" "$SCRIPTS_DIR/../README-SCRIPTS.md"
fi

# 分类移动脚本
echo "🔄 开始分类移动脚本..."

# 部署相关脚本
echo "  📦 移动部署脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(deploy|publish|release)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/deploy/$filename"
        echo "    → deploy/$filename"
    fi
done

# 测试相关脚本
echo "  🧪 移动测试脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(test|validation|check)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/test/$filename"
        echo "    → test/$filename"
    fi
done

# 生成相关脚本
echo "  ⚡ 移动生成脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(generate|auto|create|batch)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/generate/$filename"
        echo "    → generate/$filename"
    fi
done

# 备份相关脚本
echo "  💾 移动备份脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(backup|archive)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/backup/$filename"
        echo "    → backup/$filename"
    fi
done

# 监控相关脚本
echo "  📊 移动监控脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(monitor|watch|log)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/monitor/$filename"
        echo "    → monitor/$filename"
    fi
done

# 修复相关脚本
echo "  🔧 移动修复脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(fix|repair|mend|patch)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/fix/$filename"
        echo "    → fix/$filename"
    fi
done

# 优化相关脚本
echo "  ⚡ 移动优化脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(optimize|compress|improve|enhance)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/optimize/$filename"
        echo "    → optimize/$filename"
    fi
done

# 截图相关脚本
echo "  📸 移动截图脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(capture|screenshot|snap)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/capture/$filename"
        echo "    → capture/$filename"
    fi
done

# 构建相关脚本
echo "  🏗️ 移动构建脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | grep -E "(build|compile|bundle)" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/build/$filename"
        echo "    → build/$filename"
    fi
done

# 工具类脚本
echo "  🛠️ 移动工具脚本..."
find $SCRIPTS_DIR -maxdepth 1 -name "*.js" -o -name "*.ts" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # 跳过已经分类的脚本
        categorized=false
        for category in "${CATEGORIES[@]}"; do
            if [[ "$filename" =~ (deploy|test|generate|backup|monitor|fix|optimize|capture|build) ]]; then
                categorized=true
                break
            fi
        done

        if [ "$categorized" = false ]; then
            mv "$file" "$SCRIPTS_DIR/utils/$filename"
            echo "    → utils/$filename"
        fi
done

# 移动README文件
find $SCRIPTS_DIR -maxdepth 1 -name "*.md" | while read file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        mv "$file" "$SCRIPTS_DIR/utils/$filename"
        echo "    → utils/$filename"
    fi
done

echo ""
echo "✅ 脚本分类完成!"
echo ""
echo "📊 分类统计:"
for category in "${CATEGORIES[@]}"; do
    count=$(ls -1 "$SCRIPTS_DIR/$category" 2>/dev/null | wc -l)
    echo "  $category: $count 个脚本"
done
echo ""
echo "📦 备份位置: $BACKUP_DIR"
echo "🔧 如需回滚，运行: rm -rf scripts && mv $BACKUP_DIR scripts"