#!/usr/bin/env node

/**
 * Compress newly generated images to under 95KB
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'public', 'images', 'docs');
const TARGET_SIZE = 95 * 1024; // 95KB in bytes

const images = [
  'inspiring-educational-tone-mastery.webp',
  'modern-communication-app-integration.webp',
];

async function compressImage(filename: string): Promise<void> {
  const imagePath = path.join(DOCS_DIR, filename);

  console.log(`\n🔧 Compressing: ${filename}`);

  const originalSize = fs.statSync(imagePath).size;
  console.log(`📊 Original size: ${(originalSize / 1024).toFixed(2)} KB`);

  if (originalSize <= TARGET_SIZE) {
    console.log(`✅ Already under 95KB, skipping...`);
    return;
  }

  let quality = 75;
  let newSize = originalSize;
  const tmpPath = imagePath + '.tmp';

  // Binary search for optimal quality
  while (newSize > TARGET_SIZE && quality > 40) {
    console.log(`🔄 Trying quality: ${quality}`);

    await sharp(imagePath)
      .webp({ quality, effort: 6 })
      .toFile(tmpPath);

    newSize = fs.statSync(tmpPath).size;

    if (newSize > TARGET_SIZE) {
      quality -= 5;
    }
  }

  // Replace original with compressed version
  fs.renameSync(tmpPath, imagePath);

  const savedKB = (originalSize - newSize) / 1024;
  console.log(`✅ Compressed size: ${(newSize / 1024).toFixed(2)} KB (quality: ${quality})`);
  console.log(`📉 Saved: ${savedKB.toFixed(2)} KB (${((savedKB / (originalSize / 1024)) * 100).toFixed(1)}%)`);
}

async function compressAllImages() {
  console.log('🎨 Starting image compression...\n');

  for (const filename of images) {
    try {
      await compressImage(filename);
    } catch (error: any) {
      console.error(`❌ Failed to compress ${filename}:`, error.message);
    }
  }

  console.log('\n🎉 All images processed!');
}

compressAllImages().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
