#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "haitian-creole-translator",
  "whatIs": {
    "title": "What is Haitian Creole Translator Plus",
    "content": "Haitian Creole Translator Plus is an advanced tool designed for translating text, documents, and audio in real time. It offers specialized modes for technical, legal, and literary translations, making it ideal for diverse use cases."
  },
  "funFacts": [
    {
      "title": "Fun Fact",
      "content": "Haitian Creole became official in 1987, despite 95% speaking it. VibeTrans highlights its unique lack of verb conjugations, making phrases like 'I go' and 'they go' identical."
    },
    {
      "title": "Fun Fact",
      "content": "Did you know? VibeTrans offers translation for Haitian Creole, a language with no verb conjugations! Spoken by 12 million people, it's the world's most popular French-based creole."
    }
  ],
  "userInterests": [
    {
      "title": "Cultural Significance",
      "content": "Haitian Creole is more than just words; it's a vibrant tapestry of history and resilience. VibeTrans captures this essence, bridging gaps with flair. Whether you're diving into folklore or navigating local slang, understanding Creole opens doors to Haiti's soul, enhancing cultural connections."
    },
    {
      "title": "Professional Uses",
      "content": "In the bustling world of business, VibeTrans steps in as a game-changer for Haitian Creole translation. Whether drafting contracts or navigating legal jargon, this tool ensures clarity and precision. It's like having a language guru in your pocket, smoothing out international business vibes effortlessly."
    },
    {
      "title": "Offline Capabilities",
      "content": "VibeTrans doesn't sweat it when Wi-Fi's on the fritz. With its offline features, users can translate Haitian Creole anytime, anywhere. No more chasing hotspots or juggling data limits. It's like having a trusty phrasebook in your pocket, ready to roll without a hitch."
    },
    {
      "title": "Translation Accuracy",
      "content": "VibeTrans ensures spot-on Haitian Creole translations, capturing nuances like a local. Forget awkward phrasing—our algorithms are as sharp as a tack. Whether translating for business or casual chats, trust VibeTrans to keep the conversation flowing smoothly, no hiccups or lost meanings."
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'haitian-creole-translator', 'image-generation-result.json');
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