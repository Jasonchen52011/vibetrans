#!/usr/bin/env node

/**
 * Generate images for creole-to-english-translator using Article Illustrator
 * Generates 7 images:
 * 1. what-is-creole-to-english-translator.webp
 * 2. creole-to-english-translator-fact-1.webp
 * 3. creole-to-english-translator-fact-2.webp
 * 4. creole-to-english-translator-interest-1.webp
 * 5. creole-to-english-translator-interest-2.webp
 * 6. creole-to-english-translator-interest-3.webp
 * 7. creole-to-english-translator-interest-4.webp
 * Note: how-to image is generated via screenshot script
 */

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks based on creole-to-english-translator content
const imageTasks = [
  {
    filename: 'what-is-creole-to-english-translator.webp',
    description:
      'Creole to English Translator - A tool designed to convert Creole languages into English accurately',
    prompt:
      'A professional illustration showing language translation between Haitian Creole and English. Visualize a Creole text document on the left transforming into clear English text on the right. Include visual elements like speech bubbles with Creole/English flags, translation arrows, and bilingual communication symbols. Modern blue-green gradient colors, clean design, international communication theme. 4:3 aspect ratio.',
  },
  {
    filename: 'creole-to-english-translator-fact-1.webp',
    description:
      "Fun Fact 1: Creole's French Roots - Over 90% of Haitian Creole words come from French",
    prompt:
      'An educational illustration showing the connection between French and Haitian Creole languages. Visualize the French flag and French words transforming into Creole text, with statistical graphics showing 90% origin overlap. Include French vocabulary roots, language evolution timeline, etymology connection arrows. Academic theme with French blue-white-red accents and Caribbean turquoise colors. 4:3 aspect ratio.',
  },
  {
    filename: 'creole-to-english-translator-fact-2.webp',
    description:
      "Fun Fact 2: Creole's Unique Grammar - Relies on particles like 'te', 'ap', 'pral' instead of verb conjugations",
    prompt:
      'A linguistic illustration showing Creole grammar particles and tense system. Visualize three distinct particle markers "te" (past), "ap" (present), "pral" (future) as building blocks, contrasting with traditional verb conjugation tables crossed out. Include timeline arrows, grammatical structure diagrams, and simple vs complex comparison. Educational purple-blue gradients with grammar chart aesthetics. 4:3 aspect ratio.',
  },
  {
    filename: 'creole-to-english-translator-interest-1.webp',
    description:
      'Dialects and Variations - Explore differences among Haitian, Louisiana, and other Creole variants',
    prompt:
      'An illustration showing diverse Creole dialect map across Caribbean and Louisiana regions. Visualize Haiti, Louisiana, and other Creole-speaking locations with connecting lines, dialect variation symbols, regional vocabulary differences. Include map markers, language variation icons, cultural elements from each region (Haitian flag, Louisiana bayou, Caribbean islands). Colorful multicultural theme with geographic blue-green tones. 4:3 aspect ratio.',
  },
  {
    filename: 'creole-to-english-translator-interest-2.webp',
    description:
      "Idioms and Expressions - Decode phrases like 'm ap boule' for seamless communication",
    prompt:
      'A playful illustration showing Creole idioms and expressions with literal vs actual meanings. Visualize the phrase "m ap boule" (I\'m doing well) with creative representation - a person literally "burning/boiling" transforming into happy, thriving person. Include speech bubbles with Creole phrases, meaning unlock keys, expression cards. Fun orange-yellow gradients with playful communication theme. 4:3 aspect ratio.',
  },
  {
    filename: 'creole-to-english-translator-interest-3.webp',
    description:
      'Offline Translation - VibeTrans offers offline capabilities for uninterrupted service',
    prompt:
      'A practical illustration showing offline translation capability in remote locations. Visualize a person using translator app in remote Haitian countryside or Caribbean island with no wifi signal (crossed-out wifi icon), but translation still working successfully. Include offline mode badge, download icon, local storage symbols, remote landscape background. Reliable green-blue theme with mobile device interface. 4:3 aspect ratio.',
  },
  {
    filename: 'creole-to-english-translator-interest-4.webp',
    description:
      'Learning Mode - Turn translations into learning experience with interactive flashcards',
    prompt:
      'An educational illustration showing interactive learning features for Creole language acquisition. Visualize flashcards with Creole words on one side flipping to reveal English meanings, vocabulary progress bars, highlighted key terms, learning achievement badges. Include study desk setup, brain with lightbulb for learning, progress tracking graphs, gamification stars. Encouraging educational purple-blue gradients. 4:3 aspect ratio.',
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
  console.log('\n🎨 Starting image generation for creole-to-english-translator...\n');
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);

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
      const result = await generateIllustration({
        prompt: task.prompt,
        filename: task.filename,
      });

      console.log(`\n🔗 Generated URL: ${result.url}`);
      if (result.revisedPrompt) {
        console.log(
          `📄 Revised prompt: ${result.revisedPrompt.substring(0, 100)}...`
        );
      }
      console.log(`🤖 Model used: ${result.modelUsed}`);

      // Download and convert to WebP
      const outputPath = path.join(OUTPUT_DIR, task.filename);
      await downloadAndConvertImage(result.url, outputPath);

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
