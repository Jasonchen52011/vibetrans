#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'al-bhed-translator',
  whatIs: {
    title: 'What is Al Bhed Translator',
    content:
      'Al Bhed Translator is a tool designed to convert text between Al Bhed and English, primarily for fans of Final Fantasy X. VibeTrans offers a seamless translation experience, allowing you to translate entire documents, listen to translations, and even use it for creative projects like cosplay or fan videos.',
  },
  funFacts: [
    {
      title: "Al Bhed's Secret Cipher",
      content:
        'Did you know Al Bhed is just a 26-letter substitution cipher? Each English letter swaps with another, making it a playful code rather than a real language. I find it fascinating how this simple trick creates the illusion of a complex language. VibeTrans nails it by decoding this charming cipher flawlessly!',
    },
    {
      title: 'Hidden Primers in FFX',
      content:
        "In Final Fantasy X, collecting all 26 Al Bhed Primers turns dialogues into English. It's like unlocking a secret treasure! Many players miss these gems, and I think having VibeTrans makes discovering them and translating so much easier. It's like having a cheat sheet right at your fingertips.",
    },
  ],
  userInterests: [
    {
      title: 'Batch Translation Made Easy',
      content:
        "Ever tried translating multiple files at once? With VibeTrans, you can batch translate documents while keeping the original format intact. It's perfect for those times when you need to process large volumes of text quickly. I think this feature is a lifesaver for content creators and game developers!",
    },
    {
      title: 'Learn Al Bhed Effortlessly',
      content:
        "VibeTrans offers a unique learning mode that shows the original text, translation, and flashing letter cards. It's as if you're having a personalized tutor guiding you through the Al Bhed language! I believe this interactive approach makes learning fun and engaging, transforming a cipher into a learning adventure.",
    },
    {
      title: 'Audio Playback for Immersion',
      content:
        "Want to hear how Al Bhed sounds? VibeTrans provides text-to-speech features that let you listen to translations. It's like bringing the game to life in your ears! This is awesome for cosplay or social media videos, making your Al Bhed experience more immersive and engaging. I love how it adds realism!",
    },
    {
      title: 'Enhanced Privacy Features',
      content:
        "Worried about privacy? VibeTrans runs offline, ensuring your data is secure. With no server logs, your personal texts stay personal. I think this is a big win for privacy-conscious users who value security. It's reassuring to know you can translate with peace of mind, right from your browser!",
    },
  ],
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'al-bhed-translator',
    'image-generation-result.json'
  );
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ Al Bhed Translator 图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ Al Bhed Translator 图片生成失败');
    process.exit(1);
  }
}

main();
