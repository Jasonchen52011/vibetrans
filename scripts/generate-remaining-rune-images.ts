#!/usr/bin/env npx tsx

/**
 * 生成剩余的2张Rune图片
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// 只生成剩下的2张图片
const remainingTasks = [
  {
    filename: 'rune-artists-collaboration-studio.webp',
    description:
      'Creative Collaboration - Digital artists designing rune graphics in modern studio',
    prompt:
      'Modern creative design studio with diverse team of digital artists collaborating on rune-themed project, multiple computer screens showing rune designs, bright professional lighting, whiteboards with brainstorming sketches, contemporary office environment with plants and modern furniture, artists discussing and pointing at designs, sense of creative energy and professional collaboration, clean bright photography style, high-end design studio aesthetic. 4:3 aspect ratio.',
  },
  {
    filename: 'rune-streamer-professional-setup.webp',
    description:
      "Content Creator's Dream - Professional streaming setup with rune-themed channel branding",
    prompt:
      'Professional live streaming setup with multiple monitors displaying rune-themed channel graphics, RGB gaming keyboard and mouse with custom rune keycaps, professional microphone and camera equipment, streaming software interface showing chat and alerts with rune animations, modern gaming chair and desk with organized cable management, professional streaming room with soundproofing and LED lighting, high-quality production equipment, sense of professional content creation, clean modern streaming aesthetic with custom rune branding elements. 4:3 aspect ratio.',
  },
];

async function downloadAndConvertImage(
  url: string,
  outputPath: string
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 优化到90kb左右
  await sharp(buffer)
    .webp({
      quality: 80,
      effort: 6,
      method: 6,
      smartSubsample: true,
    })
    .resize(1400, 1050, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);
}

async function generateRemainingImages() {
  console.log('🎨 生成剩余的Rune图片...\n');

  for (const task of remainingTasks) {
    try {
      console.log(`🖼️  生成: ${task.filename}`);

      const result = await generateVolcanoImage({
        prompt: task.prompt,
        mode: 'text',
        size: '2K',
        watermark: false,
      });

      const outputPath = path.join(OUTPUT_DIR, task.filename);
      await downloadAndConvertImage(result.data[0].url, outputPath);

      console.log(`✅ 完成: ${task.filename}\n`);

      // 等待3秒
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`❌ 失败: ${task.filename}`, error);
    }
  }

  console.log('🎉 所有图片生成完成！');
}

generateRemainingImages().catch(console.error);
