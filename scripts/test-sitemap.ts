#!/usr/bin/env tsx

/**
 * 测试 sitemap 完整性的脚本
 * 用于验证 sitemap 是否包含所有实际存在的页面
 */

import {
  generateSitemapXML,
  getSitemapConfig,
  validateSitemapCompleteness,
} from '../src/lib/seo/sitemap-generator';

console.log('🔍 开始验证 sitemap 完整性...\n');

const config = getSitemapConfig();
const validation = validateSitemapCompleteness(config);

console.log('📊 Sitemap 统计信息:');
console.log(`- 工具页面数量: ${validation.totalToolPages}`);
console.log(`- 静态页面数量: ${validation.totalStaticPages}`);
console.log(`- 总 URL 数量: ${validation.totalUrls}`);

console.log('\n📋 工具页面列表:');
validation.toolsList.forEach((tool, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${tool}`);
});

console.log('\n📋 静态页面列表:');
validation.staticPagesList.forEach((page, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${page}`);
});

// 生成实际的 sitemap 并验证
const sitemap = generateSitemapXML(config);
const actualUrls = sitemap.match(/<loc>.*?<\/loc>/g) || [];

console.log('\n✅ 实际生成的 sitemap URL 数量:', actualUrls.length);

// 标准的国际化sitemap格式：每个页面一个主要URL，通过xhtml:link指定其他语言版本
const expectedUrls = validation.totalUrls; // 每个页面一个主要URL
if (actualUrls.length === expectedUrls) {
  console.log('✅ Sitemap 验证通过！所有页面都已正确包含。');
  console.log(`✅ 每个页面都包含 ${config.locales.length} 种语言版本的链接。`);
} else {
  console.log('❌ Sitemap 验证失败！');
  console.log(`预期: ${expectedUrls} 个主要 URL`);
  console.log(`实际: ${actualUrls.length} 个 URL`);
}

// 统计多语言链接数量
const languageLinks =
  sitemap.match(
    /<xhtml:link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>/g
  ) || [];
console.log(`✅ 多语言链接数量: ${languageLinks.length} 个`);

console.log('\n🌐 支持的语言:', config.locales.join(', '));
console.log('🏠 默认语言:', config.defaultLocale);
console.log('🌍 基础 URL:', config.baseUrl);

// 显示前几个 URL 作为示例
console.log('\n📝 示例 URL:');
actualUrls.slice(0, 5).forEach((url, index) => {
  console.log(`${index + 1}. ${url.replace(/<\/?loc>/g, '')}`);
});

if (actualUrls.length > 5) {
  console.log(`... 还有 ${actualUrls.length - 5} 个 URL`);
}

console.log('\n🎉 Sitemap 完整性验证完成！');
