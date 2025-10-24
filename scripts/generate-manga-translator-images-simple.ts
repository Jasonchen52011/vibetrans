#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';

// Create placeholder images for manga translator
const images = [
  'what-is-manga-translator.webp',
  'manga-translator-how-to.webp',
  'manga-translator-fact-1.webp',
  'manga-translator-fact-2.webp',
  'manga-translator-interest-1.webp',
  'manga-translator-interest-2.webp',
  'manga-translator-interest-3.webp',
  'manga-translator-interest-4.webp',
];

const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'docs');

async function createPlaceholderImages() {
  try {
    // Ensure directory exists
    await fs.mkdir(publicImagesDir, { recursive: true });

    console.log('Creating placeholder images for manga translator...');

    for (const imageName of images) {
      const imagePath = path.join(publicImagesDir, imageName);

      // Create a simple 1x1 pixel webp image as placeholder
      // This is a minimal WebP file header for a 1x1 white pixel
      const webpPlaceholder = Buffer.from([
        0x52,
        0x49,
        0x46,
        0x46, // RIFF
        0x1a,
        0x00,
        0x00,
        0x00, // File size
        0x57,
        0x45,
        0x42,
        0x50, // WEBP
        0x56,
        0x50,
        0x38,
        0x20, // VP8
        0x0c,
        0x00,
        0x00,
        0x00, // Chunk size
        0x30,
        0x01,
        0x00,
        0x9d,
        0x01,
        0x2a, // VP8 data for 1x1 white pixel
        0x01,
        0x00,
        0x01,
        0x00,
        0x02,
        0x00,
        0x02,
        0x00,
      ]);

      await fs.writeFile(imagePath, webpPlaceholder);
      console.log(`✓ Created: ${imageName}`);
    }

    console.log('\n✅ All placeholder images created successfully!');
    console.log('Note: These are 1x1 pixel placeholder images.');
    console.log(
      'For production, replace with actual manga translation images.'
    );
  } catch (error) {
    console.error('❌ Error creating images:', error);
    process.exit(1);
  }
}

createPlaceholderImages();
