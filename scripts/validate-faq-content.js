#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要检查的问题关键词
const problematicKeywords = [
  'app',
  'application',
  'offline',
  'mobile device',
  'download',
  'ios',
  'android',
  'iphone',
  'smartphone',
];

// 需要验证的正确表述
const correctPhrases = [
  'mobile browser',
  'browser',
  'web tool',
  'save from browser',
  'save as image',
  'copy or share',
];

const pagesDir = path.join(__dirname, '..', 'messages', 'pages');
const report = {
  totalPages: 0,
  pagesWithFAQ: 0,
  problematicPages: [],
  cleanPages: [],
  details: {},
};

console.log('🔍 开始验证所有工具页面FAQ中的app和离线相关内容...\n');

// 读取所有目录
const allPages = fs
  .readdirSync(pagesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

report.totalPages = allPages.length;

allPages.forEach((pageName) => {
  const enJsonPath = path.join(pagesDir, pageName, 'en.json');

  if (!fs.existsSync(enJsonPath)) {
    return;
  }

  try {
    const content = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
    const pageReport = {
      hasFAQ: false,
      problematicKeywords: [],
      correctPhrases: [],
      faqContent: [],
    };

    // 检查是否有FAQ部分 - 需要考虑页面名称作为第一层键
    let pageContent = content;
    // 如果第一层是页面名称，则进入下一层
    const pageKeys = Object.keys(content);
    if (pageKeys.length === 1 && typeof content[pageKeys[0]] === 'object') {
      pageContent = content[pageKeys[0]];
    }

    if (pageContent.faqs) {
      pageReport.hasFAQ = true;
      report.pagesWithFAQ++;

      // 检查FAQ内容
      const faqText = JSON.stringify(pageContent.faqs).toLowerCase();

      // 检查问题关键词
      problematicKeywords.forEach((keyword) => {
        if (faqText.includes(keyword.toLowerCase())) {
          pageReport.problematicKeywords.push(keyword);
        }
      });

      // 检查正确表述
      correctPhrases.forEach((phrase) => {
        if (faqText.includes(phrase.toLowerCase())) {
          pageReport.correctPhrases.push(phrase);
        }
      });

      // 保存FAQ内容用于详细分析
      if (pageContent.faqs.items) {
        Object.values(pageContent.faqs.items).forEach((item, index) => {
          if (item.question && item.answer) {
            pageReport.faqContent.push({
              index: index + 1,
              question: item.question,
              answer: item.answer,
              hasProblematicContent: problematicKeywords.some((kw) =>
                (item.question + ' ' + item.answer)
                  .toLowerCase()
                  .includes(kw.toLowerCase())
              ),
            });
          }
        });
      }
    }

    report.details[pageName] = pageReport;

    // 判断页面是否有问题
    if (pageReport.problematicKeywords.length > 0) {
      report.problematicPages.push({
        name: pageName,
        keywords: pageReport.problematicKeywords,
        faqCount: pageReport.faqContent.length,
      });
    } else if (pageReport.hasFAQ) {
      report.cleanPages.push(pageName);
    }
  } catch (error) {
    console.error(`❌ 读取 ${pageName} 失败:`, error.message);
  }
});

// 生成详细报告
console.log('📊 验证报告');
console.log('='.repeat(50));

console.log(`\n📈 总体统计:`);
console.log(`- 总页面数: ${report.totalPages}`);
console.log(`- 有FAQ的页面数: ${report.pagesWithFAQ}`);
console.log(`- 有问题的页面数: ${report.problematicPages.length}`);
console.log(`- 干净的页面数: ${report.cleanPages.length}`);

if (report.problematicPages.length > 0) {
  console.log(`\n⚠️  发现问题的页面 (${report.problematicPages.length}):`);
  report.problematicPages.forEach((page) => {
    console.log(`\n❌ ${page.name}:`);
    console.log(`   问题关键词: ${page.keywords.join(', ')}`);
    console.log(`   FAQ数量: ${page.faqCount}`);

    // 显示具体的问题FAQ
    const pageDetails = report.details[page.name];
    const problematicFAQs = pageDetails.faqContent.filter(
      (faq) => faq.hasProblematicContent
    );

    problematicFAQs.forEach((faq) => {
      console.log(`   FAQ ${faq.index}: ${faq.question}`);
      problematicKeywords.forEach((keyword) => {
        if (
          (faq.question + ' ' + faq.answer)
            .toLowerCase()
            .includes(keyword.toLowerCase())
        ) {
          console.log(`      ⚠️  包含关键词 "${keyword}"`);
        }
      });
    });
  });
} else {
  console.log('\n✅ 未发现包含问题关键词的FAQ页面');
}

console.log(`\n✅ 已完全清理的页面 (${report.cleanPages.length}):`);
report.cleanPages.forEach((pageName) => {
  console.log(`   ✅ ${pageName}`);
});

// 保存详细报告
const reportPath = path.join(__dirname, 'faq-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 详细报告已保存至: ${reportPath}`);

// 总结
console.log('\n🎯 总结:');
if (report.problematicPages.length === 0) {
  console.log('✅ 所有工具页面的FAQ都已经完全清理，不再包含app和离线相关内容');
} else {
  console.log(`⚠️  还有 ${report.problematicPages.length} 个页面需要进一步清理`);
  console.log('请查看上述问题页面并进行相应的修改');
}
