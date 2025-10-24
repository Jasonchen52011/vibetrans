#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

// 只生成Team Use部分的四个内容块图片
const sections: ArticleSections = {
  toolName: 'drow-translator',
  whatIs: {
    title: 'What is Drow Translator',
    content: 'Placeholder content for image generation',
  },
  funFacts: [
    {
      title: 'Placeholder Fact 1',
      content: 'Placeholder content',
    },
  ],
  userInterests: [
    {
      title: 'D&D Campaign Development',
      content:
        'Elevate your Dungeons & Dragons campaigns with authentic Dark Elf dialogue and lore. Create immersive Underdark adventures, develop complex Drow NPCs with distinct personalities, and craft political intrigue that captures the sophisticated social dynamics of Dark Elf society. Perfect for Dungeon Masters seeking to add depth and authenticity to their fantasy worlds.',
    },
    {
      title: 'Fantasy World Building',
      content:
        'Build rich fantasy worlds with linguistically accurate Dark Elf civilizations. Design entire cities, create unique dialects for different Drow houses, develop religious texts for Lolth worship, and establish cultural practices that resonate with readers. Essential for authors crafting elaborate fantasy universes with detailed linguistic foundations.',
    },
    {
      title: 'Video Game Development',
      content:
        "Integrate authentic Drow language and culture into your video game projects. Perfect for RPG developers creating Dark Elf companions, quest dialogues, faction interactions, and environmental storytelling. Use our translator to ensure linguistic consistency across your game's narrative elements and create memorable NPC interactions.",
    },
    {
      title: 'Educational & Creative Projects',
      content:
        'Explore constructed languages and creative writing through Drow linguistics. Ideal for students studying fantasy linguistics, educators teaching creative writing, and artists developing character backgrounds. Use our translator to understand language construction, cultural development, and creative expression through fictional languages.',
    },
  ],
};

async function main() {
  console.log('🎨 开始生成Drow Translator Team Use图片...');

  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false, // 我们不需要how-to截图
    forceRegenerate: true, // 强制重新生成图片
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'drow-translator-team-use',
    'image-generation-result.json'
  );
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ Team Use图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ Team Use图片生成失败');
    process.exit(1);
  }
}

main();
