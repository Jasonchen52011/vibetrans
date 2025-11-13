#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "shakespearean-translator",
  "whatIs": {
    "title": "What is Shakespearean Translator",
    "content": "The Shakespearean Translator by VibeTrans is a unique tool that transforms modern English text into the rich, poetic language of Shakespeare's era. Ideal for students, writers, and language enthusiasts, it enriches understanding of Elizabethan English by providing an authentic translation experience. Whether you're crafting a play, writing a novel, or exploring historical linguistics, VibeTrans offers an engaging way to bridge the gap between contemporary and classical English."
  },
  "funFacts": [
    {
      "title": "Fun Fact",
      "content": "Shakespeare's influence on English is profound, with over 1,700 words credited to him. VibeTrans helps you navigate this linguistic legacy, showcasing words like 'eyeball' and 'swagger' still used today."
    },
    {
      "title": "Fun Fact",
      "content": "Shakespeare coined over 1,700 words still used today. VibeTrans highlights his creativity and humor, bridging his era's language to ours with tools like the Shakespearean translator."
    }
  ],
  "userInterests": [
    {
      "title": "Pronunciation Guide",
      "content": "Dive into the bygone era with VibeTrans, where 'thou' is as common as 'you.' Swap 's' for 'eth' and 'doth' for 'does' to channel authentic Shakespearean vibes. With a sprinkle of 'forsooth' and 'hark,' you're set for an Elizabethan adventure. Unleash your inner bard today!"
    },
    {
      "title": "Grammar Rules Explained",
      "content": "Dive into the quirky realm of grammar with VibeTrans! Forget the dull stuff—explore how 'thou' and 'thee' once ruled the speech scene. Discover quirky tales of verbs and nouns partying like it’s 1599, giving your old-school English a fresh new vibe."
    },
    {
      "title": "Cultural Context",
      "content": "Explore the Elizabethan era with VibeTrans, capturing the vibe of Shakespeare’s world. From cheeky banter to courtly intrigue, this translator bridges time’s gap, making ye olde language accessible. Dive into a realm where words are woven with rich history. A cultural tapestry awaits!"
    },
    {
      "title": "Educational Resources",
      "content": "Dive into the world of Shakespearean lingo with VibeTrans! This tool is your backstage pass to mastering the Bard's unique flair. Unearth ancient phrases, decode Elizabethan slang, and impress your peers with your newfound verbal panache. Perfect for students, actors, or curious minds!"
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'shakespearean-translator', 'image-generation-result.json');
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ 图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();