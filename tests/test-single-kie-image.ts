/**
 * Test single image generation with KIE.ai API
 * Using a prompt from ALIEN_TEXT_PROMPTS_REPORT.md
 */

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';

async function testSingleKieImage() {
  console.log('\n🧪 Testing Single Image Generation with KIE.ai\n');
  console.log('='.repeat(70));

  // 使用 ALIEN_TEXT_PROMPTS_REPORT.md 中的第一个提示词
  const testPrompt = `Geometric flat illustration depicting the concept of "Alien Text Generator" as a
fantastical machine transforming blocks into abstract alien symbols. Sky blue background
with a soft gradient, machine elements in light yellow, pink, and mint green pastel colors.
Clean minimalist design with circular, rectangular, and triangular shapes. 4:3 aspect ratio,
cheerful and friendly atmosphere, modern geometric flat style, no text or recognizable letters.
Soft clouds subtly representing the "out-of-this-world" theme.`;

  console.log('\n📝 Prompt:');
  console.log(testPrompt.substring(0, 150) + '...');
  console.log('\n⏳ Generating image with KIE.ai (Google Nano Banana)...\n');

  try {
    // Step 1: Generate image with KIE.ai
    const imageData = await generateIllustration({
      prompt: testPrompt,
      filename: 'test-alien-kie-single',
    });

    console.log('✅ Image generated successfully!');
    console.log(`   URL: ${imageData.url.substring(0, 100)}...`);

    // Step 2: Convert to WebP
    console.log('\n📦 Converting to WebP...\n');
    const webpResult = await convertURLToWebP(imageData.url, {
      filename: 'test-alien-kie-single',
    });

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

testSingleKieImage()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
