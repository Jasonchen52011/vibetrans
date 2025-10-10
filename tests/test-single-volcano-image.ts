/**
 * Test single image generation with Volcano Engine
 */

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import {
  convertDataURLToWebP,
  convertURLToWebP,
} from '../src/lib/article-illustrator/webp-converter';

async function testSingleImage() {
  console.log('\n🧪 Testing Single Image Generation with Volcano Engine\n');
  console.log('='.repeat(70));

  const testPrompt = `Geometric flat illustration depicting the concept of "Alien Text Generator" as a
fantastical machine transforming blocks into abstract alien symbols. Sky blue background
with a soft gradient, machine elements in light yellow, pink, and mint green pastel colors.
Clean minimalist design with circular, rectangular, and triangular shapes. 4:3 aspect ratio,
cheerful and friendly atmosphere, modern geometric flat style, no text or recognizable letters.
Soft clouds subtly representing the "out-of-this-world" theme.`;

  console.log('\n📝 Prompt:');
  console.log(testPrompt.substring(0, 150) + '...');
  console.log('\n⏳ Generating image with Volcano Engine...\n');

  try {
    // Step 1: Generate image
    const imageData = await generateIllustration({
      prompt: testPrompt,
      filename: 'test-alien-single',
    });

    console.log('✅ Image generated successfully!');
    console.log(
      `   URL type: ${imageData.url.startsWith('data:') ? 'Data URL' : 'HTTP URL'}`
    );
    console.log(`   URL length: ${imageData.url.length} chars`);

    // Step 2: Convert to WebP
    console.log('\n📦 Converting to WebP...\n');
    const webpResult = await (imageData.url.startsWith('data:')
      ? convertDataURLToWebP(imageData.url, { filename: 'test-alien-single' })
      : convertURLToWebP(imageData.url, { filename: 'test-alien-single' }));

    if (webpResult.success) {
      console.log('\n' + '='.repeat(70));
      console.log('🎉 TEST PASSED - Complete Workflow Success!');
      console.log('='.repeat(70));
      console.log(`✅ Filename: ${webpResult.filename}`);
      console.log(`✅ Size: ${webpResult.size} KB`);
      console.log(`✅ Dimensions: ${webpResult.dimensions}`);
      console.log(`✅ Path: ${webpResult.path}`);
      console.log('='.repeat(70) + '\n');
      return 0;
    } else {
      throw new Error(webpResult.error || 'WebP conversion failed');
    }
  } catch (error: any) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70));
    console.error(`Error: ${error.message}`);
    console.error('\nFull error:', error);
    console.error('='.repeat(70) + '\n');
    return 1;
  }
}

testSingleImage()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
