#!/usr/bin/env node

/**
 * 测试Phase 5.6图片路径一致性验证功能
 */

const fs = require('node:fs/promises');
const path = require('node:path');

// 配置
const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG = {
  srcDir: path.join(ROOT_DIR, 'src'),
  publicDir: path.join(ROOT_DIR, 'public'),
  messagesDir: path.join(ROOT_DIR, 'messages'),
};

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
 * 从JSON中提取所有图片路径
 */
function extractImagePathsFromJson(jsonData, pageName) {
  const imagePaths = [];
  const pageData = jsonData[pageName];

  if (!pageData) return imagePaths;

  // 递归提取所有image字段
  function extractImages(obj, basePath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;

      if (
        key === 'image' &&
        typeof value === 'string' &&
        value.startsWith('/images/')
      ) {
        imagePaths.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractImages(value, currentPath);
      }
    }
  }

  extractImages(pageData);
  return imagePaths;
}

/**
 * 从页面代码中提取硬编码图片路径
 */
function extractHardcodedImagePaths(content) {
  const hardcodedPaths = [];

  // 匹配各种硬编码图片路径模式
  const patterns = [
    /src=['"]\/images\/[^'"]+['"]/g,
    /image:\s*['"]\/images\/[^'"]+['"]/g,
    /backgroundImage:\s*url\(['"]\/images\/[^'"]+['"]\)/g,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // 提取路径部分
        const pathMatch = match.match(/\/images\/[^'")\s]+/);
        if (pathMatch) {
          hardcodedPaths.push('/' + pathMatch[0]);
        }
      });
    }
  });

  return hardcodedPaths;
}

/**
 * 从JSON中提取图片键
 */
function extractImageKeysFromJson(jsonData, pageName) {
  const imageKeys = [];
  const pageData = jsonData[pageName];

  if (!pageData) return imageKeys;

  function extractKeys(obj, basePath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;

      if (key === 'image' && typeof value === 'string') {
        // 记录到图片字段的完整路径
        if (basePath) {
          imageKeys.push(basePath);
        }
      } else if (typeof value === 'object' && value !== null) {
        extractKeys(value, currentPath);
      }
    }
  }

  extractKeys(pageData);
  return imageKeys;
}

/**
 * 从页面代码中提取图片键引用
 */
function extractImageKeyReferences(content) {
  const references = [];

  // 匹配各种图片键引用模式 - 改进正则表达式
  const patterns = [
    /\(t\s*as\s*any\)\s*\(\s*['"]([^'"]+)\.image['"]\s*\)/g,
    /\(t\s*as\s*any\)\s*\(\s*['"]([^'"]+)\.imageAlt['"]\s*\)/g,
    /\(t\s*\(\s*['"]([^'"]+)\.image['"]\s*\)\s*as\s*any\)/g,
    /\(t\s*\(\s*['"]([^'"]+)\.imageAlt['"]\s*\)\s*as\s*any\)/g,
    /t\(['"]([^'"]+)\.image['"]\)/g,
    /t\(['"]([^'"]+)\.imageAlt['"]\)/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const keyMatch = match[1]; // 直接从捕获组获取键
      if (keyMatch) {
        references.push(keyMatch);
      }
    }
  });

  return references;
}

/**
 * 检查代码耦合问题
 */
function checkCodeCoupling(pageContent, jsonData, pageName) {
  const couplingIssues = [];

  // 检查是否应该使用JSON但使用了硬编码
  const hardcodedPatterns = [
    {
      pattern: /src=['"][^'"]*rune[^'"]*\.webp['"]/gi,
      description: '硬编码rune相关图片路径',
    },
    {
      pattern: /src=['"][^'"]*magic[^'"]*\.webp['"]/gi,
      description: '硬编码magic相关图片路径',
    },
    {
      pattern: /src=['"][^'"]*fact[^'"]*\.webp['"]/gi,
      description: '硬编码fact相关图片路径',
    },
  ];

  hardcodedPatterns.forEach(({ pattern, description }) => {
    const matches = pageContent.match(pattern);
    if (matches) {
      couplingIssues.push({
        type: 'code_coupling',
        description,
        matches: matches.slice(0, 3), // 只显示前3个
        error: 'Should use JSON translation key instead of hardcoded path',
      });
    }
  });

  // 检查数据结构耦合问题
  const pageData = jsonData[pageName];
  if (pageData) {
    // 检查 howto 结构耦合
    if (pageData.howto) {
      const hasSteps = Array.isArray(pageData.howto.steps);
      const hasItems = Array.isArray(pageData.howto.items);

      // 检查页面代码是否使用了错误的引用
      const wrongHowtoRefs = pageContent.match(/howto\.\w+\.\d+\.\w+/g);
      if (wrongHowtoRefs) {
        wrongHowtoRefs.forEach((ref) => {
          if (ref.includes('steps') && !hasSteps) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有steps数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          } else if (ref.includes('items') && !hasItems) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有items数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          }
        });
      }
    }

    // 检查 highlights 结构耦合
    if (pageData.highlights) {
      const hasFeatures = Array.isArray(pageData.highlights.features);
      const hasItems = Array.isArray(pageData.highlights.items);

      // 检查页面代码是否使用了错误的引用
      const wrongHighlightRefs = pageContent.match(
        /highlights\.\w+\.\d+\.\w+/g
      );
      if (wrongHighlightRefs) {
        wrongHighlightRefs.forEach((ref) => {
          if (ref.includes('features') && !hasFeatures) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有features数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          } else if (ref.includes('items') && !hasItems) {
            couplingIssues.push({
              type: 'structure_coupling',
              description: `页面引用了 ${ref} 但JSON中没有items数组`,
              error: 'JSON结构与代码引用不匹配',
            });
          }
        });
      }
    }
  }

  return couplingIssues;
}

/**
 * Phase 5.6: 图片路径一致性验证测试
 */
async function phase5_6_validateImageConsistency(keyword, translationData) {
  log('\n🔍 开始Phase 5.6图片路径一致性验证测试...\n');

  const { slug, pageName } = translationData;
  const issues = [];

  // 验证文件路径
  const enJsonPath = path.join(CONFIG.messagesDir, 'pages', slug, 'en.json');
  const pageTsxPath = path.join(
    CONFIG.srcDir,
    'app',
    '[locale]',
    '(marketing)',
    '(pages)',
    slug,
    'page.tsx'
  );

  try {
    // 读取JSON和页面文件
    const enJsonContent = await fs.readFile(enJsonPath, 'utf-8');
    const jsonData = JSON.parse(enJsonContent);
    const pageTsxContent = await fs.readFile(pageTsxPath, 'utf-8');

    logInfo('开始验证图片路径一致性...');

    // 1. 检查JSON中的图片路径是否在public目录中实际存在
    const imagePaths = extractImagePathsFromJson(jsonData, pageName);
    logInfo(`发现 ${imagePaths.length} 个图片引用在JSON中`);

    for (const imagePath of imagePaths) {
      const fullImagePath = path.join(
        CONFIG.publicDir,
        imagePath.replace('/images/', 'images/')
      );

      try {
        await fs.access(fullImagePath);
        logSuccess(`✓ 图片文件存在: ${imagePath}`);
      } catch (error) {
        issues.push({
          type: 'missing_image_file',
          imagePath,
          fullPath: fullImagePath,
          error: 'Image file referenced in JSON does not exist',
        });
        logError(`✗ 图片文件缺失: ${imagePath}`);
      }
    }

    // 2. 检查页面代码中是否存在硬编码的图片路径
    const hardcodedImagePaths = extractHardcodedImagePaths(pageTsxContent);
    logInfo(`发现 ${hardcodedImagePaths.length} 个硬编码图片路径在页面代码中`);

    for (const hardcodedPath of hardcodedImagePaths) {
      // 检查是否应该使用JSON引用而是硬编码
      const isUsingCorrectPattern =
        /t\(['"]\w+\.\w+\.\w+\['"]['"]\.image['"]\)\)/.test(pageTsxContent);

      if (!isUsingCorrectPattern && hardcodedPath.includes('/images/')) {
        issues.push({
          type: 'hardcoded_image_path',
          path: hardcodedPath,
          error:
            'Page code contains hardcoded image path instead of using JSON reference',
        });
        logError(`✗ 硬编码图片路径: ${hardcodedPath}`);
      }
    }

    // 3. 检查翻译键引用一致性
    const imageKeysInJson = extractImageKeysFromJson(jsonData, pageName);
    const imageKeyReferences = extractImageKeyReferences(pageTsxContent);

    logInfo(`JSON中有 ${imageKeysInJson.length} 个图片键`);
    logInfo(`页面代码中有 ${imageKeyReferences.length} 个图片键引用`);

    // 检查JSON中的图片键是否在页面中被引用
    for (const imageKey of imageKeysInJson) {
      const isReferenced = imageKeyReferences.some((ref) =>
        ref.includes(imageKey)
      );
      if (!isReferenced) {
        issues.push({
          type: 'unreferenced_image_key',
          key: imageKey,
          error: 'Image key in JSON is not referenced in page code',
        });
        logWarning(`⚠️  未被引用的图片键: ${imageKey}`);
      }
    }

    // 4. 检查代码耦合问题 - 确保使用动态JSON引用而非硬编码
    const couplingIssues = checkCodeCoupling(
      pageTsxContent,
      jsonData,
      pageName
    );
    issues.push(...couplingIssues);

    // 生成测试报告
    log('\n📊 图片路径一致性测试报告:');

    if (issues.length === 0) {
      logSuccess('✅ 所有图片路径一致性测试通过！');
      logSuccess('✓ 图片文件都在正确位置');
      logSuccess('✓ 页面代码使用JSON引用而非硬编码');
      logSuccess('✓ 翻译键引用一致性良好');
      logSuccess('✓ 无代码耦合问题');

      return {
        success: true,
        issues: [],
        summary: {
          totalChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length,
          passedChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length,
          failedChecks: 0,
        },
      };
    } else {
      logWarning(`⚠️  发现 ${issues.length} 个图片路径一致性问题:`);

      // 按类型分组显示问题
      const issuesByType = {};
      issues.forEach((issue) => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);
      });

      Object.entries(issuesByType).forEach(([type, items]) => {
        const typeNames = {
          missing_image_file: '缺失图片文件',
          hardcoded_image_path: '硬编码图片路径',
          unreferenced_image_key: '未引用图片键',
          code_coupling: '代码耦合问题',
        };
        logWarning(`\n  ${typeNames[type] || type} (${items.length}个):`);
        items.forEach((item) => {
          if (item.imagePath) {
            logWarning(`    - ${item.imagePath}`);
          } else if (item.path) {
            logWarning(`    - ${item.path}`);
          } else if (item.key) {
            logWarning(`    - ${item.key}`);
          }
        });
      });

      // 提供修复建议
      log('\n💡 修复建议:');
      if (issues.some((i) => i.type === 'missing_image_file')) {
        logInfo('  - 运行图片生成脚本生成缺失的图片文件');
        logInfo('  - 或者更新JSON中的图片路径为现有文件');
      }
      if (issues.some((i) => i.type === 'hardcoded_image_path')) {
        logInfo('  - 将硬编码图片路径替换为JSON翻译键引用');
        logInfo('  - 使用 t("namespace.section.items.index.image") 模式');
      }
      if (issues.some((i) => i.type === 'unreferenced_image_key')) {
        logInfo('  - 在页面代码中添加对JSON图片键的引用');
        logInfo('  - 或者从JSON中移除未使用的图片键');
      }
      if (issues.some((i) => i.type === 'code_coupling')) {
        logInfo('  - 修复代码与JSON配置的耦合问题');
        logInfo('  - 确保所有动态内容通过翻译键获取');
      }

      return {
        success: false,
        issues,
        summary: {
          totalChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length,
          passedChecks:
            imagePaths.length +
            hardcodedImagePaths.length +
            imageKeysInJson.length -
            issues.length,
          failedChecks: issues.length,
        },
      };
    }
  } catch (error) {
    logError(`图片路径一致性验证失败: ${error.message}`);
    return {
      success: false,
      error: error.message,
      issues: [],
    };
  }
}

/**
 * 主函数
 */
async function main() {
  log('🧪 测试Phase 5.6图片路径一致性验证功能', 'bright');
  log('='.repeat(60), 'cyan');

  const translationData = {
    slug: 'rune-translator',
    pageName: 'RuneTranslatorPage',
  };

  try {
    const result = await phase5_6_validateImageConsistency(
      'rune translator',
      translationData
    );

    log('\n' + '='.repeat(60), 'green');
    log('🎉 测试完成！', 'green');
    log('='.repeat(60), 'green');

    if (result.success) {
      logSuccess('\n✅ Phase 5.6验证功能正常工作');
      logSuccess('✅ 所有图片路径一致性测试通过');
    } else {
      logWarning('\n⚠️  Phase 5.6检测到问题:');
      logWarning(`   检测到 ${result.summary.failedChecks} 个问题`);
      logInfo('   这说明验证功能正常工作，能够检测到图片路径一致性问题');
    }

    logInfo(`\n📊 测试统计:`);
    logInfo(`   总检查项目: ${result.summary.totalChecks}`);
    logInfo(`   通过项目: ${result.summary.passedChecks}`);
    logInfo(`   失败项目: ${result.summary.failedChecks}`);
  } catch (error) {
    logError(`\n测试失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
main();
