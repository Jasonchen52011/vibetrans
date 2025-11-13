#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'braille-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      'XXXX is a tool that converts text into braille, making written content accessible to visually impaired individuals. VibeTrans uses advanced algorithms to ensure accurate translation, supporting multiple languages and formats. It is ideal for educational settings, personal use, and organizations aiming to promote inclusivity. With VibeTrans, users can easily translate books, documents, and digital content, enhancing communication and learning opportunities for the blind community.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Did you know NASA's Mars rover Curiosity has its name spelled in Braille on its wheels? VibeTrans celebrates such ingenuity by making Braille translation accessible to over 135 languages worldwide.",
    },
    {
      title: 'Fun Fact',
      content:
        "Did you know that NASA's Mars rover Curiosity has its name spelled in Braille on its wheels? This unique touch highlights Braille's adaptability, as seen with VibeTrans tools.",
    },
  ],
  userInterests: [
    {
      title: 'Understanding Braille Grades',
      content:
        "Braille isn't just dots; it's a whole vibe! VibeTrans deciphers the mystery with its user-friendly guide. From Grade 1's simple alphabet to Grade 3's shorthand wizardry, each level opens new doors for communication. Dive into the world of tactile reading and vibe with VibeTrans!",
    },
    {
      title: 'Braille Printing Techniques',
      content:
        'Exploring braille printing techniques reveals a fascinating journey from old-school embossers to today’s high-tech solutions. VibeTrans leads the pack with innovative methods, ensuring crisp dots every time. Whether for education or leisure, these cutting-edge tools make braille more accessible and user-friendly than ever.',
    },
    {
      title: 'API for Developers',
      content:
        "Unlock the power of VibeTrans with our developer API, perfect for those diving into Braille tech. Seamlessly convert text to Braille in a jiffy and integrate with ease. Whether you're coding a new app or enhancing accessibility, VibeTrans has your back.",
    },
    {
      title: 'Multilingual Braille Support',
      content:
        "VibeTrans takes your Braille game to the next level with seamless multilingual support. Whether you're diving into French, Spanish, or Mandarin Braille, this tool has your back. Say goodbye to language barriers and hello to a world of tactile communication. Unlock global vibes with VibeTrans!",
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
    'braille-translator',
    'image-generation-result.json'
  );
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
