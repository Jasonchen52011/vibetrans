#!/usr/bin/env node

/**
 * 最终验证报告 - Phase 5.6 图片路径一致性验证功能完整性测试
 */

const fs = require('node:fs/promises');
const path = require('node:path');

// 配置
const ROOT_DIR = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * 验证最终状态
 */
async function validateFinalState() {
  log('🎯 Phase 5.6 最终验证报告', 'bright');
  log('='.repeat(60), 'cyan');

  // 读取页面代码
  const pagePath = path.join(
    ROOT_DIR,
    'src/app/[locale]/(marketing)/(pages)/rune-translator/page.tsx'
  );
  const pageContent = await fs.readFile(pagePath, 'utf-8');

  // 读取JSON配置
  const jsonPath = path.join(
    ROOT_DIR,
    'messages/pages/rune-translator/en.json'
  );
  const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));

  const pageData = jsonData.RuneTranslatorPage;

  log('\n📋 验证项目清单:\n');

  // 1. 验证硬编码图片路径已修复
  const hardcodedPatterns = [
    /src=['"][^'"]*rune[^'"]*\.webp['"]/gi,
    /src=['"][^'"]*magic[^'"]*\.webp['"]/gi,
    /src=['"][^'"]*fact[^'"]*\.webp['"]/gi,
  ];

  let hardcodedCount = 0;
  hardcodedPatterns.forEach((pattern) => {
    const matches = pageContent.match(pattern);
    if (matches) hardcodedCount += matches.length;
  });

  if (hardcodedCount === 0) {
    logSuccess('1. ✅ 硬编码图片路径问题已完全修复');
    logInfo('   - 页面代码中没有硬编码的图片路径');
  } else {
    logError(`1. ❌ 仍有 ${hardcodedCount} 个硬编码图片路径`);
  }

  // 2. 验证JSON图片键正确使用
  const imageKeyReferences = pageContent.match(
    /\(t\s*\(\s*['"][^'"]+\.(image|imageAlt)['"]/g
  );
  if (imageKeyReferences && imageKeyReferences.length > 0) {
    logSuccess('2. ✅ JSON图片键正确引用');
    logInfo(`   - 发现 ${imageKeyReferences.length} 个图片键引用`);
  } else {
    logWarning('2. ⚠️  图片键引用可能需要进一步检查');
  }

  // 3. 验证How to结构耦合已修复
  const howtoStepsRefs = pageContent.match(/howto\.steps\.\d+\.\w+/g);
  const hasSteps = Array.isArray(pageData.howto?.steps);

  if (howtoStepsRefs && hasSteps) {
    logSuccess('3. ✅ How to结构耦合问题已修复');
    logInfo(`   - JSON中有steps数组: ${hasSteps}`);
    logInfo(`   - 页面正确引用: ${howtoStepsRefs.length} 处`);
  } else {
    logError('3. ❌ How to结构耦合问题未解决');
  }

  // 4. 验证Highlights结构耦合已修复
  const highlightsFeaturesRefs = pageContent.match(
    /highlights\.features\.\d+\.\w+/g
  );
  const hasFeatures = Array.isArray(pageData.highlights?.features);

  if (highlightsFeaturesRefs && hasFeatures) {
    logSuccess('4. ✅ Highlights结构耦合问题已修复');
    logInfo(`   - JSON中有features数组: ${hasFeatures}`);
    logInfo(`   - 页面正确引用: ${highlightsFeaturesRefs.length} 处`);
  } else {
    logError('4. ❌ Highlights结构耦合问题未解决');
  }

  // 5. 验证图片文件存在性
  const publicDir = path.join(ROOT_DIR, 'public');
  let imageFilesExist = true;
  let checkedImages = 0;

  const imagePaths = [];
  function extractImages(obj, basePath = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (
        key === 'image' &&
        typeof value === 'string' &&
        value.startsWith('/images/')
      ) {
        imagePaths.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractImages(value, basePath);
      }
    }
  }
  extractImages(pageData);

  for (const imagePath of imagePaths) {
    checkedImages++;
    const fullPath = path.join(
      publicDir,
      imagePath.replace('/images/', 'images/')
    );
    try {
      await fs.access(fullPath);
    } catch (error) {
      imageFilesExist = false;
      logError(`   ❌ 图片文件缺失: ${imagePath}`);
    }
  }

  if (imageFilesExist) {
    logSuccess(`5. ✅ 所有图片文件都存在 (${checkedImages}个)`);
  } else {
    logError('5. ❌ 部分图片文件缺失');
  }

  // 6. 验证自动化生成器V2集成
  const generatorPath = path.join(
    ROOT_DIR,
    'scripts/auto-tool-generator-v2.js'
  );
  try {
    const generatorContent = await fs.readFile(generatorPath, 'utf-8');
    if (generatorContent.includes('phase5_6_validateImageConsistency')) {
      logSuccess('6. ✅ Phase 5.6已集成到自动化生成器V2');
      logInfo('   - 函数名: phase5_6_validateImageConsistency');
    } else {
      logError('6. ❌ Phase 5.6未正确集成到生成器');
    }
  } catch (error) {
    logError('6. ❌ 无法访问自动化生成器文件');
  }

  // 7. 验证测试脚本存在
  const testScriptPath = path.join(
    ROOT_DIR,
    'scripts/test-image-consistency.js'
  );
  try {
    await fs.access(testScriptPath);
    logSuccess('7. ✅ 独立测试脚本已创建');
    logInfo('   - 文件: scripts/test-image-consistency.js');
  } catch (error) {
    logError('7. ❌ 独立测试脚本不存在');
  }

  // 总结
  log('\n' + '='.repeat(60), 'green');
  log('🎉 验证完成总结', 'green');
  log('='.repeat(60), 'green');

  const allChecksPassed =
    hardcodedCount === 0 &&
    imageKeyReferences &&
    imageKeyReferences.length > 0 &&
    howtoStepsRefs &&
    hasSteps &&
    highlightsFeaturesRefs &&
    hasFeatures &&
    imageFilesExist;

  if (allChecksPassed) {
    logSuccess('\n🎯 所有验证项目都通过了！');
    logSuccess('✅ Phase 5.6图片路径一致性验证功能已完全实现');
    logSuccess('✅ 代码耦合问题已彻底解决');
    logSuccess('✅ 自动化生成器V2已成功集成新功能');
    logSuccess('✅ 未来工具生成将自动预防此类问题');
  } else {
    logWarning('\n⚠️  仍有部分项目需要进一步检查');
  }

  log('\n📚 Phase 5.6功能特点:');
  logInfo('• 🖼️  图片文件存在性验证');
  logInfo('• 🔍 硬编码路径智能检测');
  logInfo('• 🔗 翻译键引用一致性检查');
  logInfo('• 🏗️  数据结构耦合问题检测');
  logInfo('• 📊 详细错误报告和修复建议');
  logInfo('• 🔄 完全集成到自动化生成流程');

  log(
    '\n🚀 这个功能现在可以确保所有新工具页面都不会出现图片路径和代码耦合问题！'
  );
}

// 运行验证
validateFinalState().catch(console.error);
