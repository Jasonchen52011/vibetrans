#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要验证的页面列表
const pagesToVerify = [
  'gibberish-translator',
  'dog-translator',
  'baby-translator',
  'al-bhed-translator',
  'albanian-to-english',
  'alien-text-generator',
  'ancient-greek-translator',
  'aramaic-translator',
  'baybayin-translator',
  'chinese-to-english-translator',
  'cantonese-translator',
  'cuneiform-translator',
  'gaster-translator',
  'gen-z-translator',
  'high-valyrian-translator',
  'ivr-translator',
  'middle-english-translator',
  'minion-translator',
  'pig-latin-translator',
  'samoan-to-english-translator',
  'verbose-generator',
  'bad-translator'
];

function verifyTestimonials(filePath) {
  try {
    console.log(`验证: ${path.basename(path.dirname(filePath))}`);

    // 读取JSON文件
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // 找到testimonials部分
    let testimonials = null;

    for (const key in data) {
      if (data[key].testimonials) {
        testimonials = data[key].testimonials;
        break;
      }
    }

    if (!testimonials || !testimonials.items) {
      console.log(`  ❌ 未找到testimonials.items结构`);
      return false;
    }

    const items = testimonials.items;
    const itemCount = Object.keys(items).length;

    console.log(`  📊 评论数量: ${itemCount}`);

    if (itemCount !== 3) {
      console.log(`  ❌ 评论数量不正确，期望3个，实际${itemCount}个`);
      return false;
    }

    // 检查每个评论的评分
    const expectedRatings = {
      'item-1': 5.0,
      'item-2': 4.9,
      'item-3': 4.7
    };

    let allCorrect = true;

    for (const [itemKey, expectedRating] of Object.entries(expectedRatings)) {
      if (items[itemKey]) {
        const actualRating = items[itemKey].rating;
        if (actualRating === expectedRating) {
          console.log(`  ✅ ${itemKey}: ${items[itemKey].name} (评分: ${actualRating})`);
        } else {
          console.log(`  ❌ ${itemKey}: 评分不正确，期望${expectedRating}，实际${actualRating}`);
          allCorrect = false;
        }
      } else {
        console.log(`  ❌ 缺少${itemKey}`);
        allCorrect = false;
      }
    }

    // 检查是否有额外的评论
    for (const itemKey in items) {
      if (!expectedRatings[itemKey]) {
        console.log(`  ❌ 发现多余的评论: ${itemKey}`);
        allCorrect = false;
      }
    }

    return allCorrect;

  } catch (error) {
    console.error(`  ❌ 验证失败: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 开始验证testimonials修复结果...\n');

  const messagesDir = '/Users/jason-chen/Downloads/project/vibetrans/messages/pages';
  let successCount = 0;
  let failCount = 0;
  const problemPages = [];

  pagesToVerify.forEach(page => {
    const filePath = path.join(messagesDir, page, 'en.json');

    if (fs.existsSync(filePath)) {
      const success = verifyTestimonials(filePath);
      if (success) {
        successCount++;
      } else {
        failCount++;
        problemPages.push(page);
      }
    } else {
      console.log(`❌ 文件不存在: ${filePath}`);
      failCount++;
      problemPages.push(page);
    }

    console.log(''); // 空行分隔
  });

  console.log(`📈 验证完成统计:`);
  console.log(`  ✅ 成功: ${successCount}个页面`);
  console.log(`  ❌ 失败: ${failCount}个页面`);
  console.log(`  📊 总计: ${pagesToVerify.length}个页面`);

  if (problemPages.length > 0) {
    console.log(`\n❌ 有问题的页面:`);
    problemPages.forEach(page => {
      console.log(`  - ${page}`);
    });
  } else {
    console.log(`\n🎉 所有页面的testimonials都已正确修复！`);
  }
}

// 运行脚本
main();