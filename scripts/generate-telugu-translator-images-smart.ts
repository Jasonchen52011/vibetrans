#!/usr/bin/env tsx

/**
 * Smart Telugu Translator Image Generator
 * Generates all required images for Telugu to English translator page
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public/images/docs');

// Define the specific images we need for Telugu translator
const TELUGU_IMAGES = [
  {
    filename: 'telugu-to-english-translator-what-is.webp',
    prompt:
      'What is Telugu to English Translator concept illustration showing translation interface with Telugu script on left and English on right, connected by arrows, professional blue gradient design',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-how-to.webp',
    prompt:
      'How to use Telugu to English translator step-by-step guide showing 4 simple steps: input Telugu text, click translate, get English result, copy/download, clean infographic style',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-fact-1.webp',
    prompt:
      'Ancient Telugu language heritage illustration showing historical Telugu manuscripts, calligraphy, and classical literature elements with traditional Indian art motifs',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-fact-2.webp',
    prompt:
      'Global reach of Telugu language world map showing Telugu speaking regions with communication bubbles connecting to English speaking areas, modern global network design',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-interest-1.webp',
    prompt:
      'Cultural context preservation in Telugu to English translation showing traditional Indian cultural elements, festivals, customs being preserved in translation',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-interest-2.webp',
    prompt:
      'Technical and professional translation from Telugu to English showing business documents, medical reports, technical papers being translated accurately',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-interest-3.webp',
    prompt:
      'Educational applications for Telugu to English translation showing students learning, classroom settings, bilingual educational materials',
    aspectRatio: '16:9',
  },
  {
    filename: 'telugu-to-english-translator-interest-4.webp',
    prompt:
      'Business integration for Telugu to English translation showing international business communication, emails, proposals crossing language barriers',
    aspectRatio: '16:9',
  },
];

async function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  console.log(`Downloading ${path.basename(filepath)}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Successfully downloaded ${path.basename(filepath)}`);
  } catch (error) {
    console.error(`❌ Failed to download ${path.basename(filepath)}:`, error);
    throw error;
  }
}

function generateImageUrl(prompt: string, aspectRatio = '16:9'): string {
  // Using a free image generation service
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true`;
}

async function generateTeluguImages() {
  console.log('🚀 Starting Telugu translator image generation...');
  console.log(`Found ${TELUGU_IMAGES.length} images to generate\n`);

  await ensureDirectoryExists(OUTPUT_DIR);

  let successCount = 0;
  let failCount = 0;

  for (const imageConfig of TELUGU_IMAGES) {
    const imagePath = path.join(OUTPUT_DIR, imageConfig.filename);

    // Skip if image already exists
    if (fs.existsSync(imagePath)) {
      console.log(`⏭️  Skipping ${imageConfig.filename} (already exists)`);
      successCount++;
      continue;
    }

    try {
      const imageUrl = generateImageUrl(
        imageConfig.prompt,
        imageConfig.aspectRatio
      );
      await downloadImage(imageUrl, imagePath);
      successCount++;
    } catch (error) {
      console.error(`Failed to generate ${imageConfig.filename}:`, error);
      failCount++;

      // Create a placeholder image if download fails
      try {
        console.log(`Creating placeholder for ${imageConfig.filename}...`);
        const placeholderUrl = generateImageUrl(
          `${imageConfig.filename.split('-').join(' ')} illustration`,
          imageConfig.aspectRatio
        );
        await downloadImage(placeholderUrl, imagePath);
        successCount++;
      } catch (placeholderError) {
        console.error(
          `Failed to create placeholder for ${imageConfig.filename}:`,
          placeholderError
        );
      }
    }
  }

  console.log('\n📊 Generation Summary:');
  console.log(`✅ Successful: ${successCount}/${TELUGU_IMAGES.length}`);
  console.log(`❌ Failed: ${failCount}/${TELUGU_IMAGES.length}`);

  if (successCount === TELUGU_IMAGES.length) {
    console.log('\n🎉 All Telugu translator images generated successfully!');
  } else if (successCount > 0) {
    console.log(
      '\n⚠️  Partial success - some images may need manual replacement'
    );
  } else {
    console.log('\n💥 All generations failed - check your network connection');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTeluguImages().catch(console.error);
}

export { generateTeluguImages };
