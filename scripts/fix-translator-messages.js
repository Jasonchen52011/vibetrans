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

// 基础字段模板
const baseFields = {
  // 基础UI字段
  inputLabel: "Input Text",
  outputLabel: "Output Text",
  inputPlaceholder: "Type or paste your text here...",
  outputPlaceholder: "Translation will appear here",
  translateButton: "Translate",
  uploadButton: "Upload File",
  uploadHint: "Supported formats: .txt, .docx",
  downloadButton: "Download",
  resetButton: "Reset",
  loading: "Loading...",
  error: "Translation failed, please try again",
  noInput: "Please enter some text",

  // 工具提示字段
  copyTooltip: "Copy",
  downloadTooltip: "Download",
  resetTooltip: "Reset"
};

// 特定标签字段映射
const specificLabels = {
  'al-bhed-translator': {
    alBhedLabel: "Al Bhed",
    alBhedPlaceholder: "Type Al Bhed text here..."
  },
  'albanian-to-english': {
    albanianLabel: "Albanian",
    albanianPlaceholder: "Type Albanian text here..."
  },
  'alien-text-generator': {
    alienLabel: "Alien Text",
    alienPlaceholder: "Type alien text here..."
  },
  'ancient-greek-translator': {
    greekLabel: "Ancient Greek",
    greekPlaceholder: "Type Ancient Greek text here..."
  },
  'aramaic-translator': {
    aramaicLabel: "Aramaic",
    aramaicPlaceholder: "Type Aramaic text here..."
  },
  'baby-translator': {
    babyLabel: "Baby Language",
    babyPlaceholder: "Type baby text here..."
  },
  'baybayin-translator': {
    baybayinLabel: "Baybayin",
    baybayinPlaceholder: "Type Baybayin text here..."
  },
  'cantonese-translator': {
    cantoneseLabel: "Cantonese",
    cantonesePlaceholder: "Type Cantonese text here..."
  },
  'chinese-to-english-translator': {
    chineseLabel: "Chinese",
    chinesePlaceholder: "Type Chinese text here..."
  },
  'creole-to-english-translator': {
    creoleLabel: "Creole",
    creolePlaceholder: "Type Creole text here..."
  },
  'cuneiform-translator': {
    cuneiformLabel: "Cuneiform",
    cuneiformPlaceholder: "Type Cuneiform text here..."
  },
  'dog-translator': {
    dogLabel: "Dog Language",
    dogPlaceholder: "Type dog text here..."
  },
  'esperanto-translator': {
    esperantoLabel: "Esperanto",
    esperantoPlaceholder: "Type Esperanto text here..."
  },
  'gaster-translator': {
    gasterLabel: "Gaster",
    gasterPlaceholder: "Type Gaster text here..."
  },
  'gen-alpha-translator': {
    genAlphaLabel: "Gen Alpha",
    genAlphaPlaceholder: "Type Gen Alpha text here..."
  },
  'gen-z-translator': {
    genZLabel: "Gen Z Slang",
    genZPlaceholder: "Type Gen Z slang here..."
  },
  'gibberish-translator': {
    gibberishLabel: "Gibberish",
    gibberishPlaceholder: "Type Gibberish text here..."
  },
  'high-valyrian-translator': {
    highValyrianLabel: "High Valyrian",
    highValyrianPlaceholder: "Type High Valyrian text here..."
  },
  'ivr-translator': {
    ivrLabel: "IVR",
    ivrPlaceholder: "Type IVR text here..."
  },
  'middle-english-translator': {
    middleEnglishLabel: "Middle English",
    middleEnglishPlaceholder: "Type Middle English text here..."
  },
  'minion-translator': {
    minionLabel: "Minionese",
    minionPlaceholder: "Type Minionese text here..."
  },
  'pig-latin-translator': {
    pigLatinLabel: "Pig Latin",
    pigLatinPlaceholder: "Type Pig Latin text here..."
  },
  'verbose-generator': {
    verboseLabel: "Verbose",
    verbosePlaceholder: "Type verbose text here..."
  }
};

// 特殊按钮文本
const specialButtons = {
  'alien-text-generator': {
    translateButton: "Generate Alien Text"
  },
  'bad-translator': {
    translateButton: "Translate Badly"
  },
  'baby-translator': {
    translateButton: "Analyze Baby Cry"
  },
  'verbose-generator': {
    translateButton: "Generate Verbose Text"
  }
};

// 特殊输入输出标签
const specialLabels = {
  'albanian-to-english': {
    inputLabel: "Albanian",
    outputLabel: "English"
  },
  'alien-text-generator': {
    inputLabel: "Normal Text",
    outputLabel: "Alien Text"
  },
  'baby-translator': {
    inputLabel: "Your Baby's Cry",
    outputLabel: "Translation & Suggestions"
  },
  'chinese-to-english-translator': {
    inputLabel: "Chinese",
    outputLabel: "English"
  },
  'creole-to-english-translator': {
    inputLabel: "Creole",
    outputLabel: "English"
  },
  'gen-z-translator': {
    inputLabel: "Standard English",
    outputLabel: "Standard English"
  },
  'minion-translator': {
    inputLabel: "Input Text",
    outputLabel: "Translated Text"
  }
};

function fixTranslatorMessages(translatorName) {
  const filePath = path.join(__dirname, `../messages/pages/${translatorName}/en.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // 获取页面键名（首字母大写）
    const pageKey = translatorName.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Page';

    if (!data[pageKey] || !data[pageKey].tool) {
      console.log(`${translatorName}: 找不到tool字段`);
      return false;
    }

    const tool = data[pageKey].tool;
    let modified = false;

    // 添加基础字段
    Object.entries(baseFields).forEach(([key, value]) => {
      if (!tool[key]) {
        tool[key] = value;
        modified = true;
      }
    });

    // 添加特定标签字段
    if (specificLabels[translatorName]) {
      Object.entries(specificLabels[translatorName]).forEach(([key, value]) => {
        if (!tool[key]) {
          tool[key] = value;
          modified = true;
        }
      });
    }

    // 添加特殊按钮文本
    if (specialButtons[translatorName]) {
      Object.entries(specialButtons[translatorName]).forEach(([key, value]) => {
        if (tool[key]) {
          tool[key] = value;
          modified = true;
        }
      });
    }

    // 添加特殊标签
    if (specialLabels[translatorName]) {
      Object.entries(specialLabels[translatorName]).forEach(([key, value]) => {
        if (tool[key]) {
          tool[key] = value;
          modified = true;
        }
      });
    }

    if (modified) {
      // 重新格式化JSON
      const updatedContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✓ 已修复: ${translatorName}`);
      return true;
    } else {
      console.log(`- 无需修复: ${translatorName}`);
      return false;
    }

  } catch (error) {
    console.error(`错误处理 ${translatorName}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始修复翻译器消息文件...\n');

  let fixedCount = 0;
  let totalCount = translators.length;

  translators.forEach(translator => {
    if (fixTranslatorMessages(translator)) {
      fixedCount++;
    }
  });

  console.log(`\n修复完成！`);
  console.log(`总计: ${totalCount} 个翻译器`);
  console.log(`已修复: ${fixedCount} 个`);
  console.log(`无需修复: ${totalCount - fixedCount} 个`);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixTranslatorMessages, translators };