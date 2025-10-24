#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 补充修复脚本来处理遗漏的翻译键
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
    'dumb-it-down-ai': 'DumbItDownPage',
  };
}

// 遗漏的翻译键模式
const remainingKeyPatterns = [
  'examples.items.0.alt',
  'examples.items.0.name',
  'examples.items.1.alt',
  'examples.items.1.name',
  'examples.items.2.alt',
  'examples.items.2.name',
  'examples.items.3.alt',
  'examples.items.3.name',
  'examples.items.4.alt',
  'examples.items.4.name',
  'examples.items.5.alt',
  'examples.items.5.name',
  'whatIs.image',
  'whatIs.imageAlt',
  'userScenarios.title',
  'userScenarios.items.0.title',
  'userScenarios.items.0.description',
  'userScenarios.items.0.image',
  'userScenarios.items.0.imageAlt',
  'userScenarios.items.1.title',
  'userScenarios.items.1.description',
  'userScenarios.items.1.image',
  'userScenarios.items.1.imageAlt',
  'unique.title',
  'unique.items.0.title',
  'unique.items.0.content',
  'unique.items.0.image',
  'unique.items.0.imageAlt',
  'unique.items.1.title',
  'unique.items.1.content',
  'unique.items.1.image',
  'unique.items.1.imageAlt',
  'unique.items.2.title',
  'unique.items.2.content',
  'unique.items.2.image',
  'unique.items.2.imageAlt',
  'unique.items.3.title',
  'unique.items.3.content',
  'unique.items.3.image',
  'unique.items.3.imageAlt',
  'tool.alBhedLabel', // Al Bhed specific
  'tool.alBhedPlaceholder', // Al Bhed specific
];

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// 写入文件内容
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    return false;
  }
}

// 修复单个页面的剩余翻译键
function fixRemainingKeys(pagePath, toolName, pageNamespace) {
  console.log(`Processing remaining keys for: ${toolName} -> ${pageNamespace}`);

  const content = readFile(pagePath);
  if (!content) {
    console.error(`Failed to read page: ${pagePath}`);
    return { success: false, fixes: 0 };
  }

  let fixedContent = content;
  let fixCount = 0;

  // 修复剩余的翻译键模式
  remainingKeyPatterns.forEach((key) => {
    // 匹配 (t as any)('key') 或类似模式，但排除已经有命名空间的键
    const regex = new RegExp(
      `\\(t\\s+as\\s+any\\)\\(['"\`]${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\)`,
      'g'
    );
    const matches = fixedContent.match(regex);

    if (matches) {
      // 检查是否已经有命名空间
      const hasNamespace = matches.some((match) =>
        match.includes(pageNamespace)
      );
      if (!hasNamespace) {
        fixCount += matches.length;
        const newKey = `${pageNamespace}.${key}`;
        fixedContent = fixedContent.replace(regex, `(t as any)('${newKey}')`);
        console.log(
          `  ✓ Fixed ${matches.length} remaining keys: '${key}' -> '${newKey}'`
        );
      }
    }
  });

  // 如果有修改，写回文件
  if (fixCount > 0) {
    if (writeFile(pagePath, fixedContent)) {
      console.log(
        `  ✅ Successfully fixed ${fixCount} remaining keys in ${pagePath}`
      );
      return { success: true, fixes: fixCount };
    } else {
      console.error(`  ❌ Failed to write fixed content to ${pagePath}`);
      return { success: false, fixes: 0 };
    }
  } else {
    console.log(`  ℹ️  No remaining fixes needed for ${pagePath}`);
    return { success: true, fixes: 0 };
  }
}

// 获取所有工具页面路径
function getAllToolPages() {
  const pagesDir = path.join(
    process.cwd(),
    'src/app/[locale]/(marketing)/(pages)'
  );
  const toolMapping = getToolPageMapping();
  const toolPages = [];

  try {
    const entries = fs.readdirSync(pagesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const toolName = entry.name;
        const pagePath = path.join(pagesDir, toolName, 'page.tsx');

        if (fs.existsSync(pagePath) && toolMapping[toolName]) {
          toolPages.push({
            toolName,
            pageNamespace: toolMapping[toolName],
            pagePath,
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
  console.log('🔧 VibeTrans Remaining Translation Key Fixer');
  console.log('==========================================\n');

  const toolPages = getAllToolPages();

  if (toolPages.length === 0) {
    console.log('❌ No tool pages found to fix.');
    return;
  }

  console.log(
    `Found ${toolPages.length} tool pages to process for remaining fixes:\n`
  );

  let totalFixes = 0;
  let successCount = 0;

  toolPages.forEach(({ toolName, pageNamespace, pagePath }) => {
    console.log(`📄 Processing remaining: ${toolName}`);
    const result = fixRemainingKeys(pagePath, toolName, pageNamespace);

    if (result.success) {
      successCount++;
      totalFixes += result.fixes;
    }

    console.log(''); // 空行分隔
  });

  console.log('📊 Summary:');
  console.log('============');
  console.log(
    `✅ Successfully processed: ${successCount}/${toolPages.length} pages`
  );
  console.log(`🔧 Total remaining fixes applied: ${totalFixes}`);
  console.log(`⚠️  Failed pages: ${toolPages.length - successCount}`);

  if (totalFixes > 0) {
    console.log('\n🎉 Remaining translation key fixing completed!');
    console.log('💡 Next steps:');
    console.log('   1. Run `pnpm dev` to test the changes');
    console.log('   2. Check a few pages manually for any remaining issues');
    console.log('   3. Run `pnpm build` to ensure no build errors');
  } else {
    console.log('\nℹ️  No remaining translation key fixes were needed.');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  fixRemainingKeys,
  getAllToolPages,
  getToolPageMapping,
  remainingKeyPatterns,
};
