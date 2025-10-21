#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的页面列表
const pagesToFix = [
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
  'bad-translator',
];

function fixTestimonials(filePath) {
  try {
    console.log(`正在处理: ${filePath}`);

    // 读取JSON文件
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // 找到testimonials部分 - 处理不同的可能结构
    let testimonials = null;
    let pageKey = null;

    // 遍历所有可能的顶级键
    for (const key in data) {
      if (data[key].testimonials) {
        testimonials = data[key].testimonials;
        pageKey = key;
        break;
      }
    }

    if (!testimonials || !testimonials.items) {
      console.log(`  ❌ 未找到testimonials.items结构`);
      return false;
    }

    const items = testimonials.items;
    const originalCount = Object.keys(items).length;
    console.log(`  📊 原始评论数量: ${originalCount}`);

    // 保留前3个评论
    const itemsToKeep = ['item-1', 'item-2', 'item-3'];
    const newItems = {};

    itemsToKeep.forEach((itemKey, index) => {
      if (items[itemKey]) {
        newItems[itemKey] = { ...items[itemKey] };

        // 调整评分
        if (index === 0) {
          newItems[itemKey].rating = 5.0; // item-1 保持5.0
        } else if (index === 1) {
          newItems[itemKey].rating = 4.9; // item-2 改为4.9
        } else if (index === 2) {
          newItems[itemKey].rating = 4.7; // item-3 改为4.7
        }

        console.log(
          `  ✅ 保留 ${itemKey}: ${newItems[itemKey].name} (评分: ${newItems[itemKey].rating})`
        );
      }
    });

    // 更新数据
    testimonials.items = newItems;

    // 写回文件
    const updatedContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, updatedContent, 'utf8');

    console.log(`  ✅ 修复完成: 保留3个评论，删除${originalCount - 3}个评论`);
    return true;
  } catch (error) {
    console.error(`  ❌ 处理失败: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🚀 开始批量修复testimonials评论...\n');

  const messagesDir =
    '/Users/jason-chen/Downloads/project/vibetrans/messages/pages';
  let successCount = 0;
  let failCount = 0;

  pagesToFix.forEach((page) => {
    const filePath = path.join(messagesDir, page, 'en.json');

    if (fs.existsSync(filePath)) {
      const success = fixTestimonials(filePath);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } else {
      console.log(`❌ 文件不存在: ${filePath}`);
      failCount++;
    }

    console.log(''); // 空行分隔
  });

  console.log(`📈 修复完成统计:`);
  console.log(`  ✅ 成功: ${successCount}个页面`);
  console.log(`  ❌ 失败: ${failCount}个页面`);
  console.log(`  📊 总计: ${pagesToFix.length}个页面`);
}

// 运行脚本
main();
