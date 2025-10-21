// Template Comparison Test Script
// 比较模板化前后的功能和内容差异

const fs = require('fs');
const path = require('path');

// 读取文件内容
const originalFile = fs.readFileSync(
  'src/app/[locale]/(marketing)/(pages)/albanian-to-english/page-original-backup.tsx',
  'utf8'
);
const templatedFile = fs.readFileSync(
  'src/app/[locale]/(marketing)/(pages)/albanian-to-english/page-templated.tsx',
  'utf8'
);

console.log('🔍 VibeTrans 模板化测试报告');
console.log('='.repeat(50));

// 1. 代码量对比
console.log('\n📊 代码量对比:');
console.log(`原始版本: ${originalFile.split('\n').length} 行`);
console.log(`模板版本: ${templatedFile.split('\n').length} 行`);
console.log(`代码减少: ${originalFile.split('\n').length - templatedFile.split('\n').length} 行`);

// 2. 功能完整性检查
console.log('\n✅ 功能完整性检查:');

const criticalElements = [
  { name: 'generateMetadata', pattern: /generateMetadata/ },
  { name: 'structuredData', pattern: /structuredData/ },
  { name: 'pageData.tool', pattern: /pageData\s*=\s*\{[^}]*tool:/ },
  { name: 'Hero Section', pattern: /AuroraBackground/ },
  { name: 'Tool Component', pattern: /AlbanianToEnglishTool/ },
  { name: 'WhatIs Section', pattern: /WhatIsSection/ },
  { name: 'Examples Section', pattern: /BeforeAfterSection/ },
  { name: 'HowTo Section', pattern: /HowTo section={howtoSection}/ },
  { name: 'UserScenarios', pattern: /UserScenarios/ },
  { name: 'WhyChoose Section', pattern: /WhyChoose/ },
  { name: 'ExploreOtherTools', pattern: /ExploreOurAiTools/ },
  { name: 'Testimonials', pattern: /TestimonialsThreeColumnSection/ },
  { name: 'FAQ Section', pattern: /FaqSection/ },
  { name: 'CTA Section', pattern: /CallToActionSection/ }
];

criticalElements.forEach(element => {
  const originalHas = element.pattern.test(originalFile);
  const templatedHas = element.pattern.test(templatedFile);
  const status = (originalHas && templatedHas) ? '✅' : '❌';
  console.log(`  ${status} ${element.name}: ${originalHas ? '原始' : '缺失'} → ${templatedHas ? '模板' : '缺失'}`);
});

// 3. 翻译键值检查
console.log('\n🔑 翻译键值检查:');
const translationKeys = [
  'tool.inputLabel',
  'tool.outputLabel',
  'tool.translateButton',
  'hero.title',
  'hero.description',
  'examples.title',
  'whatIs.title',
  'howto.title',
  'highlights.title',
  'userInterest.title',
  'funFacts.title'
];

translationKeys.forEach(key => {
  const pattern = new RegExp(`\\(t as any\\)\\('${key}'\\)`, 'g');
  const originalCount = (originalFile.match(pattern) || []).length;
  const templatedCount = (templatedFile.match(pattern) || []).length;
  const status = originalCount === templatedCount ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${originalCount} → ${templatedCount}`);
});

// 4. 图片路径检查
console.log('\n🖼️ 图片路径检查:');
const imagePattern = /src=['"]([^'"]+\.webp)['"]/g;
const originalImages = (originalFile.match(imagePattern) || []).map(m => m.match(/src=['"]([^'"]+)['"]/)[1]);
const templatedImages = (templatedFile.match(imagePattern) || []).map(m => m.match(/src=['"]([^'"]+)['"]/)[1]);

console.log(`原始版本图片数量: ${originalImages.length}`);
console.log(`模板版本图片数量: ${templatedImages.length}`);

const uniqueOriginal = new Set(originalImages);
const uniqueTemplated = new Set(templatedImages);
console.log(`原始版本唯一图片: ${uniqueOriginal.size}`);
console.log(`模板版本唯一图片: ${uniqueTemplated.size}`);

// 检查是否丢失图片
const lostImages = [...uniqueOriginal].filter(img => !uniqueTemplated.has(img));
if (lostImages.length > 0) {
  console.log('⚠️ 可能丢失的图片:');
  lostImages.forEach(img => console.log(`  - ${img}`));
} else {
  console.log('✅ 所有图片路径都保持一致');
}

// 5. SEO元素检查
console.log('\n🔍 SEO元素检查:');
const seoElements = [
  { name: 'Title标签', pattern: /title:\s*`\$\{gt\('title'\)\}.*name/ },
  { name: 'Description', pattern: /description:\s*gt\('description'\)/ },
  { name: 'Canonical URL', pattern: /canonicalUrl:/ },
  { name: 'OG Image', pattern: /image:/ },
  { name: 'Structured Data', pattern: /@context:\s*['"]https:\/\/schema\.org['"]/ },
  { name: 'ApplicationCategory', pattern: /applicationCategory:/ },
  { name: 'FeatureList', pattern: /featureList:/ }
];

seoElements.forEach(element => {
  const originalHas = element.pattern.test(originalFile);
  const templatedHas = element.pattern.test(templatedFile);
  const status = (originalHas && templatedHas) ? '✅' : '❌';
  console.log(`  ${status} ${element.name}`);
});

// 6. 模板化改进点分析
console.log('\n🚀 模板化改进分析:');

// 检查是否使用了模板化方法
const hasTemplateMethod = /createSectionData/.test(templatedFile);
const hasReusableLogic = /const.*=.*\(.*\)\s*=>/.test(templatedFile);

console.log(`  ${hasTemplateMethod ? '✅' : '❌'} 使用了模板化函数`);
console.log(`  ${hasReusableLogic ? '✅' : '❌'} 包含可重用逻辑`);

// 检查代码重复度
const sectionCreationPattern = /name:\s*['"][^'"]*['"],\s*title:/g;
const originalSections = (originalFile.match(sectionCreationPattern) || []).length;
const templatedSections = (templatedFile.match(sectionCreationPattern) || []).length;

console.log(`  📊 区块创建模式: 原始 ${originalSections} 处 → 模板 ${templatedSections} 处`);

// 7. 总结
console.log('\n📋 测试总结:');
const totalElements = criticalElements.length + translationKeys.length + seoElements.length;
const workingElements = criticalElements.filter(e => e.pattern.test(originalFile) && e.pattern.test(templatedFile)).length +
                         translationKeys.filter(key => {
                           const pattern = new RegExp(`\\(t as any\\)\\('${key}'\\)`, 'g');
                           const originalCount = (originalFile.match(pattern) || []).length;
                           const templatedCount = (templatedFile.match(pattern) || []).length;
                           return originalCount === templatedCount && originalCount > 0;
                         }).length +
                         seoElements.filter(e => e.pattern.test(originalFile) && e.pattern.test(templatedFile)).length;

const successRate = Math.round((workingElements / totalElements) * 100);

console.log(`  功能保持率: ${successRate}%`);
console.log(`  代码优化: ${originalFile.split('\n').length - templatedFile.split('\n').length} 行减少`);

if (successRate >= 95) {
  console.log('  ✅ 测试结果: 优秀 - 模板化成功，功能完整保持');
} else if (successRate >= 85) {
  console.log('  ⚠️ 测试结果: 良好 - 基本功能保持，有少量需要调整');
} else {
  console.log('  ❌ 测试结果: 需要改进 - 存在功能缺失，需要进一步优化');
}

console.log('\n' + '='.repeat(50));
console.log('测试完成!');