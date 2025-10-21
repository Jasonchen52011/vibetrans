const fs = require('fs');

console.log('🔍 测试Creole Testimonials...\n');

const tool = 'creole-to-english';
const jsonPath = 'messages/pages/' + tool + '/en.json';

console.log('📁 工具:', tool);
console.log('📄 文件路径:', jsonPath);

try {
  const content = fs.readFileSync(jsonPath, 'utf8');
  const json = JSON.parse(content);

  console.log('✅ JSON文件读取成功');
  console.log('🔑 JSON中的主键:', Object.keys(json));

  // 确定主键名
  let expectedKey;
  if (tool === 'creole-to-english') {
    expectedKey = 'CreoleToEnglishPage';
  } else {
    expectedKey =
      tool
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Page';
  }

  console.log('🎯 期望的主键:', expectedKey);

  const pageData = json[expectedKey];
  if (!pageData) {
    console.log('❌ 找不到主键数据');
  } else {
    console.log('✅ 找到主键数据');

    if (!pageData.testimonials) {
      console.log('❌ 缺少testimonials字段');
    } else {
      const testimonials = pageData.testimonials;
      console.log('✅ testimonials标题:', testimonials.title);
      console.log(
        '✅ testimonials项目数量:',
        Object.keys(testimonials.items).length
      );

      // 检查前3个项目
      let validItems = 0;
      for (let i = 1; i <= 3; i++) {
        const key = 'item-' + i;
        if (
          testimonials.items[key] &&
          testimonials.items[key].name &&
          testimonials.items[key].content
        ) {
          validItems++;
          console.log('✅ ' + key + ': ' + testimonials.items[key].name);
        }
      }

      console.log('📊 有效评论数量:', validItems);

      if (validItems > 0) {
        console.log('🎉 Creole testimonials正常！');
      } else {
        console.log('❌ 没有有效的评论');
      }
    }
  }
} catch (error) {
  console.log('❌ 错误:', error.message);
}
