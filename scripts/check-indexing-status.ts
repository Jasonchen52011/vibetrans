#!/usr/bin/env tsx

/**
 * 批量检查网站页面索引状态
 * 支持多种检查方法：Google Search Console API、site:命令、手动检查
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// 所有需要检查的页面
const pages = [
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/albanian-to-english',
  '/al-bhed-translator',
  '/alien-text-generator',
  '/ancient-greek-translator',
  '/aramaic-translator',
  '/baby-translator',
  '/bad-translator',
  '/baybayin-translator',
  '/cantonese-translator',
  '/chinese-to-english-translator',
  '/creole-to-english-translator',
  '/cuneiform-translator',
  '/dog-translator',
  '/dumb-it-down-ai',
  '/esperanto-translator',
  '/gaster-translator',
  '/gen-alpha-translator',
  '/gen-z-translator',
  '/gibberish-translator',
  '/high-valyrian-translator',
  '/ivr-translator',
  '/middle-english-translator',
  '/minion-translator',
  '/pig-latin-translator',
  '/samoan-to-english-translator',
  '/verbose-generator',
];

interface IndexStatus {
  url: string;
  googleIndexed: boolean;
  bingIndexed: boolean;
  lastChecked: string;
  googlePosition?: number;
  bingPosition?: number;
  notes?: string;
}

/**
 * 使用 site: 命令检查Google索引状态
 */
async function checkGoogleIndexing(
  url: string
): Promise<{ indexed: boolean; position?: number }> {
  try {
    const searchQuery = `site:vibetrans.com${url}`;
    console.log(`🔍 检查Google: ${searchQuery}`);

    // 这里需要手动检查或使用第三方API
    // 由于Google API限制，我们提供一个框架
    return { indexed: false }; // 需要手动验证
  } catch (error) {
    console.error(`Google索引检查失败 ${url}:`, error);
    return { indexed: false };
  }
}

/**
 * 使用 site: 命令检查Bing索引状态
 */
async function checkBingIndexing(
  url: string
): Promise<{ indexed: boolean; position?: number }> {
  try {
    const searchQuery = `site:vibetrans.com${url}`;
    console.log(`🔍 检查Bing: ${searchQuery}`);

    // 这里需要手动检查或使用Bing API
    return { indexed: false }; // 需要手动验证
  } catch (error) {
    console.error(`Bing索引检查失败 ${url}:`, error);
    return { indexed: false };
  }
}

/**
 * 生成手动检查清单
 */
function generateManualChecklist() {
  const baseUrl = 'https://vibetrans.com';

  console.log('\n📋 Google索引状态检查清单:');
  console.log('请在Google中搜索以下命令，检查是否显示搜索结果:\n');

  pages.forEach((page, index) => {
    const fullUrl = `${baseUrl}${page}`;
    console.log(`${index + 1}. site:vibetrans.com${page}`);
    console.log(`   完整URL: ${fullUrl}`);
    console.log(
      `   Google搜索: https://www.google.com/search?q=site:vibetrans.com${encodeURIComponent(page)}`
    );
    console.log('');
  });

  console.log('\n📋 Bing索引状态检查清单:');
  console.log('请在Bing中搜索以下命令，检查是否显示搜索结果:\n');

  pages.forEach((page, index) => {
    console.log(`${index + 1}. site:vibetrans.com${page}`);
    console.log(
      `   Bing搜索: https://www.bing.com/search?q=site:vibetrans.com${encodeURIComponent(page)}`
    );
    console.log('');
  });
}

/**
 * 生成Excel格式的检查表格
 */
function generateChecklistSpreadsheet() {
  const baseUrl = 'https://vibetrans.com';
  let csvContent =
    'Page URL,Full URL,Google Search Link,Bing Search Link,Google Indexed?,Bing Indexed?,Google Position,Bing Position,Notes,Last Checked\n';

  pages.forEach((page) => {
    const fullUrl = `${baseUrl}${page}`;
    const googleSearchLink = `https://www.google.com/search?q=site:vibetrans.com${encodeURIComponent(page)}`;
    const bingSearchLink = `https://www.bing.com/search?q=site:vibetrans.com${encodeURIComponent(page)}`;

    csvContent += `"${page}","${fullUrl}","${googleSearchLink}","${bingSearchLink}",,,,,,,""\n`;
  });

  const outputPath = resolve(process.cwd(), 'indexing-checklist.csv');
  writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`✅ 检查清单已生成: ${outputPath}`);
  console.log('💡 用Excel打开此文件，记录检查结果');
}

/**
 * 生成快速检查脚本
 */
function generateQuickCheckScript() {
  const script = `#!/bin/bash
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

for page in "\${PAGES[@]}"; do
  echo "检查: \$BASE_URL\$page"
  curl -s -o /dev/null -w "%{http_code}" "\$BASE_URL\$page"
  echo " - \$(curl -s -o /dev/null -w "%{http_code}" "\$BASE_URL\$page" | grep -q "200" && echo "✅ 可访问" || echo "❌ 不可访问")"
  echo ""
done

echo ""
echo "📋 手动检查索引状态:"
echo "Google: https://www.google.com/search?q=site:vibetrans.com"
echo "Bing: https://www.bing.com/search?q=site:vibetrans.com"
`;

  const scriptPath = resolve(
    process.cwd(),
    'scripts',
    'quick-indexing-check.sh'
  );
  writeFileSync(scriptPath, script, { mode: 0o755 });
  console.log(`✅ 快速检查脚本已生成: ${scriptPath}`);
  console.log('💡 运行命令: ./scripts/quick-indexing-check.sh');
}

async function main() {
  console.log('🚀 开始批量索引状态检查...\n');

  // 1. 生成手动检查清单
  console.log('📝 生成手动检查清单...');
  generateManualChecklist();

  // 2. 生成Excel检查表格
  console.log('\n📊 生成Excel检查表格...');
  generateChecklistSpreadsheet();

  // 3. 生成快速检查脚本
  console.log('\n⚡ 生成快速检查脚本...');
  generateQuickCheckScript();

  console.log('\n✅ 索引检查工具已准备完成!');
  console.log('\n📋 推荐检查流程:');
  console.log('1. 使用Excel表格记录检查结果');
  console.log('2. 手动在Google和Bing中搜索site:vibetrans.com');
  console.log('3. 使用快速脚本检查页面可访问性');
  console.log('4. 定期重复检查（每周一次）');

  console.log('\n⏰ 最佳检查时间:');
  console.log('- 提交sitemap后3天进行第一次检查');
  console.log('- 提交sitemap后1周进行第二次检查');
  console.log('- 之后每月检查一次');
}

if (require.main === module) {
  main().catch(console.error);
}
