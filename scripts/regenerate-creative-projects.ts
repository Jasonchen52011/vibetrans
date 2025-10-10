/**
 * Regenerate Alien Text for Creative Projects image
 */

import { generateImageWithKie } from '../src/lib/kie-text-to-image';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';

async function regenerateCreativeProjectsImage() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Regenerating: Alien Text for Creative Projects');
  console.log('='.repeat(70) + '\n');

  const prompt = `Geometric Flat Style cartoon illustration for "Alien Text for Creative Projects". Sky blue (#87CEEB) background with soft gradient. Features creative design workspace scene with abstract geometric elements - circular color palette floating, triangular design tools, rectangular digital canvas or tablet. Simple geometric character (made of circles and rectangles) creating alien text designs. Floating alien symbols and creative inspiration sparks around. Soft pastel accents (pink, yellow, mint green). Clean minimalist style, 4:3 aspect ratio, horizontal layout, inspiring and cheerful creative atmosphere, modern flat cartoon design, no actual text or logos visible.`;

  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...\n`);

  try {
    // Generate with KIE
    console.log(`🎨 Generating with KIE API...`);
    const imageResult = await generateImageWithKie(prompt, {
      imageSize: '4:3',
      outputFormat: 'png',
    });

    console.log(`✅ Image generated: ${imageResult.url}\n`);

    // Convert to WebP
    console.log(`📦 Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageResult.url, {
      filename: 'alien-text-creative-projects',
      targetSize: 90,
    });

    if (webpResult.success) {
      console.log('\n' + '='.repeat(70));
      console.log(`✅ Success: ${webpResult.filename} (${webpResult.size}KB)`);
      console.log('='.repeat(70) + '\n');
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error: any) {
    console.error(`\n❌ Failed: ${error.message}\n`);
    throw error;
  }
}

regenerateCreativeProjectsImage().catch(console.error);
