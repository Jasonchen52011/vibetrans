#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types.js';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow.js';

const sections: ArticleSections = {
  toolName: 'telugu-to-english-translator',
  whatIs: {
    title: 'What is Telugu to English Translator?',
    content:
      'Our Telugu to English Translator is a powerful AI-powered tool that helps you translate Telugu text to English quickly and accurately. Whether you need to translate documents, conversations, or any content, our tool provides reliable translations that preserve meaning and context.',
    style: 'professional, educational, cultural',
  },
  examples: [
    {
      title: 'Daily Conversation',
      content:
        'Translate everyday Telugu conversations to English naturally and accurately.',
      style: 'casual, friendly, conversational',
    },
    {
      title: 'Business Communication',
      content:
        'Professional translation of business emails, proposals, and corporate documents.',
      style: 'professional, business, formal',
    },
    {
      title: 'Educational Content',
      content:
        'Translate academic papers, research materials, and educational resources.',
      style: 'educational, academic, scholarly',
    },
    {
      title: 'Social Media',
      content:
        'Convert Telugu social media posts to English for global communication.',
      style: 'social, modern, digital',
    },
    {
      title: 'Legal Documents',
      content:
        'Accurate translation of legal papers and official documentation.',
      style: 'legal, formal, authoritative',
    },
    {
      title: 'Medical Text',
      content:
        'Specialized translation for medical reports and healthcare documents.',
      style: 'medical, professional, technical',
    },
  ],
  funFacts: [
    {
      title: 'Ancient Language Heritage',
      content:
        "Telugu is one of India's classical languages with a rich literary tradition spanning over 1,000 years, making translations culturally significant.",
      style: 'cultural, historical, elegant',
    },
    {
      title: 'Global Reach',
      content:
        'With over 82 million Telugu speakers worldwide and English being the global language of business, translation bridges communication gaps across continents.',
      style: 'global, business, modern',
    },
  ],
  userInterests: [
    {
      title: 'Cultural Context Preservation',
      content:
        'Our AI understands cultural nuances in Telugu literature, idioms, and expressions, ensuring translations maintain the original cultural significance and emotional impact.',
      style: 'cultural, traditional, respectful',
    },
    {
      title: 'Technical & Professional Translation',
      content:
        'From technical documents to business communications, our translator handles specialized terminology in fields like medicine, law, engineering, and information technology.',
      style: 'professional, technical, modern',
    },
    {
      title: 'Educational Applications',
      content:
        'Perfect for students learning English, researchers accessing global content, or educators creating bilingual materials for Telugu-speaking students.',
      style: 'educational, academic, inspiring',
    },
    {
      title: 'Business Integration',
      content:
        'Seamlessly translate business proposals, emails, marketing materials, and customer communications to expand your reach from Telugu markets to English-speaking regions.',
      style: 'business, corporate, growth',
    },
  ],
};

/**
 * Update JSON files with generated image paths
 */
async function updateJsonImagePaths(result: any) {
  console.log('\n📝 Updating JSON files with image paths...');

  const locales = ['en', 'zh'];

  for (const locale of locales) {
    const jsonPath = path.join(
      process.cwd(),
      'messages',
      'pages',
      'telugu-to-english-translator',
      `${locale}.json`
    );

    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(jsonContent);
      const pageName = 'TeluguToEnglishTranslatorPage';

      if (!jsonData[pageName]) {
        console.error(`Page namespace not found in ${locale}:`, pageName);
        continue;
      }

      // Update whatIs image
      const whatIsImage = result.generatedImages?.find(
        (img: any) => img.section === 'whatIs'
      );
      if (whatIsImage && jsonData[pageName].whatIs) {
        jsonData[pageName].whatIs.image = {
          src: `/images/docs/${whatIsImage.filename}.webp`,
          alt: `What is Telugu to English Translator - Visual explanation`,
        };
      }

      // Update examples images
      if (jsonData[pageName].examples?.items) {
        result.generatedImages?.forEach((img: any, index: number) => {
          if (
            img.section.startsWith('examples') &&
            jsonData[pageName].examples.items[index]
          ) {
            jsonData[pageName].examples.items[index].image = {
              src: `/images/docs/${img.filename}.webp`,
              alt: jsonData[pageName].examples.items[index].alt,
            };
          }
        });
      }

      // Update funFacts images
      if (jsonData[pageName].funFacts?.items) {
        result.generatedImages?.forEach((img: any, index: number) => {
          if (
            img.section.startsWith('funFacts') &&
            jsonData[pageName].funFacts.items[index]
          ) {
            jsonData[pageName].funFacts.items[index].image = {
              src: `/images/docs/${img.filename}.webp`,
              alt: jsonData[pageName].funFacts.items[index].title,
            };
          }
        });
      }

      // Update userInterest images
      if (jsonData[pageName].userInterest?.items) {
        result.generatedImages?.forEach((img: any, index: number) => {
          if (
            img.section.startsWith('userInterests') &&
            jsonData[pageName].userInterest.items[index]
          ) {
            jsonData[pageName].userInterest.items[index].image = {
              src: `/images/docs/${img.filename}.webp`,
              alt: jsonData[pageName].userInterest.items[index].title,
            };
          }
        });
      }

      // Save updated JSON
      await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
      console.log(`✅ ${locale} JSON file updated successfully`);
    } catch (error) {
      console.error(`❌ Failed to update ${locale} JSON file:`, error);
    }
  }
}

async function main() {
  try {
    console.log(
      '🚀 Starting Telugu to English Translator image generation...\n'
    );

    const result = await generateArticleIllustrations(sections, {
      captureHowTo: true,
      captureExamples: true,
      style: 'professional, educational, cultural',
      keywords: [
        'professional',
        'educational',
        'cultural',
        'telugu',
        'english',
        'translation',
        'language',
      ],
    });

    const resultPath = path.join(
      process.cwd(),
      '.tool-generation',
      'telugu-to-english-translator',
      'image-generation-result.json'
    );

    // Ensure directory exists
    await fs.mkdir(path.dirname(resultPath), { recursive: true });
    await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Image generation successful');

      // Auto-update JSON files
      await updateJsonImagePaths(result);

      console.log(
        '🎉 All work completed! Images generated and updated in page JSON files.'
      );
      process.exit(0);
    } else {
      console.error('❌ Image generation failed');
      console.error('Error details:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error in image generation process:', error);
    process.exit(1);
  }
}

main();
