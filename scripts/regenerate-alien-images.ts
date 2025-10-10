/**
 * Regenerate 3 unsatisfactory images for Alien Text Generator
 */

import { generateImageWithKie } from '../src/lib/kie-text-to-image';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';

interface ImageTask {
  title: string;
  prompt: string;
  filename: string;
}

const imageTasks: ImageTask[] = [
  {
    title: 'Zalgo Text Origin',
    prompt: `Geometric Flat Style cartoon illustration depicting "Zalgo Text Origin" with playful creepy aesthetic. Sky blue (#87CEEB) primary background with soft gradient. Center features abstract glitching geometric shapes radiating from origin point - distorted circles and wavy triangles with pink and yellow accents. Minimalist design showing text corruption concept through simple shapes. 4:3 aspect ratio, horizontal layout, cheerful yet mysterious atmosphere, soft pastel colors, modern flat cartoon style, no text or logos visible.`,
    filename: 'zalgo-text-origin',
  },
  {
    title: 'Unicode Magic',
    prompt: `Geometric Flat Style cartoon illustration representing "Unicode Magic" concept. Sky blue (#87CEEB) background with soft clouds. Features floating abstract symbols and geometric glyphs - circles with dots, triangles with lines, rectangles arranged like alien alphabet. Pastel yellow, pink, and mint green accents create magical shimmer effect. Clean minimalist design, 4:3 aspect ratio, centered composition, cheerful and enchanting atmosphere, symbols appear to sparkle and float, modern flat cartoon style, no actual text or logos.`,
    filename: 'unicode-magic',
  },
  {
    title: 'Alien Text for Creative Projects',
    prompt: `Geometric Flat Style cartoon illustration for "Alien Text for Creative Projects". Sky blue (#87CEEB) with pastel gradient. Shows creative workspace with geometric art supplies - circular palette, triangular pencils, rectangular canvas. Abstract artist character (simple geometric shapes) working with floating alien symbols and creative tools. Soft pink, yellow, mint green accents. 4:3 aspect ratio, horizontal layout, inspiring creative atmosphere, clean minimalist design, modern flat cartoon style, no text or logos visible.`,
    filename: 'alien-text-creative-projects',
  },
];

async function regenerateImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating 3 Images for Alien Text Generator');
  console.log('='.repeat(70));
  console.log(`\n📝 Images to regenerate: ${imageTasks.length}\n`);

  for (let i = 0; i < imageTasks.length; i++) {
    const task = imageTasks[i];
    console.log(`[${i + 1}/${imageTasks.length}] ${task.title}`);
    console.log(`📝 Prompt: ${task.prompt.substring(0, 80)}...`);

    try {
      // Generate with KIE
      console.log(`🎨 Generating with KIE API...`);
      const imageResult = await generateImageWithKie(task.prompt, {
        imageSize: '4:3',
        outputFormat: 'png',
      });

      console.log(`✅ Image generated: ${imageResult.url}`);

      // Convert to WebP
      console.log(`📦 Converting to WebP...`);
      const webpResult = await convertURLToWebP(imageResult.url, {
        filename: task.filename,
        targetSize: 90,
      });

      if (webpResult.success) {
        console.log(
          `✅ [${i + 1}/${imageTasks.length}] Success: ${webpResult.filename} (${webpResult.size}KB)\n`
        );
      } else {
        throw new Error(webpResult.error || 'WebP conversion failed');
      }
    } catch (error: any) {
      console.error(
        `❌ [${i + 1}/${imageTasks.length}] Failed: ${error.message}\n`
      );
    }

    // Delay between requests
    if (i < imageTasks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('='.repeat(70));
  console.log('✅ Regeneration complete!');
  console.log('='.repeat(70) + '\n');
}

regenerateImages().catch(console.error);
