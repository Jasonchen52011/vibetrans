#!/usr/bin/env node
/**
 * Convert and optimize screenshot images from JPEG to WebP format
 * Target size: ~90KB per image with good quality
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readdir, stat } from 'fs/promises';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = join(__dirname, 'public/images/docs');

// Mapping of original JPEG files to new WebP filenames
const imageMapping = {
  'Translation for Multilingual Businesses.jpeg': 'translation-business.webp',
  'Translation for Language Learners.jpeg': 'translation-learning.webp',
  'Real-Time Translation for Travelers.jpeg': 'translation-travelers.webp',
  'Slangand Fun Language Translations.jpeg': 'translation-slang.webp',
  'Over 7,000 Languages Worldwide.jpeg': 'funfact-languages.webp',
  'AI with Emotional Context.jpeg': 'funfact-ai-emotional.webp',
};

async function convertImage(sourcePath, targetPath) {
  try {
    // Get original image metadata
    const metadata = await sharp(sourcePath).metadata();
    console.log(`\nProcessing: ${sourcePath}`);
    console.log(`Original size: ${metadata.width}x${metadata.height}`);

    // Try different quality settings to achieve ~90KB
    let quality = 75;
    let outputInfo;

    do {
      outputInfo = await sharp(sourcePath)
        .resize(1200, null, {
          // Resize to max width 1200px, maintain aspect ratio
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toFile(targetPath);

      const fileSizeKB = (outputInfo.size / 1024).toFixed(2);
      console.log(`Quality ${quality}: ${fileSizeKB}KB`);

      // If file is too large, reduce quality
      if (outputInfo.size > 100 * 1024 && quality > 60) {
        quality -= 5;
      } else {
        break;
      }
    } while (quality >= 60);

    const finalSizeKB = (outputInfo.size / 1024).toFixed(2);
    console.log(`✅ Saved: ${targetPath}`);
    console.log(`   Final size: ${finalSizeKB}KB`);
    console.log(`   Dimensions: ${outputInfo.width}x${outputInfo.height}`);

    return outputInfo;
  } catch (error) {
    console.error(`❌ Error converting ${sourcePath}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting image conversion...\n');
  console.log('Target: ~90KB per image in WebP format\n');

  let totalOriginalSize = 0;
  let totalConvertedSize = 0;
  let convertedCount = 0;

  for (const [sourceFile, targetFile] of Object.entries(imageMapping)) {
    const sourcePath = join(docsDir, sourceFile);
    const targetPath = join(docsDir, targetFile);

    try {
      // Get original file size
      const stats = await stat(sourcePath);
      totalOriginalSize += stats.size;

      // Convert image
      const outputInfo = await convertImage(sourcePath, targetPath);
      totalConvertedSize += outputInfo.size;
      convertedCount++;
    } catch (error) {
      console.error(`Failed to process ${sourceFile}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Conversion Summary');
  console.log('='.repeat(50));
  console.log(
    `Files converted: ${convertedCount}/${Object.keys(imageMapping).length}`
  );
  console.log(
    `Original total size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`
  );
  console.log(
    `Converted total size: ${(totalConvertedSize / 1024).toFixed(2)}KB`
  );
  console.log(
    `Space saved: ${((totalOriginalSize - totalConvertedSize) / 1024 / 1024).toFixed(2)}MB`
  );
  console.log(
    `Compression ratio: ${((1 - totalConvertedSize / totalOriginalSize) * 100).toFixed(1)}%`
  );
  console.log('='.repeat(50));
  console.log('\n✨ Done! All images have been optimized.\n');
}

main().catch(console.error);
