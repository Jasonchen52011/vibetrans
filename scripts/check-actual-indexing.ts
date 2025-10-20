#!/usr/bin/env tsx

/**
 * 检查页面实际索引状态
 * 通过site:命令检查Google和Bing的实际索引情况
 */

interface IndexResult {
  page: string;
  url: string;
  googleIndexed: boolean;
  bingIndexed: boolean;
  googleSearchUrl: string;
  bingSearchUrl: string;
}

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

function generateIndexingReport() {
  const baseUrl = 'https://vibetrans.com';

  console.log('🔍 索引状态检查清单');
  console.log('='.repeat(80));
  console.log();

  console.log('📋 需要手动检查的页面:');
  console.log();

  pages.forEach((page, index) => {
    const fullUrl = `${baseUrl}${page}`;
    const googleSearchQuery = `site:vibetrans.com${page}`;
    const bingSearchQuery = `site:vibetrans.com${page}`;

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`;
    const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(bingSearchQuery)}`;

    console.log(`${index + 1}. ${page}`);
    console.log(`   完整URL: ${fullUrl}`);
    console.log(`   Google检查: ${googleSearchUrl}`);
    console.log(`   Bing检查: ${bingSearchUrl}`);
    console.log(`   搜索命令: ${googleSearchQuery}`);
    console.log();
  });

  console.log('📊 检查结果记录表格:');
  console.log();
  console.log('页面URL | Google索引 | Bing索引 | 备注');
  console.log('-'.repeat(60));

  pages.forEach((page) => {
    console.log(`${page} | [ ] 是 [ ] 否 | [ ] 是 [ ] 否 | `);
  });

  console.log();
  console.log('🔗 快速检查链接:');
  console.log(
    `Google总索引: https://www.google.com/search?q=site:vibetrans.com`
  );
  console.log(`Bing总索引: https://www.bing.com/search?q=site:vibetrans.com`);
}

function generateCSVReport() {
  const baseUrl = 'https://vibetrans.com';
  let csvContent =
    'Page,Full URL,Google Search URL,Bing Search URL,Google Indexed?,Bing Indexed?,Notes,Check Date\n';

  pages.forEach((page) => {
    const fullUrl = `${baseUrl}${page}`;
    const googleSearchQuery = `site:vibetrans.com${page}`;
    const bingSearchQuery = `site:vibetrans.com${page}`;

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`;
    const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(bingSearchQuery)}`;

    csvContent += `"${page}","${fullUrl}","${googleSearchUrl}","${bingSearchUrl}",,,,"${new Date().toISOString().split('T')[0]}"\n`;
  });

  const fs = require('fs');
  const path = require('path');

  const outputPath = path.resolve(process.cwd(), 'indexing-status-report.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf8');

  console.log(`✅ CSV报告已生成: ${outputPath}`);
}

function main() {
  console.log('🚀 生成索引检查报告...\n');

  generateIndexingReport();
  generateCSVReport();

  console.log('\n✅ 报告生成完成!');
  console.log('\n📋 检查步骤:');
  console.log('1. 打开CSV文件记录检查结果');
  console.log('2. 逐个点击Google和Bing搜索链接');
  console.log('3. 查看搜索结果，如果有结果则标记为"已索引"');
  console.log('4. 如果没有搜索结果，说明页面尚未被索引');

  console.log('\n⏰ 建议检查时间:');
  console.log('- 提交sitemap后24小时: 第一次检查');
  console.log('- 提交sitemap后72小时: 第二次检查');
  console.log('- 提交sitemap后1周: 最终检查');
}

if (require.main === module) {
  main().catch(console.error);
}
