/**
 * Test WebP Converter
 */

import path from 'path';
import { testConvertFile } from '../src/lib/article-illustrator/webp-converter';

async function testWebPConversion() {
  console.log('🧪 Testing WebP Conversion\n');
  console.log('='.repeat(60));

  // 使用已有的图片进行测试
  const testImagePath = path.join(
    process.cwd(),
    'public/images/docs/esperanto-user-friendly.webp'
  );

  try {
    console.log('\n📝 Test Input:');
    console.log(`Input file: ${testImagePath}`);
    console.log(`Target: 800x600, ~90KB`);

    console.log('\n⏳ Converting to WebP...\n');

    const result = await testConvertFile(testImagePath, 'test-webp-conversion');

    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ Test PASSED - WebP Conversion Successful');
      console.log('='.repeat(60));
      console.log(`Filename: ${result.filename}`);
      console.log(`Path: ${result.path}`);
      console.log(`Size: ${result.size} KB`);
      console.log(`Dimensions: ${result.dimensions}`);

      // 验证
      const checks = {
        'File created': result.filename.endsWith('.webp'),
        'Size in range (85-95KB)': result.size >= 85 && result.size <= 95,
        'Correct dimensions': result.dimensions === '800x600',
      };

      console.log('\n📊 Validation:');
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      }

      const allPassed = Object.values(checks).every((v) => v);
      console.log(
        `\n${allPassed ? '✅ ALL CHECKS PASSED' : '⚠️  SOME CHECKS FAILED'}\n`
      );
    } else {
      console.log('❌ Test FAILED - Conversion Failed');
      console.log(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Test FAILED:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testWebPConversion();
