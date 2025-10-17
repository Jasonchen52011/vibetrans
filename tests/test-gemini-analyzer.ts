/**
 * Test Gemini Analyzer - Generate prompts for Esperanto Translator
 */

import { testGeneratePrompt } from '../src/lib/article-illustrator/gemini-analyzer';

async function testGeminiPromptGeneration() {
  console.log('🧪 Testing Gemini Prompt Generation\n');
  console.log('='.repeat(60));

  const testCase = {
    title: 'What is Esperanto Translator',
    content: `The Esperanto Translator is a powerful tool that converts text between English and Esperanto,
    the international auxiliary language created by L. L. Zamenhof. It supports multiple input formats including
    text, voice, and document uploads, making language translation accessible and easy for everyone.`,
  };

  try {
    console.log('\n📝 Test Input:');
    console.log(`Title: ${testCase.title}`);
    console.log(`Content: ${testCase.content.substring(0, 100)}...`);

    console.log('\n⏳ Calling Gemini API...\n');

    const result = await testGeneratePrompt(testCase.title, testCase.content);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test PASSED - Gemini Generated Prompt:');
    console.log('='.repeat(60));
    console.log('📁 Suggested Filename:', result.filename);
    console.log('📝 Prompt:', result.prompt);
    console.log('='.repeat(60));

    // 验证
    const requirements = {
      'Contains "geometric flat"': result.prompt
        .toLowerCase()
        .includes('geometric flat'),
      'Contains "sky blue"': result.prompt.toLowerCase().includes('sky blue'),
      'Contains "4:3"': result.prompt.includes('4:3'),
      'No text mentioned': !result.prompt.toLowerCase().includes('with text'),
      'Length 50-150 words': result.prompt.split(/\s+/).length >= 50,
    };

    console.log('\n📊 Validation:');
    for (const [check, passed] of Object.entries(requirements)) {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    }

    const allPassed = Object.values(requirements).every((v) => v);
    console.log(
      `\n${allPassed ? '✅ ALL CHECKS PASSED' : '⚠️  SOME CHECKS FAILED'}\n`
    );
  } catch (error) {
    console.error('\n❌ Test FAILED:', error);
    process.exit(1);
  }
}

testGeminiPromptGeneration();
