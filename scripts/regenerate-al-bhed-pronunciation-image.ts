/**
 * Regenerate the "Real-Time Pronunciation" Fun Fact illustration for Al Bhed Translator
 */

import path from 'path';
// Load environment variables from .env.local
import { config } from 'dotenv';

const envResult = config({ path: path.join(process.cwd(), '.env.local') });

// Debug: Check if API key is loaded
console.log('🔑 Environment variables loaded:', !envResult.error);
console.log(
  '🔑 GOOGLE_GENERATIVE_AI_API_KEY exists:',
  !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
);

import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const alBhedSections: ArticleSections = {
  toolName: 'Al Bhed Translator',

  // Required field - using actual content from the page
  whatIs: {
    title: 'What is Al Bhed Translator?',
    content:
      'Al Bhed Translator is a tool designed to translate text between Al Bhed and English. Ideal for fans of Final Fantasy X, it offers real-time translations, speech input and output, and offline support.',
  },

  // The Fun Fact we want to generate an image for
  funFacts: [
    {
      title: 'Al Bhed is a Cipher Language',
      content:
        "Did you know? Al Bhed is essentially a cipher – each letter of the English alphabet gets swapped with a different one. It's simple but fun to decode! I love how this makes learning the language like cracking a secret code!",
    },
    {
      title: 'Real-Time Pronunciation',
      content:
        "Al Bhed's pronunciation isn't covered much, but with Vibetrans, you can hear the translations in real-time. It's like bringing the language to life! I think it's a great way to immerse yourself even more in Final Fantasy X!",
    },
  ],

  // Placeholder for required fields
  userInterests: [
    {
      title: 'Learn Al Bhed Fast',
      content:
        "With Vibetrans, you can start learning Al Bhed in minutes. Whether you're a beginner or a Final Fantasy pro, this tool simplifies the process.",
    },
    {
      title: 'Real-Time Translation with Speech',
      content:
        'Need to hear how it sounds? Vibetrans offers real-time speech output, making it easier to perfect your pronunciation.',
    },
    {
      title: 'Translate Anytime, Anywhere',
      content:
        'Whether you are online or offline, Vibetrans ensures you can always access your translations.',
    },
    {
      title: 'Customize Your Al Bhed Learning Experience',
      content:
        'Vibetrans lets you adjust settings to fit your learning style. Want a more in-depth translation? You got it!',
    },
  ],
};

async function main() {
  console.log(
    '🚀 Starting Article Illustrator workflow for Al Bhed Translator - Real-Time Pronunciation Fun Fact...\n'
  );

  try {
    const result = await generateArticleIllustrations(alBhedSections);

    if (result.success) {
      console.log('\n✅ Illustration generation completed!');
      console.log(
        '\n📝 Note: This will generate images for both Fun Facts. You only need to replace the second one (Real-Time Pronunciation).'
      );
      process.exit(0);
    } else {
      console.error('\n❌ Illustration generation failed!');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
