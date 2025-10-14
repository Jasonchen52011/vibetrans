/**
 * Capture How-To Screenshot for Cantonese Translator
 */

import { captureHowToScreenshot } from '../src/lib/article-illustrator/screenshot-helper';

async function main() {
  console.log('\n🚀 Starting Cantonese Translator How-To Screenshot Capture...\n');

  try {
    const result = await captureHowToScreenshot({
      pageSlug: 'en/cantonese-translator',
      baseUrl: 'http://localhost:3002',
      targetSizeKB: 90,
    });

    if (result) {
      console.log('\n' + '='.repeat(70));
      console.log(`✅ Screenshot captured successfully!`);
      console.log(`   File: ${result.filename}`);
      console.log(`   Size: ${result.size}KB`);
      console.log(`   Path: ${result.path}`);
      console.log('='.repeat(70) + '\n');
    } else {
      throw new Error('Screenshot capture failed');
    }
  } catch (error: any) {
    console.error(`\n❌ Failed: ${error.message}\n`);
    throw error;
  }
}

main().catch(console.error);
