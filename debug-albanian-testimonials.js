const fs = require('fs');

console.log('🔍 调试Albanian Testimonials组件渲染...\n');

// 1. 验证JSON数据结构
console.log('1. 验证JSON数据结构:');
const jsonContent = JSON.parse(fs.readFileSync('messages/pages/albanian-to-english/en.json', 'utf8'));
const testimonials = jsonContent.AlbanianToEnglishPage.testimonials;

console.log('✅ testimonials标题:', testimonials.title);
console.log('✅ testimonials副标题:', testimonials.subtitle);
console.log('✅ testimonials项目数量:', Object.keys(testimonials.items).length);

// 2. 验证组件期望的数据结构
console.log('\n2. 验证组件期望的数据结构:');

// 模拟组件的检查逻辑
let hasItems = false;
try {
  const testCheck = testimonials.items;
  hasItems = testCheck && typeof testCheck === 'object';
} catch (error) {
  hasItems = false;
}

console.log('✅ hasItems检查结果:', hasItems);

// 3. 模拟组件的数据加载逻辑
console.log('\n3. 模拟组件的数据加载逻辑:');
const testimonialItems = [];

if (hasItems) {
  // 模拟组件的for循环 (只取前3个)
  for (let i = 1; i <= 3; i++) {
    const key = `item-${i}`;

    try {
      const item = testimonials.items[key];

      if (!item || !item.name) {
        console.log(`❌ ${key}: 缺少name字段，跳过`);
        continue;
      }

      testimonialItems.push({
        id: key,
        name: item.name,
        role: item.role || '',
        heading: item.heading || '',
        content: item.content || '',
        rating: Number(item.rating) || 5,
      });

      console.log(`✅ ${key}: ${item.name} - ${item.role}`);
    } catch (error) {
      console.log(`❌ ${key}: 解析失败 - ${error.message}`);
    }
  }
}

console.log('\n4. 最终结果:');
console.log('✅ 加载的testimonial数量:', testimonialItems.length);

if (testimonialItems.length === 0) {
  console.log('❌ 组件会返回null，不显示testimonials部分');
} else {
  console.log('✅ 组件会正常显示testimonials部分');
  testimonialItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.name} (${item.role})`);
  });
}

// 5. 检查namespace路径
console.log('\n5. 检查namespace路径:');
const namespace = 'AlbanianToEnglishPage.testimonials';
console.log('✅ 组件使用的namespace:', namespace);

// 验证这个namespace是否正确
const namespaceParts = namespace.split('.');
const pageKey = namespaceParts[0];
const sectionKey = namespaceParts[1];

const pageData = jsonContent[pageKey];
if (pageData && pageData[sectionKey]) {
  console.log('✅ namespace路径正确:', namespace);
  console.log('✅ 找到数据:', sectionKey);
} else {
  console.log('❌ namespace路径错误:', namespace);
}

console.log('\n🎯 结论:');
if (testimonialItems.length > 0) {
  console.log('✅ 所有检查通过，testimonials应该能正常显示');
  console.log('💡 如果页面上还是看不到，可能是以下原因:');
  console.log('   1. Next.js缓存问题 - 请尝试硬刷新浏览器');
  console.log('   2. CSS样式问题 - testimonials可能被隐藏');
  console.log('   3. 组件渲染顺序问题');
} else {
  console.log('❌ 存在问题，testimonials无法显示');
}