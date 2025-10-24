#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: '--help',
  whatIs: {
    title: 'What is --help',
    content:
      '--help是一款专业的图片生成工具，专为企业用户设计。它提供创意设计、品牌风格保持、以及高效的版权管理，帮助企业快速生成合规的高质量图片。',
    style: 'artistic, colorful, inspiring',
  },
  userInterests: [
    {
      title: '广告创意',
      content:
        '使用--help生成高质量广告素材，确保品牌信息准确传达，提升宣传效果。',
      style: 'artistic, colorful, inspiring',
    },
    {
      title: '社交媒体内容',
      content:
        '为社交媒体平台设计引人注目的图片，增强用户互动，提升品牌影响力。',
      style: 'artistic, colorful, inspiring',
    },
    {
      title: '产品发布',
      content: '通过高品质的产品图片展示，吸引潜在客户，提升产品市场竞争力。',
      style: 'artistic, colorful, inspiring',
    },
    {
      title: '品牌推广',
      content: '始终保持品牌一致性，确保在各种推广活动中，品牌形象统一。',
      style: 'artistic, colorful, inspiring',
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
    '--help',
    'en.json'
  );

  try {
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const pageName = 'HelpPage';

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
        `What is --help - Visual explanation`;
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
      style: 'artistic, colorful, inspiring',
      keywords: ['artistic', 'colorful', 'inspiring'],
    });

    const resultPath = path.join(
      process.cwd(),
      '.tool-generation',
      '--help',
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
