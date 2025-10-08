#!/bin/bash

# UI组件依赖检查工具
# 使用方法: ./scripts/check-ui-component.sh <component-name>
# 示例: ./scripts/check-ui-component.sh tooltip

if [ -z "$1" ]; then
  echo "使用方法: ./scripts/check-ui-component.sh <component-name>"
  echo "示例: ./scripts/check-ui-component.sh tooltip"
  exit 1
fi

COMPONENT=$1
COMPONENT_FILE="src/components/ui/${COMPONENT}.tsx"

echo "======================================"
echo "检查 UI 组件: $COMPONENT"
echo "======================================"
echo ""

# 检查组件文件是否存在
if [ ! -f "$COMPONENT_FILE" ]; then
  echo "❌ 组件文件不存在: $COMPONENT_FILE"
  exit 1
fi

echo "✅ 组件文件存在: $COMPONENT_FILE"
echo ""

# 1. 搜索直接导入
echo "🔍 1. 搜索直接导入..."
IMPORT_COUNT=$(grep -r "from '@/components/ui/${COMPONENT}'" src --include="*.tsx" --include="*.ts" | grep -v "src/components/ui/${COMPONENT}.tsx" | wc -l)
echo "发现 $IMPORT_COUNT 处导入"
if [ $IMPORT_COUNT -gt 0 ]; then
  echo "详细位置:"
  grep -r "from '@/components/ui/${COMPONENT}'" src --include="*.tsx" --include="*.ts" | grep -v "src/components/ui/${COMPONENT}.tsx"
fi
echo ""

# 2. 检查 Radix UI 依赖
echo "🔍 2. 检查 Radix UI 对等依赖..."
RADIX_IMPORT=$(grep "@radix-ui/react-${COMPONENT}" "$COMPONENT_FILE" || echo "")
if [ -n "$RADIX_IMPORT" ]; then
  echo "✅ 发现 Radix UI 依赖:"
  echo "$RADIX_IMPORT"
  RADIX_PKG=$(echo "$RADIX_IMPORT" | grep -o "@radix-ui/react-[a-z-]*" | head -1)
  echo ""
  echo "检查 package.json 中是否存在 $RADIX_PKG..."
  if grep -q "\"$RADIX_PKG\"" package.json; then
    echo "✅ 已安装: $RADIX_PKG"
  else
    echo "❌ 未安装: $RADIX_PKG"
    echo "建议运行: pnpm add $RADIX_PKG"
  fi
else
  echo "ℹ️  未发现 Radix UI 依赖"
fi
echo ""

# 3. 搜索组件使用（JSX）
echo "🔍 3. 搜索组件使用（JSX）..."
# 提取组件导出的所有命名导出
EXPORTS=$(grep "export" "$COMPONENT_FILE" | grep -o "export.*function \w*" | awk '{print $3}' | sed 's/[({]//g')
TOTAL_USAGE=0

for EXPORT in $EXPORTS; do
  USAGE_COUNT=$(grep -r "<${EXPORT}" src --include="*.tsx" | grep -v "src/components/ui/${COMPONENT}.tsx" | wc -l)
  if [ $USAGE_COUNT -gt 0 ]; then
    echo "  - $EXPORT: $USAGE_COUNT 处使用"
    TOTAL_USAGE=$((TOTAL_USAGE + USAGE_COUNT))
  fi
done

if [ $TOTAL_USAGE -eq 0 ]; then
  echo "ℹ️  未发现组件使用"
fi
echo ""

# 4. 检查其他 UI 组件依赖
echo "🔍 4. 检查其他 UI 组件依赖..."
OTHER_UI_IMPORTS=$(grep "from '@/components/ui/" "$COMPONENT_FILE" | grep -v "cn" | wc -l)
if [ $OTHER_UI_IMPORTS -gt 0 ]; then
  echo "发现 $OTHER_UI_IMPORTS 个其他 UI 组件依赖:"
  grep "from '@/components/ui/" "$COMPONENT_FILE" | grep -v "cn"
else
  echo "ℹ️  无其他 UI 组件依赖"
fi
echo ""

# 总结
echo "======================================"
echo "📊 依赖总结"
echo "======================================"
echo "直接导入: $IMPORT_COUNT 处"
echo "JSX 使用: $TOTAL_USAGE 处"
echo "其他 UI 依赖: $OTHER_UI_IMPORTS 个"
echo ""

TOTAL_DEPS=$((IMPORT_COUNT + TOTAL_USAGE))

if [ $TOTAL_DEPS -eq 0 ]; then
  echo "✅ 该组件可以安全删除（无依赖）"
  echo ""
  read -p "是否确认删除 $COMPONENT_FILE? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm "$COMPONENT_FILE"
    echo "✅ 已删除: $COMPONENT_FILE"

    # 如果有 Radix UI 依赖，提示是否也删除
    if [ -n "$RADIX_PKG" ]; then
      echo ""
      read -p "是否也卸载 $RADIX_PKG? (y/N): " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        pnpm remove "$RADIX_PKG"
        echo "✅ 已卸载: $RADIX_PKG"
      fi
    fi

    echo ""
    echo "建议运行构建测试: pnpm build"
  else
    echo "❌ 取消删除"
  fi
else
  echo "⚠️  该组件有 $TOTAL_DEPS 处依赖，不建议删除"
  echo ""
  echo "如果仍要删除，请先处理以下依赖:"
  if [ $IMPORT_COUNT -gt 0 ]; then
    echo ""
    echo "导入位置:"
    grep -r "from '@/components/ui/${COMPONENT}'" src --include="*.tsx" --include="*.ts" | grep -v "src/components/ui/${COMPONENT}.tsx"
  fi
fi
