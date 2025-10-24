#!/usr/bin/env node

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';

// 手动定义的 prompts，基于 Drow Translator Team Use 内容
const TEAM_USE_PROMPTS = [
  {
    title: 'Gaming & Roleplaying',
    filename: 'drow-translator-interest-1',
    prompt:
      'Geometric flat illustration, sky blue dominant backdrop, showing D&D gaming session with Dark Elf character. Central focus: gaming table with D&D maps, dice (geometric cubes), character sheets showing Drow language text. Cartoon players (simplified circular heads, rectangular bodies) sit around table, one pointing at Drow translator on laptop screen. Floating elements: Drow speech bubbles, fantasy city skyline, gaming icons. Background: geometric castle shapes, fantasy map elements. 4:3 aspect ratio, clean and modern gaming atmosphere.',
  },
  {
    title: 'Creative Writing Projects',
    filename: 'drow-translator-interest-2',
    prompt:
      "Geometric flat illustration, sky blue dominant, showing writer's workspace with fantasy elements. Central: laptop displaying Drow text translation interface, open fantasy manuscript with Drow dialogue. Cartoon writer (circular head, beret) working at desk. Surrounding elements: fantasy book covers with Drow titles, character development charts, story maps. Floating: quill pens, coffee cup, story structure diagrams. Background: geometric bookshelves, fantasy kingdom silhouette. 4:3 aspect ratio, creative and inspiring atmosphere.",
  },
  {
    title: 'Academic Research',
    filename: 'drow-translator-interest-3',
    prompt:
      'Geometric flat illustration, sky blue dominant, showing academic study environment. Central: research desk with linguistics books showing Drow language analysis, computer displaying linguistic patterns. Cartoon researcher (circular head, glasses) analyzing Drow text structure. Elements: linguistic diagrams, phonetic charts, grammar trees, research papers with Drow examples. Background: geometric university building, library shelves, language family trees. 4:3 aspect ratio, scholarly and analytical atmosphere.',
  },
  {
    title: 'Cosplay & Events',
    filename: 'drow-translator-interest-4',
    prompt:
      'Geometric flat illustration, sky blue dominant, showing cosplay preparation scene. Central: full-length mirror with Dark Elf cosplayer, smartphone displaying Drow language translator app. Elements: cosplay materials, fabric samples, costume sketches with Drow text labels, makeup station. Floating: Drow speech bubbles for practice, event tickets, convention badges. Background: geometric convention center silhouette, fantasy event posters. 4:3 aspect ratio, creative and community-focused atmosphere.',
  },
];

/**
 * 生成单张图片
 */
async function generateSingleImage(promptData, index) {
  console.log(`\n🎨 [${index + 1}/4] Generating: ${promptData.title}`);
  console.log(`📝 Prompt: ${promptData.prompt.substring(0, 100)}...`);

  try {
    // Step 1: 生成图片
    console.log(`📋 Step 1: Generating image with KIE API...`);
    const imageResult = await generateImageWithKie(promptData.prompt, {
      imageSize: '4:3',
      outputFormat: 'png',
    });

    console.log(`✅ Image generated: ${imageResult.url}`);

    // Step 2: 转换为 WebP
    console.log(`📋 Step 2: Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageResult.url, {
      filename: promptData.filename,
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
    console.error(
      `❌ Failed to generate ${promptData.title}: ${error.message}`
    );
    return false;
  }
}

/**
 * 重新生成所有 Team Use 图片
 */
async function regenerateTeamUseImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating Drow Translator Team Use Images (Simple Mode)');
  console.log('='.repeat(70));

  let successCount = 0;
  const totalCount = TEAM_USE_PROMPTS.length;

  for (let i = 0; i < totalCount; i++) {
    const promptData = TEAM_USE_PROMPTS[i];
    const success = await generateSingleImage(promptData, i);

    if (success) {
      successCount++;
    }

    // 添加延迟避免 API 限制
    if (i < totalCount - 1) {
      console.log('\n⏱️ Waiting 3 seconds before next generation...\n');
      await new Promise((resolve) => setTimeout(resolve, 3000));
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
