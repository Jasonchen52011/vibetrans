#!/usr/bin/env node

/**
 * Regenerate specific Cantonese translator sections using complete Gemini workflow
 */

import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';

const sections: ArticleSections = {
  toolName: 'cantonese-translator',
  whatIs: {
    title: 'What is Cantonese Translator',
    content:
      'A cantonese translator is a tool that converts text or speech from English or other languages into Cantonese. VibeTrans excels in this by offering accurate translations, understanding Cantonese unique tones and slang.',
  },
  funFacts: [
    {
      title: 'Cantonese Tones',
      content: 'Cantonese has 6-9 tones depending on the classification system used, making it one of the most tonal Chinese dialects.',
    },
    {
      title: 'Hong Kong Slang',
      content: 'Cantonese in Hong Kong incorporates many English loanwords and has unique slang that differs from Guangzhou Cantonese.',
    },
  ],
  userInterests: [
    {
      title: 'Mastering Cantonese Tones',
      content:
        'VibeTrans is like your personal Cantonese mentor, breaking down those tricky 6-9 tones with ease. It is all about helping you nail the pronunciation, so you sound like a local. Say goodbye to tone confusion and hello to confidence!',
    },
    {
      title: 'Seamless Integration with Apps',
      content:
        'VibeTrans is not just a translator; it is your new best friend in messaging apps like WhatsApp and WeChat. With its seamless integration, you can chat away without missing a beat. It fits right in, making conversations smoother and more fun.',
    },
    {
      title: 'Real-time Translation',
      content:
        'Experience instant translations with VibeTrans powerful real-time engine. Perfect for live conversations and quick messaging.',
    },
    {
      title: 'Cultural Context',
      content:
        'VibeTrans understands Hong Kong culture and slang, providing translations that make sense in context.',
    },
  ],
};

async function regenerateSections() {
  console.log('🎨 Regenerating Cantonese sections with Gemini workflow\n');

  try {
    const result = await generateArticleIllustrations(sections, {
      captureHowTo: false, // Skip how-to screenshot
    });

    if (result.success) {
      console.log('\n✅ Sections regenerated successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Some images failed to generate');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

regenerateSections();
