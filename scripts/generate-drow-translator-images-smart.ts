#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'drow-translator',
  whatIs: {
    title: 'What is VibeTrans Drow Translator?',
    content:
      'The VibeTrans Drow Translator is an advanced AI-powered tool specifically designed to handle the unique linguistic characteristics of Drow, the mysterious Dark Elf language from Dungeons & Dragons and fantasy literature. Our system understands the complex grammar, vocabulary patterns, and cultural context of Drow to provide translations that honor both traditional fantasy lore and modern gaming needs. D&D players, fantasy writers, language enthusiasts, and creative artists rely on our translator to bridge communication gaps while exploring the rich linguistic heritage of Dark Elf culture.',
    style: {
      style: 'dark fantasy, mystical, elegant',
      keywords: [
        'drow',
        'dark elf',
        'fantasy',
        'dungeons and dragons',
        'linguistics',
      ],
      layout: 'dramatic, mysterious',
    },
  },
  funFacts: [
    {
      title: 'Drow Language Origins',
      content:
        'The Drow language was created by Gary Gygax for Dungeons & Dragons, drawing inspiration from various real-world languages including Basque, Finnish, and even some Russian elements to create its distinctive sound.',
      style: {
        style: 'dark fantasy, mystical, elegant',
        keywords: [
          'drow',
          'dark elf',
          'fantasy',
          'dungeons and dragons',
          'linguistics',
        ],
        layout: 'dramatic, mysterious',
      },
    },
    {
      title: 'Unique Linguistic Features',
      content:
        'Drow features complex consonant clusters, apostrophe usage for glottal stops, and a subject-object-verb word order that differs from most languages, making it both challenging and fascinating to learn.',
      style: {
        style: 'dark fantasy, mystical, elegant',
        keywords: [
          'drow',
          'dark elf',
          'fantasy',
          'dungeons and dragons',
          'linguistics',
        ],
        layout: 'dramatic, mysterious',
      },
    },
  ],
  userInterests: [
    {
      title: 'D&D Campaign Development',
      content:
        'Enhance your Dungeons & Dragons campaigns with authentic Dark Elf dialogue and lore. Create immersive Underdark adventures, develop complex Drow NPCs with distinctive personalities, and capture the intricate political intrigue of Drow society. Perfect for Dungeon Masters seeking to add depth and authenticity to their fantasy worlds.',
      style: {
        style: 'dark fantasy, mystical, elegant',
        keywords: [
          'drow',
          'dark elf',
          'fantasy',
          'dungeons and dragons',
          'campaign development',
        ],
        layout: 'dramatic, mysterious',
      },
    },
    {
      title: 'Fantasy World Building',
      content:
        'Build rich fantasy worlds with linguistic accuracy for Dark Elf civilizations. Design entire cities, create unique dialects for different Drow houses, develop religious texts for Lolth worship, and establish cultural practices that resonate with readers. Essential for writers crafting detailed fantasy universes with authentic linguistic foundations.',
      style: {
        style: 'dark fantasy, mystical, elegant',
        keywords: [
          'drow',
          'dark elf',
          'fantasy',
          'world building',
          'civilization design',
        ],
        layout: 'dramatic, mysterious',
      },
    },
    {
      title: 'Video Game Development',
      content:
        'Integrate authentic Drow language and culture into your video game projects. Perfect for creating Dark Elf companions, quest dialogue, faction interactions, and environmental storytelling for RPG developers. Use our translator to ensure linguistic consistency for game narrative elements and create memorable NPC interactions.',
      style: {
        style: 'dark fantasy, mystical, elegant',
        keywords: [
          'drow',
          'dark elf',
          'fantasy',
          'video games',
          'rpg development',
        ],
        layout: 'dramatic, mysterious',
      },
    },
    {
      title: 'Educational & Creative Projects',
      content:
        'Explore Drow linguistics for conlang and creative writing projects. Perfect for students studying fantasy languages, educators teaching creative writing, and artists developing character backstories. Use our translator to understand language construction, cultural development, and creative expression through fictional languages.',
      style: {
        style: 'dark fantasy, mystical, elegant',
        keywords: [
          'drow',
          'dark elf',
          'fantasy',
          'education',
          'creative projects',
        ],
        layout: 'dramatic, mysterious',
      },
    },
  ],
  howto: {
    title: 'How to Translate Drow',
    content:
      'Simple steps to get started with our drow translator. Start by typing or pasting your text in English, Drow, or any supported language into the input field. Choose whether you want to translate from Drow to another language or from another language to Drow. Press the Translate button to get your instant, accurate Drow translation. Copy your translated text for use in D&D campaigns, fantasy writing, or creative projects.',
    style: {
      style: 'dark fantasy, mystical, elegant',
      keywords: [
        'drow',
        'dark elf',
        'fantasy',
        'dungeons and dragons',
        'linguistics',
      ],
      layout: 'dramatic, mysterious',
    },
  },
};

/**
 * 更新JSON文件中的图片路径
 */
async function updateJsonImagePaths(result: any) {
  console.log('\n📝 STEP 3: 更新JSON文件中的图片路径...');

  const jsonPaths = [
    path.join(process.cwd(), 'messages/pages/drow-translator/en.json'),
    path.join(process.cwd(), 'messages/pages/drow-translator/zh.json'),
  ];

  for (const jsonPath of jsonPaths) {
    try {
      // 读取现有JSON文件
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);

      // 映射生成结果到JSON字段
      const imageMapping = {
        'drow-language-bridge': jsonData.DrowTranslatorPage.whatIs,
        'drow-translator-how-to': jsonData.DrowTranslatorPage.howto,
        'drow-lingo-genesis': jsonData.DrowTranslatorPage.funFacts.items[0],
        'language-twister': jsonData.DrowTranslatorPage.funFacts.items[1],
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
      console.log(`✅ JSON文件更新完成: ${path.basename(jsonPath)}`);
    } catch (error) {
      console.error(`❌ JSON文件更新失败 ${path.basename(jsonPath)}:`, error);
      throw error;
    }
  }
}

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: true,
    style: 'dark fantasy, mystical, elegant',
    keywords: [
      'drow',
      'dark elf',
      'fantasy',
      'dungeons and dragons',
      'linguistics',
    ],
  });

  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'drow-translator',
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
