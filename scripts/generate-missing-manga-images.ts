#!/usr/bin/env node

import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

config({ path: '.env.local' });

const missingImages = [
  {
    filename: 'what-is-manga-translator',
    prompt:
      'Professional illustration showcasing manga translation technology center. Visualize a modern interface displaying manga panels being processed by AI translation. Include elements: Japanese manga pages with speech bubbles, AI translation visualization with neural network patterns, side-by-side comparison of original and translated text, language selection interface (Japanese↔English↔Chinese), cultural adaptation tools, and professional editing workspace. Style: sleek tech interface with manga aesthetics, clean design with vibrant manga-inspired colors, 4:3 aspect ratio.',
  },
  {
    filename: 'manga-translator-interest-4',
    prompt:
      'Beautiful illustration depicting cultural exchange through manga translation. Show Japanese creators and international fans connected through translated works across a global network. Include elements: traditional Japanese pagodas and modern skyscrapers connected by digital bridges, manga characters wearing cultural outfits from different countries, international readers enjoying translated manga on various devices, cultural artifacts merging (origami with Western bookbinding), fan conventions with diverse attendees, and collaborative creation spaces. Style: harmonious blend of traditional Japanese art and modern digital aesthetics with warm, inclusive colors.',
  },
];

async function generateMissingImages() {
  console.log('🎨 Generating missing manga translator images...\n');

  for (let i = 0; i < missingImages.length; i++) {
    const image = missingImages[i];
    console.log(`🎯 Processing: ${image.filename}`);
    console.log('-'.repeat(50));

    try {
      console.log('📋 Generating image with Volcano 4.0 API...');

      const result = await generateVolcanoImage({
        prompt: image.prompt,
        mode: 'text',
        size: '2K',
        watermark: false,
      });

      const url = result.data[0].url;
      console.log('✅ Image generated:', url);

      console.log('📥 Downloading and converting to WebP...');
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());

      await sharp(buffer)
        .webp({ quality: 85, effort: 6 })
        .toFile(`public/images/docs/${image.filename}.webp`);

      console.log(`✅ Image saved: public/images/docs/${image.filename}.webp`);

      if (i < missingImages.length - 1) {
        console.log('⏱️  Waiting 3 seconds before next request...\n');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error: any) {
      console.error(`❌ Failed to generate ${image.filename}:`, error.message);
      continue;
    }

    console.log('-'.repeat(50));
    console.log(`✅ Success: ${image.filename}.webp\n`);
  }

  console.log('🎉 All missing manga translator images generated!');
}

generateMissingImages().catch(console.error);
