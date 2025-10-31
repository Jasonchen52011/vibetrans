#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的页面列表
const pages = [
  'src/app/[locale]/(marketing)/(pages)/al-bhed-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/ancient-greek-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/aramaic-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/baybayin-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/chinese-to-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/creole-to-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/cuneiform-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/drow-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-amharic-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-chinese-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/english-to-swahili-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/esperanto-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/gaster-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/greek-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/ivr-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/japanese-to-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/mandalorian-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/manga-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/middle-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/nahuatl-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/ogham-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/rune-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/runic-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/samoan-to-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/swahili-to-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/telugu-to-english-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/verbose-generator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/wingdings-translator/page.tsx',
  'src/app/[locale]/(marketing)/(pages)/yoda-translator/page.tsx'
];

let fixedCount = 0;

pages.forEach(filePath => {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');

    // 检查是否需要修复
    if (content.includes("howToIcons: ['FaFileUpload', 'FaPencilAlt', 'FaLanguage']")) {
      // 替换为4个图标
      content = content.replace(
        /howToIcons: \['FaFileUpload', 'FaPencilAlt', 'FaLanguage'\]/g,
        "howToIcons: ['FaFileUpload', 'FaPencilAlt', 'FaLanguage', 'FaCheckCircle']"
      );

      fs.writeFileSync(fullPath, content);
      console.log(`✓ 修复完成: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`- 无需修复: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ 修复失败 ${filePath}:`, error.message);
  }
});

console.log(`\n修复完成! 总共修复了 ${fixedCount} 个文件。`);