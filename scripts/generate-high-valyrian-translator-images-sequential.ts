#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrationsSequential } from '../src/lib/article-illustrator/workflow-sequential-high-valyrian';

const sections: ArticleSections = {
  toolName: 'high-valyrian-translator',
  whatIs: {
    title: 'What is High Valyrian Translator',
    content:
      "High Valyrian Translator is an innovative tool designed to translate High Valyrian, a fictional language from the world of 'Game of Thrones'. Powered by VibeTrans, it offers users an engaging way to explore this ancient tongue. Whether you're a fan looking to enhance your experience or a language enthusiast eager to learn, High Valyrian Translator provides accurate translations and pronunciation guides, making it an essential companion for both casual and dedicated users.",
  },
  funFacts: [
    {
      title: 'Ancient Language Structure',
      content:
        'High Valyrian boasts a complex grammatical system with four distinct grammatical genders, far more intricate than most modern languages. VibeTrans makes mastering this ancient tongue from Game of Thrones both accessible and enjoyable - a true linguistic enthusiast\'s dream come true!',
    },
    {
      title: 'Magical Linguistic Heritage',
      content:
        "Experience the power of High Valyrian through VibeTrans! This legendary Game of Thrones language features complex grammatical structures that evoke ancient magic. Who wouldn't want to master the iconic phrase 'Dracarys' and command dragons like Daenerys Targaryen?",
    },
  ],
  userInterests: [
    {
      title: 'Unmatched Translation Accuracy',
      content:
        'In the competitive landscape of translation tools, VibeTrans stands out like a perfectly forged Valyrian steel sword - sharp, precise, and reliable. Our High Valyrian Translator delivers exceptional accuracy that unveils the mysteries of this ancient tongue. While perfection may be elusive, VibeTrans comes remarkably close, making it your trusted companion for exploring the world of Game of Thrones linguistics.',
    },
    {
      title: 'Romantic Ceremonial Language',
      content:
        'Imagine exchanging wedding vows in High Valyrian, weaving romance and magic into your special day! VibeTrans makes this extraordinary experience effortlessly achievable. Want to leave your guests spellbound? Try "Valar Morghulis" - while it means "All men must die," it\'s sure to spark fascinating conversations! VibeTrans opens the door to the enchanting world of Valyrian linguistics.',
    },
    {
      title: 'Dialect Mastery',
      content:
        'Ready to captivate audiences with High Valyrian? VibeTrans empowers you to navigate various dialects with confidence! Imagine successfully ordering dragon-themed cuisine in High Valyrian - never underestimate the power of language. Each dialect offers its unique charm, creating an adventure across the realms of Westeros and Essos. Who wouldn\'t want to charmingly ask for "another round" in Valyrian at your next gathering? VibeTrans: your gateway to linguistic magic!',
    },
    {
      title: 'Modern Slang Translation',
      content:
        'Contemporary slang meets ancient Valyrian in the most delightful way! Sometimes translating modern expressions feels like decoding alien communications - but VibeTrans bridges this gap brilliantly. Watch as "YOLO" transforms into majestic High Valyrian, creating moments of pure linguistic wonder. Experience the mysterious charm of seeing today\'s slang reborn in the language of dragons and kings. Try it now and unleash the power of ancient linguistic magic!',
    },
  ],
};

async function updatePageImageReferences() {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 Updating page image references...');
  console.log('='.repeat(70));

  // 更新页面文件
  const pagePath = path.join(
    process.cwd(),
    'src/app/[locale]/(marketing)/(pages)/high-valyrian-translator/page.tsx'
  );

  let pageContent = await fs.readFile(pagePath, 'utf-8');

  // 图片映射关系 - 页面文件
  const pageImageMappings = {
    "'/images/docs/valyrian-translation.webp'": "'/images/docs/valyrian-translation-tool.webp'",
    "'/images/docs/what-is-high-valyrian-translator.webp'": "'/images/docs/valyrian-translation-tool.webp'",
  };

  // 应用页面图片替换
  for (const [oldImage, newImage] of Object.entries(pageImageMappings)) {
    const oldCount = (pageContent.match(new RegExp(oldImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (oldCount > 0) {
      pageContent = pageContent.replace(new RegExp(oldImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImage);
      console.log(`✅ Page: Updated ${oldCount} references: ${oldImage} → ${newImage}`);
    }
  }

  await fs.writeFile(pagePath, pageContent);
  console.log('✅ Page image references updated successfully');

  // 更新翻译文件
  await updateTranslationFiles();
}

async function updateTranslationFiles() {
  console.log('\n📝 Updating translation files...');

  const translationFiles = [
    'messages/pages/high-valyrian-translator/en.json',
    'messages/pages/high-valyrian-translator/zh.json'
  ];

  for (const filePath of translationFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    let content = await fs.readFile(fullPath, 'utf-8');

    // 翻译文件中的特定映射关系
    const translationMappings = [
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "What is high-valyrian-translator/g,
        replacement: '"image": "/images/docs/valyrian-translation-tool.webp",\n      "imageAlt": "What is high-valyrian-translator'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "什么是高瓦雷利亚语翻译器/g,
        replacement: '"image": "/images/docs/valyrian-translation-tool.webp",\n      "imageAlt": "什么是高瓦雷利亚语翻译器'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"[^"]*grammatical[^"]*"/g,
        replacement: '"image": "/images/docs/valyrian-grammar-fun.webp",\n          "alt": "High Valyrian grammatical complexity"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"[^"]*dragon[^"]*"/g,
        replacement: '"image": "/images/docs/dragon-language-magic.webp",\n          "alt": "High Valyrian dragon commands"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"[^"]*Accuracy[^"]*"/g,
        replacement: '"image": "/images/docs/sword-speech-bubbles.webp",\n          "alt": "Accuracy Compared to Others"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"[^"]*Marrying[^"]*"/g,
        replacement: '"image": "/images/docs/valyrian-vows.webp",\n          "alt": "Marrying with High Valyrian"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"[^"]*Learning[^"]*"/g,
        replacement: '"image": "/images/docs/valyrian-linguistics-journey.webp",\n          "alt": "Learning Dialects"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"[^"]*Slang[^"]*"/g,
        replacement: '"image": "/images/docs/slang-translation.webp",\n          "alt": "Translate Modern Slang"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "有趣的事实 1"/g,
        replacement: '"image": "/images/docs/valyrian-grammar-fun.webp",\n          "imageAlt": "有趣的事实 1"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "有趣的事实 2"/g,
        replacement: '"image": "/images/docs/dragon-language-magic.webp",\n          "imageAlt": "有趣的事实 2"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "与其他工具相比的准确性"/g,
        replacement: '"image": "/images/docs/sword-speech-bubbles.webp",\n          "imageAlt": "与其他工具相比的准确性"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "用高瓦雷利亚语结婚"/g,
        replacement: '"image": "/images/docs/valyrian-vows.webp",\n          "imageAlt": "用高瓦雷利亚语结婚"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "学习方言"/g,
        replacement: '"image": "/images/docs/valyrian-linguistics-journey.webp",\n          "imageAlt": "学习方言"'
      },
      {
        pattern: /"image": "\/images\/docs\/dragon-language-fun\.webp",\s*"imageAlt": "翻译现代俚语"/g,
        replacement: '"image": "/images/docs/slang-translation.webp",\n          "imageAlt": "翻译现代俚语"'
      }
    ];

    let updateCount = 0;
    for (const mapping of translationMappings) {
      const matches = content.match(mapping.pattern);
      if (matches) {
        content = content.replace(mapping.pattern, mapping.replacement);
        updateCount += matches.length;
      }
    }

    if (updateCount > 0) {
      await fs.writeFile(fullPath, content);
      console.log(`✅ ${filePath}: Updated ${updateCount} image references`);
    } else {
      console.log(`ℹ️  ${filePath}: No updates needed`);
    }
  }
}

async function main() {
  const result = await generateArticleIllustrationsSequential(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'high-valyrian-translator',
    'image-generation-result.json'
  );
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ 图片生成成功');

    // 自动更新页面中的图片引用
    await updatePageImageReferences();

    console.log('\n🎉 All tasks completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();