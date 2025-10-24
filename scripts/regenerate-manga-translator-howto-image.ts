#!/usr/bin/env node

import { config } from 'dotenv';
import sharp from 'sharp';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';

config({ path: '.env.local' });

async function regenerateMangaTranslatorHowTo() {
  const prompt =
    'A comprehensive tutorial illustration showing step-by-step manga translation process. Visualize four-step workflow: 1) Upload manga panel/image with drag-drop zone and file selection, 2) AI detects and highlights text bubbles with bounding boxes, 3) Select target language and choose translation style (literal/adapted), 4) Review and export translated manga with original artwork preserved. Include visual elements: numbered step circles (1-4) in manga-style blue, manga panel upload area with Japanese text example, text detection visualization with red boxes around speech bubbles, language selection dropdown with Japanese/English/Chinese flags, translation style toggle (Literal vs Natural), AI processing indicator with manga-style speed lines, split-view comparison showing original vs translated, export options (save as PDF, PNG, or CBZ). Color scheme: manga publication grays, speech bubble whites and yellows, action button blues, interface clean whites. Modern UI with manga-inspired design elements, 4:3 aspect ratio.';

  console.log(
    '🌋 Regenerating manga translator how-to image with Volcano 4.0...'
  );

  try {
    const result = await generateVolcanoImage({
      prompt,
      mode: 'text',
      size: '2K',
      watermark: false,
    });

    const url = result.data[0].url;
    console.log('✅ Image URL:', url);

    console.log('📥 Downloading and converting...');
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .webp({ quality: 85, effort: 6 })
      .toFile('public/images/docs/manga-translator-how-to.webp');

    console.log('✅ Saved to public/images/docs/manga-translator-how-to.webp');
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

regenerateMangaTranslatorHowTo();
