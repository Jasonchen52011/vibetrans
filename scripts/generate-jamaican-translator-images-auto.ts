#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'jamaican-translator',
  whatIs: {
    title: 'What is Jamaican Translator',
    content:
      "Jamaican Translator is a language tool designed to convert English text into Jamaican Patois, offering users a vibrant cultural experience. Developed by VibeTrans, it allows users to explore and understand the rich linguistic nuances of Jamaican dialects. Whether you're a language enthusiast or a traveler preparing for a Jamaican adventure, this translator enhances communication and appreciation of the island's unique language and culture.",
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'Did you know? VibeTrans helps preserve Jamaican Patois, an endangered language with over 3 million speakers, by translating texts like the unique full creole Bible and popular phrases from Usain Bolt.',
    },
    {
      title: 'Fun Fact',
      content:
        'Did you know? VibeTrans helps you explore Jamaican Patois, an endangered but vibrant language. Usain Bolt’s interviews in Patois sparked global interest, highlighting its rich West African roots.',
    },
  ],
  userInterests: [
    {
      title: 'Cultural Context Tips',
      content:
        "When using VibeTrans for Jamaican translations, remember that language is lively and full of idioms. Phrases like 'irie' signify positivity, while 'soon come' reflects a relaxed approach to time. Understanding these nuances ensures authentic communication in both casual chats and formal settings.",
    },
    {
      title: 'Voice-to-Text Features',
      content:
        "VibeTrans delivers a seamless voice-to-text experience, translating Jamaican patois with flair. Perfect for capturing those unique island expressions, it understands every 'irie' and 'yaad' vibe. Whether it’s a quick note or a full chat, let VibeTrans keep your conversations lively.",
    },
    {
      title: 'API for Developers',
      content:
        "VibeTrans offers a seamless Jamaican Patois translation API, perfect for developers integrating linguistic flair into their apps. Designed with user-friendliness in mind, it allows for swift integration and real-time translations. Enhance your app's vibe and connect authentically with global audiences.",
    },
    {
      title: 'Avoid Common Mistakes',
      content:
        "When using a Jamaican translator like VibeTrans, steer clear of confusing 'irie' with 'irie mon.' The first means 'nice,' while the latter is a friendly greeting. Also, remember 'soon come' doesn't mean immediately! Master these quirks for an authentic Jamaican vibe.",
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
    'jamaican-translator',
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
