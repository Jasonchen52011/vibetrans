#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 批量修复VibeTrans项目中翻译键耦合问题的脚本
 *
 * 问题：页面代码使用简单的翻译键如 "title", "description"，但JSON文件中使用命名空间前缀如 "AlBhedTranslatorPage.title"
 * 解决：自动检测并修复页面代码中的翻译键引用
 */

// 获取工具页面名称映射
function getToolPageMapping() {
  return {
    'al-bhed-translator': 'AlBhedTranslatorPage',
    'albanian-to-english': 'AlbanianToEnglishPage',
    'alien-text-generator': 'AlienTextGeneratorPage',
    'ancient-greek-translator': 'AncientGreekTranslatorPage',
    'aramaic-translator': 'AramaicTranslatorPage',
    'baby-translator': 'BabyTranslatorPage',
    'bad-translator': 'BadTranslatorPage',
    'baybayin-translator': 'BaybayinTranslatorPage',
    'cantonese-translator': 'CantoneseTranslatorPage',
    'chinese-to-english-translator': 'ChineseToEnglishTranslatorPage',
    'creole-to-english-translator': 'CreoleToEnglishTranslatorPage',
    'cuneiform-translator': 'CuneiformTranslatorPage',
    'dog-translator': 'DogTranslatorPage',
    'esperanto-translator': 'EsperantoTranslatorPage',
    'gaster-translator': 'GasterTranslatorPage',
    'gen-alpha-translator': 'GenAlphaTranslatorPage',
    'gen-z-translator': 'GenZTranslatorPage',
    'gibberish-translator': 'GibberishTranslatorPage',
    'high-valyrian-translator': 'HighValyrianTranslatorPage',
    'ivr-translator': 'IvrTranslatorPage',
    'middle-english-translator': 'MiddleEnglishTranslatorPage',
    'minion-translator': 'MinionTranslatorPage',
    'pig-latin-translator': 'PigLatinTranslatorPage',
    'samoan-to-english-translator': 'SamoanToEnglishTranslatorPage',
    'verbose-generator': 'VerboseGeneratorPage',
    'dumb-it-down-ai': 'DumbItDownPage'
  };
}

// 常见需要修复的翻译键模式
const commonKeyPatterns = [
  'title',
  'description',
  'tool.inputLabel',
  'tool.translateButton',
  'tool.outputLabel',
  'tool.inputPlaceholder',
  'tool.outputPlaceholder',
  'tool.uploadButton',
  'tool.uploadHint',
  'tool.loading',
  'tool.error',
  'tool.noInput',
  'examples.title',
  'examples.description',
  'funFacts.title',
  'funFacts.items.0.title',
  'funFacts.items.0.description',
  'funFacts.items.1.title',
  'funFacts.items.1.description',
  'funfacts.title', // 注意大小写差异
  'funfacts.items.0.title',
  'funfacts.items.0.description',
  'funfacts.items.1.title',
  'funfacts.items.1.description',
  'highlights.title',
  'highlights.description',
  'highlights.items.0.title',
  'highlights.items.0.description',
  'highlights.items.1.title',
  'highlights.items.1.description',
  'highlights.items.2.title',
  'highlights.items.2.description',
  'highlights.items.3.title',
  'highlights.items.3.description',
  'whatIs.title',
  'whatIs.description',
  'howto.title',
  'howto.description',
  'howto.steps.0.title',
  'howto.steps.0.description',
  'howto.steps.1.title',
  'howto.steps.1.description',
  'howto.steps.2.title',
  'howto.steps.2.description',
  'howto.steps.3.title',
  'howto.steps.3.description',
  'userInterest.title',
  'userInterest.items.0.title',
  'userInterest.items.0.description',
  'userInterest.items.1.title',
  'userInterest.items.1.description',
  'userInterest.items.2.title',
  'userInterest.items.2.description',
  'userInterest.items.3.title',
  'userInterest.items.3.description',
  'testimonials.items.item-1.name',
  'testimonials.items.item-1.role',
  'testimonials.items.item-1.heading',
  'testimonials.items.item-1.content',
  'testimonials.items.item-2.name',
  'testimonials.items.item-2.role',
  'testimonials.items.item-2.heading',
  'testimonials.items.item-2.content',
  'testimonials.items.item-3.name',
  'testimonials.items.item-3.role',
  'testimonials.items.item-3.heading',
  'testimonials.items.item-3.content',
  'hero.title',
  'hero.description',
  'ctaButton'
];

// 读取文件内容
function readFile(filePath) {
  try {
    return require('fs').readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// 写入文件内容
function writeFile(filePath, content) {
  try {
    require('fs').writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    return false;
  }
}

// 获取页面中当前的命名空间
function getCurrentNamespace(content) {
  const namespaceMatch = content.match(/namespace:\s*['"`]([^'"`]+)['"`]/);
  return namespaceMatch ? namespaceMatch[1] : null;
}

// 修复单个页面的翻译键
function fixPageTranslationKeys(pagePath, toolName, pageNamespace) {
  console.log(`Processing page: ${toolName} -> ${pageNamespace}`);

  const content = readFile(pagePath);
  if (!content) {
    console.error(`Failed to read page: ${pagePath}`);
    return { success: false, fixes: 0 };
  }

  let fixedContent = content;
  let fixCount = 0;

  // 检查是否已经使用了正确的命名空间
  const currentNamespace = getCurrentNamespace(content);
  if (currentNamespace !== pageNamespace) {
    console.log(`  ⚠️  Namespace mismatch: expected ${pageNamespace}, found ${currentNamespace}`);
  }

  // 修复常见的翻译键模式
  commonKeyPatterns.forEach(key => {
    // 匹配 (t as any)('key') 或类似模式
    const regex = new RegExp(`\\(t\\s+as\\s+any\\)\\(['"\`]${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\)`, 'g');
    const matches = fixedContent.match(regex);

    if (matches) {
      fixCount += matches.length;
      const newKey = `${pageNamespace}.${key}`;
      fixedContent = fixedContent.replace(regex, `(t as any)('${newKey}')`);
      console.log(`  ✓ Fixed ${matches.length} occurrences: '${key}' -> '${newKey}'`);
    }
  });

  // 修复hero部分的键
  const heroKeys = ['title', 'description', 'badge', 'subtitle'];
  heroKeys.forEach(key => {
    const regex = new RegExp(`\\(t\\s+as\\s+any\\)\\(['"\`]hero\\.${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\)`, 'g');
    const matches = fixedContent.match(regex);

    if (matches) {
      fixCount += matches.length;
      const newKey = `${pageNamespace}.hero.${key}`;
      fixedContent = fixedContent.replace(regex, `(t as any)('${newKey}')`);
      console.log(`  ✓ Fixed ${matches.length} hero keys: 'hero.${key}' -> '${newKey}'`);
    }
  });

  // 如果有修改，写回文件
  if (fixCount > 0) {
    if (writeFile(pagePath, fixedContent)) {
      console.log(`  ✅ Successfully fixed ${fixCount} keys in ${pagePath}`);
      return { success: true, fixes: fixCount };
    } else {
      console.error(`  ❌ Failed to write fixed content to ${pagePath}`);
      return { success: false, fixes: 0 };
    }
  } else {
    console.log(`  ℹ️  No fixes needed for ${pagePath}`);
    return { success: true, fixes: 0 };
  }
}

// 获取所有工具页面路径
function getAllToolPages() {
  const pagesDir = path.join(process.cwd(), 'src/app/[locale]/(marketing)/(pages)');
  const toolMapping = getToolPageMapping();
  const toolPages = [];

  try {
    const entries = require('fs').readdirSync(pagesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const toolName = entry.name;
        const pagePath = path.join(pagesDir, toolName, 'page.tsx');

        if (require('fs').existsSync(pagePath) && toolMapping[toolName]) {
          toolPages.push({
            toolName,
            pageNamespace: toolMapping[toolName],
            pagePath
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading pages directory:', error.message);
  }

  return toolPages;
}

// 主函数
function main() {
  console.log('🔧 VibeTrans Translation Key Fixer');
  console.log('=====================================\n');

  const toolPages = getAllToolPages();

  if (toolPages.length === 0) {
    console.log('❌ No tool pages found to fix.');
    return;
  }

  console.log(`Found ${toolPages.length} tool pages to process:\n`);

  let totalFixes = 0;
  let successCount = 0;

  toolPages.forEach(({ toolName, pageNamespace, pagePath }) => {
    console.log(`📄 Processing: ${toolName}`);
    const result = fixPageTranslationKeys(pagePath, toolName, pageNamespace);

    if (result.success) {
      successCount++;
      totalFixes += result.fixes;
    }

    console.log(''); // 空行分隔
  });

  console.log('📊 Summary:');
  console.log(`============`);
  console.log(`✅ Successfully processed: ${successCount}/${toolPages.length} pages`);
  console.log(`🔧 Total fixes applied: ${totalFixes}`);
  console.log(`⚠️  Failed pages: ${toolPages.length - successCount}`);

  if (totalFixes > 0) {
    console.log('\n🎉 Translation key fixing completed!');
    console.log('💡 Next steps:');
    console.log('   1. Run `pnpm dev` to test the changes');
    console.log('   2. Check a few pages manually for any remaining issues');
    console.log('   3. Run `pnpm build` to ensure no build errors');
  } else {
    console.log('\nℹ️  No translation key fixes were needed.');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  fixPageTranslationKeys,
  getAllToolPages,
  getToolPageMapping,
  commonKeyPatterns
};