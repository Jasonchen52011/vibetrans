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

// 必需的基础字段
const requiredFields = [
  'inputLabel',
  'outputLabel',
  'inputPlaceholder',
  'outputPlaceholder',
  'translateButton',
  'uploadButton',
  'uploadHint',
  'downloadButton',
  'resetButton',
  'loading',
  'error',
  'noInput',
  'copyTooltip',
  'downloadTooltip',
  'resetTooltip'
];

// 必需的额外工具提示字段
const requiredTooltipFields = [
  'removeFileTooltip',
  'removeRecordingTooltip',
  'toggleModeTooltip',
  'toggleDirectionTooltip',
  'copyResultTooltip',
  'downloadResultTooltip',
  'playSoundTooltip'
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

function checkMessageFile(translatorName) {
  const filePath = path.join(__dirname, `../messages/pages/${translatorName}/en.json`);

  if (!fs.existsSync(filePath)) {
    return {
      exists: false,
      missing: ['File not found'],
      hardcoded: []
    };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // 获取页面键名，处理特殊情况
    let pageKey;
    if (translatorName === 'creole-to-english-translator') {
      pageKey = 'CreoleToEnglishPage';
    } else {
      pageKey = translatorName.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('') + 'Page';
    }

    if (!data[pageKey] || !data[pageKey].tool) {
      return {
        exists: true,
        missing: ['tool field not found'],
        hardcoded: []
      };
    }

    const tool = data[pageKey].tool;
    const missing = [];

    // 检查必需的基础字段
    requiredFields.forEach(field => {
      if (!tool[field]) {
        missing.push(field);
      }
    });

    // 检查必需的工具提示字段
    requiredTooltipFields.forEach(field => {
      if (!tool[field]) {
        missing.push(field);
      }
    });

    // 检查特定标签字段
    const specificLabelFields = getSpecificLabelFields(translatorName);
    specificLabelFields.forEach(field => {
      if (!tool[field]) {
        missing.push(field);
      }
    });

    return {
      exists: true,
      missing: missing,
      hardcoded: []
    };

  } catch (error) {
    return {
      exists: false,
      missing: ['Error parsing file'],
      hardcoded: []
    };
  }
}

function getSpecificLabelFields(translatorName) {
  const labelMap = {
    'al-bhed-translator': ['alBhedLabel', 'alBhedPlaceholder'],
    'albanian-to-english': ['albanianLabel', 'albanianPlaceholder'],
    'alien-text-generator': ['alienLabel', 'alienPlaceholder'],
    'ancient-greek-translator': ['greekLabel', 'greekPlaceholder'],
    'aramaic-translator': ['aramaicLabel', 'aramaicPlaceholder'],
    'baby-translator': ['babyLabel', 'babyPlaceholder'],
    'baybayin-translator': ['baybayinLabel', 'baybayinPlaceholder'],
    'cantonese-translator': ['cantoneseLabel', 'cantonesePlaceholder'],
    'chinese-to-english-translator': ['chineseLabel', 'chinesePlaceholder'],
    'creole-to-english-translator': ['creoleLabel', 'creolePlaceholder'],
    'cuneiform-translator': ['cuneiformLabel', 'cuneiformPlaceholder'],
    'dog-translator': ['dogLabel', 'dogPlaceholder'],
    'esperanto-translator': ['esperantoLabel', 'esperantoPlaceholder'],
    'gaster-translator': ['gasterLabel', 'gasterPlaceholder'],
    'gen-alpha-translator': ['genAlphaLabel', 'genAlphaPlaceholder'],
    'gen-z-translator': ['genZLabel', 'genZPlaceholder'],
    'gibberish-translator': ['gibberishLabel', 'gibberishPlaceholder'],
    'high-valyrian-translator': ['highValyrianLabel', 'highValyrianPlaceholder'],
    'ivr-translator': ['ivrLabel', 'ivrPlaceholder'],
    'middle-english-translator': ['middleEnglishLabel', 'middleEnglishPlaceholder'],
    'minion-translator': ['minionLabel', 'minionPlaceholder'],
    'pig-latin-translator': ['pigLatinLabel', 'pigLatinPlaceholder'],
    'verbose-generator': ['verboseLabel', 'verbosePlaceholder']
  };

  return labelMap[translatorName] || [];
}

function checkComponentFile(translatorName) {
  const filePath = path.join(__dirname, `../src/app/[locale]/(marketing)/(pages)/${translatorName}/${getComponentName(translatorName)}.tsx`);

  if (!fs.existsSync(filePath)) {
    return {
      exists: false,
      missing: [],
      hardcoded: ['Component file not found']
    };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hardcoded = [];

    // 检查常见的硬编码模式
    const hardcodedPatterns = [
      { pattern: /aria-label="[^"]*(?!\s*\|\|)/g, desc: 'aria-label hardcoded' },
      { pattern: /title="[^"]*(?!\s*\|\|)/g, desc: 'title hardcoded' },
      { pattern: /placeholder="[^"]*(?!\s*\|\|)/g, desc: 'placeholder hardcoded' }
    ];

    hardcodedPatterns.forEach(({ pattern, desc }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // 排除已经被修复的情况
          if (!match.includes('pageData.tool.') && !match.includes('className=')) {
            hardcoded.push(`${desc}: ${match}`);
          }
        });
      }
    });

    return {
      exists: true,
      missing: [],
      hardcoded: hardcoded
    };

  } catch (error) {
    return {
      exists: false,
      missing: [],
      hardcoded: ['Error reading component file']
    };
  }
}

function generateReport() {
  console.log('🔍 翻译器代码耦合问题修复验证报告\n');
  console.log('=' .repeat(80));

  let totalMissing = 0;
  let totalHardcoded = 0;
  let perfectCount = 0;

  const results = translators.map(translator => {
    const messageCheck = checkMessageFile(translator);
    const componentCheck = checkComponentFile(translator);

    const missingCount = messageCheck.missing.length;
    const hardcodedCount = componentCheck.hardcoded.length;
    const isPerfect = missingCount === 0 && hardcodedCount === 0;

    if (isPerfect) perfectCount++;

    totalMissing += missingCount;
    totalHardcoded += hardcodedCount;

    return {
      translator,
      messageCheck,
      componentCheck,
      missingCount,
      hardcodedCount,
      isPerfect
    };
  });

  // 按状态排序
  results.sort((a, b) => {
    if (a.isPerfect && !b.isPerfect) return 1;
    if (!a.isPerfect && b.isPerfect) return -1;
    return (b.missingCount + b.hardcodedCount) - (a.missingCount + a.hardcodedCount);
  });

  // 输出报告
  console.log(`📊 总体统计:`);
  console.log(`- 总翻译器数量: ${translators.length}`);
  console.log(`- 完全修复: ${perfectCount} 个`);
  console.log(`- 仍有问题: ${translators.length - perfectCount} 个`);
  console.log(`- 总缺失字段: ${totalMissing} 个`);
  console.log(`- 总硬编码文本: ${totalHardcoded} 个\n`);

  console.log('📋 详细结果:');
  console.log('-'.repeat(80));

  results.forEach(result => {
    const status = result.isPerfect ? '✅' : '⚠️';
    console.log(`${status} ${result.translator}`);

    if (result.missingCount > 0) {
      console.log(`   缺失字段 (${result.missingCount}): ${result.messageCheck.missing.slice(0, 3).join(', ')}${result.messageCheck.missing.length > 3 ? '...' : ''}`);
    }

    if (result.hardcodedCount > 0) {
      console.log(`   硬编码文本 (${result.hardcodedCount}): ${result.componentCheck.hardcoded.slice(0, 2).join(', ')}${result.componentCheck.hardcoded.length > 2 ? '...' : ''}`);
    }

    if (result.isPerfect) {
      console.log('   ✨ 完全修复');
    }

    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`🎯 修复完成度: ${((perfectCount / translators.length) * 100).toFixed(1)}%`);

  if (perfectCount === translators.length) {
    console.log('🎉 所有翻译器已完全修复！');
  } else {
    console.log(`⚠️  还有 ${translators.length - perfectCount} 个翻译器需要进一步修复`);
  }

  return {
    total: translators.length,
    perfect: perfectCount,
    needsWork: translators.length - perfectCount,
    completionRate: (perfectCount / translators.length) * 100
  };
}

// 主函数
function main() {
  generateReport();
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { generateReport, checkMessageFile, checkComponentFile };