#!/usr/bin/env node
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = join(__dirname, 'public/images/docs');
const inputPath = join(docsDir, 'What is Gen Z Translator?.jpeg');
const outputPath = join(docsDir, 'what-is-gen-z-translator.webp');

async function convert() {
  if (!existsSync(inputPath)) {
    console.log(`❌ File not found: ${inputPath}`);
    return;
  }

  try {
    const metadata = await sharp(inputPath).metadata();
    const originalSize = readFileSync(inputPath).length;
    console.log(`📸 Original: ${metadata.width}x${metadata.height}`);
    console.log(`   Size: ${(originalSize / 1024).toFixed(0)}KB`);

    // Target: 1200 width, maintain aspect ratio, ~90KB
    const targetWidth = 1200;

    await sharp(inputPath)
      .resize(targetWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 75, effort: 6 })
      .toFile(outputPath);

    const newMetadata = await sharp(outputPath).metadata();
    const newSize = readFileSync(outputPath).length;
    console.log(`✅ Converted: ${newMetadata.width}x${newMetadata.height}`);
    console.log(`   Size: ${(newSize / 1024).toFixed(0)}KB`);

    // If too large, reduce quality
    if (newSize > 100 * 1024) {
      console.log(`   ⚠️  Still too large, reducing quality...`);
      await sharp(inputPath)
        .resize(targetWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 65, effort: 6 })
        .toFile(outputPath);

      const finalSize = readFileSync(outputPath).length;
      console.log(`   ✅ Reduced to: ${(finalSize / 1024).toFixed(0)}KB`);
    }

    console.log('✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

convert();
