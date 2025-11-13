#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'haitian-creole-translator',
  whatIs: {
    title: 'What is Haitian Creole Translator Plus',
    content:
      'Haitian Creole Translator Plus is an advanced tool designed for translating text, documents, and audio in real time. It offers specialized modes for technical, legal, and literary translations, making it ideal for diverse use cases.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Did you know? VibeTrans offers translation for Haitian Creole, a language with no verb conjugations! Spoken by 12 million people, it's the world's most popular French-based creole.",
    },
  ],
  userInterests: [
    {
      title: 'Translation Accuracy',
      content:
        'VibeTrans ensures spot-on Haitian Creole translations, capturing nuances like a local. Forget awkward phrasing—our algorithms are as sharp as a tack. Whether translating for business or casual chats, trust VibeTrans to keep the conversation flowing smoothly, no hiccups or lost meanings.',
    },
  ],
};

async function main() {
  console.log('🎨 重新生成3张特定图片：');
  console.log(
    '1. What is Haitian Creole Translator Plus (translation-tool-plus.webp)'
  );
  console.log('2. Fun Fact #2 - Creole language (creole-language-spread.webp)');
  console.log('3. Translation Accuracy (language-clarity.webp)');
  console.log('');

  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  if (result.success) {
    console.log('✅ 图片生成成功');
    console.log('生成的图片：');
    console.log(
      '- translation-tools-plus.webp → 需要重命名为 translation-tool-plus.webp'
    );
    console.log(
      '- creole-language-fact.webp → 需要重命名为 creole-language-spread.webp'
    );
    console.log(
      '- precise-translation.webp → 需要重命名为 language-clarity.webp'
    );
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();
