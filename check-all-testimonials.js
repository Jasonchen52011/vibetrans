const fs = require('fs');
const path = require('path');

console.log('🔍 检查所有工具页面的评论数量和评分...\n');

// 所有工具页面的列表
const toolPages = [
  'gen-alpha-translator',
  'esperanto-translator',
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
  'creole-to-english-translator',
  'cuneiform-translator',
  'dumb-it-down-ai',
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

const pagesToFix = [];

toolPages.forEach(page => {
  try {
    const jsonPath = path.join(__dirname, 'messages/pages', page, 'en.json');

    if (!fs.existsSync(jsonPath)) {
      console.log(`❌ ${page}: 文件不存在`);
      return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // 尝试不同的namespace命名
    let testimonials = null;
    let namespace = null;

    const possibleNamespaces = [
      `${page.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}Page`,
      `${page.replace(/-/g, '')}Page`,
      `${page.replace(/-/g, '')}`
    ];

    // 特殊处理一些页面
    if (page === 'albanian-to-english') {
      possibleNamespaces.unshift('AlbanianToEnglishPage');
    }
    if (page === 'creole-to-english') {
      possibleNamespaces.unshift('CreoleToEnglishPage');
    }

    for (const ns of possibleNamespaces) {
      if (data[ns] && data[ns].testimonials) {
        testimonials = data[ns].testimonials.items;
        namespace = ns;
        break;
      }
    }

    if (!testimonials) {
      console.log(`❌ ${page}: 没有找到testimonials数据`);
      pagesToFix.push({ page, issues: ['没有testimonials数据'] });
      return;
    }

    const itemCount = Object.keys(testimonials).length;
    const ratings = Object.values(testimonials).map(item => item.rating || 5);

    console.log(`${page}:`);
    console.log(`  评论数量: ${itemCount}`);
    console.log(`  评分: ${ratings.join(', ')}`);

    const issues = [];

    if (itemCount > 3) {
      issues.push(`需要删除 ${itemCount - 3} 个评论`);
    }

    const allFive = ratings.every(r => r === 5);
    if (allFive) {
      issues.push('所有评分都是5.0，需要调整到4.6-5.0之间');
    }

    if (issues.length > 0) {
      pagesToFix.push({ page, namespace, testimonials, issues });
      console.log(`  ⚠️  ${issues.join(', ')}`);
    } else {
      console.log(`  ✅ 评论数量和评分都符合要求`);
    }

    console.log('');

  } catch (error) {
    console.log(`❌ ${page}: 读取失败 - ${error.message}`);
    pagesToFix.push({ page, issues: ['JSON读取失败'] });
  }
});

console.log('\n📊 总结:');
console.log(`需要修复的页面: ${pagesToFix.length} 个`);

if (pagesToFix.length > 0) {
  console.log('\n🔴 需要修复的页面:');
  pagesToFix.forEach(({ page, issues }) => {
    console.log(`  • ${page}: ${issues.join(', ')}`);
  });

  console.log('\n💡 建议操作:');
  console.log('1. 删除多余的评论，只保留前3个');
  console.log('2. 调整评分分布到4.6-5.0之间，不要全是5.0');
} else {
  console.log('\n🎉 所有页面的评论数量和评分都符合要求！');
}