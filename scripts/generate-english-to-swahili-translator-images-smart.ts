#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'english-to-swahili-translator',
  whatIs: {
    title: 'What is Our Translator?',
    content:
      '这是一款先进的翻译工具，专为英语和斯瓦希里语之间的准确转换而设计，支持多种格式和实时语音对话。',
    style: 'clean, professional, trustworthy',
  },
  funFacts: [
    {
      title: 'Did You Know?',
      content: '斯瓦希里语是非洲最广泛使用的语言之一，拥有超过1亿使用者。',
      style: 'clean, professional, trustworthy',
    },
    {
      title: 'Cultural Insight',
      content:
        '斯瓦希里语中有许多独特的俚语和文化表达方式，反映了其丰富的历史。',
      style: 'clean, professional, trustworthy',
    },
  ],
  userInterests: [
    {
      title: 'Business Expansion',
      content: '利用我们的翻译工具，轻松拓展您的业务至非洲市场，沟通无障碍。',
      style: 'clean, professional, trustworthy',
    },
    {
      title: 'Travel Easier',
      content: '借助翻译工具，您的非洲之旅将更加便捷，随时了解当地文化。',
      style: 'clean, professional, trustworthy',
    },
    {
      title: 'Cultural Connection',
      content: '通过我们的平台，深入了解斯瓦希里文化，增强跨文化交流能力。',
      style: 'clean, professional, trustworthy',
    },
    {
      title: 'Educational Resources',
      content: '丰富的学习资源助力语言学习者快速掌握斯瓦希里语，提高语言能力。',
      style: 'clean, professional, trustworthy',
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
    'english-to-swahili-translator',
    'en.json'
  );

  try {
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const pageName = 'EnglishToSwahiliTranslatorPage';

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
        `What is english-to-swahili-translator - Visual explanation`;
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
      style: 'clean, professional, trustworthy',
      keywords: ['clean', 'professional', 'trustworthy'],
    });

    const resultPath = path.join(
      process.cwd(),
      '.tool-generation',
      'english-to-swahili-translator',
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
