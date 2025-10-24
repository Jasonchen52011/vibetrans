#!/usr/bin/env node

/**
 * Generate images for Rune Translator using ONLY Volcano 4.0
 * Generates 6 new images:
 * 1. rune-ancient-carving-mystical.webp
 * 2. rune-warrior-campfire-reading.webp
 * 3. rune-cosplay-convention-modern.webp
 * 4. rune-tabletop-gaming-friends.webp
 * 5. rune-artists-collaboration-studio.webp
 * 6. rune-streamer-professional-setup.webp
 * API: Volcano 4.0 ONLY (no fallback)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

// Load environment variables
config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks for Rune Translator
const imageTasks = [
  {
    filename: 'rune-ancient-carving-mystical.webp',
    description:
      'Magical Origins - Ancient Viking runes carved into stone with mystical blue energy',
    prompt:
      'Ancient Viking stone tablet with Elder Futhark runes carved deeply into the surface, glowing with mystical blue ethereal energy, enchanted forest background with misty atmosphere, ancient Norse mythology themes, magical particles floating in air, dramatic cinematic lighting with god rays filtering through trees, epic fantasy art style, hyper-detailed textures showing ancient weathered stone, mysterious blue magical aura surrounding the runes, sense of ancient power and wisdom. 4:3 aspect ratio.',
  },
  {
    filename: 'rune-warrior-campfire-reading.webp',
    description:
      'Viking Communication - Norse warrior reading ancient rune scrolls by campfire',
    prompt:
      'Norse Viking warrior in traditional leather armor and furs sitting by warm crackling campfire in ancient forest clearing at night, carefully reading ancient scroll with Elder Futhark runes illuminated by firelight, facial expression of wisdom and concentration, authentic Viking cultural details, dramatic warm orange firelight casting shadows, mystical atmosphere connecting past and present, background of dark forest with stars visible, cinematic historical fantasy style, highly detailed with authentic period clothing and weapons. 4:3 aspect ratio.',
  },
  {
    filename: 'rune-cosplay-convention-modern.webp',
    description:
      'Convention Ready - Modern cosplayer with glowing rune accessories at fantasy convention',
    prompt:
      'Enthusiastic modern cosplayer at vibrant fantasy convention, wearing elaborate fantasy costume with glowing LED rune accessories that pulse with blue energy, convention hall background with colorful lights and excited crowds, multiple cosplayers in elaborate fantasy costumes, displays of fantasy art and merchandise, contemporary photography style with bright vivid colors, sense of community and celebration of fantasy culture, professional event photography quality, dynamic pose showing off detailed rune accessories. 4:3 aspect ratio.',
  },
  {
    filename: 'rune-tabletop-gaming-friends.webp',
    description:
      'Game Night Enhanced - Friends playing Dungeons & Dragons with rune-inscribed game pieces',
    prompt:
      'Cozy tabletop gaming session with diverse group of friends playing Dungeons & Dragons around wooden table, room decorated with fantasy posters and warm lighting, game master showing rune-inscribed battle map and dice, players engaged and laughing, RPG books and character sheets visible, bowls of snacks and drinks, intimate social gaming atmosphere, warm ambient lighting creating sense of friendship and community, detailed game pieces with custom rune designs, modern lifestyle photography with candid authentic moments. 4:3 aspect ratio.',
  },
  {
    filename: 'rune-artists-collaboration-studio.webp',
    description:
      'Creative Collaboration - Digital artists designing rune graphics in modern studio',
    prompt:
      'Modern creative design studio with diverse team of digital artists collaborating on rune-themed project, multiple computer screens showing rune designs and digital art tools, bright professional lighting, whiteboards with brainstorming sketches, contemporary office environment with plants and modern furniture, artists discussing and pointing at designs, sense of creative energy and professional collaboration, clean bright photography style, high-end design studio aesthetic, multiple screens showing digital rune art in various stages of development. 4:3 aspect ratio.',
  },
  {
    filename: 'rune-streamer-professional-setup.webp',
    description:
      "Content Creator's Dream - Professional streaming setup with rune-themed channel branding",
    prompt:
      'Professional live streaming setup with multiple monitors displaying rune-themed channel graphics, RGB gaming keyboard and mouse with custom rune keycaps, professional microphone and camera equipment, streaming software interface showing chat and alerts with rune animations, modern gaming chair and desk with organized cable management, professional streaming room with soundproofing and LED lighting, high-quality production equipment, sense of professional content creation, clean modern streaming aesthetic with custom rune branding elements throughout. 4:3 aspect ratio.',
  },
];

async function downloadAndConvertImage(
  url: string,
  outputPath: string
): Promise<void> {
  console.log(`📥 Downloading image from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert to WebP with optimization for 90kb target
  await sharp(buffer)
    .webp({
      quality: 75,
      effort: 6,
      method: 6,
      smartSubsample: true,
    })
    .resize(1200, 900, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

async function generateAllImages() {
  console.log(
    '\n🎨 Starting image generation for Rune Translator (Volcano 4.0 ONLY)...\n'
  );
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
  console.log(`🔧 API: Volcano 4.0 (NO fallback)\n`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageTasks.length; i++) {
    const task = imageTasks[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🖼️  Image ${i + 1}/${imageTasks.length}: ${task.filename}`);
    console.log(`📝 Description: ${task.description}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      console.log(`🌋 [Volcano 4.0] Generating image: ${task.filename}...`);
      console.log(`📝 Prompt: ${task.prompt.substring(0, 100)}...`);

      const result = await generateVolcanoImage({
        prompt: task.prompt,
        mode: 'text',
        size: '2K',
        watermark: false,
      });

      const imageUrl = result.data[0].url;
      console.log(`\n🔗 Generated URL: ${imageUrl}`);
      if (result.data[0].revised_prompt) {
        console.log(
          `📄 Revised prompt: ${result.data[0].revised_prompt.substring(0, 100)}...`
        );
      }
      console.log(`🤖 Model used: Volcano 4.0`);

      // Download and convert to WebP
      const outputPath = path.join(OUTPUT_DIR, task.filename);
      await downloadAndConvertImage(imageUrl, outputPath);

      successCount++;
      console.log(`\n✅ Successfully generated: ${task.filename}`);
    } catch (error: any) {
      failCount++;
      console.error(`\n❌ Failed to generate ${task.filename}:`, error.message);

      // Continue with next image instead of stopping
      console.log(`🔄 Continuing with next image...`);
    }

    // Add delay between requests to avoid rate limiting
    if (i < imageTasks.length - 1) {
      console.log(`⏱️  Waiting 3 seconds before next request...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 GENERATION SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Success: ${successCount}/${imageTasks.length}`);
  console.log(`❌ Failed: ${failCount}/${imageTasks.length}`);
  console.log(`📂 Output directory: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(80)}\n`);

  if (failCount > 0) {
    console.warn(`⚠️  Some images failed to generate. Please retry manually.`);
    process.exit(1);
  } else {
    console.log(`🎉 All images generated successfully!`);
    console.log(
      `🌐 Visit http://localhost:3001/rune-translator to see the updated images!`
    );
  }
}

// Run the generator
generateAllImages().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
