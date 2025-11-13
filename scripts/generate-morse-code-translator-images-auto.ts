#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "morse-code-translator",
  "whatIs": {
    "title": "What is Morse Code Translator Pro?",
    "content": "Morse Code Translator Pro is a multifunctional tool that converts text, audio, and files into Morse code and back. Ideal for learning, emergency communication, and geek entertainment, it supports various languages and offline use."
  },
  "funFacts": [
    {
      "title": "SOS Signal Origins",
      "content": "‘SOS’ is not an acronym but a distinct sequence ...---..., easy to recognize and hard to mistake."
    },
    {
      "title": "Modern Aviation Use",
      "content": "Pilots still use Morse code tones to verify VOR/NDB station IDs, a global aviation standard."
    }
  ],
  "userInterests": [
    {
      "title": "Learning Morse Code",
      "content": "Discover efficient ways to learn Morse code with tips, mnemonics, and training apps tailored for beginners and enthusiasts."
    },
    {
      "title": "Emergency Uses of Morse",
      "content": "Explore how Morse code can be used in emergencies with flashlights, whistles, and mirrors for quick communication."
    },
    {
      "title": "Morse Code in Modern Tech",
      "content": "Find out how Morse code is integrated into modern technology like aviation and IoT for various applications."
    },
    {
      "title": "Morse Code for Accessibility",
      "content": "Learn how Morse code assists people with disabilities through switch scanning and single-switch input methods."
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'morse-code-translator', 'image-generation-result.json');
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