const fs = require('fs');
const path = require('path');

console.log('🔍 检查所有工具页面的testimonials heading字段...\n');

// 获取所有工具页面目录
const toolsDir = 'messages/pages';
const tools = fs
  .readdirSync(toolsDir)
  .filter((dir) => {
    const dirPath = path.join(toolsDir, dir);
    return fs.statSync(dirPath).isDirectory();
  })
  .filter((dir) => dir.includes('-translator') || dir.includes('-generator'));

console.log('📋 检查的工具页面:', tools.length, '个');
console.log('');

let totalIssues = 0;
const issueReports = [];

tools.forEach((tool) => {
  const jsonPath = path.join(toolsDir, tool, 'en.json');
  const issues = [];

  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const json = JSON.parse(content);

    // 确定主键名 - 特殊处理各种情况
    let expectedKey;
    if (tool === 'creole-to-english-translator') {
      expectedKey = 'CreoleToEnglishPage';
    } else if (tool === 'albanian-to-english') {
      expectedKey = 'AlbanianToEnglishPage';
    } else {
      expectedKey =
        tool
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('') + 'Page';
    }

    const pageData = json[expectedKey];
    if (pageData && pageData.testimonials && pageData.testimonials.items) {
      const items = pageData.testimonials.items;
      let validItems = 0;

      // 检查前3个项目
      for (let i = 1; i <= 3; i++) {
        const key = 'item-' + i;
        const item = items[key];

        if (item) {
          if (!item.name) {
            issues.push(`❌ ${key}: 缺少name字段`);
          } else if (!item.heading) {
            issues.push(`❌ ${key}: 缺少heading字段`);
          } else if (!item.content) {
            issues.push(`❌ ${key}: 缺少content字段`);
          } else {
            validItems++;
          }
        }
      }

      if (issues.length > 0) {
        console.log('❌ ' + tool + ':');
        issues.forEach((issue) => console.log('   ' + issue));
        totalIssues++;
        issueReports.push({ tool, issues });
      } else {
        console.log(
          '✅ ' + tool + ': testimonials字段完整 (' + validItems + '个有效项目)'
        );
      }
    } else {
      console.log('❌ ' + tool + ': 缺少testimonials数据');
      totalIssues++;
      issueReports.push({ tool, issues: ['❌ 缺少testimonials数据'] });
    }
  } catch (error) {
    console.log('❌ ' + tool + ': JSON解析错误 - ' + error.message);
    totalIssues++;
    issueReports.push({ tool, issues: ['❌ JSON解析错误'] });
  }
});

console.log('\n📊 检查总结:');
console.log('   总计工具:', tools.length, '个');
console.log('   有问题工具:', totalIssues, '个');
console.log('   正常工具:', tools.length - totalIssues, '个');

if (totalIssues > 0) {
  console.log('\n🔴 需要修复的问题:');
  issueReports.forEach((report) => {
    console.log('\n📁 ' + report.tool + ':');
    report.issues.forEach((issue) => console.log('   ' + issue));
  });
} else {
  console.log('\n🎉 所有工具的testimonials字段都完整！');
  console.log('所有页面应该能正常显示用户评论了。');
}
