#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'english-to-turkish-translator',
  whatIs: {
    title: 'What is English-to-Turkish Turbo Translator?',
    content:
      'English-to-Turkish Turbo Translator is a powerful web-based tool designed to instantly convert English into Turkish with high accuracy. It supports text, voice, and image inputs, making it ideal for diverse translation needs.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'Did you know? Turkish has over 1,700 English loanwords, yet requires phonetic mapping for accurate translation. [Learn more](https://en.wikipedia.org/wiki/Turkish_language)',
    },
    {
      title: 'Fun Fact',
      content:
        'Intriguingly, Turkish uses a Subject-Object-Verb order, requiring MT engines to reorder sentences entirely for accuracy. [Discover more](https://en.wikipedia.org/wiki/Turkish_grammar)',
    },
  ],
  userInterests: [
    {
      title: 'Handling Turkish Dialects',
      content:
        'Our tool effectively distinguishes between Istanbul and Anatolian dialects, ensuring precise translations no matter the regional variations.',
    },
    {
      title: 'Formality and Politeness Levels',
      content:
        "Switch between 'Sen' and 'Siz' forms for accurate formal or informal translations, preserving cultural etiquette in communication.",
    },
    {
      title: 'Idioms & Slang Cheat-Sheet',
      content:
        'Gain access to a comprehensive guide on common idioms and slang, helping you understand and use them effectively in translations.',
    },
    {
      title: 'Privacy & GDPR Compliance',
      content:
        'Our translations are GDPR-safe, ensuring no data retention or privacy breaches, giving you peace of mind.',
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
    'english-to-turkish-translator',
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
