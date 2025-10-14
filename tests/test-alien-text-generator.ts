/**
 * Generate Images for Alien Text Generator Page
 */

import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const alienTextGeneratorSections: ArticleSections = {
  toolName: 'alien-text-generator',

  // What is Section (1 image)
  whatIs: {
    title: 'What is Alien Text Generator',
    content: `Alien Text Generator is a tool that transforms regular text into various extraterrestrial
    language styles. Whether for creative projects, games, or social media posts, it lets you explore
    a variety of out-of-this-world text formats. With VibeTrans, unleash your imagination!`,
  },

  // Fun Facts (2 images)
  funFacts: [
    {
      title: 'Zalgo Text Origin',
      content: `Did you know that the Zalgo text used in memes comes from a 2004 internet horror story?
      The creepy, jumbled text style has spread all over the web and is now a key part of meme culture.
      It's hilarious how it still freaks people out!`,
    },
    {
      title: 'Unicode Magic',
      content: `Alien texts often use Unicode characters like Greek, Cyrillic, and mathematical symbols.
      It's crazy how combining these can make text look completely out of this world. Creative use of
      Unicode symbols to create alien-looking text!`,
    },
  ],

  // User Interests (4 images)
  userInterests: [
    {
      title: 'Alien Text for Social Media',
      content: `Want your social media posts to stand out? With the Alien Text Generator, you can create
      text in unique alien styles that grab attention and spark curiosity. Whether it's your bio or a
      funny post, this tool has you covered!`,
    },
    {
      title: 'Alien Text for Creative Projects',
      content: `Working on a creative project? The Alien Text Generator is perfect for designing texts
      that match your sci-fi themes, giving your work a distinctive edge. Whether it's for a story or
      game, you can now bring otherworldly vibes to your projects!`,
    },
    {
      title: 'Text Styles for Games',
      content: `Level up your gaming experience with alien text styles for your username, profile, or
      game-related content. With the Alien Text Generator, you can make your in-game communication or
      identity truly stand out!`,
    },
    {
      title: 'Fun and Meme Creation',
      content: `Turn ordinary text into funny or eerie alien text that's perfect for memes. You can
      easily create strange, intriguing texts that make people laugh or leave them guessing. A fun way
      to bring more creativity to your online presence!`,
    },
  ],
};

async function generateAlienTextImages() {
  console.log('\n🚀 Generating Images for Alien Text Generator Page');
  console.log('='.repeat(70));
  console.log('⏱️  Estimated time: 15-25 minutes');
  console.log(
    '📊 Total images: 7 (1 What is + 2 Fun Facts + 4 User Interests)\n'
  );

  try {
    const result = await generateArticleIllustrations(
      alienTextGeneratorSections
    );

    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALIEN TEXT GENERATOR IMAGES COMPLETED');
    console.log('='.repeat(70));

    if (result.success) {
      console.log(
        `\n✅ Success: ${result.successfulImages}/7 images generated`
      );
      console.log(`❌ Failed: ${result.failedImages}/7 images`);
      console.log(
        `⏱️  Total time: ${(result.totalTimeMs / 1000 / 60).toFixed(2)} minutes`
      );

      console.log('\n📁 Generated Files:');
      result.images
        .filter((img) => img.status === 'success')
        .forEach((img, idx) => {
          console.log(
            `   ${idx + 1}. ${img.filename} (${img.size}KB) - ${img.title}`
          );
        });

      if (result.failedImages > 0) {
        console.log('\n⚠️  Failed Images:');
        result.images
          .filter((img) => img.status === 'failed')
          .forEach((img) => {
            console.log(`   ❌ ${img.title}: ${img.error}`);
          });
      }

      return 0;
    } else {
      console.log('\n❌ Generation failed');
      return 1;
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    return 1;
  }
}

generateAlienTextImages()
  .then((exitCode) => {
    console.log('\n' + '='.repeat(70) + '\n');
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
