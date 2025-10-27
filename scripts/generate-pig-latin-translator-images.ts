#!/usr/bin/env node

/**
 * Generate images for pig-latin-translator using Article Illustrator
 * Generates 7 images:
 * 1. what-is-pig-latin-translator.webp
 * 2. pig-latin-translator-fact-1.webp
 * 3. pig-latin-translator-fact-2.webp
 * 4. pig-latin-translator-interest-1.webp
 * 5. pig-latin-translator-interest-2.webp
 * 6. pig-latin-translator-interest-3.webp
 * 7. pig-latin-translator-interest-4.webp
 * Note: how-to image is generated via screenshot script
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks based on pig-latin-translator content
const imageTasks = [
  {
    filename: 'what-is-pig-latin-translator.webp',
    description:
      'What is Pig Latin Translator - A playful language game tool that converts English to Pig Latin',
    prompt:
      'A cheerful illustration showing English text transforming into Pig Latin. Visualize the word "Hello" on the left morphing into "Ellohay" on the right with playful letter animations. Include fun elements like bouncing letters, a cartoon pig mascot wearing reading glasses, speech bubbles, and word transformation arrows. Bright, friendly colors (pink, blue, yellow), playful design, kid-friendly style. 4:3 aspect ratio.',
  },
  {
    filename: 'pig-latin-translator-fact-1.webp',
    description:
      "Fun Fact 1: Pig Latin's Rich History - Dating back to the 1890s, still popular today",
    prompt:
      "A historical timeline illustration showing Pig Latin's journey from 1890s to present. Include vintage elements: old children's books from 1890s, Victorian kids playing word games, transitioning through decades with retro toys and games, ending with modern kids using tablets. Time machine concept with sepia tones transitioning to modern colors. Nostalgic yet contemporary. 4:3 aspect ratio.",
  },
  {
    filename: 'pig-latin-translator-fact-2.webp',
    description:
      'Fun Fact 2: Cultural Appearances - Featured in The Simpsons, Toy Story, and pop culture',
    prompt:
      'A pop culture collage illustration showing Pig Latin references in entertainment. Include stylized TV screens, movie frames, comic-style speech bubbles with Pig Latin text, entertainment icons (popcorn, clapperboard, TV antenna). Cartoon-style references to popular shows and movies. Vibrant entertainment colors (neon purples, movie-theater reds, screen blues). Fun, pop-art style. 4:3 aspect ratio.',
  },
  {
    filename: 'pig-latin-translator-interest-1.webp',
    description:
      "Pig Latin's Origins - Tracing back to the creative minds of the 1890s",
    prompt:
      'An illustration depicting Victorian-era origins of Pig Latin. Show antique schoolhouse with blackboard displaying Pig Latin rules, vintage inkwells, old dictionaries, children in period clothing playing word games. Include vintage scrolls revealing linguistic patterns, old-fashioned alphabet charts. Warm sepia-brown tones mixed with scholarly blues. Nostalgic educational atmosphere. 4:3 aspect ratio.',
  },
  {
    filename: 'pig-latin-translator-interest-2.webp',
    description:
      'Language Game Comparisons - Pig Latin vs other language games like Ubbi Dubbi',
    prompt:
      'A comparison chart illustration showing different language games side by side. Display Pig Latin, Ubbi Dubbi, and other word games with examples. Include game comparison boxes, rule diagrams, translation examples for each. Visual elements: playful game icons, word puzzle pieces fitting together, comparison arrows. Colorful educational theme with teal, orange, and purple sections. 4:3 aspect ratio.',
  },
  {
    filename: 'pig-latin-translator-interest-3.webp',
    description:
      'Reverse Translation Tips - Decoding Pig Latin back to English like cracking a code',
    prompt:
      'An illustration of a puzzle-solving detective theme for reverse translation. Show magnifying glass examining Pig Latin text, detective notepad with decoding steps, cipher wheels, code-breaking tools. Include "before and after" text panels showing Pig Latin converting back to English. Mystery-solving colors: detective blues, code greens, solution golds. Puzzle-adventure style. 4:3 aspect ratio.',
  },
  {
    filename: 'pig-latin-translator-interest-4.webp',
    description:
      'Pronunciation Perks - Understanding how Pig Latin sounds when spoken aloud',
    prompt:
      'An illustration showing sound waves and pronunciation. Visualize a speaker with sound waves emanating from mouth, English words transforming into Pig Latin with phonetic symbols. Include audio waveforms, musical notes, voice vibration patterns, pronunciation guide symbols. Sound visualization elements: frequency waves, audio spectrum bars, voice bubbles. Audio-visual colors: sound purples, voice blues, frequency oranges. Modern audio-tech style. 4:3 aspect ratio.',
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
  console.log('\n🎨 Starting image generation for pig-latin-translator...\n');
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
