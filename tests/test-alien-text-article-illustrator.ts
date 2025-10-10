/**
 * Article Illustrator Test for Alien Text Generator Page
 *
 * Generates 7 images for alien-text-generator page:
 * - 1 What Is section
 * - 2 Fun Facts
 * - 4 User Interests
 */

import 'dotenv/config';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

// Alien Text Generator sections data
const alienTextSections: ArticleSections = {
  toolName: 'alien-text-generator',
  whatIs: {
    title: 'What is Alien Text Generator?',
    content: `Alien Text Generator is a tool that transforms regular text into various extraterrestrial language styles.
    Whether for creative projects, games, or social media posts, it lets you explore a variety of out-of-this-world
    text formats. With VibeTrans, unleash your imagination and create unique alien text styles including Zalgo,
    symbols, circle text, square text, futuristic, and cursive styles.`,
  },
  funFacts: [
    {
      title: 'Zalgo Text Origin',
      content: `Did you know that the Zalgo text used in memes comes from a 2004 internet horror story?
      The creepy, jumbled text style has spread all over the web and is now a key part of meme culture.
      The name comes from a Creepypasta meme featuring distorted text that appears to be corrupted or glitching,
      creating an eerie, otherworldly effect that still freaks people out today!`,
    },
    {
      title: 'Unicode Magic',
      content: `Alien texts often use Unicode characters like Greek, Cyrillic, and mathematical symbols.
      It's amazing how combining these can make text look completely out of this world. Unicode contains over
      149,000 characters from various writing systems, and creative combinations of diacritical marks,
      special symbols, and characters from different scripts can create fascinating alien-looking text effects.`,
    },
  ],
  userInterests: [
    {
      title: 'Alien Text for Social Media',
      content: `Want your social media posts to stand out? With the Alien Text Generator, you can create text
      in unique alien styles that grab attention and spark curiosity. Transform your Instagram bio, Twitter posts,
      Facebook updates, or TikTok captions with eye-catching alien text styles. Make your profile memorable and
      increase engagement with unique, otherworldly text that makes people stop scrolling.`,
    },
    {
      title: 'Alien Text for Creative Projects',
      content: `Working on a creative project? The Alien Text Generator is perfect for designing texts that match
      your sci-fi themes, giving your work a distinctive edge. Whether you're creating album art, movie posters,
      book covers, or designing UI for a sci-fi game, alien text adds that authentic extraterrestrial feel.
      Perfect for writers, designers, and artists looking to bring otherworldly vibes to their creative work.`,
    },
    {
      title: 'Text Styles for Games',
      content: `Level up your gaming experience with alien text styles for your username, profile, or game-related
      content. With the Alien Text Generator, you can make your in-game communication or identity truly stand out.
      Create unique character names, guild tags, or chat messages that reflect your sci-fi gaming persona.
      Popular in RPGs, MMOs, and space-themed games where players want to immerse themselves in alien worlds.`,
    },
    {
      title: 'Fun and Meme Creation',
      content: `Turn ordinary text into funny or eerie alien text that's perfect for memes. You can easily create
      strange, intriguing texts that make people laugh or leave them guessing. Zalgo text is especially popular
      for cursed memes and horror-themed content. The glitchy, corrupted appearance adds instant comedy or creepiness
      to any text. A fun way to bring more creativity to your online presence and create viral-worthy content!`,
    },
  ],
};

async function runAlienTextIllustrationTest() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Article Illustrator - Alien Text Generator');
  console.log('='.repeat(70));
  console.log('\n📝 This script will generate 7 images:');
  console.log('   - 1 What Is section image');
  console.log('   - 2 Fun Facts images');
  console.log('   - 4 User Interests images');
  console.log('\n⚠️  Estimated time: 15-25 minutes');
  console.log('⚠️  Using: Gemini (analysis) + KIE API (image generation)\n');

  try {
    // Run complete workflow
    const result = await generateArticleIllustrations(alienTextSections);

    // Final report
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(70));

    if (result.success) {
      console.log(
        `✅ Success: ${result.successfulImages}/${result.totalImages} images generated`
      );
      console.log(
        `⏱️  Total time: ${(result.totalTimeMs / 1000 / 60).toFixed(2)} minutes\n`
      );

      console.log('📁 Generated files in /public/images/docs/:');
      result.images
        .filter((img) => img.status === 'success')
        .forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img.filename} (${img.size}KB)`);
          console.log(`      Section: ${img.section} - ${img.title}`);
        });

      if (result.failedImages > 0) {
        console.log(`\n⚠️  ${result.failedImages} images failed:`);
        result.images
          .filter((img) => img.status === 'failed')
          .forEach((img) => {
            console.log(`   ❌ ${img.title}: ${img.error}`);
          });
      }

      console.log('\n✅ WORKFLOW COMPLETED SUCCESSFULLY');
      return 0;
    } else {
      console.log('❌ WORKFLOW FAILED');
      console.log(
        `   Successful: ${result.successfulImages}/${result.totalImages}`
      );
      console.log(`   Failed: ${result.failedImages}/${result.totalImages}`);
      return 1;
    }
  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    return 1;
  }
}

// Execute
runAlienTextIllustrationTest()
  .then((exitCode) => {
    console.log('\n' + '='.repeat(70) + '\n');
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
