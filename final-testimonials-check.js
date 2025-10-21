const fs = require('fs');
const path = require('path');

console.log('🔍 最终检查所有翻译工具页面的用户评论...\n');

// 获取所有工具页面目录
const toolsDir = 'messages/pages';
const tools = fs
  .readdirSync(toolsDir)
  .filter((dir) => {
    const dirPath = path.join(toolsDir, dir);
    return fs.statSync(dirPath).isDirectory();
  })
  .filter((dir) => dir.includes('-translator') || dir.includes('-generator'));

console.log('📋 发现的工具页面:', tools.length, '个');
console.log(tools.join(', '));
console.log('');

const results = {
  total: tools.length,
  correct: 0,
  issues: [],
  details: [],
};

tools.forEach((tool) => {
  const jsonPath = path.join(toolsDir, tool, 'en.json');
  const issue = {
    tool: tool,
    problems: [],
  };

  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const json = JSON.parse(content);

    // 检查主键名 - 特殊处理各种情况
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

    console.log('🔍 检查 ' + tool + ' (期望键: ' + expectedKey + ')');

    const pageData = json[expectedKey];
    if (!pageData) {
      issue.problems.push('❌ JSON中缺少主键: ' + expectedKey);
      console.log('   ❌ 找不到主键: ' + expectedKey);
      console.log('   🔑 实际键: ' + Object.keys(json).join(', '));
    } else {
      // 检查testimonials字段
      if (!pageData.testimonials) {
        issue.problems.push('❌ 缺少testimonials字段');
      } else {
        const testimonials = pageData.testimonials;

        // 检查基本结构
        if (!testimonials.title) {
          issue.problems.push('❌ testimonials缺少title');
        }
        if (!testimonials.items) {
          issue.problems.push('❌ testimonials缺少items');
        } else {
          const items = testimonials.items;
          const itemCount = Object.keys(items).length;

          if (itemCount === 0) {
            issue.problems.push('❌ testimonials.items为空');
          } else {
            console.log(
              '✅ ' + tool + ': testimonials有 ' + itemCount + ' 个评论'
            );

            // 检查前3个项目
            let validItems = 0;
            for (let i = 1; i <= 3; i++) {
              const key = 'item-' + i;
              if (items[key] && items[key].name && items[key].content) {
                validItems++;
              }
            }

            if (validItems > 0) {
              console.log('   → 前3个评论中有 ' + validItems + ' 个有效');
              results.correct++;
            } else {
              issue.problems.push('❌ 前3个评论都无效');
            }
          }
        }
      }

      // 检查页面文件是否存在
      const pagePath =
        'src/app/[locale]/(marketing)/(pages)/' + tool + '/page.tsx';
      if (!fs.existsSync(pagePath)) {
        issue.problems.push('❌ 缺少页面文件: page.tsx');
      }
    }
  } catch (error) {
    issue.problems.push('❌ JSON语法错误: ' + error.message);
  }

  if (issue.problems.length > 0) {
    results.issues.push(issue);
    console.log('❌ ' + tool + ':');
    issue.problems.forEach((problem) => console.log('   ' + problem));
  } else {
    console.log('✅ ' + tool + ': 所有检查通过');
  }

  results.details.push(issue);
  console.log('');
});

console.log('📊 检查总结:');
console.log('   总计: ' + results.total + ' 个工具');
console.log('   正常: ' + results.correct + ' 个工具');
console.log('   有问题: ' + results.issues.length + ' 个工具');

if (results.issues.length > 0) {
  console.log('\n\n🔴 需要修复的问题:');
  results.issues.forEach((issue) => {
    console.log('\n📁 ' + issue.tool + ':');
    issue.problems.forEach((problem) => console.log('   ' + problem));
  });

  console.log('\n\n💡 修复建议:');
  console.log('1. 确保JSON文件中包含完整的testimonials数据');
  console.log('2. 检查页面代码是否正确引用TestimonialsThreeColumnSection组件');
  console.log('3. 验证namespace路径是否正确');
  console.log('4. 清除浏览器缓存: Ctrl+Shift+R');
} else {
  console.log('\n🎉 所有工具的testimonials都正常！');
  console.log('如果页面还是看不到评论，可能是浏览器缓存问题。');
}
