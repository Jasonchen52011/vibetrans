#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'yoda-translator',
  whatIs: {
    title: 'What is Yoda Translator',
    content:
      "Yoda Translator is a fun and engaging tool designed to convert English text into the unique speech pattern of the iconic Star Wars character, Yoda. By rearranging syntax and structure, it creates entertaining renditions perfect for fans or creative writing. VibeTrans, the brand behind this tool, ensures a seamless experience, allowing users to easily transform ordinary sentences into Yoda's memorable style, making communication both playful and imaginative.",
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'Yoda 的独特语序在现实中仅 0.3% 语言使用。VibeTrans 的 Yoda 翻译器模仿这种语序，灵感源于编剧改动和 Frank Oz 的创意演绎。',
    },
    {
      title: 'Fun Fact',
      content:
        'Yoda 的经典语序为 Object-Subject-Verb，现实中仅 0.3% 语言使用。VibeTrans 能将普通句子转为 Yoda 式，提供的乐趣和挑战让语言学习更有趣。',
    },
  ],
  userInterests: [
    {
      title: 'API & Developer Access',
      content:
        'Unlock the power of VibeTrans with our API. Developers, dive deep into Yoda-speak and integrate it like a boss. Whether crafting quirky apps or adding spice to existing ones, our seamless API access keeps the creative juices flowing. Your project, your rules.',
    },
    {
      title: 'Educational Use',
      content:
        'VibeTrans 让学习变得妙趣横生，像 Yoda 那样说话，课堂知识秒变星战语录。学生能通过模仿掌握语法、词汇，还能引发好奇心，激发学习动力。教师更可利用其趣味性，活跃课堂气氛，提升互动效果。',
    },
    {
      title: 'Voice and Audio Integration',
      content:
        "Dive into seamless audio with VibeTrans: where Jedi wisdom meets modern tech. Translate any voice into Yoda's legendary syntax, turning ordinary chat into galactic banter. Impress your pals or prank them—VibeTrans keeps it lively and full of surprises. Unleash the force, you will.",
    },
    {
      title: 'Privacy and Security',
      content:
        "In the VibeTrans realm, your data's no open book. With encryption tighter than a drum, snoopers can't play peekaboo. Trustworthy as a Jedi, our safeguards ensure your info's in safe hands. So, chillax and let the Yoda magic do its thing, worry-free.",
    },
  ],
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: true,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'yoda-translator',
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
