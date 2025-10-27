import { statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Images that need further compression
const images = [
  {
    input: 'authentic-sound-library.webp',
    output: 'authentic-sound-library.webp',
  },
  {
    input: 'pet-training-made-fun.webp',
    output: 'pet-training-made-fun.webp',
  },
];

async function compressImage(inputFile, outputFile) {
  const inputPath = join(__dirname, 'public/images/docs', inputFile);
  const outputPath = join(__dirname, 'public/images/docs', outputFile);

  try {
    console.log(`\nCompressing: ${inputFile}`);
    console.log('Target size: ~90KB');

    // Try resizing first, then adjust quality
    const metadata = await sharp(inputPath).metadata();
    const targetWidth = Math.floor(metadata.width * 0.85); // Reduce to 85% width

    let quality = 60;
    let output;
    let fileSize;

    do {
      output = await sharp(inputPath)
        .resize(targetWidth, null, { fit: 'inside' })
        .webp({ quality, effort: 6 })
        .toFile(outputPath + '.tmp');

      fileSize = statSync(outputPath + '.tmp').size;
      const fileSizeKB = (fileSize / 1024).toFixed(2);

      console.log(`  Quality ${quality}: ${fileSizeKB} KB`);

      if (fileSize > 90 * 1024 && quality > 35) {
        quality -= 3;
      } else {
        break;
      }
    } while (fileSize > 90 * 1024 && quality > 35);

    // Rename temp file to final output
    const fs = await import('fs/promises');
    await fs.rename(outputPath + '.tmp', outputPath);

    const finalSizeKB = (fileSize / 1024).toFixed(2);
    console.log(
      `✅ ${outputFile}: ${finalSizeKB} KB (${output.width}x${output.height})`
    );

    return { success: true, file: outputFile, size: finalSizeKB };
  } catch (error) {
    console.error(`❌ Error compressing ${inputFile}:`, error.message);
    return { success: false, file: inputFile, error: error.message };
  }
}

async function compressAll() {
  console.log('Starting compression of large images...');
  console.log('='.repeat(60));

  const results = [];

  for (const image of images) {
    const result = await compressImage(image.input, image.output);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Compression Summary:');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(
    `\n✅ Successfully compressed: ${successful.length}/${results.length}`
  );
  successful.forEach((r) => console.log(`   - ${r.file}: ${r.size} KB`));

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach((r) => console.log(`   - ${r.file}: ${r.error}`));
  }
}

compressAll();
