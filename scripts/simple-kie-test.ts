#!/usr/bin/env npx tsx

/**
 * 简单的KIE.AI图片生成测试
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { generateImageWithSeedream } from '../src/lib/kie-text-to-image';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'docs');

async function testGenerate() {
  try {
    console.log('🎨 开始测试KIE.AI Seedream 4.0图片生成...');

    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const result = await generateImageWithSeedream(
      'Viking runes carved into ancient stone tablet, glowing with mystical blue energy, forest background, fantasy art style, highly detailed',
      {
        imageSize: 'landscape_4_3',
        imageResolution: '2K',
      }
    );

    console.log('✅ 图片生成成功:', result.url);

    // 下载图片
    const response = await fetch(result.url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const outputPath = path.join(OUTPUT_DIR, 'test-rune-image.webp');
    await fs.writeFile(outputPath, buffer);

    console.log('✅ 图片已保存:', outputPath);
  } catch (error) {
    console.error('❌ 生成失败:', error);
  }
}

testGenerate();
