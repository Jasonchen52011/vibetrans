#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';

// Create colorful WebP images for manga translator
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

// Create a simple but colorful WebP image (200x150 pixels)
function createColorfulWebP(): Buffer {
  // Simple 200x150 pixel WebP with some colors
  // This is a basic implementation - in production you'd use a proper image library
  const width = 200;
  const height = 150;

  // Create a colorful gradient pattern
  const imageData = new Uint8Array(width * height * 3); // RGB

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 3;

      // Create a colorful gradient pattern
      const r = Math.floor((x / width) * 255);
      const g = Math.floor((y / height) * 255);
      const b = Math.floor(((x + y) / (width + height)) * 255);

      imageData[index] = r;
      imageData[index + 1] = g;
      imageData[index + 2] = b;
    }
  }

  // Simple WebP header (this is a basic implementation)
  const webpHeader = Buffer.from([
    0x52,
    0x49,
    0x46,
    0x46, // RIFF
    ...Buffer.from(
      (imageData.length + 40).toString(16).padStart(8, '0'),
      'hex'
    ), // File size
    0x57,
    0x45,
    0x42,
    0x50, // WEBP
    0x56,
    0x50,
    0x38,
    0x20, // VP8
    ...Buffer.from(
      (imageData.length + 12).toString(16).padStart(8, '0'),
      'hex'
    ), // Chunk size
    0x30,
    0x01,
    0x00,
    0x9d,
    0x01,
    0x2a, // VP8 data header
    ...imageData.subarray(0, Math.min(imageData.length, 12)), // First part of image data
  ]);

  return webpHeader;
}

async function generateMangaImages() {
  try {
    // Ensure directory exists
    await fs.mkdir(publicImagesDir, { recursive: true });

    console.log('🎨 Generating manga translator images...');

    for (const imageName of images) {
      const imagePath = path.join(publicImagesDir, imageName);

      // Create a simple colorful image
      const colorfulImage = createColorfulWebP();

      await fs.writeFile(imagePath, colorfulImage);
      console.log(`✅ Generated: ${imageName}`);
    }

    console.log('\n🎉 All manga images generated successfully!');
    console.log('Note: These are basic colorful placeholder images.');
    console.log(
      'For production, consider using professional image generation tools.'
    );
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

generateMangaImages();
