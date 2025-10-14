#!/usr/bin/env node

/**
 * Generate images for Pig Latin Translator using Article Illustrator AI Workflow
 *
 * Generates 7 images (excluding "Perfect for ESL Learners and Teachers"):
 * 1. what-is-pig-latin-translator.webp
 * 2. pig-latin-translator-fact-1.webp (Early Days of Pig Latin)
 * 3. pig-latin-translator-fact-2.webp (Secret Codes and Pig Latin)
 * 4. pig-latin-translator-interest-1.webp (Master Pig Latin Quickly)
 * 5. pig-latin-translator-interest-2.webp (Translate Large Documents)
 * 6. pig-latin-translator-interest-3.webp (Handling Names and Punctuation)
 * 7. pig-latin-translator-interest-4.webp (Audio Learning with Pig Latin)
 */

import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';

// Define the article sections with titles and content
const pigLatinSections: ArticleSections = {
  toolName: 'pig-latin-translator',

  // What Is Section (1 image)
  whatIs: {
    title: 'What is Pig Latin Translator',
    content: `Pig Latin Translator is a fun and easy-to-use tool that converts English text into Pig Latin. With VibeTrans, you can enjoy translating phrases for entertainment or learning purposes. This playful language transformation has been a favorite among children and language enthusiasts for over a century. Our translator supports multiple input methods including text input, document uploads (.txt, .docx), and even voice recognition, making it simple and accessible for everyone. Whether you're using it for classroom activities, creative writing, or just for fun, VibeTrans provides accurate and instant Pig Latin translations that preserve the meaning and playful nature of this quirky language game.`,
  },

  // Fun Facts Section (2 images)
  funFacts: [
    {
      title: 'Early Days of Pig Latin',
      content: `Did you know Pig Latin, or 'Hog Latin,' first popped up in an 1895 newspaper? What started as a quirky linguistic term became a playful secret code that children have adored for generations. The language game has fascinating historical roots in American culture, appearing in early 20th-century vaudeville performances and children's playground games. Over the decades, Pig Latin evolved from a simple word-play technique into a cultural phenomenon that has been featured in movies, TV shows, and literature. VibeTrans celebrates this rich history by making it easy and fun to explore Pig Latin's linguistic quirks and continue this beloved tradition in the digital age.`,
    },
    {
      title: 'Secret Codes and Pig Latin',
      content: `In the T9 texting era, teenagers cleverly used Pig Latin to dodge parental oversight and create secret communications. Imagine sending a coded message like 'ixnay on the olitics-pay' to communicate privately with friends. This ingenious use of language transformation shows how Pig Latin has adapted through different technological eras, from playground whispers to digital messages. During World War II, some soldiers even used Pig Latin as a simple code for non-critical communications. Today, Pig Latin remains a popular tool for teaching phonetic awareness, creating playful content, and maintaining the age-old tradition of secret codes among friends. VibeTrans helps keep this playful linguistic tradition alive with modern, easy-to-use technology.`,
    },
  ],

  // User Interests Section (4 images - excluding "Perfect for ESL Learners and Teachers")
  userInterests: [
    {
      title: 'Master Pig Latin Quickly',
      content: `Ever wanted to speak Pig Latin fluently? With VibeTrans, you can practice daily to master this quirky language game and impress your friends. Learning Pig Latin is not just fun—it's also a brilliant way to sharpen your English pronunciation skills and understand phonetic patterns better. As you practice converting words like 'apple' becoming 'appleyay' and 'hello' transforming into 'ellohay', you develop a deeper awareness of consonant clusters, syllable structures, and sound manipulation. VibeTrans provides instant feedback and accurate translations, making your learning journey smooth and enjoyable. Whether you're a complete beginner or looking to refine your skills, our tool offers the perfect platform for mastering this playful language transformation technique.`,
    },
    {
      title: 'Translate Large Documents',
      content: `Got a big document to convert into Pig Latin? VibeTrans has you covered with powerful batch translation capabilities. You can upload whole files, including novels, scripts, educational materials, or creative writing projects, and translate them instantly into playful Pig Latin. This feature is a game-changer, especially for teachers creating engaging language exercises, writers adding creative flair to their work, or language enthusiasts experimenting with large-scale text transformations. Our advanced processing handles everything from simple paragraphs to complex documents with multiple pages, while preserving formatting, punctuation, and text structure. Save time and effort by translating entire documents in seconds rather than converting word by word manually.`,
    },
    {
      title: 'Handling Names and Punctuation',
      content: `Ever wondered how to translate 'Michael Jordan' or properly handle punctuation in Pig Latin? VibeTrans smartly handles proper nouns and punctuation marks with intelligent recognition. Our tool understands context and preserves names, capitalization, and punctuation perfectly—keeping 'Hello, world!' clear and readable as 'Ellohay, orldway!' This attention to detail ensures your Pig Latin translations remain comprehensible and grammatically correct. Whether you're translating formal documents, creative stories with character names, or casual conversations, VibeTrans maintains the integrity of your text while applying proper Pig Latin transformation rules. It's the perfect balance between linguistic playfulness and practical readability that makes our translator stand out.`,
    },
    {
      title: 'Audio Learning with Pig Latin',
      content: `Want to hear Pig Latin read aloud and perfect your pronunciation? VibeTrans offers an advanced text-to-speech feature that brings Pig Latin to life through audio. This auditory learning tool is fantastic for understanding how Pig Latin sounds when spoken, making it easier to grasp pronunciation patterns and rhythm. Hearing phrases like 'ellohay' (hello) and 'oodbyegay' (goodbye) spoken out loud helps reinforce learning and makes practice more engaging and effective. This feature is especially valuable for auditory learners, language teachers demonstrating Pig Latin in classrooms, or anyone wanting to develop fluency in speaking this playful language. Listen, learn, and master Pig Latin pronunciation with VibeTrans's audio support.`,
    },
  ],
};

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🎨 Pig Latin Translator - AI Image Generation');
  console.log('='.repeat(80));
  console.log('\n📋 Workflow:');
  console.log('   1. Gemini analyzes content → generates image prompts');
  console.log('   2. Volcano 4.0 generates images (with auto-fallback)');
  console.log('   3. Sharp converts to optimized WebP format');
  console.log('   4. Saves to public/images/docs/\n');
  console.log('⏱️  Estimated time: 15-25 minutes\n');
  console.log('📝 Note: Excluding "Perfect for ESL Learners and Teachers" section\n');

  try {
    const result = await generateArticleIllustrations(pigLatinSections, {
      captureHowTo: false, // 不截图，只生成内容图
    });

    if (result.success) {
      console.log('\n✅ Generation completed successfully!');
      console.log(`📊 Results: ${result.successfulImages}/${result.totalImages} images generated`);
      console.log(`⏱️  Total time: ${(result.totalTimeMs / 1000 / 60).toFixed(2)} minutes`);

      if (result.failedImages > 0) {
        console.log(`\n⚠️  Warning: ${result.failedImages} images failed`);
        process.exit(1);
      }
    } else {
      console.error('\n❌ Generation failed');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main();
