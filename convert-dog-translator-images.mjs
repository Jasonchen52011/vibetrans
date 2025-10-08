import { statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define image conversions with proper naming
const images = [
  {
    input: 'What is Dog Translator?.jpeg',
    output: 'what-is-dog-translator.webp',
  },
  {
    input: 'AI Emotion Intelligence.jpeg',
    output: 'ai-emotion-intelligence.webp',
  },
  {
    input: 'Authentic Sound Library in the Dog Translator.jpeg',
    output: 'authentic-sound-library.webp',
  },
  {
    input: 'Family Entertainment.jpeg',
    output: 'family-entertainment.webp',
  },
  {
    input: 'Pet Training Made Fun.jpeg',
    output: 'pet-training-made-fun.webp',
  },
];

async function convertImage(inputFile, outputFile) {
  const inputPath = join(__dirname, 'public/images/docs', inputFile);
  const outputPath = join(__dirname, 'public/images/docs', outputFile);

  try {
    console.log(`\nConverting: ${inputFile}`);
    console.log('Target size: ~90KB');

    // Try different quality settings to get under 90KB
    let quality = 85;
    let output;
    let fileSize;

    do {
      output = await sharp(inputPath)
        .webp({ quality, effort: 6 })
        .toFile(outputPath);

      fileSize = statSync(outputPath).size;
      const fileSizeKB = (fileSize / 1024).toFixed(2);

      console.log(`  Quality ${quality}: ${fileSizeKB} KB`);

      if (fileSize > 90 * 1024 && quality > 50) {
        quality -= 5;
      } else {
        break;
      }
    } while (fileSize > 90 * 1024 && quality > 50);

    const finalSizeKB = (fileSize / 1024).toFixed(2);
    console.log(
      `✅ ${outputFile}: ${finalSizeKB} KB (${output.width}x${output.height})`
    );

    return { success: true, file: outputFile, size: finalSizeKB };
  } catch (error) {
    console.error(`❌ Error converting ${inputFile}:`, error.message);
    return { success: false, file: inputFile, error: error.message };
  }
}

async function convertAll() {
  console.log('Starting batch conversion of dog-translator images...');
  console.log('='.repeat(60));

  const results = [];

  for (const image of images) {
    const result = await convertImage(image.input, image.output);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Conversion Summary:');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(
    `\n✅ Successfully converted: ${successful.length}/${results.length}`
  );
  successful.forEach((r) => console.log(`   - ${r.file}: ${r.size} KB`));

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach((r) => console.log(`   - ${r.file}: ${r.error}`));
  }
}

convertAll();
