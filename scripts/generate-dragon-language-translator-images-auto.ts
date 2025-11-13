#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "dragon-language-translator",
  "whatIs": {
    "title": "What is XXXX",
    "content": "XXXX is a cutting-edge language translation tool designed to convert the mythical dragon language into understandable text. Utilizing advanced algorithms, VibeTrans ensures accurate and contextually relevant translations. This tool is ideal for fantasy writers, game developers, and enthusiasts eager to explore dragon lore in their projects. By bridging language barriers, VibeTrans enhances creativity and storytelling, making the mythical world more accessible and engaging."
  },
  "funFacts": [
    {
      "title": "Fun Fact",
      "content": "VibeTrans captures the magic of dragon language, originally crafted with only 34 runes and no punctuation. Community creativity added over 700 non-canon words, expanding the dragon lexicon even further."
    },
    {
      "title": "Fun Fact",
      "content": "Bethesda's dragon language uses just 34 unique runes and no punctuation, with community expansion adding over 700 unofficial words, making VibeTrans the perfect tool for decoding draconic dialogues."
    }
  ],
  "userInterests": [
    {
      "title": "Learning Pathways",
      "content": "Unlock the mystical world of dragons with VibeTrans. Our unique pathways guide you from novice to master, blending ancient lore with modern tech. Whether you're decoding scrolls or just curious, seize the chance to transform your learning journey into an epic saga."
    },
    {
      "title": "Community Contributions",
      "content": "Dive into the vibrant world of VibeTrans, where every user can leave their mark. Whether you're decoding ancient dragon scripts or creating quirky dialects, your input fuels our growth. Join forces with fellow enthusiasts and watch as your translations transform the way we communicate."
    },
    {
      "title": "Downloadable Resources",
      "content": "Explore VibeTrans's cache of downloadable goodies, from intricate dragon scripts to quirky language cheat sheets. Tailored for the curious linguist, these resources offer a treasure trove of insights. Dive in and give your dragon language skills a boost with just a click. Discover the magic today!"
    },
    {
      "title": "Grammar Insights",
      "content": "Ever wondered if dragons use slang or if their verbs breathe fire? VibeTrans cracks the code of dragon syntax, revealing quirky twists like 'scalespeak' and 'winged whispers.' Dive into linguistic lore and discover the rhythm behind each fiery roar. It's grammar with a mythical twist!"
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'dragon-language-translator', 'image-generation-result.json');
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