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
  'verbose-generator'
];

// 额外的硬编码文本映射
const additionalReplacements = [
  {
    pattern: /aria-label="Remove file"/g,
    replacement: 'aria-label={pageData.tool.removeFileTooltip || "Remove file"}'
  },
  {
    pattern: /aria-label="Remove recording"/g,
    replacement: 'aria-label={pageData.tool.removeRecordingTooltip || "Remove recording"}'
  },
  {
    pattern: /aria-label="Toggle translation mode"/g,
    replacement: 'aria-label={pageData.tool.toggleModeTooltip || "Toggle translation mode"}'
  },
  {
    pattern: /aria-label="Toggle translation direction"/g,
    replacement: 'aria-label={pageData.tool.toggleDirectionTooltip || "Toggle translation direction"}'
  },
  {
    pattern: /aria-label="Copy result"/g,
    replacement: 'aria-label={pageData.tool.copyResultTooltip || "Copy result"}'
  },
  {
    pattern: /aria-label="Download result"/g,
    replacement: 'aria-label={pageData.tool.downloadResultTooltip || "Download result"}'
  },
  {
    pattern: /aria-label="Your words to translate"/g,
    replacement: 'aria-label={pageData.tool.inputLabel || "Your words to translate"}'
  },
  {
    pattern: /aria-label="Play generated dog sound"/g,
    replacement: 'aria-label={pageData.tool.playSoundTooltip || "Play sound"}'
  },
  {
    pattern: /placeholder="Enter English text to convert to Gaster\.\.\."/g,
    replacement: 'placeholder={pageData.tool.inputPlaceholder || "Enter English text to convert to Gaster..."}'
  }
];

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
    'verbose-generator': 'VerboseGeneratorTool'
  };

  return nameMap[translatorName] || `${translatorName.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}Tool`;
}

function updateMessageFilesWithAdditionalFields() {
  console.log('添加额外的工具提示字段到消息文件...\n');

  const additionalTooltipFields = {
    removeFileTooltip: "Remove file",
    removeRecordingTooltip: "Remove recording",
    toggleModeTooltip: "Toggle translation mode",
    toggleDirectionTooltip: "Toggle translation direction",
    copyResultTooltip: "Copy result",
    downloadResultTooltip: "Download result",
    playSoundTooltip: "Play sound"
  };

  let updatedCount = 0;

  translators.forEach(translator => {
    const filePath = path.join(__dirname, `../messages/pages/${translator}/en.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`消息文件不存在: ${filePath}`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // 获取页面键名
      const pageKey = translator.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('') + 'Page';

      if (!data[pageKey] || !data[pageKey].tool) {
        console.log(`${translator}: 找不到tool字段`);
        return;
      }

      const tool = data[pageKey].tool;
      let modified = false;

      // 添加额外的工具提示字段
      Object.entries(additionalTooltipFields).forEach(([key, value]) => {
        if (!tool[key]) {
          tool[key] = value;
          modified = true;
        }
      });

      if (modified) {
        const updatedContent = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✓ 已添加额外字段: ${translator}`);
        updatedCount++;
      } else {
        console.log(`- 无需添加字段: ${translator}`);
      }

    } catch (error) {
      console.error(`错误处理消息文件 ${translator}:`, error.message);
    }
  });

  console.log(`\n额外字段添加完成！已更新: ${updatedCount} 个翻译器`);
}

function fixRemainingHardcodedText(translatorName) {
  const filePath = path.join(__dirname, `../src/app/[locale]/(marketing)/(pages)/${translatorName}/${getComponentName(translatorName)}.tsx`);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 应用额外的替换规则
    additionalReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ 已修复额外硬编码文本: ${translatorName}`);
      return true;
    }

  } catch (error) {
    console.error(`错误处理组件 ${translatorName}:`, error.message);
  }

  return false;
}

// 主函数
function main() {
  console.log('修复剩余硬编码文本...\n');

  // 首先更新消息文件
  updateMessageFilesWithAdditionalFields();

  console.log('\n开始修复组件中的剩余硬编码文本...\n');

  let fixedCount = 0;
  translators.forEach(translator => {
    if (fixRemainingHardcodedText(translator)) {
      fixedCount++;
    }
  });

  console.log(`\n剩余硬编码文本修复完成！`);
  console.log(`已修复: ${fixedCount} 个翻译器`);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixRemainingHardcodedText, updateMessageFilesWithAdditionalFields };