import { generateIllustration } from '../src/lib/article-illustrator/image-generator';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'docs');

async function downloadAndConvertImage(
  url: string,
  outputPath: string
): Promise<void> {
  console.log(`📥 Downloading image from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert to WebP with optimization
  await sharp(buffer).webp({ quality: 85, effort: 6 }).toFile(outputPath);

  console.log(`✅ Image saved and converted to WebP: ${outputPath}`);
}

async function regenerateHowToImage() {
  console.log('\n🎨 Regenerating IVR Translator How To image...\n');

  const prompt = `Geometric Flat Style cartoon illustration for "How to Use IVR Translator - 4-Step Workflow". Sky blue (#87CEEB) primary with soft gradient. Visual workflow showing 4 sequential steps in geometric panels: STEP 1 (top left): Upload Audio icon - Audio file (geometric waveform document) being uploaded to cloud (rectangular sound wave with upward arrow into geometric cloud in green). Supported formats shown (geometric file type badges: MP3, WAV, etc.). STEP 2 (top right): Language selection - Globe with multiple language flags as geometric banners (Spanish, French, Chinese, English flags in simplified forms) around a central language selector dial (geometric circular selector). STEP 3 (bottom left): Start Conversion - Play button (large geometric triangle in green) with processing animation (geometric loading circle with voice-to-text transformation arrows in cyan). AI processor visualization (geometric brain with translation circuits). STEP 4 (bottom right): Download Results - Document with multiple language text (geometric paper with text lines in different scripts) being downloaded (geometric download arrow in blue). Integration icons showing IVR system connection (geometric system diagram). Central connecting element: Circular workflow arrows (geometric curved arrows in purple) linking all steps. Each panel has number badge (geometric circle with bold number 1-4 in white text on blue background). Background elements: audio upload cloud shapes, language diversity symbols (geometric translation icons), conversion progress indicators (geometric progress bars), download/integration symbols (geometric API connection lines). Color palette: sky blue base, upload green (#00CC66), language diversity rainbow (multiple flag colors), conversion cyan (#00CED1), download success blue (#0066FF). Clear, instructional, user-friendly, step-by-step workflow atmosphere. 4:3 aspect ratio, 800x600px.`;

  try {
    console.log('🎨 Generating How To image with Article Illustrator...\n');

    const result = await generateIllustration({
      prompt: prompt,
      filename: 'ivr-translator-how-to.webp',
    });

    console.log(`\n🔗 Generated URL: ${result.url}`);
    console.log(`🤖 Model used: ${result.modelUsed}`);

    // Download and convert to WebP
    const outputPath = path.join(OUTPUT_DIR, 'ivr-translator-how-to.webp');
    await downloadAndConvertImage(result.url, outputPath);

    const fs = await import('fs/promises');
    const stats = await fs.stat(outputPath);
    const fileSize = stats.size;

    console.log('\n=================================');
    console.log('✅ How To image regenerated successfully!');
    console.log(`📁 File path: ${outputPath}`);
    console.log(`📊 File size: ${(fileSize / 1024).toFixed(2)}KB`);
    console.log('=================================\n');
  } catch (error: any) {
    console.error('\n❌ Failed to regenerate How To image:', error.message);
    throw error;
  }
}

regenerateHowToImage().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
