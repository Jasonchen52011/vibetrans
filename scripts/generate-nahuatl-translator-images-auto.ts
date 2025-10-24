#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'nahuatl-translator',
  whatIs: {
    title: 'What is Nahuatl Translator',
    content:
      'Nahuatl translator is a comprehensive tool designed to convert modern, classical, and regional Nahuatl into English or Spanish with human-level clarity. It offers features like audio pronunciation and grammar hints, making it ideal for linguists, students, and cultural enthusiasts seeking authentic translations.',
  },
  funFacts: [
    {
      title: "Nahuatl's Influence on English",
      content:
        'Did you know that many English words like chocolate, tomato, and avocado come from Nahuatl? These words have traveled through time, bringing a taste of Nahuatl culture to everyday language.',
    },
    {
      title: 'Unique Nahuatl Language Features',
      content:
        'Nahuatl is a fascinating agglutinative language where a single verb can contain over 20 morphemes, expressing entire sentences in one word. This complexity makes it both challenging and intriguing to study.',
    },
  ],
  userInterests: [
    {
      title: 'Understanding Dialect Differences',
      content:
        'Explore nuances between Classical and Modern Nahuatl. Our translator supports multiple dialects, ensuring you get the most accurate translation for your specific needs, whether for academic research, travel, or personal interest.',
    },
    {
      title: 'Audio Pronunciation Enhancement',
      content:
        'Get the correct pronunciation of translated words. Our audio feature provides clear native pronunciations, bridging the gap between written text and spoken language, perfect for learners and enthusiasts alike.',
    },
    {
      title: 'Orthography Toggle Feature',
      content:
        "Switch seamlessly between Roman and Indigenous orthography. This feature is ideal for users wanting to explore traditional characters or those studying the language's phonetic structure.",
    },
    {
      title: 'Common Phrases and Greetings',
      content:
        'Quickly access a list of common Nahuatl phrases and greetings. Perfect for casual learners or travelers, this feature offers a practical insight into everyday Nahuatl communication.',
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
    'nahuatl-translator',
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
