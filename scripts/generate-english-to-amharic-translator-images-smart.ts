#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'english-to-amharic-translator',
  whatIs: {
    title: '什么是英译阿姆哈拉语翻译工具？',
    content:
      '这是一款创新的翻译工具，专为将英语文本精准翻译为阿姆哈拉语而设计，支持商务合同和技术文档的专业术语，并提供社区实时协作功能。',
    style: 'artistic, creative, unique',
  },
  funFacts: [
    {
      title: '阿姆哈拉语的趣味性',
      content: '阿姆哈拉语是埃塞俄比亚的官方语言，拥有超过220个字母。',
      style: 'artistic, creative, unique',
    },
    {
      title: '翻译工具的进步',
      content: '我们工具的动态纠错功能能让翻译质量随着使用次数不断提升。',
      style: 'artistic, creative, unique',
    },
  ],
  userInterests: [
    {
      title: '商务应用',
      content:
        '我们的工具为商务人士提供精准的合同和技术文档翻译，助您在国际市场中游刃有余。',
      style: 'artistic, creative, unique',
    },
    {
      title: '社交互动',
      content: '通过不同风格翻译，在社交平台上无缝沟通，展现真实自我。',
      style: 'artistic, creative, unique',
    },
    {
      title: '教育资源',
      content: '帮助学生和教师获取准确的翻译，支持学术研究和语言学习。',
      style: 'artistic, creative, unique',
    },
    {
      title: '文化交流',
      content: '在文化交流中，使用我们工具，确保翻译的文化准确性和情感共鸣。',
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
    'english-to-amharic-translator',
    'en.json'
  );

  try {
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const pageName = 'EnglishToAmharicTranslatorPage';

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
        `What is english-to-amharic-translator - Visual explanation`;
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
      'english-to-amharic-translator',
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
