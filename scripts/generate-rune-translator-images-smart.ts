#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'rune-translator',
  whatIs: {
    title: 'What is XXX',
    content:
      "XXX is your magical gateway to the world of runes, where decoding ancient scripts is as fun as a quest in your favorite RPG! 🌟 Connect with fellow adventurers in our vibrant community, share your mystical translations, and dive into game lore like never before. With epic soundtracks and dazzling visuals, it's free and super easy to use. Ready for a cosplay challenge? Let the rune adventures begin! 🎮✨",
    style: {
      style: 'vibrant, gaming-inspired, colorful',
      keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
      layout: 'dynamic, interactive',
    },
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'Did you know? Runes were not only used for communication but also believed to hold magical powers!',
      style: {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      },
    },
    {
      title: 'Fun Fact',
      content:
        'Elder Futhark, the oldest rune alphabet, consists of 24 unique characters. Imagine the stories they could tell!',
      style: {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      },
    },
  ],
  userInterests: [
    {
      title: 'Cosplay Magic',
      content:
        "Bring authenticity to your cosplay with accurate rune translations. Perfect for adding that extra touch to your character's backstory.",
      style: {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      },
    },
    {
      title: 'Game Enhancements',
      content:
        'Use VibeTrans to create immersive in-game experiences. From D&D campaigns to RPGs, your adventures just got more magical.',
      style: {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      },
    },
    {
      title: 'Community Creations',
      content:
        'Join our community and share your rune translations. Collaborate on projects and make new friends who share your interests.',
      style: {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      },
    },
    {
      title: 'Artistic Expression',
      content:
        "Transform your art with rune translations. Whether it's fan art or original pieces, VibeTrans adds a unique, historical touch.",
      style: {
        style: 'vibrant, gaming-inspired, colorful',
        keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
        layout: 'dynamic, interactive',
      },
    },
  ],
};

/**
 * 更新JSON文件中的图片路径
 */
async function updateJsonImagePaths(result: any) {
  console.log('\n📝 STEP 3: 更新JSON文件中的图片路径...');

  const jsonPath = path.join(
    process.cwd(),
    'messages',
    'pages',
    'rune-translator',
    'en.json'
  );

  try {
    // 读取现有JSON文件
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);

    // 映射生成结果到JSON字段
    const imageMapping = {
      'rune-adventure-portal': jsonData.RuneTranslatorPage.whatIs,
      'rune-magic-power': jsonData.RuneTranslatorPage.funFacts.items[0],
      'rune-alphabet-history': jsonData.RuneTranslatorPage.funFacts.items[1],
      'rune-transformation': jsonData.RuneTranslatorPage.userInterest.items[0],
      'game-magic-boost': jsonData.RuneTranslatorPage.userInterest.items[1],
      'runes-community-share':
        jsonData.RuneTranslatorPage.userInterest.items[2],
      'art-rune-transform': jsonData.RuneTranslatorPage.userInterest.items[3],
    };

    // 更新图片路径
    if (result.generatedImages) {
      result.generatedImages.forEach((img: any) => {
        const mapping = imageMapping[img.filename];
        if (mapping) {
          mapping.image = `/images/docs/${img.filename}.webp`;
        }
      });
    }

    // 保存更新后的JSON
    await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log('✅ JSON文件更新完成');
  } catch (error) {
    console.error('❌ JSON文件更新失败:', error);
    throw error;
  }
}

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
    style: 'vibrant, gaming-inspired, colorful',
    keywords: ['fantasy', 'gaming', 'community', 'rune', 'ancient'],
  });

  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'rune-translator',
    'image-generation-result.json'
  );
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ 图片生成成功');

    // 更新JSON文件
    await updateJsonImagePaths(result);

    console.log('🎉 全部工作完成！图片已生成并更新到页面JSON文件中。');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();
