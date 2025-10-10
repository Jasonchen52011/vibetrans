/**
 * End-to-End Test: Article Illustrator Complete Workflow
 *
 * This test runs the complete workflow:
 * 1. Gemini analyzes sections → generates prompts
 * 2. Volcano generates images from prompts
 * 3. Sharp converts images to WebP (800x600, ~90KB)
 * 4. Saves to /public/images/docs/
 */

import type { ArticleSections } from '../src/lib/article-illustrator/types';
import {
  generateArticleIllustrations,
  cleanupTestImages,
} from '../src/lib/article-illustrator/workflow';

// Test data: Esperanto Translator sections
const testSections: ArticleSections = {
  toolName: 'esperanto-translator',
  whatIs: {
    title: 'What is Esperanto Translator',
    content: `The Esperanto Translator is a powerful tool that converts text between English and Esperanto,
    the international auxiliary language created by L. L. Zamenhof in 1887. It supports multiple input formats including
    text, voice, and document uploads (.txt, .docx), making language translation accessible and easy for everyone.
    With advanced AI-powered translation and real-time processing, it helps bridge communication gaps globally.`,
  },
  funFacts: [
    {
      title: 'Esperanto on the Voyager Golden Record',
      content: `In 1977, NASA sent the Voyager spacecraft into deep space carrying the Golden Record,
      which includes greetings in 55 languages - including Esperanto. This makes Esperanto one of the few
      constructed languages to represent humanity to potential extraterrestrial civilizations, showcasing
      its role as a universal communication tool.`,
    },
    {
      title: 'Esperanto Literature and Culture',
      content: `Esperanto has a rich literary tradition with over 25,000 books published in the language,
      including original works and translations of classics like Hamlet and the Bible. The language has its own
      music, poetry, and even annual cultural festivals (Universala Kongreso) attended by thousands worldwide,
      demonstrating its vibrant living community.`,
    },
  ],
  userInterests: [
    {
      title: 'User-Friendly Interface',
      content: `Our Esperanto Translator features an intuitive, clean interface designed for ease of use.
      Whether you're a beginner or an experienced Esperanto speaker, the simple layout with clear buttons
      for input, translation, and voice features makes translation effortless. The responsive design works
      seamlessly across all devices.`,
    },
    {
      title: 'Instant Translation',
      content: `Experience lightning-fast translation powered by advanced AI models. Type or speak your text
      and receive accurate Esperanto translations in seconds. Our real-time processing ensures smooth workflow
      whether you're translating a single word or an entire document, with no delays or waiting times.`,
    },
    {
      title: 'Multilingual Support',
      content: `While specializing in English-Esperanto translation, our tool supports context understanding
      from multiple languages. The intelligent system can detect language nuances and cultural context,
      providing translations that preserve meaning and tone across linguistic boundaries.`,
    },
    {
      title: 'Voice Input and Output',
      content: `Speak naturally and let our voice recognition technology convert your speech to text for translation.
      After translation, use the text-to-speech feature to hear the correct Esperanto pronunciation, perfect for
      language learners. The voice features support both English and Esperanto for comprehensive audio assistance.`,
    },
  ],
};

async function runEndToEndTest() {
  console.log('\n🚀 Starting End-to-End Test');
  console.log('⚠️  WARNING: This test will:');
  console.log('   - Call Gemini API (7 requests)');
  console.log(
    '   - Call Volcano Engine API (7 image generations, ~2-3 min each)'
  );
  console.log('   - Generate 7 WebP images in /public/images/docs/');
  console.log('   - Total estimated time: 15-25 minutes\n');

  // Confirm execution
  console.log('🔍 Test Configuration:');
  console.log(`   Tool: ${testSections.toolName}`);
  console.log(`   Sections: 1 What is + 2 Fun Facts + 4 User Interests`);
  console.log(`   Total images: 7\n`);

  try {
    // Run complete workflow
    const result = await generateArticleIllustrations(testSections);

    // Check results
    console.log('\n' + '='.repeat(70));
    console.log('✅ END-TO-END TEST COMPLETED');
    console.log('='.repeat(70));

    if (result.success && result.successfulImages === 7) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log(`✅ All 7 images generated successfully`);
      console.log(
        `⏱️  Total time: ${(result.totalTimeMs / 1000 / 60).toFixed(2)} minutes\n`
      );

      console.log('📋 Test Summary:');
      console.log(`   ✅ Gemini prompts: 7/7`);
      console.log(`   ✅ Volcano images: ${result.successfulImages}/7`);
      console.log(`   ✅ WebP conversions: ${result.successfulImages}/7`);
      console.log(`   ✅ Files saved: ${result.successfulImages}/7\n`);

      return 0; // Success
    } else {
      console.log('⚠️  TEST PARTIALLY SUCCEEDED');
      console.log(`✅ Successful: ${result.successfulImages}/7`);
      console.log(`❌ Failed: ${result.failedImages}/7\n`);

      if (result.failedImages > 0) {
        console.log('Failed images:');
        result.images
          .filter((img) => img.status === 'failed')
          .forEach((img) => {
            console.log(`   ❌ ${img.title}: ${img.error}`);
          });
      }

      return 1; // Partial failure
    }
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nFull error:', error);
    return 1; // Failure
  }
}

// Run test
runEndToEndTest()
  .then((exitCode) => {
    console.log(`\n${'='.repeat(70)}\n`);
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
