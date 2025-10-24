#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'greek-translator',
  whatIs: {
    title: 'What is Greek-Translator Suite',
    content:
      'The Greek-Translator Suite is a web-based tool providing accurate translations between Greek and multiple languages. It supports text, audio, and image inputs, making it ideal for both professional and everyday use.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'About 30% of English scientific terms are from Greek roots. Discover more at [source](https://en.wikipedia.org/wiki/Greek_language).',
    },
    {
      title: 'Fun Fact',
      content:
        "The Greek word for 'yes' is 'Ναι', pronounced like 'nay'. Learn more about Greek pronunciation [here](https://en.wikipedia.org/wiki/Modern_Greek_phonology).",
    },
  ],
  userInterests: [
    {
      title: 'Ancient Greek Translation',
      content:
        'Translate ancient texts accurately with our unique dual-mode feature. Perfect for historical research or academic work.',
    },
    {
      title: 'Transliteration Toggle',
      content:
        'Switch Greek alphabet to Latin letters with pronunciation aids. Ideal for learning or casual reading.',
    },
    {
      title: 'Image-to-Text OCR',
      content:
        'Use your camera to translate Greek signs and menus instantly. A must-have for travelers.',
    },
    {
      title: 'Voice Conversation Mode',
      content:
        'Engage in real-time Greek ↔ English voice conversations. Enhance language learning and practice.',
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
    'greek-translator',
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
