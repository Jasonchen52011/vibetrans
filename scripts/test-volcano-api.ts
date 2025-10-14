/**
 * Test Volcano Engine API connectivity and authentication
 */

import path from 'path';
import { config } from 'dotenv';

// Load environment variables
const envResult = config({ path: path.join(process.cwd(), '.env.local') });

console.log('🔑 Environment Check:');
console.log('  - .env.local loaded:', !envResult.error);
console.log('  - VOLC_ACCESS_KEY:', process.env.VOLC_ACCESS_KEY ? '✅ Set' : '❌ Missing');
console.log('  - VOLC_SECRET_KEY:', process.env.VOLC_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('');

import { generateImage } from '../src/lib/volcano-image';

async function testVolcanoAPI() {
  console.log('🧪 Testing Volcano Engine API...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    console.log('📤 Sending test request to Volcano Engine...');
    console.log('   Model: jimeng_i2i_v40');
    console.log('   Mode: text-to-image');
    console.log('   Prompt: Simple geometric shapes on blue background');
    console.log('');

    const result = await generateImage({
      prompt: 'Simple geometric flat illustration with circles and triangles on sky blue background, minimalist design, 4:3 aspect ratio, no text',
      mode: 'text',
      size: '1K', // Use smaller size for faster testing
      watermark: false,
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Volcano API is working correctly!\n');
    console.log('📊 Response Details:');
    console.log('   - Images generated:', result.data.length);
    console.log('   - Image URL:', result.data[0].url.substring(0, 80) + '...');
    if (result.data[0].revised_prompt) {
      console.log('   - Revised prompt:', result.data[0].revised_prompt.substring(0, 80) + '...');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error: any) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ FAILURE! Volcano API test failed!\n');
    console.log('📋 Error Details:');
    console.log('   - Error Type:', error.name || 'Unknown');
    console.log('   - Error Message:', error.message);

    if (error.message.includes('Access Denied')) {
      console.log('\n💡 Possible Causes:');
      console.log('   1. API keys may have expired or been revoked');
      console.log('   2. API keys may not have permission for jimeng_i2i_v40 model');
      console.log('   3. Account may have reached usage quota/limits');
      console.log('   4. IP address may be blocked or region-restricted');
      console.log('\n🔧 Recommended Actions:');
      console.log('   1. Check Volcano Engine console for API key status');
      console.log('   2. Verify API key permissions and model access');
      console.log('   3. Check account billing and quota limits');
      console.log('   4. Review recent API usage logs in console');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Note: Fallback to Ideogram v3 is working correctly,');
    console.log('   so image generation will continue to work even if Volcano API fails.');

    process.exit(1);
  }
}

testVolcanoAPI();
