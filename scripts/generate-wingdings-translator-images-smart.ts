#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'wingdings-translator',
  whatIs: {
    title: 'What is Wingdings Translator',
    content:
      'A Wingdings translator is a powerful tool that converts regular text into Wingdings symbols and vice versa. Wingdings is a symbolic font created by Microsoft that uses various symbols instead of letters, numbers, and punctuation marks. Our translator makes it easy to encode and decode messages using this iconic font. Perfect for creating unique messages, understanding Wingdings text, and exploring the fascinating world of symbolic communication.',
    style: {
      style: 'modern, clean, typographic',
      keywords: [
        'wingdings',
        'symbols',
        'font translation',
        'microsoft',
        'typography',
      ],
      layout: 'clear, instructional',
    },
  },
  funFacts: [
    {
      title: 'Microsoft\'s Creation',
      content:
        'Wingdings was created by Microsoft in 1990 as part of the Windows 3.1 operating system. It was designed to include a variety of useful symbols for documents, featuring everything from basic shapes to complex icons. This revolutionary font transformed how people could express themselves through symbolic communication.',
      style: {
        style: 'modern, clean, typographic',
        keywords: [
          'wingdings',
          'microsoft',
          'font history',
          'windows',
          'typography',
        ],
        layout: 'historical, informative',
      },
    },
    {
      title: 'Hidden Easter Eggs',
      content:
        'Wingdings contains several interesting Easter eggs and hidden symbols. For example, certain character combinations reveal special icons and symbols that aren\'t immediately obvious. These hidden features have made Wingdings a favorite among designers and typography enthusiasts who enjoy discovering its secrets.',
      style: {
        style: 'modern, clean, typographic',
        keywords: [
          'wingdings',
          'easter eggs',
          'hidden symbols',
          'design',
          'typography',
        ],
        layout: 'mysterious, engaging',
      },
    },
  ],
  userInterests: [
    {
      title: 'Symbol Gallery',
      content:
        'Explore our complete Wingdings symbol gallery to see every available character and its corresponding symbol. Perfect for finding the right symbol for your message, understanding character mappings, and discovering the full potential of symbolic communication. Browse through our comprehensive collection to unlock creative possibilities.',
      style: {
        style: 'modern, clean, typographic',
        keywords: [
          'wingdings',
          'symbol gallery',
          'character mapping',
          'design',
          'typography',
        ],
        layout: 'gallery showcase, comprehensive',
      },
    },
    {
      title: 'Font Compatibility',
      content:
        'Learn about font compatibility issues with Wingdings and how to ensure your symbols display correctly across different devices and platforms. Understanding compatibility helps you create messages that work everywhere, from web pages to printed documents, ensuring your symbolic communication is always clear and effective.',
      style: {
        style: 'modern, clean, technical',
        keywords: [
          'wingdings',
          'font compatibility',
          'cross-platform',
          'technical',
          'design',
        ],
        layout: 'technical guide, informative',
      },
    },
    {
      title: 'Design Applications',
      content:
        'Discover creative ways to use Wingdings symbols in graphic design, presentations, and digital art projects. From creating unique logos to designing eye-catching social media posts, Wingdings offers endless possibilities for creative expression. Learn professional techniques for incorporating symbolic elements into your designs.',
      style: {
        style: 'creative, modern, artistic',
        keywords: [
          'wingdings',
          'design applications',
          'graphic design',
          'creative',
          'artistic',
        ],
        layout: 'inspirational, creative showcase',
      },
    },
    {
      title: 'Unicode Alternatives',
      content:
        'Find modern Unicode alternatives to Wingdings symbols for better web compatibility and accessibility. While Wingdings requires specific fonts, Unicode symbols work universally across all platforms and devices. Learn how to achieve similar visual effects with web-friendly symbols that reach a broader audience.',
      style: {
        style: 'modern, technical, clean',
        keywords: [
          'wingdings',
          'unicode alternatives',
          'web compatibility',
          'accessibility',
          'modern',
        ],
        layout: 'technical comparison, modern solutions',
      },
    },
  ],
  howto: {
    title: 'How to Use Wingdings Translator',
    content:
      'Learn how to convert text to Wingdings symbols in just a few simple steps. Start by entering your text in the input area - you can type letters, numbers, and basic punctuation. Click the Translate button to instantly convert your text into Wingdings symbols. Copy the result to your clipboard for use anywhere. To decode Wingdings text back to regular text, simply paste the symbols and translate again. It\'s that simple to encode and decode messages using Wingdings!',
    style: {
      style: 'modern, clean, instructional',
      keywords: [
        'wingdings',
        'translator tutorial',
        'step-by-step',
        'text conversion',
        'symbols',
      ],
      layout: 'step-by-step guide, clear instructions',
    },
  },
};

/**
 * 更新JSON文件中的图片路径
 */
async function updateJsonImagePaths(result: any) {
  console.log('\n📝 STEP 3: 更新JSON文件中的图片路径...');

  const jsonPaths = [
    path.join(process.cwd(), 'messages/pages/wingdings-translator/en.json'),
    path.join(process.cwd(), 'messages/pages/wingdings-translator/zh.json'),
  ];

  for (const jsonPath of jsonPaths) {
    try {
      // 读取现有JSON文件
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);

      // 映射生成结果到JSON字段
      const imageMapping = {
        'what-is-wingdings-translator': jsonData.WingdingsTranslatorPage.whatIs,
        'wingdings-translator-how-to': jsonData.WingdingsTranslatorPage.howto,
        'wingdings-translator-fact-1': jsonData.WingdingsTranslatorPage.funFacts.items[0],
        'wingdings-translator-fact-2': jsonData.WingdingsTranslatorPage.funFacts.items[1],
        'wingdings-translator-interest-1': jsonData.WingdingsTranslatorPage.userInterest.items[0],
        'wingdings-translator-interest-2': jsonData.WingdingsTranslatorPage.userInterest.items[1],
        'wingdings-translator-interest-3': jsonData.WingdingsTranslatorPage.userInterest.items[2],
        'wingdings-translator-interest-4': jsonData.WingdingsTranslatorPage.userInterest.items[3],
      };

      // 更新图片路径
      if (result.generatedImages) {
        result.generatedImages.forEach((img: any) => {
          const mapping = imageMapping[img.filename];
          if (mapping) {
            mapping.image = `/images/docs/${img.filename}.webp`;
          }
        });
      }

      // 保存更新后的JSON
      await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
      console.log(`✅ JSON文件更新完成: ${path.basename(jsonPath)}`);
    } catch (error) {
      console.error(`❌ JSON文件更新失败 ${path.basename(jsonPath)}:`, error);
      throw error;
    }
  }
}

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: true,
    style: 'modern, clean, typographic',
    keywords: [
      'wingdings',
      'symbols',
      'font translation',
      'microsoft',
      'typography',
    ],
  });

  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'wingdings-translator',
    'image-generation-result.json'
  );
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ 图片生成成功');

    // 更新JSON文件
    await updateJsonImagePaths(result);

    console.log('🎉 全部工作完成！图片已生成并更新到页面JSON文件中。');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();