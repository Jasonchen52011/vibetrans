const fs = require('fs');
const path = require('path');

// 所有翻译器列表
const translators = [
  'al-bhed-translator',
  'albanian-to-english',
  'alien-text-generator',
  'ancient-greek-translator',
  'aramaic-translator',
  'baby-translator',
  'bad-translator',
  'baybayin-translator',
  'cantonese-translator',
  'chinese-to-english-translator',
  'creole-to-english-translator',
  'cuneiform-translator',
  'dog-translator',
  'esperanto-translator',
  'gaster-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'gibberish-translator',
  'high-valyrian-translator',
  'ivr-translator',
  'middle-english-translator',
  'minion-translator',
  'pig-latin-translator',
  'verbose-generator',
];

// 需要替换的硬编码文本映射
const hardcodedReplacements = [
  {
    pattern: /aria-label="Input text"/g,
    replacement: 'aria-label={pageData.tool.inputLabel || "Input text"}',
  },
  {
    pattern: /title="Copy"/g,
    replacement: 'title={pageData.tool.copyTooltip || "Copy"}',
  },
  {
    pattern: /title="Download"/g,
    replacement: 'title={pageData.tool.downloadTooltip || "Download"}',
  },
  {
    pattern: /title="Reset"/g,
    replacement: 'title={pageData.tool.resetTooltip || "Reset"}',
  },
  {
    pattern: /placeholder="Enter your text here\.\.\."/g,
    replacement:
      'placeholder={pageData.tool.inputPlaceholder || "Enter your text here..."}',
  },
  {
    pattern: /placeholder="Translation will appear here"/g,
    replacement:
      'placeholder={pageData.tool.outputPlaceholder || "Translation will appear here"}',
  },
  {
    pattern: /placeholder="Type or paste your text here\.\.\."/g,
    replacement:
      'placeholder={pageData.tool.inputPlaceholder || "Type or paste your text here..."}',
  },
];

function fixTranslatorComponent(translatorName) {
  const filePath = path.join(
    __dirname,
    `../src/app/[locale]/(marketing)/(pages)/${translatorName}/${getComponentName(translatorName)}.tsx`
  );

  if (!fs.existsSync(filePath)) {
    console.log(`组件文件不存在: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 应用所有替换规则
    hardcodedReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    // 检查是否还有其他硬编码文本需要修复
    const hardcodedPatterns = [
      { pattern: /aria-label="[^"]*"/g, type: 'aria-label' },
      { pattern: /title="[^"]*"/g, type: 'title' },
      { pattern: /placeholder="[^"]*"/g, type: 'placeholder' },
    ];

    hardcodedPatterns.forEach(({ pattern, type }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // 检查是否已经被修复（包含 pageData）
          if (!match.includes('pageData.tool.') && !match.includes('||')) {
            console.log(`  发现未修复的 ${type}: ${match}`);
          }
        });
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ 已修复组件: ${translatorName}`);
      return true;
    } else {
      console.log(`- 组件无需修复: ${translatorName}`);
      return false;
    }
  } catch (error) {
    console.error(`错误处理组件 ${translatorName}:`, error.message);
    return false;
  }
}

function getComponentName(translatorName) {
  // 将翻译器名称转换为组件名称
  const nameMap = {
    'al-bhed-translator': 'AlBhedTranslatorTool',
    'albanian-to-english': 'AlbanianToEnglishTool',
    'alien-text-generator': 'AlienTextGeneratorTool',
    'ancient-greek-translator': 'AncientGreekTranslatorTool',
    'aramaic-translator': 'AramaicTranslatorTool',
    'baby-translator': 'BabyTranslatorTool',
    'bad-translator': 'BadTranslatorTool',
    'baybayin-translator': 'BaybayinTranslatorTool',
    'cantonese-translator': 'CantoneseTranslatorTool',
    'chinese-to-english-translator': 'ChineseToEnglishTranslatorTool',
    'creole-to-english-translator': 'CreoleToEnglishTranslatorTool',
    'cuneiform-translator': 'CuneiformTranslatorTool',
    'dog-translator': 'DogTranslatorTool',
    'esperanto-translator': 'EsperantoTranslatorTool',
    'gaster-translator': 'GasterTranslatorTool',
    'gen-alpha-translator': 'GenAlphaTranslatorTool',
    'gen-z-translator': 'GenZTranslatorTool',
    'gibberish-translator': 'GibberishTranslatorTool',
    'high-valyrian-translator': 'HighValyrianTranslatorTool',
    'ivr-translator': 'IvrTranslatorTool',
    'middle-english-translator': 'MiddleEnglishTranslatorTool',
    'minion-translator': 'MinionTranslatorTool',
    'pig-latin-translator': 'PigLatinTranslatorTool',
    'verbose-generator': 'VerboseGeneratorTool',
  };

  return (
    nameMap[translatorName] ||
    `${translatorName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')}Tool`
  );
}

// 主函数
function main() {
  console.log('开始修复翻译器组件文件...\n');

  let fixedCount = 0;
  const totalCount = translators.length;

  translators.forEach((translator) => {
    if (fixTranslatorComponent(translator)) {
      fixedCount++;
    }
  });

  console.log(`\n组件修复完成！`);
  console.log(`总计: ${totalCount} 个翻译器`);
  console.log(`已修复: ${fixedCount} 个`);
  console.log(`无需修复: ${totalCount - fixedCount} 个`);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixTranslatorComponent, translators };
