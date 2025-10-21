/**
 * 用例测试：验证所有工具页面的用户评论已从6个或更多减少到3个
 * 测试目标：
 * 1. 验证修改后的文件确实只有3个testimonials
 * 2. 验证JSON格式正确
 * 3. 验证testimonials组件能正常渲染
 */

const fs = require('fs');
const path = require('path');

console.log('=== 开始测试：用户评论数量验证 ===\n');

// 测试1: 验证修改后的文件testimonials数量
function testTestimonialsCount() {
  console.log('测试1: 验证修改后文件的testimonials数量');

  const modifiedFiles = [
    'messages/pages/home/en.json',
    'messages/pages/dumb-it-down/en.json',
    'messages/pages/creole-to-english-translator/en.json',
  ];

  let allTestsPassed = true;

  modifiedFiles.forEach((file) => {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // 查找testimonials部分
      const testimonials = findTestimonials(data);

      if (testimonials) {
        const itemCount = Object.keys(testimonials.items).length;
        console.log(`✓ ${file}: ${itemCount} 个testimonials items`);

        if (itemCount === 3) {
          console.log(`  ✓ 通过：正好3个items (item-1, item-2, item-3)`);

          // 验证只有item-1, item-2, item-3
          const itemKeys = Object.keys(testimonials.items);
          const expectedKeys = ['item-1', 'item-2', 'item-3'];
          const hasCorrectKeys =
            expectedKeys.every((key) => itemKeys.includes(key)) &&
            itemKeys.length === expectedKeys.length;

          if (hasCorrectKeys) {
            console.log(`  ✓ 通过：包含正确的items (item-1, item-2, item-3)`);
          } else {
            console.log(
              `  ✗ 失败：items不正确，期望 [${expectedKeys.join(', ')}]，实际 [${itemKeys.join(', ')}]`
            );
            allTestsPassed = false;
          }
        } else {
          console.log(`  ✗ 失败：期望3个items，实际${itemCount}个`);
          allTestsPassed = false;
        }
      } else {
        console.log(`- ${file}: 未找到testimonials部分`);
      }
    } catch (error) {
      console.log(`  ✗ 失败：读取或解析文件失败 - ${error.message}`);
      allTestsPassed = false;
    }
  });

  return allTestsPassed;
}

// 测试2: 验证JSON格式正确性
function testJsonValidity() {
  console.log('\n测试2: 验证JSON格式正确性');

  const files = [
    'messages/pages/home/en.json',
    'messages/pages/dumb-it-down/en.json',
    'messages/pages/creole-to-english-translator/en.json',
  ];

  let allTestsPassed = true;

  files.forEach((file) => {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      console.log(`✓ ${file}: JSON格式正确`);
    } catch (error) {
      console.log(`✗ ${file}: JSON格式错误 - ${error.message}`);
      allTestsPassed = false;
    }
  });

  return allTestsPassed;
}

// 测试3: 验证所有工具页面都不超过3个testimonials
function testAllToolPages() {
  console.log('\n测试3: 验证所有工具页面都不超过3个testimonials');

  const messagesDir = path.join(__dirname, 'messages/pages');
  const directories = fs.readdirSync(messagesDir);

  let allTestsPassed = true;
  let totalPagesChecked = 0;
  let pagesWithTestimonials = 0;

  directories.forEach((dir) => {
    const enJsonPath = path.join(messagesDir, dir, 'en.json');

    if (fs.existsSync(enJsonPath)) {
      try {
        const content = fs.readFileSync(enJsonPath, 'utf8');
        const data = JSON.parse(content);
        const testimonials = findTestimonials(data);

        totalPagesChecked++;

        if (testimonials) {
          pagesWithTestimonials++;
          const itemCount = Object.keys(testimonials.items).length;

          if (itemCount <= 3) {
            console.log(
              `✓ ${dir}: ${itemCount} 个testimonials items (符合要求)`
            );
          } else {
            console.log(
              `✗ ${dir}: ${itemCount} 个testimonials items (超过3个)`
            );
            allTestsPassed = false;
          }
        }
      } catch (error) {
        console.log(`✗ ${dir}: 解析失败 - ${error.message}`);
        allTestsPassed = false;
      }
    }
  });

  console.log(
    `\n检查完成：共检查 ${totalPagesChecked} 个页面，其中 ${pagesWithTestimonials} 个页面包含testimonials`
  );

  return allTestsPassed;
}

// 辅助函数：递归查找testimonials
function findTestimonials(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) {
    return null;
  }

  // 检查当前对象是否是testimonials
  if (
    obj.items &&
    typeof obj.items === 'object' &&
    Object.keys(obj.items).some((key) => key.startsWith('item-'))
  ) {
    // 验证这是testimonials而不是其他items
    if (
      path.includes('testimonials') ||
      (obj.title && obj.title.includes('Users Are Saying')) ||
      (obj.subtitle && obj.subtitle.includes('feedback'))
    ) {
      return obj;
    }
  }

  // 递归搜索
  for (const key in obj) {
    const result = findTestimonials(obj[key], path ? `${path}.${key}` : key);
    if (result) {
      return result;
    }
  }

  return null;
}

// 测试4: 验证testimonials组件兼容性
function testTestimonialsComponentCompatibility() {
  console.log('\n测试4: 验证testimonials组件兼容性');

  const testimonialsComponentPath = path.join(
    __dirname,
    'src/components/blocks/testimonials/testimonials-three-column.tsx'
  );

  try {
    const componentContent = fs.readFileSync(testimonialsComponentPath, 'utf8');

    // 检查组件是否限制为3个testimonials
    const hasLoopLimit =
      componentContent.includes('i <= 3') ||
      componentContent.includes('i < 4') ||
      componentContent.includes('Math.min(3');

    if (hasLoopLimit) {
      console.log('✓ TestimonialsThreeColumnSection组件已限制为显示3个评论');
      return true;
    } else {
      console.log('✗ TestimonialsThreeColumnSection组件未限制评论数量');
      return false;
    }
  } catch (error) {
    console.log(`✗ 无法读取testimonials组件 - ${error.message}`);
    return false;
  }
}

// 运行所有测试
function runAllTests() {
  console.log('开始运行所有测试用例...\n');

  const results = [
    { name: 'testimonials数量验证', passed: testTestimonialsCount() },
    { name: 'JSON格式验证', passed: testJsonValidity() },
    { name: '所有工具页面验证', passed: testAllToolPages() },
    {
      name: '组件兼容性验证',
      passed: testTestimonialsComponentCompatibility(),
    },
  ];

  console.log('\n=== 测试结果汇总 ===');
  let allPassed = true;

  results.forEach((result) => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${result.name}`);
    if (!result.passed) allPassed = false;
  });

  console.log('\n=== 总结 ===');
  if (allPassed) {
    console.log('🎉 所有测试通过！用户评论已成功从6个或更多减少到3个。');
    console.log('✅ 修改的文件:');
    console.log('   - messages/pages/home/en.json');
    console.log('   - messages/pages/dumb-it-down/en.json');
    console.log('   - messages/pages/creole-to-english-translator/en.json');
  } else {
    console.log('⚠️  部分测试失败，请检查上述问题。');
  }

  return allPassed;
}

// 如果直接运行此脚本
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testTestimonialsCount,
  testJsonValidity,
  testAllToolPages,
  testTestimonialsComponentCompatibility,
};
