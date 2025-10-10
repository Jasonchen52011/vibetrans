/**
 * Test Volcano Engine Image Generation
 */

import { testGenerateImage } from '../src/lib/article-illustrator/image-generator';
import fs from 'fs/promises';
import path from 'path';

async function testVolcanoGeneration() {
  console.log('🧪 Testing Volcano Engine Image Generation\n');
  console.log('='.repeat(60));

  const testPrompt = `Geometric flat illustration depicting the concept of "What is Esperanto Translator," with a sky blue background featuring soft, abstract shapes. A central stylized icon represents language translation, utilizing circular and rectangular forms to symbolize text conversion. Pastel accents of light yellow, pink, and mint green highlight connectivity and accessibility. Clean, minimalist design, 4:3 aspect ratio, cheerful and friendly atmosphere, modern geometric flat style, no text or logos present.`;

  try {
    console.log('\n📝 Test Prompt:');
    console.log(testPrompt.substring(0, 150) + '...');

    console.log('\n⏳ Calling Volcano Engine API...\n');

    const imageUrl = await testGenerateImage(testPrompt);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test PASSED - Image Generated');
    console.log('='.repeat(60));
    console.log(
      `Image URL type: ${imageUrl.startsWith('data:') ? 'Data URL' : 'HTTP URL'}`
    );
    console.log(`Image URL length: ${imageUrl.length} characters`);

    if (imageUrl.startsWith('data:image')) {
      console.log('\n💾 Saving test image to /tmp/test-volcano-image.png');
      const base64Data = imageUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile('/tmp/test-volcano-image.png', buffer);
      console.log('✅ Test image saved successfully');
      console.log(`📏 Image size: ${(buffer.length / 1024).toFixed(2)} KB`);
    }

    console.log('\n✅ VOLCANO ENGINE TEST PASSED\n');
  } catch (error: any) {
    console.error('\n❌ Test FAILED:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testVolcanoGeneration();
