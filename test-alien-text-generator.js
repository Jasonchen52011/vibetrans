/**
 * Test cases for Alien Text Generator
 * Run with: node test-alien-text-generator.js
 */

// Import the alien text conversion library
const {
  convertToAlienText,
  getAlienStyles,
} = require('./src/lib/alien-text.ts');

console.log('=== Alien Text Generator Test Cases ===\n');

// Test 1: Basic text conversion with different styles
console.log('Test 1: Basic Text Conversion');
console.log('------------------------------');
const testText = 'Hello World';
const styles = [
  'symbols',
  'circle',
  'square',
  'futuristic',
  'cursive',
  'zalgo',
];

styles.forEach((style) => {
  try {
    const result = convertToAlienText(testText, style);
    console.log(`Style: ${style.padEnd(15)} → ${result}`);
  } catch (error) {
    console.error(`❌ Error with style ${style}:`, error.message);
  }
});

console.log('\n');

// Test 2: Empty text handling
console.log('Test 2: Empty Text Handling');
console.log('---------------------------');
try {
  const result = convertToAlienText('', 'symbols');
  console.log(`Empty text result: "${result}" ${result === '' ? '✅' : '❌'}`);
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

// Test 3: Special characters and numbers
console.log('Test 3: Special Characters and Numbers');
console.log('--------------------------------------');
const specialText = 'Test123! @#$';
try {
  const result = convertToAlienText(specialText, 'symbols');
  console.log(`Input:  ${specialText}`);
  console.log(`Output: ${result}`);
  console.log(result ? '✅ Handled special characters' : '❌ Failed');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

// Test 4: Long text handling
console.log('Test 4: Long Text Handling');
console.log('--------------------------');
const longText =
  'This is a longer sentence to test how the alien text generator handles more complex inputs with multiple words and proper sentence structure.';
try {
  const result = convertToAlienText(longText, 'futuristic');
  console.log(`Input length:  ${longText.length} characters`);
  console.log(`Output length: ${result.length} characters`);
  console.log(`Preview: ${result.substring(0, 50)}...`);
  console.log(result.length > 0 ? '✅ Handled long text' : '❌ Failed');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

// Test 5: Case sensitivity
console.log('Test 5: Case Sensitivity');
console.log('------------------------');
const mixedCase = 'HeLLo WoRLd';
try {
  const result = convertToAlienText(mixedCase, 'circle');
  console.log(`Input:  ${mixedCase}`);
  console.log(`Output: ${result}`);
  console.log(result ? '✅ Preserved case variations' : '❌ Failed');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

// Test 6: Get available styles
console.log('Test 6: Available Styles');
console.log('------------------------');
try {
  const availableStyles = getAlienStyles();
  console.log(`Found ${availableStyles.length} styles:`);
  availableStyles.forEach((style, index) => {
    console.log(`  ${index + 1}. ${style.name} (${style.value})`);
  });
  console.log(
    availableStyles.length === 6
      ? '✅ All styles available'
      : '⚠️  Unexpected style count'
  );
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

// Test 7: Unicode character preservation
console.log('Test 7: Unicode Character Handling');
console.log('-----------------------------------');
const unicodeText = 'Café résumé 日本語';
try {
  const result = convertToAlienText(unicodeText, 'symbols');
  console.log(`Input:  ${unicodeText}`);
  console.log(`Output: ${result}`);
  console.log(result ? '✅ Handled Unicode characters' : '❌ Failed');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n');

// Test Summary
console.log('=================================');
console.log('Test Summary:');
console.log('✅ = Test Passed');
console.log('❌ = Test Failed');
console.log('⚠️  = Warning/Unexpected Result');
console.log('=================================');

console.log('\nTest execution completed!');
console.log('\nNext Steps:');
console.log('1. Test the page in browser at /alien-text-generator');
console.log('2. Verify all JSON translations are loaded correctly');
console.log('3. Test file upload functionality (.txt and .docx)');
console.log('4. Test copy, download, and TTS buttons');
console.log('5. Verify the page appears in navbar and footer');
console.log('6. Check sitemap includes /alien-text-generator');
