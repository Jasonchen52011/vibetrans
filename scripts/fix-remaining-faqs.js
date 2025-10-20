#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的具体FAQ问题
const specificFixes = {
  'alien-text-generator': {
    findPatterns: [
      /The transformed text is highly accurate and maintains its alien style across different platforms\. We ensure that the text appears as intended wherever you use it\./g,
      /The transformed text is highly accurate and maintains its alien style across different platforms and applications\. We ensure that the text appears as intended wherever you use it\./g,
    ],
    replaceWith:
      'The transformed text is highly accurate and maintains its alien style across different platforms. We ensure that the text appears as intended wherever you use it.',
  },
  'baby-translator': {
    findPatterns: [
      /First, record your baby's cry\. Second, upload the recording to VibeTrans\. Third, analyze the results for insights and suggestions\. Finally, apply the advice given\./g,
    ],
    replaceWith:
      "First, record your baby's cry. Second, upload the recording to VibeTrans web tool. Third, analyze the results for insights and suggestions. Finally, apply the advice given.",
  },
  'creole-to-english': {
    findPatterns: [
      /Absolutely\. VibeTrans is trained to recognize cultural expressions, proverbs, idiomatic phrases, and culturally-specific terms in Creole languages\. The tool goes beyond literal translation to capture cultural meaning—understanding Haitian Vodou terminology, Rastafarian expressions in Patois, Caribbean food terms, and community-specific language\. When appropriate, we provide context notes to explain cultural concepts that don't have direct English equivalents\./g,
    ],
    replaceWith:
      "Absolutely. VibeTrans is trained to recognize cultural expressions, proverbs, idiomatic phrases, and culturally-specific terms in Creole languages. The web tool goes beyond literal translation to capture cultural meaning—understanding Haitian Vodou terminology, Rastafarian expressions in Patois, Caribbean food terms, and community-specific language. When appropriate, we provide context notes to explain cultural concepts that don't have direct English equivalents.",
  },
  'cuneiform-translator': {
    findPatterns: [
      /VibeTrans supports three major ancient Mesopotamian languages: Sumerian \(3200-2000 BCE, the oldest known written language\), Akkadian \(2500-100 BCE, Semitic language of Babylonian and Assyrian empires\), and Babylonian \(1895-539 BCE, administrative and literary dialect\)\. Within these, the AI recognizes multiple historical dialects including Old Akkadian, Old Babylonian, Middle Babylonian, Neo-Babylonian, and Neo-Assyrian, applying appropriate grammatical rules and vocabulary for each period\./g,
    ],
    replaceWith:
      'VibeTrans supports three major ancient Mesopotamian languages: Sumerian (3200-2000 BCE, the oldest known written language), Akkadian (2500-100 BCE, Semitic language of Babylonian and Assyrian empires), and Babylonian (1895-539 BCE, administrative and literary dialect). Within these, the web tool recognizes multiple historical dialects including Old Akkadian, Old Babylonian, Middle Babylonian, Neo-Babylonian, and Neo-Assyrian, applying appropriate grammatical rules and vocabulary for each period.',
  },
  'dumb-it-down': {
    findPatterns: [
      /Long texts are simplified in chunks\. The tool processes each part and gives you a unified, simplified result\./g,
    ],
    replaceWith:
      'Long texts are simplified in chunks. The web tool processes each part and gives you a unified, simplified result.',
  },
  'gibberish-translator': {
    findPatterns: [
      /While VibeTrans' Gibberish Translator is optimized for English, it works with any Latin-alphabet text\. The results may vary for other languages, but the phonetic patterns still create fun and playful gibberish\. Give it a try with your preferred language and see what happens!/g,
      /Your privacy is our priority! All translations happen locally in your browser using native JavaScript\. Your text is never sent to any server, ensuring complete privacy and security\. You can use VibeTrans with confidence, knowing your data stays with you\./g,
    ],
    replaceWith: [
      "While VibeTrans' Gibberish Translator is optimized for English, it works with any Latin-alphabet text. The results may vary for other languages, but the phonetic patterns still create fun and playful gibberish. Give it a try with your preferred language and see what happens!",
      'Your privacy is our priority! All translations happen locally in your browser using native JavaScript. Your text is never sent to any server, ensuring complete privacy and security. You can use VibeTrans web tool with confidence, knowing your data stays with you.',
    ],
  },
  home: {
    findPatterns: [
      /Step 1: Choose the appropriate translation tool based on your needs\.\nStep 2: Make sure your text is clear and free of slang or complicated phrases\.\nStep 3: Input your text into the system and click 'Translate\.'\nStep 4: Double-check the translation for nuances or cultural differences to ensure accuracy\./g,
    ],
    replaceWith:
      "Step 1: Choose the appropriate translation web tool based on your needs.\nStep 2: Make sure your text is clear and free of slang or complicated phrases.\nStep 3: Input your text into the system and click 'Translate.'\nStep 4: Double-check the translation for nuances or cultural differences to ensure accuracy.",
  },
  'samoan-to-english-translator': {
    findPatterns: [
      /The translator is designed to recognize and translate common Samoan idioms into English, providing context-appropriate meanings\. However, idioms can be complex, and accuracy may vary\. For best results, cross-reference with native speakers or additional resources if you encounter unusual phrases\./g,
    ],
    replaceWith:
      'The web tool is designed to recognize and translate common Samoan idioms into English, providing context-appropriate meanings. However, idioms can be complex, and accuracy may vary. For best results, cross-reference with native speakers or additional resources if you encounter unusual phrases.',
  },
};

console.log('🔧 开始精确修复剩余的FAQ问题...\n');

const pagesDir = path.join(__dirname, '..', 'messages', 'pages');
let fixedCount = 0;

Object.entries(specificFixes).forEach(([pageName, fixes]) => {
  const enJsonPath = path.join(pagesDir, pageName, 'en.json');

  if (!fs.existsSync(enJsonPath)) {
    console.log(`⚠️  跳过 ${pageName} - 文件不存在`);
    return;
  }

  try {
    let content = fs.readFileSync(enJsonPath, 'utf8');
    let hasChanges = false;

    // 应用具体的修复规则
    fixes.findPatterns.forEach((pattern, index) => {
      const beforeReplace = content;
      const replaceWith = Array.isArray(fixes.replaceWith)
        ? fixes.replaceWith[index]
        : fixes.replaceWith;

      content = content.replace(pattern, replaceWith);
      if (beforeReplace !== content) {
        hasChanges = true;
        console.log(`  ✅ 修复了 ${pageName} 中的问题内容`);
      }
    });

    // 如果有修改，写回文件
    if (hasChanges) {
      fs.writeFileSync(enJsonPath, content);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ 修复 ${pageName} 失败:`, error.message);
  }
});

console.log(`\n📊 精确修复完成:`);
console.log(`- 成功修复页面数: ${fixedCount}`);
console.log(`- 总处理页面数: ${Object.keys(specificFixes).length}`);

if (fixedCount > 0) {
  console.log('\n🎉 剩余FAQ问题已成功修复！');
} else {
  console.log('\nℹ️  所有页面都已经干净，无需修复。');
}
