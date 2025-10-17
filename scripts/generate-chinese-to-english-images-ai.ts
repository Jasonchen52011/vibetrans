/**
 * Generate all images for Chinese to English Translator using Article Illustrator AI workflow
 * Uses Gemini 2.0 Flash + Volcano Engine 4.0
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const chineseToEnglishSections: ArticleSections = {
  toolName: 'chinese-to-english-translator',

  // 1. What Is Section
  whatIs: {
    title: 'What is a Chinese to English Translator',
    content:
      'A Chinese to English translator is a tool designed to convert text from Chinese into English accurately. VibeTrans excels in understanding idioms, professional terms, and context, making it ideal for diverse applications like business, travel, and academic work.',
  },

  // 2. Fun Facts (2 sections) - 更新为最新内容
  funFacts: [
    {
      title: '翻译中的幽默误译',
      content:
        "Ever tried translating '加油' and ended up with 'refuel'? That's just classic! I think these funny translation fails are what make language learning with VibeTrans a whimsical adventure, especially when machine translators try their best with idioms.",
    },
    {
      title: '神奇的OCR翻译',
      content:
        "Did you know Google's OCR once turned the traditional Chinese character for 'person' into 'eight'? It's these quirks that make translation tools like VibeTrans fascinating, blending tech with human-like understanding to avoid such blunders.",
    },
  ],

  // 3. User Interests (4 sections) - 更新为最新内容
  userInterests: [
    {
      title: 'Tackling Idioms and Slang',
      content:
        "Ever tried translating '加油' and got 'refuel'? Yeah, that happens! VibeTrans makes it easy by smartly identifying idioms and slang. You get a heads-up with a simple explanation or a suggested translation. It's like having a translation buddy who knows all the cool lingo. Trust me, you'll laugh less at translation fails and get more accurate results.",
    },
    {
      title: 'Professional Domain Modes',
      content:
        "Translating technical documents or legal contracts? VibeTrans has your back with its domain modes. You can switch between technical, legal, or literary settings. It's like having a toolbox for different tasks. You'll find it super handy when words need to be spot-on, and accuracy is key. I think it's a game-changer for anyone dealing with specialized texts.",
    },
    {
      title: 'Name Translations Made Easy',
      content:
        "Getting Chinese names into English can be tricky. VibeTrans gives you both phonetic and common translations. It's like having a mini-guide for names. You get the best of both worlds, making sure names sound natural in English. From personal experience, it's a life-saver when you want to avoid awkward name mishaps. You'll find it super useful.",
    },
    {
      title: 'OCR for Menus and Comics',
      content:
        "Staring at a Chinese menu or comic bubble and wondering what it says? VibeTrans's OCR feature is here to help. Drag and drop your image, and voilà, instant translation magic! It's perfect for travelers or comic enthusiasts. I love how it handles vertical text and speech bubbles, making life so much easier. You'll never miss a dish or joke again!",
    },
  ],
};

async function main() {
  console.log(
    '\n🚀 Starting Chinese to English Translator Image Generation...\n'
  );
  console.log('📦 Using AI Workflow: Gemini 2.0 Flash + Volcano Engine 4.0\n');

  try {
    const result = await generateArticleIllustrations(
      chineseToEnglishSections,
      {
        captureHowTo: false, // We'll capture How-To screenshot separately
      }
    );

    console.log('\n' + '='.repeat(80));
    console.log('✅ IMAGE GENERATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📊 Generated ${result.images.length} images:\n`);

    result.images.forEach((img, index) => {
      console.log(`${index + 1}. ${img.filename}`);
      console.log(`   Section: ${img.section}`);
      console.log(`   Size: ${img.size}KB\n`);
    });

    console.log('🎉 All images generated successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

main().catch(console.error);
