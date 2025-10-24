#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'english-to-chinese-translator',
  whatIs: {
    title: 'What is an English to Chinese Translator',
    content:
      'An English to Chinese translator is a powerful tool designed to convert text from English into Chinese accurately. VibeTrans excels in understanding idioms, professional terms, and context, making it ideal for diverse applications like business, travel, and academic work.',
    style: 'modern, professional, clean',
  },
  funFacts: [
    {
      title: 'Chinese Characters Evolution',
      content:
        'Chinese characters have evolved over 5,000 years from pictograms to modern simplified characters, making it one of the oldest continuously used writing systems in the world.',
      style: 'modern, professional, clean',
    },
    {
      title: 'Tones in Chinese Language',
      content:
        'Mandarin Chinese uses four main tones plus a neutral tone, where the same syllable can have completely different meanings based on the tone used - a unique feature that makes translation tools essential.',
      style: 'modern, professional, clean',
    },
  ],
  userInterests: [
    {
      title: 'Global Business Communication',
      content:
        'Perfect for international business negotiations, contract translations, and corporate communications between English and Chinese-speaking markets, ensuring accurate and culturally appropriate translations.',
      style: 'modern, professional, clean',
    },
    {
      title: 'Educational Content Creation',
      content:
        'Ideal for educators and students creating bilingual learning materials, translating academic papers, and developing educational resources for Chinese language learners.',
      style: 'modern, professional, clean',
    },
    {
      title: 'E-commerce Localization',
      content:
        'Essential for e-commerce businesses expanding into Chinese markets, translating product descriptions, marketing materials, and customer support content effectively.',
      style: 'modern, professional, clean',
    },
    {
      title: 'Technical Documentation',
      content:
        'Crucial for software developers and engineers translating technical documentation, API references, and user manuals for Chinese-speaking users and development teams.',
      style: 'modern, professional, clean',
    },
  ],
};

/**
 * 更新JSON文件中的图片路径
 */
async function updateJsonImagePaths(result: any) {
  console.log('\n📝 更新JSON文件中的图片路径...');

  const jsonPath = path.join(
    process.cwd(),
    'messages',
    'pages',
    'english-to-chinese-translator',
    'en.json'
  );

  try {
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const pageName = 'EnglishToChineseTranslatorPage';

    if (!jsonData[pageName]) {
      console.error('未找到页面命名空间:', pageName);
      return;
    }

    // 映射生成结果到JSON字段
    const imageMapping = {
      whatIs: jsonData[pageName].whatIs,
    };

    // 添加其他section的映射
    if (jsonData[pageName].funFacts?.items) {
      result.generatedImages?.forEach((img: any, index: number) => {
        if (
          img.section.startsWith('funFacts') &&
          jsonData[pageName].funFacts.items[index]
        ) {
          jsonData[pageName].funFacts.items[index].image =
            `/images/docs/${img.filename}.webp`;
          jsonData[pageName].funFacts.items[index].imageAlt = img.filename;
        }
      });
    }

    if (jsonData[pageName].userInterest?.items) {
      result.generatedImages?.forEach((img: any, index: number) => {
        if (
          img.section.startsWith('userInterests') &&
          jsonData[pageName].userInterest.items[index]
        ) {
          jsonData[pageName].userInterest.items[index].image =
            `/images/docs/${img.filename}.webp`;
          jsonData[pageName].userInterest.items[index].imageAlt = img.filename;
        }
      });
    }

    // 更新whatIs图片
    const whatIsImage = result.generatedImages?.find(
      (img: any) => img.section === 'whatIs'
    );
    if (whatIsImage && jsonData[pageName].whatIs) {
      jsonData[pageName].whatIs.image =
        `/images/docs/${whatIsImage.filename}.webp`;
      jsonData[pageName].whatIs.imageAlt =
        `What is english-to-chinese-translator - Visual explanation`;
    }

    // 保存更新后的JSON
    await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log('✅ JSON文件更新完成');
  } catch (error) {
    console.error('❌ JSON文件更新失败:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await generateArticleIllustrations(sections, {
      captureHowTo: true,
      style: 'modern, professional, clean',
      keywords: ['modern', 'professional', 'clean'],
    });

    const resultPath = path.join(
      process.cwd(),
      '.tool-generation',
      'english-to-chinese-translator',
      'image-generation-result.json'
    );
    await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ 图片生成成功');

      // 自动更新JSON文件
      await updateJsonImagePaths(result);

      console.log('🎉 全部工作完成！图片已生成并更新到页面JSON文件中。');
      process.exit(0);
    } else {
      console.error('❌ 图片生成失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('图片生成流程出错:', error);
    process.exit(1);
  }
}

main();
