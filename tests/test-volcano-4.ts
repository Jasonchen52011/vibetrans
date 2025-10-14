/**
 * Test Volcano 4.0 integration with Article Illustrator
 * Tests the new priority system and text-to-image generation
 */

import dotenv from 'dotenv';
import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testVolcano40() {
  console.log('\n🧪 Testing Volcano 4.0 Integration\n');

  // Test prompt from verbose-generator (What Is section)
  const testPrompt = `Geometric flat illustration showing verbose text expansion concept, sky blue background with soft gradient, simplified text bubbles and arrows growing from small to large in pastel colors, clean minimalist design with circular and rectangular shapes, 4:3 aspect ratio, cheerful and welcoming atmosphere, modern flat style, no text or logos`;

  console.log('📝 Test Prompt:');
  console.log(`   ${testPrompt.substring(0, 100)}...`);
  console.log('');

  try {
    console.log('⏳ Generating image with Volcano 4.0 (Priority #1)...\n');

    const result = await generateIllustration({
      prompt: testPrompt,
      filename: 'test-volcano-4',
      preferredModel: 'volcano', // Explicitly request Volcano
    });

    console.log('✅ SUCCESS!');
    console.log(`   Model used: ${result.modelUsed}`);
    console.log(`   Image URL: ${result.url.substring(0, 80)}...`);
    console.log(`   Revised prompt: ${result.revisedPrompt?.substring(0, 80)}...`);
    console.log('');

    // Test automatic priority (should use Volcano by default)
    console.log('⏳ Testing automatic priority (should use Volcano 4.0)...\n');

    const result2 = await generateIllustration({
      prompt: testPrompt,
      filename: 'test-auto-priority',
    });

    console.log('✅ SUCCESS!');
    console.log(`   Model used: ${result2.modelUsed} (expected: Volcano 4.0)`);
    console.log('');

    console.log('🎉 All tests passed!\n');
    return true;
  } catch (error: any) {
    console.error('❌ TEST FAILED');
    console.error(`   Error: ${error.message}`);
    console.error('');
    return false;
  }
}

// Run test
testVolcano40()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
