#!/bin/bash
# 快速索引状态检查脚本
# 使用curl和grep进行基础检查

echo "🔍 检查页面是否可访问..."
echo ""

PAGES=(
  "/about"
  "/privacy"
  "/terms"
  "/albanian-to-english"
  "/al-bhed-translator"
  "/alien-text-generator"
  "/ancient-greek-translator"
  "/aramaic-translator"
  "/baby-translator"
  "/bad-translator"
  "/baybayin-translator"
  "/cantonese-translator"
  "/chinese-to-english-translator"
  "/creole-to-english-translator"
  "/cuneiform-translator"
  "/dog-translator"
  "/dumb-it-down-ai"
  "/esperanto-translator"
  "/gaster-translator"
  "/gen-alpha-translator"
  "/gen-z-translator"
  "/gibberish-translator"
  "/high-valyrian-translator"
  "/ivr-translator"
  "/middle-english-translator"
  "/minion-translator"
  "/pig-latin-translator"
  "/samoan-to-english-translator"
  "/verbose-generator"
)

BASE_URL="https://vibetrans.com"

for page in "${PAGES[@]}"; do
  echo "检查: $BASE_URL$page"
  curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page"
  echo " - $(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page" | grep -q "200" && echo "✅ 可访问" || echo "❌ 不可访问")"
  echo ""
done

echo ""
echo "📋 手动检查索引状态:"
echo "Google: https://www.google.com/search?q=site:vibetrans.com"
echo "Bing: https://www.bing.com/search?q=site:vibetrans.com"
