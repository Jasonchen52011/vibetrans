/**
 * Regenerate Gibberish Educational Image
 * Enhanced prompt with more specific educational elements
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';

async function regenerateEducationalImage() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating Gibberish Educational Image');
  console.log('='.repeat(70) + '\n');

  const prompt = `Geometric Flat Style cartoon illustration representing "Gibberish Can Be Educational". Sky blue (#87CEEB) primary with soft gradient background. Central scene shows a cheerful classroom setting with geometric teacher character (circular head, rectangular body) pointing at a large chalkboard. The chalkboard features colorful abstract phonetic patterns - wavy sound lines in pink, triangular accent marks in yellow, circular vowel symbols in mint green. Small geometric student characters (simplified circle and triangle compositions) sitting at desks, with floating lightbulbs and sparkle stars above their heads symbolizing "aha moments" of understanding. Books stacked as simple rectangles with varied colors. Musical note shapes and speech bubble outlines float around representing language sounds. Pastel accents (soft yellow, pink, mint green). 4:3 aspect ratio, horizontal layout, warm and inspiring educational atmosphere, engaging and encouraging mood, clean minimalist style, modern flat cartoon design, no actual text or readable words visible, no logos.`;

  const filename = 'gibberish-educational';

  console.log(`📝 Enhanced prompt: ${prompt.substring(0, 100)}...\n`);

  try {
    // Step 1: Generate with KIE API
    console.log(`🎨 Generating with KIE API...`);
    const imageResult = await generateImageWithKie(prompt, {
      imageSize: '4:3',
      outputFormat: 'png',
    });

    console.log(`✅ Image generated: ${imageResult.url}`);

    // Step 2: Convert to WebP
    console.log(`📦 Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageResult.url, {
      filename,
      targetSize: 90, // 90KB target
    });

    if (webpResult.success) {
      console.log('\n' + '='.repeat(70));
      console.log('✅ REGENERATION SUCCESSFUL');
      console.log('='.repeat(70));
      console.log(`📁 File: ${webpResult.filename}`);
      console.log(`📦 Size: ${webpResult.size}KB`);
      console.log(`📍 Path: ${webpResult.path}`);
      console.log('='.repeat(70) + '\n');
      return 0;
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error: any) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ REGENERATION FAILED');
    console.error('='.repeat(70));
    console.error(`Error: ${error.message}`);
    console.error('='.repeat(70) + '\n');
    return 1;
  }
}

// Execute
regenerateEducationalImage()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
