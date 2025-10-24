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

async function main() {
  console.log('🎨 开始生成英中翻译器图片（简化版）...\n');

  try {
    // 尝试逐个生成图片，避免并发限制
    const results = [];

    // 1. 生成 what-is 图片
    console.log('📸 正在生成 What Is 图片...');
    try {
      const whatIsResult = await generateArticleIllustrations(
        {
          toolName: 'english-to-chinese-translator',
          whatIs: sections.whatIs,
          funFacts: [],
          userInterests: [],
        },
        {
          captureHowTo: false,
          style: 'modern, professional, clean',
          keywords: ['modern', 'professional', 'clean'],
        }
      );

      if (whatIsResult.success && whatIsResult.generatedImages?.length > 0) {
        results.push(...whatIsResult.generatedImages);
        console.log('✅ What Is 图片生成成功');
      }
    } catch (error) {
      console.log(
        '❌ What Is 图片生成失败:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // 等待几秒避免API限制
    console.log('⏳ 等待 5 秒避免 API 限制...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 2. 生成第一个 fun fact
    console.log('📸 正在生成 Fun Fact 1 图片...');
    try {
      const funFact1Result = await generateArticleIllustrations(
        {
          toolName: 'english-to-chinese-translator',
          whatIs: {},
          funFacts: [sections.funFacts[0]],
          userInterests: [],
        },
        {
          captureHowTo: false,
          style: 'modern, professional, clean',
          keywords: ['modern', 'professional', 'clean'],
        }
      );

      if (
        funFact1Result.success &&
        funFact1Result.generatedImages?.length > 0
      ) {
        results.push(...funFact1Result.generatedImages);
        console.log('✅ Fun Fact 1 图片生成成功');
      }
    } catch (error) {
      console.log(
        '❌ Fun Fact 1 图片生成失败:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // 等待几秒
    console.log('⏳ 等待 5 秒避免 API 限制...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. 生成第二个 fun fact
    console.log('📸 正在生成 Fun Fact 2 图片...');
    try {
      const funFact2Result = await generateArticleIllustrations(
        {
          toolName: 'english-to-chinese-translator',
          whatIs: {},
          funFacts: [sections.funFacts[1]],
          userInterests: [],
        },
        {
          captureHowTo: false,
          style: 'modern, professional, clean',
          keywords: ['modern', 'professional', 'clean'],
        }
      );

      if (
        funFact2Result.success &&
        funFact2Result.generatedImages?.length > 0
      ) {
        results.push(...funFact2Result.generatedImages);
        console.log('✅ Fun Fact 2 图片生成成功');
      }
    } catch (error) {
      console.log(
        '❌ Fun Fact 2 图片生成失败:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // 等待几秒
    console.log('⏳ 等待 5 秒避免 API 限制...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 4. 生成 user interests（逐个）
    for (let i = 0; i < sections.userInterests.length; i++) {
      console.log(`📸 正在生成 User Interest ${i + 1} 图片...`);
      try {
        const userInterestResult = await generateArticleIllustrations(
          {
            toolName: 'english-to-chinese-translator',
            whatIs: {},
            funFacts: [],
            userInterests: [sections.userInterests[i]],
          },
          {
            captureHowTo: false,
            style: 'modern, professional, clean',
            keywords: ['modern', 'professional', 'clean'],
          }
        );

        if (
          userInterestResult.success &&
          userInterestResult.generatedImages?.length > 0
        ) {
          results.push(...userInterestResult.generatedImages);
          console.log(`✅ User Interest ${i + 1} 图片生成成功`);
        }
      } catch (error) {
        console.log(
          `❌ User Interest ${i + 1} 图片生成失败:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      // 除了最后一个，其他都要等待
      if (i < sections.userInterests.length - 1) {
        console.log('⏳ 等待 5 秒避免 API 限制...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    // 保存结果
    const resultPath = path.join(
      process.cwd(),
      '.tool-generation',
      'english-to-chinese-translator',
      'simple-generation-result.json'
    );
    await fs.writeFile(
      resultPath,
      JSON.stringify(
        {
          success: true,
          generatedImages: results,
          totalGenerated: results.length,
        },
        null,
        2
      )
    );

    console.log('\n🎉 简化版图片生成完成！');
    console.log(`📊 总共生成了 ${results.length} 张图片`);

    results.forEach((img, index) => {
      console.log(
        `${index + 1}. ${img.filename}.webp (${img.size || 'Unknown'}KB)`
      );
    });
  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error);
    process.exit(1);
  }
}

main();
