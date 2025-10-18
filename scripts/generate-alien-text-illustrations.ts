/**
 * Generate all illustrations for Alien Text Generator using Article Illustrator workflow
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

const alienTextSections: ArticleSections = {
  toolName: 'Alien Text Generator',

  whatIs: {
    title: 'What is Alien Text Generator?',
    content:
      'Alien Text Generator is a tool that transforms regular text into various extraterrestrial language styles. Whether for creative projects, games, or social media posts, it lets you explore a variety of out-of-this-world text formats. With VibeTrans, unleash your imagination!',
  },

  funFacts: [
    {
      title: 'Zalgo Text Origin',
      content:
        "Did you know that the Zalgo text used in memes comes from a 2004 internet horror story? The creepy, jumbled text style has spread all over the web and is now a key part of meme culture. I think it's hilarious how it still freaks people out!",
    },
    {
      title: 'Unicode Magic',
      content:
        "Alien texts often use Unicode characters like Greek, Cyrillic, and mathematical symbols. It's crazy how combining these can make text look completely out of this world. I love how creative this tool can get with symbols!",
    },
  ],

  userInterests: [
    {
      title: 'Alien Text for Social Media',
      content:
        "Want your social media posts to stand out? With the Alien Text Generator, you can create text in unique alien styles that grab attention and spark curiosity. Whether it's your bio or a funny post, this tool has you covered!",
    },
    {
      title: 'Alien Text for Creative Projects',
      content:
        "Working on a creative project? The Alien Text Generator is perfect for designing texts that match your sci-fi themes, giving your work a distinctive edge. Whether it's for a story or game, you can now bring otherworldly vibes to your projects!",
    },
    {
      title: 'Text Styles for Games',
      content:
        'Level up your gaming experience with alien text styles for your username, profile, or game-related content. With the Alien Text Generator, you can make your in-game communication or identity truly stand out!',
    },
    {
      title: 'Fun and Meme Creation',
      content:
        "Turn ordinary text into funny or eerie alien text that's perfect for memes. You can easily create strange, intriguing texts that make people laugh or leave them guessing. A fun way to bring more creativity to your online presence!",
    },
  ],
};

async function main() {
  console.log(
    '🚀 Starting Article Illustrator workflow for Alien Text Generator...\n'
  );

  try {
    const result = await generateArticleIllustrations(alienTextSections);

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
