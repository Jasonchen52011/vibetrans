/**
 * Quick Test: Generate all 7 prompts with Gemini
 * (Without actual image generation - just verify prompt quality)
 */

import { analyzeArticleSections } from '../src/lib/article-illustrator/gemini-analyzer';
import type { ArticleSections } from '../src/lib/article-illustrator/types';

const testSections: ArticleSections = {
  toolName: 'esperanto-translator',
  whatIs: {
    title: 'What is Esperanto Translator',
    content: `The Esperanto Translator is a powerful tool that converts text between English and Esperanto,
    the international auxiliary language. It supports text, voice, and document uploads.`,
  },
  funFacts: [
    {
      title: 'Esperanto on the Voyager Golden Record',
      content: `NASA sent Esperanto greetings on the Voyager Golden Record into deep space,
      representing humanity to potential extraterrestrial civilizations.`,
    },
    {
      title: 'Esperanto Literature and Culture',
      content: `Esperanto has over 25,000 published books, including original works and translations
      of classics like Hamlet and the Bible.`,
    },
  ],
  userInterests: [
    {
      title: 'User-Friendly Interface',
      content: `Intuitive, clean interface designed for ease of use across all devices.`,
    },
    {
      title: 'Instant Translation',
      content: `Lightning-fast translation powered by advanced AI models with real-time processing.`,
    },
    {
      title: 'Multilingual Support',
      content: `Context understanding from multiple languages with intelligent cultural adaptation.`,
    },
    {
      title: 'Voice Input and Output',
      content: `Voice recognition and text-to-speech for comprehensive audio assistance.`,
    },
  ],
};

async function quickTest() {
  console.log('\n🚀 Quick Test: Gemini Prompt Generation');
  console.log('='.repeat(70));
  console.log(
    '📝 Generating 7 prompts (1 What is + 2 Fun Facts + 4 User Interests)\n'
  );

  try {
    const prompts = await analyzeArticleSections(testSections);

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL PROMPTS GENERATED SUCCESSFULLY');
    console.log('='.repeat(70));

    // Validate all prompts
    console.log('\n📊 Prompt Validation:\n');
    let allValid = true;

    prompts.forEach((p, idx) => {
      const checks = {
        'geometric flat': p.prompt.toLowerCase().includes('geometric flat'),
        'sky blue': p.prompt.toLowerCase().includes('sky blue'),
        '4:3': p.prompt.includes('4:3'),
        'no text': !p.prompt.toLowerCase().includes('with text'),
      };

      const valid = Object.values(checks).every((v) => v);
      allValid = allValid && valid;

      console.log(
        `[${idx + 1}/7] ${p.section}${p.index !== undefined ? ` #${p.index + 1}` : ''}: "${p.title}"`
      );
      console.log(`   Filename: ${p.suggestedFilename}.webp`);
      console.log(`   Checks: ${valid ? '✅ PASS' : '❌ FAIL'}`);
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`      ${passed ? '✅' : '❌'} ${check}`);
      }
      console.log(`   Prompt: ${p.prompt.substring(0, 100)}...`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log(allValid ? '🎉 ALL PROMPTS VALID!' : '⚠️  SOME PROMPTS INVALID');
    console.log('='.repeat(70));

    console.log('\n📋 Generated Filenames:');
    prompts.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.suggestedFilename}.webp`);
    });

    console.log('\n✅ Quick test completed successfully!\n');
    return 0;
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    return 1;
  }
}

quickTest()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
