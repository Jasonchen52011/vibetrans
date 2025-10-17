#!/usr/bin/env node

/**
 * Generate images for verbose-generator using Article Illustrator
 * Generates 7 images:
 * 1. what-is-verbose-generator.webp
 * 2. verbose-generator-fact-1.webp
 * 3. verbose-generator-fact-2.webp
 * 4. verbose-generator-interest-1.webp
 * 5. verbose-generator-interest-2.webp
 * 6. verbose-generator-interest-3.webp
 * 7. verbose-generator-interest-4.webp
 * Note: how-to image is generated via screenshot script
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

// Image generation tasks based on verbose-generator content
const imageTasks = [
  {
    filename: 'what-is-verbose-generator.webp',
    description:
      'Verbose Generator - A tool that expands short text into longer, more detailed versions',
    prompt:
      'A professional illustration showing text transformation from short to long. Visualize a simple sentence on the left transforming into detailed, elaborate prose on the right. Include visual elements like expanding text ribbons, word clouds, and document icons. Modern gradient colors (blue to purple), clean design, tech-forward style. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-fact-1.webp',
    description:
      'Fun Fact 1: Latin Origins - The term verbose comes from Latin verbosus',
    prompt:
      'A scholarly illustration showing the Latin word "verbosus" transforming into modern English "verbose". Include ancient Roman scrolls, Latin text inscriptions, classical columns, and etymology arrows showing word evolution. Academic atmosphere with warm parchment colors, gold Latin inscriptions. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-fact-2.webp',
    description:
      'Fun Fact 2: Versatile Tool - Creates both humorous and academic text',
    prompt:
      'A split-screen illustration showing versatility: left side displays playful, witty text with laugh emojis and fun colors; right side shows formal academic text with scholarly symbols. Center shows transformation toggle switch. Balanced composition with purple-blue gradients. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-interest-1.webp',
    description:
      'Expand Your Writing Skills - Turn short ideas into detailed ones',
    prompt:
      'An illustration of a writer at a desk with growing plant metaphor - small seed (short text) growing into tall tree (detailed content). Include notebook, pen, laptop, progress arrows, skill level-up icons. Encouraging growth theme with green-blue gradients. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-interest-2.webp',
    description:
      'Perfect for Language Learners - Practice converting simple to complex sentences',
    prompt:
      'An illustration showing language learning journey: simple sentence at bottom expanding upward into complex sentence structures. Include vocabulary books, language flags, grammar symbols, sentence diagram trees. Educational theme with multilingual elements, teal-blue gradients. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-interest-3.webp',
    description:
      'AI Meets Creativity - Generate rich creative content for novels and poetry',
    prompt:
      'An illustration of AI and human creativity merging: AI brain/circuits on one side, creative artist with novel/poetry on other, with colorful creative energy flowing between them. Include open book, quill pen, imagination sparkles, brainstorming lightbulbs. Purple-pink creative gradients. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-interest-4.webp',
    description:
      'Boost Your SEO Game - Create detailed keyword-rich content quickly',
    prompt:
      'An illustration showing SEO optimization dashboard: keyword expansion from single term to rich content, search ranking arrows pointing up, content metrics, SEO score meters. Include search magnifying glass, ranking numbers, traffic graph. Professional green-blue SEO theme. 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-example-1.webp',
    description:
      'Academic Essay Writing - Student transforming bullet point into academic essay',
    prompt:
      'A flat design illustration showing a focused college student at a modern desk with laptop and academic books. On the laptop screen, visualize a simple bullet point "Climate change affects weather" transforming into an elaborate essay with flowing text, citation marks [1][2], scientific graphs, and formal paragraphs. Include visual elements: open reference books, thesis scroll, mortarboard icon, scientific diagrams of climate patterns floating around. Color scheme: scholarly deep blues and grays with golden academic accents. Style: modern flat illustration with educational sophistication, 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-example-2.webp',
    description:
      'Creative Story Expansion - Novelist expanding plot note into vivid narrative',
    prompt:
      'A flat design illustration showing a creative writer in an inspiring bohemian workspace with vintage typewriter and journals. Visualize the note "Character discovers secret room" transforming into flowing artistic text with vivid descriptions, dialogue bubbles, and sensory elements (touch, sight, sound represented as icons). Include visual elements: quill pen with sparkles, mysterious door opening with golden light, floating story elements (antique keys, flickering candles, dusty books), creative energy swirls. Color scheme: warm mystical purples, deep teals, and golden atmospheric highlights. Style: artistic flat design with narrative magic, 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-example-3.webp',
    description:
      'Technical Documentation - Technical writer creating comprehensive API documentation',
    prompt:
      'A flat design illustration showing a professional developer at a sleek workstation with dual monitors displaying code and documentation. Visualize "Configure API endpoint" expanding into detailed technical documentation with code blocks (highlighted syntax), numbered step lists, API connection diagrams, and troubleshooting decision trees. Include visual elements: terminal windows with commands, code brackets {}, gear icons, API symbols (GET/POST), flowcharts, command line interface snippets. Color scheme: professional tech blues, coding matrix greens, and clean slate grays. Style: clean technical flat design with precision, 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-example-4.webp',
    description:
      'Marketing Content Creation - Marketer transforming product feature into sales copy',
    prompt:
      'A flat design illustration showing an energetic marketing professional at a vibrant creative workspace with brand boards and campaign materials. Visualize "Fast shipping" transforming into compelling sales copy with benefit statements, customer testimonial quotes, trust badges (stars, checkmarks), and bold CTA buttons. Include visual elements: megaphone, shopping cart with speed lines, delivery truck zooming, 5-star ratings, upward growth charts, persuasive arrows pointing to action, social proof icons. Color scheme: energetic orange-red gradients, trust-building blues, and success greens. Style: dynamic flat design with commercial energy, 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-example-5.webp',
    description:
      'Blog Post Development - Blogger expanding simple idea into engaging article',
    prompt:
      'A flat design illustration showing a lifestyle blogger in a cozy, aesthetic workspace with coffee, succulents, and camera equipment. Visualize "Morning routine tips" expanding into engaging blog content with personal story sections, practical advice lists, reader question prompts, and lifestyle photo placeholders. Include visual elements: steaming coffee mug, sunrise with rays, open journal with handwriting, potted plants, vintage camera, social media heart reactions, comment speech bubbles, email signup form. Color scheme: warm morning golds and oranges, peaceful sage greens, and soft pastel accents. Style: friendly inviting flat illustration with lifestyle warmth, 4:3 aspect ratio.',
  },
  {
    filename: 'verbose-generator-example-6.webp',
    description:
      'Business Communication - Business professional creating executive summary',
    prompt:
      'A flat design illustration showing a confident executive professional in a modern corporate boardroom with presentation screens and strategic charts. Visualize "Discuss Q4 strategy" transforming into formal executive summary with strategic objective sections, bulleted action items, Gantt timeline chart, and KPI metric boxes. Include visual elements: professional in business attire, sleek boardroom table, presentation clicker, strategic direction arrows, pie charts with data segments, timeline with milestones, leather briefcase, formal documents with company letterhead. Color scheme: corporate navy blues, executive charcoal grays, and success golden accents. Style: professional authoritative flat design, 4:3 aspect ratio.',
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
  console.log('\n🎨 Starting image generation for verbose-generator...\n');
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
