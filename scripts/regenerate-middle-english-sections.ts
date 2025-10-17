#!/usr/bin/env node

/**
 * Regenerate Middle English sections with AUTO PAGE UPDATE
 *
 * Complete automation:
 * ✅ Gemini analyzes content
 * ✅ Generates images with Volcano 4.0
 * ✅ Compresses to < 90KB
 * ✅ Auto-updates page.tsx
 */

import path from 'path';
import { runEnhancedWorkflow } from '../src/lib/article-illustrator/enhanced-workflow';

const config = {
  toolName: 'middle-english-translator',
  pagePath: path.join(
    process.cwd(),
    'src/app/[locale]/(marketing)/(pages)/middle-english-translator/page.tsx'
  ),
  sections: {
    toolName: 'middle-english-translator',
    whatIs: {
      title: 'What is Middle English Translator',
      content:
        'A Middle English translator is an AI-powered tool that converts modern English text into Middle English (1150-1500 AD), the language of Geoffrey Chaucer and the Canterbury Tales. It understands the unique spelling variations, special characters like þ (thorn) and ȝ (yogh), and grammatical structures of medieval English, making historical texts accessible and helping students and researchers explore this fascinating period of English language development.',
    },
    funFacts: [
      {
        title: "Chaucer's Spelling Chaos",
        content:
          'In Middle English, the word "through" could be spelled ten different ways (thurgh, thorough, throw, throu, thrugh, etc.) showing the flexible and wildly inconsistent spelling system of the time. Geoffrey Chaucer himself used multiple spellings for the same word within a single manuscript!',
      },
      {
        title: 'The Letter ȝ (Yogh)',
        content:
          'The letter ȝ (yogh) in Middle English is the ancestor of modern "y" - as seen in Scottish names like Menzies pronounced /ˈmɪŋɪs/. This unique character represented sounds that no longer exist in modern English, making Middle English texts look wonderfully alien to contemporary readers.',
      },
    ],
    userInterests: [
      {
        title: 'Reverse Translation',
        content:
          'Convert Middle English back to Modern English, showing language evolution and historical linguistics. Perfect for analyzing Canterbury Tales excerpts or understanding how English has transformed over 500 years.',
      },
      {
        title: 'Dialect Variations',
        content:
          'Explore Northern, Kentish, and other Middle English dialects from different regions of medieval England. Each region had its own unique vocabulary, pronunciation, and grammar rules.',
      },
      {
        title: 'Realistic Voice Output',
        content:
          'Authentic Middle English pronunciation with bard and monk voice tones for immersive historical experience. Hear how Chaucer would have read the Canterbury Tales aloud in 14th century London.',
      },
      {
        title: 'Grammar Insights',
        content:
          'Middle English grammar and spelling rules, linguistic nuances for students and researchers. Learn about case systems, verb conjugations, and the evolution from Old English to Modern English.',
      },
    ],
  },
};

runEnhancedWorkflow(config);
