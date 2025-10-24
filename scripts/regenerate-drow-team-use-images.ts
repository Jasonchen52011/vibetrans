#!/usr/bin/env node

import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';

// Drow Translator Team Use 内容
const TEAM_USE_CONTENTS = [
  {
    title: 'Gaming & Roleplaying',
    content:
      'Perfect for D&D campaigns, creating authentic Dark Elf characters and immersive fantasy worlds.',
    filename: 'drow-translator-interest-1',
  },
  {
    title: 'Creative Writing Projects',
    content:
      'Essential for fantasy authors developing Dark Elf storylines and authentic dialogue.',
    filename: 'drow-translator-interest-2',
  },
  {
    title: 'Academic Research',
    content:
      'Valuable for linguistics students studying constructed languages and fictional writing systems.',
    filename: 'drow-translator-interest-3',
  },
  {
    title: 'Cosplay & Events',
    content:
      'Helps cosplayers create authentic Dark Elf personas with accurate linguistic elements.',
    filename: 'drow-translator-interest-4',
  },
];

/**
 * 生成单张图片
 */
async function generateSingleImage(content, index) {
  console.log(`\n🎨 [${index + 1}/4] Generating: ${content.title}`);
  console.log(`📝 Content: ${content.content.substring(0, 50)}...`);

  try {
    // Step 1: 生成 prompt
    console.log(`📋 Step 1: Generating prompt...`);
    const { prompt } = await testGeneratePrompt(content.title, content.content);
    console.log(`✅ Prompt generated (${prompt.length} chars)`);

    // Step 2: 生成图片
    console.log(`📋 Step 2: Generating image with KIE API...`);
    const imageResult = await generateImageWithKie(prompt, {
      imageSize: '4:3',
      outputFormat: 'png',
    });

    console.log(`✅ Image generated: ${imageResult.url}`);

    // Step 3: 转换为 WebP
    console.log(`📋 Step 3: Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageResult.url, {
      filename: content.filename,
      targetSize: 90,
    });

    if (webpResult.success) {
      console.log(`✅ Success: ${webpResult.filename} (${webpResult.size}KB)`);
      console.log(`📁 Location: public/images/docs/${webpResult.filename}`);
      return true;
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error) {
    console.error(`❌ Failed to generate ${content.title}: ${error.message}`);
    return false;
  }
}

/**
 * 重新生成所有 Team Use 图片
 */
async function regenerateTeamUseImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating Drow Translator Team Use Images');
  console.log('='.repeat(70));

  let successCount = 0;
  const totalCount = TEAM_USE_CONTENTS.length;

  for (let i = 0; i < totalCount; i++) {
    const content = TEAM_USE_CONTENTS[i];
    const success = await generateSingleImage(content, i);

    if (success) {
      successCount++;
    }

    // 添加延迟避免 API 限制
    if (i < totalCount - 1) {
      console.log('\n⏱️ Waiting 2 seconds before next generation...\n');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // 输出总结
  console.log('\n' + '='.repeat(70));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log('\n🎉 All Team Use images regenerated successfully!');
  } else {
    console.log(
      '\n⚠️ Some images failed to generate. Please check the errors above.'
    );
  }
  console.log('='.repeat(70));
}

// 运行生成函数
regenerateTeamUseImages().catch(console.error);
