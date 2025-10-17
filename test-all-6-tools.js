#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要检查的6个页面
const pages = [
  'samoan-to-english-translator',
  'aramaic-translator',
  'baybayin-translator',
  'cuneiform-translator',
  'gaster-translator',
  'high-valyrian-translator'
];

function checkPage(pageName) {
  console.log(`\n🔍 检查页面: ${pageName}`);

  const jsonPath = path.join(process.cwd(), 'messages', 'pages', pageName, 'en.json');

  if (!fs.existsSync(jsonPath)) {
    console.log(`❌ JSON文件不存在: ${jsonPath}`);
    return false;
  }

  try {
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const pageKey = `${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())}Page`;
    const pageData = content[pageKey];

    if (!pageData) {
      console.log(`❌ 页面数据结构不完整`);
      return false;
    }

    // 检查 whatIs 部分
    if (pageData.whatIs) {
      const hasPlaceholder = pageData.whatIs.title && pageData.whatIs.title.includes('XXXX');
      if (hasPlaceholder) {
        console.log(`❌ whatIs 部分仍有占位符`);
        return false;
      } else {
        console.log(`✅ whatIs 部分已修复`);
      }
    }

    // 检查 examples 部分
    if (pageData.examples && pageData.examples.items) {
      const hasPlaceholder = pageData.examples.items.some(item =>
        item.alt && item.alt.includes('placeholder')
      );

      if (hasPlaceholder) {
        console.log(`❌ examples 部分仍有占位符`);
        return false;
      } else if (pageData.examples.items.length !== 6) {
        console.log(`⚠️ examples 数量不正确 (${pageData.examples.items.length}/6)`);
        return false;
      } else {
        console.log(`✅ examples 部分已修复 (${pageData.examples.items.length}个案例)`);
      }
    }

    // 检查 testimonials 部分
    if (pageData.testimonials && pageData.testimonials.items) {
      const testimonialCount = Object.keys(pageData.testimonials.items).length;
      if (testimonialCount < 6) {
        console.log(`⚠️ testimonials 数量不足 (${testimonialCount}/6)`);
      } else {
        console.log(`✅ testimonials 部分完整 (${testimonialCount}个案例)`);
      }
    }

    return true;

  } catch (error) {
    console.log(`❌ JSON解析错误: ${error.message}`);
    return false;
  }
}

console.log('🚀 开始验证所有6个翻译工具页面修复效果...\n');

let successCount = 0;
const totalTests = pages.length;

pages.forEach(pageName => {
  if (checkPage(pageName)) {
    successCount++;
  }
});

console.log(`\n📊 验证结果:`);
console.log(`✅ 成功: ${successCount}/${totalTests}`);
console.log(`❌ 失败: ${totalTests - successCount}/${totalTests}`);

if (successCount === totalTests) {
  console.log(`\n🎉 所有页面修复验证通过！`);
  process.exit(0);
} else {
  console.log(`\n⚠️ 部分页面仍有问题，需要进一步修复`);
  process.exit(1);
}