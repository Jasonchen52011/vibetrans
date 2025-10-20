#!/usr/bin/env tsx

/**
 * 自动检查 sitemap 覆盖度的脚本
 * 确保所有实际存在的页面都被包含在 sitemap 中
 */

import fs from 'fs';
import path from 'path';
import {
  generateToolPages,
  getSitemapConfig,
  validateSitemapCompleteness,
} from '../src/lib/seo/sitemap-generator';

console.log('🔍 开始检查 sitemap 覆盖度...\n');

const config = getSitemapConfig();

// 1. 获取实际存在的工具页面
console.log('📁 扫描实际存在的工具页面...');
const toolsDir = path.join(
  process.cwd(),
  'src/app/[locale]/(marketing)/(pages)'
);
const actualToolPages: string[] = [];

try {
  const items = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => name !== 'about') // 排除 about 页面，它是静态页面
    .sort();

  actualToolPages.push(...items);
  console.log(`✅ 找到 ${actualToolPages.length} 个工具页面目录`);
} catch (error) {
  console.error('❌ 扫描工具页面目录失败:', error);
  process.exit(1);
}

// 2. 获取 sitemap 中定义的工具页面
console.log('\n📋 获取 sitemap 中定义的工具页面...');
const sitemapValidation = validateSitemapCompleteness(config);
const sitemapToolPages = sitemapValidation.toolsList;

console.log(`✅ sitemap 中定义了 ${sitemapToolPages.length} 个工具页面`);

// 3. 比较差异
console.log('\n🔍 检查遗漏的页面...');
const missingFromSitemap = actualToolPages.filter(
  (page) => !sitemapToolPages.includes(page)
);
const extraInSitemap = sitemapToolPages.filter(
  (page) => !actualToolPages.includes(page)
);

if (missingFromSitemap.length > 0) {
  console.log('❌ 以下页面存在于文件系统但未在 sitemap 中:');
  missingFromSitemap.forEach((page) => console.log(`   - ${page}`));
} else {
  console.log('✅ 所有实际存在的工具页面都已包含在 sitemap 中');
}

if (extraInSitemap.length > 0) {
  console.log('⚠️  以下页面在 sitemap 中但实际不存在:');
  extraInSitemap.forEach((page) => console.log(`   - ${page}`));
}

// 4. 检查静态页面
console.log('\n📄 检查静态页面...');
const staticPageDirs = [
  { path: 'src/app/[locale]/(marketing)/(home)', expectedPath: '/' },
  {
    path: 'src/app/[locale]/(marketing)/(legal)/privacy',
    expectedPath: '/privacy',
  },
  {
    path: 'src/app/[locale]/(marketing)/(legal)/terms',
    expectedPath: '/terms',
  },
  {
    path: 'src/app/[locale]/(marketing)/(pages)/about',
    expectedPath: '/about',
  },
];

const sitemapStaticPages = sitemapValidation.staticPagesList;
const missingStaticPages: string[] = [];

staticPageDirs.forEach(({ path: dirPath, expectedPath }) => {
  const fullPath = path.join(process.cwd(), dirPath);
  if (
    fs.existsSync(fullPath) &&
    fs.existsSync(path.join(fullPath, 'page.tsx'))
  ) {
    if (!sitemapStaticPages.includes(expectedPath)) {
      missingStaticPages.push(expectedPath);
    }
  }
});

if (missingStaticPages.length > 0) {
  console.log('❌ 以下静态页面存在但未在 sitemap 中:');
  missingStaticPages.forEach((page) => console.log(`   - ${page}`));
} else {
  console.log('✅ 所有静态页面都已包含在 sitemap 中');
}

// 5. 生成报告
console.log('\n📊 覆盖度报告:');
console.log(`- 实际工具页面: ${actualToolPages.length} 个`);
console.log(`- sitemap 工具页面: ${sitemapToolPages.length} 个`);
console.log(`- 遗漏的页面: ${missingFromSitemap.length} 个`);
console.log(`- 多余的页面: ${extraInSitemap.length} 个`);
console.log(`- 遗漏的静态页面: ${missingStaticPages.length} 个`);

// 6. 如果发现问题，提供修复建议
if (missingFromSitemap.length > 0 || missingStaticPages.length > 0) {
  console.log('\n🔧 修复建议:');

  if (missingFromSitemap.length > 0) {
    console.log(
      '请在 src/lib/seo/sitemap-generator.ts 的 generateToolPages 函数中添加以下页面:'
    );
    missingFromSitemap.forEach((page) => {
      console.log(`    '${page}',`);
    });
  }

  if (missingStaticPages.length > 0) {
    console.log(
      '请在 src/lib/seo/sitemap-generator.ts 的 generateStaticPages 函数中添加以下页面:'
    );
    missingStaticPages.forEach((page) => {
      console.log(
        `    { path: '${page}', priority: 0.6, changeFreq: 'monthly' as const },`
      );
    });
  }

  process.exit(1);
} else {
  console.log('\n🎉 sitemap 覆盖度检查完成！所有页面都已正确包含。');
}
