#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "draconic-translator",
  "whatIs": {
    "title": "What is Draconic Translator?",
    "content": "Draconic Translator is a specialized tool designed for fantasy writers and RPG players, enabling real-time translation of Draconic language. It supports text, image, and audio, providing accurate translations for immersive storytelling and gameplay."
  },
  "funFacts": [
    {
      "title": "Fun Fact",
      "content": "Did you know? Draconic, a language older than Elvish in the D&D multiverse, uses base-12 counting inspired by dragon talons. Explore linguistic magic with VibeTrans's draconic translation tools!"
    },
    {
      "title": "Fun Fact",
      "content": "VibeTrans reveals that Draconic, older than Elvish, uses a base-12 counting system inspired by dragons' talons. Its alphabet, Iokharic, mimics claw slashes, adding a fierce visual flair."
    }
  ],
  "userInterests": [
    {
      "title": "Draconic Dialects",
      "content": "Ever wondered if dragons have their own slang? VibeTrans dives into Draconic dialects, uncovering unique phrases that even the most seasoned adventurers might miss. From fiery expressions to mystical mutterings, discover the quirks and charms of dragon lingo. Perfect for adding flair to any mythical conversation!"
    },
    {
      "title": "Language Comparison",
      "content": "Ever wondered how languages stack up against each other? VibeTrans delves into linguistic quirks, from idioms to slang. Discover why French is the 'language of love' and how German compacts meanings. Uncover hidden gems and spice up your language game with VibeTrans."
    },
    {
      "title": "Pronunciation Guide",
      "content": "Mastering pronunciation is like taming dragons—tricky but thrilling! VibeTrans brings phonetic finesse to your fingertips with a splash of fun. Ever stumbled over 'gnarly'? Fear not, this guide ensures you sound polished, not perplexed. Say goodbye to mispronunciations and hello to linguistic swagger!"
    },
    {
      "title": "Numerical Systems",
      "content": "Dive into the quirky world of numerical systems with VibeTrans. From binary to hexadecimal, numbers aren't just digits—they're a universal language. Ever wondered how computers 'talk'? Get the lowdown on how these numerical codes keep the digital world spinning. It's all in the numbers!"
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'draconic-translator', 'image-generation-result.json');
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