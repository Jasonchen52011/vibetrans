#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 验证翻译键修复效果的脚本
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

// 需要检查的常见无命名空间的键（这些应该已经修复了）
const problematicKeys = [
  "'title'",
  "'description'",
  "'tool.inputLabel'",
  "'tool.translateButton'",
  "'tool.outputLabel'",
  "'examples.title'",
  "'funfacts.title'",
  "'highlights.title'",
  "'whatIs.title'",
  "'howto.title'",
  "'userInterest.title'",
  "'hero.title'",
  "'ctaButton'"
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

// 验证单个页面的翻译键
function verifyPageTranslationKeys(pagePath, toolName, pageNamespace) {
  console.log(`🔍 Verifying: ${toolName} -> ${pageNamespace}`);

  const content = readFile(pagePath);
  if (!content) {
    return { success: false, issues: ['Failed to read file'] };
  }

  const issues = [];

  // 检查是否还有无命名空间的翻译键
  problematicKeys.forEach(key => {
    // 匹配 (t as any)('key') 模式，但排除已经有命名空间的键
    const regex = new RegExp(`\\(t\\s+as\\s+any\\)\\(${key}`, 'g');
    const matches = content.match(regex);

    if (matches) {
      // 检查是否已经有命名空间
      matches.forEach(match => {
        if (!match.includes(pageNamespace)) {
          issues.push(`Found untranslated key: ${match}`);
        }
      });
    }
  });

  // 检查命名空间是否正确设置
  const namespaceMatch = content.match(/namespace:\s*['"`]([^'"`]+)['"`]/);
  if (namespaceMatch) {
    const foundNamespace = namespaceMatch[1];
    if (foundNamespace === 'Metadata') {
      // 检查是否有第二个getTranslations调用用于页面
      const pageNamespaceMatch = content.match(/namespace:\s*['"`]([^'"`]+)['"`](?![^]*?namespace:)/s);
      if (pageNamespaceMatch) {
        const pageNs = pageNamespaceMatch[1];
        if (pageNs !== pageNamespace) {
          issues.push(`Namespace mismatch: expected ${pageNamespace}, found ${pageNs}`);
        }
      }
    } else if (foundNamespace !== pageNamespace) {
      issues.push(`Namespace mismatch: expected ${pageNamespace}, found ${foundNamespace}`);
    }
  }

  if (issues.length === 0) {
    console.log(`  ✅ No translation key issues found`);
    return { success: true, issues: [] };
  } else {
    console.log(`  ⚠️  Found ${issues.length} issues:`);
    issues.forEach(issue => console.log(`    - ${issue}`));
    return { success: false, issues };
  }
}

// 获取所有工具页面路径
function getAllToolPages() {
  const pagesDir = path.join(process.cwd(), 'src/app/[locale]/(marketing)/(pages)');
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
  console.log('🔍 VibeTrans Translation Key Verification');
  console.log('=======================================\n');

  const toolPages = getAllToolPages();

  if (toolPages.length === 0) {
    console.log('❌ No tool pages found to verify.');
    return;
  }

  console.log(`Verifying ${toolPages.length} tool pages:\n`);

  let totalIssues = 0;
  let successCount = 0;

  toolPages.forEach(({ toolName, pageNamespace, pagePath }) => {
    const result = verifyPageTranslationKeys(pagePath, toolName, pageNamespace);

    if (result.success) {
      successCount++;
    } else {
      totalIssues += result.issues.length;
    }

    console.log(''); // 空行分隔
  });

  console.log('📊 Verification Summary:');
  console.log('=========================');
  console.log(`✅ Successfully verified: ${successCount}/${toolPages.length} pages`);
  console.log(`⚠️  Total issues found: ${totalIssues}`);
  console.log(`❌ Failed pages: ${toolPages.length - successCount}`);

  if (totalIssues === 0) {
    console.log('\n🎉 All translation keys have been successfully fixed!');
    console.log('✨ The project is ready for deployment.');
  } else {
    console.log('\n⚠️  Some translation key issues still need to be addressed.');
    console.log('💡 Review the issues above and run the fix scripts again if needed.');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  verifyPageTranslationKeys,
  getAllToolPages,
  getToolPageMapping,
  problematicKeys
};