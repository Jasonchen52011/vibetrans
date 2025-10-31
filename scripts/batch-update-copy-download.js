const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const filesToUpdate = [
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/pig-latin-translator/PigLatinTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/pig-latin-translator/AlbanianToEnglishTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/ogham-translator/OghamTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/nahuatl-translator/NahuatlTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/middle-english-translator/MiddleEnglishTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/japanese-to-english-translator/JapaneseToEnglishTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/ivr-translator/IvrTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/HighValyrianTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/gibberish-translator/GibberishTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/gen-z-translator/GenZTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/gen-alpha-translator/GenAlphaTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/gaster-translator/GasterTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/english-to-swahili-translator/EnglishToSwahiliTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/english-to-polish-translator/EnglishToPolishTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/english-to-chinese-translator/EnglishToChineseTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/english-to-amharic-translator/EnglishToAmharicTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/dumb-it-down-ai/DumbItDownTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/cuneiform-translator/CuneiformTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/creole-to-english-translator/CreoleToEnglishTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/chinese-to-english-translator/ChineseToEnglishTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/cantonese-translator/CantoneseTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/baybayin-translator/BaybayinTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/bad-translator/BadTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/baby-translator/BabyTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/aramaic-translator/AramaicTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/ancient-greek-translator/AncientGreekTranslatorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/alien-text-generator/AlienTextGeneratorTool.tsx',
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)/albanian-to-english/AlbanianToEnglishTool.tsx',
];

// 从文件路径提取工具名称的函数
function extractToolName(filePath) {
  const match = filePath.match(/\/([^\/]+)\/[^\/]*Tool\.tsx$/);
  if (match) {
    return match[1];
  }
  return 'unknown-tool';
}

// 更新函数
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const toolName = extractToolName(filePath);

    // 替换复制函数
    const copyFunctionRegex =
      /\/\/ Copy\s*\n\s*const handleCopy = async \(\) => \{\s*\n\s*if \(!outputText\) return;\s*\n\s*try \{\s*\n\s*await navigator\.clipboard\.writeText\(outputText\);\s*\n\s*\} catch \(err\) \{\s*\n\s*console\.error\('Failed to copy:', err\);\s*\n\s*\}\s*\n\s*\};/g;

    const newCopyFunction = `// Copy\n  const handleCopy = async () => {\n    if (!outputText) return;\n    try {\n      const { smartCopyToClipboard } = await import('@/lib/utils/dynamic-copy');\n      await smartCopyToClipboard(outputText, {\n        successMessage: 'Translation copied to clipboard!',\n        errorMessage: 'Failed to copy translation',\n        onSuccess: () => {},\n        onError: (error) => console.error('Failed to copy:', error)\n      });\n    } catch (error) {\n      console.error('Copy function loading failed:', error);\n    }\n  };`;

    if (copyFunctionRegex.test(content)) {
      content = content.replace(copyFunctionRegex, newCopyFunction);
      console.log(`✅ Updated copy function in ${toolName}`);
    } else {
      console.log(`⚠️  Copy function pattern not found in ${toolName}`);
    }

    // 替换下载函数
    const downloadFunctionRegex =
      /\/\/ Download\s*\n\s*const handleDownload = (\(\) => \{|\async \(\) => \{)\s*\n\s*if \(!outputText\) return;\s*\n\s*const blob = new Blob\(\[outputText\], \{ type: 'text\/plain' \}\);\s*\n\s*const url = URL\.createObjectURL\(blob\);\s*\n\s*const a = document\.createElement\('a'\);\s*\n\s*a\.href = url;\s*\n\s*a\.download = `[^`]+`;\s*\n\s*document\.body\.appendChild\(a\);\s*\n\s*a\.click\(\);\s*\n\s*document\.body\.removeChild\(a\);\s*\n\s*URL\.revokeObjectURL\(url\);\s*\n\s*\};/g;

    const newDownloadFunction = `// Download\n  const handleDownload = async () => {\n    if (!outputText) return;\n    try {\n      const { smartDownload } = await import('@/lib/utils/dynamic-download');\n      smartDownload(outputText, '${toolName}', {\n        onSuccess: () => {},\n        onError: (error) => console.error('Download failed:', error)\n      });\n    } catch (error) {\n      console.error('Download function loading failed:', error);\n    }\n  };`;

    if (downloadFunctionRegex.test(content)) {
      content = content.replace(downloadFunctionRegex, newDownloadFunction);
      console.log(`✅ Updated download function in ${toolName}`);
    } else {
      console.log(`⚠️  Download function pattern not found in ${toolName}`);
    }

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 Successfully updated ${toolName}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// 批量更新所有文件
console.log('🚀 Starting batch update of copy and download functions...\n');

filesToUpdate.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    updateFile(filePath);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n✅ Batch update completed!');
