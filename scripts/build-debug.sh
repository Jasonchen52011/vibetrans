#!/bin/bash

# 构建错误快速诊断工具
# 使用方法: ./scripts/build-debug.sh

echo "======================================"
echo "Next.js 构建错误诊断工具"
echo "======================================"
echo ""

LOG_FILE="build-error.log"

echo "🔄 开始构建并捕获错误..."
pnpm build 2>&1 | tee "$LOG_FILE"
BUILD_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "======================================"
echo "📊 错误分析"
echo "======================================"
echo ""

if [ $BUILD_EXIT_CODE -eq 0 ]; then
  echo "✅ 构建成功！"
  BUILD_SIZE=$(du -sh .next | cut -f1)
  echo "构建大小: $BUILD_SIZE"

  # 分析包大小
  echo ""
  echo "📦 最大的路由页面:"
  grep "○" "$LOG_FILE" | grep "kB" | sort -k3 -rn | head -10

  # 检查是否有大文件
  echo ""
  echo "⚠️  检查大于 500kB 的页面:"
  grep "○" "$LOG_FILE" | awk '{
    if ($3 ~ /[0-9]+/ && $3 > 500) {
      print $0
    }
  }'

  rm "$LOG_FILE"
  exit 0
fi

echo "❌ 构建失败 (退出码: $BUILD_EXIT_CODE)"
echo ""

# 1. 统计错误数量
TYPE_ERRORS=$(grep -c "Type error:" "$LOG_FILE" || echo 0)
MODULE_ERRORS=$(grep -c "Module not found:" "$LOG_FILE" || echo 0)
SYNTAX_ERRORS=$(grep -c "SyntaxError:" "$LOG_FILE" || echo 0)
OTHER_ERRORS=$(grep -c "Error:" "$LOG_FILE" || echo 0)

echo "📈 错误统计:"
echo "  - 类型错误: $TYPE_ERRORS"
echo "  - 模块未找到: $MODULE_ERRORS"
echo "  - 语法错误: $SYNTAX_ERRORS"
echo "  - 其他错误: $OTHER_ERRORS"
echo ""

# 2. 提取模块错误
if [ $MODULE_ERRORS -gt 0 ]; then
  echo "🔍 缺失模块详情:"
  echo ""

  # 提取所有缺失的模块
  grep "Module not found:" "$LOG_FILE" | while read -r line; do
    MODULE=$(echo "$line" | grep -o "Can't resolve '[^']*'" | sed "s/Can't resolve '//;s/'//")
    if [ -n "$MODULE" ]; then
      echo "  ❌ $MODULE"
    fi
  done | sort -u

  echo ""
  echo "💡 建议修复命令:"
  echo ""

  # 生成安装命令
  MISSING_PACKAGES=$(grep "Module not found:" "$LOG_FILE" | grep -o "Can't resolve '[^']*'" | sed "s/Can't resolve '//;s/'//" | grep -v "^@/" | grep -v "^\./" | sort -u)

  if [ -n "$MISSING_PACKAGES" ]; then
    echo "  pnpm add \\"
    echo "$MISSING_PACKAGES" | while read -r pkg; do
      echo "    $pkg \\"
    done | sed '$ s/ \\$//'
  fi

  # 检查 Radix UI 组件
  RADIX_MISSING=$(grep "Module not found:" "$LOG_FILE" | grep -o "@radix-ui/[^ ]*" | sort -u)
  if [ -n "$RADIX_MISSING" ]; then
    echo ""
    echo "  # Radix UI 组件:"
    echo "  pnpm add \\"
    echo "$RADIX_MISSING" | while read -r pkg; do
      echo "    $pkg \\"
    done | sed '$ s/ \\$//'
  fi

  echo ""
fi

# 3. 提取类型错误
if [ $TYPE_ERRORS -gt 0 ]; then
  echo "🔍 类型错误详情:"
  echo ""

  grep -A 2 "Type error:" "$LOG_FILE" | head -20

  if [ $TYPE_ERRORS -gt 5 ]; then
    echo ""
    echo "... (还有 $((TYPE_ERRORS - 5)) 个类型错误)"
  fi
  echo ""
fi

# 4. 提取语法错误
if [ $SYNTAX_ERRORS -gt 0 ]; then
  echo "🔍 语法错误详情:"
  echo ""

  grep -A 3 "SyntaxError:" "$LOG_FILE" | head -20
  echo ""
fi

# 5. 检查常见问题
echo "======================================"
echo "🔧 常见问题检查"
echo "======================================"
echo ""

# 检查是否是 Edge Runtime 问题
if grep -q "edge.*runtime" "$LOG_FILE"; then
  echo "⚠️  检测到 Edge Runtime 相关错误"
  echo "   建议: 检查 layout.tsx 是否有全局 'export const runtime = edge'"
  echo "   某些页面可能不兼容 Edge Runtime（如使用大量客户端库）"
  echo ""
fi

# 检查是否是 UI 组件问题
if grep -q "@/components/ui/" "$LOG_FILE"; then
  echo "⚠️  检测到 UI 组件相关错误"
  echo "   建议: 使用 ./scripts/check-ui-component.sh 检查组件依赖"
  echo "   可能需要从 git 恢复被误删的组件"
  echo ""
fi

# 检查是否是国际化问题
if grep -q "messages/pages/" "$LOG_FILE" || grep -q "next-intl" "$LOG_FILE"; then
  echo "⚠️  检测到国际化相关错误"
  echo "   建议: 检查 src/i18n/messages.ts 中的翻译文件导入"
  echo "   确保所有引用的翻译文件都存在"
  echo ""
fi

# 检查是否是环境变量问题
if grep -q "env" "$LOG_FILE"; then
  echo "⚠️  检测到环境变量相关错误"
  echo "   建议: 检查 .env.local 文件是否配置正确"
  echo ""
fi

echo "======================================"
echo "📝 完整日志"
echo "======================================"
echo "完整构建日志已保存到: $LOG_FILE"
echo ""
echo "快速修复步骤:"
echo "1. 查看上方的 '建议修复命令' 并执行"
echo "2. 如果是组件问题，使用 git checkout 恢复被删除的文件"
echo "3. 修复后重新运行: pnpm build"
echo "4. 如果问题持续，查看完整日志: cat $LOG_FILE"
echo ""

exit $BUILD_EXIT_CODE
