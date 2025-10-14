#!/usr/bin/env node

/**
 * Generate images for Cantonese Translator using ONLY Volcano 4.0
 * Generates 8 images:
 * 1. what-is-cantonese-translator.webp
 * 2. cantonese-translator-fact-1.webp
 * 3. cantonese-translator-fact-2.webp
 * 4. cantonese-translator-interest-1.webp
 * 5. cantonese-translator-interest-2.webp
 * 6. cantonese-translator-interest-3.webp
 * 7. cantonese-translator-interest-4.webp
 * 8. cantonese-translator-how-to.webp
 * API: Volcano 4.0 ONLY (no fallback)
 */

import { config } from 'dotenv';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Load environment variables
config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks based on Cantonese Translator content
const imageTasks = [
  {
    filename: 'what-is-cantonese-translator.webp',
    description:
      'What is Cantonese Translator - AI-powered translation tool for Cantonese language',
    prompt:
      'A professional illustration showing Cantonese translation technology. Visualize traditional Cantonese characters (繁體字) on the left side with Hong Kong cityscape elements (Victoria Harbour, skyline), flowing into English text on the right with translation arrows. Include visual elements: Cantonese tonal marks (¹²³⁴⁵⁶), Jyutping romanization system, AI neural network patterns connecting languages, dim sum or cha chaan teng cultural icons. Modern tech colors with Hong Kong-inspired red-gold accents, clean professional design. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-fact-1.webp',
    description:
      'Fun Fact 1: Did You Know About Tones? - Cantonese has 6 to 9 tones giving it a musical quality',
    prompt:
      'An educational illustration showcasing Cantonese tonal system. Visualize musical staff with 6-9 tone levels represented as musical notes in ascending and descending patterns, each tone marked with traditional tonal marks (¹²³⁴⁵⁶⁷⁸⁹). Include visual elements: sound wave visualizations showing pitch contours, same character (媽/麻/馬/罵/嗎/嘛) displayed multiple times with different tone marks, musical tuning fork or pitch pipe, vocal cord diagram showing pitch variations, colorful tone chart with arrows indicating rising/falling patterns, VibeTrans logo helping users understand tones. Color scheme: musical harmony blues and purples, tonal gradient from low (deep blue) to high (bright yellow), educational accents. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-fact-2.webp',
    description:
      'Fun Fact 2: English Meets Cantonese - Cantonese borrows English words like taxi becomes 的士',
    prompt:
      'A vibrant illustration showing Cantonese-English code-switching. Visualize split screen: left side showing English words (TAXI, BUS, COFFEE) with arrows pointing to right side showing Cantonese borrowed words (的士, 巴士, 咖啡) in traditional characters. Include visual elements: Hong Kong street scene with bilingual signs, speech bubbles showing mixed language conversations, dictionary entries highlighting loanwords, cultural context icons (Hong Kong taxi, double-decker bus, cha chaan teng coffee), VibeTrans interface showing smart translation of code-switched text, comparison chart of common English loanwords in Cantonese. Color scheme: vibrant Hong Kong neon colors (pink, cyan, yellow), bilingual harmony blues and reds, cultural fusion oranges. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-interest-1.webp',
    description:
      'Unique Feature 1: Mastering Cantonese Tones - VibeTrans as personal Cantonese mentor breaking down 6-9 tones',
    prompt:
      'An inspiring educational illustration of tone mastery. Visualize friendly AI mentor character (robot or wise teacher) pointing at interactive tone chart with 6-9 levels, student character practicing pronunciation with headphones, tone visualization showing accurate vs. inaccurate attempts. Include visual elements: pronunciation guide with mouth/tongue position diagrams, tone practice ladder from beginner to expert, audio waveform showing correct pitch patterns, achievement badges (bronze/silver/gold) for tone mastery, practice microphone, real-time feedback display, Hong Kong street signs in background showing real-world application. Color scheme: educational blues, achievement golds, mentor-friendly greens, confidence-inspiring purples. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-interest-2.webp',
    description:
      'Unique Feature 2: Slang and Street Talk - VibeTrans understanding Cantonese slang from 撚 to 扑街',
    prompt:
      'A vibrant street culture illustration showing Cantonese slang mastery. Visualize Hong Kong street scene (Mong Kok neon signs, dai pai dong) with colorful speech bubbles containing slang phrases (撚, 扑街, 屌, 冚家鏟), VibeTrans interface showing slang translation with cultural context explanations. Include visual elements: local guide character explaining meanings, comparison chart showing formal vs. informal Cantonese, cultural context icons (street food, MTR signs, local markets), dictionary with slang entries, Google Translate crossed out vs. VibeTrans with checkmark, pocket-sized translator device. Color scheme: vibrant neon Hong Kong colors (pink, cyan, yellow), street culture graffiti style, authentic local vibes. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-interest-3.webp',
    description:
      'Unique Feature 3: Offline Mode for Travelers - VibeTrans working without Wi-Fi in Hong Kong and Guangzhou',
    prompt:
      'A practical travel illustration showing offline functionality. Visualize split scene: Hong Kong MTR underground station and Guangzhou street market, both showing "No Wi-Fi" crossed-out signal icon, traveler confidently using phone with VibeTrans working perfectly (green checkmark). Include visual elements: airplane mode icon activated, offline download package indicator, location pins for Hong Kong and Guangzhou, compass navigation, metro map, street signs being translated in real-time, passport and travel essentials, backup translation scenarios (restaurant menu, asking directions), battery indicator showing power efficiency. Color scheme: travel adventure blues, offline reliability greens, location-specific reds and golds, confident travel purples. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-interest-4.webp',
    description:
      'Unique Feature 4: Seamless Integration with Apps - VibeTrans working in WhatsApp and WeChat',
    prompt:
      'A modern communication illustration showing app integration. Visualize smartphone screen with split messaging interface: WhatsApp (green theme) and WeChat (teal theme) both showing VibeTrans seamlessly translating conversations in real-time. Include visual elements: message bubbles with Cantonese text automatically translated to English inline, VibeTrans floating translation widget, instant translation toggle button, keyboard with translation shortcut, multiple chat windows open simultaneously, group chat with multilingual participants, translation speed indicator showing "instant", app integration icons, smooth conversation flow arrows. Color scheme: WhatsApp green, WeChat teal, integration harmony blues, real-time communication purples, user-friendly interface whites and grays. 4:3 aspect ratio.',
  },
  {
    filename: 'cantonese-translator-how-to.webp',
    description:
      'How to Use Cantonese Translator - Enter text, select language, click translate, review results',
    prompt:
      'A clean tutorial illustration showing step-by-step Cantonese translation process. Visualize four-step workflow: 1) input field with Cantonese text sample (你好) and upload icons for files, 2) language selection dropdown showing "Cantonese ↔ English" with flag icons, 3) prominent translate button with AI processing animation and sparkles, 4) results panel showing translated output with copy/download/audio playback options. Include visual elements: numbered step circles (1-4) in gold, Cantonese character input example, bilingual flag selector (Hong Kong flag and UK/US flags), file upload icon supporting .txt/.docx, voice input microphone button, translation progress indicator with loading animation, formatted results display with traditional and simplified character options, action buttons (copy clipboard, download file, speaker audio). Color scheme: tutorial instructional blues, action button success greens, interface clean whites and light grays, accent Hong Kong gold-red. Modern UI flat design, 4:3 aspect ratio.',
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

  // Convert to WebP with optimization
  await sharp(buffer).webp({ quality: 85, effort: 6 }).toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

async function generateAllImages() {
  console.log(
    '\n🎨 Starting image generation for Cantonese Translator (Volcano 4.0 ONLY)...\n'
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
  }
}

// Run the generator
generateAllImages().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
