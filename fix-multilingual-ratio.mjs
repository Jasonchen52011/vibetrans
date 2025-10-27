#!/usr/bin/env node
import { readFileSync, renameSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = join(__dirname, 'public/images/docs');
const inputPath = join(docsDir, 'multilingual-gen-z-translator.webp');
const tempPath = join(docsDir, 'multilingual-gen-z-translator-temp.webp');

async function convert() {
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`📸 Original: ${metadata.width}x${metadata.height}`);
    const originalSize = readFileSync(inputPath).length;
    console.log(`   Size: ${(originalSize / 1024).toFixed(0)}KB`);

    // 4:3 ratio, width 1200
    const targetWidth = 1200;
    const targetHeight = 900; // 4:3 ratio

    // Create new file
    await sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75, effort: 6 })
      .toFile(tempPath);

    const newMetadata = await sharp(tempPath).metadata();
    const newSize = readFileSync(tempPath).length;
    console.log(`✅ Converted: ${newMetadata.width}x${newMetadata.height}`);
    console.log(`   Size: ${(newSize / 1024).toFixed(0)}KB`);

    // Replace original
    unlinkSync(inputPath);
    renameSync(tempPath, inputPath);

    console.log('✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

convert();
