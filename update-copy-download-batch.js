const fs = require('fs');
const path = require('path');

// 需要更新的文件列表（第12-43个页面）
const filesToUpdate = [
  'src/app/[locale]/(marketing)/(pages)/yoda-translator/YodaTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/verbose-generator/VerboseGeneratorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/swahili-to-english-translator/SwahiliToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/samoan-to-english-translator/SamoanToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/pig-latin-translator/PigLatinTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/pig-latin-translator/AlbanianToEnglishTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/ogham-translator/OghamTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/nahuatl-translator/NahuatlTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/middle-english-translator/MiddleEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/japanese-to-english-translator/JapaneseToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/ivr-translator/IvrTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/HighValyrianTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gibberish-translator/GibberishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gen-z-translator/GenZTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gen-alpha-translator/GenAlphaTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/gaster-translator/GasterTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-swahili-translator/EnglishToSwahiliTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-polish-translator/EnglishToPolishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-chinese-translator/EnglishToChineseTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-amharic-translator/EnglishToAmharicTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/dumb-it-down-ai/DumbItDownTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/cuneiform-translator/CuneiformTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/creole-to-english-translator/CreoleToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/chinese-to-english-translator/ChineseToEnglishTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/cantonese-translator/CantoneseTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/baybayin-translator/BaybayinTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/bad-translator/BadTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/baby-translator/BabyTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/aramaic-translator/AramaicTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/ancient-greek-translator/AncientGreekTranslatorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/alien-text-generator/AlienTextGeneratorTool.tsx',
  'src/app/[locale]/(marketing)/(pages)/albanian-to-english/AlbanianToEnglishTool.tsx'
];

// 复制函数的旧模式
const copyOldPattern = /\/\/ Copy[^]*?const handleCopy = async \(\) => \{[^]*?try \{[^]*?await navigator\.clipboard\.writeText\([^)]+\);[^]*?\} catch \(err\) \{[^]*?console\.error\('Failed to copy:', err\);[^]*?\}[^]*?\};/gs;

// 复制函数的新模式
const copyNewPattern = `// Copy - 动态加载
  const handleCopy = async () => {
    if (!outputText && !translatedText) return;

    try {
      // 动态导入复制功能
      const { smartCopyToClipboard } = await import('@/lib/utils/dynamic-copy');

      const textToCopy = outputText || translatedText || '';
      await smartCopyToClipboard(textToCopy, {
        successMessage: 'Translation copied to clipboard!',
        errorMessage: 'Failed to copy translation',
        onSuccess: () => {
          // 可以添加成功提示
        },
        onError: (error) => {
          console.error('Failed to copy:', error);
        }
      });
    } catch (error) {
      console.error('Copy function loading failed:', error);
    }
  };`;

// 下载函数的旧模式
const downloadOldPattern = /\/\/ Download[^]*?const handleDownload = \(\) => \{[^]*?if \(!outputText[^)]*\) return;[^]*?const blob = new Blob\(\[outputText\], \{ type: 'text\/plain' \}\);[^]*?const url = URL\.createObjectURL\(blob\);[^]*?const a = document\.createElement\('a'\);[^]*?a\.href = url;[^]*?a\.download = `[^`]+`;\[^]*?document\.body\.appendChild\(a\);[^]*?a\.click\(\);[^]*?document\.body\.removeChild\(a\);[^]*?URL\.revokeObjectURL\(url\);[^]*?\};/gs;

// 下载函数的新模式
const downloadNewPattern = `// Download - 动态加载
  const handleDownload = async () => {
    if (!outputText && !translatedText) return;

    try {
      // 动态导入下载功能
      const { smartDownload } = await import('@/lib/utils/dynamic-download');

      const textToDownload = outputText || translatedText || '';
      // 根据文件路径推断工具名称
      const filePath = __filename || '';
      const toolName = filePath.split('/').pop()?.replace('.tsx', '') || 'translator';

      smartDownload(textToDownload, toolName, {
        onSuccess: () => {
          // 可以添加成功提示
        },
        onError: (error) => {
          console.error('Download failed:', error);
        }
      });
    } catch (error) {
      console.error('Download function loading failed:', error);
    }
  };`;

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 更新复制函数
    content = content.replace(copyOldPattern, copyNewPattern);

    // 更新下载函数
    content = content.replace(downloadOldPattern, downloadNewPattern);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to update ${filePath}:`, error.message);
    return false;
  }
}

// 批量更新所有文件
console.log('Starting batch update of copy and download functions...\n');

let successCount = 0;
let failCount = 0;

filesToUpdate.forEach(filePath => {
  if (updateFile(filePath)) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log(`\nUpdate complete:`);
console.log(`✓ Successfully updated: ${successCount} files`);
console.log(`✗ Failed to update: ${failCount} files`);