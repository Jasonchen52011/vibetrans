/**
 * Generate SEO og:image for Pig Latin Translator
 * File: what-is-pig-latin-translator.webp
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImage } from '../src/lib/volcano-image';

async function main() {
  console.log('\n🚀 Generating Pig Latin Translator SEO og:image...\n');

  const prompt = `Geometric flat style cartoon illustration showing Pig Latin word transformation concept. Sky blue (#87CEEB) background with soft gradient. Center: large word "HELLO" transforming into "ELLOHAY" with animated flow arrows showing letter movement. Left side: simple geometric character (made of circles and rectangles) speaking English. Right side: same character speaking Pig Latin with playful speech bubble. Floating alphabet letters (H, E, L, L, O) rearranging in mid-air. Include playful elements: smiling letter characters, transformation sparkles, language learning books. Soft pastel accents (pink, yellow, mint green). Clean minimalist design, 4:3 aspect ratio, horizontal layout, fun and educational atmosphere, modern flat cartoon style, no actual readable text besides the word transformation example.`;

  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...\n`);

  try {
    // Generate with Volcano Engine 4.0
    console.log(`🎨 Generating with Volcano Engine 4.0...`);
    const imageResult = await generateImage({
      prompt: prompt,
      mode: 'text',
      watermark: false,
    });

    const imageUrl = imageResult.data[0].url;
    console.log(`✅ Image generated: ${imageUrl}\n`);

    // Convert to WebP
    console.log(`📦 Converting to WebP...`);
    const webpResult = await convertURLToWebP(imageUrl, {
      filename: 'what-is-pig-latin-translator',
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

main().catch(console.error);
