#!/usr/bin/env node

/**
 * Generate images for Albanian to English Translator using Article Illustrator AI Workflow
 *
 * This script uses:
 * 1. Gemini API to analyze content and generate prompts automatically
 * 2. Volcano 4.0 to generate images (with fallback to other models)
 * 3. Sharp to convert images to WebP format
 *
 * Generates 7 images:
 * 1. what-is-albanian-to-english.webp
 * 2. albanian-to-english-fact-1.webp
 * 3. albanian-to-english-fact-2.webp
 * 4. albanian-to-english-interest-1.webp
 * 5. albanian-to-english-interest-2.webp
 * 6. albanian-to-english-interest-3.webp
 * 7. albanian-to-english-interest-4.webp
 */

import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

// Define the article sections with titles and content
const albanianToEnglishSections: ArticleSections = {
  toolName: 'albanian-to-english',

  // What Is Section (1 image)
  whatIs: {
    title: 'What is Albanian to English Translator',
    content: `The Albanian to English Translator is an AI-powered translation tool that helps you convert text between Albanian and English languages. This professional translation service supports multiple input methods including text input, document uploads (.txt, .docx), and voice recognition. With advanced neural machine translation technology, it provides accurate translations while preserving the meaning, context, and cultural nuances of your content. Perfect for students, travelers, business professionals, and language learners who need reliable Albanian-English translation services.`,
  },

  // Fun Facts Section (2 images)
  funFacts: [
    {
      title: 'Albanian: A Unique Indo-European Language Branch',
      content: `Albanian is a fascinating language that forms its own unique branch in the Indo-European language family, making it one of the most distinctive languages in Europe. With approximately 7 million speakers worldwide, Albanian has preserved many ancient linguistic features that have disappeared from other Indo-European languages. The Albanian alphabet consists of 36 letters, including special characters like 'ë' and 'ç' that are unique to the language. This linguistic isolation has resulted in a remarkably preserved ancient vocabulary and grammatical structures that linguists find invaluable for understanding Proto-Indo-European languages.`,
    },
    {
      title: 'Two Dialects, One Nation: Gheg and Tosk',
      content: `Albania is linguistically divided by the Shkumbin River into two main dialect regions: Gheg in the north and Tosk in the south. While both dialects are mutually intelligible, they have distinct phonological, grammatical, and lexical differences that developed over centuries. In 1972, the Albanian government standardized the language based primarily on the Tosk dialect, creating what is now known as Standard Albanian. Despite this standardization, both dialects continue to thrive in their respective regions, with Gheg being spoken in northern Albania and Kosovo, while Tosk dominates southern Albania. This linguistic diversity adds richness to Albanian culture while maintaining national unity through the standard written form.`,
    },
  ],

  // User Interests Section (4 images)
  userInterests: [
    {
      title: 'Albanian Grammar and Language Structure',
      content: `Albanian grammar is complex and fascinating, featuring five grammatical cases (nominative, genitive, dative, accusative, and ablative) that affect noun endings and determine sentence structure. The language employs definite articles as suffixes attached to nouns - for example, 'libër' (book) becomes 'libri' (the book). Albanian verbs have complex conjugation patterns with multiple tenses, moods, and aspects. Unlike English, Albanian has relatively flexible word order due to its case system, allowing speakers to emphasize different parts of sentences by rearranging words. This grammatical richness makes Albanian challenging but rewarding to learn.`,
    },
    {
      title: 'Albanian Cultural Expressions and Unique Concepts',
      content: `Albanian language contains unique cultural concepts that reflect the nation's deep-rooted traditions and values. The word 'besa' represents a sacred honor code and promise that is central to Albanian culture, meaning an unbreakable word of honor that must be kept at all costs. Traditional Albanian greetings and hospitality phrases emphasize warmth, respect, and familial bonds that are integral to Albanian society. These linguistic expressions reflect centuries of cultural heritage, including the importance of family honor, guest protection, and community solidarity. Understanding these cultural expressions is essential for truly appreciating Albanian language and connecting with Albanian-speaking communities.`,
    },
    {
      title: 'Learning Albanian: Gateway to Balkan History',
      content: `Learning Albanian opens doors to understanding the rich history and culture of the Balkans. The language has ancient Illyrian roots, connecting learners to one of Europe's oldest civilizations that inhabited the region before Roman times. Albanian is spoken not only in Albania but also in Kosovo, North Macedonia, Montenegro, and by diaspora communities worldwide in Italy, Greece, Turkey, and the Americas. Studying Albanian provides insights into Balkan history, from ancient Illyrian kingdoms through Ottoman rule to modern nation-building. The language serves as a bridge to understanding regional politics, cultural traditions, and the complex ethnic and linguistic landscape of Southeastern Europe.`,
    },
    {
      title: 'Albanian for Business and International Communication',
      content: `Albania's growing economy and strategic location in the Balkans make Albanian language skills increasingly valuable for international business. The country has emerging sectors in tourism, energy, information technology, and manufacturing that attract foreign investment and create opportunities for Albanian-English bilingual professionals. Understanding Albanian facilitates business negotiations, partnership building, and market entry strategies for companies looking to expand in the Balkan region. Albanian language skills enable effective communication with local partners, government officials, and customers, while demonstrating cultural respect and commitment to long-term business relationships. As Albania continues its European Union integration process, demand for Albanian-English translation and interpretation services continues to grow.`,
    },
  ],
};

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🎨 Albanian to English Translator - AI Image Generation');
  console.log('='.repeat(80));
  console.log('\n📋 Workflow:');
  console.log('   1. Gemini analyzes content → generates image prompts');
  console.log('   2. Volcano 4.0 generates images (with auto-fallback)');
  console.log('   3. Sharp converts to optimized WebP format');
  console.log('   4. Playwright captures How-To screenshot');
  console.log('   5. Saves to public/images/docs/\n');
  console.log('⏱️  Estimated time: 15-30 minutes\n');
  console.log('⚠️  Important: Make sure dev server is running (pnpm dev)\n');

  try {
    const result = await generateArticleIllustrations(
      albanianToEnglishSections,
      {
        captureHowTo: true, // 自动截图 How-To
        baseUrl: 'http://localhost:3001',
      }
    );

    if (result.success) {
      console.log('\n✅ Generation completed successfully!');

      const totalGenerated =
        result.successfulImages +
        (result.howToScreenshot?.status === 'success' ? 1 : 0);
      const totalExpected =
        result.totalImages + (result.howToScreenshot ? 1 : 0);

      console.log(
        `📊 Results: ${totalGenerated}/${totalExpected} images generated`
      );
      console.log(
        `   - Content images: ${result.successfulImages}/${result.totalImages}`
      );

      if (result.howToScreenshot) {
        const status =
          result.howToScreenshot.status === 'success' ? '✅' : '❌';
        console.log(
          `   - How-To screenshot: ${status} ${result.howToScreenshot.status}`
        );
      }

      console.log(
        `⏱️  Total time: ${(result.totalTimeMs / 1000 / 60).toFixed(2)} minutes`
      );

      if (
        result.failedImages > 0 ||
        result.howToScreenshot?.status === 'failed'
      ) {
        console.log(`\n⚠️  Warning: Some images failed to generate`);
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
