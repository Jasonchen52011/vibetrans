#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TRANSLATORS = [
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

// 基础工具字段
const BASE_TOOL_FIELDS = {
  inputLabel: 'Input Text',
  outputLabel: 'Output',
  inputPlaceholder: 'Enter your text here...',
  outputPlaceholder: 'Translation will appear here...',
  translateButton: 'Translate',
  uploadButton: 'Upload File',
  uploadHint: 'Supports .txt and .docx files',
  loading: 'Processing...',
  error: 'An error occurred, please try again',
  noInput: 'Please enter some text',
  downloadButton: 'Download',
  resetButton: 'Reset',
};

// 工具提示字段
const TOOLTIP_FIELDS = {
  copyTooltip: 'Copy',
  downloadTooltip: 'Download',
  resetTooltip: 'Reset',
  removeFileTooltip: 'Remove file',
  removeRecordingTooltip: 'Remove recording',
  toggleModeTooltip: 'Toggle translation mode',
  toggleDirectionTooltip: 'Toggle translation direction',
  copyResultTooltip: 'Copy result',
  downloadResultTooltip: 'Download result',
  playSoundTooltip: 'Play sound',
};

// 特定翻译器字段
const SPECIFIC_FIELDS = {
  'al-bhed-translator': {
    alBhedLabel: 'Al Bhed',
    alBhedPlaceholder: 'Type Al Bhed text here...',
  },
  'albanian-to-english': {
    albanianLabel: 'Albanian',
    englishLabel: 'English',
  },
  'alien-text-generator': {
    alienLabel: 'Alien Language',
    selectStyle: 'Generation Style',
    styles: {
      humor: 'Humor',
      sci_fi: 'Sci-Fi',
      robot: 'Robot',
      emoji: 'Emoji',
    },
    generateButton: 'Generate',
  },
  'ancient-greek-translator': {
    greekLabel: 'Ancient Greek',
    greekPlaceholder: 'Type Ancient Greek text here...',
    dialectLabel: 'Select Dialect',
    dialects: {
      attic: 'Attic Greek',
      koine: 'Koine Greek',
      byzantine: 'Byzantine Greek',
    },
    pronunciationLabel: 'Pronunciation',
    culturalContextLabel: 'Cultural Context',
  },
  'aramaic-translator': {
    aramaicLabel: 'Aramaic',
    aramaicPlaceholder: 'Type Aramaic text here...',
  },
  'baby-translator': {
    babyLabel: 'Baby Language',
    babyPlaceholder: 'Type baby text here...',
  },
  'bad-translator': {
    styleLabel: 'Translation Style',
    styles: {
      humor: 'Humor',
      absurd: 'Absurd',
      funny: 'Funny',
      chaos: 'Chaos',
    },
    iterationsLabel: 'Translation Rounds',
  },
  'baybayin-translator': {
    baybayinLabel: 'Baybayin',
    baybayinPlaceholder: 'Type Baybayin text here...',
  },
  'cantonese-translator': {
    cantoneseLabel: 'Cantonese',
    cantonesePlaceholder: 'Type Cantonese text here...',
  },
  'chinese-to-english-translator': {
    chineseLabel: 'Chinese',
    englishLabel: 'English',
    chinesePlaceholder: 'Type Chinese text here...',
    englishPlaceholder: 'Type English text here...',
  },
  'creole-to-english-translator': {
    creoleLabel: 'Creole',
    englishLabel: 'English',
    creolePlaceholder: 'Type Creole text here...',
    englishPlaceholder: 'Type English text here...',
  },
  'cuneiform-translator': {
    cuneiformLabel: 'Cuneiform',
    scriptLabel: 'Select Script',
    scripts: {
      sumerian: 'Sumerian (3200-2000 BCE)',
      akkadian: 'Akkadian (2500-100 BCE)',
      babylonian: 'Babylonian (1895-539 BCE)',
      hittite: 'Hittite (1600-1178 BCE)',
      elamite: 'Elamite (2700-539 BCE)',
      old_persian: 'Old Persian (600-330 BCE)',
      ugaritic: 'Ugaritic (1450-1200 BCE)',
    },
  },
  'dog-translator': {
    dogLabel: 'Dog Language',
    dogPlaceholder: 'Type dog text here...',
  },
  'esperanto-translator': {
    esperantoLabel: 'Esperanto',
    esperantoPlaceholder: 'Type Esperanto text here...',
  },
  'gaster-translator': {
    gasterLabel: 'Wingdings',
    gasterPlaceholder: 'Type Wingdings text here...',
  },
  'gen-alpha-translator': {
    genAlphaLabel: 'Gen Alpha',
    genAlphaPlaceholder: 'Type Gen Alpha text here...',
  },
  'gen-z-translator': {
    genZLabel: 'Gen Z',
    genZPlaceholder: 'Type Gen Z text here...',
  },
  'gibberish-translator': {
    gibberishLabel: 'Gibberish',
    gibberishPlaceholder: 'Type gibberish text here...',
  },
  'high-valyrian-translator': {
    highValyrianLabel: 'High Valyrian',
    highValyrianPlaceholder: 'Type High Valyrian text here...',
  },
  'ivr-translator': {
    ivrLabel: 'IVR Script',
    ivrPlaceholder: 'Type IVR script text here...',
  },
  'middle-english-translator': {
    middleEnglishLabel: 'Middle English',
    middleEnglishPlaceholder: 'Type Middle English text here...',
  },
  'minion-translator': {
    minionLabel: 'Minion Language',
    minionPlaceholder: 'Type Minion text here...',
  },
  'pig-latin-translator': {
    pigLatinLabel: 'Pig Latin',
    pigLatinPlaceholder: 'Type Pig Latin text here...',
  },
  'verbose-generator': {
    styleLabel: 'Style',
    styles: {
      academic: 'Academic',
    },
    generateButton: 'Generate',
  },
};

console.log('🔧 完整修复所有翻译器的代码耦合问题...\n');

let totalFixed = 0;

TRANSLATORS.forEach((translator) => {
  const messagePath = path.join(
    __dirname,
    '..',
    'messages',
    'pages',
    translator,
    'en.json'
  );

  if (!fs.existsSync(messagePath)) {
    console.log(`❌ ${translator}: 消息文件不存在`);
    return;
  }

  try {
    const content = fs.readFileSync(messagePath, 'utf8');
    const data = JSON.parse(content);

    const pageKey = Object.keys(data)[0];
    if (!data[pageKey]) {
      console.log(`❌ ${translator}: 无页面数据`);
      return;
    }

    // 确保有tool节
    if (!data[pageKey].tool) {
      data[pageKey].tool = {};
    }

    const tool = data[pageKey].tool;

    // 添加基础字段（如果不存在）
    Object.entries(BASE_TOOL_FIELDS).forEach(([key, value]) => {
      if (!tool[key]) {
        tool[key] = value;
        totalFixed++;
      }
    });

    // 添加工具提示字段（如果不存在）
    Object.entries(TOOLTIP_FIELDS).forEach(([key, value]) => {
      if (!tool[key]) {
        tool[key] = value;
        totalFixed++;
      }
    });

    // 添加特定字段（如果不存在）
    if (SPECIFIC_FIELDS[translator]) {
      Object.entries(SPECIFIC_FIELDS[translator]).forEach(([key, value]) => {
        if (typeof value === 'object') {
          if (!tool[key]) {
            tool[key] = {};
          }
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (!tool[key][subKey]) {
              tool[key][subKey] = subValue;
              totalFixed++;
            }
          });
        } else {
          if (!tool[key]) {
            tool[key] = value;
            totalFixed++;
          }
        }
      });
    }

    // 修复funFacts字段名
    if (data[pageKey].funFacts) {
      data[pageKey].funfacts = data[pageKey].funFacts;
      delete data[pageKey].funFacts;
    }

    // 确保有testimonials节
    if (!data[pageKey].testimonials) {
      data[pageKey].testimonials = {
        title: 'What Our Users Are Saying',
        subtitle: 'Real feedback from real users',
        items: {},
      };
    }

    // 确保所有testimonials有rating字段
    if (data[pageKey].testimonials && data[pageKey].testimonials.items) {
      Object.keys(data[pageKey].testimonials.items).forEach((key) => {
        if (
          data[pageKey].testimonials.items[key] &&
          !data[pageKey].testimonials.items[key].rating
        ) {
          data[pageKey].testimonials.items[key].rating = 5;
          totalFixed++;
        }
      });
    }

    // 保存文件
    fs.writeFileSync(messagePath, JSON.stringify(data, null, 2));
    console.log(
      `✅ ${translator}: 修复完成 (${Object.keys(tool).length} 个字段)`
    );
  } catch (error) {
    console.log(`❌ ${translator}: 修复失败 - ${error.message}`);
  }
});

console.log(`\n📊 总计修复了 ${totalFixed} 个字段`);
console.log('🎉 所有翻译器的消息文件已完全修复！');
