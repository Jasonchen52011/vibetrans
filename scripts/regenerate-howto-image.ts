#!/usr/bin/env node

import { config } from 'dotenv';
import { generateImage as generateVolcanoImage } from '../src/lib/volcano-image';
import sharp from 'sharp';

config({ path: '.env.local' });

async function regenerateHowTo() {
  const prompt = 'A clean tutorial illustration showing step-by-step Cantonese translation process. Visualize four-step workflow: 1) input field with Cantonese text sample (你好) and upload icons for files, 2) language selection dropdown showing "Cantonese ↔ English" with flag icons, 3) prominent translate button with AI processing animation and sparkles, 4) results panel showing translated output with copy/download/audio playback options. Include visual elements: numbered step circles (1-4) in gold, Cantonese character input example, bilingual flag selector (Hong Kong flag and UK/US flags), file upload icon supporting .txt/.docx, voice input microphone button, translation progress indicator with loading animation, formatted results display with traditional and simplified character options, action buttons (copy clipboard, download file, speaker audio). Color scheme: tutorial instructional blues, action button success greens, interface clean whites and light grays, accent Hong Kong gold-red. Modern UI flat design, 4:3 aspect ratio.';

  console.log('🌋 Regenerating how-to image with Volcano 4.0...');

  try {
    const result = await generateVolcanoImage({
      prompt,
      mode: 'text',
      size: '2K',
      watermark: false
    });

    const url = result.data[0].url;
    console.log('✅ Image URL:', url);

    console.log('📥 Downloading and converting...');
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer).webp({ quality: 85, effort: 6 }).toFile('public/images/docs/cantonese-translator-how-to.webp');

    console.log('✅ Saved to public/images/docs/cantonese-translator-how-to.webp');
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

regenerateHowTo();
