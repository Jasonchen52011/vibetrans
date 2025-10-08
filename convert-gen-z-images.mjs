#!/usr/bin/env node
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = join(__dirname, 'public/images/docs');

// Gen Z Translator images to convert
const imagesToConvert = [
  'Fax, No Printer.jpeg',
  'Multilingual Gen Z Translator.jpeg',
  'Private Slang Dictionaries.jpeg',
  'Real-time Slang Updates.jpeg',
  'The Need for Gen Z Slang Translation.jpeg',
  'Why Content Creators Love VibeTrans.jpeg',
  'gen-z-translator-how.png'
];

// Target size: ~90KB
const targetQuality = 75;
const targetWidth = 1200; // Reasonable width for web

async function convertImage(filename) {
  const inputPath = join(docsDir, filename);
  const outputFilename = filename
    .replace('.jpeg', '.webp')
    .replace('.jpg', '.webp')
    .replace('.png', '.webp')
    .replace(/\s+/g, '-')
    .toLowerCase();
  const outputPath = join(docsDir, outputFilename);

  if (!existsSync(inputPath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`\n📸 Converting: ${filename}`);
    console.log(`   Original size: ${(metadata.size / 1024).toFixed(0)}KB`);
    console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

    // Convert to WebP with target quality
    await sharp(inputPath)
      .resize(targetWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: targetQuality, effort: 6 })
      .toFile(outputPath);

    const stats = await sharp(outputPath).metadata();
    const sizeKB = (stats.size / 1024).toFixed(0);

    console.log(`   ✅ Converted to: ${outputFilename}`);
    console.log(`   New size: ${sizeKB}KB`);
    console.log(`   New dimensions: ${stats.width}x${stats.height}`);

    // If still too large, reduce quality
    if (stats.size > 100 * 1024) {
      console.log(`   ⚠️  Still too large, reducing quality...`);
      await sharp(inputPath)
        .resize(targetWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 65, effort: 6 })
        .toFile(outputPath);

      const newStats = await sharp(outputPath).metadata();
      const newSizeKB = (newStats.size / 1024).toFixed(0);
      console.log(`   ✅ Reduced to: ${newSizeKB}KB`);
    }
  } catch (error) {
    console.error(`❌ Error converting ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting Gen Z Translator image conversion...\n');

  for (const filename of imagesToConvert) {
    await convertImage(filename);
  }

  console.log('\n✨ Conversion complete!');
}

main();
