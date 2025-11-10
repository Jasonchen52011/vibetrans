#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';

const sections: ArticleSections = {
  "toolName": "haitian-creole-translator",
  "whatIs": {
    "title": "Placeholder",
    "content": "Placeholder"
  },
  "funFacts": [],
  "userInterests": [
    {
      "title": "Translation Accuracy",
      "content": "VibeTrans ensures spot-on Haitian Creole translations, capturing nuances like a local. Forget awkward phrasing—our algorithms are as sharp as a tack. Whether translating for business or casual chats, trust VibeTrans to keep the conversation flowing smoothly, no hiccups or lost meanings."
    }
  ]
};

async function main() {
  console.log('🎨 生成图片 2/2: language-clarity.webp');
  console.log('内容: Translation Accuracy');
  console.log('');

  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  if (result.success) {
    console.log('✅ 第2张图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ 第2张图片生成失败');
    process.exit(1);
  }
}

main();
