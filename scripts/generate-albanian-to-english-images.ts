#!/usr/bin/env node

/**
 * Generate images for Albanian to English Translator using Article Illustrator
 * Generates 8 images:
 * 1. what-is-albanian-to-english.webp
 * 2. albanian-to-english-fact-1.webp
 * 3. albanian-to-english-fact-2.webp
 * 4. albanian-to-english-interest-1.webp
 * 5. albanian-to-english-interest-2.webp
 * 6. albanian-to-english-interest-3.webp
 * 7. albanian-to-english-interest-4.webp
 * 8. albanian-to-english-how-to.webp (backup, usually from screenshot)
 * Note: Primary how-to image is generated via screenshot script
 * API Priority: v3 → dreem4.0 → nanobanana
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks based on Albanian to English translator content
const imageTasks = [
  {
    filename: 'what-is-albanian-to-english.webp',
    description:
      'What is Albanian to English Translator - AI-powered translation tool',
    prompt:
      'A professional illustration showing Albanian to English translation. Visualize Albanian flag or traditional Albanian architecture (like ancient Illyrian fortress) on the left, English text/UK-US flags on the right, with flowing translation arrows and AI neural network patterns connecting them. Include Albanian alphabet characters (ë, ç) transforming into English letters. Modern tech colors (blue-teal gradients), clean design, professional translation theme. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-fact-1.webp',
    description:
      "Fun Fact 1: Albanian forms its own unique branch in Indo-European language family with 7 million speakers, preserving ancient features and using 36 letters including 'ë' and 'ç'",
    prompt:
      'An academic illustration showing Albanian as a unique language branch. Visualize an Indo-European language family tree with Albanian highlighted as its own distinct branch. Include visual elements: 36 Albanian alphabet letters displayed in an elegant grid, special characters ë and ç emphasized with golden highlights, ancient Illyrian symbols or inscriptions, 7 million speakers represented as global population icons. Educational atmosphere with scholarly deep blues, archaeological browns, and golden ancient accents. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-fact-2.webp',
    description:
      'Fun Fact 2: Two Dialects One Nation - Gheg in north and Tosk in south divided by Shkumbin River, with Standard Albanian based on Tosk becoming official in 1972',
    prompt:
      'An illustration showing Albanian linguistic geography. Visualize a stylized map of Albania divided by the Shkumbin River: northern region labeled Gheg with mountainous terrain, southern region labeled Tosk with coastal elements. Include visual elements: river dividing line, regional dialect text samples in decorative frames, 1972 milestone marker for standardization, unity symbols (handshake, national emblem), dialectal vocabulary comparison chart. Color scheme: northern cool mountain blues, southern warm coastal oranges, unity greens. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-interest-1.webp',
    description:
      'Albanian Grammar and Structure - Five noun cases, complex verb conjugations, definite articles as suffixes (libri = the book), flexible word order',
    prompt:
      'An educational illustration of Albanian grammar system. Visualize five grammatical cases arranged in circular diagram with interconnecting arrows, verb conjugation table showing transformations, example of definite article suffix (libri highlighted with book icon), word order flexibility shown with movable sentence building blocks. Include visual elements: grammar textbook, case declension chart, verb wheel, suffix attachment animation, sentence structure flow diagram. Academic colors: scholarly navy, educational teal, grammar green highlights. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-interest-2.webp',
    description:
      "Albanian Cultural Expressions - Unique concepts like 'besa' (sacred honor code), traditional greetings, hospitality phrases reflecting deep cultural values",
    prompt:
      'An illustration showcasing Albanian cultural heritage and expressions. Visualize traditional Albanian hospitality scene with cultural symbols: ancient besa honor code represented as golden oath scroll or handshake seal, traditional Albanian folk costume details, welcoming gestures, family gathering imagery. Include visual elements: traditional Albanian stone house, mountain backdrop, coffee ceremony tools, cultural motifs (double-headed eagle, traditional patterns), honor and respect symbols (shield, oath tablet). Color scheme: warm hospitality reds, cultural heritage burgundy, mountain stone grays, golden honor accents. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-interest-3.webp',
    description:
      'Learning Albanian Language - Gateway to Balkan history, ancient Illyrian roots, connecting to communities across Albania, Kosovo, North Macedonia and diaspora worldwide',
    prompt:
      'An inspiring illustration of Albanian language learning journey. Visualize ancient Illyrian stone inscriptions transforming into modern Albanian text, geographical map highlighting Albania, Kosovo, North Macedonia with connection lines to global diaspora communities. Include visual elements: ancient Illyrian helmet or archaeology artifacts, open language textbook, Balkan historical timeline, cultural bridges connecting regions, passport with travel stamps, multilingual dictionary, learning progress ladder. Color scheme: ancient civilization stone grays, historical browns, learning journey blues, connection map greens. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-interest-4.webp',
    description:
      "Albanian Business Communication - Albania's growing economy, strategic Balkan location, valuable for tourism, energy, IT and manufacturing sectors, facilitating partnerships",
    prompt:
      'A professional business illustration showing Albanian international commerce. Visualize modern Albania skyline (Tirana) with business district, strategic Balkan map position highlighted, industry sector icons (hotel/tourism, energy plant, IT/tech, factory/manufacturing) arranged around. Include visual elements: business handshake across flags, trade routes, investment growth charts, contract documents with Albanian-English text, laptop showing business correspondence, partnership network diagram, economic indicators trending upward. Color scheme: professional corporate navy, growth success greens, strategic map blues, partnership gold accents. 4:3 aspect ratio.',
  },
  {
    filename: 'albanian-to-english-how-to.webp',
    description:
      'How to Use Albanian Translator - Enter text, select options, click translate, review results',
    prompt:
      'A clean tutorial illustration showing step-by-step Albanian translation process. Visualize four-step workflow: 1) input field with Albanian text and upload icons, 2) translation mode options (text/document/voice) as selection buttons, 3) prominent translate button with processing animation, 4) results panel with copy/download/audio options. Include visual elements: numbered step circles (1-4), Albanian input sample text, dropdown menus, file upload icon, microphone for voice, translation progress indicator, output display with formatted results, action buttons (copy, download, speaker). Color scheme: tutorial blues, action button greens, interface clean whites and grays. Modern UI flat design, 4:3 aspect ratio.',
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
    '\n🎨 Starting image generation for Albanian to English Translator...\n'
  );
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
  console.log(`🔧 API Priority Order: v3 (DALL-E 3) → dreem4.0 → nanobanana\n`);

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
