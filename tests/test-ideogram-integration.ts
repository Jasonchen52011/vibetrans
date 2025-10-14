/**
 * Test Ideogram v3 Integration in Article Illustrator
 * Tests the fallback chain: Seedream 4.0 → Ideogram v3 → Google Nano Banana
 */

import { generateIllustration } from '../src/lib/article-illustrator/image-generator';

async function testIdeogramIntegration() {
  console.log('🧪 Testing Ideogram v3 Integration...\n');

  const testPrompt =
    'A serene lakeside scene at twilight with glowing reeds and water lilies';

  try {
    console.log('📝 Test Prompt:', testPrompt);
    console.log('\n🔄 Starting automatic fallback chain test...\n');

    const result = await generateIllustration({
      prompt: testPrompt,
      filename: 'test-ideogram-integration',
    });

    console.log('\n✅ Test Completed Successfully!');
    console.log('📊 Result:', {
      modelUsed: result.modelUsed,
      imageUrl: result.url,
      hasRevisedPrompt: !!result.revisedPrompt,
    });

    return result;
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    throw error;
  }
}

async function testSpecificModel() {
  console.log('\n🧪 Testing Specific Model Selection...\n');

  const testPrompt = 'A beautiful mountain landscape with snow peaks';

  try {
    // Test forcing Ideogram v3
    console.log('📝 Testing with preferredModel: ideogram\n');

    const result = await generateIllustration({
      prompt: testPrompt,
      filename: 'test-ideogram-specific',
      preferredModel: 'ideogram',
    });

    console.log('\n✅ Specific Model Test Completed!');
    console.log('📊 Result:', {
      modelUsed: result.modelUsed,
      imageUrl: result.url,
    });

    return result;
  } catch (error: any) {
    console.error('\n❌ Specific Model Test Failed:', error.message);
    throw error;
  }
}

// Run tests
async function main() {
  console.log('='.repeat(80));
  console.log('🚀 Ideogram v3 Integration Test Suite');
  console.log('='.repeat(80) + '\n');

  try {
    // Test 1: Automatic fallback chain
    await testIdeogramIntegration();

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 2: Specific model selection
    await testSpecificModel();

    console.log('\n' + '='.repeat(80));
    console.log('✅ All Tests Passed!');
    console.log('='.repeat(80));
  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ Test Suite Failed');
    console.log('='.repeat(80));
    process.exit(1);
  }
}

main();
