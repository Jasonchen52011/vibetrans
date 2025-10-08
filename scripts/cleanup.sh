#!/bin/bash

# Cloudflare Pages 3MB 限制优化 - 5轮自动化删除脚本
# 使用方法: chmod +x scripts/cleanup.sh && ./scripts/cleanup.sh

set -e

echo "======================================"
echo "Cloudflare Pages 3MB 优化脚本"
echo "======================================"
echo ""

# 记录初始构建大小
echo "📊 记录初始构建大小..."
pnpm build
INITIAL_SIZE=$(du -sh .next | cut -f1)
echo "初始构建大小: $INITIAL_SIZE"
echo ""

# 第1轮：删除装饰性UI组件库
round_1() {
  echo "🔄 第1轮：删除装饰性UI组件库"
  echo "删除 MagicUI..."
  rm -rf src/components/magicui
  echo "删除 Tailark..."
  rm -rf src/components/tailark

  # 从 package.json 移除相关依赖
  echo "清理 package.json 依赖..."
  # 这部分需要手动或使用 jq 工具处理

  echo "✅ 第1轮删除完成，开始构建测试..."
  pnpm build

  if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    ROUND1_SIZE=$(du -sh .next | cut -f1)
    echo "第1轮后构建大小: $ROUND1_SIZE"
    git add .
    git commit -m "feat: round 1 - remove decorative UI libraries (MagicUI, Tailark)"
    echo ""
  else
    echo "❌ 第1轮构建失败，请检查错误"
    exit 1
  fi
}

# 第2轮：删除文档和博客系统
round_2() {
  echo "🔄 第2轮：删除文档和博客系统"
  echo "删除文档内容..."
  rm -rf content/docs
  echo "删除博客内容..."
  rm -rf content/blog
  echo "删除文档翻译..."
  rm -rf messages/pages/blog
  rm -rf messages/pages/docs
  echo "删除文档库代码..."
  rm -rf src/lib/docs
  rm -f source.config.ts
  rm -f src/lib/source.ts

  echo "✅ 第2轮删除完成，开始构建测试..."
  pnpm build

  if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    ROUND2_SIZE=$(du -sh .next | cut -f1)
    echo "第2轮后构建大小: $ROUND2_SIZE"
    git add .
    git commit -m "feat: round 2 - remove docs and blog system"
    echo ""
  else
    echo "❌ 第2轮构建失败，请检查错误"
    exit 1
  fi
}

# 第3轮：删除分析工具和聊天工具
round_3() {
  echo "🔄 第3轮：删除分析工具和聊天工具"
  echo "禁用 Vercel Analytics..."
  echo "禁用 Crisp Chat..."
  echo "禁用 OpenPanel Analytics..."

  # 替换 analytics.tsx
  cat > src/analytics/analytics.tsx << 'EOF'
/**
 * Analytics (disabled for Cloudflare)
 */
export default function Analytics() {
  return null;
}
EOF

  # 替换 open-panel-analytics.tsx
  cat > src/analytics/open-panel-analytics.tsx << 'EOF'
/**
 * OpenPanel Analytics (disabled)
 */
export default function OpenPanelAnalytics() {
  return null;
}
EOF

  # 替换 crisp-chat.tsx
  cat > src/components/layout/crisp-chat.tsx << 'EOF'
/**
 * Crisp Chat (disabled)
 */
export default function CrispChat() {
  return null;
}
EOF

  echo "✅ 第3轮删除完成，开始构建测试..."
  pnpm build

  if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    ROUND3_SIZE=$(du -sh .next | cut -f1)
    echo "第3轮后构建大小: $ROUND3_SIZE"
    git add .
    git commit -m "feat: round 3 - disable analytics and chat tools"
    echo ""
  else
    echo "❌ 第3轮构建失败，请检查错误"
    exit 1
  fi
}

# 第4轮：删除开发工具和测试页面
round_4() {
  echo "🔄 第4轮：删除开发工具和测试页面"
  echo "删除 demo 页面..."
  rm -rf src/app/\[locale\]/\(marketing\)/\(pages\)/demo
  echo "删除 newsletter..."
  rm -rf src/newsletter
  echo "删除 dashboard 页面..."
  rm -rf src/app/\[locale\]/\(protected\)/dashboard

  echo "✅ 第4轮删除完成，开始构建测试..."
  pnpm build

  if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    ROUND4_SIZE=$(du -sh .next | cut -f1)
    echo "第4轮后构建大小: $ROUND4_SIZE"
    git add .
    git commit -m "feat: round 4 - remove dev tools and demo pages"
    echo ""
  else
    echo "❌ 第4轮构建失败，请检查错误"
    exit 1
  fi
}

# 第5轮：删除中文国际化
round_5() {
  echo "🔄 第5轮：删除中文国际化"
  echo "删除中文翻译文件..."
  find messages -name "*zh.json" -delete
  find content -name "*.zh.mdx" -delete

  echo "更新 website.tsx 配置..."
  # 需要手动编辑 src/config/website.tsx 将 locales 改为 ['en']

  echo "✅ 第5轮删除完成，开始构建测试..."
  pnpm build

  if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    ROUND5_SIZE=$(du -sh .next | cut -f1)
    echo "第5轮后构建大小: $ROUND5_SIZE"
    git add .
    git commit -m "feat: round 5 - remove Chinese internationalization"
    echo ""
  else
    echo "❌ 第5轮构建失败，请检查错误"
    exit 1
  fi
}

# 执行所有轮次
echo "开始执行5轮删除优化..."
echo ""

round_1
round_2
round_3
round_4
round_5

echo "======================================"
echo "✅ 所有轮次完成！"
echo "======================================"
echo "初始大小: $INITIAL_SIZE"
echo "第1轮后: ${ROUND1_SIZE:-N/A}"
echo "第2轮后: ${ROUND2_SIZE:-N/A}"
echo "第3轮后: ${ROUND3_SIZE:-N/A}"
echo "第4轮后: ${ROUND4_SIZE:-N/A}"
echo "第5轮后: ${ROUND5_SIZE:-N/A}"
echo ""
echo "现在测试 Cloudflare 构建..."
pnpm build:cf

if [ $? -eq 0 ]; then
  echo "✅ Cloudflare 构建成功！"
  CF_SIZE=$(du -sh .vercel/output/static | cut -f1)
  echo "Cloudflare 输出大小: $CF_SIZE"
else
  echo "❌ Cloudflare 构建失败"
fi
