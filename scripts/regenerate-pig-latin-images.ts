/**
 * Regenerate specific Pig Latin Translator images
 * - Early Days of Pig Latin (Fun Fact 1)
 * - Translate Large Documents (User Interest 2)
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImage } from '../src/lib/volcano-image';

interface ImageConfig {
  name: string;
  filename: string;
  prompt: string;
}

const imagesToRegenerate: ImageConfig[] = [
  {
    name: 'Early Days of Pig Latin',
    filename: 'kids-letter-blocks',
    prompt: `Geometric flat style cartoon illustration showing happy children in the 1890s era playing with giant colorful alphabet blocks. Sky blue (#87CEEB) background with soft gradient and vintage clouds. Children with simple geometric shapes wearing old-fashioned clothing (suspenders, pinafores) stacking and arranging large letter blocks. Blocks display various letters in pastel colors (pink, yellow, mint green). Cheerful and nostalgic atmosphere, clean minimalist design with soft shadows, 4:3 aspect ratio, horizontal layout, educational and playful mood, modern flat cartoon style, no text or logos visible.`,
  },
  {
    name: 'Translate Large Documents',
    filename: 'docs-transform',
    prompt: `Geometric flat style cartoon illustration showing document transformation. Sky blue (#87CEEB) background with soft gradient. Left side: stack of paper documents and books in neutral colors. Center: flowing circular arrows indicating transformation process in pastel colors (pink, yellow, mint green). Right side: digital documents and tablets displaying translated content. Simple geometric shapes (rectangles for documents, circles for transformation flow, triangles for directional elements). Clean minimalist design, 4:3 aspect ratio, horizontal layout, professional yet friendly atmosphere, modern flat cartoon style, no text or logos visible.`,
  },
];

async function regenerateImage(config: ImageConfig) {
  console.log('\n' + '='.repeat(70));
  console.log(`🎨 Regenerating: ${config.name}`);
  console.log('='.repeat(70) + '\n');

  console.log(`📝 Prompt: ${config.prompt.substring(0, 100)}...\n`);

  try {
    // Generate with Volcano Engine
    console.log(`🎨 Generating with Volcano Engine 4.0...`);
    const imageResult = await generateImage({
      prompt: config.prompt,
      mode: 'text',
      watermark: false,
    });

    const imageUrl = imageResult.data[0].url;
    console.log(`✅ Image generated: ${imageUrl}\n`);

    // Convert to WebP
    console.log(`📦 Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageUrl, {
      filename: config.filename,
      targetSize: 90,
    });

    if (webpResult.success) {
      console.log('\n' + '='.repeat(70));
      console.log(`✅ Success: ${webpResult.filename} (${webpResult.size}KB)`);
      console.log(`   Path: /public/images/docs/${webpResult.filename}`);
      console.log('='.repeat(70) + '\n');
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error: any) {
    console.error(`\n❌ Failed: ${error.message}\n`);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Starting Pig Latin Images Regeneration...\n');

  for (const config of imagesToRegenerate) {
    await regenerateImage(config);
    // Small delay between images
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 All images regenerated successfully!\n');
}

main().catch(console.error);
