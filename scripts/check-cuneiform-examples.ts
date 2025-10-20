#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface CuneiformExample {
  alt: string;
  name: string;
}

interface CuneiformContent {
  CuneiformTranslatorPage: {
    examples: {
      items: CuneiformExample[];
    };
  };
}

function countWords(text: string): number {
  // Remove cuneiform characters and count only English words
  const englishPart = text.split('→')[1]?.trim() || '';
  return englishPart.split(/\s+/).filter((word) => word.length > 0).length;
}

function main() {
  try {
    const filePath = path.join(
      process.cwd(),
      'messages/pages/cuneiform-translator/en.json'
    );
    const content: CuneiformContent = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );
    const cuneiformExamples = content.CuneiformTranslatorPage.examples.items;

    console.log('=== Cuneiform Translation Examples Analysis ===\n');

    let shortExamplesCount = 0;
    let totalWords = 0;

    cuneiformExamples.forEach((example, index) => {
      const englishText = example.alt.split('→')[1]?.trim() || '';
      const wordCount = countWords(example.alt);
      totalWords += wordCount;

      console.log(`${index + 1}. "${example.name}"`);
      console.log(`   Full text: ${example.alt}`);
      console.log(`   English part: "${englishText}"`);
      console.log(`   Word count: ${wordCount}`);

      if (wordCount < 10) {
        console.log(`   ⚠️  SHORT: Less than 10 words!`);
        shortExamplesCount++;
      }
      console.log('');
    });

    console.log('=== SUMMARY ===');
    console.log(`Total examples: ${cuneiformExamples.length}`);
    console.log(`Short examples (< 10 words): ${shortExamplesCount}`);
    console.log(
      `Average word count: ${(totalWords / cuneiformExamples.length).toFixed(1)}`
    );
  } catch (error) {
    console.error('Error reading cuneiform translation file:', error);
  }
}

main();
