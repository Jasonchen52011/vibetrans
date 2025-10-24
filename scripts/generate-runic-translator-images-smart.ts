#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'runic-translator',
  whatIs: {
    title: '什么是符文翻译器？',
    content:
      '符文翻译器是一款创新工具，支持多符文字母表翻译。通过图像和OCR功能，快速识别手稿或照片中的符文，提供准确翻译，满足纹身或商品印刷需求。',
    style: 'artistic, creative, unique',
  },
  funFacts: [
    {
      title: '符文起源',
      content: '符文起源于古代欧洲，用于书写和神秘仪式，拥有丰富的历史文化。',
      style: 'artistic, creative, unique',
    },
    {
      title: '符文与纹身',
      content: '符文在现代纹身中流行，象征神秘和力量，是个人表达的独特方式。',
      style: 'artistic, creative, unique',
    },
  ],
  userInterests: [
    {
      title: '探索古代文化',
      content: '通过符文翻译器，深入了解古代欧洲文化及其神秘的符文文字。',
      style: 'artistic, creative, unique',
    },
    {
      title: '个性化设计',
      content: '利用高分辨率符文设计，创造独特的个人或商业项目。',
      style: 'artistic, creative, unique',
    },
    {
      title: '社区互动',
      content: '加入我们的符文爱好者社区，分享设计，获取灵感。',
      style: 'artistic, creative, unique',
    },
    {
      title: '多语言支持',
      content: '支持多种符文字母表，快速切换，满足不同翻译需求。',
      style: 'artistic, creative, unique',
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
    'runic-translator',
    'en.json'
  );

  try {
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const pageName = 'RunicTranslatorPage';

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
        `What is runic-translator - Visual explanation`;
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
      style: 'artistic, creative, unique',
      keywords: ['artistic', 'creative', 'unique'],
    });

    const resultPath = path.join(
      process.cwd(),
      '.tool-generation',
      'runic-translator',
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
