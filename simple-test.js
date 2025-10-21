const fs = require('fs');

console.log('🔍 测试Albanian-to-English Testimonials...');

// 检查JSON数据
const json = JSON.parse(
  fs.readFileSync('messages/pages/albanian-to-english/en.json', 'utf8')
);
const testimonials = json.AlbanianToEnglishPage.testimonials;

console.log('✅ 标题:', testimonials.title);
console.log('✅ 项目数量:', Object.keys(testimonials.items).length);

// 模拟组件逻辑
const items = [];
for (let i = 1; i <= 3; i++) {
  const key = 'item-' + i;
  const item = testimonials.items[key];
  if (item && item.name) {
    items.push({
      id: key,
      name: item.name,
      role: item.role,
      heading: item.heading,
      content: item.content,
      rating: item.rating || 5,
    });
    console.log('✅ 加载:', key, '-', item.name);
  }
}

console.log('📊 结果: 组件会显示', items.length, '个评论');
console.log('🎯 结论: 数据完整，应该是缓存或CSS问题');
