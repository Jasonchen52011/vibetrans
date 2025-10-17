/**
 * Generate SEO og:image for Chinese to English Translator
 * File: what-is-chinese-to-english-translator.webp
 */

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImage } from '../src/lib/volcano-image';

async function main() {
  console.log(
    '\n🚀 Generating Chinese to English Translator SEO og:image...\n'
  );

  const prompt = `Geometric flat style cartoon illustration showing Chinese to English translation concept. Sky blue (#87CEEB) background with soft gradient. Center: large Chinese character "你好" transforming into English word "HELLO" with animated flow arrows showing conversion. Left side: simple geometric character (circles and rectangles) holding Chinese scroll. Right side: same character holding English book. Floating elements: Chinese characters (汉字) and English letters (ABC) in speech bubbles. Include cultural symbols: simplified pagoda silhouette and Big Ben clock tower in background. Soft pastel accents (pink, yellow, mint green). Clean minimalist design, 4:3 aspect ratio, horizontal layout, professional yet friendly atmosphere, modern flat cartoon style, no actual readable text besides the translation example.`;

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
      filename: 'what-is-chinese-to-english-translator',
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
