#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'english-to-persian-translator',
  whatIs: {
    title: 'What is English To Persian Translator',
    content:
      'Our English to Persian Translator is a powerful AI-powered tool that helps you translate text, documents, and conversations from English to Persian with high accuracy and natural language flow. This sophisticated translation service bridges the communication gap between English and Persian speakers, making it invaluable for business, academic, and personal use.',
  },
  funFacts: [
    {
      title: 'Rich Literary Heritage',
      content:
        'Persian (Farsi) has a literary history spanning over 2,500 years, with renowned poets like Rumi and Hafez shaping world literature. This rich tradition makes Persian translation both challenging and fascinating, as the language carries deep cultural and poetic significance.',
    },
    {
      title: 'Widely Spoken Language',
      content:
        'Over 110 million people speak Persian worldwide, making it one of the most significant languages in the Middle East and Central Asia. Persian is primarily spoken in Iran, Afghanistan (as Dari), and Tajikistan (as Tajik), with slight variations in dialect and script.',
    },
  ],
  userInterests: [
    {
      title: 'Business Communication',
      content:
        'Break down language barriers in international business with accurate English to Persian translations. Whether you need to translate contracts, emails, presentations, or marketing materials, our tool ensures professional and culturally appropriate translations that maintain business context and terminology.',
    },
    {
      title: 'Academic Research',
      content:
        'Access Persian academic resources and share your research with Persian-speaking scholars using our reliable translation tool. Perfect for translating research papers, academic articles, and educational materials while maintaining technical accuracy and academic integrity.',
    },
    {
      title: 'Cultural Exchange',
      content:
        'Explore Persian literature, poetry, and cultural content by translating English works into beautiful, natural-sounding Persian. From classic poetry to modern literature, our translator helps bridge cultural gaps and facilitates meaningful cross-cultural understanding and appreciation.',
    },
    {
      title: 'Travel Preparation',
      content:
        'Prepare for your trip to Iran, Afghanistan, or Tajikistan by learning key phrases and understanding local culture through translation. Essential for travelers, our tool helps with navigation, basic conversations, and cultural etiquette in Persian-speaking regions.',
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
    'english-to-persian-translator',
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
