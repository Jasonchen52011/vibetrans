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

console.log('🔧 修复funfacts字段名...\n');

let fixedCount = 0;

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
    if (data[pageKey] && data[pageKey].funFacts) {
      // 将 funFacts 重命名为 funfacts
      data[pageKey].funfacts = data[pageKey].funFacts;
      delete data[pageKey].funFacts;

      fs.writeFileSync(messagePath, JSON.stringify(data, null, 2));
      console.log(`✅ ${translator}: 修复字段名 funFacts → funfacts`);
      fixedCount++;
    } else {
      console.log(`ℹ️ ${translator}: 无funFacts字段，跳过`);
    }
  } catch (error) {
    console.log(`❌ ${translator}: 修复失败 - ${error.message}`);
  }
});

console.log(`\n📊 完成! 修复了 ${fixedCount} 个翻译器的字段名`);
