#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

// 只生成一个Team Use内容
const sections: ArticleSections = {
  toolName: 'drow-translator',
  whatIs: {
    title: 'What is Drow Translator',
    content: 'Placeholder content',
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
  ],
};

async function main() {
  console.log('🎨 生成单张Drow图片...');

  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
    forceRegenerate: true,
  });

  if (result.success) {
    console.log('✅ 图片生成成功');

    // 查找生成的图片并重命名为interest-1
    const generatedFiles = result.generatedFiles || [];
    for (const file of generatedFiles) {
      if (file.filename && file.filename.includes('drow')) {
        const sourcePath = `/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/${file.filename}`;
        const targetPath =
          '/Users/jason-chen/Downloads/project/vibetrans/public/images/docs/drow-translator-interest-1.webp';

        try {
          await fs.copyFile(sourcePath, targetPath);
          console.log(`✅ 图片已复制为: drow-translator-interest-1.webp`);
          break;
        } catch (error) {
          console.log('❌ 复制文件失败:', error);
        }
      }
    }

    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();
