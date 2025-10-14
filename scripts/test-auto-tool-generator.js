#!/usr/bin/env node

/**
 * 🧪 自动化工具生成器测试脚本
 *
 * 验证自动生成的内容是否正确映射到翻译文件
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 测试字段映射
 */
async function testFieldMapping(toolName) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 测试工具: ${toolName}`, 'bright');
  log('='.repeat(60), 'cyan');

  const slug = toolName.toLowerCase().replace(/\s+/g, '-');

  // 读取文件
  const contentPath = path.join(
    ROOT_DIR,
    '.tool-generation',
    slug,
    'content.json'
  );
  const enPath = path.join(ROOT_DIR, 'messages', 'pages', slug, 'en.json');

  let content, enTranslation;
  try {
    const contentRaw = await fs.readFile(contentPath, 'utf-8');
    content = JSON.parse(contentRaw);
    log('✅ 成功读取 content.json', 'green');
  } catch (error) {
    log(`❌ 无法读取 content.json: ${error.message}`, 'red');
    return false;
  }

  try {
    const enRaw = await fs.readFile(enPath, 'utf-8');
    enTranslation = JSON.parse(enRaw);
    log('✅ 成功读取 en.json', 'green');
  } catch (error) {
    log(`❌ 无法读取 en.json: ${error.message}`, 'red');
    return false;
  }

  // 提取页面数据
  const pageName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  const pageData = enTranslation[`${pageName}Page`];

  if (!pageData) {
    log(`❌ 未找到 ${pageName}Page 键`, 'red');
    return false;
  }

  // 定义需要验证的字段映射
  const fieldMappings = [
    // SEO 字段
    { contentPath: 'seo.title', translationPath: 'title', name: 'SEO Title' },
    {
      contentPath: 'seo.metaDescription',
      translationPath: 'description',
      name: 'SEO Description',
    },

    // Hero 字段
    {
      contentPath: 'h1.title',
      translationPath: 'hero.title',
      name: 'H1 Title',
    },
    {
      contentPath: 'heroDescription.content',
      translationPath: 'hero.description',
      name: 'Hero Description',
    },

    // What Is 字段
    {
      contentPath: 'whatIs.title',
      translationPath: 'whatIs.title',
      name: 'What Is Title',
    },
    {
      contentPath: 'whatIs.content',
      translationPath: 'whatIs.content',
      name: 'What Is Content',
    },

    // Example 字段
    {
      contentPath: 'example.title',
      translationPath: 'examples.title',
      name: 'Example Title',
    },
    {
      contentPath: 'example.description',
      translationPath: 'examples.description',
      name: 'Example Description',
    },

    // How To 字段
    {
      contentPath: 'howTo.title',
      translationPath: 'howto.title',
      name: 'How To Title',
    },
    {
      contentPath: 'howTo.description',
      translationPath: 'howto.description',
      name: 'How To Description',
    },

    // Interesting Sections 字段
    {
      contentPath: 'interestingSections.title',
      translationPath: 'unique.title',
      name: 'Unique Title',
    },

    // Highlights 字段
    {
      contentPath: 'highlights.title',
      translationPath: 'highlights.title',
      name: 'Highlights Title',
    },

    // CTA 字段
    {
      contentPath: 'cta.title',
      translationPath: 'cta.title',
      name: 'CTA Title',
    },
    {
      contentPath: 'cta.description',
      translationPath: 'cta.description',
      name: 'CTA Description',
    },
  ];

  let passed = 0;
  let failed = 0;
  const errors = [];

  // 验证每个字段
  for (const mapping of fieldMappings) {
    const contentValue = getNestedValue(content, mapping.contentPath);
    const translationValue = getNestedValue(pageData, mapping.translationPath);

    if (contentValue === undefined) {
      failed++;
      errors.push(
        `  ❌ ${mapping.name}: content.json 中缺少 ${mapping.contentPath}`
      );
    } else if (translationValue === undefined) {
      failed++;
      errors.push(
        `  ❌ ${mapping.name}: en.json 中缺少 ${mapping.translationPath}`
      );
    } else if (contentValue !== translationValue) {
      failed++;
      errors.push(`  ❌ ${mapping.name}: 值不匹配`);
      errors.push(
        `     content: "${String(contentValue).substring(0, 50)}..."`
      );
      errors.push(
        `     translation: "${String(translationValue).substring(0, 50)}..."`
      );
    } else {
      passed++;
    }
  }

  // 验证数组字段
  log('\n📊 验证数组字段...', 'cyan');

  // How To Steps
  if (content.howTo?.steps && pageData.howto?.steps) {
    if (content.howTo.steps.length !== pageData.howto.steps.length) {
      failed++;
      errors.push(
        `  ❌ How To Steps 数量不匹配: content=${content.howTo.steps.length}, translation=${pageData.howto.steps.length}`
      );
    } else {
      let stepsMatch = true;
      for (let i = 0; i < content.howTo.steps.length; i++) {
        if (
          content.howTo.steps[i].name !== pageData.howto.steps[i].name ||
          content.howTo.steps[i].description !==
            pageData.howto.steps[i].description
        ) {
          stepsMatch = false;
          errors.push(`  ❌ How To Step ${i + 1} 内容不匹配`);
          break;
        }
      }
      if (stepsMatch) {
        passed++;
        log('  ✅ How To Steps 完全匹配', 'green');
      } else {
        failed++;
      }
    }
  }

  // Fun Facts
  if (content.funFacts && pageData.userScenarios?.items) {
    if (content.funFacts.length !== pageData.userScenarios.items.length) {
      failed++;
      errors.push(
        `  ❌ Fun Facts 数量不匹配: content=${content.funFacts.length}, translation=${pageData.userScenarios.items.length}`
      );
    } else {
      let factsMatch = true;
      for (let i = 0; i < content.funFacts.length; i++) {
        if (
          content.funFacts[i].content !==
          pageData.userScenarios.items[i].description
        ) {
          factsMatch = false;
          errors.push(`  ❌ Fun Fact ${i + 1} 内容不匹配`);
          break;
        }
      }
      if (factsMatch) {
        passed++;
        log('  ✅ Fun Facts 完全匹配', 'green');
      } else {
        failed++;
      }
    }
  }

  // Interesting Sections
  if (content.interestingSections?.sections && pageData.unique?.items) {
    if (
      content.interestingSections.sections.length !==
      pageData.unique.items.length
    ) {
      failed++;
      errors.push(
        `  ❌ Interesting Sections 数量不匹配: content=${content.interestingSections.sections.length}, translation=${pageData.unique.items.length}`
      );
    } else {
      let sectionsMatch = true;
      for (let i = 0; i < content.interestingSections.sections.length; i++) {
        if (
          content.interestingSections.sections[i].title !==
            pageData.unique.items[i].title ||
          content.interestingSections.sections[i].content !==
            pageData.unique.items[i].content
        ) {
          sectionsMatch = false;
          errors.push(`  ❌ Interesting Section ${i + 1} 内容不匹配`);
          break;
        }
      }
      if (sectionsMatch) {
        passed++;
        log('  ✅ Interesting Sections 完全匹配', 'green');
      } else {
        failed++;
      }
    }
  }

  // Highlights
  if (content.highlights?.features && pageData.highlights?.items) {
    if (
      content.highlights.features.length !== pageData.highlights.items.length
    ) {
      failed++;
      errors.push(
        `  ❌ Highlights 数量不匹配: content=${content.highlights.features.length}, translation=${pageData.highlights.items.length}`
      );
    } else {
      let highlightsMatch = true;
      for (let i = 0; i < content.highlights.features.length; i++) {
        if (
          content.highlights.features[i].title !==
            pageData.highlights.items[i].title ||
          content.highlights.features[i].description !==
            pageData.highlights.items[i].description
        ) {
          highlightsMatch = false;
          errors.push(`  ❌ Highlight ${i + 1} 内容不匹配`);
          break;
        }
      }
      if (highlightsMatch) {
        passed++;
        log('  ✅ Highlights 完全匹配', 'green');
      } else {
        failed++;
      }
    }
  }

  // Testimonials
  if (content.testimonials && pageData.testimonials?.items) {
    const testimonialsCount = content.testimonials.length;
    const translationTestimonialsCount = Object.keys(
      pageData.testimonials.items
    ).length;

    if (testimonialsCount !== translationTestimonialsCount) {
      failed++;
      errors.push(
        `  ❌ Testimonials 数量不匹配: content=${testimonialsCount}, translation=${translationTestimonialsCount}`
      );
    } else {
      let testimonialsMatch = true;
      for (let i = 0; i < testimonialsCount; i++) {
        const translationItem = pageData.testimonials.items[`item-${i + 1}`];
        if (
          !translationItem ||
          content.testimonials[i].name !== translationItem.name ||
          content.testimonials[i].role !== translationItem.role ||
          content.testimonials[i].content !== translationItem.content
        ) {
          testimonialsMatch = false;
          errors.push(`  ❌ Testimonial ${i + 1} 内容不匹配`);
          break;
        }
      }
      if (testimonialsMatch) {
        passed++;
        log('  ✅ Testimonials 完全匹配', 'green');
      } else {
        failed++;
      }
    }
  }

  // FAQs
  if (content.faqs && pageData.faqs?.items) {
    const faqsCount = content.faqs.length;
    const translationFaqsCount = Object.keys(pageData.faqs.items).length;

    if (faqsCount !== translationFaqsCount) {
      failed++;
      errors.push(
        `  ❌ FAQs 数量不匹配: content=${faqsCount}, translation=${translationFaqsCount}`
      );
    } else {
      let faqsMatch = true;
      for (let i = 0; i < faqsCount; i++) {
        const translationItem = pageData.faqs.items[`item-${i + 1}`];
        if (
          !translationItem ||
          content.faqs[i].question !== translationItem.question ||
          content.faqs[i].answer !== translationItem.answer
        ) {
          faqsMatch = false;
          errors.push(`  ❌ FAQ ${i + 1} 内容不匹配`);
          break;
        }
      }
      if (faqsMatch) {
        passed++;
        log('  ✅ FAQs 完全匹配', 'green');
      } else {
        failed++;
      }
    }
  }

  // 输出结果
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('📊 测试结果', 'bright');
  log('='.repeat(60), 'cyan');
  log(`✅ 通过: ${passed}`, 'green');
  log(`❌ 失败: ${failed}`, failed > 0 ? 'red' : 'green');

  if (errors.length > 0) {
    log('\n❌ 错误详情:', 'red');
    errors.forEach((err) => log(err, 'red'));
  }

  return failed === 0;
}

/**
 * 测试 UI 唯一性（头像、数字、按钮样式）
 */
async function testUIUniqueness(toolName) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🎨 UI 验收测试: ${toolName}`, 'bright');
  log('='.repeat(60), 'cyan');

  const slug = toolName.toLowerCase().replace(/\s+/g, '-');
  const pagePath = path.join(
    ROOT_DIR,
    'src',
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    'page.tsx'
  );

  let passed = 0;
  let failed = 0;
  const errors = [];

  // 读取当前工具的 page.tsx
  let currentPageContent;
  try {
    currentPageContent = await fs.readFile(pagePath, 'utf-8');
  } catch (error) {
    log(`❌ 无法读取 page.tsx: ${error.message}`, 'red');
    return false;
  }

  // 提取当前工具的头像和数字
  const currentAvatars = extractAvatars(currentPageContent);
  const currentUserCount = extractUserCount(currentPageContent);

  log(`\n📊 当前工具配置:`, 'cyan');
  log(`  - 头像: ${JSON.stringify(currentAvatars)}`);
  log(`  - 用户数量: ${currentUserCount}`);

  // 获取所有其他工具的 page.tsx 文件
  const pagesDir = path.join(
    ROOT_DIR,
    'src',
    'app',
    '[locale]',
    '(marketing)',
    '(pages)'
  );
  const allTools = await fs.readdir(pagesDir);

  const otherTools = allTools.filter(
    (tool) => tool !== slug && !tool.startsWith('[') && !tool.startsWith('.')
  );

  // 1. 检查头像唯一性
  log(`\n🖼️  检查头像组合唯一性...`, 'cyan');
  let avatarConflicts = [];
  for (const otherTool of otherTools) {
    const otherPagePath = path.join(pagesDir, otherTool, 'page.tsx');
    try {
      const otherContent = await fs.readFile(otherPagePath, 'utf-8');
      const otherAvatars = extractAvatars(otherContent);

      if (
        JSON.stringify(currentAvatars) === JSON.stringify(otherAvatars) &&
        currentAvatars
      ) {
        avatarConflicts.push(otherTool);
      }
    } catch (error) {
      // 文件可能不存在，跳过
    }
  }

  if (avatarConflicts.length > 0) {
    failed++;
    errors.push(
      `  ❌ 头像组合重复，与以下工具冲突: ${avatarConflicts.join(', ')}`
    );
    log(`❌ 头像组合重复`, 'red');
  } else if (currentAvatars) {
    passed++;
    log(`✅ 头像组合唯一`, 'green');
  } else {
    errors.push(`  ⚠️  未检测到头像配置`);
    log(`⚠️  未检测到头像配置`, 'yellow');
  }

  // 2. 检查用户数量唯一性
  log(`\n🔢 检查用户数量唯一性...`, 'cyan');
  let countConflicts = [];
  for (const otherTool of otherTools) {
    const otherPagePath = path.join(pagesDir, otherTool, 'page.tsx');
    try {
      const otherContent = await fs.readFile(otherPagePath, 'utf-8');
      const otherUserCount = extractUserCount(otherContent);

      if (currentUserCount && currentUserCount === otherUserCount) {
        countConflicts.push(otherTool);
      }
    } catch (error) {
      // 文件可能不存在，跳过
    }
  }

  if (countConflicts.length > 0) {
    failed++;
    errors.push(
      `  ❌ 用户数量重复 (${currentUserCount})，与以下工具冲突: ${countConflicts.join(', ')}`
    );
    log(`❌ 用户数量重复`, 'red');
  } else if (currentUserCount) {
    passed++;
    log(`✅ 用户数量唯一 (${currentUserCount})`, 'green');
  } else {
    errors.push(`  ⚠️  未检测到用户数量配置`);
    log(`⚠️  未检测到用户数量配置`, 'yellow');
  }

  // 3. 检查互换按钮样式（仅翻译工具）
  const isTranslator =
    toolName.toLowerCase().includes('translator') ||
    toolName.toLowerCase().includes('translation');

  if (isTranslator) {
    log(`\n🔄 检查互换按钮样式...`, 'cyan');
    const hasRoundedFull = currentPageContent.includes('rounded-full');
    const hasShadow = currentPageContent.includes('shadow-md');
    const hasBgGray200 = currentPageContent.includes('bg-gray-200');

    // 检查工具组件文件
    const componentPath = path.join(
      ROOT_DIR,
      'src',
      'app',
      '[locale]',
      '(marketing)',
      '(pages)',
      slug,
      `${slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')}Tool.tsx`
    );

    let componentContent;
    try {
      componentContent = await fs.readFile(componentPath, 'utf-8');
    } catch (error) {
      // 组件文件可能不存在
      componentContent = '';
    }

    const hasSwapButton =
      componentContent.includes('Swap') ||
      componentContent.includes('Toggle') ||
      componentContent.includes('Switch') ||
      currentPageContent.includes('Swap Button') ||
      currentPageContent.includes('Direction Swap');

    if (!hasSwapButton) {
      errors.push(`  ⚠️  未检测到互换按钮，请检查实现`);
      log(`⚠️  未检测到互换按钮`, 'yellow');
    } else if (
      componentContent.includes('rounded-full') &&
      componentContent.includes('shadow')
    ) {
      failed++;
      errors.push(`  ❌ 互换按钮使用了圆形背景和阴影，应该使用简洁样式`);
      errors.push(`     建议：移除 rounded-full 和 shadow 类`);
      errors.push(`     参考：esperanto-translator 的实现`);
      log(`❌ 互换按钮样式不符合规范`, 'red');
    } else {
      passed++;
      log(`✅ 互换按钮使用简洁样式`, 'green');
    }
  }

  // 输出结果
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('📊 UI 验收测试结果', 'bright');
  log('='.repeat(60), 'cyan');
  log(`✅ 通过: ${passed}`, 'green');
  log(`❌ 失败: ${failed}`, failed > 0 ? 'red' : 'green');

  if (errors.length > 0) {
    log('\n详情:', 'yellow');
    errors.forEach((err) => log(err, 'yellow'));
  }

  if (failed === 0) {
    log('\n✅ 所有 UI 验收测试通过! 🎉', 'green');
  }

  return failed === 0;
}

/**
 * 从 page.tsx 中提取头像配置
 */
function extractAvatars(content) {
  // 匹配 ['female2', 'male4', ...] 格式
  const arrayMatch = content.match(/\[([^\]]+)\]\.map\(\(avatar/);
  if (arrayMatch) {
    try {
      const avatarsStr = `[${arrayMatch[1]}]`;
      return JSON.parse(avatarsStr.replace(/'/g, '"'));
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * 从 page.tsx 中提取用户数量
 */
function extractUserCount(content) {
  // 匹配 from 10,000+ happy users 格式
  const match = content.match(/from\s+(\d+,\d+\+)\s+happy users/);
  return match ? match[1] : null;
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 主函数
 */
async function main() {
  const toolName = process.argv[2];

  if (!toolName) {
    log('❌ 请提供工具名称', 'red');
    log(
      '使用方法: node scripts/test-auto-tool-generator.js "ivr translator"',
      'yellow'
    );
    process.exit(1);
  }

  log('\n🧪 VibeTrans 自动化工具生成器测试', 'bright');

  const success = await testFieldMapping(toolName);

  if (success) {
    log('\n✅ 所有测试通过! 🎉', 'green');
    process.exit(0);
  } else {
    log('\n❌ 测试失败，请检查错误详情', 'red');
    process.exit(1);
  }
}

main();
