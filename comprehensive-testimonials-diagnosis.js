const fs = require('fs');

console.log('🔍 Albanian-to-English Testimonials 综合诊断报告\n');
console.log('='.repeat(60));

// 1. JSON数据完整性检查
console.log('\n1️⃣ JSON数据完整性检查');
console.log('-'.repeat(30));

try {
  const jsonPath = 'messages/pages/albanian-to-english/en.json';
  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('✅ JSON文件读取成功');
  console.log('📁 文件路径:', jsonPath);

  // 检查主键
  const pageKey = 'AlbanianToEnglishPage';
  if (jsonContent[pageKey]) {
    console.log('✅ 主键存在:', pageKey);

    // 检查testimonials
    if (jsonContent[pageKey].testimonials) {
      const testimonials = jsonContent[pageKey].testimonials;
      console.log('✅ testimonials字段存在');
      console.log('📝 标题:', testimonials.title);
      console.log('📝 副标题:', testimonials.subtitle);

      if (testimonials.items) {
        const itemCount = Object.keys(testimonials.items).length;
        console.log('📊 评论项目数量:', itemCount);

        // 检查前3个项目的完整性
        let validCount = 0;
        for (let i = 1; i <= 3; i++) {
          const key = `item-${i}`;
          const item = testimonials.items[key];
          if (item && item.name && item.content) {
            validCount++;
            console.log(`✅ ${key}: ${item.name} (${item.role})`);
          } else {
            console.log(`❌ ${key}: 数据不完整`);
          }
        }
        console.log(`📊 有效评论数量: ${validCount}/3`);
      } else {
        console.log('❌ items字段缺失');
      }
    } else {
      console.log('❌ testimonials字段缺失');
    }
  } else {
    console.log('❌ 主键不存在:', pageKey);
  }
} catch (error) {
  console.log('❌ JSON文件错误:', error.message);
}

// 2. 页面文件检查
console.log('\n2️⃣ 页面文件检查');
console.log('-'.repeat(30));

try {
  const pagePath =
    'src/app/[locale]/(marketing)/(pages)/albanian-to-english/page.tsx';
  if (fs.existsSync(pagePath)) {
    console.log('✅ 页面文件存在:', pagePath);

    const pageContent = fs.readFileSync(pagePath, 'utf8');

    // 检查关键导入
    if (pageContent.includes('TestimonialsThreeColumnSection')) {
      console.log('✅ TestimonialsThreeColumnSection已导入');
    } else {
      console.log('❌ TestimonialsThreeColumnSection未导入');
    }

    // 检查组件使用
    if (pageContent.includes('TestimonialsThreeColumnSection namespace=')) {
      console.log('✅ TestimonialsThreeColumnSection已使用');

      // 提取namespace
      const namespaceMatch = pageContent.match(
        /TestimonialsThreeColumnSection namespace="([^"]+)"/
      );
      if (namespaceMatch) {
        console.log('📝 namespace:', namespaceMatch[1]);
      }
    } else {
      console.log('❌ TestimonialsThreeColumnSection未使用');
    }
  } else {
    console.log('❌ 页面文件不存在:', pagePath);
  }
} catch (error) {
  console.log('❌ 页面文件检查错误:', error.message);
}

// 3. 组件文件检查
console.log('\n3️⃣ 组件文件检查');
console.log('-'.repeat(30));

try {
  const componentPath =
    'src/components/blocks/testimonials/testimonials-three-column.tsx';
  if (fs.existsSync(componentPath)) {
    console.log('✅ 组件文件存在:', componentPath);

    const componentContent = fs.readFileSync(componentPath, 'utf8');

    // 检查关键逻辑
    if (componentContent.includes('useTranslations')) {
      console.log('✅ 使用useTranslations hook');
    }

    if (componentContent.includes('testimonialItems.length === 0')) {
      console.log('✅ 包含空数据检查逻辑');
    }

    if (componentContent.includes('return null')) {
      console.log('✅ 无数据时返回null');
    }
  } else {
    console.log('❌ 组件文件不存在:', componentPath);
  }
} catch (error) {
  console.log('❌ 组件文件检查错误:', error.message);
}

// 4. 模拟组件渲染逻辑
console.log('\n4️⃣ 模拟组件渲染逻辑');
console.log('-'.repeat(30));

try {
  const jsonContent = JSON.parse(
    fs.readFileSync('messages/pages/albanian-to-english/en.json', 'utf8')
  );
  const testimonials = jsonContent.AlbanianToEnglishPage.testimonials;

  // 模拟组件逻辑
  let hasItems = false;
  try {
    const testCheck = testimonials.items;
    hasItems = testCheck && typeof testCheck === 'object';
  } catch (error) {
    hasItems = false;
  }

  console.log('📊 hasItems检查:', hasItems);

  if (hasItems) {
    const testimonialItems = [];
    for (let i = 1; i <= 3; i++) {
      const key = `item-${i}`;
      const item = testimonials.items[key];

      if (item && item.name) {
        testimonialItems.push({
          id: key,
          name: item.name,
          role: item.role || '',
          heading: item.heading || '',
          content: item.content || '',
          rating: Number(item.rating) || 5,
        });
      }
    }

    console.log('📊 会渲染的评论数量:', testimonialItems.length);

    if (testimonialItems.length > 0) {
      console.log('✅ 组件应该正常渲染testimonials部分');
      testimonialItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - ${item.role}`);
      });
    } else {
      console.log('❌ 组件会返回null，不显示testimonials');
    }
  } else {
    console.log('❌ 组件会返回null，没有testimonials数据');
  }
} catch (error) {
  console.log('❌ 模拟渲染错误:', error.message);
}

// 5. 建议解决方案
console.log('\n5️⃣ 问题诊断和解决方案');
console.log('-'.repeat(30));

console.log('\n🔍 如果testimonials仍然不显示，可能的原因:');
console.log('');
console.log('1. 🌐 浏览器缓存问题');
console.log('   - 解决方案: 硬刷新浏览器 (Ctrl+Shift+R 或 Cmd+Shift+R)');
console.log('   - 或者在开发者工具中禁用缓存');
console.log('');
console.log('2. 🎨 CSS样式问题');
console.log('   - 检查浏览器开发者工具的Elements面板');
console.log('   - 查看testimonials元素是否存在但被隐藏');
console.log('   - 检查是否有CSS规则将其隐藏 (display: none, opacity: 0等)');
console.log('');
console.log('3. 🐛 JavaScript运行时错误');
console.log('   - 打开浏览器开发者工具的Console面板');
console.log('   - 查看是否有JavaScript错误');
console.log('   - 特别关注next-intl相关的错误');
console.log('');
console.log('4. 🔄 Next.js开发服务器缓存');
console.log('   - 重启开发服务器: pnpm dev');
console.log('   - 清除.next目录: rm -rf .next && pnpm dev');
console.log('');
console.log('5. 📱 移动端/响应式问题');
console.log('   - 在不同屏幕尺寸下测试');
console.log('   - 检查是否在小屏幕上被隐藏');

console.log('\n' + '='.repeat(60));
console.log('🎯 诊断完成！如果所有数据检查都通过，问题很可能在缓存或CSS层面。');
