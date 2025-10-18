/**
 * Generate Fun Facts illustrations for Al Bhed Translator using Article Illustrator workflow
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

  // We only need Fun Facts, but whatIs is required by the type
  whatIs: {
    title: 'What is Al Bhed Translator?',
    content:
      'Al Bhed Translator is a tool to translate between English and Al Bhed, the unique language from Final Fantasy X.',
  },

  funFacts: [
    {
      title: 'Final Fantasy Al Bhed Language',
      content:
        "Al Bhed is the unique cipher language from Final Fantasy X, used by the Al Bhed people. It's a simple substitution cipher where each English letter maps to a different letter. Fans love using this translator to communicate in secret or add authenticity to their Final Fantasy cosplay and roleplay.",
    },
    {
      title: 'Translate Anytime, Anywhere',
      content:
        "With VibeTrans Al Bhed Translator, you can instantly translate between English and Al Bhed on any device. Whether you're playing Final Fantasy X, chatting with fellow fans, or creating content, our tool makes translation fast and easy. No downloads or installations required!",
    },
  ],

  userInterests: [
    {
      title: 'Placeholder 1',
      content: 'Placeholder content 1',
    },
    {
      title: 'Placeholder 2',
      content: 'Placeholder content 2',
    },
    {
      title: 'Placeholder 3',
      content: 'Placeholder content 3',
    },
    {
      title: 'Placeholder 4',
      content: 'Placeholder content 4',
    },
  ],
};

async function main() {
  console.log(
    '🚀 Starting Article Illustrator workflow for Al Bhed Translator Fun Facts...\n'
  );

  try {
    const result = await generateArticleIllustrations(alBhedSections);

    if (result.success) {
      console.log('\n✅ Illustration generation completed!');
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
