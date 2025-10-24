#!/usr/bin/env tsx

/**
 * 重新生成Wingdings翻译器的特定图片
 * Design Applications, Microsoft's Creation, Hidden Easter Eggs
 */

import { generateArticleIllustrations } from '@/lib/article-illustrator/workflow';

async function generateSpecificWingdingsImages() {
  console.log('🎨 开始重新生成Wingdings翻译器特定图片...\n');

  const specificImages = [
    {
      filename: 'wingdings-design-tools',
      title: 'Design Applications',
      description: 'Discover creative ways to use Wingdings symbols in graphic design, presentations, and digital art projects.',
      alt: 'Wingdings Design Applications'
    },
    {
      filename: 'wingdings-microsoft-creation',
      title: "Microsoft's Creation",
      description: 'Wingdings was created by Microsoft in 1990 as part of the Windows 3.1 operating system. It was designed to include a variety of useful symbols for documents.',
      alt: 'Microsoft Wingdings History'
    },
    {
      filename: 'wingdings-hidden-easter-eggs',
      title: 'Hidden Easter Eggs',
      description: 'Wingdings contains several Easter eggs. For example, typing NYC displays symbols that some people interpreted as anti-Semitic, leading to controversy in the 1990s.',
      alt: 'Wingdings Easter Eggs'
    }
  ];

  for (const image of specificImages) {
    console.log(`🎨 正在生成: ${image.title}`);

    try {
      await generateArticleIllustrations({
        title: image.title,
        description: image.description,
        filename: image.filename,
        alt: image.alt,
        outputPath: 'public/images/docs/',
        skipIfExists: false // 强制重新生成
      });

      console.log(`✅ 成功生成: ${image.title}\n`);
    } catch (error) {
      console.error(`❌ 生成失败: ${image.title}`);
      console.error(`错误: ${error}\n`);
    }
  }

  console.log('🎉 所有图片生成完成！');
}

// 运行脚本
generateSpecificWingdingsImages().catch(console.error);