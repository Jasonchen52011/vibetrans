#!/usr/bin/env node
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'haitian-creole-translator',
  whatIs: {
    title: 'Placeholder',
    content: 'Placeholder',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Did you know? VibeTrans offers translation for Haitian Creole, a language with no verb conjugations! Spoken by 12 million people, it's the world's most popular French-based creole.",
    },
  ],
  userInterests: [],
};

async function main() {
  console.log('🎨 生成图片 1/2: creole-language-spread.webp');
  console.log('内容: Fun Fact - Haitian Creole language facts');
  console.log('');

  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  if (result.success) {
    console.log('✅ 第1张图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ 第1张图片生成失败');
    process.exit(1);
  }
}

main();
