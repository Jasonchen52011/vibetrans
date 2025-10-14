#!/usr/bin/env node

/**
 * Generate images for Middle English Translator using Article Illustrator
 * Generates 8 images:
 * 1. what-is-middle-english-translator.webp
 * 2. middle-english-translator-fact-1.webp
 * 3. middle-english-translator-fact-2.webp
 * 4. middle-english-translator-interest-1.webp
 * 5. middle-english-translator-interest-2.webp
 * 6. middle-english-translator-interest-3.webp
 * 7. middle-english-translator-interest-4.webp
 * 8. middle-english-translator-how-to.webp (backup, usually from screenshot)
 * Note: Primary how-to image is generated via screenshot script
 * API Priority: Volcano 4.0 → SeaDream 4.0 → Nano Banana → Ideogram v3
 */

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks based on Middle English translator content
const imageTasks = [
  {
    filename: 'what-is-middle-english-translator.webp',
    description:
      'What is Middle English Translator - AI-powered tool for converting modern English to Middle English (1150-1500)',
    prompt:
      'A scholarly illustration showing Middle English translation concept. Visualize a medieval illuminated manuscript on the left with decorative Gothic letters and ornate borders, transforming into modern digital text on the right through flowing translation arrows with AI neural patterns. Include Middle English text sample with þ (thorn) and ȝ (yogh) characters, medieval calligraphy pen transforming into modern keyboard, Geoffrey Chaucer portrait silhouette, Canterbury Tales book. Rich medieval colors: deep burgundy, royal blue, gold leaf accents, parchment beige. Professional yet historical theme. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-fact-1.webp',
    description:
      "Fun Fact 1: Chaucer's spelling variations - 'through' spelled ten different ways showing Middle English's flexible and inconsistent spelling system",
    prompt:
      'A whimsical educational illustration showing spelling chaos in Middle English. Visualize ten different variations of the word "through" (thurgh, thorough, throw, throu, thrugh, etc.) arranged in decorative medieval scrolls or banners, each with unique calligraphic style. Include Geoffrey Chaucer as a cheerful scribe surrounded by floating spelling variations, medieval writing desk with quill pens, ink pots, scattered parchment papers. Show confusion marks or question symbols playfully integrated. Visual elements: medieval manuscript pages, multiple spelling samples in authentic Middle English script, comparison chart, scholarly annotations. Color scheme: parchment yellows, ink blacks, medieval manuscript blues and reds, gold illumination accents. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-fact-2.webp',
    description:
      "Fun Fact 2: The letter 'ȝ' (yogh) in Middle English is ancestor of modern 'y' - as seen in Scottish names like Menzies pronounced /ˈmɪŋɪs/",
    prompt:
      'An educational linguistic illustration showing the evolution of the letter ȝ (yogh). Visualize large yogh character (ȝ) at center transforming through historical stages into modern y, with evolutionary timeline arrows. Include examples: "Menzies" written in Middle English with ȝ and modern form, phonetic pronunciation guide /ˈmɪŋɪs/, Scottish heritage elements (thistle, tartan pattern), Old English roots connecting to Middle English development. Visual elements: letter evolution diagram, historical character chart, linguistic family tree, pronunciation key, before-and-after comparison of spellings. Color scheme: scholarly deep blues, linguistic evolution greens, historical browns, Scottish heritage purples. Academic yet engaging design. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-interest-1.webp',
    description:
      'Reverse Translation - Converting Middle English back to Modern English, showing language evolution and historical linguistics',
    prompt:
      'An illustration showing bidirectional language translation flow. Visualize double-headed arrows connecting Middle English manuscript text on left to Modern English digital text on right. Include visual elements: medieval Canterbury Tales excerpt transforming line-by-line into contemporary English, time evolution timeline (1150-1500 to present), historical linguistics symbols, language evolution tree branches showing development stages, comparison panels showing same sentence in both forms. Include book transforming from ancient to modern, scholar analyzing texts with magnifying glass. Color scheme: historical sepia and parchment for medieval side, modern clean blues and whites for contemporary side, gradient transition showing evolution. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-interest-2.webp',
    description:
      'Dialect Variations - Exploring Northern, Kentish, and other Middle English dialects from different regions of medieval England',
    prompt:
      'An illustrated map of medieval England showing dialect regions. Visualize stylized map of England (1150-1500) divided into dialect regions: Northern, Midlands, Southern, Kentish, each region color-coded with sample text examples in decorative frames. Include visual elements: regional dialect text samples in authentic Middle English script, geographical boundary lines, medieval landmarks (castles, cathedrals) representing each region, dialect comparison chart showing vocabulary differences, linguistic journey arrows connecting regions. Include compass rose, medieval cartography style decorations, regional cultural symbols. Color scheme: map parchment background, region colors (Northern cool blues, Kentish coastal greens, Southern warm browns), gold accent borders. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-interest-3.webp',
    description:
      'Realistic Voice Output - Authentic Middle English pronunciation with bard and monk voice tones for immersive historical experience',
    prompt:
      'A creative illustration of Middle English voice synthesis. Visualize medieval bard with lute on left and scholarly monk with religious manuscript on right, both with speech waves emanating from their mouths showing audio waveforms. Include visual elements: medieval manuscript with text being read aloud, audio speaker/sound wave icons, pronunciation guide with phonetic symbols, voice selection interface showing "bard" and "monk" options, period-appropriate musical notation, medieval acoustic instruments. Show medieval theater stage or monastery reading room setting. Include audio controls (play, tone selection), authenticity badges. Color scheme: theatrical burgundy and gold for bard side, monastic browns and spiritual golds for monk side, acoustic sound wave blues. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-interest-4.webp',
    description:
      'Grammar Insights - Middle English grammar and spelling rules, linguistic nuances for students and researchers',
    prompt:
      'An educational illustration of Middle English grammar system. Visualize open medieval grammar textbook as central element showing grammatical rules, surrounded by learning tools: grammar wheels showing verb conjugations, case system diagrams (nominative, accusative, genitive, dative), spelling variation charts, thorn (þ) and yogh (ȝ) special characters highlighted with magnifying glass. Include visual elements: medieval scholar studying with quill, grammatical case structure flowchart, comparison tables (ME vs Modern English grammar), linguistic annotation symbols, noun declension wheels, verb tense timeline. Color scheme: scholarly navy blues, educational teals, grammar reference book browns, highlighted yellow for key learning points. Academic and accessible design. 4:3 aspect ratio.',
  },
  {
    filename: 'middle-english-translator-how-to.webp',
    description:
      'How to Use Middle English Translator - Upload file, select dialect and period, input text or voice, review and export',
    prompt:
      'A clean tutorial illustration showing four-step Middle English translation workflow. Visualize numbered steps (1-4): 1) file upload interface with document icon and medieval manuscript preview, 2) dialect selection dropdown menu (Northern, Kentish, Midlands) and period timeline slider (1150-1500), 3) text input field with sample Middle English text and microphone icon for voice input with real-time feedback indicator, 4) results panel with translated text, export format options (PDF, DOCX, TXT), and action buttons (copy, download, print). Include visual elements: clear step numbers in medieval illuminated style, progress indicators, dialect map reference, calendar/timeline widget, voice waveform animation, output preview with formatting. Color scheme: tutorial interface blues, action button greens, medieval accent gold, clean background whites and light grays. Modern UI with historical touches, 4:3 aspect ratio.',
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
    '\n🎨 Starting image generation for Middle English Translator...\n'
  );
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
  console.log(
    `🔧 API Priority Order: Volcano 4.0 → SeaDream 4.0 → Nano Banana → Ideogram v3\n`
  );

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

      // Use suggested filename if available, otherwise use original
      const finalFilename = result.suggestedFilename || task.filename;
      console.log(`🏷️  Final filename: ${finalFilename}`);

      // Download and convert to WebP
      const outputPath = path.join(OUTPUT_DIR, finalFilename);
      await downloadAndConvertImage(result.url, outputPath);

      successCount++;
      console.log(`\n✅ Successfully generated: ${finalFilename}`);
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
